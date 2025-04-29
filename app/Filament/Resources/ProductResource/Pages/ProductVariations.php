<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Enums\ProductVariationTypeEnum;
use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class ProductVariations extends EditRecord
{
    protected static string $resource = ProductResource::class;
    protected static ?string $title = ' Variation';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';


    public function form(Form $form): Form
    {
        $types = $this->record->variationTypes;

        return $form
            ->schema([
                Repeater::make('variations')
                    ->schema([
                        Section::make()
                            ->schema(function () use ($types) {
                                $fields = [];
                                foreach ($types as $type) {
                                    $fields[] = Select::make('variation_type_' . $type->id)
                                        ->label($type->name)
                                        ->options($type->options->pluck('name', 'id'))
                                        ->preload()
                                        ->required()
                                        ->default(function ($record) use ($type) {
                                            // Assuming $record->variation_type_option_ids contains the option ID
                                            $selectedOption = json_decode($record->variation_type_option_ids, true); // Decode as an array


                                            // Check if there is a selected option, and return the first option ID
                                            return $selectedOption ? $selectedOption[0] : null; // Return the ID of the selected option
                                        });
                                }
                                return $fields;
                            }),

                        TextInput::make('quantity')
                            ->numeric()
                            ->label('Quantity'),

                        TextInput::make('price')
                            ->numeric()
                            ->label('Price'),
                    ])
                    ->columns(2)
                    ->columnSpan(2),
            ]);
    }


    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
{

    // Fetch all variations for the specific product
    $variations = $this->record->variations()->where('product_id', $this->record->id)->get()->toArray();

    // Ensure that the variation_type_option_ids is an array and map the data correctly for each field
    foreach ($variations as &$variation) {
        $variation['variation_type_option_ids'] = json_decode($variation['variation_type_option_ids'], true); // Decode as an array
    }
    // dd($variations);

    // Map the variations to the form data
    $data['variations'] = $variations;
    // dd($data);
    return $data;
}


    private function mergeCartesianWithExisting($variationTypes, $existingData): array
    {
        $defaultQuantity = $this->record->quantity;
        $defaultPrice = $this->record->price;
        $cartesianProduct = $this->cartesianProduct($variationTypes, $defaultQuantity, $defaultPrice);
        $mergeResult = [];
        foreach ($cartesianProduct as $product) {
            $optionsIds = collect($product)
                ->filter(fn($value, $key) => str_starts_with($key, 'variation_type_'))
                ->map(fn($option) => $option['id'])
                ->values()
                ->toArray();
            $match = array_filter($existingData, function ($existingOption) use ($optionsIds) {
                return $existingOption['variation_type_option_ids'] == $optionsIds;
            });


            if (!empty($match)) {
                $existingEntry = reset($match);
      $product['id']=$existingEntry['id'];
                $product['quantity'] = $existingEntry['quantity'];
                $product['price'] = $existingEntry['price'];
            } else {
                $product['quantity'] = $defaultQuantity;
                $product['price'] = $defaultPrice;
            }

            $mergeResult[] = $product;
        }

        return $mergeResult;
    }


    private function cartesianProduct($variationTypes, $defaultQuantity = null, $defaultPrice = null): array
    {
        $result = [[]];
        foreach ($variationTypes as $index => $variationType) {
            $temp = [];
            foreach ($variationType->options as $option) {
                foreach ($result as $combination) {

                    $newcombination = $combination + [
                        'variation_type_' . ($variationType->id) => [
                            'id' => $option->id,
                            'name' => $option->name,
                            'label' => $variationType->name,
                        ],
                    ];

                    $temp[] = $newcombination;
                }
            }
            $result = $temp;
        }

        foreach ($result as &$combination) {
            if (count($combination) === count($variationTypes)) {
                $combination['quantity'] = $defaultQuantity;
                $combination['price'] = $defaultPrice;
            }
        }
        unset($combination); // always unset after using reference (&) in foreach

        return $result;
    }





    protected function mutateFormDataBeforeSave(array $data): array
{
    $formattedData = [];

    foreach ($data['variations'] ?? [] as $option) {
        $variationTypeOptionIds = [];

        // Collect the selected option IDs as integers
        foreach ($this->record->variationTypes as $variationType) {
            $variationTypeKey = 'variation_type_' . $variationType->id;
            if (!empty($option[$variationTypeKey])) {
                $variationTypeOptionIds[] = (int) $option[$variationTypeKey]; // Ensure it's an integer
            }
        }

        // Format the data for storage (JSON encoding the array of integers)
        $formattedData[] = [
            'id' => $option['id'] ?? null,
            'variation_type_option_ids' => json_encode($variationTypeOptionIds), // Encode array as JSON
            'quantity' => !empty($option['quantity']) ? $option['quantity'] : $this->record->quantity,
            'price' => !empty($option['price']) ? $option['price'] : $this->record->price,
        ];
    }

    $data['variations'] = $formattedData;

    return $data;
}





    //     protected function mutateFormDataBeforeSave(array $data): array
    // {
    //     $formattedData = [];
    //     foreach ($data['variations'] as $option) {
    //         $variationTypeOptionIds = [];
    //         foreach ($this->record->variationTypes as $i => $variationType) {
    //             $variationTypeOptionIds[] = $option['variation_type_' . ($variationType->id)]['id'];
    //         }
    //         $quantity=$option['quantity'];
    //         $price=$option['price'];
    //         $formattedData[] = [
    //             'variation_type_option_ids' => $variationTypeOptionIds,
    //             'quantity' => $quantity,
    //             'price' => $price,
    //         ];
    //     }
    //     $data['variations'] = $formattedData;
    //     return $data;
    // }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $variations = $data['variations'];
        unset($data['variations']);  // Remove variations from the main data array

        // Prepare variations for upsert
        $variations = collect($variations)->map(function ($variation) {
            return [
                'id' => $variation['id'] ?? null,
                'variation_type_option_ids' => json_encode($variation['variation_type_option_ids']), // Ensure JSON encoding
                'quantity' => $variation['quantity'],
                'price' => $variation['price'],
            ];
        })->toArray();

        // Get the IDs of the existing variations in the database
        $existingVariationIds = $record->variations()->pluck('id')->toArray();

        // Get the IDs of the variations being submitted
        $submittedVariationIds = collect($variations)->pluck('id')->filter()->toArray();

        // Find the variations that need to be deleted (those that are in the database but not submitted)
        $variationsToDelete = array_diff($existingVariationIds, $submittedVariationIds);

        // Delete the variations that are no longer part of the form
        $record->variations()->whereIn('id', $variationsToDelete)->delete();

        // Perform upsert for variations (insert or update)
        $record->variations()->upsert($variations, ['id'], ['variation_type_option_ids', 'quantity', 'price']);

        return parent::handleRecordUpdate($record, $data);
    }





    }
