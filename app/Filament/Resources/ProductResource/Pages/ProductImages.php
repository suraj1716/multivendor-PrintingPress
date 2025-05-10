<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Form;
use Filament\Resources\Pages\EditRecord;

class ProductImages extends EditRecord
{
    protected static string $resource = ProductResource::class;
    protected static ?string $navigationIcon = 'heroicon-o-photo';
protected static ?string $title='Images';

public function form(Form $form): Form
{
    return $form
        ->schema([
            SpatieMediaLibraryFileUpload::make('images')
                ->label(false)
                ->image()
                ->multiple()
                ->openable()
                ->panelLayout('grid')
                ->collection('images') // Ensure the collection name matches the one in the Product model
                ->reorderable()
                ->appendFiles()
                ->preserveFilenames()
                ->columnSpan(2)
                // ->default($this->record->getMedia('images')->pluck('id')->toArray()) ,
        ]);
}



    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
