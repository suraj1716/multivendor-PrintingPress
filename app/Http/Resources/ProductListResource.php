<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        'price' => $this->getPriceForFirstOptions(),
        'image' => $this->getFirstImageUrl(),
        'slug' => $this->slug,
        'user' => [
            'id' => $this->user->id,
            'name' => $this->user->name,
            'store_name' => $this->user->vendor->store_name,
            'store_address' => $this->user->vendor->store_address,
        ],
        'department' => [
            'id' => $this->department->id,
            'name' => $this->department->name,
            'slug' => $this->department->slug,
        ],
        'average_rating' => round($this->reviews_avg_rating, 1),
       'reviews_count' => $this->reviews_count,
    ];
}

}
