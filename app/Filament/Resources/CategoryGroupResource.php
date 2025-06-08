<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryGroupResource\Pages;
use App\Filament\Resources\CategoryGroupResource\RelationManagers;
use App\Models\CategoryGroup;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CategoryGroupResource extends Resource
{
    protected static ?string $model = CategoryGroup::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
{
    return $form->schema([
        TextInput::make('name')->required()->maxLength(255),
        FileUpload::make('image')->image()->directory('category-group-images')->nullable(),
        Toggle::make('active')->label('Active')->default(true),
        Select::make('categories')
            ->multiple()
            ->relationship('categories', 'name')
            ->searchable()
            ->preload()
            ->label('Select Categories from All Departments'),
    ]);
}

public static function table(Table $table): Table
{
    return $table
        ->columns([
            TextColumn::make('name')->sortable()->searchable(),
            ImageColumn::make('image')->disk('public')->label('Image'),
            IconColumn::make('active')->boolean()->label('Active'),
            TextColumn::make('categories.name')->label('Categories')->limit(3)->toggleable(),
        ])
        ->filters([
            TernaryFilter::make('active'),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
        ])
        ->bulkActions([
            Tables\Actions\DeleteBulkAction::make(),
        ]);
}

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategoryGroups::route('/'),
            'create' => Pages\CreateCategoryGroup::route('/create'),
            'edit' => Pages\EditCategoryGroup::route('/{record}/edit'),
        ];
    }
}
