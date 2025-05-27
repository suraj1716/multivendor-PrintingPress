<?php

namespace App\Models;

use App\Enums\VendorStatusEnum;
use App\Enums\VendorType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vendor extends Model
{
   use HasFactory;
 protected $primaryKey = 'user_id';
    protected $fillable = ['user_id', 'status', 'store_name', 'store_address', 'vendor_type'];

  protected $casts = [
        'vendor_type' => VendorType::class,
    ];

public function scopeEligibleForPayout(Builder $query):Builder
{
    return $query->where('status',VendorStatusEnum::Approved)
    ->join('users','users.id','=', 'vendors.user_id')
    ->where('users.stripe_account_active',true);
}

public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

public function vendorUser(): BelongsTo
{

    return $this->belongsTo(User::class);

    // return $this->belongsTo(User::class, 'vendor_user_id');
}
public function products()
{
    return $this->hasMany(\App\Models\Product::class, 'created_by', 'user_id');
}
public function getRouteKeyName()
{
    return 'store_name';
}

public function departments()
{
    return $this->hasMany(Department::class, 'user_id', 'user_id');
}



}
