import BookingWidget from "@/Pages/Booking/BookingWidget";
import CartItem from "@/Components/App/CartItem";
import ShippingAddressSelector from "@/Components/App/ShippingAddressSelector";
import PrimaryButton from "@/Components/Core/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Booking, GroupedCartItems, PageProps } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Inertia, Method } from "@inertiajs/inertia";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

function Index({
  csrf_token,
  cartItems,
  totalQuantity,
  totalPrice,
  shippingAddresses,
  vendorId,
  bookings,
  showBookingWidget,
  showShippingForm,
}: PageProps<{
  cartItems: Record<number, GroupedCartItems>;
  shippingAddresses: any[];
  bookings: Booking[];
  showBookingWidget: boolean;
  showShippingForm: boolean;
  vendorId: number[];
}>) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    shippingAddresses.find((a) => a.is_default)?.id ?? null
  );



  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      alert("Please select a shipping address.");
      return;
    }

    if ((!bookingDate || !timeSlot) && showBookingWidget) {
      alert("Please select a booking date and time slot.");
      return;
    }

    setLoading(true);

    try {
      // Submit booking
      await Inertia.visit(route("bookings.store"), {
        method: "POST" as Method,
        data: {
          booking_date: bookingDate,
          hasBooking: showBookingWidget ? "1" : "0",
          hasShipping: showShippingForm ? "1" : "0",
          time_slot: timeSlot,
          vendor_user_id: vendorId, // <-- Include this
        },
        preserveState: true,
        preserveScroll: true,
      });

      // After booking success, redirect to checkout with POST form submission
      const form = document.createElement("form");
      form.method = "POST";
      form.action = route("cart.checkout");

      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "_token";
      tokenInput.value = csrf_token;
      form.appendChild(tokenInput);

      const addressInput = document.createElement("input");
      addressInput.type = "hidden";
      addressInput.name = "shipping_address_id";
      addressInput.value = selectedAddressId!;
      form.appendChild(addressInput);

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setLoading(false);
      alert("Failed to submit booking. Please try again.");
    }
  };


console.log('bookingDate:', bookingDate);
  console.log('timeSlot:', timeSlot);
  console.log('selectedAddressId:', selectedAddressId);

  console.log('vendorId:', vendorId);

  console.log('cartItems:', cartItems);
  console.log('totalQuantity:', totalQuantity);
  console.log('totalPrice:', totalPrice);


  return (
    <AuthenticatedLayout>
      <Head title="Your Cart" />

      <div className="container mx-auto p-8 flex flex-col lg:flex-row gap-4">
        {/* ---------- CART ITEMS ---------- */}
        <div className="card flex-1 bg-white dark:bg-gray-800 order-2 lg:order-1">
          <div className="card-body">
            <h2 className="text-lg font-bold">Shopping Cart</h2>

            {Object.keys(cartItems).length === 0 && (
              <p className="py-6 text-center text-gray-500">
                You don't have any items in your cart.
              </p>
            )}

            {Object.values(cartItems).map((group) => (
              <section key={group.user.id} className="mb-6">
                <div className="flex items-center justify-between pb-2 border-b">
                  <Link href="/" className="underline">
                    {group.user.name}
                  </Link>
                </div>

                {group.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </section>
            ))}
          </div>
        </div>

        {/* ---------- SIDEBAR: ADDRESS + CHECKOUT + BOOKINGS ---------- */}
        <div className="card flex-1 bg-white dark:bg-gray-800 lg:min-w-[260px] order-1 lg:order-2">
          <div className="card-body space-y-6">
            {/* --- Booking Widget --- */}
            {showBookingWidget && (
              <div className="space-y-4 border p-4 rounded">
                <h3 className="font-bold text-lg">Book Appointment</h3>
                {/* Pass a button as the dialog trigger */}
                <button
                  className="inline-block mb-2 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setDialogOpen(true)}
                >
                  Book Appointment
                </button>
                <BookingWidget
  bookingDate={bookingDate}
  setBookingDate={setBookingDate}
  timeSlot={timeSlot}
  setTimeSlot={setTimeSlot}
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  vendorId={vendorId.length > 0 ? vendorId[0] : null}
  onSubmit={(date, slot) => {
    console.log("Booking Submitted:", date, slot);
    setBookingDate(date);
    setTimeSlot(slot);
  }}
/>

                {bookingDate && timeSlot && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Selected Date:</strong> {bookingDate}
                    </p>
                    <p>
                      <strong>Selected Time:</strong> {timeSlot}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* --- Shipping form --- */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <input type="hidden" name="_token" value={csrf_token} />

              {showShippingForm && (
                <ShippingAddressSelector
                  shippingAddresses={shippingAddresses}
                  selectedAddressId={selectedAddressId}
                  setSelectedAddressId={setSelectedAddressId}
                />
              )}

              <div>
                <p>
                  Subtotal ({totalQuantity} item{totalQuantity > 1 ? "s" : ""}):{" "}
                  <CurrencyFormatter amount={totalPrice} currency="AUD" />
                </p>
              </div>

              {/* Checkout Form */}
              <PrimaryButton
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full"
              >
                <CreditCardIcon className="size-5" />
                {loading ? "Processing..." : "Proceed to checkout"}
              </PrimaryButton>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default Index;
