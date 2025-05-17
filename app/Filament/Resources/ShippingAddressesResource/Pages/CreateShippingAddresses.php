<?php

namespace App\Filament\Resources\ShippingAddressesResource\Pages;

use App\Filament\Resources\ShippingAddressesResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateShippingAddresses extends CreateRecord
{
    protected static string $resource = ShippingAddressesResource::class;
}
