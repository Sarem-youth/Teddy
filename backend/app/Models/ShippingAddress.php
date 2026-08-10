<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    use HasFactory;

    protected $table = 'shipping_addresses';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'city',
        'region',
        'is_default',
    ];
}
