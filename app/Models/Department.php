<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;


class Department extends Model
{

    public function  categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }


    public function scopePublished(Builder $query): Builder
    {
        return $query->where('active', true);

    }


    public function scopeWithProducts($query)
{
    return $query->whereHas('categories.products')
        ->with(['categories' => function ($q) {
            $q->whereHas('products');
        }]);
}

// In Department.php
public function products()
{
    return $this->hasManyThrough(
        Product::class,
        Category::class,
        'department_id', // Foreign key on categories table
        'category_id',   // Foreign key on products table
        'id',           // Local key on departments table
        'id'            // Local key on categories table
    );
}

}
