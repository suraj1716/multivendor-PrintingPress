<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
protected $table = 'bookings';
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


public function order()
{
    return $this->belongsTo(Order::class,'order_id');
}

}
