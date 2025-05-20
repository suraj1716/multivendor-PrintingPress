import React from "react";
import { Link, useForm } from "@inertiajs/react";
import { router } from "@inertiajs/core";
import { Product } from "@/types";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";

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
    router.post(route("cart.store",product.id), form.data);
  };

  return (
    <div className="card shadow p-4">
      {/* Link only wraps image/title to avoid redirect on button click */}
      <Link href={route("product.show", product.slug)} className="block">
        <figure>
          <img
            src={product.image}
            alt={product.title}
            className="aspect-square object-cover w-full"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{product.title}</h2>
         <p>
  <Link
    href={route('vendor.profile', product.user?.store_name ?? '')}
    className="hover:underline"
  >
    {product.user?.name ?? 'Unknown Vendor'}
  </Link>
  &nbsp; in&nbsp;
<Link
  href={route('product.byDepartment', product.department?.slug ?? '')}
  className="hover:underline"
>
  {product.department?.name ?? 'Unknown Department'}
</Link>
</p>

        </div>
      </Link>

      <div className="card-actions items-center justify-between mt-3 px-4 pb-4">
        <button className="btn btn-primary" onClick={addToCart}>
          Add to Cart
        </button>
        <span className="text-2xl font-semibold">
          <CurrencyFormatter amount={product.price} currency="AUD"/>
        </span>
      </div>
    </div>
  );
}
