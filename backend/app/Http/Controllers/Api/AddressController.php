<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'addresses' => $request->user()->addresses()->orderByDesc('is_default')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $address = $request->user()->addresses()->create($data);

        if ($data['is_default'] ?? false) {
            $this->makeDefault($request, $address);
        }

        return response()->json(['address' => $address->fresh()], 201);
    }

    public function update(Request $request, Address $address)
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $data = $this->validated($request);
        $address->update($data);

        if ($data['is_default'] ?? false) {
            $this->makeDefault($request, $address);
        }

        return response()->json(['address' => $address->fresh()]);
    }

    public function destroy(Request $request, Address $address)
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $address->delete();

        return response()->json(['message' => 'Address removed.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'label' => ['nullable', 'string', 'max:60'],
            'name' => ['required', 'string', 'max:190'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:120'],
            'is_default' => ['boolean'],
        ]);
    }

    private function makeDefault(Request $request, Address $address): void
    {
        $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);
    }
}
