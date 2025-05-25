import CartItem from "@/Components/App/CartItem";
import PrimaryButton from "@/Components/Core/PrimaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { GroupedCartItems, PageProps } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

function Index({
  csrf_token,
  cartItems,
  totalQuantity,
  totalPrice,
  shippingAddresses,
}: PageProps<{
  cartItems: Record<number, GroupedCartItems>;
  shippingAddresses: {
    id: string;
    full_name: string;
    phone: number;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
     attachment_path: string;
  }[];
}>) {
  // pre‑select default address
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    shippingAddresses.find((a) => a.is_default)?.id ?? null
  );

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

              {group.items.map(item => (
  <CartItem key={item.id} item={item} />
))}
              </section>
            ))}
          </div>
        </div>

        {/* ---------- SIDEBAR: ADDRESS + CHECKOUT ---------- */}
        <div className="card flex-1 bg-white dark:bg-gray-800 lg:min-w-[260px] order-1 lg:order-2">
          <form
            action={route("cart.checkout")}
            method="post"
            className="card-body space-y-6"
            onSubmit={(e) => {
              if (!selectedAddressId) {
                e.preventDefault();
                alert(
                  "Please select a shipping address before proceeding to checkout."
                );
              }
            }}
          >
            <input type="hidden" name="_token" value={csrf_token} />

            {/* choose address */}
            {/* choose address */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-bold">Choose a shipping address</p>
                <Link
                  href={route("profile.edit")}
                  className="inline-block px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  + Add New Address
                </Link>
              </div>

              {shippingAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className="border p-4 rounded-md block cursor-pointer hover:border-blue-500 flex gap-3 mb-3"
                >
                  <input
                    type="radio"
                    name="shipping_address_id"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                    required
                  />
                  <div>
                    <p className="font-semibold">
                      {addr.full_name}
                      {addr.is_default && (
                        <span className="text-sm text-green-600">
                          {" "}
                          (Default)
                        </span>
                      )}
                    </p>
                    <p>
                      {addr.address_line1}
                      {addr.address_line2 && `, ${addr.address_line2}`},{" "}
                      {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p>{addr.country}</p>
                    <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* subtotal + pay */}
            <div className="space-y-4">
              <p>
                Subtotal ({totalQuantity} item{totalQuantity > 1 ? "s" : ""}):{" "}
                <CurrencyFormatter amount={totalPrice} currency="AUD" />
              </p>

              <PrimaryButton className="w-full flex items-center justify-center gap-2 rounded-full">
                <CreditCardIcon className="size-5" />
                Proceed to checkout
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default Index;
