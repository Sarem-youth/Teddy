<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ExportController as AdminExportController;
use App\Http\Controllers\Api\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public storefront API
|--------------------------------------------------------------------------
*/
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/settings', [SettingController::class, 'publicSettings']);
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:8,1');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:15,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });
});

/*
|--------------------------------------------------------------------------
| Authenticated customer routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Persistent cart (REQ-3.2.1)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::post('/cart/sync', [CartController::class, 'sync']);
    Route::put('/cart/{item}', [CartController::class, 'update']);
    Route::delete('/cart/{item}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders & checkout (REQ-3.2.3, REQ-3.4.1)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    // Address book (REQ-3.3.2)
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Administrative API — protected by RBAC middleware (NFR-4.2.3)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::post('/products/bulk', [AdminProductController::class, 'bulk']);
    Route::get('/products/{product}', [AdminProductController::class, 'show']);
    Route::post('/products/{product}', [AdminProductController::class, 'update']); // POST for multipart updates
    Route::patch('/products/{product}/quick', [AdminProductController::class, 'quickUpdate']);
    Route::post('/products/{product}/duplicate', [AdminProductController::class, 'duplicate']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'destroyImage']);
    Route::put('/products/{product}/images/{image}/primary', [AdminProductController::class, 'makePrimaryImage']);

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{order}', [AdminOrderController::class, 'update']);

    Route::get('/customers', [AdminCustomerController::class, 'index']);
    Route::get('/customers/{customer}', [AdminCustomerController::class, 'show']);

    Route::get('/messages', [AdminMessageController::class, 'index']);
    Route::put('/messages/{message}/read', [AdminMessageController::class, 'markRead']);
    Route::delete('/messages/{message}', [AdminMessageController::class, 'destroy']);

    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::put('/settings', [AdminSettingController::class, 'update']);

    // Media gallery manager
    Route::get('/gallery', [AdminGalleryController::class, 'index']);
    Route::post('/gallery', [AdminGalleryController::class, 'store']);
    Route::put('/gallery/{item}', [AdminGalleryController::class, 'update']);
    Route::delete('/gallery/{item}', [AdminGalleryController::class, 'destroy']);

    // CSV exports
    Route::get('/export/orders', [AdminExportController::class, 'orders']);
    Route::get('/export/products', [AdminExportController::class, 'products']);
    Route::get('/export/customers', [AdminExportController::class, 'customers']);
});
