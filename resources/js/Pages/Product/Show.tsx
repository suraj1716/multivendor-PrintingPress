// import Carousel from "@/Components/Core/Carousel";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Product, VariationTypeOption } from "@/types";
// import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
// import { arraysAreEqual } from "@/utils/helpers";
// import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
// import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

// function Show({
//   product,
//   variationOptions,
// }: {
//   product: Product;
//   variationOptions: number[];
// }) {
//   const form = useForm<{
//     options_ids: Record<string, number>;
//     quantity: number;
//     price: number | null;
//   }>({
//     options_ids: {},
//     quantity: 1,
//     price: null,
//   });

//   const { url } = usePage();

//   const [selectedOptions, setSelectedOptions] = useState<
//     Record<number, VariationTypeOption>
//   >({});

//   const images = useMemo(() => {
//     const imageSet = new Map<
//       number,
//       { id: number; thumb: string; small: string; large: string }
//     >();

//     // Collect images from all selected options
//     for (let option of Object.values(selectedOptions)) {
//       if (Array.isArray(option.images)) {
//         option.images.forEach((image) => {
//           const id = image.id || 0;
//           if (!imageSet.has(id)) {
//             imageSet.set(id, {
//               id,
//               thumb: image.thumb || "/placeholder.jpg",
//               small: image.small || image.thumb || "/placeholder.jpg",
//               large: image.large || image.thumb || "/placeholder.jpg",
//             });
//           }
//         });
//       }
//     }

//     // If no images from selected options, use product images
//     if (imageSet.size === 0 && Array.isArray(product.images)) {
//       product.images.forEach((image) => {
//         const id = image.id || 0;
//         if (!imageSet.has(id)) {
//           imageSet.set(id, {
//             id,
//             thumb: image.thumb || "/placeholder.jpg",
//             small: image.small || image.thumb || "/placeholder.jpg",
//             large: image.large || image.thumb || "/placeholder.jpg",
//           });
//         }
//       });
//     }

//     // If still no images, use placeholder
//     if (imageSet.size === 0) {
//       imageSet.set(0, {
//         id: 0,
//         thumb: "/placeholder.jpg",
//         small: "/placeholder.jpg",
//         large: "/placeholder.jpg",
//       });
//     }

//     return Array.from(imageSet.values());
//   }, [product, selectedOptions]);

//   const computedProduct = useMemo(() => {
//     const selectedOptionIds = Object.values(selectedOptions)
//       .map((op) => op.id)
//       .sort();

//     if (Array.isArray(product.variations)) {
//       for (let variation of product.variations) {
//         let optionIds = variation.variation_type_option_ids.slice().sort();

//         if (arraysAreEqual(selectedOptionIds, optionIds)) {
//           return {
//             ...product,
//             price: variation.price,
//             quantity:
//               variation.quantity === null
//                 ? Number.MAX_VALUE
//                 : variation.quantity,
//           };
//         }
//       }
//     }

//     return {
//       price: product.price,
//       quantity: product.quantity,
//     };
//   }, [product, selectedOptions]);

//   useEffect(() => {
//     for (let type of product.variationTypes) {
//       const selectedOptionId: number = variationOptions[type.id];
//       chooseOption(
//         type.id,
//         type.options.find((option) => option.id === selectedOptionId) ||
//           type.options[0],
//         false
//       );
//     }
//   }, []);

//   const getOptionIdsMap = (newOptions: object): Record<string, number> => {
//     return Object.fromEntries(
//       Object.entries(newOptions).map(([a, b]) => {
//         return [a, b.id];
//       })
//     );
//   };

//   const [carouselIndex, setCarouselIndex] = useState(0);

//   const chooseOption = (
//     typeId: number,
//     option: VariationTypeOption,
//     updateRouter: boolean = true
//   ) => {
//     setSelectedOptions((prevSelectedOptions) => {
//       const newOptions = {
//         ...prevSelectedOptions,
//         [typeId]: option,
//       };

//       if (option.images?.length > 0) {
//         const imageId = option.images[0]?.id;
//         const index = images.findIndex((img) => img.id === imageId);
//         if (index !== -1) setCarouselIndex(index);
//       }

//       if (updateRouter) {
//         router.get(
//           url,
//           {
//             options: getOptionIdsMap(newOptions),
//           },
//           {
//             preserveScroll: true,
//             preserveState: true,
//           }
//         );
//       }
//       return newOptions;
//     });
//   };

