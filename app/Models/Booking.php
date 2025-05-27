<?php

namespace App\Models;

// app/Models/Booking.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',  'booking_date', 'time_slot'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vendor()
{
    return $this->belongsTo(User::class, 'vendor_id');
}
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

//     public static function isSlotAvailable($productId, $date, $start, $end)
// {
//     return !self::where('product_id', $productId)
//         ->where('booking_date', $date)
//         ->where(function ($query) use ($start, $end) {
//             $query->whereBetween('start_time', [$start, $end])
//                   ->orWhereBetween('end_time', [$start, $end]);
//         })
//         ->exists();
// }

// In App\Models\Booking.php

public function order()
{
    return $this->belongsTo(Order::class);
}

}
