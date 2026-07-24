<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();
        $this->seedSettings();

        $this->call([
            RealCatalogSeeder::class, // real products from company photos
            GallerySeeder::class,     // showroom shots + video for the gallery page
        ]);
    }

    private function seedAdmin(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@teddytrading.com'],
            [
                'name' => 'Teddy Administrator',
                'phone' => '+251 91 123 4567',
                'password' => 'TeddyAdmin@2026', // hashed cast -> bcrypt. CHANGE AFTER FIRST LOGIN!
                'is_admin' => true,
            ]
        );
    }

    private function seedSettings(): void
    {
        $defaults = [
            'store_name' => 'Teddy General Trading',
            'store_tagline' => 'Ethiopia\'s trusted source for water materials & equipment',
            'store_email' => 'info@teddytrading.com',
            'store_phone' => '+251 91 123 4567',
            'store_phone_alt' => '+251 11 662 0000',
            'store_address' => 'Merkato, Dubai Tera Building, 2nd Floor, Addis Ababa, Ethiopia',
            'currency' => 'ETB',
            'tax_rate' => '15',
            'shipping_fee' => '150',
            'free_shipping_threshold' => '20000',
            'bank_name' => 'Commercial Bank of Ethiopia (CBE)',
            'bank_account_name' => 'Teddy General Trading PLC',
            'bank_account_number' => '1000123456789',
            'telebirr_number' => '+251 91 123 4567',
            'facebook_url' => 'https://facebook.com/teddytrading',
            'telegram_url' => 'https://t.me/teddytrading',
            'whatsapp_number' => '+251911234567',
            'about_text' => 'Teddy General Trading has been supplying Ethiopia with premium water pumps, valves, pipes, sanitary ware and specialized fittings for over a decade. From household plumbing to large-scale municipal and irrigation projects, we deliver certified equipment backed by expert technical support.',
        ];

        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
