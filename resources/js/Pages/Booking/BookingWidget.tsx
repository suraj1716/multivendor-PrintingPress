import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger } from "@/Components/ui/dialog";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import AvailableSlots from "../AvailableSlots";

type BookingWidgetProps = {
  bookingDate: string;
  setBookingDate: (date: string) => void;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId?: number | null; // add here
  onSubmit: (date: string, slot: string) => void; // ✅ new prop
};

export default function BookingWidget({
  bookingDate,
  setBookingDate,
  timeSlot,
  setTimeSlot,
  open,
  onOpenChange,
  vendorId, // add vendorId here
  onSubmit,
}: BookingWidgetProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [open, setOpen] = useState(false);

  // State to hold closed dates from backend
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [recurringClosedDays, setRecurringClosedDays] = useState<number[]>([]);
  // Convert closedDates (strings) to Date objects for DayPicker

  useEffect(() => {
    if (!bookingDate ) {
      setAvailableTimeSlots([]);
      setTimeSlot("");
      return;
    }

    async function fetchTimeSlots() {
      setLoadingSlots(true);
      setError(null);
      setTimeSlot("");

      try {
        const response = await axios.get(`/booking/available-slots`, {
          params: { date: bookingDate, vendorId },
        });

        const { availableSlots, message, closedDates, recurringClosedDays } =
          response.data;

        setAvailableTimeSlots(
          Array.isArray(availableSlots) ? availableSlots : []
        );

        if (closedDates && Array.isArray(closedDates)) {
          setClosedDates(closedDates);
        }
        if (recurringClosedDays && Array.isArray(recurringClosedDays)) {
          setRecurringClosedDays(recurringClosedDays.map(Number)); // converts ["0", "6"] => [0, 6]
        }

        // Set error ONLY if message indicates an actual error
        if (message && message.toLowerCase().includes("error")) {
          setError(message);
        } else {
          setError(null);
        }
      } catch (err) {
        setError("Failed to load time slots.");
        setAvailableTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchTimeSlots();
  }, [bookingDate, vendorId]);

  const closedDatesAsDateObjects = closedDates.map((d) => new Date(d));

  const disabledDays: Matcher[] = [
    { before: new Date() },
    ...(recurringClosedDays.length > 0
      ? [{ dayOfWeek: recurringClosedDays }]
      : []), // Correct structure
    ...closedDatesAsDateObjects,
  ];

  console.log(
    "BookingWidget closedDatesAsDateObjects",
    closedDatesAsDateObjects
  );

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* <DialogTrigger asChild>
          {children || (
    <button className="btn-primary">Book Appointment</button>
  )}
        </DialogTrigger> */}

        <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg p-6 max-h-[100vh] overflow-y-auto">
          <DialogTitle className="text-lg font-bold mb-4">
            Select Booking Details
          </DialogTitle>

          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg p-6 max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
            <div>
              <label className="block font-medium mb-2">Select Date:</label>
              <DayPicker
                mode="single"
                selected={bookingDate ? new Date(bookingDate) : undefined}
                onSelect={(date) =>
                  setBookingDate(date ? dayjs(date).format("YYYY-MM-DD") : "")
                }
                disabled={disabledDays}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Select Time Slot:
              </label>

              {loadingSlots ? (
                <p>Loading available slots...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : availableTimeSlots.length > 0 ? (
             <AvailableSlots
  date={bookingDate}
  availableSlots={availableTimeSlots}
  selectedSlot={timeSlot}

  onSelect={(slot) => {
  console.log("Slot selected:", slot);
  setTimeSlot(slot); // ✅ Just set, don't submit here
    onOpenChange(false);
}}


/>

              ) : (
                <p>No available slots.</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="btn-secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Submit your booking here
                  onOpenChange(false);
                }}
                disabled={!bookingDate || !timeSlot}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
