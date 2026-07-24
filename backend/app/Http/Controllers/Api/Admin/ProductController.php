<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * REQ-3.1.1 administrative CRUD logic.
     */
    public function index(Request $request)
    {
        $query = Product::query()->with(['category:id,name,slug', 'images']);

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\%', '\_'], $request->string('search')) . '%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('sku', 'like', $term));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        } elseif ($request->input('status') === 'low_stock') {
            $query->where('stock_quantity', '<=', 5);
        }

        return response()->json($query->latest()->paginate((int) $request->input('per_page', 15))->withQueryString());
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['title']);

        $product = Product::create($data);

        $this->storeUploadedImages($request, $product);

        return response()->json(['product' => $product->load(['category', 'images'])], 201);
    }

    public function show(Product $product)
    {
        return response()->json(['product' => $product->load(['category', 'images'])]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product);

        if ($data['title'] !== $product->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $product->id);
        }

        $product->update($data);

        $this->storeUploadedImages($request, $product);

        return response()->json(['product' => $product->fresh()->load(['category', 'images'])]);
    }

    public function destroy(Product $product)
    {
        foreach ($product->images as $image) {
            $this->deleteImageFile($image->path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /**
     * Lightweight inline edit — price / stock / flags only.
     */
    public function quickUpdate(Request $request, Product $product)
    {
        $data = $request->validate([
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $product->update($data);

        return response()->json(['product' => $product->fresh()->load(['category', 'images'])]);
    }

    /**
     * Clone a product (as an inactive draft) including its images.
     */
    public function duplicate(Product $product)
    {
        $copy = $product->replicate(['views', 'slug']);
        $copy->title = $product->title . ' (Copy)';
        $copy->slug = $this->uniqueSlug($copy->title);
        $copy->is_active = false;
        $copy->views = 0;
        $copy->save();

        $dir = public_path('uploads/products');
        foreach ($product->images as $image) {
            $source = public_path(ltrim($image->path, '/'));
            if (! is_file($source)) {
                continue;
            }
            $filename = $copy->id . '-' . Str::random(10) . '.' . pathinfo($source, PATHINFO_EXTENSION);
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            copy($source, $dir . '/' . $filename);

            $copy->images()->create([
                'path' => '/uploads/products/' . $filename,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
                'is_primary' => $image->is_primary,
            ]);
        }

        return response()->json(['product' => $copy->fresh()->load(['category', 'images'])], 201);
    }

    /**
     * Bulk operations on a set of products.
     */
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'exists:products,id'],
            'action' => ['required', 'in:activate,deactivate,feature,unfeature,delete'],
        ]);

        $products = Product::whereIn('id', $data['ids'])->get();

        foreach ($products as $product) {
            match ($data['action']) {
                'activate' => $product->update(['is_active' => true]),
                'deactivate' => $product->update(['is_active' => false]),
                'feature' => $product->update(['is_featured' => true]),
                'unfeature' => $product->update(['is_featured' => false]),
                'delete' => (function () use ($product) {
                    foreach ($product->images as $image) {
                        $this->deleteImageFile($image->path);
                    }
                    $product->delete();
                })(),
            };
        }

        return response()->json(['message' => 'Done', 'count' => $products->count()]);
    }

    public function destroyImage(Product $product, ProductImage $image)
    {
        abort_unless($image->product_id === $product->id, 404);

        $this->deleteImageFile($image->path);
        $image->delete();

        // Promote another image to primary if needed.
        if ($image->is_primary) {
            $product->images()->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        return response()->json(['product' => $product->fresh()->load(['category', 'images'])]);
    }

    public function makePrimaryImage(Product $product, ProductImage $image)
    {
        abort_unless($image->product_id === $product->id, 404);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['product' => $product->fresh()->load(['category', 'images'])]);
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:190'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:80'],
            'short_description' => ['nullable', 'string', 'max:600'],
            'details' => ['nullable', 'string', 'max:65000'], // REQ-3.1.2 free-form technical details
            'price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:190'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'product';
        $slug = $base;
        $i = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . ++$i;
        }

        return $slug;
    }

    private function storeUploadedImages(Request $request, Product $product): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $request->validate([
            'images' => ['array', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp,avif,gif', 'max:4096'],
        ]);

        $dir = public_path('uploads/products');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $sort = (int) $product->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $file) {
            $filename = $product->id . '-' . Str::random(10) . '.' . strtolower($file->getClientOriginalExtension());
            $file->move($dir, $filename);

            $product->images()->create([
                'path' => '/uploads/products/' . $filename,
                'alt_text' => $request->input('image_alt', $product->title),
                'sort_order' => $sort++,
                'is_primary' => ! $hasPrimary,
            ]);

            $hasPrimary = true;
        }
    }

    private function deleteImageFile(string $path): void
    {
        // Only ever delete inside the uploads directory.
        $full = public_path(ltrim($path, '/'));
        $uploadsRoot = realpath(public_path('uploads'));
        $real = realpath($full);

        if ($real && $uploadsRoot && str_starts_with($real, $uploadsRoot) && is_file($real)) {
            @unlink($real);
        }
    }
}
