<h2>Refund Processed</h2>
<p>Dear {{ $order->user->name }},</p>
<p>Your refund for Order #{{ $order->id }} has been processed successfully.</p>
<p><strong>Amount Refunded:</strong> ${{ number_format($order->refund_amount, 2) }}</p>
<p>Thank you for shopping with us!</p>
