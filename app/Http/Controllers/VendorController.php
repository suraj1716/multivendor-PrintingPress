<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Http\Resources\ProductListResource;
use App\Models\Department;
use App\Models\Product;
use App\Models\Vendor;
use App\services\ProductSearchService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class VendorController extends Controller
{




public function profile(Request $request, Vendor $vendor)
{
    Log::info('Vendor Object:', ['vendor' => $vendor]);

    // Only approved vendors can be viewed
    if ($vendor->status !== 'approved') {
        abort(404);
    }

    // Get filters from request (can be null)
    $departmentId = $request->input('department_id');
    $categoryId = $request->input('category_id');
    $maxPrice = $request->input('max_price');
    $sortBy = $request->input('sort_by');

    // Base query for vendor's products filtered by optional criteria
    $productsQuery = Product::query()
        ->filterApproved($departmentId, $categoryId, $maxPrice)
        ->where('created_by', $vendor->user_id)
        ->with(['department', 'category']);

    // Apply sorting
    if ($sortBy) {
        switch ($sortBy) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'newest':
                $productsQuery->orderBy('created_at', 'desc');
                break;
            default:
                $productsQuery->latest();
        }
    } else {
        $productsQuery->latest();
    }

    // Paginate products
    $paginatedProducts = $productsQuery->paginate(12)->withQueryString();

    // Load only departments that have categories with products by this vendor
    $departments = Department::whereHas('categories.products', function ($query) use ($vendor) {
        $query->where('status', 'published')
              ->where('created_by', $vendor->user_id);
    })
    ->with(['categories' => function ($query) use ($vendor) {
        $query->whereHas('products', function ($subQuery) use ($vendor) {
            $subQuery->where('status', 'published')
                     ->where('created_by', $vendor->user_id);
        });
    }])
    ->get();

    Log::info('Vendor profile filters:', [
        'department_id' => $departmentId,
        'category_id' => $categoryId,
        'max_price' => $maxPrice,
        'sort_by' => $sortBy,
    ]);

    Log::info('Products Query SQL:', [
        'sql' => $productsQuery->toSql(),
        'bindings' => $productsQuery->getBindings(),
    ]);

    // Return with Inertia
    return Inertia::render('Vendor/Profile', [
        'vendor' => $vendor,
        'products' => ProductListResource::collection($paginatedProducts),
        'departments' => $departments,
        'filters' => [
            'department_id' => $departmentId,
            'category_id' => $categoryId,
            'max_price' => $maxPrice,
            'sort_by' => $sortBy,
        ],
    ]);
}



    // public function profile(Request $request, Vendor $vendor)
    // {
    // $keyword = $request->query('keyword');

    //     $products = Product::query()
    //         ->forWebsite()
    //         ->where('created_by', $vendor->user_id)
    //         ->paginate()
    //         ->when($keyword, function ($query, $keyword) {
    //         $query->where(function ($query) use ($keyword) {
    //             $query->where('title', 'LIKE', "%{$keyword}%")
    //                   ->orWhere('description', 'LIKE', "%{$keyword}%");
    //         });
    //     });;

    //     return Inertia::render('Vendor/Profile', [
    //         'vendor' => $vendor,
    //         'products' => ProductListResource::collection($products)
    //     ]);;
    // }

   public function store(Request $request)
{
    $user = $request->user();

    $request->validate(
        [
            'store_name' => [
                'required',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('vendors', 'store_name')->ignore($user->id, 'user_id'),
            ],
            'store_address' => 'nullable',
        ],
        [
            'store_name.regex' => 'store name must only contain lowercase alphanumeric characters and dashes',
        ]
    );

    // If vendor exists, update the details (even if status is pending)
    $vendor = $user->vendor ?: new Vendor();
    $vendor->user_id = $user->id;
    $vendor->store_name = $request->store_name;
    $vendor->store_address = $request->store_address;

    // Only set status to pending if it's a new vendor or was rejected
    if (!$vendor->exists || $vendor->status === VendorStatusEnum::Rejected->value) {
        $vendor->status = VendorStatusEnum::Pending->value;
    }

    $vendor->save();

    // Assign role only if user is becoming vendor for the first time
    if (!$user->hasRole(RolesEnum::Vendor)) {
        $user->assignRole(RolesEnum::Vendor);
    }
}



}
