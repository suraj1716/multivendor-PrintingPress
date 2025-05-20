<?php

use App\Enums\RolesEnum;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShippingAddressController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\VendorController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile/shipping-addresses', [ShippingAddressController::class, 'index'])->name('shipping.index');
   Route::post('/shipping-addresses', [ShippingAddressController::class, 'store'])->name('shipping-addresses.store');
Route::patch('/shipping-addresses/{address}/default', [ShippingAddressController::class, 'setDefault'])->name('shipping-addresses.set-default');
Route::put('/shipping-addresses/{shippingAddress}', [ShippingAddressController::class, 'update'])->name('shipping-addresses.update');
Route::delete('/shipping-addresses/{id}', [ShippingAddressController::class, 'destroy'])->name('shipping-addresses.destroy');

});
Route::get('/', [ProductController::class, 'home'])->name('dashboard');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('product.show');

Route::get('/search-suggestions', function (Request $request) {
    $keyword = $request->query('keyword');
    $suggestions = \App\Models\Product::query()
        ->forWebsite()
        ->where('title', 'LIKE', "%{$keyword}%")
        ->limit(10)
        ->pluck('title');

    return response()->json($suggestions);
});

Route::get('/d/{department:slug}', [ProductController::class, 'byDepartment'])
->name('product.byDepartment');;

Route::get('/seller/{vendor:store_name}',[VendorController::class, 'profile'])
->name('vendor.profile');

Route::controller(CartController::class)->group(function () {
    Route::get('/cart', 'index')->name('cart.index');
    Route::post('/cart/add/{product}', 'store')->name('cart.store');
    Route::put('/cart/{product}', 'update')->name('cart.update');
    Route::delete('/cart/{product}', 'destroy')->name('cart.destroy');
});

Route::post('/stripe/webhook', [StripeController::class, 'webhook'])->name('stripe.webhook');




// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/orders-history', [OrderController::class, 'index'])->name('orders.history');
Route::get('/orders/{order}', [OrderController::class, 'show']);


    Route::middleware(['verified'])->group(function () {
        Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
        Route::get('/stripe/success', [StripeController::class, 'success'])->name('stripe.success');
        Route::get('/stripe/failure', [StripeController::class, 'failure'])->name('stripe.failure');
        Route::post('/become-a-vendor', [VendorController::class, 'store'])->name('vendor.store');

        Route::post('/stripe/connect', [StripeController::class, 'connect'])
        ->name('stripe.connect')
        ->middleware(['role:' . RolesEnum::Vendor->value]);
    });
});




require __DIR__ . '/auth.php';
