<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderViewResource;
use App\Models\Booking;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('App/Booking', [
            'bookings' => $user->bookings()->with('product', 'vendor')->get(),
        ]);
    }

     public function history()
    {
         $orders = Auth::user()
        ->orders()
        ->with([
            'orderItems.product.variationTypes.options',
             'orderItems.booking' // will return null for orders without bookings
        ])
        ->latest()
        ->get();

    return Inertia::render('Booking/BookingHistory', [
        'orders' => OrderViewResource::collection($orders),
    ]);
    }

    public function store(Request $request)
    {
 $hasBooking = $request->input('hasBooking') == '1';
        $user = Auth::user();
        if (!$user) {
            // Handle the unauthenticated case
            abort(403, 'Unauthorized');
        }
 if ($hasBooking) {

      $validated = $request->validate([
            'booking_date' => 'required|date',
            'time_slot' => 'required|string|max:255',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id, // Ensure this is not null
             'booking_date' => $validated['booking_date'],
            'time_slot' => $validated['time_slot'],

        ]);
    }

        return redirect()->back()->with('success', 'Booking created successfully');
    }

public function getAvailableSlots(Request $request)
{
    $date = $request->input('date');

    if (!$date) {
        Log::warning('Date parameter is missing.');
        return response()->json([
            'availableSlots' => [],
            'message' => 'Date parameter is missing.'
        ], 400);
    }

    // Set timezone to Sydney (fallback if not set in config)
    $timezone = config('app.timezone', 'Australia/Sydney');
    $now = now()->timezone($timezone);
    $formattedDate = \Carbon\Carbon::parse($date, $timezone)->format('Y-m-d');

    Log::info("Requested date: {$formattedDate}, Current time: {$now->toDateTimeString()}");

    // Business hours: 9 AM to 10 PM on the requested date
    $businessStart = \Carbon\Carbon::parse($formattedDate . ' 09:00', $timezone);
    $businessEnd = \Carbon\Carbon::parse($formattedDate . ' 22:00', $timezone);
    $slotIntervalMinutes = 30;

    // Closed dates and recurring closed days (Sunday = 0)
    $closedDates = ['2025-05-30', '2025-06-10']; // example closed dates
    $recurringClosedDays = [0]; // Sundays

    $dayOfWeek = \Carbon\Carbon::parse($formattedDate, $timezone)->dayOfWeek;

    if (in_array($formattedDate, $closedDates)) {
        Log::info("Date {$formattedDate} is a closed date.");
    }
    if (in_array($dayOfWeek, $recurringClosedDays)) {
        Log::info("Date {$formattedDate} is a recurring closed day (dayOfWeek={$dayOfWeek}).");
    }

    // Check if the date is closed
    if (in_array($formattedDate, $closedDates) || in_array($dayOfWeek, $recurringClosedDays)) {
        return $request->wantsJson()
            ? response()->json([
                'availableSlots' => [],
                'closedDates' => $closedDates,
                'message' => 'Selected date is not available for booking due to closure.'
            ])
            : Inertia::render('AvailableSlots', [
                'date' => $formattedDate,
                'availableSlots' => [],
                'closedDates' => $closedDates,
                'cutoffTime' => null,
                'message' => 'Selected date is not available for booking due to closure.'
            ]);
    }

    $allSlots = [];
    $isToday = $formattedDate === $now->format('Y-m-d');
    $cutoffTime = $now->copy()->addHours(2);

    Log::info("Is today: " . ($isToday ? 'true' : 'false'));
    Log::info("Cutoff time (now + 2 hours): {$cutoffTime->toTimeString()}");

    $current = $businessStart->copy();

    while ($current->lt($businessEnd)) {
        $end = $current->copy()->addMinutes($slotIntervalMinutes);
        $slotLabel = $current->format('g:i a') . ' - ' . $end->format('g:i a');

        if ($isToday) {
            if ($current->greaterThanOrEqualTo($cutoffTime) && $current->greaterThanOrEqualTo($now)) {
                $allSlots[] = $slotLabel;
                Log::info("Including slot (today): {$slotLabel}");
            } else {
                Log::info("Skipping slot (today, before cutoff or now): {$slotLabel}");
            }
        } else {
            $allSlots[] = $slotLabel;
            Log::info("Including slot (future date): {$slotLabel}");
        }

        $current->addMinutes($slotIntervalMinutes);
    }

    // Fetch booked slots for the date from DB
    $bookedSlots = DB::table('bookings')
        ->whereDate('booking_date', $formattedDate)
        ->pluck('time_slot')
        ->map(fn($slot) => strtolower(trim($slot)))
        ->toArray();

    Log::info("Booked slots for {$formattedDate}: " . json_encode($bookedSlots));

    // Filter out booked slots
    $availableSlots = array_values(array_filter(
        $allSlots,
        fn($slot) => !in_array(strtolower($slot), $bookedSlots)
    ));

    Log::info("Available slots for {$formattedDate}: " . json_encode($availableSlots));

    return $request->wantsJson()
        ? response()->json([
            'availableSlots' => $availableSlots,
            'message' => null,
            'cutoffTime' => $isToday ? $cutoffTime->toTimeString() : null
        ])
        : Inertia::render('AvailableSlots', [
            'date' => $formattedDate,
            'availableSlots' => $availableSlots,
            'closedDates' => $closedDates,
            'cutoffTime' => $isToday ? $cutoffTime->toTimeString() : null,
            'message' => null,
        ]);
}







 public function update(Request $request, Booking $booking)
{
    $request->validate([
        'booking_date' => 'required|date',
        'time_slot' => 'required|string|max:255',
    ]);

    // Optionally check authorization here
    if ($booking->user_id !== Auth::id() && $booking->vendor_id !== Auth::id()) {
        abort(403);
    }

    $booking->update([
        'booking_date' => $request->booking_date,
        'time_slot' => $request->time_slot,
    ]);

    return redirect()->back()
        ->with('success', 'Booking updated successfully.');
}




    public function destroy($id)
{
    $booking = Booking::findOrFail($id);
$order= Order::findOrFail($id);
    if ($booking->user_id !== Auth::id()) {
        abort(403);
    }

    if ($order->status !== 'draft') {
        return redirect()->back()->with('error', 'Only draft bookings can be cancelled.');
    }

    $booking->delete();

    return redirect()->back()->with('success', 'Booking deleted successfully.');
}


    public function confirm(Booking $booking)
    {
        if ($booking->vendor_id !== Auth::id()) {
            abort(403);
        }

        // $booking->update(['status' => 'confirmed']);

        return redirect()->back()->with('success', 'Booking confirmed.');
    }

    public function cancel(Booking $booking)
    {
        if ($booking->user_id !== Auth::id() && $booking->vendor_id !== Auth::id()) {
            abort(403);
        }

 $order = $booking->order;


    if ($order) {
        $order->update(['status' => 'cancelled']);
    }

        return redirect()->back()->with('success', 'Booking cancelled.');
    }
}
