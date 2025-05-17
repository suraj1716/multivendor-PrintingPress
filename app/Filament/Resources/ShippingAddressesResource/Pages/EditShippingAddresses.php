<?php

namespace App\Filament\Resources\ShippingAddressesResource\Pages;

use App\Filament\Resources\ShippingAddressesResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditShippingAddresses extends EditRecord
{
    protected static string $resource = ShippingAddressesResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
