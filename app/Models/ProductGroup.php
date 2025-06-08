<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductGroup extends Model
{
    protected $fillable = ['name', 'slug', 'image', 'active'];
     public $products;

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
public function groupedProducts()
{
    return $this->belongsToMany(Product::class, 'product_group_product');
}


}
