<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('is_admin', false)
            ->withCount('orders')
            ->withSum('orders as total_spent', 'total');

        if ($request->filled('search')) {
            $term = '%' . str_replace(['%', '_'], ['\%', '\_'], $request->string('search')) . '%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        return response()->json($query->latest()->paginate((int) $request->input('per_page', 15))->withQueryString());
    }

    public function show(User $customer)
    {
        abort_if($customer->is_admin, 404);

        return response()->json([
            'customer' => $customer->loadCount('orders'),
            'orders' => $customer->orders()->withCount('items')->latest()->limit(20)->get(),
        ]);
    }
}
