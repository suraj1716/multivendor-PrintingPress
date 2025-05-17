<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderViewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{


public function index()
{
    $orders = Auth::user()
        ->orders()
        ->with(['vendorUser', 'orderItems.product'])
        ->latest()
        ->get();

    return Inertia::render('Order/OrdersHistory', [
    'orders' => OrderViewResource::collection($orders),
]);
}

}
