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
    {
        $user = Auth::user();

        $query = parent::getTableQuery()
            ->with(['vendorUser', 'booking'])
            ->where(function ($query) {
                $query->whereDoesntHave('booking')
                    ->orWhereHas('booking', function ($q) {
                        $q->whereNull('booking_date');
                    });
            });

        if ($user->hasRole(\App\Enums\RolesEnum::Admin->value)) {
            return $query;
        }

        return $query->where('vendor_user_id', $user->id);
    }
}
