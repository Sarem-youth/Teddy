<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;

/**
 * NFR-4.3.2 dynamic sitemap provisioning.
 */
class SitemapController extends Controller
{
    public function index()
    {
        $base = rtrim(config('app.url'), '/');

        $urls = [
            ['loc' => $base . '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => $base . '/shop', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => $base . '/about', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $base . '/contact', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach (Category::where('is_active', true)->get() as $category) {
            $urls[] = [
                'loc' => $base . '/shop?category=' . $category->slug,
                'priority' => '0.7',
                'changefreq' => 'weekly',
            ];
        }

        foreach (Product::active()->get(['slug', 'updated_at']) as $product) {
            $urls[] = [
                'loc' => $base . '/product/' . $product->slug,
                'priority' => '0.8',
                'changefreq' => 'weekly',
                'lastmod' => $product->updated_at?->toAtomString(),
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>' . htmlspecialchars($url['loc'], ENT_XML1) . "</loc>\n";
            if (! empty($url['lastmod'])) {
                $xml .= '    <lastmod>' . $url['lastmod'] . "</lastmod>\n";
            }
            $xml .= '    <changefreq>' . $url['changefreq'] . "</changefreq>\n";
            $xml .= '    <priority>' . $url['priority'] . "</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robots()
    {
        $base = rtrim(config('app.url'), '/');

        $lines = [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /account',
            'Disallow: /checkout',
            'Disallow: /cart',
            'Allow: /',
            '',
            'Sitemap: ' . $base . '/sitemap.xml',
        ];

        return response(implode(PHP_EOL, $lines), 200, ['Content-Type' => 'text/plain']);
    }
}
