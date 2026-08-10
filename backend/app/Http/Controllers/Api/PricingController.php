<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricingQuoteIntent;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PricingController extends Controller
{
    private const QUOTE_TTL_MINUTES = 20;

    /**
     * Create a signed, short-lived line-price quote for a single item.
     */
    public function quoteIntent(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_region' => ['nullable', 'string', 'max:120'],
        ]);

        $quote = $this->issueQuote($request->user()->id, $data);

        return response()->json(['quote' => $this->quotePayload($quote)]);
    }

    /**
     * Quote all cart lines at once for a real checkout intent.
     */
    public function quoteCart(Request $request)
    {
        $data = $request->validate([
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_region' => ['nullable', 'string', 'max:120'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $quotes = [];
        foreach ($data['items'] as $item) {
            $quotes[] = $this->issueQuote($request->user()->id, [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'shipping_city' => $data['shipping_city'],
                'shipping_region' => $data['shipping_region'] ?? null,
            ]);
        }

        return response()->json([
            'quotes' => collect($quotes)->map(fn (PricingQuoteIntent $quote) => $this->quotePayload($quote))->values(),
            'expires_at' => collect($quotes)->map(fn (PricingQuoteIntent $q) => $q->expires_at)->min(),
        ]);
    }

    private function issueQuote(int $userId, array $payload): PricingQuoteIntent
    {
        PricingQuoteIntent::query()
            ->where('user_id', $userId)
            ->where('status', PricingQuoteIntent::STATUS_ISSUED)
            ->where('expires_at', '<=', now())
            ->update(['status' => PricingQuoteIntent::STATUS_EXPIRED]);

        $product = Product::active()->find($payload['product_id']);

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => ['This product is no longer available.'],
            ]);
        }

        if ($product->stock_quantity < $payload['quantity']) {
            throw ValidationException::withMessages([
                'quantity' => ["Insufficient stock for \"{$product->title}\" — only {$product->stock_quantity} left."],
            ]);
        }

        $lineTotal = round((float) $product->price * (int) $payload['quantity'], 2);

        $quote = PricingQuoteIntent::create([
            'user_id' => $userId,
            'product_id' => $product->id,
            'quantity' => $payload['quantity'],
            'shipping_city' => trim($payload['shipping_city']),
            'shipping_region' => isset($payload['shipping_region']) ? trim((string) $payload['shipping_region']) ?: null : null,
            'unit_price' => $product->price,
            'line_total' => $lineTotal,
            'token' => (string) Str::uuid() . Str::lower(Str::random(8)),
            'status' => PricingQuoteIntent::STATUS_ISSUED,
            'expires_at' => Carbon::now()->addMinutes(self::QUOTE_TTL_MINUTES),
        ]);

        return $quote;
    }

    private function quotePayload(PricingQuoteIntent $quote): array
    {
        return [
            'token' => $quote->token,
            'product_id' => $quote->product_id,
            'quantity' => $quote->quantity,
            'unit_price' => (float) $quote->unit_price,
            'line_total' => (float) $quote->line_total,
            'shipping_city' => $quote->shipping_city,
            'shipping_region' => $quote->shipping_region,
            'expires_at' => $quote->expires_at?->toAtomString(),
        ];
    }
}
