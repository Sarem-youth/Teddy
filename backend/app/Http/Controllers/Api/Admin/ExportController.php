<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function orders(): StreamedResponse
    {
        return $this->csv('orders-' . now()->format('Y-m-d') . '.csv', [
            'Order #', 'Date', 'Customer', 'Email', 'Phone', 'City', 'Items', 'Subtotal', 'Tax', 'Shipping', 'Total', 'Payment Method', 'Payment Status', 'Status',
        ], function ($out) {
            Order::with('user:id,name,email')->withCount('items')->latest()->chunk(200, function ($orders) use ($out) {
                foreach ($orders as $o) {
                    fputcsv($out, [
                        $o->order_number,
                        $o->created_at->format('Y-m-d H:i'),
                        $o->shipping_name,
                        $o->shipping_email ?? $o->user?->email,
                        $o->shipping_phone,
                        $o->shipping_city,
                        $o->items_count,
                        $o->subtotal,
                        $o->tax,
                        $o->shipping_fee,
                        $o->total,
                        $o->payment_method,
                        $o->payment_status,
                        $o->status,
                    ]);
                }
            });
        });
    }

    public function products(): StreamedResponse
    {
        return $this->csv('products-' . now()->format('Y-m-d') . '.csv', [
            'ID', 'Title', 'SKU', 'Category', 'Price (ETB)', 'Compare Price', 'Stock', 'Active', 'Featured', 'Views', 'Created',
        ], function ($out) {
            Product::with('category:id,name')->orderBy('id')->chunk(200, function ($products) use ($out) {
                foreach ($products as $p) {
                    fputcsv($out, [
                        $p->id,
                        $p->title,
                        $p->sku,
                        $p->category?->name,
                        $p->price,
                        $p->compare_at_price,
                        $p->stock_quantity,
                        $p->is_active ? 'yes' : 'no',
                        $p->is_featured ? 'yes' : 'no',
                        $p->views,
                        $p->created_at->format('Y-m-d'),
                    ]);
                }
            });
        });
    }

    public function customers(): StreamedResponse
    {
        return $this->csv('customers-' . now()->format('Y-m-d') . '.csv', [
            'ID', 'Name', 'Email', 'Phone', 'Orders', 'Total Spent (ETB)', 'Joined',
        ], function ($out) {
            User::where('is_admin', false)
                ->withCount('orders')
                ->withSum('orders as total_spent', 'total')
                ->orderBy('id')
                ->chunk(200, function ($users) use ($out) {
                    foreach ($users as $u) {
                        fputcsv($out, [
                            $u->id,
                            $u->name,
                            $u->email,
                            $u->phone,
                            $u->orders_count,
                            $u->total_spent ?? 0,
                            $u->created_at->format('Y-m-d'),
                        ]);
                    }
                });
        });
    }

    private function csv(string $filename, array $header, callable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($header, $rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel opens it cleanly
            fputcsv($out, $header);
            $rows($out);
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
