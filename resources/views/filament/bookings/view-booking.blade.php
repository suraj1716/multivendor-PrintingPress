<x-filament::page class="text-gray-800 print:bg-white print:text-black print:p-0">

    {{-- Print Button --}}
    <div class="flex justify-end mb-4 print:hidden">
        <button onclick="window.print()"
            class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm">
            Print Invoice
        </button>
    </div>

    {{-- Invoice Header --}}
    <div class="bg-white shadow rounded-md p-4 md:p-6 mb-6 border">
        <div class="flex flex-col md:flex-row md:justify-between gap-4 md:gap-0 mb-4">
            <div>
                <h2 class="text-lg md:text-xl font-bold">Invoice</h2>
                <p class="text-xs md:text-sm text-gray-600">Order ID: <span class="font-medium">{{ $record->id }}</span>
                </p>
                <p class="text-xs md:text-sm text-gray-600">Order Date: <span
                        class="font-medium">{{ $record->created_at->format('F d, Y') }}</span></p>
                <p class="text-xs md:text-sm text-gray-600">Status: <span
                        class="capitalize font-medium">{{ $record->status }}</span></p>
            </div>


            {{-- BookingInfo --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm text-gray-700">
                <div>
                    <h3 class="font-semibold mb-1 md:mb-2">Booking Info</h3>
                    <p>Booking Date: {{ optional($record->booking)->booking_date ?? 'N/A' }}</p>
                    <p>Booking Time: {{ optional($record->booking)->time_slot ?? 'N/A' }}</p>

                </div>

            </div>



            {{-- Vendor and Shipping Info --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm text-gray-700">
                <div>
                    <h3 class="font-semibold mb-1 md:mb-2">Vendor Details</h3>
                    <p>Name: {{ $record->vendorUser->name ?? 'N/A' }}</p>
                    <p>Store: {{ $record->vendorUser->vendor->store_name ?? 'N/A' }}</p>
                    <p>Address: {{ $record->vendorUser->vendor->store_address ?? 'N/A' }}</p>
                </div>

            </div>









        </div>
    </div>

    {{-- Order Items Table --}}
    <div class="bg-white shadow rounded-md border overflow-x-auto">
        <table class="w-full table-auto text-xs sm:text-sm text-left border-collapse min-w-[600px]">

            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 sm:p-3 border">#</th>
                    <th class="p-2 sm:p-3 border">Image</th>
                    <th class="p-2 sm:p-3 border">Product</th>
                    <th class="p-2 sm:p-3 border">Quantity</th>
                    <th class="p-2 sm:p-3 border">Price</th>
                    <th class="p-2 sm:p-3 border">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($record->orderItems as $index => $item)
                    <tr class="hover:bg-gray-50">
                        <td class="p-2 sm:p-3 border align-top">{{ $index + 1 }}</td>

                        {{-- Variation Images and Names --}}
                        <td class="p-2 sm:p-3 border align-top">
                            @if ($item->variation_type_option_ids && is_array($item->variation_type_option_ids))
                                <div class="flex flex-wrap gap-1 items-center">
                                    @foreach ($item->variation_type_option_ids as $optionId)
                                        @php
                                            $option = \App\Models\VariationTypeOption::with(
                                                'variationType',
                                                'media',
                                            )->find($optionId);
                                            $image = $option ? $option->getMedia('images')->first() : null;
                                            $imageUrl = $image ? $image->getUrl('thumb') : null;
                                        @endphp
                                        <div class="flex items-center space-x-1">
                                            @if ($imageUrl)
                                                <img src="{{ $imageUrl }}" alt="{{ $option->name ?? 'Variation' }}"
                                                    class="w-8 h-8 object-contain rounded border" />
                                            @endif
                                            <span
                                                class="text-[10px] sm:text-xs">{{ $option->variationType->name ?? 'N/A' }}:
                                                {{ $option->name ?? 'N/A' }}</span>
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <span class="italic text-gray-400 text-[10px] sm:text-xs">No variations</span>
                            @endif
                        </td>

                        {{-- Product Title --}}
                        <td class="p-2 sm:p-3 border align-top">{{ $item->product->title ?? 'N/A' }}</td>







                        <td class="p-2 sm:p-3 border align-top">{{ $item->quantity }}</td>
                        <td class="p-2 sm:p-3 border align-top">${{ number_format($item->price, 2) }}</td>
                        <td class="p-2 sm:p-3 border align-top">${{ number_format($item->price * $item->quantity, 2) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>

            <tfoot class="bg-gray-50">
                <tr>
                    <td colspan="5" class="p-3 text-right font-semibold border text-sm">Grand Total</td>
                    <td class="p-3 border font-bold text-green-700 text-sm">
                        ${{ number_format($record->total_price, 2) }}</td>
                </tr>
            </tfoot>
        </table>
    </div>

</x-filament::page>
