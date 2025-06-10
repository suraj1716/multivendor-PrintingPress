import React from "react";
import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, PaginationProps, Order } from "@/types";

export default function OrdersHistory() {
  const { orders } =
    usePage<PageProps<{ orders: PaginationProps<Order> }>>().props;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-lg font-semibold text-gray-800">Order History</h2>
      }
    >
     <div className="max-w-4xl mx-auto p-4">
  {orders?.data?.length === 0 ? (
    <p className="text-gray-600 text-sm">You have no orders yet.</p>
  ) : (
    orders.data.map((order) =>
      order.vendor.vendor_type === "ecommerce" && (
        <div key={order.id} className="bg-white shadow rounded-md mb-6 p-4 overflow-x-auto">
          {/* Order header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 border-b border-gray-200 pb-1 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Order #</span>
              {order.id} | <span className="font-semibold">Status:</span>{" "}
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
              <span className="font-semibold">Vendor:</span> {order.vendor.store_name}
            </div>
            <div>
              <span className="font-semibold">Store:</span> {order.vendor.store_name}
            </div>
            <div>
              <span className="font-semibold">Address:</span> {order.vendor.store_address}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2 text-left">Product Variation</th>
                <th className="border p-2 text-left">Attach</th>
                <th className="border p-2 text-left w-12">Qty</th>
                <th className="border p-2 text-left w-24">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border p-2 flex items-center gap-2">
                    <img
                      src={item.product.image || "/images/placeholder.png"}
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
                    {item.variation_summary && item.variation_summary.length > 0
                      ? item.variation_summary.map((v, i) => (
                          <div key={i}>
                            <span className="font-semibold">{v.type}:</span> {v.option}
                          </div>
                        ))
                      : "—"}
                  </td>

                  <td className="border p-2">
                    {item.attachment_path ? (
                      /\.(jpe?g|png|gif|bmp|webp)(\?.*)?$/i.test(item.attachment_path) ? (
                        <img
                          src={`/storage/${item.attachment_path}`}
                          alt={item.attachment_name || "Attachment preview"}
                          className="w-16 h-16 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <a
                          href={`/storage/${item.attachment_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.attachment_name || "Download Attachment"}
                        </a>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="border p-2">{item.quantity}</td>
                  <td className="border p-2">${Number(item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )
  )}
</div>

    </AuthenticatedLayout>
  );
}