//   const onQuantityChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
//     form.setData("quantity", parseInt(ev.target.value));
//   };

//   const addToCart = () => {
//     const requiredVariationTypeIds = product.variationTypes.map((vt) => vt.id);
//     const selectedOptionTypeIds = Object.keys(selectedOptions).map(Number);

//     console.log("Required Variation Type IDs:", requiredVariationTypeIds);
//     console.log("Selected Option Type IDs:", selectedOptionTypeIds);
//     console.log("Selected Options:", selectedOptions);

//     // Check if all required variation types are selected
//     const allOptionsSelected = requiredVariationTypeIds.every((id) =>
//       selectedOptionTypeIds.includes(id)
//     );

//     if (!allOptionsSelected) {
//       console.warn("Not all options selected.");
//       alert("Please select all product options before adding to cart.");
//       return;
//     }

//     const optionIdsMap: Record<string, number> = {};
//     Object.entries(selectedOptions).forEach(([typeId, option]) => {
//       optionIdsMap[typeId] = option.id;
//     });

//     console.log("Option IDs to submit:", optionIdsMap);
//     form.setData("options_ids", optionIdsMap);

//     form.post(route("cart.store", product.id), {
//       preserveScroll: true,
//       preserveState: true,
//       onError: (errors) => {
//         console.error("Error adding to cart:", errors);
//       },
//       onSuccess: () => {
//         console.log("Product successfully added to cart.");
//       },
//     });
//   };

//   const renderProductVariationTypes = () => {
//     return (
//       <>
//         {product.variationTypes.map((type) => (
//           <div key={type.id}>
//             <b>{type.name}</b>

//             {type.type === "Image" && (
//               <div className="flex gap-2 mb-4">
//                 {type.options.map((option) => (
//                   <div
//                     key={option.id}
//                     onClick={() => chooseOption(type.id, option)}
//                   >
//                     {Array.isArray(option.images) &&
//                       option.images.length > 0 &&
//                       option.images[0]?.thumb && (
//                         <img
//                           src={option.images[0].thumb}
//                           alt={option.name || ""}
//                           className={
//                             "w-[80px] h-[80px] object-cover rounded-md shadow" +
//                             (selectedOptions[type.id]?.id === option.id
//                               ? "outline outline-4 outline-primary"
//                               : "")
//                           }
//                         />
//                       )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {type.type === "Radio" && (
//               <div className="flex join mb-4">
//                 {type.options.map((option) => (
//                   <input
//                     key={option.id}
//                     onChange={() => chooseOption(type.id, option)}
//                     className="join-item btn"
//                     type="radio"
//                     value={option.id}
//                     checked={selectedOptions[type.id]?.id === option.id}
//                     name={`variation_type_${type.id}`}
//                     aria-label={option.name}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </>
//     );
//   };

//   const renderAddToCartButton = () => {
//     return (
//       <div className="mb-8 flex gap-4">
//         <select
//           value={form.data.quantity}
//           onChange={onQuantityChange}
//           className="select select-bordered w-full"
//         >
//           {Array.from({ length: Math.min(10, computedProduct.quantity) }).map(
//             (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 Quantity: {i + 1}
//               </option>
//             )
//           )}
//         </select>
//         <button onClick={addToCart} className="btn btn-primary">
//           Add To Cart
//         </button>
//       </div>
//     );
//   };

//   useEffect(() => {
//     const isMap = Object.fromEntries(
//       Object.entries(selectedOptions).map(
//         ([typeId, option]: [string, VariationTypeOption]) => [typeId, option.id]
//       )
//     );

//     form.setData("options_ids", isMap);
//   }, [selectedOptions]);

//   return (
//     <AuthenticatedLayout>
//       <Head title={product.title} />

//       <div className="container mx-auto p-8">
//         {/* Main Grid Layout */}
//         <div className="grid gap-8 lg:grid-cols-2">
//           {/* Carousel Section (Images) */}
//           <div className="flex justify-center items-center">
//             <Carousel
//               images={images.map((img) => ({
//                 ...img,
//                 className: "w-full h-full object-cover rounded-md shadow",
//               }))}
//               index={carouselIndex}
//               onIndexChange={setCarouselIndex}
//             />
//           </div>

