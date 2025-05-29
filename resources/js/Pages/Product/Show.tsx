import Review from "@/Components/App/Review";
import Carousel from "@/Components/Core/Carousel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Product, VariationTypeOption } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { arraysAreEqual } from "@/utils/helpers";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useState } from "react";

function Show({
  product,
  variationOptions,
}: {
  product: Product;
  variationOptions: number[];
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
  const designCharge = 20;
  const [wantsAttachment, setWantsAttachment] = useState(false);
  const { url } = usePage();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, VariationTypeOption>
  >({});
  const [carouselIndex, setCarouselIndex] = useState(0);

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
          <div key={type.id}>
            <b>{type.name}</b>

            {type.type === "Image" && (
              <div className="flex gap-2 mb-4">
                {type.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => chooseOption(type.id, option)}
                  >
                    {Array.isArray(option.images) &&
                      option.images.length > 0 &&
                      option.images[0]?.thumb && (
                        <img
                          src={option.images[0].thumb}
                          alt={option.name || ""}
                          className={
                            "w-[80px] h-[80px] object-cover rounded-md shadow" +
                            (selectedOptions[type.id]?.id === option.id
                              ? "outline outline-4 outline-primary"
                              : "")
                          }
                        />
                      )}
                  </div>
                ))}
              </div>
            )}

            {type.type === "Radio" && (
              <div className="flex join mb-4">
                {type.options.map((option) => (
                  <input
                    key={option.id}
                    onChange={() => chooseOption(type.id, option)}
                    className="join-item btn"
                    type="radio"
                    value={option.id}
                    checked={selectedOptions[type.id]?.id === option.id}
                    name={`variation_type_${type.id}`}
                    aria-label={option.name}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderVariationSelectors = () => (
    <>
      {product.variationTypes.map((type) => (
        <div key={type.id} className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {type.name}
          </h3>

          {type.type === "Image" && (
            <div className="flex space-x-3">
              {type.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => chooseOption(type.id, option)}
                  className={`w-8 h-8 rounded-full border-2 focus:outline-none ${
                    selectedOptions[type.id]?.id === option.id
                      ? "border-indigo-500"
                      : "border-gray-300"
                  }`}
                  style={{
                    backgroundImage: option.images?.[0]?.thumb
                      ? `url(${option.images[0].thumb})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  aria-label={option.name}
                  title={option.name}
                />
              ))}
            </div>
          )}

          {type.type === "Radio" && (
            <select
              value={selectedOptions[type.id]?.id || ""}
              onChange={(e) => {
                const option = type.options.find(
                  (o) => o.id === Number(e.target.value)
                );
                if (option) chooseOption(type.id, option);
              }}
              className="rounded border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            >
              {type.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </>
  );

  console.log("Quantity being sent:", form.data.quantity);

  return (
    <AuthenticatedLayout>
      <Head title={product.title} />

      <section className="text-gray-700 body-font overflow-hidden bg-white">
        <div className="container px-5 py-16 mx-auto">
          <div className="lg:flex lg:space-x-12">
            {/* Image Section */}
            <div className="lg:w-1/2 w-full mb-10 lg:mb-0 rounded-lg shadow-lg overflow-hidden">
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

            {/* Product Details */}
            <div className="lg:w-1/2 w-full">
              <h2 className="text-sm font-semibold text-indigo-600 tracking-wide mb-2">
                <Link
                  href={route("vendor.profile", product.user.store_name)}
                  className="hover:underline"
                >
                  {product.user.name}
                </Link>
                &nbsp;in&nbsp;
                <Link
                  href={route("product.byDepartment", product.department.slug)}
                  className="hover:underline"
                >
                  {product.department.name}
                </Link>
              </h2>

              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Rating SVG icons placeholder */}
              {/* Add rating stars here */}

              <p
                className="leading-relaxed text-lg mb-6"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Variation selectors */}
              {renderVariationSelectors()}

              <div className="mt-6 mb-6 flex items-center space-x-4">
                <label htmlFor="quantity" className="font-semibold">
                  Quantity:
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (form.data.quantity > 1) {
                      form.setData("quantity", form.data.quantity - 1);
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>

                <input
                  type="number"
                  id="quantity"
                  value={form.data.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      // Clamp between 1 and max available quantity
                      const clamped = Math.min(
                        Math.max(val, 1),
                        computedProduct.quantity
                      );
                      form.setData("quantity", clamped);
                    }
                  }}
                  min={1}
                  max={computedProduct.quantity}
                  className="w-16 text-center border border-gray-300 rounded py-1"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (form.data.quantity < computedProduct.quantity) {
                      form.setData("quantity", form.data.quantity + 1);
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>





              {/* Attachment checkbox */}
              <div className="mb-6">
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

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-indigo-700">
                  {finalPrice !== null && (
                    <CurrencyFormatter amount={finalPrice} currency="AUD" />
                  )}
                </span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="w-full md:w-auto text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 rounded py-3 px-8 text-lg font-semibold transition"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold mb-6">Leave a Review</h2>
            <Review productId={product.id} />
          </div>
        </div>
      </section>
    </AuthenticatedLayout>
  );
}

export default Show;
