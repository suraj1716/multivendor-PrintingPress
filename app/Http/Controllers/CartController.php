<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingAddress;
use App\services\CartService;
use App\services\CartService as ServicesCartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CartService $cartService, Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $shippingAddresses = ShippingAddress::where('user_id', $user->id)
                ->get();
        } else {
            $shippingAddresses = [];
        }

        Log::info('Cart Items Cookie:', ['cookie' => Cookie::get('cartItems')]);
        return Inertia::render('Cart/Index', [
            'cartItems' => $cartService->getCartItemsGrouped(),
            // 'miniCartItems' => $cartService->getMiniCartItems(), // You must add this
            'totalQuantity' => $cartService->getTotalQuantity(), // And this
            'totalPrice' => $cartService->getTotalPrice(),       // And this
            'shippingAddresses' => $shippingAddresses,
            'csrf_token' => csrf_token(),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Product $product, CartService $cartService)
    {
        $optionIds = $request->input('option_ids');  // consistent key

        if (is_array($optionIds)) {
            ksort($optionIds);
        }

        // Set default quantity if not provided
        $request->mergeIfMissing(['quantity' => 1]);

        $data = $request->validate([
            'option_ids' => ['nullable', 'array'],
            'quantity' => 'required|integer|min:1',
        ]);

        $cartService->addItemToCart(
            $product,
            $data['quantity'],
            $data['option_ids'] ?? []
        );



        return back()->with('success', 'Product added to cart successfully.');
    }


    public function update(Request $request, Product $product, CartService $cartService)
    {
        $request->validate([
    'quantity' => ['integer', 'min:1'],
    'attachment_path' => ['nullable', 'string'], // validate attachment path if passed as string
]);

$optionIds = $request->input('option_ids');
$quantity = $request->input('quantity');
$attachmentPath = $request->input('attachment_path'); // get attachment from request

$cartService->updateItemQuantity($product->id, $quantity, $optionIds, $attachmentPath);

return back()->with('success', 'Product quantity and attachment updated successfully.');

    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Product $product, CartService $cartService)
    {
        $optionIds = $request->input('option_ids');
        $cartService->removeItemFromCart($product->id, $optionIds);

        return back()->with('success', 'Product removed from cart successfully.');
    }

    public function checkout(Request $request, CartService $cartService)
    {
        $request->validate([
            'vendor_id' => ['nullable', 'integer'],
            'shipping_address_id' => ['required', 'exists:shipping_addresses,id'],
        ]);

        Stripe::setApiKey(config('app.stripe_secret_key'));

        $shippingAddress = ShippingAddress::where('id', $request->input('shipping_address_id'))
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $vendorId = $request->input('vendor_id');
        $allCartItems = $cartService->getCartItemsGrouped();

        DB::beginTransaction();

        try {
            $checkoutCartItems = $vendorId ? [$allCartItems[$vendorId]] : $allCartItems;
            $orders = [];
            $lineItems = [];

            foreach ($checkoutCartItems as $item) {
                $user = $item['user'];
                $cartItems = $item['items'];

                $order = Order::create([
                    'stripe_session_id' => null,
                    'user_id' => $request->user()->id,
                    'vendor_user_id' => $user['id'],
                    'total_price' => $item['totalPrice'],
                    'status' => OrderStatusEnum::Draft->value,
                    'shipping_address_id' => $shippingAddress->id,
                ]);

                $orders[] = $order;

                foreach ($cartItems as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $cartItem['product_id'],
                        'quantity' => $cartItem['quantity'],
                        'price' => $cartItem['price'],
                        'variation_type_option_ids' => $cartItem['option_ids'],
                        'attachment_path' => $cartItem['attachment_path'] ?? null,
    'attachment_name' => $cartItem['attachment_name'] ?? null,
                    ]);

                    $description = collect($cartItem['options'])->map(fn($item) => "{$item['type']['name']}::{$item['name']}")->implode(',');

                    $productData = [
                        'name' => $cartItem['title'],
                        // 'images' => [$cartItem['image_url']],
                    ];

                    if (!empty($description)) {
                        $productData['description'] = $description;
                    }


                    $lineItem = [
                        'price_data' => [
                            'currency' => config('app.currency'),
                            'product_data' => $productData,
                            'unit_amount' => $cartItem['price'] * 100,
                        ],
                        'quantity' => $cartItem['quantity'],
                    ];

                    $lineItems[] = $lineItem;
                }
            }

            $session = Session::create([
                'customer_email' => $request->user()->email,
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => route('stripe.success') . "?session_id={CHECKOUT_SESSION_ID}",
                'cancel_url' => route('stripe.failure'),
            ]);

            foreach ($orders as $order) {
                $order->stripe_session_id = $session->id;
                $order->save();
            }

            DB::commit();
            return redirect($session->url);
        } catch (\Exception $e) {
            Log::error($e);
            DB::rollBack();
            return back()->with('error', $e->getMessage() ?: 'Something went wrong');
        }
    }
}