//           {/* Product Details Section */}
//           <div className="space-y-6">
//             {/* Product Title */}
//             <h1 className="text-3xl font-semibold">{product.title}</h1>

//   <p className="mb-8">
//            <Link href={route('vendor.profile', product.user.store_name)} className="hover:underline">
//   {product.user.name}
// </Link>&nbsp;
//             in <Link href={route('product.byDepartment', product.department.slug)} className="hover:underline">{product.department.name} </Link>;

//             <span className="hover:underline">{product.department.name}</span>
//           </p>

//             {/* Price */}
//             <div className="text-3xl font-bold text-gray-800">
//               {computedProduct.price && (
//                 <CurrencyFormatter
//                   amount={computedProduct.price}
//                   currency="AUD"
//                 />
//               )}
//             </div>

//             {/* Product Variations (e.g., size, color) */}
//             <div>{renderProductVariationTypes()}</div>

//             {/* Quantity Remaining */}
//             {computedProduct.quantity !== undefined &&
//               computedProduct.quantity < 10 && (
//                 <div className="text-red-600 my-4">
//                   <span>Only {computedProduct.quantity} left in stock</span>
//                 </div>
//               )}

//             {/* Add to Cart Button */}
//             <div className="mt-4">{renderAddToCartButton()}</div>

//             {/* About the Item Section */}
//             <div>
//               <b className="text-xl">About the Item</b>
//               <div
//                 className="mt-4 prose max-w-full"
//                 dangerouslySetInnerHTML={{ __html: product.description }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </AuthenticatedLayout>
//   );
// }

// export default Show;

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
  const form = useForm({
    options_ids: {},
    quantity: 1,
    price: null,
  });

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

  const addToCart = () => {
    const requiredVariationTypeIds = product.variationTypes.map((vt) => vt.id);
    const selectedOptionTypeIds = Object.keys(selectedOptions).map(Number);

    console.log("Required Variation Type IDs:", requiredVariationTypeIds);
    console.log("Selected Option Type IDs:", selectedOptionTypeIds);
    console.log("Selected Options:", selectedOptions);

    // Check if all required variation types are selected
    const allOptionsSelected = requiredVariationTypeIds.every((id) =>
      selectedOptionTypeIds.includes(id)
    );

    if (!allOptionsSelected) {
      console.warn("Not all options selected.");
      alert("Please select all product options before adding to cart.");
      return;
    }

    const optionIdsMap: Record<string, number> = {};
    Object.entries(selectedOptions).forEach(([typeId, option]) => {
      optionIdsMap[typeId] = option.id;
    });

    console.log("Option IDs to submit:", optionIdsMap);
    form.setData("options_ids", optionIdsMap);

    form.post(route("cart.store", product.id), {
      preserveScroll: true,
      preserveState: true,
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

  return (
    <AuthenticatedLayout>
      <Head title={product.title} />

      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-4/5 mx-auto flex flex-wrap">
            {/* Image Section */}
            <div className="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded shadow">
              <Carousel
                images={images.map((img) => ({
                  ...img,
                  alt: product.title,
                }))}
                index={carouselIndex}
                onIndexChange={setCarouselIndex}
              />
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
              <h2 className="text-sm title-font text-gray-500 tracking-widest">
                <Link
                  href={route("vendor.profile", product.user.store_name)}
                  className="hover:underline"
                >
                  {product.user.name}
                </Link>
                &nbsp; in{" "}
                <Link
                  href={route("product.byDepartment", product.department.slug)}
                  className="hover:underline"
                >
                  {product.department.name}{" "}
                </Link>
              </h2>
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                {product.title}
              </h1>

              {/* You can add your rating SVG icons here similar to example */}

              <p
                className="leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-800">
                  {computedProduct.price && (
                    <CurrencyFormatter
                      amount={computedProduct.price}
                      currency="AUD"
                    />
                  )}
                </span>
              </div>

              {/* Variation selectors */}
              {renderVariationSelectors()}

              {/* Quantity selector */}
              <div className="mb-6">
                <label htmlFor="quantity" className="mr-4 font-medium">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={form.data.quantity}
                  onChange={(e) =>
                    form.setData("quantity", parseInt(e.target.value))
                  }
                  className="rounded border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                >
                  {Array.from({
                    length: Math.min(10, computedProduct.quantity),
                  }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add to cart */}
              <button
                onClick={addToCart}
                className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </AuthenticatedLayout>
  );
}

export default Show;
