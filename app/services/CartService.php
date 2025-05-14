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
                // $cartItems = $this->getCartItemsFromCookies();
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

                $imageUrl = null;
                $optionInfo = [];

               $optionIds = is_string($cartItem['option_ids'])
    ? array_values(json_decode($cartItem['option_ids'], true) ?: [])
    : array_values($cartItem['option_ids'] ?? []);


                if (!is_array($optionIds)) {
                    $optionIds = [];
                }

                $options = VariationTypeOption::with('variationType')
                    ->whereIn('id', $optionIds)
                    ->get()
                    ->keyBy('id');

                foreach ($optionIds as $option_id) {
                    $option = data_get($options, $option_id);
                    if (!$option) continue;

                    if (!$imageUrl && $option->getFirstMediaUrl('images', 'small')) {
                        $imageUrl = $option->getFirstMediaUrl('images', 'small');
                    }

                    $optionInfo[] = [
                        'id'   => $option->id,
                        'name' => $option->name,
                        'type' => [
                            'id'   => $option->variationType->id,
                            'name' => $option->variationType->name,
                        ],
                    ];
                }

                $imageUrl = $imageUrl ?: $product->getFirstMediaUrl('images', 'thumb');

                $cartItemData[] = [
                    'id'         => $cartItem['id'],
                    'product_id' => $product->id,
                    'title'      => $product->title,
                    'slug'       => $product->slug,
                    'price'      => $cartItem['price'],
                    'quantity'   => $cartItem['quantity'],
                    'option_ids' => $optionIds,
                    'options'    => $optionInfo,
                    'image_url'  => $imageUrl,
                    'user'       => [
                        'id'   => $product->created_by,
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

    return [];
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
        ->where('variation_type_option_ids', $encodedOptionIds)
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

    // Ensure consistent ordering and associative structure
    ksort($optionIds);

    // Store as JSON object string to preserve keys
    $itemKey = $productId . '_' . json_encode($optionIds, JSON_FORCE_OBJECT);

    if (isset($cartItems[$itemKey])) {
        $cartItems[$itemKey]['quantity'] += $quantity;
        $cartItems[$itemKey]['price'] = $price;
    } else {
        $cartItems[$itemKey] = [
            'id'         => (string) Str::uuid(),
            'product_id' => $productId,
            'quantity'   => $quantity,
            'option_ids' => $optionIds, // Record<string, number>
            'price'      => $price,
        ];
    }

    // Encode full cart
    Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
}



    protected function removeItemFromDatabase(int $productId, int $quantity, array $optionIds): void
    {
        $userId = Auth::id();
        ksort($optionIds);
        CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', json_encode($optionIds))
            ->delete();
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
Log::info('Cart items from cookies: ', ['cartItems' => $cartItems]);

    foreach ($cartItems as $key => &$item) {
        // Ensure option_ids is associative
        if (isset($item['option_ids']) && is_array($item['option_ids'])) {
            $item['option_ids'] = collect($item['option_ids'])->mapWithKeys(function ($value, $key) {
                return [strval($key) => $value];
            })->toArray(); // Makes sure it's Record<string, number>
        } else {
            $item['option_ids'] = [];
        }
    }
//   dd($cartItems);
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

            dd( $cartItems);
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
