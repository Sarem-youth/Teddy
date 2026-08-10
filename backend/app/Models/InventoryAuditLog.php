<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryAuditLog extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'action',
        'quantity_delta',
        'previous_quantity',
        'new_quantity',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'quantity_delta' => 'integer',
        'previous_quantity' => 'integer',
        'new_quantity' => 'integer',
        'metadata' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
