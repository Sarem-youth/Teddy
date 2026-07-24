<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    /**
     * Public gallery feed — photos & videos of real projects.
     */
    public function index(Request $request)
    {
        $query = GalleryItem::query()->where('is_active', true);

        if (in_array($request->input('type'), ['image', 'video'], true)) {
            $query->where('type', $request->input('type'));
        }

        $items = $query
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'type', 'path', 'thumb_path', 'title', 'is_featured']);

        return response()->json(['items' => $items]);
    }
}
