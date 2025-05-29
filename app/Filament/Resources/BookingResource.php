<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\VariationTypeOption;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

// Add this:
use App\Filament\Resources\BookingResource\Pages;

class BookingResource extends Resource
{
 protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';
     protected static ?string $title = 'Bookings';
    protected static ?string $navigationLabel = 'Bookings';
    protected static ?int $navigationSort = 2;

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->sortable()
                    ->searchable()
                    ->label('Order ID'),

                TextColumn::make('vendorUser.vendor.user_id')
                    ->label('Vendor Id'),

                TextColumn::make('vendorUser.vendor.store_name')
                    ->label('Vendor Store'),

                TextColumn::make('total_price')
                    ->money('AUD')
                    ->label('Total'),

                TextColumn::make('payment_status')
                    ->label('Payment Status')
                    ->getStateUsing(fn($record) => $record->vendor_subtotal ? 'paid' : 'draft')
                    ->sortable()
                    ->searchable(),



                TextColumn::make('booking.booking_date')
                    ->label('Booking Date')
                    ->date(),

                TextColumn::make('booking.time_slot')
                    ->label('Time Slot'),

                // TextColumn::make('attachment_path')
                //     ->label('Attachment')
                //     ->getStateUsing(fn(Order $record) => optional($record->orderItems()->first())->attachment_path ?? 'No attachment')
                //     ->url(fn(Order $record) => optional($record->orderItems()->first())->attachment_path ? asset('storage/' . $record->orderItems()->first()->attachment_path) : null)
                //     ->openUrlInNewTab()
                //     ->extraAttributes(['style' => 'max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;']),

         Tables\Columns\TextColumn::make('variation_images')
                    ->label('Variation Images')
                    ->getStateUsing(function (Order $record) {
                        $allVariations = [];

                        foreach ($record->orderItems as $item) {
                            $variationStrings = [];
                            $variationIds = $item->variation_type_option_ids;

                            if (is_array($variationIds) && count($variationIds)) {
                                foreach ($variationIds as $optionId) {
                                    $option = VariationTypeOption::with('variationType', 'media')->find($optionId);
                                    if ($option) {
                                        $image = $option->getMedia('images')->first();
                                        $imageUrl = $image ? $image->getUrl('thumb') : null;

                                        $variationName = $option->variationType->name ?? 'N/A';
                                        $optionName = $option->name ?? 'N/A';

                                        $imageTag = $imageUrl
                                            ? "<img src='{$imageUrl}' alt='{$optionName}' style='width:30px; height:30px; object-fit:contain; margin-right:8px; border:1px solid #ccc; border-radius:4px;' />"
                                            : '';

                                        // Wrap image and text in a flex container for side-by-side layout
                                        $variationStrings[] = "<div style='display:flex; align-items:center; margin-bottom:4px;'>{$imageTag}<span>{$variationName}: {$optionName}</span></div>";
                                    }
                                }
                            }

                            $allVariations[] = implode('', $variationStrings);
                        }

                        return implode('<hr style="margin:8px 0;">', $allVariations);
                    })
                    ->html()
                    ->wrap()
                    ->toggleable(),

                SelectColumn::make('status')
                    ->label('Status')
                    ->options(
                        collect(OrderStatusEnum::cases())
                            ->filter(fn($case) => in_array($case->value, ['shipped', 'delivered', 'cancelled']))
                            ->mapWithKeys(fn($case) => [$case->value => $case->name])
                            ->toArray()
                    )
                    ->rules(['required'])
                    ->searchable()
                    ->afterStateUpdated(function ($record, $state) {
                        $record->status = $state;
                        $record->save();
                    }),

                TextColumn::make('created_at')
                    ->dateTime('Y-m-d H:i')
                    ->label('Date'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'view' => Pages\ViewBooking::route('/{record}'),
        ];
    }

     protected function getTableQuery(): Builder
    {
        $user = Auth::user();
        // If Admin, return all orders
        $query = parent::getTableQuery()->whereHas('booking', function ($query) {
            $query->whereNotNull('booking_date');
        });

        if ($user->hasRole(\App\Enums\RolesEnum::Admin->value)) {
            // Admin sees all orders that have a booking with booking_date
            return $query;
        }

        // Non-admin users: filter by vendor_user_id and booking with booking_date
        return $query->where('vendor_user_id', $user->id);
    }
}
