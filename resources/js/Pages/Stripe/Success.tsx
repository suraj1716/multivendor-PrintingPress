import { Head, Link } from "@inertiajs/react";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Order } from "@/types";

function Success({ orders }: PageProps<{ orders: Order[] }>) {
  return (
    <AuthenticatedLayout>
      <Head title="Payment was Completed" />
      <div className="max-w-3xl mx-auto min-h-screen flex flex-col justify-center py-8 px-4">
        <div className="flex flex-col gap-2 items-center mb-8">
          <div className="text-6xl text-emerald-600">
            <CheckCircleIcon className="size-24" />
          </div>
          <div className="text-3xl font-semibold">Payment was Completed</div>
        </div>

        <div className="mb-6 text-lg text-center">
          Thanks for your purchase. Your payment was successful.
        </div>

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow"
          >
            <h3 className="text-3xl mb-4 font-bold">Order Summary</h3>

            <div className="flex justify-between mb-2 font-bold">
              <div className="text-gray-400">Seller</div>
              <div>
                <Link href="#" className="hover:underline">
                  {order.vendor.store_name}
                </Link>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div className="text-gray-400">Order Number</div>
              <div>
                <Link href="#" className="hover:underline">
                  #{order.id}
                </Link>
              </div>
            </div>

            <div className="flex justify-between mb-3">
              <div className="text-gray-500">Items</div>
              <div className="text-gray-500">{order.orderItems.length}</div>
            </div>

            <div className="flex justify-between mb-4">
              <div className="text-gray-400">Total</div>
              <div>
                <CurrencyFormatter amount={order.total_price} currency="AUD" />
              </div>
            </div>

            <div className="flex justify-between">
              <Link href="#" className="btn btn-primary">
                View Order Details
              </Link>
              <Link href={route("dashboard")} className="btn">
                Back to home
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AuthenticatedLayout>
  );
}

export default Success;
