<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Http\Resources\ProductListResource;
use App\Models\Product;
use App\Models\Vendor;
use App\services\ProductSearchService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VendorController extends Controller
{


    // VendorController profile() method
    public function profile(Request $request, Vendor $vendor)
    {dd($vendor->status);
  if ($vendor->status === VendorStatusEnum::Rejected->value) {
        abort(404); // or redirect or show custom message if needed
    }

        $keyword = $request->query('keyword');

        $products = ProductSearchService::queryWithKeyword($keyword, function ($query) use ($vendor) {
            $query->where('created_by', $vendor->user_id);
        })->paginate(12);

        return Inertia::render('Vendor/Profile', [
            'vendor' => $vendor,
            'products' => ProductListResource::collection($products),
            'keyword' => $keyword,
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
