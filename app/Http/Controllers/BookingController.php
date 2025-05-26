<?php

namespace App\Http\Controllers;

// app/Http/Controllers/BookingController.php

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'booking_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'product_id' => $validated['product_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Booking successful', 'booking' => $booking]);
    }

    public function index()
    {
        $bookings = Booking::with('product')->where('user_id', Auth::id())->get();
        return response()->json($bookings);
    }
}
