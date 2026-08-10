<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_quote_intents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('shipping_city', 120);
            $table->string('shipping_region', 120)->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->string('token', 80)->unique();
            $table->string('status', 20)->default('issued');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['user_id', 'status', 'expires_at']);
            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_quote_intents');
    }
};
