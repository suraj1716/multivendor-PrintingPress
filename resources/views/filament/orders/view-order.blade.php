<x-filament::page class="space-y-6">

    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Order #{{ $record->id }} Details</h1>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">

        {{-- Order Summary --}}
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold mb-3 text-gray-800">Order Summary</h2>
            <dl class="space-y-2 text-gray-600 text-sm">
                <div>
                    <dt class="font-semibold uppercase tracking-wide">Status</dt>
                    <dd class="text-indigo-600 font-semibold">{{ ucfirst($record->status) }}</dd>
                </div>
                <div>
                    <dt class="font-semibold uppercase tracking-wide">Total Price</dt>
                    <dd class="text-green-600 font-bold">${{ number_format($record->total_price, 2) }}</dd>
                </div>
                <div>
                    <dt class="font-semibold uppercase tracking-wide">Order Date</dt>
                    <dd class="text-gray-700">{{ $record->created_at->format('F j, Y @ H:i') }}</dd>
                </div>
            </dl>
        </div>

        {{-- Vendor Info --}}
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold mb-3 text-gray-800">Vendor Information</h2>
            <p class="text-gray-700 text-sm mb-1">
                <span class="font-semibold">Store:</span> {{ $record->vendorUser->vendor->store_name ?? 'N/A' }}
            </p>
            <p class="text-gray-700 text-sm">
                <span class="font-semibold">Vendor Name:</span> {{ $record->vendorUser->name ?? 'N/A' }}
            </p>
        </div>

        {{-- Shipping Address --}}
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold mb-3 text-gray-800">Shipping Address</h2>
            @if ($record->shippingAddress)
                <address class="not-italic space-y-1 text-gray-700 text-sm">
                    <p>{{ $record->shippingAddress->full_name }}</p>
                    <p>{{ $record->shippingAddress->address_line1 }}</p>
                    <p>{{ $record->shippingAddress->city }}, {{ $record->shippingAddress->state }} {{ $record->shippingAddress->postal_code }}</p>
                    <p>{{ $record->shippingAddress->country }}</p>
                    <p>Phone: {{ $record->shippingAddress->phone }}</p>
                </address>
            @else
                <p class="italic text-gray-400 text-sm">No shipping address provided.</p>
            @endif
        </div>

    </section>

    {{-- Order Items --}}
    <section class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold mb-5 text-gray-900">Order Items</h2>

        <div class="divide-y divide-gray-300">
            @foreach ($record->orderItems as $item)
                <div class="flex items-center space-x-4 py-3">

                    {{-- Product Image --}}
                    <div class="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 bg-gray-50">
                        @if ($item->product && $item->product->getFirstMediaUrl('images'))
                            <img src="{{ $item->product->getFirstMediaUrl('images', 'thumb') }}" alt="{{ $item->product->title }}" class="object-cover w-full h-full">
                        @elseif ($item->variation_image_url ?? false)
                            <img src="{{ $item->variation_image_url }}" alt="{{ $item->product->title }}" class="object-cover w-full h-full">
                        @else
                            <div class="flex items-center justify-center w-full h-full text-gray-400 text-xs">No Image</div>
                        @endif
                    </div>

                    {{-- Product Info --}}
                    <div class="flex-1 min-w-0">
                        <p class="text-lg font-semibold text-gray-900 truncate">{{ $item->product->title ?? 'N/A' }}</p>
                        @if ($item->variation_options)
                            <p class="mt-0.5 text-xs text-gray-500">
                                @foreach ($item->variation_options as $optionName => $optionValue)
                                    <span>{{ $optionName }}: <strong>{{ $optionValue }}</strong></span>@if (!$loop->last), @endif
                                @endforeach
                            </p>
                        @endif
                    </div>

                    {{-- Quantity & Price --}}
                    <div class="flex flex-col items-end space-y-1 min-w-[90px]">
                        <p class="text-gray-700 text-sm">Qty: <span class="font-semibold">{{ $item->quantity }}</span></p>
                        <p class="text-green-700 font-bold text-lg">${{ number_format($item->price, 2) }}</p>
                    </div>

                </div>
            @endforeach
        </div>
    </section>

</x-filament::page>
