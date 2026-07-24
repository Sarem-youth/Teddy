<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $revenueStatuses = ['processing', 'shipped', 'delivered'];

        $salesByDay = Order::query()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->where('status', '!=', 'cancelled')
            ->get(['created_at', 'total'])
            ->groupBy(fn ($order) => $order->created_at->format('Y-m-d'))
            ->map(fn ($orders, $day) => [
                'date' => $day,
                'orders' => $orders->count(),
                'revenue' => round($orders->sum('total'), 2),
            ]);

        // Fill in missing days for a smooth chart.
        $chart = collect(range(29, 0))->map(function ($daysAgo) use ($salesByDay) {
            $day = now()->subDays($daysAgo)->format('Y-m-d');

            return $salesByDay->get($day, ['date' => $day, 'orders' => 0, 'revenue' => 0]);
        })->values();

        $topProducts = OrderItem::query()
            ->select('product_title', DB::raw('SUM(quantity) as units'), DB::raw('SUM(line_total) as revenue'))
            ->groupBy('product_title')
            ->orderByDesc('units')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => round((float) Order::whereIn('status', $revenueStatuses)->sum('total'), 2),
                'pending_revenue' => round((float) Order::where('status', 'pending_verification')->sum('total'), 2),
                'orders_count' => Order::count(),
                'pending_orders' => Order::where('status', 'pending_verification')->count(),
                'products_count' => Product::count(),
                'active_products' => Product::where('is_active', true)->count(),
                'low_stock' => Product::where('is_active', true)->where('stock_quantity', '<=', 5)->count(),
                'customers_count' => User::where('is_admin', false)->count(),
                'unread_messages' => ContactMessage::where('is_read', false)->count(),
            ],
            'sales_chart' => $chart,
            'status_breakdown' => Order::query()
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'recent_orders' => Order::with('user:id,name,email')->withCount('items')->latest()->limit(8)->get(),
            'top_products' => $topProducts,
            'low_stock_products' => Product::where('is_active', true)
                ->where('stock_quantity', '<=', 5)
                ->orderBy('stock_quantity')
                ->limit(6)
                ->get(['id', 'title', 'slug', 'stock_quantity', 'price']),
        ]);
    }
}
