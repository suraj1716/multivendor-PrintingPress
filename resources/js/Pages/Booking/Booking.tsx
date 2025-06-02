import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger } from "@/Components/ui/dialog";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";

type BookingWidgetProps = {
  bookingDate: string;
  setBookingDate: (date: string) => void;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
    open: boolean;
  onOpenChange: (open: boolean) => void;
};

const recurringClosedDays = [0]; // Sunday = 0

export default function BookingWidget({
  bookingDate,
  setBookingDate,
  timeSlot,
  setTimeSlot,
 open,
  onOpenChange,
}: BookingWidgetProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [open, setOpen] = useState(false);

  // State to hold closed dates from backend
  const [closedDates, setClosedDates] = useState<string[]>([]);

  // Convert closedDates (strings) to Date objects for DayPicker
  const closedDatesAsDateObjects = closedDates.map((d) => new Date(d));

  // Disabled days array includes:
  // 1) Past dates (before today)
  // 2) Recurring closed days (e.g. Sundays)
  // 3) Closed dates fetched from backend
  const disabledDays = [
    { before: new Date() },
    ...recurringClosedDays.map((day) => ({ dayOfWeek: day })),
    ...closedDatesAsDateObjects,
  ];

  useEffect(() => {
    if (!bookingDate) {
      setAvailableTimeSlots([]);
      setTimeSlot("");
      return;
    }

    async function fetchTimeSlots() {
      setLoadingSlots(true);
      setError(null);
      setTimeSlot("");

      try {
        const response = await axios.get(`/booking/available-slots?date=${bookingDate}`);

        const { availableSlots, message, closedDates } = response.data;

        setAvailableTimeSlots(availableSlots);

        // Update closedDates state with backend data
        if (closedDates && Array.isArray(closedDates)) {
          setClosedDates(closedDates);
        }

        if (message) setError(message);
        else setError(null);
      } catch (err) {
        setError("Failed to load time slots.");
        setAvailableTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchTimeSlots();
  }, [bookingDate, setTimeSlot]);

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* <DialogTrigger asChild>
          {children || (
    <button className="btn-primary">Book Appointment</button>
  )}
        </DialogTrigger> */}

        <DialogContent className="max-w-md w-full">
          <h2 className="text-lg font-bold mb-4">Select Booking Details</h2>

          <div className="space-y-4">
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
              <label className="block font-medium mb-2">Select Time Slot:</label>
              {loadingSlots ? (
                <p>Loading available slots...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  disabled={availableTimeSlots.length === 0}
                >
                  <option value="">Select a time slot</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button className="btn-secondary" onClick={() => onOpenChange(false)}>
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
