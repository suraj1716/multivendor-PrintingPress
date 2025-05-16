<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductListResource;
use App\Models\Department;
use App\Models\Product;
use App\services\ProductSearchService;
use Illuminate\Http\Request;
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

    public function byDepartment(Request $request, Department $department)
    {
        abort_unless($department->active, 404);

        $keyword = $request->query('keyword');

        $products = Product::query()
            ->forWebsite()
            ->where('department_id', $department->id)
            ->when($keyword, function ($query, $keyword) {
                $query->where(function ($query) use ($keyword) {
                    $query->where('title', 'LIKE', "%{$keyword}%")
                        ->orWhere('description', 'LIKE', "%{$keyword}%");
                });
            })
            ->paginate();

        return Inertia::render('Department/Index', [
            'department' => new DepartmentResource($department),
            'products' => ProductListResource::collection($products),
            'keyword' => $keyword,
        ]);
    }
}
