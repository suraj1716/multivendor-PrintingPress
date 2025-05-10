<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductListResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function home()
    {
        // Fetch products from the database
        $products = Product::query()
        ->published()
        ->paginate(12);

        // Return a view with the products
        return Inertia::render('Home', [
            'products' => ProductListResource::collection($products),
        ]);
    }


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
    $product = Product::with('variations')->find($product->id);


    // Return an Inertia response with the formatted data
    return Inertia::render('Product/Show', [
        'product' => new ProductResource($product), // Send product data in a structured format
        'variationOptions' => request('option', []), // Send any selected options from the request (defaults to an empty array)
    ]);
}


}
