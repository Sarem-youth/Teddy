<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const STATUSES = [
        'pending_verification',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
    ];

    public const PAYMENT_METHODS = [
        'cash_on_delivery',
        'bank_transfer',
    ];

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'payment_method',
        'payment_status',
        'subtotal',
        'tax',
        'shipping_fee',
        'total',
        'shipping_name',
        'shipping_phone',
        'shipping_email',
        'shipping_address',
        'shipping_city',
        'shipping_region',
        'notes',
        'admin_notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber(): string
    {
        do {
            $number = 'TGT-' . now()->format('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
        } while (static::where('order_number', $number)->exists());

        return $number;
    }
}
