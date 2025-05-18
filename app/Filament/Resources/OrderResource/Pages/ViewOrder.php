<?php

namespace App\Filament\Resources\OrderResource\Pages;

use Filament\Resources\Pages\ViewRecord;
use App\Filament\Resources\OrderResource;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    protected static string $view = 'filament.orders.view-order';

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
    return view('filament.orders.view-order', [
        'record' => $this->record,
    ]);
}

}
