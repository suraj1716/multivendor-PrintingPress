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



    public function home(Request $request)
    {
        $keyword = $request->query('keyword');

        // Grab every department that actually has products
        $departments = Department::whereHas('categories.products', fn($q) => $q->filterApproved())
            ->with(['categories' => fn($q) => $q->whereHas('products')])
            ->get();

        $products = ProductSearchService::queryWithKeyword($keyword)->paginate(12);

        return Inertia::render('Home', [
            'products'    => ProductListResource::collection($products),
            'keyword'     => $keyword,
            'departments' => $departments,
            'department'  => null,          // No single department selected
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
        $department = Department::where('slug', $slug)->firstOrFail();

        $categoryId = $request->integer('category_id');
        $maxPrice = $request->float('max_price');
        $keyword = $request->query('keyword');
        $sortBy = $request->query('sort_by');

        // Product query filtered by department and optionally category, keyword, max price
        $query = Product::query()
            ->whereHas('category', function ($q) use ($department) {
                $q->where('department_id', $department->id);
            })
            ->filterApproved(
                [$department->id],
                $categoryId ? [$categoryId] : null,
                $maxPrice
            )
            ->with(['category', 'department']);

        if ($keyword) {
            $query->where('title', 'like', "%{$keyword}%");
        }

        // Sorting logic
        if ($sortBy) {
            switch ($sortBy) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->latest();
            }
        } else {
            $query->latest();
        }

        $products = $query->paginate(12)->withQueryString();

        // Get categories for selected department that have products
        $categories = $department->categories()
            ->whereHas('products', function ($q) use ($categoryId, $maxPrice, $keyword, $department) {
                $q->filterApproved([$department->id], $categoryId ? [$categoryId] : null, $maxPrice);
                if ($keyword) {
                    $q->where('title', 'like', "%{$keyword}%");
                }
            })
            ->get();





        // // Get all departments that have products (to filter out empty ones)
        $departments = Department::whereHas('categories.products', function ($query) {
            $query->filterApproved();  // only categories with approved products
        })
            ->withCount(['products as products_count' => function ($query) {
                $query->filterApproved();  // count only approved products per department
            }])
            ->with(['categories' => function ($query) {
                $query->whereHas('products', function ($q2) {
                    $q2->filterApproved();  // eager load only categories with approved products
                });
            }])
            ->get();




        if ($categories->isEmpty()) {
            Log::warning("No categories with products found for department '{$slug}'.");
        } else {
            foreach ($categories as $cat) {
                Log::info("Category with products found:", [
                    'category_id' => $cat->id,
                    'category_name' => $cat->name,
                ]);
            }
        }

        return Inertia::render('Department/Index', [
            'department' => $department,
            'products' => ProductListResource::collection($products),
            'categories' => $categories,
            'departments' => $departments,
            'filters' => [
                'category_id' => $categoryId,
                'max_price' => $maxPrice,
                'sort_by' => $sortBy,
                'keyword' => $keyword,
                'department_id' => $department->id,
            ],
            'appName' => config('app.name'),
        ]);
    }



    public function search(Request $request)
    {
        // Get departments that have categories with products (filtered by forWebsite)
        $departments = Department::whereHas('categories.products', function ($query) {
            $query->forWebsite();
        })
            ->with(['categories' => function ($query) {
                $query->whereHas('products', function ($q) {
                    $q->forWebsite();
                });
            }])
            ->get();

        $keyword = $request->query('keyword');
        $categoryId = $request->query('category_id');
        $maxPrice = $request->query('max_price');
        $sortBy = $request->query('sort_by');

        $query = Product::query()
            ->forWebsite()
            ->with(['user.vendor', 'department']); // eager load user and vendor

        if ($keyword) {
            $query->where('title', 'LIKE', "%{$keyword}%");
        }
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        if ($sortBy) {
            if ($sortBy === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($sortBy === 'price_desc') {
                $query->orderBy('price', 'desc');
            } elseif ($sortBy === 'newest') {
                $query->orderBy('created_at', 'desc');
            }
        }

        $products = $query->paginate(12)->withQueryString();

        // Optional: debugging info
        // foreach ($products as $product) {
        //     logger()->info('Product vendor debug', [
        //         'product_id' => $product->id,
        //         'product_title' => $product->title,
        //         'vendor' => $product->user->vendor ? $product->user->vendor->toArray() : 'No vendor loaded',
        //     ]);
        // }

        return Inertia::render('Shop/ListProducts', [
            'products' => ProductListResource::collection($products),
            'filters' => [
                'keyword' => $keyword,
                'category_id' => $categoryId,
                'max_price' => $maxPrice,
                'sort_by' => $sortBy,
            ],
            'departments' => $departments,  // send filtered departments only
        ]);
    }
}
