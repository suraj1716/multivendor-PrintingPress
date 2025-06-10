<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductListResource;
use App\Models\Category;
use App\Models\CategoryGroup;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{

    public function show(Category $category)
    {
        $category->load(['department', 'products.user', 'products.department', 'products.options']); // eager load relations for products

        // Get products filtered by category with necessary relations (e.g. user, department, options)
        $products = Product::with(['user', 'department', 'options'])
            ->where('category_id', $category->id)
            ->get();

      $groups = CategoryGroup::with([
    'categories' => function ($query) {
        $query->select('id', 'name', 'image', 'department_id', 'parent_id', 'active') // include image
              ->with('department');
    }
])->where('active', true)->get();


        // dd($products->map(function ($product) {
        //     return [
        //         'id' => $product->id,
        //         'title' => $product->title,
        //         'first_image_url' => $product->getImages()->first()?->getUrl('thumb'),
        //         'image_count' => $product->getImages()->count(),
        //     ];
        // }));
        return Inertia::render('Category/Show', [
            'category' => $category,
            'department' => $category->department,
            'products' => ProductListResource::collection($products),
            'categoryGroups' => $groups,
        ]);
    }
}
