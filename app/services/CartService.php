<?php

namespace App\services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\VariationTypeOption;
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
        $optionIds = $this->normalizeOptionIds($optionIds ?? request()->input('option_ids'));
        if (empty($optionIds)) {
            $optionIds = $product->getFirstOptionsMap(); // fallback
        }

        ksort($optionIds);

        $submittedPrice = request()->input('price');
        $price = (is_numeric($submittedPrice) && $submittedPrice > 0) ? $submittedPrice : $product->price;

        $attachmentPath = null;
        $attachmentFileName = null;
        if (request()->hasFile('attachment')) {
            $file = request()->file('attachment');
            request()->validate([
                'attachment' => 'file|mimes:jpeg,png,pdf|max:2048',
            ]);
            $attachmentFileName = $file->getClientOriginalName();
            $attachmentPath = $file->storeAs('attachments', $attachmentFileName, 'public');
        }

        // dd([
        //     'product_id' => $product->id,
        //     'quantity' => $quantity,
        //     'price' => $price,
        //     'optionIds' => $optionIds,
        //     'attachmentPath' => $attachmentPath,
        //     'attachmentFileName' => $attachmentFileName,
        //     'user_id' => Auth::id(),
        // ]);

        if (Auth::check()) {
            $this->saveItemToDatabase($product->id, $quantity, $price, $optionIds, $attachmentPath, $attachmentFileName);
        } else {
            $this->saveItemToCookies($product->id, $quantity, $price, $optionIds, $attachmentPath, $attachmentFileName);
        }
    }



    public function updateItemQuantity(int $productId, int $quantity, $optionIds = null)
    {
        if (is_string($optionIds)) {
            $optionIds = json_decode($optionIds, true) ?: [];
        }
        if (!is_array($optionIds)) {
            $optionIds = [];
        }
        ksort($optionIds);

        if (Auth::check()) {
            $this->updateItemQuantityInDatabase($productId, $quantity, $optionIds);
        } else {
            $this->updateItemQuantityInCookies($productId, $quantity, $optionIds);
        }
    }


    public function removeItemFromCart(int $productId, $optionIds = null)
    {
        if (is_string($optionIds)) {
            $optionIds = json_decode($optionIds, true) ?: [];
        }
        if (!is_array($optionIds)) {
            $optionIds = [];
        }
        ksort($optionIds);

        if (Auth::check()) {
            $this->removeItemFromDatabase($productId, $optionIds);
        } else {
            $this->removeItemFromCookies($productId, $optionIds);
        }
    }

    public function getCartItems(): array
    {
        try {
            if ($this->cachedCartItems === null) {
                if (Auth::check()) {
                    $cartItems = $this->getCartItemsFromDatabase();
                } else {
                    $cartItems = $this->getCartItemsFromCookies();
                }

                $productIds = collect($cartItems)->pluck('product_id')->unique()->values();
                $products = Product::whereIn('id', $productIds)
                    ->with('user.vendor')
                    ->forWebsite()
                    ->get()
                    ->keyBy('id');

                $cartItemData = [];

                foreach ($cartItems as $cartItem) {
                    $product = $products->get($cartItem['product_id']);
                    if (!$product) continue;

                    $optionIds = [];

                    if (isset($cartItem['option_ids'])) {
                        if (is_string($cartItem['option_ids'])) {
                            $optionIds = json_decode($cartItem['option_ids'], true) ?: [];
                        } elseif (is_array($cartItem['option_ids'])) {
                            $optionIds = $cartItem['option_ids'];
                        }
                    } elseif (isset($cartItem['variation_type_option_ids'])) {
                        if (is_string($cartItem['variation_type_option_ids'])) {
                            $optionIds = json_decode($cartItem['variation_type_option_ids'], true) ?: [];
                        } elseif (is_array($cartItem['variation_type_option_ids'])) {
                            $optionIds = $cartItem['variation_type_option_ids'];
                        }
                    }


                    if (!is_array($optionIds)) {
                        $optionIds = [];
                    }

                    $options = VariationTypeOption::with('variationType')
                        ->whereIn('id', $optionIds)
                        ->get()
                        ->keyBy('id');

                    $optionInfo = [];
                    $imageUrl = null;

                    foreach ($optionIds as $optionId) {
                        $option = $options->get($optionId);
                        if (!$option) continue;

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

                    $imageUrl = $imageUrl ?: $product->getFirstMediaUrl('images', 'thumb');

                    $cartItemData[] = [
                        'id' => $cartItem['id'] ?? null,
                        'product_id' => $product->id,
                        'title' => $product->title,
                        'slug' => $product->slug,
                        'price' => $cartItem['price'],
                        'quantity' => $cartItem['quantity'],
                        'option_ids' => $optionIds,
                        'options' => $optionInfo,
                        'image_url' => $imageUrl,
                        'user' => [
                            'id' => $product->created_by,
                            'name' => $product->user->vendor->store_name ?? null,
                        ],
                        'attachment_path' => $cartItem['attachment_path'] ?? null,
                        'attachment_name' => $cartItem['attachment_name'] ?? null

                    ];
                }

                $this->cachedCartItems = $cartItemData;
                Log::debug('Raw cart item:', $cartItemData);
            }

            return $this->cachedCartItems;
        } catch (\Exception $e) {
            Log::error('CartService getCartItems error: ' . $e->getMessage() . PHP_EOL . $e->getTraceAsString());
        }


        return [];
    }

    public function getTotalQuantity(): int
    {
        return array_reduce($this->getCartItems(), fn($carry, $item) => $carry + $item['quantity'], 0);
    }

    public function getTotalPrice(): float
    {
        return array_reduce($this->getCartItems(), fn($carry, $item) => $carry + ($item['price'] * $item['quantity']), 0.0);
    }

    protected function updateItemQuantityInDatabase(int $productId, int $quantity, array $optionIds): void
    {
        $userId = Auth::id();

        $optionIds = $this->normalizeOptionIds($optionIds);
        // No need for second ksort here since normalize does it already
        // $encodedOptionIds = json_encode($optionIds);

        Log::debug('Update quantity called', [
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'normalized_option_ids' => $optionIds,
            'encoded_option_ids' => $optionIds,
        ]);

        $cartItems = $this->getCartItemsFromDatabase();

        // Build a map keyed by productId_encodedOptionIds
        $cartItemsMap = [];
        foreach ($cartItems as $item) {
            // Normalize option_ids here in case they come raw from DB
            $normOptionIds = $this->normalizeOptionIds($item['option_ids']);
            $key = $item['product_id'] . '_' . json_encode($normOptionIds);
            $cartItemsMap[$key] = $item;
        }

        $itemKey = $productId . '_' .  $optionIds;

        if (isset($cartItemsMap[$itemKey])) {
            Log::debug('Item key found in cartItemsMap', ['itemKey' => $itemKey]);
            $cartItemsMap[$itemKey]['quantity'] = $quantity;
        } else {
            Log::debug('Item key NOT found in cartItemsMap', ['itemKey' => $itemKey]);
        }

        // Now update DB item directly
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', $$optionIds)
            ->first();

        if ($cartItem) {
            Log::debug('CartItem found in DB', ['cartItem_id' => $cartItem->id]);
            $cartItem->update([
                'quantity' => $quantity,
            ]);
            Log::debug('CartItem quantity updated');
        } else {
            Log::debug('No CartItem found in DB');
        }
    }


    protected function updateItemQuantityInCookies(int $productId, int $quantity, array $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);
        $encodedOptionIds = json_encode($optionIds);

        $itemKey = $productId . '_' . $encodedOptionIds;

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
        }

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    protected function saveItemToDatabase(
        int $productId,
        int $quantity,
        $price,
        array $optionIds,
        ?string $attachmentPath = null,
        ?string $attachmentFileName = null
    ): void {
        $userId = Auth::id();

        $optionIds = $this->normalizeOptionIds($optionIds);
        ksort($optionIds); // ensure consistent key order
        $encodedOptionIds = json_encode($optionIds); // for DB comparison and storage

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids',  $encodedOptionIds)
            ->first();

        if ($cartItem) {
            $updateData = [
                'quantity' => DB::raw('quantity + ' . $quantity),
            ];

            if ($attachmentPath !== null) {
                $updateData['attachment_path'] = $attachmentPath;
            }
            if ($attachmentFileName !== null) {
                $updateData['attachment_name'] = $attachmentFileName;
            }

            $cartItem->update($updateData);

            Log::debug('Cart item updated', $updateData);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'variation_type_option_ids' =>  $optionIds,
                'price' => $price,
                'attachment_path' => $attachmentPath,
                'attachment_name' => $attachmentFileName,
            ]);

            Log::debug('Cart item created');
        }
    }








    protected function saveItemToCookies(
        int $productId,
        int $quantity,
        $price,
        $optionIds,
        ?string $attachmentPath = null,
        ?string $attachmentFileName = null
    ): void {
        // Normalize option IDs
        if (is_string($optionIds)) {
            $decoded = json_decode($optionIds, true);
            $optionIds = is_array($decoded) ? $decoded : [];
        } elseif (!is_array($optionIds)) {
            $optionIds = [];
        }

        ksort($optionIds);
        $normalizedOptionIds = array_map('strval', $optionIds);
        $encodedOptionIds = json_encode($normalizedOptionIds);

        $cartItems = $this->getCartItemsFromCookies();
        $itemKey = $productId . '_' . $encodedOptionIds;

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] += $quantity;

            // Update attachment if new one is provided
            if ($attachmentPath !== null) {
                $cartItems[$itemKey]['attachment_path'] = $attachmentPath;
                $cartItems[$itemKey]['attachment_name'] = $attachmentFileName;
            }
        } else {
            $cartItems[$itemKey] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'option_ids' => $normalizedOptionIds,
                'attachment_path' => $attachmentPath,
                'attachment_name' => $attachmentFileName, // 👈 Added
            ];
        }

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }





 protected function removeItemFromDatabase(int $productId, array $optionIds): void
{
    $userId = Auth::id();

    $optionIds = array_map('strval', $optionIds);
    sort($optionIds);

    $cartItems = CartItem::where('user_id', $userId)
        ->where('product_id', $productId)
        ->get();

    foreach ($cartItems as $cartItem) {
        $dbOptionIdsRaw = $cartItem->variation_type_option_ids;
        $dbOptionIds = is_string($dbOptionIdsRaw) ? json_decode($dbOptionIdsRaw, true) : [];

        if (is_array($dbOptionIds)) {
            $dbOptionIds = array_map('strval', $dbOptionIds);
            sort($dbOptionIds);

            if ($dbOptionIds === $optionIds) {
                Log::info('Deleting cart item', ['cart_item_id' => $cartItem->id]);
                $cartItem->delete();
            } else {
                Log::info('Option IDs do not match', [
                    'cart_item_id' => $cartItem->id,
                    'expected' => $optionIds,
                    'actual' => $dbOptionIds,
                ]);
            }
        }
    }
}



    protected function removeItemFromCookies(int $productId, array $optionIds): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);
        $encodedOptionIds = json_encode($optionIds);

        $itemKey = $productId . '_' . $encodedOptionIds;

        if (isset($cartItems[$itemKey])) {
            unset($cartItems[$itemKey]);
            if (empty($cartItems)) {
                Cookie::queue(Cookie::forget(self::COOKIE_NAME));
            } else {
                Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
            }
        }
    }



    protected function getCartItemsFromDatabase(): array
    {
        $userId = Auth::id();

        $cartItems = CartItem::where('user_id', $userId)
            ->paginate(50)
            ->map(function ($cartItem) {
                $normalizedOptionIds = $this->normalizeOptionIds($cartItem->variation_type_option_ids);

                Log::debug('Normalized option_ids for cart item', [
                    'cart_item_id' => $cartItem->id,
                    'raw_option_ids' => $cartItem->variation_type_option_ids,
                    'normalized_option_ids' => $normalizedOptionIds,
                ]);

                return [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'option_ids' => $normalizedOptionIds,
                    'price' => $cartItem->price,
                    'attachment_path' => $cartItem->attachment_path,
                    'attachment_name' => $cartItem->attachment_name,
                ];
            })->toArray();

        return Auth::check() ? $cartItems : [];
    }



    public function getCartItemsFromCookies(): array
    {
        $cookieValue = request()->cookie(self::COOKIE_NAME);
        Log::debug('Fetching cart cookie value', ['cookie_name' => self::COOKIE_NAME, 'cookie_value' => $cookieValue]);

        if (!$cookieValue) {
            Log::debug('No cart cookie found, returning empty array');
            return [];
        }

        $cartItems = json_decode($cookieValue, true);

        if (!is_array($cartItems)) {
            Log::warning('Cart cookie contains invalid JSON or non-array data', ['cookie_value' => $cookieValue]);
            return [];
        }

        Log::debug('Decoded cart items from cookie', ['cart_items' => $cartItems]);

        $normalizedCartItems = [];
        foreach ($cartItems as $key => $item) {
            $normalizedCartItems[$key] = [
                'product_id' => $item['product_id'] ?? null,
                'quantity' => $item['quantity'] ?? 0,
                'price' => $item['price'] ?? 0,
                'option_ids' => $item['option_ids'] ?? [],
                'attachment_path' => $item['attachment_path'] ?? null,
                'attachment_name' => $item['attachment_name'] ?? null
            ];
        }

        Log::debug('Normalized cart items', ['normalized_cart_items' => $normalizedCartItems]);

        return $normalizedCartItems;
    }



    public function moveCartItemsToDatabase($userId): void
    {
        $cartItems = $this->getCartItemsFromCookies();

        foreach ($cartItems as $cartItem) {
            // Normalize option_ids order
            $optionIds = $cartItem['option_ids'] ?? [];
            sort($optionIds);
            $optionIdsJson = json_encode(array_values($optionIds));

            $existingItem = CartItem::where('user_id', $userId)
                ->where('product_id', $cartItem['product_id'])
                ->where('variation_type_option_ids', $optionIdsJson)
                ->first();

            if ($existingItem) {
                $updateData = [
                    'quantity' => $existingItem->quantity + $cartItem['quantity'],
                ];

                // Update attachments only if provided in cookie data
                if (isset($cartItem['attachment_path'])) {
                    $updateData['attachment_path'] = $cartItem['attachment_path'];
                }
                if (isset($cartItem['attachment_name'])) {
                    $updateData['attachment_name'] = $cartItem['attachment_name'];
                }

                $existingItem->update($updateData);
            } else {
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $cartItem['product_id'],
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                    'variation_type_option_ids' => $optionIdsJson,
                    'attachment_path' => $cartItem['attachment_path'] ?? null,
                    'attachment_name' => $cartItem['attachment_name'] ?? null,
                ]);
            }
        }

        // Remove the cookie after moving cart items
        Cookie::queue(Cookie::forget(self::COOKIE_NAME));
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


    protected function normalizeOptionIds($optionIds): array
    {
        if (is_string($optionIds)) {
            $decoded = json_decode($optionIds, true);
            $optionIds = is_array($decoded) ? $decoded : [];
        }

        if (!is_array($optionIds)) {
            $optionIds = [];
        }

        // Convert indexed array ["1", "3"] → associative {"1": "1", "2": "3"}
        if (array_is_list($optionIds)) {
            $optionIds = collect($optionIds)
                ->values()
                ->mapWithKeys(function ($value, $index) {
                    return [strval($index + 1) => strval($value)];
                })->toArray();
        } else {
            // Ensure all keys and values are strings
            $optionIds = collect($optionIds)->mapWithKeys(function ($value, $key) {
                return [strval($key) => strval($value)];
            })->toArray();
        }

        ksort($optionIds); // Consistent key order

        return $optionIds;
    }
}
