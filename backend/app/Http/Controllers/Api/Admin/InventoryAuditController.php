<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryAuditLog;
use Illuminate\Http\Request;

class InventoryAuditController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryAuditLog::query()->with(['product:id,title,slug', 'user:id,name,email'])->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        return response()->json($query->paginate((int) $request->input('per_page', 15))->withQueryString());
    }
}
