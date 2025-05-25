import { productRoute } from "@/helper";
import { CartItem as CartItemType } from "@/types";
import { Link, router, useForm } from "@inertiajs/react";
import { error } from "console";
import TextInput from "../Core/TextInput";
import React, { useState } from "react";
import { CurrencyFormatter } from "@/utils/CurrencyFormatter";

type Props = {
  item: CartItemType;
   attachment_path?: string;
};

function CartItem({item}:{ item :CartItemType, }) {

const deleteForm=useForm({

  option_ids:item.option_ids
})

 const [error, setError] = useState('');

  const onDeleteClick = () => {
    deleteForm.delete(route('cart.destroy', item.product_id), {
      preserveScroll: true,
    });
  };

  const handleQuantityChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    router.put(
      route('cart.update', item.product_id),
      {
        quantity: ev.target.value,
        option_ids: item.option_ids,
      },
      {
        preserveScroll: true,
        onError: (errors) => {
          setError(Object.values(errors)[0]);
        },
      }
    );
  };


  return (
    <>
      <div key={item.id} className="flex gap-6 p-3">
        <Link
          href={productRoute(item)}
          className="w-32 min-w-32 flex justify-center self-start"
        >
          <img src={item.image_url} alt="" className="max-w-full max-h-full" />
        </Link>
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="mb-3 text-sm font-semibold">
              <Link href={productRoute(item)}>{item.title}</Link>
            </h3>

            <h3 className="mb-3 text-sm font-extrabold">
              Total Price:{' '}
              <CurrencyFormatter amount={item.price * item.quantity} currency="AUD" />
            </h3>

            <div className="text-xs">
              {item.options.map((option) => (
                <div key={option.id}>
                  <strong className="text-bold">{option.type.name}</strong>
                  {option.name}
                </div>
              ))}
            </div>
          </div>

          {/* Show attachment filename above quantity */}

            <div className="mb-2 text-sm font-medium text-gray-700">
              Attachment: {item.attachment_name}
            </div>


          <div className="flex justify-between items-center mt-4">
            <div className="text-sm">Quantity: </div>
            <div
              className={error ? 'tooltip tooltip-open tooltip-error' : ''}
              data-tip={error}
            >
              <TextInput
                type="number"
                defaultValue={item.quantity}
                onBlur={handleQuantityChange}
                className="input-sm w-16"
              />
            </div>
            <button onClick={onDeleteClick} className="btn btn-sm btn-ghost">
              Delete
            </button>

            <button className="btn btn-sm btn-ghost">Save for later</button>
          </div>
        </div>
      </div>
      <div className="divider"></div>
    </>
  );
}

export default CartItem;
