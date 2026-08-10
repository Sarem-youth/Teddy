<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Keys that are safe to expose on the public storefront API.
     */
    public const PUBLIC_KEYS = [
        'store_name',
        'store_tagline',
        'banner_announcement',
        'store_email',
        'store_phone',
        'store_phone_alt',
        'store_address',
        'currency',
        'theme_accent',
        'tax_rate',
        'shipping_fee',
        'free_shipping_threshold',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'telebirr_number',
        'facebook_url',
        'telegram_url',
        'whatsapp_number',
        'about_text',
    ];

    public static function get(string $key, $default = null)
    {
        $settings = static::allCached();

        return $settings[$key] ?? $default;
    }

    public static function set(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget('app_settings');
    }

    public static function allCached(): array
    {
        return Cache::remember('app_settings', 300, function () {
            return static::query()->pluck('value', 'key')->toArray();
        });
    }

    public static function publicSettings(): array
    {
        return array_intersect_key(static::allCached(), array_flip(static::PUBLIC_KEYS));
    }
}
