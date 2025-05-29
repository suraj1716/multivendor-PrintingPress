<?php


// namespace App\Filament\Resources\BookingResource\Pages;

// use App\Filament\Resources\BookingResource;
// use Filament\Actions;
// use Filament\Resources\Pages\ListRecords;

// class ListBookings extends ListRecords
// {
//     protected static string $resource = BookingResource::class;

//     protected function getHeaderActions(): array
//     {
//         return [
//             Actions\CreateAction::make(),
//         ];
//     }
// }






namespace App\Filament\Resources\BookingResource\Pages;
use App\Enums\RolesEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use App\Filament\Resources\BookingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBookings extends ListRecords
{
      protected static string $resource = BookingResource::class;
    protected static ?string $title = 'Bookings List';

     protected function getTableQuery(): Builder
    {
        $user = Auth::user();
        // If Admin, return all orders
        $query = parent::getTableQuery()->whereHas('booking', function ($query) {
            $query->whereNotNull('booking_date');
        });

        if ($user->hasRole(\App\Enums\RolesEnum::Admin->value)) {
            // Admin sees all orders that have a booking with booking_date
            return $query;
        }

        // Non-admin users: filter by vendor_user_id and booking with booking_date
        return $query->where('vendor_user_id', $user->id);
    }
}
