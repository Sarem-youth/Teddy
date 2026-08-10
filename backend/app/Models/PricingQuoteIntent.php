<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingQuoteIntent extends Model
{
    public const STATUS_ISSUED = 'issued';
    public const STATUS_USED = 'used';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'quantity',
        'shipping_city',
        'shipping_region',
        'unit_price',
        'line_total',
        'token',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
