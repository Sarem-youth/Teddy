<?php

namespace Database\Seeders;

use App\Models\GalleryItem;
use Illuminate\Database\Seeder;

/**
 * Seeds the public gallery with SHOWROOM / warehouse shots and videos.
 * Product photos are handled by RealCatalogSeeder — only atmosphere
 * shots that don't map to a single product belong here.
 */
class GallerySeeder extends Seeder
{
    private const SHOWROOM_PHOTOS = [
        'g010' => 'Sanitary ware showroom — Merkato',
        'g023' => 'Premium display corner',
        'g032' => 'Genuine brands, factory-sealed stock',
        'g045' => 'Bulk stock ready for dispatch',
        'g046' => 'Product display',
        'g057' => 'Precision instruments section',
        'g081' => 'Machinery & equipment aisle',
        'g090' => 'Brass & specialty section',
        'g092' => 'Container arrivals — direct imports',
        'g094' => 'Fresh container stock',
        'g098' => 'Technical specifications on file',
    ];

    public function run(): void
    {
        $sort = 0;

        foreach (glob(public_path('uploads/gallery/videos/*.mp4')) ?: [] as $file) {
            $name = basename($file);
            $poster = public_path('uploads/gallery/videos/' . pathinfo($name, PATHINFO_FILENAME) . '.jpg');

            GalleryItem::updateOrCreate(
                ['path' => '/uploads/gallery/videos/' . $name],
                [
                    'type' => 'video',
                    'thumb_path' => is_file($poster)
                        ? '/uploads/gallery/videos/' . pathinfo($name, PATHINFO_FILENAME) . '.jpg'
                        : null,
                    'title' => 'Inside Teddy General Trading',
                    'is_featured' => $sort === 0,
                    'is_active' => true,
                    'sort_order' => $sort++,
                ]
            );
        }

        foreach (self::SHOWROOM_PHOTOS as $name => $title) {
            if (! is_file(public_path("uploads/gallery/photos/{$name}.jpg"))) {
                continue;
            }

            GalleryItem::updateOrCreate(
                ['path' => "/uploads/gallery/photos/{$name}.jpg"],
                [
                    'type' => 'image',
                    'thumb_path' => is_file(public_path("uploads/gallery/thumbs/{$name}.jpg"))
                        ? "/uploads/gallery/thumbs/{$name}.jpg"
                        : "/uploads/gallery/photos/{$name}.jpg",
                    'title' => $title,
                    'is_active' => true,
                    'sort_order' => $sort++,
                ]
            );
        }
    }
}
