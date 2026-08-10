<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'description',
        'min_order_amount',
        'max_discount_amount',
        'usage_limit',
        'used_count',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            });
    }

    public function isUsableFor(float $orderAmount): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($this->min_order_amount !== null && $orderAmount < $this->min_order_amount) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        $discount = 0.0;

        if ($this->type === 'percent') {
            $discount = $amount * ($this->value / 100);
            if ($this->max_discount_amount !== null && $discount > $this->max_discount_amount) {
                $discount = (float) $this->max_discount_amount;
            }
        } elseif ($this->type === 'fixed') {
            $discount = (float) $this->value;
            if ($discount > $amount) {
                $discount = $amount;
            }
        }

        return round($discount, 2);
    }
}
