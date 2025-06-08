import LoginModal from "@/Pages/Auth/Login";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Link, usePage } from "@inertiajs/react";
import React, { useState, useRef, useEffect } from "react";

function MiniCartDropdown() {
  const { auth, totalPrice, totalQuantity, miniCartItems } = usePage().props;
  const { user } = auth;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

 return (
  <>
    {/* Backdrop Blur when dropdown is open */}
    {open && (
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300" />
    )}

    <div
      className="relative z-50 flex items-center justify-center px-2 sm:px-4"
      ref={dropdownRef}
    >
      {/* Cart Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Open Cart"
      >
        <ShoppingBagIcon className="h-6 w-6 text-gray-600" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {totalQuantity}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full mt-2 w-[92vw] sm:w-90 md:w-96 bg-white border border-gray-200 rounded-xl shadow-xl transition-all transform origin-top-right duration-200 ${
          open
            ? "mt-10 scale-100 opacity-100 visible translate-x-7"
            : "scale-95 opacity-0 invisible"
        }`}
      >
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">
            {totalQuantity} Item(s)
          </h3>

          {miniCartItems.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {miniCartItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Link
                    href={route("product.show", item.slug)}
                    className="w-16 h-16"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </Link>
                  <div className="flex-1 text-sm">
                    <Link
                      href={route("product.show", item.slug)}
                      className="block font-medium line-clamp-2 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-gray-600 flex justify-between mt-1">
                      <span>Qty: {item.quantity}</span>
                      <CurrencyFormatter
                        amount={item.quantity * item.price}
                        currency="AUD"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtotal */}
          {miniCartItems.length > 0 && (
            <>
              <hr className="my-4" />
              <div className="flex justify-between text-sm font-semibold mb-3">
                <span>Subtotal:</span>
                <CurrencyFormatter amount={totalPrice} currency="AUD" />
              </div>

              {user ? (
                <Link
                  href={route("cart.index")}
                  className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition"
                >
                  View Cart
                </Link>
              ) : (
                <span
                  onClick={() => setLoginOpen(true)}
                  className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition"
                >
                  Login to View Cart
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        canResetPassword={true}
      />
    </div>
  </>
);

}

export default MiniCartDropdown;
