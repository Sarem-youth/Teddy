<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Shared-hosting resilience: replace the framework filesystem with a
        // variant whose replace() never calls tempnam() — see class docblock.
        // Blade's compiler and other writers resolve 'files' from here.
        $this->app->singleton('files', fn () => new \App\Support\ResilientFilesystem);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Shared-hosting resilience: some cPanel/CloudLinux PHP setups cannot
        // create temp files next to the target file (open_basedir / CageFS
        // quirks), so tempnam() falls back to the system temp dir and raises
        // a warning that Laravel would escalate into a fatal ErrorException —
        // breaking Blade compilation on every request. The fallback is fully
        // functional, so swallow exactly that warning and nothing else.
        $previousHandler = set_error_handler(function ($level, $message, $file = '', $line = 0) use (&$previousHandler) {
            if (str_starts_with((string) $message, 'tempnam(): file created in the system')) {
                return true;
            }

            return $previousHandler ? $previousHandler($level, $message, $file, $line) : false;
        });

        // REQ-3.3.3 — point password reset links at the SPA route.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return rtrim(config('app.url'), '/')
                . '/reset-password?token=' . $token
                . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
        });
        User::observe(UserObserver::class);
    }
}
