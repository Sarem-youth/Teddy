<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    /**
     * Return the list of active payment methods.
     * If none exist, create a default "Cash" method.
     */
    public function index(Request $request)
    {
        $methods = PaymentMethod::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if ($methods->isEmpty()) {
            // Create default cash method
            $cash = PaymentMethod::create([
                'name' => 'Cash',
                'code' => 'cash',
                'fee' => 0,
                'is_active' => true,
                'sort_order' => 0,
            ]);
            $methods = collect([$cash]);
        }

        return response()->json(['methods' => $methods]);
    }
}
