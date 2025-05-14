<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
protected $casts=[
    'variation_type_option_ids'=>'array'
];

    protected $fillable=['stripe_session_id','user_id',
    'total_price','status','online_payment_comission',
    'website_payment_comission','vendor_subtotal','payment_intent'];


public function orderItems(): HasMany
{
    return $this->hasMany(OrderItem::class);
}


public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

public function vendor(): BelongsTo
{
    // return $this->belongsTo(Vendor::class );

    return $this->belongsTo(Vendor::class, 'vendor_user_id', 'user_id');
}

public function vendorUser(): BelongsTo
{
    return $this->BelongsTo(User::class,'vendor_user_id');
}

}
