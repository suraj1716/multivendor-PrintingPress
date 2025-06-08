import AdvanceProductRating from "@/Components/App/AdvanceProductRating";
import ProductRating from "@/Components/App/ProductRating";
import Rating from "@/Components/App/ProductReview";
import ProductReview from "@/Components/App/ProductReview";
import Review from "@/Components/App/ProductReview";
import Breadcrumbs from "@/Components/Core/Breadcrumbs";
import Carousel from "@/Components/Core/Carousel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Product, VariationTypeOption } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { arraysAreEqual } from "@/utils/helpers";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useState } from "react";

function Show({
  product,
  ratingBreakdown,
  variationOptions,
}: {
  product: Product;
  variationOptions: number[];
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
}) {
  const form = useForm<{
    option_ids: Record<string, number>;
    quantity: number;
    price: number | null;
    wantsAttachment: boolean;
    attachment?: File | null;
  }>({
    option_ids: {},
    quantity: 1,
    price: 0,
    wantsAttachment: false,
    attachment: null,
  });
  const reviews = product.reviews;
  const designCharge = 20;
  const [wantsAttachment, setWantsAttachment] = useState(false);
  const { url } = usePage();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, VariationTypeOption>
  >({});
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  const { auth } = usePage().props as {
    auth: {
      user: {
        id: number;
      } | null;
    };
  };

  const images = useMemo(() => {
    const imageSet = new Map<
      number,
      { id: number; thumb: string; small: string; large: string }
    >();

    // Collect images from all selected options
    for (let option of Object.values(selectedOptions)) {
      if (Array.isArray(option.images)) {
        option.images.forEach((image) => {
          const id = image.id || 0;
          if (!imageSet.has(id)) {
            imageSet.set(id, {
              id,
              thumb: image.thumb || "/placeholder.jpg",
              small: image.small || image.thumb || "/placeholder.jpg",
              large: image.large || image.thumb || "/placeholder.jpg",
            });
          }
        });
      }
    }

    // If no images from selected options, use product images
    if (imageSet.size === 0 && Array.isArray(product.images)) {
      product.images.forEach((image) => {
        const id = image.id || 0;
        if (!imageSet.has(id)) {
          imageSet.set(id, {
            id,
            thumb: image.thumb || "/placeholder.jpg",
            small: image.small || image.thumb || "/placeholder.jpg",
            large: image.large || image.thumb || "/placeholder.jpg",
          });
        }
      });
    }

    // If still no images, use placeholder
    if (imageSet.size === 0) {
      imageSet.set(0, {
        id: 0,
        thumb: "/placeholder.jpg",
        small: "/placeholder.jpg",
        large: "/placeholder.jpg",
      });
    }

    return Array.from(imageSet.values());
  }, [product, selectedOptions]);

  const computedProduct = useMemo(() => {
    const selectedOptionIds = Object.values(selectedOptions)
      .map((op) => op.id)
      .sort();

    if (Array.isArray(product.variations)) {
      for (let variation of product.variations) {
        let optionIds = variation.variation_type_option_ids.slice().sort();

        if (arraysAreEqual(selectedOptionIds, optionIds)) {
          return {
            ...product,
            price: variation.price,
            quantity:
              variation.quantity === null
                ? Number.MAX_VALUE
                : variation.quantity,
          };
        }
      }
    }

    return {
      price: product.price,
      quantity: product.quantity,
    };
  }, [product, selectedOptions]);

  useEffect(() => {
    for (let type of product.variationTypes) {
      const selectedOptionId: number = variationOptions[type.id];
      chooseOption(
        type.id,
        type.options.find((option) => option.id === selectedOptionId) ||
          type.options[0],
        false
      );
    }
  }, []);

  const getOptionIdsMap = (newOptions: object): Record<string, number> => {
    return Object.fromEntries(
      Object.entries(newOptions).map(([a, b]) => {
        return [a, b.id];
      })
    );
  };

  const chooseOption = (
    typeId: number,
    option: VariationTypeOption,
    updateRouter: boolean = true
  ) => {
    setSelectedOptions((prevSelectedOptions) => {
      const newOptions = {
        ...prevSelectedOptions,
        [typeId]: option,
      };

      if (option.images?.length > 0) {
        const imageId = option.images[0]?.id;
        const index = images.findIndex((img) => img.id === imageId);
        if (index !== -1) setCarouselIndex(index);
      }

      if (updateRouter) {
        router.get(
          url,
          {
            options: getOptionIdsMap(newOptions),
          },
          {
            preserveScroll: true,
            preserveState: true,
          }
        );
      }
      return newOptions;
    });
  };

  const onQuantityChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    form.setData("quantity", parseInt(ev.target.value));
  };

  console.log("review breakdown", ratingBreakdown);

  const finalPrice = useMemo(() => {
    const basePrice = Number(computedProduct.price); // ensure it's a number
    return form.data.wantsAttachment ? basePrice + designCharge : basePrice;
  }, [computedProduct.price, form.data.wantsAttachment]);

  useEffect(() => {
    form.setData("price", finalPrice);
  }, [finalPrice]);

  const addToCart = () => {
    const requiredVariationTypeIds = product.variationTypes.map((vt) => vt.id);
    const selectedOptionTypeIds = Object.keys(selectedOptions).map(Number);

    const allOptionsSelected = requiredVariationTypeIds.every((id) =>
      selectedOptionTypeIds.includes(id)
    );

    if (!allOptionsSelected) {
      alert("Please select all product options before adding to cart.");
      return;
    }

    const formData = new FormData();

    formData.append("price", String(finalPrice));
    form.data.quantity; // ✅ correct
    // ✅ correct way to update
    formData.append("quantity", form.data.quantity.toString());
    Object.entries(selectedOptions).forEach(([typeId, option]) => {
      formData.append(`option_ids[${typeId}]`, String(option.id));
    });

    if (form.data.attachment) {
      formData.append("attachment", form.data.attachment);
    }

    router.post(route("cart.store", product.id), formData, {
      preserveScroll: true,
      preserveState: true,
      forceFormData: true,
      onError: (errors) => {
        console.error("Error adding to cart:", errors);
      },
      onSuccess: () => {
        console.log("Product successfully added to cart.");
      },
    });
  };

  const renderProductVariationTypes = () => {
    return (
      <>
        {product.variationTypes.map((type) => (
          <div key={type.id} className="mb-4">
            <b className="block mb-2">{type.name}</b>

            {type.type === "Image" && (
              <div className="flex gap-2 flex-wrap">
                {type.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => chooseOption(type.id, option)}
                    className={
                      "cursor-pointer rounded-md transition-all " +
                      (selectedOptions[type.id]?.id === option.id
                        ? "outline outline-4 outline-primary"
                        : "")
                    }
                  >
                    {option.images?.[0]?.thumb && (
                      <img
                        src={option.images[0].thumb}
                        alt={option.name || ""}
                        className="w-[80px] h-[80px] object-cover rounded-md shadow"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {type.type === "Radio" && (
              <div className="mt-3 flex select-none flex-wrap items-center gap-2">
                {type.options.map((option) => (
                  <label key={option.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`variation_type_${type.id}`}
                      value={option.id}
                      className="peer sr-only"
                      onChange={() => chooseOption(type.id, option)}
                      checked={selectedOptions[type.id]?.id === option.id}
                    />
                    <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-semibold transition-all">
                      {option.name}
                    </p>
                  </label>
                ))}
              </div>
            )}

{type.type === "Select" && (
  <div className="mt-3">
    <select
      className="w-full rounded-lg border border-black px-4 py-2 font-semibold transition-all"
      value={selectedOptions[type.id]?.id ?? ""}
      onChange={(e) => {
        const selectedId = Number(e.target.value); // ✅ convert to number
        const selected = type.options.find(opt => opt.id === selectedId);
        if (selected) chooseOption(type.id, selected);
      }}
    >
      <option value="" disabled>Select an option</option>
      {type.options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>

)}


          </div>
        ))}
      </>
    );
  };

  //   const renderVariationSelectors = () => (
  //     <>
  //       {product.variationTypes.map((type) => (

  // <div className="mt-3 flex select-none flex-wrap items-center gap-1">
  //           <label className="">
  //             <input type="radio" name="type" value="Powder" className="peer sr-only" checked />
  //             <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">{type.name}</p>
  //           </label>
  //           <label className="">
  //             <input type="radio" name="type" value="Whole Bean" className="peer sr-only" />
  //             <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">Whole Bean</p>
  //           </label>
  //           <label className="">
  //             <input type="radio" name="type" value="Groud" className="peer sr-only" />
  //             <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">Groud</p>
  //           </label>
  //         </div>

  //         // <div key={type.id} className="mb-6">
  //         //   <h3 className="text-sm font-medium text-gray-700 mb-2">
  //         //     {type.name}
  //         //   </h3>

  //         //   {type.type === "Image" && (
  //         //     <div className="flex space-x-3">
  //         //       {type.options.map((option) => (
  //         //         <button
  //         //           key={option.id}
  //         //           onClick={() => chooseOption(type.id, option)}
  //         //           className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
  //         //             selectedOptions[type.id]?.id === option.id
  //         //               ? "border-indigo-500"
  //         //               : "border-gray-300"
  //         //           }`}
  //         //           style={{
  //         //             backgroundImage: option.images?.[0]?.thumb
  //         //               ? `url(${option.images[0].thumb})`
  //         //               : undefined,
  //         //             backgroundSize: "cover",
  //         //             backgroundPosition: "center",
  //         //           }}
  //         //           aria-label={option.name}
  //         //           title={option.name}
  //         //         />
  //         //       ))}
  //         //     </div>
  //         //   )}

  //         //   {type.type === "Radio" && (
  //         //     <select
  //         //       value={selectedOptions[type.id]?.id || ""}
  //         //       onChange={(e) => {
  //         //         const option = type.options.find(
  //         //           (o) => o.id === Number(e.target.value)
  //         //         );
  //         //         if (option) chooseOption(type.id, option);
  //         //       }}
  //         //       className="rounded border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
  //         //     >
  //         //       {type.options.map((option) => (
  //         //         <option key={option.id} value={option.id}>
  //         //           {option.name}
  //         //         </option>
  //         //       ))}
  //         //     </select>
  //         //   )}
  //         // </div>

  //       ))}
  //     </>
  //   );

  console.log("Quantity being sent:", form.data.quantity);

  return (
    <AuthenticatedLayout>
      <Head title={product.title} />

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">

             <div className="ml-20">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              {
                label: product.user.store_name || "Vendor",
                href: route("vendor.profile", {
                  vendor: product.user.store_name,
                }),
              },
              {
                label: product.department?.name || "Department",
                href: route("product.byDepartment", product.department.name),
              },
              {
                label: product.category?.name || "Category",
                href: route("product.byDepartment", product.department.name),
              },
              { label: product.title, current: true },
            ]}
          />
          </div>

          <div className="lg:col-gap-12 xl:col-gap-16 mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3 lg:row-end-1">
              <Carousel
                images={images.map((img) => ({
                  ...img,
                  alt: product.title,
                }))}
                index={carouselIndex}
                onIndexChange={setCarouselIndex}
                // className="w-full h-[400px]"
              />
            </div>

            <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
              <h1 className="sm: text-2xl font-bold text-gray-900 sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-5 flex items-center">
                <h2 className="text-sm font-semibold text-indigo-600 tracking-wide mb-2">
                  <Link
                    href={route("vendor.profile", product.user.store_name)}
                    className="hover:underline"
                  >
                    {product.user.name}
                  </Link>
                  &nbsp;in&nbsp;
                  <Link
                    href={route(
                      "product.byDepartment",
                      product.department.slug
                    )}
                    className="hover:underline"
                  >
                    {product.department.name}
                  </Link>
                </h2>
              </div>

              <div className=" flex items-center">
                <div className="flex items-center">
                  <ProductRating
                    size="md"
                    rating={product.average_rating ?? 0}
                    reviewsCount={product.reviews_count ?? 0}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center">
                <h2 className="mt-8 text-base text-gray-900">
                  {renderProductVariationTypes()}
                </h2>
              </div>

              <div className="mt-5 flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.data.wantsAttachment}
                    onChange={(e) =>
                      form.setData("wantsAttachment", e.target.checked)
                    }
                    className="form-checkbox text-indigo-600"
                  />
                  <span className="ml-3 text-gray-800">
                    Add attachment (adds ${designCharge} to price)?
                  </span>
                </label>
              </div>

              {/* Attachment upload */}
              <div className="mt-5 flex items-center">
                {form.data.wantsAttachment && (
                  <div className="mb-6">
                    <label
                      htmlFor="attachment"
                      className="block mb-2 text-sm font-semibold text-gray-700"
                    >
                      Upload Attachment
                    </label>
                    <input
                      id="attachment"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        form.setData("attachment", e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
                    />
                    {form.errors.attachment && (
                      <p className="text-red-600 text-xs mt-1">
                        {form.errors.attachment}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* <div className="mt-3 flex select-none flex-wrap items-center gap-1">
          <label className="">
            <input type="radio" name="type" value="Powder" className="peer sr-only" checked />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">Powder</p>
          </label>
          <label className="">
            <input type="radio" name="type" value="Whole Bean" className="peer sr-only" />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">Whole Bean</p>
          </label>
          <label className="">
            <input type="radio" name="type" value="Groud" className="peer sr-only" />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">Groud</p>
          </label>
        </div> */}

              {/* <h2 className="mt-8 text-base text-gray-900">Choose subscription</h2>
        <div className="mt-3 flex select-none flex-wrap items-center gap-1">
          <label className="">
            <input type="radio" name="subscription" value="4 Months" className="peer sr-only" />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">4 Months</p>
            <span className="mt-1 block text-center text-xs">$80/mo</span>
          </label>
          <label className="">
            <input type="radio" name="subscription" value="8 Months" className="peer sr-only" checked />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">8 Months</p>
            <span className="mt-1 block text-center text-xs">$60/mo</span>
          </label>
          <label className="">
            <input type="radio" name="subscription" value="12 Months" className="peer sr-only" />
            <p className="peer-checked:bg-black peer-checked:text-white rounded-lg border border-black px-6 py-2 font-bold">12 Months</p>
            <span className="mt-1 block text-center text-xs">$40/mo</span>
          </label>
        </div> */}

              <div className="mt-5 flex flex-col items-center justify-between  border-t border-b sm:flex-row sm:space-y-0">
                <div className="flex items-end">
                  <h1 className="text-3xl font-bold">
                    <CurrencyFormatter amount={finalPrice} currency="AUD" />
                  </h1>
                  <span className="text-base"></span>
                </div>

                <button
                  onClick={addToCart}
                  type="button"
                  className="mr-10 inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-900 bg-none px-12 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out focus:shadow hover:bg-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Add to cart
                </button>
              </div>

              <ul className="mt-8 space-y-2">
                <li className="flex items-center text-left text-sm font-medium text-gray-600">
                  <svg
                    className="mr-2 block h-5 w-5 align-middle text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      className=""
                    ></path>
                  </svg>
                  Free shipping worldwide
                </li>

                <li className="flex items-center text-left text-sm font-medium text-gray-600">
                  <svg
                    className="mr-2 block h-5 w-5 align-middle text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      className=""
                    ></path>
                  </svg>
                  Cancel Anytime
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <div className="border-b border-gray-300">
                <nav className="flex gap-4">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("description");
                    }}
                    className={`border-b-2 py-4 text-sm font-medium hover:border-gray-400 hover:text-gray-800 ${
                      activeTab === "description"
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-600"
                    }`}
                  >
                    Description
                  </a>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("reviews");
                    }}
                    className={`inline-flex items-center border-b-2 py-4 text-sm font-medium hover:border-gray-400 hover:text-gray-800 ${
                      activeTab === "reviews"
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-600"
                    }`}
                  >
                    Reviews
                    <span className="ml-2 block rounded-full bg-gray-500 px-2 py-px text-xs font-bold text-gray-100">
                      {product.reviews_count || 0}
                    </span>
                  </a>
                </nav>
              </div>

              <div className="mt-8 flow-root sm:mt-12">
                {activeTab === "description" && (
                  <>
                    <h1 className="text-3xl font-bold">
                      Delivered To Your Door
                    </h1>
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Quia accusantium nesciunt fuga.
                    </p>
                    <h1 className="mt-8 text-3xl font-bold">
                      From the Fine Farms of Brazil
                    </h1>
                    <p className="mt-4">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Optio numquam enim facere.
                    </p>
                    <p className="mt-4">
                      Amet consectetur adipisicing elit. Optio numquam enim
                      facere. Lorem ipsum dolor sit amet consectetur,
                      adipisicing elit. Dolore rerum nostrum eius facere, ad
                      neque.
                    </p>
                  </>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

                    {/* Your PrSoductReview summary component */}
                    {/* <ProductRating
      size="md"
      rating={product.average_rating ?? 0}
      reviewsCount={product.reviews_count ?? 0}
    /> */}

                    {/* Existing reviews list - you can map through actual reviews here */}
                    {/* <div className="mt-10 space-y-8">
      {product.reviews_count && product.reviews_count.length > 0 ? (
        product.reviews.map((review) => (
          <div key={review.id} className="flex items-start space-x-5">
            <img
              className="mr-5 block h-8 w-8 max-w-full text-left align-middle sm:h-16 sm:w-16 rounded-full"
              src={review.user.avatar_url || "https://www.uifaces.co/wp-content/themes/uifaces-theme/src/img/home-animation/avatar-3.svg"}
              alt={`${review.user.name} Profile Picture`}
            />
            <div className="w-full text-left">
              <div className="mb-2 flex flex-col justify-between text-gray-600 sm:flex-row">
                <h3 className="font-medium">{review.user.name}</h3>
                <time className="text-xs" dateTime={review.created_at}>
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
              </div>
              <p className="text-sm">{review.comment}</p>
              <div className="mt-5 flex items-center justify-between text-gray-600">
                <a
                  title="Likes"
                  href="#"
                  className="group flex cursor-pointer items-center justify-around"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 rounded-full p-1 group-hover:bg-red-200 group-hover:text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {review.likes_count ?? 0}
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div> */}

                    {/* Your review submission form */}
                    <div className="mt-5">
                      <AdvanceProductRating
                        rating={product.average_rating ?? 0}
                        reviewsCount={product.reviews_count ?? 0}
                        ratingBreakdown={ratingBreakdown}
                        productId={product.id}
                        reviews={reviews} // ← your mapped backend reviews
                        authUserId={auth?.user?.id ?? null}
                      />

                      <div className="mt-10 bg-background-gray p-6 rounded-lg  shadow-md ">
                        <h2 className="text-2xl font-semibold mb-4">
                          Customers Words
                        </h2>
                        <ProductReview
                          productId={product.id}
                          reviews={product.reviews}
                          authUserId={auth?.user?.id ?? null}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AuthenticatedLayout>
  );
}

export default Show;
