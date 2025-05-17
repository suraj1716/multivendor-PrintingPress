import InputError from "@/Components/Core/InputError";
import InputLabel from "@/Components/Core/InputLabel";
import PrimaryButton from "@/Components/Core/PrimaryButton";
import SecondaryButton from "@/Components/Core/SecondaryButton";
import TextInput from "@/Components/Core/TextInput";
import Modal from "@/Components/Core/Modal";
import { useForm, usePage } from "@inertiajs/react";
import { useState, FormEventHandler, useEffect } from "react";
import { Inertia } from '@inertiajs/inertia';

export interface ShippingAddress {
  id?: number;
  full_name: string;
  phone:string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
   is_default: boolean;
}

export default function ShippingAddresses({
  className = "",
  shipping_addresses,
}: {
  className?: string;
  shipping_addresses: ShippingAddress[];
}) {
  type ShippingAddressForm = {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  };



const [editingAddressId, setEditingAddressId] = useState<number | null | undefined>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDefaultId, setSelectedDefaultId] = useState<number | null>(
  shipping_addresses.find((addr) => addr.is_default)?.id || null
);
const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);



const closeModal = () => {
  reset();
  setShowModal(false);
  setEditingAddressId(null);
};


  const { data, setData, post, reset, errors, processing, recentlySuccessful } =
    useForm<ShippingAddressForm>({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default: false,
    });




useEffect(() => {
  setSelectedDefaultId(shipping_addresses.find((a) => a.is_default)?.id || null);
}, [shipping_addresses]);


const submit: FormEventHandler = (e) => {
  e.preventDefault();

  if (editingAddressId) {
    // Editing existing address
    Inertia.put(route("shipping-addresses.update", editingAddressId), data, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setShowModal(false);
        setEditingAddressId(null);
        Inertia.visit(route('profile.edit'));
      },
    });
  } else {
    // Creating new address
    post(route("shipping-addresses.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setShowModal(false);
        Inertia.visit(route('profile.edit'));
      },
    });
  }
};


  return (
    <section className={className}>
      <header>
        <h2 className="flex justify-between mb-6 text-lg font-medium text-gray-900 dark:text-gray-100">
          Shipping Addresses
        </h2>
      </header>

      <div className="space-y-4">

{shipping_addresses && shipping_addresses.length > 0 ? (
  shipping_addresses.map((addr) => (
    <div key={addr.id} className="p-4 border rounded-md bg-white shadow-sm relative">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-sm text-gray-700">{addr.address_line_1}</p>
      {addr.address_line_2 && (
        <p className="text-sm text-gray-700">{addr.address_line_2}</p>
      )}
      <p className="text-sm text-gray-700">
        {addr.city}, {addr.state} {addr.postal_code}
      </p>
      <p className="text-sm text-gray-700">{addr.country}</p>
    </div>

    <div className=" ml-4 mt-3">
      <label className="flex items-center text-sm text-gray-700">
        <input
          type="radio"
          name="defaultAddress"
          value={addr.id}
          checked={selectedDefaultId === addr.id}
          onChange={() => {
            setSelectedDefaultId(addr.id || null);
            Inertia.patch(route('shipping-addresses.set-default', addr.id));
          }}
          className="mr-2"
        />
        Default
      </label>
    </div>


    <div>

    <button
  onClick={() => {
    setEditingAddress(addr);
    setData({
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      address_line1: addr.address_line_1 || "",
      address_line2: addr.address_line_2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country || "",
      is_default: addr.is_default || false,
    });
    setShowModal(true);
  }}
  className="ml-2 mt-2 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
>
  Edit
</button>
</div>


  </div>
</div>

  ))
) : (
  <p className="text-sm text-gray-600">No addresses saved yet.</p>
)}


      </div>

      <div className="mt-6">
        <PrimaryButton onClick={() => setShowModal(true)}>
          Add New Address
        </PrimaryButton>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={submit} className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Add Shipping Address
          </h3>

          <div>
            <InputLabel htmlFor="full_name" value="full_name" />
            <TextInput
              id="full_name"
              value={data.full_name}
              onChange={(e) => setData("full_name", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.full_name} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="phone" value="phone" />
            <TextInput
              id="phone"
              value={data.phone}
              onChange={(e) => setData("phone", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.phone} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="address_line1" value="Address Line 1" />
            <TextInput
              id="address_line1"
              value={data.address_line1}
              onChange={(e) => setData("address_line1", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.address_line1} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="address_line_2" value="Address Line 2" />
            <TextInput
              id="address_line_2"
              value={data.address_line2 || ""}
              onChange={(e) => setData("address_line2", e.target.value)}
              className="mt-1 block w-full"
            />
            <InputError message={errors.address_line2} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="city" value="City" />
            <TextInput
              id="city"
              value={data.city}
              onChange={(e) => setData("city", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.city} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="state" value="State" />
            <TextInput
              id="state"
              value={data.state}
              onChange={(e) => setData("state", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.state} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="postal_code" value="Postal Code" />
            <TextInput
              id="postal_code"
              value={data.postal_code}
              onChange={(e) => setData("postal_code", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.postal_code} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="country" value="Country" />
            <TextInput
              id="country"
              value={data.country}
              onChange={(e) => setData("country", e.target.value)}
              className="mt-1 block w-full"
              required
            />
            <InputError message={errors.country} className="mt-2" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <SecondaryButton onClick={closeModal}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={processing}>
              Save
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}
