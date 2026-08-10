<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        $source = $request->input('source', 'photos');

        if ($source === 'photos') {
            $this->syncRepositoryPhotos();
            $dir = public_path('photos');
            $prefix = '/photos/';
        } else {
            $dir = public_path('uploads/products');
            $prefix = '/uploads/products/';
        }

        if (! is_dir($dir)) {
            return response()->json(['files' => []]);
        }

        $files = collect(File::files($dir))
            ->filter(function ($file) {
                $mime = (string) $file->getMimeType();
                $ext = strtolower($file->getExtension());

                return str_starts_with($mime, 'image/') || in_array($ext, ['svg', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'], true);
            })
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->values()
            ->map(function ($file) use ($prefix) {
                return [
                    'name' => $file->getFilename(),
                    'url' => $prefix . $file->getFilename(),
                    'size' => $file->getSize(),
                    'updated_at' => date(DATE_ATOM, $file->getMTime()),
                ];
            });

        return response()->json(['files' => $files]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:6144'],
        ]);

        $dir = public_path('uploads/products');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $file = $data['file'];
        $filename = now()->timestamp . '-' . Str::random(8) . '.' . strtolower($file->getClientOriginalExtension());
        $file->move($dir, $filename);

        return response()->json([
            'file' => [
                'name' => $filename,
                'url' => '/uploads/products/' . $filename,
            ],
        ], 201);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'url' => ['required', 'string', 'max:500'],
        ]);

        $url = (string) $data['url'];
        $allowed = ['/uploads/products/', '/photos/'];

        if (! collect($allowed)->contains(fn ($prefix) => str_starts_with($url, $prefix))) {
            return response()->json(['message' => 'Invalid file path.'], 422);
        }

        $full = public_path(ltrim($url, '/'));
        $real = realpath($full);
        $public = realpath(public_path());

        if (! $real || ! $public || ! str_starts_with($real, $public) || ! is_file($real)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        @unlink($real);

        return response()->json(['message' => 'File deleted.']);
    }

    private function syncRepositoryPhotos(): void
    {
        $repoPhotos = base_path('../photos');
        $publicPhotos = public_path('photos');

        if (! is_dir($repoPhotos)) {
            return;
        }

        if (! is_dir($publicPhotos)) {
            mkdir($publicPhotos, 0755, true);
        }

        foreach (File::files($repoPhotos) as $file) {
            $mime = (string) $file->getMimeType();
            $ext = strtolower($file->getExtension());
            if (! str_starts_with($mime, 'image/') && ! in_array($ext, ['svg', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'], true)) {
                continue;
            }

            $target = $publicPhotos . DIRECTORY_SEPARATOR . $file->getFilename();
            if (! is_file($target)) {
                File::copy($file->getPathname(), $target);
            }
        }
    }
}
