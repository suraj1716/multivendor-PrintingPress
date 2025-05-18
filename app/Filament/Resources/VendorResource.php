<?php

namespace App\Filament\Resources;

use App\Enums\VendorStatusEnum;
use App\Filament\Resources\VendorResource\Pages;
use App\Models\Vendor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\SelectColumn;

class VendorResource extends Resource
{
    protected static ?string $model = Vendor::class;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Name')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('store_name')
                    ->label('Store Name')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn($state) => array_search($state, VendorStatusEnum::colors()))
                    ->formatStateUsing(fn($state) => VendorStatusEnum::labels()[$state] ?? $state)
                    ->sortable(),

                SelectColumn::make('status')
                    ->label('Update Status')
                    ->options(
                        collect(VendorStatusEnum::cases())
                            ->mapWithKeys(fn ($case) => [$case->value => $case->label()])
                            ->toArray()
                    )
                    ->rules(['required'])
                    ->searchable()
                    ->sortable()
                    ->afterStateUpdated(function ($record, $state) {
                        $record->status = $state;
                        $record->save();
                    }),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->requiresConfirmation()
                    ->visible(fn($record) => $record->status === VendorStatusEnum::Pending->value)
                    ->action(function ($record) {
                        $record->status = VendorStatusEnum::Approved->value;
                        $record->save();
                    }),

                Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-circle')
                    ->requiresConfirmation()
                    ->visible(fn($record) => $record->status === VendorStatusEnum::Pending->value)
                    ->action(function ($record) {
                        $record->status = VendorStatusEnum::Rejected->value;
                        $record->save();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVendors::route('/'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('user');
    }
}
