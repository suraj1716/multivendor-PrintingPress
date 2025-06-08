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
use Stripe\Stripe;
use Stripe\Refund;


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
            if ($request->wantsJson()) {
                return response()->json([
                    'availableSlots' => [],
                    'closedDates' => [],
                    'recurringClosedDays' => [],
                    'businessStart' => null,
                    'businessEnd' => null,
                    'slotIntervalMinutes' => null,
                    'message' => 'Date parameter is missing.'
                ]);
            }

            return Inertia::render('AvailableSlots', [
                'date' => null,
                'availableSlots' => [],
                'closedDates' => [],
                'recurringClosedDays' => [],
                'businessStart' => null,
                'businessEnd' => null,
                'slotIntervalMinutes' => null,
                'message' => 'User not authenticated.'
            ]);
        }


        // Set timezone to Sydney (fallback if not set in config)
        $timezone = config('app.timezone', 'Australia/Sydney');
        $now = now()->timezone($timezone);
        $formattedDate = \Carbon\Carbon::parse($date, $timezone)->format('Y-m-d');

        Log::info("Requested date: {$formattedDate}, Current time: {$now->toDateTimeString()}");

        // Business hours: 9 AM to 10 PM on the requested date
        $user = Auth::user();

        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json([
                    'availableSlots' => [],
                    'closedDates' => [],
                    'recurringClosedDays' => [],
                    'businessStart' => null,
                    'businessEnd' => null,
                    'slotIntervalMinutes' => null,
                    'message' => 'User not authenticated.'
                ]);
            }

            return Inertia::render('AvailableSlots', [
                'date' => null,
                'availableSlots' => [],
                'closedDates' => [],
                'recurringClosedDays' => [],
                'businessStart' => null,
                'businessEnd' => null,
                'slotIntervalMinutes' => null,
                'message' => 'User not authenticated.'
            ]);
        }


        // Get cart items with vendors
        $cartItems = \App\Models\CartItem::where('user_id', $user->id)
            ->with('product.vendor')
            ->get();

        // Get the first appointment vendor ID from cart
        $appointmentVendorId = $cartItems
            ->pluck('product.vendor')
            ->filter(fn($vendor) => $vendor !== null && $vendor->vendor_type->value === \App\Enums\VendorType::APPOINTMENT->value)
            ->pluck('user_id')
            ->unique()
            ->first();

        if (!$appointmentVendorId) {
            if ($request->wantsJson()) {
                return response()->json([
                    'availableSlots' => [],
                    'closedDates' => [],
                    'recurringClosedDays' => [],
                    'businessStart' => null,
                    'businessEnd' => null,
                    'slotIntervalMinutes' => null,
                    'message' => 'No appointment vendor found in cart.'
                ]);
            }

            return Inertia::render('AvailableSlots', [
                'date' => null,
                'availableSlots' => [],
                'closedDates' => [],
                'recurringClosedDays' => [],
                'businessStart' => null,
                'businessEnd' => null,
                'slotIntervalMinutes' => null,
                'message' => 'User not authenticated.'
            ]);
        }


        $vendor = \App\Models\Vendor::find($appointmentVendorId);

        if (!$vendor) {
            return Inertia::render('AvailableSlots', [
                'date' => $formattedDate,
                'availableSlots' => [],
                'closedDates' => [],
                'recurringClosedDays' => [],
                'businessStart' => null,
                'businessEnd' => null,
                'slotIntervalMinutes' => null,
                'message' => 'Vendor not found.'
            ]);
        }



        // Build Carbon instances for business start/end times on that date
        $businessStart = \Carbon\Carbon::parse($formattedDate . ' ' . $vendor->business_start_time, $timezone);
        $businessEnd = \Carbon\Carbon::parse($formattedDate . ' ' . $vendor->business_end_time, $timezone);
        $slotIntervalMinutes = $vendor->slot_interval_minutes;

        // Parse closed dates and recurring closed days from vendor
        // If stored as JSON in DB, decode to array
        $closedDates = is_array($vendor->closed_dates)
            ? $vendor->closed_dates
            : json_decode($vendor->closed_dates ?? '[]', true) ?? [];
        $recurringClosedDays = is_array($vendor->recurring_closed_days)
            ? $vendor->recurring_closed_days
            : json_decode($vendor->recurring_closed_days ?? '[]', true) ?? [];

        $dayOfWeek = \Carbon\Carbon::parse($formattedDate, $timezone)->dayOfWeek;


        if (in_array($formattedDate, $closedDates)) {
            Log::info("Date {$formattedDate} is a closed date.");
        }
        if (in_array($dayOfWeek, $recurringClosedDays)) {
            Log::info("Date {$formattedDate} is a recurring closed day (dayOfWeek={$dayOfWeek}).");
        }

        // Check if the date is closed
        if (in_array($formattedDate, $closedDates) || in_array($dayOfWeek, $recurringClosedDays)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'availableSlots' => [],
                    'closedDates' => $closedDates,
                    'recurringClosedDays' => $recurringClosedDays,
                    'message' => 'Selected date is not available for booking due to closure.'
                ]);
            }
            return Inertia::render('AvailableSlots', [
                'date' => $formattedDate,
                'availableSlots' => [],
                'closedDates' => $closedDates,
                'recurringClosedDays' => $recurringClosedDays,
                'businessStart' => $businessStart->format('H:i'),
                'businessEnd' => $businessEnd->format('H:i'),
                'slotIntervalMinutes' => $slotIntervalMinutes,
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
            ->join('orders', 'bookings.order_id', '=', 'orders.id')
            ->whereDate('bookings.booking_date', $formattedDate)
            ->where('orders.status', '!=', 'cancelled') // Exclude cancelled orders
            ->pluck('bookings.time_slot')
            ->map(fn($slot) => strtolower(trim($slot)))
            ->toArray();

        Log::info("Booked slots for {$formattedDate}: " . json_encode($bookedSlots));

        // Filter out booked slots
        $availableSlots = array_values(array_filter(
            $allSlots,
            fn($slot) => !in_array(strtolower($slot), $bookedSlots)
        ));
        // dd($availableSlots);
        Log::info("Available slots for {$formattedDate}: " . json_encode($availableSlots));

        if ($request->wantsJson()) {
            return response()->json([
                'availableSlots' => $availableSlots,
                'closedDates' => $closedDates,
                'recurringClosedDays' => $recurringClosedDays,
                'businessStart' => $businessStart->format('H:i'),
                'businessEnd' => $businessEnd->format('H:i'),
                'slotIntervalMinutes' => $slotIntervalMinutes,
                'message' => 'Available slots for selected date.'
            ]);
        }
        return Inertia::render('AvailableSlots', [
            'date' => $formattedDate,
            'availableSlots' => $availableSlots,
            'closedDates' => $closedDates,
            'recurringClosedDays' => $recurringClosedDays,
            'businessStart' => $businessStart->format('H:i'),
            'businessEnd' => $businessEnd->format('H:i'),
            'slotIntervalMinutes' => $slotIntervalMinutes,
            'message' => 'Available slots for selected date.'
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
        $order = Order::findOrFail($id);
        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status !== 'draft' || $order->status !== 'paid') {
            return redirect()->back()->with('error', 'Only draft and paid bookings can be cancelled.');
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

        if (!$order || ($order->status === 'cancelled' && now() < $booking->booking_date)) {
            return redirect()->back()->with('error', 'Invalid order for cancellation.');
        }

        $order->status = 'cancelled';
        $order->save();

        if ($order->payment_intent && !$order->refunded_at) {
            try {
                Stripe::setApiKey(config('app.stripe_secret_key'));

                // Calculate refund amount
                $now = Carbon::now();
                $bookingDate = Carbon::parse($booking->booking_date); // make sure booking_date is a proper datetime

                $daysDiff = $now->diffInDays($bookingDate, false); // false = signed difference

                if ($daysDiff < 2) {
                    $refundAmount = $order->total_price * 0.5; // 50%
                } else {
                    $refundAmount = $order->total_price; // 100%
                }

                // Create refund
                $refund = Refund::create([
                    'payment_intent' => $order->payment_intent,
                    'amount' => intval($refundAmount * 100), // Stripe uses cents
                ]);

                $order->refunded_at = now();
                $order->refund_id = $refund->id;
                $order->refund_amount = $refundAmount;
                $order->refund_reason = $daysDiff < 2 ? 'Late cancellation (50%)' : 'Full refund';


                $order->save();
            } catch (\Exception $e) {
                Log::error('Stripe refund failed: ' . $e->getMessage());
                return redirect()->back()->with('error', 'Booking cancelled but refund failed.');
            }
        }
        $booking->delete();
        return redirect()->back()->with('success', 'Booking cancelled and conditional refund processed.');
    }
}
