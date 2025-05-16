import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Department, PageProps, PaginationProps, Product } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Index({
  appName,
  department,
  products,
}: PageProps<{department:Department, products: PaginationProps<Product> }>) {
  return (
    <AuthenticatedLayout>
      <Head >
<title>{department.name}</title>
<meta name='title' content='{departmtent.meta_title}'/>
<meta name='description' content='{departmtent.meta_description}'/>

<Link rel='canonical' href={route('product.byDepartment',department.slug)}/>


<meta property='og:title' content='{departmtent.name}'/>
<meta property='og:description' content='{departmtent.meta_description}'/>
<meta property='og:url' content={route('product.byDepartment',department.slug)}/>
<meta property='og:type' content='website/'/>
<meta property='og:site_name' content='{appName}'/>



      </Head>

<div className='container mx-auto'>
      <div className="hero bg-base-200 min-h-[120px]">
        <div className="hero-content text-center">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold">{department.name}</h1>
          </div>
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
