<h2>Order Refund Notification</h2>
<p>Dear {{ $order->vendorUser->name }},</p>
<p>A refund has been issued for Order #{{ $order->id }}.</p>
<p><strong>Refunded Amount:</strong> ${{ number_format($order->refund_amount, 2) }}</p>
<p>Please check your dashboard for details.</p>
