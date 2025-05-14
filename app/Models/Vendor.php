<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vendor extends Model
{
   use HasFactory;
 protected $primaryKey = 'user_id';  
    protected $fillable = ['user_id', 'status', 'store_name', 'store_address'];

public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

public function vendorUser(): BelongsTo
{

    return $this->belongsTo(User::class);

    // return $this->belongsTo(User::class, 'vendor_user_id');
}

}
