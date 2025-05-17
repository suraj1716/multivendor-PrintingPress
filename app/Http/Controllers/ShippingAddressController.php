<?php

// app/Http/Controllers/UserShippingAddressController.php

namespace App\Http\Controllers;

use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShippingAddressController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // dd($user->shippingAddresses()->get());

        return Inertia::render('Profile/ShippingAddress', [
            'shipping_addresses' => $user->shippingAddress()->get(), // <-- ensure this is called as a method
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string',
            'phone' => 'required|string',
            'address_line1' => 'required|string',
            'address_line2' => 'nullable|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
            'is_default' => 'boolean',
        ]);


        if ($data['is_default']) {
            Auth::user()->shippingAddress()->update(['is_default' => false]);
        }

        Auth::user()->shippingAddress()->create($data);

        return redirect()->back()->with('success', 'Shipping address added.');
    }


public function setDefault(ShippingAddress $address)
{
    $user = Auth::user();

    // Ensure the address belongs to the user
    if ($address->user_id !== $user->id) {
        abort(403);
    }

    // Reset all addresses default flag for this user
    $user->shippingAddress()->update(['is_default' => false]);

    // Set this address as default (use integer 1)
    $address->is_default = 1;

    if (!$address->save()) {
        return redirect()->back()->with('error', 'Failed to set default address.');
    }

    return redirect()->back()->with('success', 'Default address updated.');
}




}
