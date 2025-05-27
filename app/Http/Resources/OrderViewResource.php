<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderViewResource extends JsonResource
{

    public static $wrap = false;


    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'total_price' => $this->total_price,
            'vendor' => [
                'name' => $this->vendorUser->name ?? '',
                'store_name' => $this->vendorUser->vendor->store_name ?? '',
                'store_address' => $this->vendorUser->vendor->store_address ?? '',
                'vendor_type'=> $this->vendorUser->vendor->vendor_type->value ?? '',
            ],
            'orderItems' => $this->orderItems->map(function ($item) {
                $variationOptionIds = is_string($item->variation_type_option_ids)
                    ? json_decode($item->variation_type_option_ids, true)
                    : $item->variation_type_option_ids;

                $variations = [];

                if ($item->product && $item->product->variationTypes) {
                    foreach ($item->product->variationTypes as $variationType) {
                        $selectedOptionId = $variationOptionIds[$variationType->id] ?? null;

                        if ($selectedOptionId) {
                            $selectedOption = $variationType->options->firstWhere('id', $selectedOptionId);
                            if ($selectedOption) {
                                $variations[] = [
                                    'type' => $variationType->name,
                                    'option' => $selectedOption->name,
                                    'image' => $selectedOption->image ? asset('storage/' . $selectedOption->image) : null,
                                ];
                            }
                        }
                    }
                }

                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'variation_summary' => $variations,
                    'attachment_name' => $item->attachment_name,
                    'attachment_path' => $item->attachment_path,

                    'product' => [
                        'id' => $item->product->id,
                        'title' => $item->product->title,
                        'image' => $item->product->getImageForOptions($item->variation_type_option_ids ?: []),
                    ],
                ];
            }),
        ];
    }
}
