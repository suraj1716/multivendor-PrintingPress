<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request, CartService $cartService): RedirectResponse
    {

        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();
        $cartService->moveCartItemsToDatabase($user->id);


        if ($user->hasRole(RolesEnum::Admin)) {
            return redirect()->route('filament.admin.pages.dashboard');
        }

        if ($user->hasRole(RolesEnum::Vendor)) {
            $vendor = $user->vendor;
// dd($vendor->status);
            if (!$vendor) {
                return redirect()->route('dashboard')->with('status', 'No vendor profile found.');
            }

            if ($vendor->status === VendorStatusEnum::Approved->value) {
                return redirect()->route('filament.admin.pages.dashboard');
            }

            // Show a message based on the status
            $message = match ($vendor->status) {
                VendorStatusEnum::Rejected->value => 'Your vendor application was rejected.',
                VendorStatusEnum::Pending->value => 'Your vendor account is still pending approval.',
                default => 'Unknown vendor status.',
            };

            return redirect()->route('dashboard')->with('status', $message);
        }

        // For other users
        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
