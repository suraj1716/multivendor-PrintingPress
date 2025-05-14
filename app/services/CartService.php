<?php

namespace App\services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\VariationType;
use App\Models\VariationTypeOption;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;


class CartService
{
    private ?array $cachedCartItems = null;
    protected const COOKIE_NAME = 'cartItems';
    protected const COOKIE_LIFETIME = 60 * 24 * 30; // 30 days




    public function addItemToCart(Product $product, int $quantity = 1, $optionIds = null)
    {

        $optionIds = request()->input('options_ids');
        if ($optionIds === null) {
           $optionIds = [];
            // $optionIds = $product->variationTypes
            //     ->mapWithKeys(fn(VariationType $type) => [$type->id => $type->options[0]?->id])
            //     ->toArray();
// dd($optionIds);
        }


        $price = $product->getPriceForOptions($optionIds);

        if (Auth::check()) {
            $this->saveItemToDatabase($product->id, $quantity, $price, $optionIds);
        } else {
            $this->saveItemToCookies($product->id, $quantity, $price, $optionIds);
        }

    }






    public function updateItemQuantity(int $productId, int $quantity, $optionIds = null)
    {
        if (Auth::check()) {
            $this->updateItemQuantityInDatabase($productId, $quantity, $optionIds);
        } else {
            $this->updateItemQuantityInCookies($productId, $quantity, $optionIds);
        }
    }

    public function removeItemFromCart(int $productId, $optionIds = null)
    {
        if (Auth::check()) {
            $this->removeItemFromDatabase($productId, 1, $optionIds);
        } else {
            $this->removeItemFromCookies($productId, 1, $optionIds);
        }
    }

    public function getCartItems(): array
    {
        try {
            if ($this->cachedCartItems === null) {
                if (Auth::check()) {
                    $cartItems = $this->getCartItemsFromDatabase();
                    //  $cartItems = $this->getCartItemsFromCookies();

                } else {
                    $cartItems = $this->getCartItemsFromCookies();
                }

                $productIds = collect($cartItems)->map(fn($item) => $item['product_id']);
                $products = Product::whereIn('id', $productIds)
                    ->with('user.vendor')
                    ->forWebsite()
                    ->get()
                    ->keyBy('id');

                $cartItemData = [];

                foreach ($cartItems as $key => $cartItem) {
                    $product = data_get($products, $cartItem['product_id']);
                    if (!$product) continue;

            $imageUrl = null; // or set it to the first option image if you have logic for that



                    $optionInfo = [];

                    $optionIds = is_string($cartItem['option_ids'])
                        ? json_decode($cartItem['option_ids'], true)
                        : $cartItem['option_ids'];

                    if (!is_array($optionIds)) {
                        $optionIds = []; // fallback in case decoding fails
                    }

                    $options = VariationTypeOption::with('variationType')
                        ->whereIn('id', $optionIds)
                        ->get()
                        ->keyBy('id');



                    // Initialize $imageUrl as null
                    $imageUrl = null;


                    foreach ( $optionIds as $option_id) {
                        $option = data_get($options, $option_id);
                        if (!$option) continue;

                        // Assign option image if available
                        if (!$imageUrl && $option->getFirstMediaUrl('images', 'small')) {
                            $imageUrl = $option->getFirstMediaUrl('images', 'small');
                        }

                        $optionInfo[] = [
                            "id" => $option->id,
                            "name" => $option->name,
                            "type" => [
                                'id' => $option->variationType->id,
                                'name' => $option->variationType->name,
                            ]
                        ];
                    }


                    // Fallback to product image if no option image is found
                    $imageUrl = $imageUrl ?: $product->getFirstMediaUrl('images', 'thumb');

                    $cartItemData[] = [
                        'id' => $cartItem['id'],
                        'product_id' => $product->id,
                        'title' => $product->title,
                        'slug' => $product->slug,
                        'price' => $cartItem['price'],
                        'quantity' => $cartItem['quantity'],
                        'option_ids' => $optionIds,
                        'options'   => $optionInfo,
                        'image_url' => $imageUrl,
                        'user' => [
                            'id' => $product->created_by,
                            'name' => $product->user->vendor->store_name,
                        ],
                    ];
                }

                $this->cachedCartItems = $cartItemData;
            }



            return $this->cachedCartItems;
        } catch (\Exception $e) {
            Log::error($e->getMessage() . PHP_EOL . $e->getTraceAsString());
        }
        return []; // Optional: log the error or handle it
    }

    public function getTotalQuantity(): int
    {
        $totalQuantity = 0;
        foreach ($this->getCartItems() as $item) {
            $totalQuantity += $item['quantity'];
        }
        return $totalQuantity;
    }

