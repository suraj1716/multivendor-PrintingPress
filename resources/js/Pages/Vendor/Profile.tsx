import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Vendor, PageProps, PaginationProps, Product } from '@/types';
import { Head, Link } from '@inertiajs/react';


export default function Profile({
  vendor, products,
}: PageProps<{ vendor: Vendor, products:PaginationProps<Product> }>) {
  return (
    <AuthenticatedLayout>
      <Head title={vendor.store_name + 'Profile Page'} />


<div className='hero min-h-[320px]'
style={{backgroundImage:'url(https:image.daisy)'}}>


</div>



      <div className="hero bg-gray-200 h-[300px]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
              exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
        {products.data.map((product: Product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </AuthenticatedLayout>
  );
}
