<?php

namespace App\Models;

// app/Models/Booking.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'booking_date', 'start_time', 'end_time', 'status', 'vendor_id'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public static function isSlotAvailable($productId, $date, $start, $end)
{
    return !self::where('product_id', $productId)
        ->where('booking_date', $date)
        ->where(function ($query) use ($start, $end) {
            $query->whereBetween('start_time', [$start, $end])
                  ->orWhereBetween('end_time', [$start, $end]);
        })
        ->exists();
}

}
