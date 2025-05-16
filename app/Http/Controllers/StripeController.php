<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Resources\OrderViewResource;
use App\Mail\CheckoutCompleted;
use App\Mail\NewOrderMail;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeController extends Controller
{
    public function success(Request $request)
    {
        $user = Auth::user();


          // $user=auth()->user();
        $session_id=$request->get('session_id');

        // $orders=Order::where('stripe_session_id', $session_id)
        // ->get();
    $orders = Order::where('stripe_session_id', $session_id)
    ->with('vendor') // Eager load the vendor relationship
    ->paginate(50);

        if($orders->count()===0){
            abort(404);
        }

        foreach($orders as $order){
            if($order->user_id !== $user->id){
                abort(403);
            }
        }

        return Inertia::render('Stripe/Success',[
            'orders'=>OrderViewResource::collection($orders)->collection->toArray()
        ]);

    }

    public function failure()
    {
        return response()->json(['message' => 'Payment failed.']);
    }

    public function webhook(Request $request)
    {
        Log::info('Webhook hit');
        $stripe = new StripeClient(config('app.stripe_secret_key'));
        $endpointSecret = config('app.stripe_webhook_secret');
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $event = null;

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (UnexpectedValueException $e) {
            Log::error('Invalid payload: ' . $e->getMessage());
            return response('Invalid payload', 400);
        } catch (SignatureVerificationException $e) {
            Log::error('Invalid signature: ' . $e->getMessage());
            return response('Invalid signature', 400);
        }

        Log::info('Stripe webhook received: ' . $event->type);

        switch ($event->type) {
            case 'charge.updated':
    try {
        $charge = $event->data->object;

        $transactionId = $charge['balance_transaction'] ?? null;
        $paymentIntent = $charge['payment_intent'] ?? null;

        if (!$transactionId || !$paymentIntent) {
            Log::warning('Missing transactionId or paymentIntent in charge.updated event.');
            break;
        }

        $balanceTransaction = $stripe->balanceTransactions->retrieve($transactionId);
        $totalAmount = $balanceTransaction['amount'];
        $stripeFee = 0;

        foreach ($balanceTransaction['fee_details'] as $feeDetail) {
            if ($feeDetail['type'] === 'stripe_fee') {
                $stripeFee = $feeDetail['amount'];
            }
        }

        $platformFeePercent = config('app.platform_fee_pct');

       $orders = Order::where('payment_intent', $paymentIntent)
    ->with(['user', 'vendorUser.Vendor', 'orderItems.product']) // Eager load relationships
    ->get();


if ($orders->isEmpty()) {
    Log::warning("No orders found for payment_intent: $paymentIntent");
    return response('No orders found', 404);
}

foreach ($orders as $order) {
    $vendorShare = $order->total_price / $totalAmount;

    $order->online_payment_comission = $vendorShare * $stripeFee;
    $order->website_payment_comission = (($order->total_price - $order->online_payment_comission) / 100) * $platformFeePercent;
    $order->vendor_subtotal = $order->total_price - $order->online_payment_comission - $order->website_payment_comission;

    $order->save();

    Mail::to($order->VendorUser)->send(new NewOrderMail($order));
}

// Now it's safe to access $orders[0]
Mail::to($orders[0]->user)->send(new CheckoutCompleted($orders));

    } catch (\Exception $e) {
        Log::error('Error processing charge.updated: ' . $e->getMessage());
        return response('Webhook error: ' . $e->getMessage(), 500);
    }
    break;


            case 'checkout.session.completed':
                $session = $event->data->object;
                $paymentIntent = $session['payment_intent'];

                $orders = Order::with('orderItems')
                    ->where('stripe_session_id', $session['id'])
                    ->get();

                $productsToDeleteFromCart = [];
                $userId = null;

                foreach ($orders as $order) {
                    $order->payment_intent = $paymentIntent;
                    $order->status = OrderStatusEnum::Paid;
                    $order->save();


                    $userId = $order->user_id;

                    $productsToDeleteFromCart = array_merge(
                        $productsToDeleteFromCart,
                        $order->orderItems->pluck('product_id')->toArray()
                    );

                    foreach ($order->orderItems as $orderItem) {
                        $options = $orderItem->variation_type_option_ids;
                        $product = $orderItem->product;
                        if ($options) {
                            sort($options);
                            $variation = $product->variations()
                                ->where('variation_type_option_ids', $options)
                                ->first();

                            if ($variation && $variation->quantity !== null) {
                                $variation->quantity -= $orderItem->quantity;
                                $variation->save();
                            }
                        } elseif ($product->quantity !== null) {
                            $product->quantity -= $orderItem->quantity;
                            $product->save();
                        }
                    }
                }

                if ($userId && !empty($productsToDeleteFromCart)) {
                    CartItem::query()
                        ->where('user_id', $userId)
                        ->whereIn('product_id', $productsToDeleteFromCart)
                        ->where('saved_for_later', false)
                        ->delete();
                }

                break;

            default:
                Log::info('Unhandled event type: ' . $event->type);
                break;
        }
Log::debug('Event payload', ['event' => $event]);

        return response('', 200);
    }

public function connect()
{
     $user = Auth::user();
    if(!$user->getStripeAccountId()){
        $user->createStripeAccount(['type'=>'express']);
    }

    if(!$user->isStripeAccountActive()){
        return redirect($user->getstripeAccountLink());
    }

    return back()->with('success','Your account is already connected');
}

}
