<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\services\CartService;
use App\services\CartService as ServicesCartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CartService $cartService)
    {
        //  dd(Cookie::get('cartItems'));
        return Inertia::render('Cart/Index', [
            'cartItems' => $cartService->getCartItemsGrouped(),

        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Product $product, CartService $cartService)
    {
   $optionIds = $request->input('options_ids');

if (is_array($optionIds)) {
    ksort($optionIds);
}
        $request->mergeIfMissing([
            'quantity'
        ]);
        $data = $request->validate([
            'option_ids' => ['nullable', 'array'],
            'quantity' => 'required|integer|min:1',
        ]);

        $cartService->addItemToCart(
            $product,
            $data['quantity'],
            $data['option_ids']
                ?? []
        );


        return back()->with('success', 'Product added to cart successfully.');
    }

    public function update(Request $request, Product $product, CartService $cartService)
    {
        $request->validate([
            'quantity' => ['integer' , 'min:1'],
        ]);

        $optionIds=$request->input('option_ids');
        $quantity=$request->input('quantity');

        $cartService->updateItemQuantity($product->id, $quantity, $optionIds);

        return back()->with('success', 'Product quantity updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Product $product, CartService $cartService)
    {
        $optionIds=$request->input('option_ids');
        $cartService->removeItemFromCart($product->id, $optionIds);

        return back()->with('success', 'Product removed from cart successfully.');

    }

public function checkout(){

}

}
