<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'price',
        'attachment_path',
        'attachment_name', // <- this MUST be here
        'variation_type_option_ids',
        // other fields...
    ];
    protected $casts = [
        'variation_type_option_ids' => 'array',
    ];

    public function user()
{
    return $this->belongsTo(User::class);
}
}

