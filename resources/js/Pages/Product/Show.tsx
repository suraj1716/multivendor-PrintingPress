import Carousel from "@/Components/Core/Carousel";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Product, VariationTypeOption } from "@/types";
import { arraysAreEqual } from "@/utils/helpers";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

function Show({
  product,
  variationOptions,
}: {
  product: Product;
  variationOptions: number[];
}) {





  const form = useForm<{
    options_ids: Record<string, number>;
    quantity: number;
    price: number | null;
  }>({
    options_ids: {},
    quantity: 1,
    price: null,
  });

  const { url } = usePage();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, VariationTypeOption>
  >({});

const images = useMemo(() => {
  for (let typeId in selectedOptions) {
    const option = selectedOptions[typeId];
    if (Array.isArray(option?.images) && option.images.length > 0) {
      // Ensure each image matches the expected structure
      return option.images.map(image => ({
        id: image.id || 0,  // Default id if missing
        thumb: image.thumb || "/placeholder.jpg",  // Fallback thumb
        small: image.small || image.thumb || "/placeholder.jpg",  // Fallback small
        large: image.large || image.thumb || "/placeholder.jpg",  // Fallback large
      }));
    }
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    // Ensure each image matches the expected structure
    return product.images.map(image => ({
      id: image.id || 0,  // Default id if missing
      thumb: image.thumb || "/placeholder.jpg",  // Fallback thumb
      small: image.small || image.thumb || "/placeholder.jpg",  // Fallback small
      large: image.large || image.thumb || "/placeholder.jpg",  // Fallback large
    }));
  }

  // Return fallback with all necessary properties
  return [{
    id: 0,
    thumb: "/placeholder.jpg",
    small: "/placeholder.jpg",
    large: "/placeholder.jpg"
  }];
}, [product, selectedOptions]);






const computedProduct = useMemo(() => {
  const selectedOptionIds = Object.values(selectedOptions)
    .map((op) => op.id)
    .sort();

  console.log("Selected Option IDs:", selectedOptionIds);

  if (Array.isArray(product.variations)) {
    for (let variation of product.variations) {
      console.log("Variation's option IDs:", variation.variation_type_option_ids);

      let optionIds = variation.variation_type_option_ids.slice().sort();

      if (arraysAreEqual(selectedOptionIds, optionIds)) {
        return {
          ...product,
          price: variation.price,
          quantity: variation.quantity === null ? Number.MAX_VALUE : variation.quantity,
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

  const addToCart = () => {
    form.setData("options_ids", getOptionIdsMap(selectedOptions));
    form.post(route("cart.store", product.id), {
      preserveScroll: true,
      preserveState: true,
      onError: (errors) => {
        console.log(errors);
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
                          className={ "w-[80px] h-[80px] object-cover rounded-md shadow"
                            +
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

  const renderAddToCartButton = () => {
    return (
      <div className="mb-8 flex gap-4">
        <select
          value={form.data.quantity}
          onChange={onQuantityChange}
          className="select select-bordered w-full"
        >
          {Array.from({ length: Math.min(10, computedProduct.quantity) }).map(
            (_, i) => (
              <option key={i + 1} value={i + 1}>
                Quantity: {i + 1}
              </option>
            )
          )}
        </select>
        <button onClick={addToCart} className="btn btn-primary">
          Add To Cart
        </button>
      </div>
    );
  };

  useEffect(() => {
    const isMap = Object.fromEntries(
      Object.entries(selectedOptions).map(
        ([typeId, option]: [string, VariationTypeOption]) => [typeId, option.id]
      )
    );
    console.log(isMap);
    form.setData("options_ids", isMap);
  }, [selectedOptions]);

return (
  <AuthenticatedLayout>
    <Head title={product.title} />

    <div className="container mx-auto p-8">
      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Carousel Section (Images) */}
        <div className="flex justify-center items-center">
       <Carousel
  images={images.map((img) => ({
    ...img,
    className: "w-full h-full object-cover rounded-md shadow",
  }))}
/>
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          {/* Product Title */}
          <h1 className="text-3xl font-semibold">{product.title}</h1>

          {/* Price */}
          <div className="text-3xl font-bold text-gray-800">
            {computedProduct.price &&
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(computedProduct.price)}
          </div>

          {/* Product Variations (e.g., size, color) */}
          <div>{renderProductVariationTypes()}</div>

          {/* Quantity Remaining */}
          {computedProduct.quantity !== undefined && computedProduct.quantity < 10 && (
            <div className="text-red-600 my-4">
              <span>Only {computedProduct.quantity} left in stock</span>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="mt-4">
            {renderAddToCartButton()}
          </div>

          {/* About the Item Section */}
          <div>
            <b className="text-xl">About the Item</b>
            <div
              className="mt-4 prose max-w-full"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
);

}

export default Show;
