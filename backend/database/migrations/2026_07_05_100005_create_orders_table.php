<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 40)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // REQ-3.4.1 baseline offline verification workflow
            $table->string('status', 40)->default('pending_verification');
            $table->string('payment_method', 40)->default('cash_on_delivery');
            $table->string('payment_status', 30)->default('pending');
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax', 14, 2)->default(0);
            $table->decimal('shipping_fee', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->string('shipping_name');
            $table->string('shipping_phone', 30);
            $table->string('shipping_email')->nullable();
            $table->string('shipping_address', 500);
            $table->string('shipping_city', 120);
            $table->string('shipping_region', 120)->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
