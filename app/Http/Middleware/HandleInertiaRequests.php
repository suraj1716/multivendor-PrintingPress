<?php

namespace App\Http\Middleware;

use App\Http\Resources\AuthUserResource;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
   public function share(Request $request): array
{

    $dpts = Department::whereHas('categories.products')
        ->withCount(['products as products_count'])
        ->get(['id', 'name', 'slug']);


    $cartService = app(CartService::class);
    $totalQuantity = $cartService->getTotalQuantity();
    $totalPrice = $cartService->getTotalPrice();
    $cartItems = $cartService->getCartItems();

    return array_merge(parent::share($request), [
        'appName' => config('app.name'),
        'csrf_token' => csrf_token(),
        'auth' => [
            'user' => $request->user() ? new AuthUserResource($request->user()) : null,
        ],
        'ziggy' => fn() => [
            ...(new Ziggy)->toArray(),
            'location' => $request->url(),
        ],
        'success' => [
            'message' => session('success'),
            'time' => microtime(true),
        ],
        'totalPrice' => $totalPrice,
        'totalQuantity' => $totalQuantity,
        'miniCartItems' => $cartItems,
        'dpts' => $dpts->map(function ($department) {
            return [
                'id' => $department->id,
                'name' => $department->name,
                'slug' => $department->slug,
                'productsCount' => $department->products_count,
            ];
        }),
        'error' => session('error'),
    ]);
}

}
