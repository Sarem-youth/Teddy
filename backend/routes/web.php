<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

// SEO endpoints (NFR-4.3.x)
Route::get('/sitemap.xml', [SitemapController::class, 'index']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);

/*
|--------------------------------------------------------------------------
| SPA catch-all
|--------------------------------------------------------------------------
| Every non-API, non-asset route serves the compiled React application.
| Run the frontend build (npm run build && npm run deploy:backend) to
| generate resources/views/spa.blade.php.
*/
Route::get('/{any?}', function () {
    if (view()->exists('spa')) {
        return view('spa');
    }

    return response(
        '<!doctype html><html><head><meta charset="utf-8"><title>Teddy General Trading</title></head>' .
        '<body style="font-family:sans-serif;padding:4rem;text-align:center;color:#0f2c47">' .
        '<h1>&#128167; Teddy General Trading API is running</h1>' .
        '<p>The storefront build has not been deployed yet.<br>' .
        'Run <code>npm run build &amp;&amp; npm run deploy:backend</code> inside the <code>frontend</code> folder.</p>' .
        '</body></html>',
        200,
        ['Content-Type' => 'text/html']
    );
})->where('any', '^(?!api|up|uploads|assets|storage|sitemap\.xml|robots\.txt).*$');
