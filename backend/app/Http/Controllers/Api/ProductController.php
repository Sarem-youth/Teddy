<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * REQ-3.1.3 Storefront listing with pagination + category filtering.
     */
    public function index(Request $request)
    {
        $query = Product::query()
            ->active()
            ->with(['category:id,name,slug', 'images']);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->string('category')));
        }

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\%', '\_'], $request->string('search')) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('short_description', 'like', $term)
                    ->orWhere('sku', 'like', $term);
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        $query = match ($request->input('sort', 'latest')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popular' => $query->orderByDesc('views'),
            'name' => $query->orderBy('title'),
            default => $query->latest(),
        };

        $perPage = min(max((int) $request->input('per_page', 12), 1), 48);

        return response()->json($query->paginate($perPage)->withQueryString());
    }

    public function show(string $slug)
    {
        $product = Product::active()
            ->with(['category:id,name,slug', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        Product::withoutTimestamps(fn () => $product->increment('views'));

        $related = Product::active()
            ->with('images')
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn ($q) => $q->where('category_id', $product->category_id))
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }
}
