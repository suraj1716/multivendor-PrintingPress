<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Enums\RolesEnum;
use App\Filament\Resources\OrderResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Filament\Resources\Pages\ListRecords;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getTableQuery(): Builder
    {$user = Auth::user();
          // If Admin, return all orders
      if ($user->hasRole(\App\Enums\RolesEnum::Admin->value)) {
        // Admin sees all orders
        return parent::getTableQuery();
    }

    // Otherwise, filter orders by vendor_user_id
    return parent::getTableQuery()
        ->where('vendor_user_id', $user->id);
    }
}
