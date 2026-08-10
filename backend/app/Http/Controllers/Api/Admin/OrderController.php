<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->with('user:id,name,email')->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\%', '\_'], $request->string('search')) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', $term)
                    ->orWhere('shipping_name', 'like', $term)
                    ->orWhere('shipping_phone', 'like', $term);
            });
        }

        return response()->json($query->latest()->paginate((int) $request->input('per_page', 15))->withQueryString());
    }

    public function show(Order $order)
    {
        return response()->json([
            'order' => $order->load(['items.product:id,slug,title', 'user:id,name,email,phone']),
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(Order::STATUSES)],
            'payment_status' => ['sometimes', Rule::in(['pending', 'confirmed'])],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
            'shipping_tracking_number' => ['nullable', 'string', 'max:120'],
            'shipping_carrier' => ['nullable', 'string', 'max:100'],
        ]);

        $previousStatus = $order->status;

        // Restock inventory when an order is cancelled (one-way guard).
        if (($data['status'] ?? null) === 'cancelled' && $previousStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                $item->product?->increment('stock_quantity', $item->quantity);
            }
        }

        // If a cancelled order is re-activated, deduct stock again.
        if (isset($data['status']) && $data['status'] !== 'cancelled' && $previousStatus === 'cancelled') {
            foreach ($order->items as $item) {
                $item->product?->decrement('stock_quantity', min($item->quantity, $item->product->stock_quantity));
            }
        }

        if (isset($data['status']) && $data['status'] !== $previousStatus) {
            $order->status = $data['status'];
            $order->fulfilled_at = in_array($data['status'], ['delivered', 'dispatched'], true) ? now() : $order->fulfilled_at;
            $order->save();
            $order->refresh();

            if ($order->user) {
                Notification::send($order->user, new OrderStatusUpdated($order, $data['status']));
            }
        }

        $order->fill($data);
        $order->save();

        return response()->json([
            'order' => $order->fresh()->load(['items.product:id,slug,title', 'user:id,name,email,phone']),
        ]);
    }
}
