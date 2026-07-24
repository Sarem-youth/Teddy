<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// NFR-4.4.3 — nightly automated database backup (runs via `schedule:run` cron).
Schedule::command('db:backup --keep=14')->dailyAt('02:00');
