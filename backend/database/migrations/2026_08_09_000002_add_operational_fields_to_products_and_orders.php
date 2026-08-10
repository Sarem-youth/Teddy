<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stock_alert_threshold')->default(5)->after('stock_quantity');
            $table->json('variant_attributes')->nullable()->after('stock_alert_threshold');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_tracking_number', 120)->nullable()->after('shipping_region');
            $table->string('shipping_carrier', 100)->nullable()->after('shipping_tracking_number');
            $table->timestamp('fulfilled_at')->nullable()->after('shipping_carrier');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['stock_alert_threshold', 'variant_attributes']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_tracking_number', 'shipping_carrier', 'fulfilled_at']);
        });
    }
};