    public function getTotalPrice(): float
    {
        $total = 0;
        foreach ($this->getCartItems() as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        return $total;
    }

    protected function updateItemQuantityInDatabase(int $productId, int $quantity, array $optionIds): void
    {
        $userId = Auth::id();
        $carItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', json_encode($optionIds))
            ->first();

        if ($carItem) {
            $carItem->update([
                'quantity' => $quantity,
            ]);
        }
    }

    protected function updateItemQuantityInCookies(int $productId, int $quantity, array $optionIds): void
    {

        $cartItems = $this->getCartItemsFromCookies();
        ksort($optionIds);
        $itemKey = $productId . '_' . json_encode($optionIds);

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
        }

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }
   protected function saveItemToDatabase(int $productId, int $quantity, $price, array $optionIds): void
{
    $userId = Auth::id();

    // Normalize keys
    ksort($optionIds);
    $optionIds = array_map('strval', $optionIds); // force keys to string

    $encodedOptionIds = json_encode($optionIds);

   $cartItem = CartItem::where('user_id', $userId)
        ->where('product_id', $productId)
        ->where('variation_type_option_ids', json_encode($optionIds))
        ->first();



    if ($cartItem) {
        $cartItem->update([
            'quantity' => DB::raw('quantity + ' . $quantity),
        ]);
    } else {
        CartItem::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'variation_type_option_ids' => $encodedOptionIds,
            'price' => $price
        ]);
    }
}


    protected function saveItemToCookies(int $productId, int $quantity, $price, array $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);
        $itemKey = $productId . '_' . json_encode($optionIds);

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] += $quantity;
            $cartItems[$itemKey]['price'] = $price;
        } else {
            $cartItems[$itemKey] = [
                'id' => Str::uuid(),
                'product_id' => $productId,
                'quantity' => $quantity,
                'option_ids' => $optionIds,
                'price' => $price
            ];
        }

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
        // dd(Cookie::get('cartItems'));
    }

    protected function removeItemFromDatabase(int $productId, int $quantity, array $optionIds): void
    {
        $userId = Auth::id();

    // Log to check the values being passed
    Log::info('Attempting to remove item from database', [
        'user_id' => $userId,
        'product_id' => $productId,
        'option_ids' => $optionIds,
    ]);

    // Ensure optionIds are sorted to prevent mismatches
    ksort($optionIds);

    // Check if an item exists before attempting to delete it
    $cartItem = CartItem::where('user_id', $userId)
                    ->where('product_id', $productId)
                    ->get()
                    ->filter(function ($item) use ($optionIds) {
                        $storedOptionIds = is_string($item->variation_type_option_ids)
                            ? json_decode($item->variation_type_option_ids, true)
                            : [];
                        return $storedOptionIds === $optionIds;
                    })
                    ->first();

    if ($cartItem) {
        // Item found, proceed with deletion
        $cartItem->delete();
        Log::info('Item removed from cart', [
            'cart_item_id' => $cartItem->id
        ]);
    } else {
        Log::warning('No cart item found for deletion', [
            'user_id' => $userId,
            'product_id' => $productId,
            'option_ids' => $optionIds,
        ]);
    }
    }
    protected function removeItemFromCookies(int $productId, int $quantity, array $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();
        ksort($optionIds);
        $cartKey = $productId . '_' . json_encode($optionIds);

        unset($cartItems[$cartKey]);

        if (count($cartItems) > 0) {
            Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
        } else {
            Cookie::queue(Cookie::forget(self::COOKIE_NAME));
        }
    }
    protected function getCartItemsFromDatabase(): array
    {

        $userId = Auth::id();
        $cartItems = CartItem::where('user_id', $userId)
            ->get()
            ->map(function ($cartItem) {
                return [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'option_ids' => $cartItem->variation_type_option_ids,
                    'price' => $cartItem->price
                ];
            })->toArray();

        if (Auth::check()) {
            return $cartItems;
        } else {
            return [];
        }
    }

    protected function getCartItemsFromCookies(): array
    {
        $cartItems = json_decode(Cookie::get(self::COOKIE_NAME, '[]'), true);

        return $cartItems;
    }

    public function getCartItemsGrouped(): array
    {
        $cartItems = $this->getCartItems();
        return collect($cartItems)
            ->groupBy(fn($item) => $item['user']['id'])
            ->map(fn($items, $userId) => [
                'user' => $items->first()['user'],
                'items' => $items->toArray(),
                'totalQuantity' => $items->sum('quantity'),
                'totalPrice' => $items->sum(fn($item) => $item['price'] * $item['quantity']),
            ])->toArray();
    }


    public function moveCartItemsToDatabase($userId):void
    {
        $cartItems=$this->getCartItemsFromCookies();
        foreach($cartItems as $itemKey=>$cartItem)
        {
            $existingItem=CartItem::where('user_id',$userId)
            ->where('product_id',$cartItem['product_id'])
            ->where('variation_type_option_ids', json_encode($cartItem['option_ids']))
            ->first();

            if($existingItem){
                $existingItem->update([
                    'quantity'=>$existingItem->quantity + $cartItem['quantity']

                ]);
            }else{
                CartItem::create([
                    'user_id'=>$userId,
                    'product_id'=>$cartItem['product_id'],
                    'quantity'=>$cartItem['quantity'],
                    'price'=>$cartItem['price'],
                    'variation_type_option_ids'=>$cartItem['option_ids'],


                ]);
            }
        }

        Cookie::queue(self::COOKIE_NAME, '',-1);
    }
}
