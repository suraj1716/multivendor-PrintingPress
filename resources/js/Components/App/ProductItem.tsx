import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { router } from "@inertiajs/core";
import { Product } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import ProductReview from "./ProductRating";

interface Props {
  product: Product;
}

export default function ProductItem({ product }: Props) {
  const form = useForm({
    product_id: product.id,
    quantity: 1,
  });

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevents event bubbling
    e.preventDefault(); // prevents redirect
    router.post(
  route("cart.store", product.id),
  form.data,
  {
    preserveScroll: true, // ✅ This prevents scroll to top
  }
);
  };

  return (


    <div className="relative m-10 w-[500px] max-w-xs overflow-hidden rounded-lg bg-white shadow-md">
      <div className="h-60 overflow-hidden ">
        <Link href="#">
          <img
            className="h-100 rounded-t-lg object-cover transition duration-300 transform hover:-translate-y-1 hover:scale-105"
            src={product.image}
            alt={product.title}
          />
        </Link>
      </div>
      <span
        className="absolute top-0 left-0 w-28 translate-y-4
  -translate-x-6 -rotate-45 bg-black text-center text-sm text-white"
      >
        Sale
      </span>
      <div className="mt-4 px-5 pb-5 ">
        <Link href={route("product.show", product.slug)}>
          <h5 className="text-xl font-semibold tracking-tight text-slate-900 truncate">
            {product.title}
          </h5>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1 truncate">
            <Link
              href={route("vendor.profile", product.user?.store_name ?? "")}
              className="hover:underline truncate"
            >
              {product.user?.name ?? "Unknown Vendor"}
            </Link>
            &nbsp; in&nbsp;
            <Link
              href={route(
                "product.byDepartment",
                product.department?.slug ?? ""
              )}
              className="hover:underline truncate"
            >
              {product.department?.name ?? "Unknown Department"}
            </Link>
          </p>
        </Link>
        <div className="mt-2.5 mb-5 flex items-center">
          <ProductReview
            rating={product.average_rating ?? 0}
            reviewsCount={product.reviews_count ?? 0}
          />
        </div>
        <div className="flex items-center justify-between gap-5">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xl font-bold text-slate-900">
              <CurrencyFormatter amount={product.price} currency="AUD" />
            </span>
            <span className="text-sm text-slate-900 line-through">
              {" "}
              <CurrencyFormatter amount={product.price} currency="AUD" />
            </span>
          </div>
          <button
           type="button"
            onClick={addToCart}

            className="flex items-center rounded-md bg-slate-900 px-5 py-2.5
            text-center text-sm font-medium text-white hover:bg-gray-700
            focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
