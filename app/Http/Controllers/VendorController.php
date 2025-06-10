<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Http\Resources\ProductListResource;
use App\Http\Resources\VendorUserResource;
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



        // Return with Inertia
        return Inertia::render('Vendor/Profile', [
            'vendor' => new VendorUserResource($vendor->user),
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

        // Validate input
        $validated = $request->validate(
            [
                'store_name' => [
                    'required',
                    'regex:/^[a-z0-9-]+$/',
                    Rule::unique('vendors', 'store_name')->ignore($user->id, 'user_id'),
                ],
                'store_address' => 'nullable|string',
                'start_time' => 'required|string',
                'end_time' => 'required|string',
                'slot_interval' => 'required|numeric|min:5',
                'recurring_closed_days' => 'nullable|array',
                'closed_dates' => 'nullable|array',
            ],
            [
                'store_name.regex' => 'Store name must only contain lowercase alphanumeric characters and dashes.',
            ]
        );

        // Convert weekday names to numeric strings
        $dayToIndex = [
            'sunday'    => '0',
            'monday'    => '1',
            'tuesday'   => '2',
            'wednesday' => '3',
            'thursday'  => '4',
            'friday'    => '5',
            'saturday'  => '6',
        ];

        $rawDays = $validated['recurring_closed_days'] ?? [];

        $convertedDays = array_values(array_filter(array_unique(array_map(function ($day) use ($dayToIndex) {
            $dayLower = strtolower(trim($day));
            return $dayToIndex[$dayLower] ?? (ctype_digit($dayLower) ? $dayLower : null);
        }, $rawDays)), function ($val) {
            return $val !== null && $val !== '';
        }));


        // Create or update vendor
        $vendor = $user->vendor ?: new Vendor();
        $vendor->user_id = $user->id;
        $vendor->store_name = $validated['store_name'];
        $vendor->store_address = $validated['store_address'] ?? null;
        $vendor->business_start_time = $validated['start_time'];
        $vendor->business_end_time = $validated['end_time'];
        $vendor->slot_interval_minutes = $validated['slot_interval'];

        // Save cleaned recurring_closed_days and closed_dates
        $vendor->recurring_closed_days = $convertedDays;


        $vendor->closed_dates = array_filter(
            $validated['closed_dates'] ?? [],
            fn($date) => is_string($date)
        );

        // Set status to pending if new or rejected
        if (!$vendor->exists || $vendor->status === VendorStatusEnum::Rejected->value) {
            $vendor->status = VendorStatusEnum::Pending->value;
        }

        $vendor->save();

        // Assign vendor role if not already
        if (!$user->hasRole(RolesEnum::Vendor)) {
            $user->assignRole(RolesEnum::Vendor);
        }

        return back()->with('success', 'Vendor profile saved successfully.');
    }
}
