<?php

namespace App\Http\Controllers;

namespace App\Http\Controllers;

use App\Http\Resources\OrderViewResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
   public function index()
{
    $orders = Auth::user()
        ->orders()
        ->with([
            'orderItems.product.variationTypes.options',
            'booking' // will return null for orders without bookings
        ])
        ->latest()
        ->get();

    return Inertia::render('Order/OrdersHistory', [
        'orders' => OrderViewResource::collection($orders),
    ]);
}



public function show($orderId)
{
   $order = Order::with([
    'orderItems.product',
    'orderItems.booking', // Make sure this line is added
    'vendor.vendor',
    'shippingAddress'
])->findOrFail($orderId);

    return new OrderViewResource($order);
}

}
