<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatusEnum;
use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use Filament\Forms;
use Filament\Resources\Form;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Tables\Columns\SelectColumn;

use Filament\Tables;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    public static function table(Table $table): Table
    {
        return $table
//         ->filters([
//     Tables\Filters\SelectFilter::make('status')
//         ->label('Status')
//         ->options(
//             collect(OrderStatusEnum::cases())
//                 ->mapWithKeys(fn($case) => [$case->value => OrderStatusEnum::labels()[$case->value]])
//                 ->toArray()
//         )
// ])
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable()  ->searchable()
                    ->label('Order ID'),

                     Tables\Columns\TextColumn::make('vendorUser.vendor.user_id')
                    ->label('Vendor Id'),

                Tables\Columns\TextColumn::make('vendorUser.vendor.store_name')
                    ->label('Vendor Store'),

                Tables\Columns\TextColumn::make('total_price')
                    ->money('AUD')
                    ->label('Total'),

                Tables\Columns\TextColumn::make('payment_status')
                    ->label('Payment Status')
                    ->getStateUsing(function ($record) {
                        return $record->vendor_subtotal ? 'paid' : 'draft';
                    })
                    ->sortable()
                    ->searchable(),

                Tables\Columns\SelectColumn::make('status')
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

                Tables\Columns\TextColumn::make('created_at')
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
            'index' => Pages\ListOrders::route('/'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }



    public static function getTableQuery(): Builder
    {
        $userId=Auth::id();
        return parent::getTableQuery()->with('vendorUser') ->where('vendor_user_id',  $userId) ;
    }
}
