<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShippingAddressController extends Controller
{
    /**
     * List all shipping addresses (admin only).
     */
    public function index()
    {
        // Assuming admin middleware is applied on the route group.
        return response()->json(ShippingAddress::orderBy('is_default', 'desc')->get());
    }

    /**
     * Create a new shipping address.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:120'],
            'is_default' => ['boolean'],
        ]);

        return DB::transaction(function () use ($data) {
            if (!empty($data['is_default'])) {
                // Unset previous default
                ShippingAddress::where('is_default', true)->update(['is_default' => false]);
            }
            $address = ShippingAddress::create($data);
            return response()->json($address, 201);
        });
    }

    /**
     * Update an existing shipping address.
     */
    public function update(Request $request, ShippingAddress $address)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:190'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:190'],
            'address' => ['sometimes', 'required', 'string', 'max:500'],
            'city' => ['sometimes', 'required', 'string', 'max:120'],
            'region' => ['sometimes', 'nullable', 'string', 'max:120'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        return DB::transaction(function () use ($address, $data) {
            if (array_key_exists('is_default', $data) && $data['is_default']) {
                ShippingAddress::where('is_default', true)->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }
            $address->update($data);
            return response()->json($address);
        });
    }

    /**
     * Delete a shipping address.
     */
    public function destroy(ShippingAddress $address)
    {
        $address->delete();
        return response()->json(null, 204);
    }

    /**
     * Set a shipping address as default.
     */
    public function setDefault(ShippingAddress $address)
    {
        return DB::transaction(function () use ($address) {
            ShippingAddress::where('is_default', true)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
            return response()->json($address);
        });
    }
}
