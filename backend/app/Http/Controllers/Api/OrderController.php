<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * REQ-3.2.2 + REQ-3.2.3 + REQ-3.4.1 — checkout ingestion with
     * server-side recomputation and offline-payment baseline status.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'payment_method' => ['required', 'in:cash_on_delivery,bank_transfer'],
            'shipping_name' => ['required', 'string', 'max:190'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_email' => ['nullable', 'email', 'max:190'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_region' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $order = DB::transaction(function () use ($data, $user) {
            $subtotal = 0;
            $lines = [];

            foreach ($data['items'] as $row) {
                $product = Product::where('id', $row['product_id'])->lockForUpdate()->first();

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ['One of the products in your cart is no longer available.'],
                    ]);
                }

                if ($product->stock_quantity < $row['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for \"{$product->title}\" — only {$product->stock_quantity} left."],
                    ]);
                }

                $lineTotal = round($product->price * $row['quantity'], 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product' => $product,
                    'quantity' => $row['quantity'],
                    'unit_price' => $product->price,
                    'line_total' => $lineTotal,
                ];
            }

            // Dynamic cost computation from store settings (server authoritative).
            $taxRate = (float) Setting::get('tax_rate', 0);
            $shippingFee = (float) Setting::get('shipping_fee', 0);
            $freeThreshold = (float) Setting::get('free_shipping_threshold', 0);

            $tax = round($subtotal * $taxRate / 100, 2);
            if ($freeThreshold > 0 && $subtotal >= $freeThreshold) {
                $shippingFee = 0;
            }
            $total = round($subtotal + $tax + $shippingFee, 2);

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'status' => 'pending_verification',
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_fee' => $shippingFee,
                'total' => $total,
                'shipping_name' => $data['shipping_name'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_email' => $data['shipping_email'] ?? $user->email,
                'shipping_address' => $data['shipping_address'],
                'shipping_city' => $data['shipping_city'],
                'shipping_region' => $data['shipping_region'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($lines as $line) {
                $order->items()->create([
                    'product_id' => $line['product']->id,
                    'product_title' => $line['product']->title,
                    'unit_price' => $line['unit_price'],
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                $line['product']->decrement('stock_quantity', $line['quantity']);
            }

            return $order;
        });

        // Empty the server-side cart after a successful order.
        $user->cartItems()->delete();

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => $order->load('items'),
        ], 201);
    }

    /**
     * REQ-3.3.2 customer activity hub — order history.
     */
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->withCount('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, string $orderNumber)
    {
        $order = $request->user()
            ->orders()
            ->with('items.product:id,slug,title')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json(['order' => $order]);
    }
}
