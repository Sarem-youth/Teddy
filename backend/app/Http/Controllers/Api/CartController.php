<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * REQ-3.2.1 persistent virtual cart for authenticated customers.
     */
    public function index(Request $request)
    {
        return response()->json(['items' => $this->cartPayload($request)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $product = Product::active()->findOrFail($data['product_id']);

        $item = CartItem::firstOrNew([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        $item->quantity = min(($item->exists ? $item->quantity : 0) + $data['quantity'], max($product->stock_quantity, 1));
        $item->save();

        return response()->json(['items' => $this->cartPayload($request)], 201);
    }

    /**
     * Merge a guest (localStorage) cart into the server cart after login.
     */
    public function sync(Request $request)
    {
        $data = $request->validate([
            'items' => ['array'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        foreach ($data['items'] ?? [] as $row) {
            $product = Product::active()->find($row['product_id']);
            if (! $product) {
                continue;
            }

            $item = CartItem::firstOrNew([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
            ]);

            $quantity = max($item->exists ? $item->quantity : 0, $row['quantity']);
            $item->quantity = min($quantity, max($product->stock_quantity, 1));
            $item->save();
        }

        return response()->json(['items' => $this->cartPayload($request)]);
    }

    public function update(Request $request, CartItem $item)
    {
        abort_unless($item->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $stock = max($item->product?->stock_quantity ?? 1, 1);
        $item->update(['quantity' => min($data['quantity'], $stock)]);

        return response()->json(['items' => $this->cartPayload($request)]);
    }

    public function destroy(Request $request, CartItem $item)
    {
        abort_unless($item->user_id === $request->user()->id, 403);

        $item->delete();

        return response()->json(['items' => $this->cartPayload($request)]);
    }

    public function clear(Request $request)
    {
        $request->user()->cartItems()->delete();

        return response()->json(['items' => []]);
    }

    private function cartPayload(Request $request): array
    {
        return $request->user()
            ->cartItems()
            ->with(['product' => fn ($q) => $q->with('images')])
            ->get()
            ->filter(fn ($item) => $item->product && $item->product->is_active)
            ->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'product' => [
                    'id' => $item->product->id,
                    'title' => $item->product->title,
                    'slug' => $item->product->slug,
                    'price' => null,
                    'price_visible' => false,
                    'price_reveal_mode' => 'quote_required',
                    'price_band' => $this->priceBand((float) $item->product->price),
                    'stock_quantity' => $item->product->stock_quantity,
                    'primary_image' => $item->product->primary_image,
                ],
            ])
            ->values()
            ->all();
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
