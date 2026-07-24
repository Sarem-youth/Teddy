<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'sku',
        'short_description',
        'details',
        'price',
        'compare_at_price',
        'stock_quantity',
        'is_active',
        'is_featured',
        'meta_title',
        'meta_description',
        'views',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'stock_quantity' => 'integer',
    ];

    protected $appends = ['primary_image'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getPrimaryImageAttribute(): ?string
    {
        $image = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
            : $this->images()->orderByDesc('is_primary')->orderBy('sort_order')->first();

        return $image?->path;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
