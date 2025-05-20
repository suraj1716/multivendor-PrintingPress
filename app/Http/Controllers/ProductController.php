<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductListResource;
use App\Models\Category;
use App\Models\Department;
use App\Models\Product;
use App\services\ProductSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{

// HomeController or wherever your home() method is
public function home(Request $request)
{
    $keyword = $request->query('keyword');

  // home method
$products = ProductSearchService::queryWithKeyword($keyword)
    ->paginate(12);

    return Inertia::render('Home', [
        'products' => ProductListResource::collection($products),
        'keyword' => $keyword,
    ]);
}









//   public function home(Request $request)
// {
//     $keyword = $request->query('keyword');

//     $query = Product::query()
//         ->forWebsite() // assuming this is a global scope or local scope you want on all queries
//         ->with(['variationTypes', 'variationTypes.options', 'variations']);

//     if ($keyword) {
//         $query->where(function ($q) use ($keyword) {
//             $q->where('title', 'LIKE', "%{$keyword}%")
//               ->orWhere('description', 'LIKE', "%{$keyword}%");
//         });
//     }

//     $products = $query->paginate(12);

//     return Inertia::render('Home', [
//         'products' => ProductListResource::collection($products),
//     ]);
// }




    //   public function show(Product $product)
    // {
    //     // Load the variations and variationTypes relationships for the product
    //     $product->load(['variations', 'variationTypes']);

    //     // Return an Inertia response with the formatted data
    //     return Inertia::render('Product/Show', [
    //         'product' => new ProductResource($product), // Send product data in a structured format
    //         'variationOptions' => request('option', []), // Send any selected options from the request (defaults to an empty array)
    //     ]);
    // }



    public function show(Product $product)
    {
        $product = Product::with(['variationTypes.options', 'variations']) // ✅ Load everything needed
            ->find($product->id);


        // Return an Inertia response with the formatted data
        return Inertia::render('Product/Show', [
            'product' => new ProductResource($product), // Send product data in a structured format
            'variationOptions' => request('option', []), // Send any selected options from the request (defaults to an empty array)
        ]);
    }



public function byDepartment(Request $request, $slug)
{
    $department = Department::with('categories')->where('slug', $slug)->firstOrFail();

    $filters = [
        'departmentIds' => [$department->id],
        'categoryIds' => $request->filled('category_id') ? [$request->integer('category_id')] : null,
        'price' => $request->float('max_price') ?: null,
    ];

    $keyword = $request->query('keyword');

    $query = Product::with(['user.vendor'])
        ->filterApproved(...array_values($filters));

    if ($keyword) {
        $query->where('title', 'like', "%$keyword%");
    }

    $products = $query->paginate(12)->withQueryString();

    $vendor = optional($products->first()?->user)->vendor;

    if ($vendor) {
        Log::info("Vendor found for department: " . $vendor->store_name);
    } else {
        Log::warning("No products found for department: {$slug}, vendor is null");
    }

    return Inertia::render('Department/Index', [
    'department' => $department,
    'products' => ProductListResource::collection($products),
    'categories' => $department->categories,
    'filters' => [
        'category_id' => $request->query('category_id'),
        'max_price' => $request->query('max_price'),
        'sort_by' => $request->query('sort_by'),
        'keyword' => $request->query('keyword'),
    ],
    'appName' => config('app.name'),
]);

}




}
