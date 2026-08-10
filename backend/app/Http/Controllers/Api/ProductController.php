<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
            'popular' => $query->orderByDesc('views'),
            'name' => $query->orderBy('title'),
            default => $query->latest(),
        };

        $perPage = min(max((int) $request->input('per_page', 12), 1), 48);

        $result = $query->paginate($perPage)->withQueryString();
        $result->through(fn (Product $product) => $this->storefrontProductPayload($product));

        return response()->json($result);
    }

    public function show(string $identifier)
    {
        $product = $this->resolveActiveProduct($identifier);

        abort_unless($product, 404);

        Product::withoutTimestamps(fn () => $product->increment('views'));

        $related = Product::active()
            ->with('images')
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn ($q) => $q->where('category_id', $product->category_id))
            ->inRandomOrder()
            ->limit(4)
            ->get();

        $product->load(['reviews.user:id,name']);

        return response()->json([
            'product' => $this->storefrontProductPayload($product, true),
            'related' => $related->map(fn (Product $item) => $this->storefrontProductPayload($item)),
        ]);
    }

    public function storeReview(Request $request, string $identifier)
    {
        $product = $this->resolveActiveProduct($identifier);
        abort_unless($product, 404);

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:190'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $review = ProductReview::query()->firstOrNew([
            'product_id' => $product->id,
            'user_id' => $user->id,
        ]);

        if ($review->exists) {
            throw ValidationException::withMessages([
                'rating' => ['You have already reviewed this product.'],
            ]);
        }

        $review->fill([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'comment' => $data['comment'] ?? null,
            'is_approved' => true,
        ]);

        $review->save();

        return response()->json([
            'message' => 'Review added successfully.',
            'review' => $review->load('user:id,name'),
        ], 201);
    }

    private function resolveActiveProduct(string $identifier): ?Product
    {
        $decoded = urldecode(trim($identifier));
        $normalized = Str::slug(str_replace(['—', '–'], '-', $decoded));

        $query = Product::active()->with(['category:id,name,slug', 'images']);

        if (ctype_digit($decoded)) {
            return $query->where('id', (int) $decoded)->first();
        }

        $bySlug = $query->where(function ($q) use ($decoded, $normalized) {
            $q->where('slug', $decoded);

            if ($normalized !== '' && $normalized !== $decoded) {
                $q->orWhere('slug', $normalized);
            }
        })->first();

        if ($bySlug) {
            return $bySlug;
        }

        if ($normalized === '') {
            return null;
        }

        return Product::active()
            ->with(['category:id,name,slug', 'images'])
            ->get()
            ->first(function (Product $product) use ($normalized) {
                return Str::slug((string) $product->slug) === $normalized
                    || Str::slug((string) $product->title) === $normalized;
            });
    }

    private function storefrontProductPayload(Product $product, bool $includeDetails = false): array
    {
        $payload = [
            'id' => $product->id,
            'title' => $product->title,
            'slug' => $product->slug,
            'price' => null,
            'compare_at_price' => null,
            'price_visible' => false,
            'price_reveal_mode' => 'quote_required',
            'price_band' => $this->priceBand((float) $product->price),
            'stock_quantity' => $product->stock_quantity,
            'short_description' => $product->short_description,
            'category' => $product->category,
            'images' => $product->images,
            'primary_image' => $product->primary_image,
            'average_rating' => $product->average_rating,
            'reviews_count' => $product->reviews_count,
            'is_featured' => (bool) $product->is_featured,
            'sku' => $product->sku,
        ];

        if ($includeDetails) {
            $payload['details'] = $product->details;
            $payload['reviews'] = $product->reviews;
            $payload['meta_title'] = $product->meta_title;
            $payload['meta_description'] = $product->meta_description;
        }

        return $payload;
    }

    private function priceBand(float $price): string
    {
        return match (true) {
            $price < 1000 => 'Budget',
            $price < 5000 => 'Mid-range',
            default => 'Premium',
        };
    }
}
