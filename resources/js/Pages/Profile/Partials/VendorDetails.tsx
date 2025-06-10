import InputError from "@/Components/Core/InputError";
import InputLabel from "@/Components/Core/InputLabel";
import Modal from "@/Components/Core/Modal";
import PrimaryButton from "@/Components/Core/PrimaryButton";
import SecondaryButton from "@/Components/Core/SecondaryButton";
import TextInput from "@/Components/Core/TextInput";
import { useForm, usePage } from "@inertiajs/react";
import React, {
  FormEvent,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

interface VendorDetailsProps {
  className?: string;
}

// Suppose weekdayToIndex map is like:
const weekdayToIndex: Record<string, string> = {
  monday: "1",
  tuesday: "2",
  wednesday: "3",
  thursday: "4",
  friday: "5",
  saturday: "6",
  sunday: "0",
};

const indexToWeekday: Record<string, string> = {
  "0": "sunday",
  "1": "monday",
  "2": "tuesday",
  "3": "wednesday",
  "4": "thursday",
  "5": "friday",
  "6": "saturday",
};

interface FormDataType {
  [key: string]: any;
}
interface VendorFormData extends Record<string, string | number | string[]> {
  store_name: string;
  store_address: string;
  start_time: string;
  end_time: string;
  slot_interval: number;
  recurring_closed_days: string[];
  closed_dates: string[];
}

export default function VendorDetails({ className }: VendorDetailsProps) {
  const [showBecomeVendorConfirmation, setShowBecomeVendorConfirmation] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const user = usePage().props.auth.user;
  const token = usePage().props.csrf_token;

  const { data, setData, errors, post, processing, recentlySuccessful } =
    useForm({
      store_name: "",
      store_address: "",
      start_time: "",
      end_time: "",
      slot_interval: 15,
      recurring_closed_days: [] as string[],
      closed_dates: [] as string[],
    });

  const vendor = user.vendor;

  useEffect(() => {
    if (vendor && vendor.status === "approved") {
      const cleanedRecurringDays = (vendor.recurring_closed_days ?? [])
        .flat()
        .map(String)
        .filter(
          (day, index, self) =>
            ["0", "1", "2", "3", "4", "5", "6"].includes(day) &&
            self.indexOf(day) === index
        )
        .map((dayIndex) => indexToWeekday[dayIndex]); // convert "0" => "sunday" for UI

      setData({
        store_name: vendor.store_name ?? "",
        store_address: vendor.store_address ?? "",
        start_time: vendor.business_start_time ?? "",
        end_time: vendor.business_end_time ?? "",
        slot_interval: vendor.slot_interval_minutes ?? 15,
        recurring_closed_days: cleanedRecurringDays, // now day names for UI
        closed_dates:
          vendor.closed_dates
            ?.flat()
            .filter((d): d is string => typeof d === "string") ?? [],
      });
    }
  }, [vendor]);

  const onStoreNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setData("store_name", ev.target.value.toLowerCase().replace(/\s+/g, "-"));
  };

  const becomeVendor: FormEventHandler = (ev: FormEvent<Element>) => {
    ev.preventDefault();

    post(route("vendor.store"), {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
        setSuccessMessage("you can now create and publish products");
      },
      onError: () => {},
    });
  };
  const updateVendor: FormEventHandler = (ev) => {
    ev.preventDefault();
    // Convert day names to indices
    const recurringClosedDaysAsIndices = data.recurring_closed_days
      .map((day) => weekdayToIndex[day.toLowerCase()])
      .filter((val): val is string => typeof val === "string");

    // Then set data with only indices
    setData({
      ...data,
      recurring_closed_days: recurringClosedDaysAsIndices,
    });
    console.log(
      "Final recurring_closed_days sent:",
      recurringClosedDaysAsIndices
    );

    // Submit as usual
    post(route("vendor.store"), {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
        setSuccessMessage("your details were updated");
      },
    });
  };

  const closeModal = () => {
    setShowBecomeVendorConfirmation(false);
  };

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
            <span
              className={`badge ${
                user.vendor.status === "pending"
                  ? "badge-warning"
                  : user.vendor.status === "rejected"
                  ? "badge-error"
                  : "badge-success"
              }`}
            >
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
        {user.vendor &&
          (user.vendor.status === "pending" ||
            user.vendor.status === "rejected") && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {user.vendor.status === "pending" &&
                "Your vendor request is under review. Please wait for approval."}
              {user.vendor.status === "rejected" &&
                "Your vendor request was rejected. Please contact support."}
            </div>
          )}

        {/* Show update form and Stripe if vendor is approved */}
        {user.vendor && user.vendor.status === "approved" && (
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
                  onChange={(e) => setData("store_address", e.target.value)}
                  placeholder="Enter your Store Address"
                />
                <InputError className="mt-2" message={errors.store_address} />
              </div>

              <div className="mb-4">
                <InputLabel htmlFor="start_time" value="Start Time" />
                <TextInput
                  id="start_time"
                  type="time"
                  className="mt-1 block w-full"
                  value={data.start_time}
                  onChange={(e) => setData("start_time", e.target.value)}
                />
                <InputError className="mt-2" message={errors.start_time} />
              </div>

              <div className="mb-4">
                <InputLabel htmlFor="end_time" value="End Time" />
                <TextInput
                  id="end_time"
                  type="time"
                  className="mt-1 block w-full"
                  value={data.end_time}
                  onChange={(e) => setData("end_time", e.target.value)}
                />
                <InputError className="mt-2" message={errors.end_time} />
              </div>

              <div className="mb-4">
                <InputLabel
                  htmlFor="slot_interval"
                  value="Slot Interval (minutes)"
                />
                <TextInput
                  id="slot_interval"
                  type="number"
                  min={5}
                  className="mt-1 block w-full"
                  value={data.slot_interval}
                  onChange={(e) =>
                    setData("slot_interval", Number(e.target.value))
                  }
                />
                <InputError className="mt-2" message={errors.slot_interval} />
              </div>

              <div className="mb-4">
                <InputLabel value="Closed Days" />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                  ].map((day) => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.recurring_closed_days.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setData("recurring_closed_days", [
                              ...data.recurring_closed_days,
                              day,
                            ]);
                          } else {
                            setData(
                              "recurring_closed_days",
                              data.recurring_closed_days.filter(
                                (d) => d !== day
                              )
                            );
                          }
                        }}
                      />
                      <span className="capitalize">{day}</span>
                    </label>
                  ))}
                </div>
                <InputError
                  className="mt-2"
                  message={errors.recurring_closed_days}
                />
              </div>

              <div className="mb-4">
                <InputLabel
                  htmlFor="closed_dates"
                  value="Closed Dates (comma separated)"
                />
                <TextInput
                  id="closed_dates"
                  type="text"
                  className="mt-1 block w-full"
                  placeholder="YYYY-MM-DD, YYYY-MM-DD"
                  value={data.closed_dates.join(", ")}
                  onChange={(e) => {
                    const dates = e.target.value
                      .split(",")
                      .map((date) => date.trim())
                      .filter(Boolean);
                    setData("closed_dates", dates);
                  }}
                />
                <InputError className="mt-2" message={errors.closed_dates} />
              </div>

              <div className="flex items-center gap-4">
                <PrimaryButton disabled={processing}>Update</PrimaryButton>
              </div>
            </form>

            <form
              action={route("stripe.connect")}
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
