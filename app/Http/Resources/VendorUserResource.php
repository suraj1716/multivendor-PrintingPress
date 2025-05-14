<?php

namespace App\Http\Resources;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class VendorUserResource extends JsonResource
{

    public function toArray(Request $request): array
    {
    //    dd($this->vendor->store_address);
        return [
            'id'=>$this->id,
            'name'=>$this->name,
            'email'=>$this->email,
            'store_name'=>$this->vendor->store_name,
            'store_address'=>$this->vendor->store_address,
            // 'order_Items'=>$this->orderItems->map(fn($item)=>[
            //     'id'=>$item->id,
            //     'quantity'=>$item->quantity,
            //     'price'=>$item->price,
            //     'variation_type_option_ids'=>$item->variation_type_option_ids,
            //     'product'=>[
            //         'id'=>$item->product->id,
            //         'title'=>$item->product->title,
            //         'slug'=>$item->product->slug,
            //         'description'=>$item->product->description,
            //         'image'=>$item->product->getImageForOptions($item->variation_type_option_ids ?: []),



            //     ]

            // ]),

        ];

    }
}
