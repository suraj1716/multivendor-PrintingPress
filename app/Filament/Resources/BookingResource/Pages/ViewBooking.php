<?php

namespace App\Filament\Resources\BookingResource\Pages;

use Filament\Resources\Pages\ViewRecord;
use App\Filament\Resources\BookingResource;
use App\Filament\Resources\OrderResource;

class ViewBooking extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected static string $view = 'filament.bookings.view-booking';

    protected function getQuery()
    {
        return parent::getQuery()->with([
            'vendorUser',
            'orderItems.product',
            'shippingAddress',
        ]);
    }

    protected function getViewData(): array
{
    $order = $this->record;

    return [
        'order' => $order,
        'vendor' => $order->vendorUser,
        'items' => $order->orderItems,
    ];
}

public function view(): \Illuminate\View\View
{
    return view('filament.bookings.view-booking', [
        'record' => $this->record,
    ]);
}

}
