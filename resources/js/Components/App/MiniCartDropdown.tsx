import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { Link, usePage } from "@inertiajs/react";
import React from "react";

function MiniCartDropdown() {
  const { totalPrice, totalQuantity, miniCartItems } = usePage().props;
    // console.log(cartItems);
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />{" "}
          </svg>
          <span className="badge badge-sm indicator-item">{totalQuantity}</span>
        </div>
      </div>
      <div
        tabIndex={0}
        className="card card-compact dropdown-content bg-base-100 z-1 mt-3 w-[480px] shadow"
      >
        <div className="card-body">
          <span className="text-lg font-bold">{totalQuantity} Items</span>

          <div className={"my-4 ,max-h-[300px] overflow-auto"}>
            {miniCartItems.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">Your cart is empty</span>
              </div>
            )}

            {miniCartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Link
                  href={route("product.show", item.slug)}
                  className="flex justify-center items-center w-16 h-16 rounded"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-10 h-10 rounded"
                  />
                </Link>
                <div className={"flex-1"}>
                  <h3 className={"mb-3 font-semibold"}>
                    <Link href={route("product.show", item.slug)}>
                      {item.title}
                    </Link>
                  </h3>
                  <div className={"flex justify-between text-sm"}>
                    <div>Quantity: {item.quantity}</div>
                    <div>
                      <CurrencyFormatter
                        amount={item.quantity * item.price}
                        currency="AUD"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <span className="text-lg font-bold">
            Subtotal:
            <CurrencyFormatter amount={totalPrice} currency="AUD" />
          </span>
          <div className="card-actions">
            <Link
              href={route("cart.index")}
              className="btn btn-primary btn-block"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MiniCartDropdown;
