<?php
namespace App\services;

use App\Models\Product;

class ProductSearchService
{
    public static function queryWithKeyword($keyword, $additionalConstraints = null)
    {
        $query = Product::query()->forWebsite()->with(['variationTypes', 'variationTypes.options', 'variations']);

        if ($additionalConstraints) {
            $additionalConstraints($query);
        }

        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                  ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }

        return $query;
    }
     public static function search(array $filters = [])
    {
        return Product::query()
            ->forWebsite()               // Step 2: Scope to current website
            ->with(['category', 'department'])  // Step 3: Eager load relationships
            ->filter($filters);          // Step 4: Apply dynamic filters
    }
}
