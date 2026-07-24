<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    public function index()
    {
        return response()->json([
            'items' => GalleryItem::orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    /**
     * Upload one or more images, or a single video (optionally with poster).
     */
    public function store(Request $request)
    {
        $request->validate([
            'images' => ['nullable', 'array', 'max:20'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp,avif,gif', 'max:6144'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:61440'],
            'poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'title' => ['nullable', 'string', 'max:190'],
        ]);

        $created = [];
        $sort = (int) GalleryItem::max('sort_order') + 1;

        foreach (['photos', 'thumbs', 'videos'] as $sub) {
            $dir = public_path('uploads/gallery/' . $sub);
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }

        foreach ($request->file('images', []) as $file) {
            $name = 'u' . Str::random(10) . '.' . strtolower($file->getClientOriginalExtension());
            $file->move(public_path('uploads/gallery/photos'), $name);

            $created[] = GalleryItem::create([
                'type' => 'image',
                'path' => '/uploads/gallery/photos/' . $name,
                'thumb_path' => '/uploads/gallery/photos/' . $name,
                'title' => $request->input('title'),
                'sort_order' => $sort++,
            ]);
        }

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $name = 'u' . Str::random(10) . '.' . strtolower($file->getClientOriginalExtension());
            $file->move(public_path('uploads/gallery/videos'), $name);

            $thumb = null;
            if ($request->hasFile('poster')) {
                $poster = $request->file('poster');
                $pname = pathinfo($name, PATHINFO_FILENAME) . '.' . strtolower($poster->getClientOriginalExtension());
                $poster->move(public_path('uploads/gallery/videos'), $pname);
                $thumb = '/uploads/gallery/videos/' . $pname;
            }

            $created[] = GalleryItem::create([
                'type' => 'video',
                'path' => '/uploads/gallery/videos/' . $name,
                'thumb_path' => $thumb,
                'title' => $request->input('title'),
                'sort_order' => $sort++,
            ]);
        }

        return response()->json(['items' => $created], 201);
    }

    public function update(Request $request, GalleryItem $item)
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:190'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:99999'],
        ]);

        // Only one featured video at a time keeps the homepage deterministic.
        if (($data['is_featured'] ?? false) && $item->type === 'video') {
            GalleryItem::where('type', 'video')->where('id', '!=', $item->id)->update(['is_featured' => false]);
        }

        $item->update($data);

        return response()->json(['item' => $item->fresh()]);
    }

    public function destroy(GalleryItem $item)
    {
        foreach ([$item->path, $item->thumb_path] as $path) {
            if (! $path) {
                continue;
            }
            $full = realpath(public_path(ltrim($path, '/')));
            $root = realpath(public_path('uploads'));
            if ($full && $root && str_starts_with($full, $root) && is_file($full)) {
                @unlink($full);
            }
        }

        $item->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
