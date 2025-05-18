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

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable()
                    ->label('Order ID'),

                Tables\Columns\TextColumn::make('vendorUser.vendor.store_name')
                    ->label('Vendor Store'),

                Tables\Columns\TextColumn::make('total_price')
                    ->money('USD')
                    ->label('Total'),




Tables\Columns\SelectColumn::make('status')
    ->label('Status')
    ->options(
        collect(OrderStatusEnum::cases())->mapWithKeys(fn($case) => [$case->value => $case->name])->toArray()
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
    return parent::getTableQuery()->with('vendorUser');
}
}
