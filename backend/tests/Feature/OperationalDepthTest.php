<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\ChannelManager;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OperationalDepthTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_exposes_low_stock_inventory_alerts(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Product::create([
            'title' => 'Low Stock Valve',
            'slug' => 'low-stock-valve',
            'price' => 100,
            'stock_quantity' => 2,
            'is_active' => true,
        ]);
        Product::create([
            'title' => 'Healthy Valve',
            'slug' => 'healthy-valve',
            'price' => 120,
            'stock_quantity' => 25,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/dashboard');

        $response->assertOk();
        $this->assertSame(1, $response->json('stats.low_stock'));
        $this->assertCount(1, $response->json('low_stock_products'));
    }

    public function test_order_status_changes_track_fulfillment_and_notify_customer(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $customer = User::factory()->create(['is_admin' => false]);
        $product = Product::create([
            'title' => 'Dispatch Valve',
            'slug' => 'dispatch-valve',
            'price' => 150,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
        $order = Order::create([
            'order_number' => 'TGT-TEST-001',
            'user_id' => $customer->id,
            'status' => 'pending',
            'payment_method' => 'cash_on_delivery',
            'payment_status' => 'pending',
            'subtotal' => 150,
            'tax' => 0,
            'shipping_fee' => 0,
            'total' => 150,
            'shipping_name' => 'Jane Doe',
            'shipping_phone' => '0911222333',
            'shipping_email' => 'jane@example.com',
            'shipping_address' => 'Addis Ababa',
            'shipping_city' => 'Addis Ababa',
            'shipping_region' => 'AA',
        ]);
        $order->items()->create([
            'product_id' => $product->id,
            'product_title' => $product->title,
            'unit_price' => $product->price,
            'quantity' => 1,
            'line_total' => $product->price,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/admin/orders/' . $order->id, [
            'status' => 'packing',
            'admin_notes' => 'Packing started.',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'packing']);
        Notification::assertSentTo($customer, OrderStatusUpdated::class, function ($notification) use ($order) {
            return $notification->order->id === $order->id && $notification->status === 'packing';
        });
    }

    public function test_products_can_import_variant_attributes_from_csv(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Storage::fake('local');

        $file = UploadedFile::fake()->createWithContent(
            'products.csv',
            "title,sku,price,stock_quantity,variant_attributes\n" .
            "Flow Control Valve,V-100,1200,24,\"size:2\"\";diameter:50mm;pressure_rating:PN16;material_type:Brass;model:FCV-2\"\n"
        );

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/admin/products/import', [
            'file' => $file,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('products', ['sku' => 'V-100']);
        $this->assertSame('2"', Product::where('sku', 'V-100')->first()->variant_attributes['size']);
    }

    public function test_coupon_code_can_reduce_checkout_total(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'title' => 'Discounted Valve',
            'slug' => 'discounted-valve',
            'price' => 100,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'SAVE10',
            'type' => 'percent',
            'value' => 10,
            'min_order_amount' => 50,
            'usage_limit' => 5,
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDay(),
        ]);

        $quote = $this->actingAs($user, 'sanctum')->postJson('/api/pricing/quote-cart', [
            'shipping_city' => 'Addis Ababa',
            'shipping_region' => 'AA',
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
            ]],
        ]);

        $quote->assertOk();
        $token = $quote->json('quotes.0.token');
        $this->assertNotNull($token);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'quote_token' => $token,
            ]],
            'payment_method' => 'cash_on_delivery',
            'shipping_name' => 'Jane Doe',
            'shipping_phone' => '0911222333',
            'shipping_email' => 'jane@example.com',
            'shipping_address' => 'Addis Ababa',
            'shipping_city' => 'Addis Ababa',
            'shipping_region' => 'AA',
            'coupon_code' => 'SAVE10',
        ]);

        $response->assertCreated();
        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertSame(90.0, (float) $order->total);
    }

    public function test_order_requires_valid_quote_token(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'title' => 'Quoted Valve',
            'slug' => 'quoted-valve',
            'price' => 120,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
            ]],
            'payment_method' => 'cash_on_delivery',
            'shipping_name' => 'Jane Doe',
            'shipping_phone' => '0911222333',
            'shipping_email' => 'jane@example.com',
            'shipping_address' => 'Addis Ababa',
            'shipping_city' => 'Addis Ababa',
            'shipping_region' => 'AA',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['items.0.quote_token']);
    }

    public function test_storefront_products_hide_exact_price_until_checkout_intent(): void
    {
        Product::create([
            'title' => 'Hidden Price Valve',
            'slug' => 'hidden-price-valve',
            'price' => 980,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $list = $this->getJson('/api/products');
        $list->assertOk();
        $this->assertFalse((bool) $list->json('data.0.price_visible'));
        $this->assertNull($list->json('data.0.price'));
    }

    public function test_customers_can_leave_product_reviews_and_rating_summary_is_exposed(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'title' => 'Rated Valve',
            'slug' => 'rated-valve',
            'price' => 200,
            'stock_quantity' => 8,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/products/' . $product->slug . '/reviews', [
            'rating' => 5,
            'title' => 'Excellent quality',
            'comment' => 'Great for our pump station setup.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('product_reviews', ['product_id' => $product->id, 'user_id' => $user->id, 'rating' => 5]);

        $detail = $this->actingAs($user, 'sanctum')->getJson('/api/products/' . $product->slug);
        $detail->assertOk();
        $this->assertSame(5.0, (float) $detail->json('product.average_rating'));
        $this->assertSame(1, $detail->json('product.reviews_count'));
    }

    public function test_admin_can_triage_contact_leads_with_status_assignment_and_notes(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $create = $this->postJson('/api/contact', [
            'name' => 'Facility Buyer',
            'email' => 'buyer@example.com',
            'subject' => 'Need quotation',
            'message' => 'Please share wholesale pricing for 200 units.',
        ]);
        $create->assertCreated();

        $messageId = \App\Models\ContactMessage::query()->value('id');
        $this->assertNotNull($messageId);

        $update = $this->actingAs($admin, 'sanctum')->putJson('/api/admin/messages/' . $messageId, [
            'status' => 'in_progress',
            'priority' => 'high',
            'assigned_to' => $admin->id,
            'admin_notes' => 'Preparing B2B quote and callback schedule.',
        ]);

        $update->assertOk();
        $this->assertDatabaseHas('contact_messages', [
            'id' => $messageId,
            'status' => 'in_progress',
            'priority' => 'high',
            'assigned_to' => $admin->id,
        ]);
    }
}
