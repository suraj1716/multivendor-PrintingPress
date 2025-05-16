<?php

namespace App\Console\Commands;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Vendor;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayoutVendors extends Command
{

    protected $signature = 'payout:vendors';


    protected $description = 'Perform vendors payout';


    public function handle()
    {
        Log::info('Payout process started');
        $this->info('starting monthly payout process for vendors...');

       Log::info('Start fetching vendors...');
$vendors = Vendor::eligibleForPayout()->with('user')->get();  // log this!
Log::info('Fetched vendors count: ' . $vendors->count());

        foreach ($vendors as $vendor) {
            $this->processPayout($vendor);
        }

        $this->info('monthly payout process completed');
        Log::info('Payout process completed');
        return Command::SUCCESS;
    }



    public function processPayout(Vendor $vendor)
    {
        $this->info('processing payout for vendors [Id=' . $vendor->user->id . '] - "' . $vendor->store_name . '"');
        Log::info('Processing payout for vendor', ['vendor_id' => $vendor->user->id, 'store_name' => $vendor->store_name]);


        try {
            DB::beginTransaction();
            $startingFrom = Payout::where('vendor_id', $vendor->user_id)
                ->orderBy('until', 'desc')
                ->value('until');

            $startingFrom = $startingFrom ?: Carbon::make('1970-1-1');

            $until = Carbon::now()->subMonthNoOverflow()->startOfMonth();

            $vendorSubtotal = Order::query()
                ->where('vendor_user_id', $vendor->user_id)
                ->where('status', OrderStatusEnum::Paid->value)
                ->whereBetween('created_at', [$startingFrom, $until])
                ->sum('vendor_subtotal');



            if ($vendorSubtotal) {
                $this->info('Payout made with the amount: ' . $vendorSubtotal);
                Payout::create([
                    'vendor_id' => $vendor->user_id,
                    'amount' => $vendorSubtotal,
                    'starting_from' => $startingFrom,
                    'until' => $until
                ]);


                // $vendor->user->transfer((int)($vendorSubtotal * 100), config('app.currency'));
                //testing comment it when stripe account is active

                if ($vendor->user->isStripeAccountActive() && $vendor->user->getStripeAccountId()) {
                    $vendor->user->transfer((int)($vendorSubtotal * 100), config('app.currency'));
                    Log::info('Stripe transfer successful', ['vendor_id' => $vendor->user->id]);
                }
            } else {
                Log::warning('Stripe transfer skipped: invalid or inactive account', ['vendor_id' => $vendor->user->id]);

                $this->info('Nothing to process');
            }

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            $this->error($e->getMessage());
        }
    }
}
