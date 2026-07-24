<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('activeProducts as products_count')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json(['categories' => $categories]);
    }
}
