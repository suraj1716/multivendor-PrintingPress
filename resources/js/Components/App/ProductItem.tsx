import React from "react";
import { Link } from "@inertiajs/react";
import { Product } from "@/types";

type ProductItemProps = {
  product: Product;
};

export default function ProductItem({ product }: ProductItemProps) {
          console.log(product.image);

  return (
    <div className="card shadow p-4">

      <Link href={route("product.show", product.slug)}>
        <figure>
          <img
            src={product.image}
            alt={product.title}
            className="aspect-square object-cover"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{product.title}</h2>
          <p>
            by{" "}
            <Link href="/" className="hover:underline">
              {product.user.name}
            </Link>
            &nbsp; in{" "}
            <Link href="/" className="hover:underline">
              {product.department.name}
            </Link>
          </p>

          <div className="card-actions items-center justify-between mt-3">
            <button className="btn btn-primary">Add to Cart</button>
            <span className="text-2xl">Price: ${product.price}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
