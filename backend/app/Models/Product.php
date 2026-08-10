<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'sku',
        'short_description',
        'details',
        'image_path',
        'price',
        'compare_at_price',
        'stock_quantity',
        'stock_alert_threshold',
        'variant_attributes',
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
        'stock_alert_threshold' => 'integer',
        'variant_attributes' => 'array',
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

    public function inventoryAuditLogs()
    {
        return $this->hasMany(InventoryAuditLog::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class)->orderByDesc('created_at');
    }

    public function getAverageRatingAttribute(): float
    {
        return round((float) $this->reviews()->where('is_approved', true)->average('rating') ?? 0, 2);
    }

    public function getReviewsCountAttribute(): int
    {
        return (int) $this->reviews()->where('is_approved', true)->count();
    }

    public function getPrimaryImageAttribute(): ?string
    {
        $image = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
            : $this->images()->orderByDesc('is_primary')->orderBy('sort_order')->first();

        if ($image?->path) {
            return $image->path;
        }

        if (is_string($this->image_path) && $this->image_path !== '') {
            return $this->image_path;
        }

        return $this->fallbackPrimaryImagePath();
    }

    private function fallbackPrimaryImagePath(): string
    {
        $slug = $this->relationLoaded('category')
            ? (string) ($this->category?->slug ?? '')
            : '';

        $key = Str::slug($slug ?: $this->title);

        $map = [
            'valves-controls' => '/uploads/products/seed/valve.svg',
            'water-meters' => '/uploads/products/seed/meter.svg',
            'pipes-fittings' => '/uploads/products/seed/pipes.svg',
            'flanges-couplings' => '/uploads/products/seed/filtration.svg',
            'bathroom-sanitary' => '/uploads/products/seed/drop.svg',
            'fire-fighting' => '/uploads/products/seed/tank.svg',
            'pumps-machinery-solar' => '/uploads/products/seed/pump.svg',
        ];

        foreach ($map as $needle => $path) {
            if (str_contains($key, $needle)) {
                return $path;
            }
        }

        return '/uploads/hero_placeholder.png';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
