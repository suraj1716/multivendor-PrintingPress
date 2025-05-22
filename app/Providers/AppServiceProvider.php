<?php

namespace App\Providers;

use App\Models\Department;
use App\services\CartService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CartService::class, function ($app) {
            return new CartService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {




        Schedule::command('payout:vendors')
        ->monthlyOn(15,'17:50')
        ->withoutOverlapping();

        Vite::prefetch(concurrency: 3);
    }
}
