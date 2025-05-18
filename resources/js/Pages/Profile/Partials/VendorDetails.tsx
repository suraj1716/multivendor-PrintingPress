import InputError from "@/Components/Core/InputError";
import InputLabel from "@/Components/Core/InputLabel";
import Modal from "@/Components/Core/Modal";
import PrimaryButton from "@/Components/Core/PrimaryButton";
import SecondaryButton from "@/Components/Core/SecondaryButton";
import TextInput from "@/Components/Core/TextInput";
import { useForm,usePage } from "@inertiajs/react";
import React,{FormEvent, FormEventHandler,useRef,useState} from "react";


interface VendorDetailsProps {
  className?: string;
}
export default function VendorDetails({ className }: VendorDetailsProps) {

  const [showBecomeVendorConfirmation, setShowBecomeVendorConfirmation]=useState(false);
  const [successMessage, setSuccessMessage]=useState('');
  const user=usePage().props.auth.user;
  const token=usePage().props.csrf_token;

  const{
data,
setData,
errors,
post,
processing,
recentlySuccessful,
  }=useForm({
store_name:user.vendor?.store_name || user.name.toLowerCase().replace(/\s+/g,'-'),
store_address:user.vendor?.store_address
  });

  const onStoreNameChange=(ev:React.ChangeEvent<HTMLInputElement>)=>{
    setData('store_name', ev.target.value.toLowerCase().replace(/\s+/g, '-'))
  }


const becomeVendor:FormEventHandler=(ev:FormEvent<Element>)=>{
  ev.preventDefault();

  post(route('vendor.store'),{
    preserveScroll:true,
    onSuccess:()=>{

      closeModal();
      setSuccessMessage('you can now create and publish products');
    },
    onError:()=>{

    },
  })
}
const updateVendor:FormEventHandler=(ev:FormEvent<Element>)=>{
ev.preventDefault();

post(route('vendor.store'),{
    preserveScroll:true,
    onSuccess:()=>{

      closeModal();
      setSuccessMessage('your details were updated');
    },
    onError:()=>{

    },
      })
}


const closeModal=()=>{
  setShowBecomeVendorConfirmation(false);
}




  return (
   <section className={className}>
  {recentlySuccessful && (
    <div className="toast toast-top toast-end">
      <div className="alert alert-success">
        <span>{successMessage}</span>
      </div>
    </div>
  )}

  <header>
    <h2 className="flex justify-between mb-8 text-lg font-medium text-gray-900 dark:text-gray-100">
      Vendor Details
      {user.vendor?.status && (
        <span className={`badge ${
          user.vendor.status === 'pending' ? 'badge-warning' :
          user.vendor.status === 'rejected' ? 'badge-error' :
          'badge-success'
        }`}>
          {user.vendor.status_label}
        </span>
      )}
    </h2>
  </header>

  <div>
    {/* Show Become Vendor button if user is NOT a vendor */}
    {!user.vendor && (
      <PrimaryButton
        disabled={processing}
        onClick={() => setShowBecomeVendorConfirmation(true)}
      >
        Become a Vendor
      </PrimaryButton>
    )}

    {/* Show nothing if vendor status is pending or rejected */}
    {user.vendor && (user.vendor.status === 'pending' || user.vendor.status === 'rejected') && (
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {user.vendor.status === 'pending' &&
          "Your vendor request is under review. Please wait for approval."}
        {user.vendor.status === 'rejected' &&
          "Your vendor request was rejected. Please contact support."}
      </div>
    )}

    {/* Show update form and Stripe if vendor is approved */}
    {user.vendor && user.vendor.status === 'approved' && (
      <>
        <form onSubmit={updateVendor}>
          <div className="mb-4">
            <InputLabel htmlFor="store_name" value="Store Name" />
            <TextInput
              id="store_name"
              className="mt-1 block w-full"
              value={data.store_name}
              onChange={onStoreNameChange}
              required
              isFocused
              autoComplete="store_name"
            />
            <InputError className="mt-2" message={errors.store_name} />
          </div>

          <div className="mb-4">
            <InputLabel htmlFor="store_address" value="Store Address" />
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              value={data.store_address}
              onChange={(e) => setData('store_address', e.target.value)}
              placeholder="Enter your Store Address"
            />
            <InputError className="mt-2" message={errors.store_address} />
          </div>

          <div className="flex items-center gap-4">
            <PrimaryButton disabled={processing}>Update</PrimaryButton>
          </div>
        </form>

        <form
          action={route('stripe.connect')}
          method="post"
          className="my-8"
        >
          <input type="hidden" name="_token" value={token} />
          {user.stripe_account_active && (
            <div className="text-center text-gray-600 my-4 text-sm">
              You are successfully connected to Stripe.
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            disabled={user.stripe_account_active}
          >
            Connect to Stripe
          </button>
        </form>
      </>
    )}
  </div>

  <Modal show={showBecomeVendorConfirmation} onClose={closeModal}>
    <form onSubmit={becomeVendor} className="p-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Are you sure you want to be a Vendor?
      </h2>
      <div className="mt-6 flex justify-end">
        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
        <PrimaryButton className="ms-3" disabled={processing}>
          Confirm
        </PrimaryButton>
      </div>
    </form>
  </Modal>
</section>

  );
}

