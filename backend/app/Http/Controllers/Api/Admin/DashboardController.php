<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\GalleryItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
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

        $repeatBuyers = Order::query()
            ->whereNotNull('user_id')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $avgOrderValue = Order::where('status', '!=', 'cancelled')->average('total') ?? 0;

        return response()->json([
            'stats' => [
                'total_revenue' => round((float) Order::whereIn('status', $revenueStatuses)->sum('total'), 2),
                'pending_revenue' => round((float) Order::where('status', 'pending_verification')->sum('total'), 2),
                'orders_count' => Order::count(),
                'pending_orders' => Order::where('status', 'pending_verification')->count(),
                'products_count' => Product::count(),
                'active_products' => Product::where('is_active', true)->count(),
                'gallery_images_count' => GalleryItem::where('type', 'image')->count(),
                'gallery_videos_count' => GalleryItem::where('type', 'video')->count(),
                'store_status' => Setting::get('store_name') ? 'configured' : 'needs_setup',
                'low_stock' => Product::where('is_active', true)->whereRaw('stock_quantity <= COALESCE(stock_alert_threshold, 5)')->count(),
                'customers_count' => User::where('is_admin', false)->count(),
                'new_customers' => User::where('is_admin', false)->where('created_at', '>=', now()->subDays(30))->count(),
                'repeat_buyers' => $repeatBuyers,
                'average_order_value' => round((float) $avgOrderValue, 2),
                'unread_messages' => ContactMessage::where('is_read', false)->count(),
            ],
            'sales_chart' => $chart,
            'status_breakdown' => Order::query()
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'revenue_by_status' => Order::query()
                ->select('status', DB::raw('SUM(total) as revenue'))
                ->groupBy('status')
                ->pluck('revenue', 'status'),
            'recent_orders' => Order::with('user:id,name,email')->withCount('items')->latest()->limit(8)->get(),
            'top_products' => $topProducts,
            'low_stock_products' => Product::where('is_active', true)
                ->whereRaw('stock_quantity <= COALESCE(stock_alert_threshold, 5)')
                ->orderBy('stock_quantity')
                ->limit(6)
                ->get(['id', 'title', 'slug', 'stock_quantity', 'stock_alert_threshold', 'price']),
        ]);
    }
}
