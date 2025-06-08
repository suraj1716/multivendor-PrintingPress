<?php

namespace App\Filament\Resources;

use App\Enums\VendorStatusEnum;
use App\Enums\VendorType;
use App\Filament\Resources\VendorResource\Pages;
use App\Models\Vendor;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\SelectColumn;

class VendorResource extends Resource
{
    protected static ?string $model = Vendor::class;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Name')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('store_name')
                    ->label('Store Name')
                    ->sortable()
                    ->searchable(),

                // Display vendor type as text with labels
                TextColumn::make('vendor_type')
                    ->label('Vendor Type')
                    ->sortable()
                    ->searchable()
                    ->formatStateUsing(fn($state) => VendorType::labels()[$state] ?? $state),

                // Select dropdown to update vendor type with options from enum labels
                SelectColumn::make('vendor_type')
                    ->label('Update Vendor Type')
                    ->options(VendorType::labels())   // pass the array of [value => label]
                    ->rules(['required'])
                    ->searchable()
                    ->sortable()
                    ->afterStateUpdated(function ($record, $state) {
                        $record->vendor_type = $state;
                        $record->save();
                    }),


                TextColumn::make('business_start_time')->label('Start Time'),
                TextColumn::make('business_end_time')->label('End Time'),
                TextColumn::make('slot_interval_minutes')->label('Slot Interval'),
                TextColumn::make('recurring_closed_days')
    ->label('Recurring Closed Days')
    ->formatStateUsing(function ($state) {
        // If state is a string like "0,6", convert to array
        if (is_string($state)) {
            $state = array_map('trim', explode(',', $state));
        }

        if (is_array($state)) {
            $dayMap = [
                0 => 'Sunday',
                1 => 'Monday',
                2 => 'Tuesday',
                3 => 'Wednesday',
                4 => 'Thursday',
                5 => 'Friday',
                6 => 'Saturday',
            ];
            // Map strings to int keys if they are strings, so cast to int
            $days = array_map(fn($num) => $dayMap[(int)$num] ?? $num, $state);
            return implode(', ', $days);
        }

        return $state;
    }),


                TextColumn::make('closed_dates')->label('Closed Dates'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn($state) => array_search($state, VendorStatusEnum::colors()))
                    ->formatStateUsing(fn($state) => VendorStatusEnum::labels()[$state] ?? $state)
                    ->sortable(),

                SelectColumn::make('status')
                    ->label('Update Status')
                    ->options(
                        collect(VendorStatusEnum::cases())
                            ->mapWithKeys(fn($case) => [$case->value => $case->label()])
                            ->toArray()
                    )
                    ->rules(['required'])
                    ->searchable()
                    ->sortable()
                    ->afterStateUpdated(function ($record, $state) {
                        $record->status = $state;
                        $record->save();
                    }),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->requiresConfirmation()
                    ->visible(fn($record) => $record->status === VendorStatusEnum::Pending->value)
                    ->action(function ($record) {
                        $record->status = VendorStatusEnum::Approved->value;
                        $record->save();
                    }),

                Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-circle')
                    ->requiresConfirmation()
                    ->visible(fn($record) => $record->status === VendorStatusEnum::Pending->value)
                    ->action(function ($record) {
                        $record->status = VendorStatusEnum::Rejected->value;
                        $record->save();
                    }),
            ]);
    }


    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TimePicker::make('business_start_time')
                    ->label('Business Start Time')
                    ->required(),

                TimePicker::make('business_end_time')
                    ->label('Business End Time')
                    ->required(),

                Forms\Components\TextInput::make('slot_interval_minutes')
                    ->label('Slot Interval (minutes)')
                    ->numeric()
                    ->minValue(5)
                    ->required(),

               Select::make('recurring_closed_days')
    ->multiple()
    ->options([
        0 => 'Sunday',
        1 => 'Monday',
        2 => 'Tuesday',
        3 => 'Wednesday',
        4 => 'Thursday',
        5 => 'Friday',
        6 => 'Saturday',
    ])
    ->label('Recurring Closed Days')
    ->formatStateUsing(fn ($state) => array_filter(
        array_map(fn ($item) => is_numeric($item) ? (int) $item : null, $state ?? []),
        fn ($item) => $item !== null
    )),


                Forms\Components\Textarea::make('closed_dates')
                    ->label('Closed Dates')
                    ->helperText('Enter closed dates as comma-separated (e.g., 2025-05-30,2025-06-10)')
                    // ->afterStateHydrated(function ($state, callable $set) {
                    //     if (is_array($state)) {
                    //         $set(implode(',', $state));
                    //     }
                    // })
                    ->dehydrateStateUsing(function ($state) {
    if (is_array($state)) {
        // Already an array, trim each element and filter empty strings
        return array_filter(array_map('trim', $state));
    } elseif (is_string($state)) {
        // Convert comma-separated string to array, trim and filter
        return array_filter(array_map('trim', explode(',', $state)));
    }
    // For other types, just return as is or empty array
    return [];
}),

            ]);
    }


    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVendors::route('/'),
            'edit' => Pages\EditVendor::route('/{record}/edit'),  // Add this line
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('user');
    }
}
