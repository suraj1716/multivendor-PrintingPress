import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, PaginationProps, Order, OrderItem } from "@/types";
import BookingWidget from "./BookingWidget";

export default function BookingHistory() {
  const { orders } =
    usePage<PageProps<{ orders: PaginationProps<Order> }>>().props;

  // State for currently editing booking item
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [errors, setErrors] = useState<{
    booking_date?: string;
    time_slot?: string;
  }>({});
  const today = new Date().toISOString().split("T")[0];

  // Open modal and preload values
  const handleEditBooking = (item: OrderItem) => {
    if (!item.booking) return;
    setEditingItem(item);
    setBookingDate(item.booking.booking_date);
    setTimeSlot(item.booking.time_slot);
    setErrors({});
  };

  const handleCancelBooking = (item: OrderItem, orderStatus: string) => {
    if (orderStatus !== "draft" && orderStatus !== "paid") {
      console.warn("Booking can only be cancelled when order is draft.");
      return;
    }

    if (orderStatus !== "draft" && orderStatus !== "paid") {
      console.warn(
        "Booking can only be cancelled when order is draft or paid."
      );
      return;
    }

    if (!item.booking?.id) {
      console.error("Booking ID is missing.");
      return;
    }

    if (
      orderStatus == "draft" ||
      (orderStatus == "paid" && today < item.booking.booking_date)
    ) {
      if (confirm("Are you sure you want to cancel this booking?")) {
        router.post(
          route("bookings.cancel", item.booking.id),
          {},
          {
            onSuccess: () => {
              console.log("Booking cancelled");
            },
            onError: (errors) => {
              console.error("Failed to cancel booking", errors);
            },
          }
        );
      }
    }
  };
  const handleConfirmBooking = (date: string, slot: string) => {
    if (!editingItem || !editingItem.booking) return;

    router.put(
      route("bookings.update", editingItem.booking.id),
      { booking_date: date, time_slot: slot },
      {
        onSuccess: () => {
          setEditingItem(null);
          setDialogOpen(false);
        },
        onError: (errorBag) => {
          setErrors(errorBag);
        },
      }
    );
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.booking) return;

    router.put(
      route("bookings.update", editingItem.booking.id),
      { booking_date: bookingDate, time_slot: timeSlot },
      {
        onSuccess: () => {
          setEditingItem(null);
        },
        onError: (errorBag) => {
          setErrors(errorBag);
        },
      }
    );
  };
  console.log("today", bookingDate, timeSlot, editingItem);
  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-lg font-semibold text-gray-800">Order History</h2>
      }
    >
      <div className="max-w-4xl mx-auto p-4 overflow-auto">
        {orders?.data?.length === 0 ? (
          <p className="text-gray-600 text-sm">You have no orders yet.</p>
        ) : (
          orders.data.map(
            (order) =>
              order.vendor.vendor_type === "appointment" && (
                <div
                  key={order.id}
                  className="bg-white shadow rounded-md mb-6 p-4 overflow-auto"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 border-b border-gray-200 pb-1 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold">Order #</span>
                      {order.id} |{" "}
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="capitalize">{order.status}</span> |{" "}
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${Number(order.total_price).toFixed(2)}
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="mb-3 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Vendor:</span>{" "}
                      {order.vendor.store_address}
                    </div>
                    <div>
                      <span className="font-semibold">Store:</span>{" "}
                      {order.vendor.store_name}
                    </div>
                    <div>
                      <span className="font-semibold">Address:</span>{" "}
                      {order.vendor.store_address}
                    </div>






                    {(order.status === "draft" || order.status === "draft") && (
                      <div className="mt-1 p-1 flex- gap-2">
                        <button
                          className=" inline-block px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                          onClick={() => {
                            // For example, edit first bookable orderItem that has booking and booking date > today
                            const itemToEdit = order.orderItems.find(
                              (item) =>
                                item.booking &&
                                today < item.booking.booking_date
                            );
                            if (itemToEdit) {
                              handleEditBooking(itemToEdit);
                              setDialogOpen(true);
                            } else {
                              alert("No editable booking found in this order.");
                            }
                          }}
                        >
                          Edit Booking
                        </button>
                      </div>
                    )}


                    {order.status === "paid" || order.status === "draft" ? (
                      (() => {
                        const cancellableItem = order.orderItems.find(
                          (item) =>
                            item.booking && today < item.booking.booking_date
                        );

                        if (cancellableItem) {
                          return (
                            <div className="mt-1 p-1">
                              <button
                                onClick={() =>
                                  handleCancelBooking(
                                    cancellableItem,
                                    order.status
                                  )
                                }
                                className="text-red-600 hover:underline"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <span className="text-gray-500">Completed</span>
                          );
                        }
                      })()
                    ) : order.status === "cancelled" ? (
                      <button
                        disabled
                        className="text-red-600 cursor-not-allowed"
                      >
                        Cancelled
                      </button>
                    ) : (
                      <span className="text-gray-500">Completed</span>
                    )}
                  </div>


 {/* BookingWidget dialog */}
                    {editingItem && (
                      <BookingWidget
                        bookingDate={bookingDate}
                        setBookingDate={setBookingDate}
                        timeSlot={timeSlot}
                        setTimeSlot={setTimeSlot}
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                        vendorId={order.vendor.id}
                        onSubmit={handleConfirmBooking}
                      />
                    )}







                  {/* Items Table */}
                  <table className="w-full text-sm border-collapse table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Product</th>
                        <th className="border p-2 text-left">
                          Product Variation
                        </th>
                        <th className="border p-2 text-left">Booking Date</th>
                        <th className="border p-2 text-left">Booking Time</th>
                        <th className="border p-2 text-left w-12">Qty</th>
                        <th className="border p-2 text-left w-24">Price</th>
                        <th className="border p-2 text-left w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border p-2 flex items-center gap-2">
                            <img
                              src={
                                item.product.image || "/images/placeholder.png"
                              }
                              alt={item.product.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <Link
                              href={`/product/${item.product.id}`}
                              className="text-gray-800 hover:underline truncate max-w-xs"
                            >
                              {item.product.title}
                            </Link>
                          </td>
                          <td className="border p-2">
                            {item.variation_summary &&
                            item.variation_summary.length > 0
                              ? item.variation_summary.map((v, i) => (
                                  <div key={i}>
                                    <span className="font-semibold">
                                      {v.type}:
                                    </span>{" "}
                                    {v.option}
                                  </div>
                                ))
                              : "—"}
                          </td>
                          <td className="border p-2">
                            {item.booking?.booking_date || "—"}
                          </td>
                          <td className="border p-2">
                            {item.booking?.time_slot || "—"}
                          </td>
                          <td className="border p-2">{item.quantity}</td>
                          <td className="border p-2">
                            ${Number(item.price).toFixed(2)}
                          </td>
                          <td className="border p-2">
                            {(order.status === "paid" ||
                              order.status === "draft") &&
                            item.booking &&
                            today < item.booking?.booking_date ? (
                              <button
                                onClick={() =>
                                  handleCancelBooking(item, order.status)
                                }
                                className="text-red-600 hover:underline"
                              >
                                Cancel Booking
                              </button>
                            ) : order.status === "cancelled" ? (
                              <button
                                disabled
                                className="text-red-600 cursor-not-allowed"
                              >
                                Cancelled
                              </button>
                            ) : (
                              <span className="text-gray-500">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )
        )}

        {/* Edit Booking Modal */}
        {editingItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setEditingItem(null)}
          >
            <div
              className="bg-white rounded p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Edit Booking</h3>

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
              <form onSubmit={handleSaveBooking}>
                <div className="mb-4">
                  {errors.booking_date && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.booking_date}
                    </p>
                  )}
                  {errors.time_slot && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.time_slot}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="bg-gray-300 rounded px-4 py-2"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
