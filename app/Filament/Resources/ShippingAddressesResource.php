<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShippingAddressesResource\Pages;
use App\Models\ShippingAddress;
use Filament\Facades\Filament;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;

class ShippingAddressesResource extends Resource
{
    protected static ?string $model = ShippingAddress::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')
                ->relationship('user', 'name')
                ->required(),

            Forms\Components\TextInput::make('full_name')->required(),
            Forms\Components\TextInput::make('phone')->required(),
            Forms\Components\TextInput::make('address_line1')->required(),
            Forms\Components\TextInput::make('address_line2'),
            Forms\Components\TextInput::make('city')->required(),
            Forms\Components\TextInput::make('state')->required(),
            Forms\Components\TextInput::make('postal_code')->required(),
            Forms\Components\TextInput::make('country')->required(),

            Forms\Components\Toggle::make('is_default'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.email')->label('Email')->searchable(),
                Tables\Columns\TextColumn::make('full_name')->searchable(),
                Tables\Columns\TextColumn::make('phone')->searchable(),
                Tables\Columns\TextColumn::make('address_line1'),
                Tables\Columns\BooleanColumn::make('is_default')->label('Default'),
            ])
            ->filters([
                SelectFilter::make('is_default')
                    ->label('Default Address')
                    ->options([
                        true => 'Yes',
                        false => 'No',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShippingAddresses::route('/'),
            'create' => Pages\CreateShippingAddresses::route('/create'),
            'edit' => Pages\EditShippingAddresses::route('/{record}/edit'),
        ];
    }
}
