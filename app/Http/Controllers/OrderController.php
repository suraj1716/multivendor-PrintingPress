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
        // Get all orders for the authenticated user
        $orders = Auth::user()
            ->orders()
            ->with(['orderItems.product.variationTypes.options'])
            ->latest()
            ->get();

        // Return the orders view with enriched order data
        return Inertia::render('Order/OrdersHistory', [
            'orders' => OrderViewResource::collection($orders),
        ]);
    }


    public function show($orderId)
    {
        // Fetch a single order by ID for the authenticated user
        $order = Auth::user()
            ->orders()
            ->with(['vendorUser.vendor', 'orderItems.product'])
            ->where('id', $orderId)
            ->firstOrFail();

        return new OrderViewResource($order);
    }
}
