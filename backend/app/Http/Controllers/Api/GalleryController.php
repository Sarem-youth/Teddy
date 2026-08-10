<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class GalleryController extends Controller
{
    /**
     * Public gallery feed — photos & videos of real projects.
     */
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->input('per_page', 24), 1), 80);
        $page = max((int) $request->input('page', 1), 1);

        $query = GalleryItem::query()->where('is_active', true);

        if (in_array($request->input('type'), ['image', 'video'], true)) {
            $query->where('type', $request->input('type'));
        }

        if ($query->count() > 0) {
            $paginated = $query
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->paginate($perPage, ['id', 'type', 'path', 'thumb_path', 'title', 'is_featured'], 'page', $page);

            $items = collect($paginated->items())->map(function ($item) {
                $item->path = asset($item->path);
                $item->thumb_path = $item->thumb_path ? asset($item->thumb_path) : null;

                return $item;
            })->values();

            return response()->json([
                'items' => $items,
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'has_more' => $paginated->hasMorePages(),
                ],
            ]);
        }

        $items = $this->fromDirectories($request->input('type'));

        $total = $items->count();
        $slice = $items->forPage($page, $perPage)->values();

        return response()->json([
            'items' => $slice,
            'meta' => [
                'current_page' => $page,
                'last_page' => (int) max(1, ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'has_more' => ($page * $perPage) < $total,
            ],
        ]);
    }

    private function fromDirectories(?string $type): \Illuminate\Support\Collection
    {
        $media = collect();

        if ($type === null || $type === 'image') {
            $imageDirs = [
                public_path('uploads/gallery/photos'),
                public_path('photos'),
            ];

            foreach ($imageDirs as $dir) {
                if (! is_dir($dir)) {
                    continue;
                }

                foreach (File::files($dir) as $file) {
                    $mime = (string) $file->getMimeType();
                    if (! str_starts_with($mime, 'image/')) {
                        continue;
                    }

                    $publicPath = $this->toPublicUrl($file->getPathname());
                    if (! $publicPath) {
                        continue;
                    }

                    $media->push([
                        'id' => 'file-' . md5($publicPath),
                        'type' => 'image',
                        'path' => asset($publicPath),
                        'thumb_path' => asset($publicPath),
                        'title' => pathinfo($file->getFilename(), PATHINFO_FILENAME),
                        'is_featured' => false,
                        'mtime' => $file->getMTime(),
                    ]);
                }
            }
        }

        if ($type === null || $type === 'video') {
            $videoDir = public_path('uploads/gallery/videos');
            if (is_dir($videoDir)) {
                foreach (File::files($videoDir) as $file) {
                    $mime = (string) $file->getMimeType();
                    if (! str_starts_with($mime, 'video/')) {
                        continue;
                    }

                    $publicPath = $this->toPublicUrl($file->getPathname());
                    if (! $publicPath) {
                        continue;
                    }

                    $media->push([
                        'id' => 'file-' . md5($publicPath),
                        'type' => 'video',
                        'path' => asset($publicPath),
                        'thumb_path' => null,
                        'title' => pathinfo($file->getFilename(), PATHINFO_FILENAME),
                        'is_featured' => false,
                        'mtime' => $file->getMTime(),
                    ]);
                }
            }
        }

        return $media
            ->sortByDesc('mtime')
            ->values()
            ->map(function ($item) {
                unset($item['mtime']);

                return $item;
            });
    }

    private function toPublicUrl(string $absolutePath): ?string
    {
        $publicRoot = realpath(public_path());
        $real = realpath($absolutePath);

        if (! $publicRoot || ! $real || ! str_starts_with($real, $publicRoot)) {
            return null;
        }

        $relative = ltrim(str_replace($publicRoot, '', $real), DIRECTORY_SEPARATOR);

        return '/' . str_replace('\\', '/', $relative);
    }
}
