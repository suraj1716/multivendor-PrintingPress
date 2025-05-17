import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import VendorDetails from "./Partials/VendorDetails";
import ShippingAddresses, { ShippingAddress } from "./ShippingAddresses";

import { usePage } from '@inertiajs/react';

export default function Edit() {
 const page = usePage<PageProps<{ mustVerifyEmail: boolean; status?: string; shipping_addresses: ShippingAddress[] }>>();


  const { mustVerifyEmail, status, shipping_addresses } = page.props;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Profile
        </h2>
      }
    >
      <Head title="Profile" />

   <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
  {/* ---------- LEFT SIDE ---------- */}
  <div className="space-y-6">
    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
      <UpdateProfileInformationForm
        mustVerifyEmail={mustVerifyEmail}
        status={status}
        className="max-w-xl"
      />
    </div>

    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
      <UpdatePasswordForm className="max-w-xl" />
    </div>

    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
      <DeleteUserForm className="max-w-xl" />
    </div>
  </div>

  {/* ---------- RIGHT SIDE ---------- */}
  <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
    <VendorDetails />

    {/* add some vertical breathing room before the addresses */}
    <div className="mt-10">
      <ShippingAddresses shipping_addresses={shipping_addresses} />
    </div>
  </div>
</div>

    </AuthenticatedLayout>
  );
}
