<x-mail::message>
# 🛒 New Order Alert!

{{-- Access the single order --}}
<x-mail::panel>
    🔖 **Order ID:** {{ $order->id }}
    👤 **Customer Name:** {{ $order->customer_name }}
    🗓 **Order Date:** {{ $order->created_at->format('F j, Y - g:i A') }}
</x-mail::panel>

## 📦 Ordered Items:

<table width="100%" style="border-collapse: collapse;">
    <thead>
        <tr>
            <th align="left" style="border-bottom: 1px solid #ddd; padding: 8px;">Product</th>
            <th align="center" style="border-bottom: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th align="right" style="border-bottom: 1px solid #ddd; padding: 8px;">Price</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($order->orderItems as $orderItem)
        <tr>
            <td style="padding: 8px;">
                <img src="{{ $orderItem->product->getImageForOptions($orderItem->variation_type_option_ids)}}" alt="{{ $orderItem->product->name }}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                {{ $orderItem->product->title }}
            </td>
            <td align="center" style="padding: 8px;">{{ $orderItem->quantity }}</td>
            <td align="right" style="padding: 8px;">${{ number_format($orderItem->price, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

---

**🧾 Total Price:** <strong>${{ number_format($order->total_price, 2) }}</strong>

🔍 View Full Order

<x-mail::table>
    <table>
        <tbody>
        <tr>
            <td>Payment Processing Fee</td>
            <td>{{ \Illuminate\Support\Number::currency($order->online_payment_comission ?: 0) }}</td>
        </tr>

        <tr>
            <td>Platform Fee</td>
            <td>{{ \Illuminate\Support\Number::currency($order->website_payment_comission ?: 0) }}</td>
        </tr>

        <tr>
            <td>Your Earnings</td>
            <td>{{ \Illuminate\Support\Number::currency($order->vendor_subtotal ?: 0) }}</td>
        </tr>
        </tbody>
    </table>
</x-mail::table>

If you have any questions or need assistance, feel free to reach out to us.

Thanks for being a trusted partner,
**{{ config('app.name') }} Team**

</x-mail::message>
