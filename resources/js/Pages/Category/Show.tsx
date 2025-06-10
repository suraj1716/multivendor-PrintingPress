import ProductItem from "@/Components/App/ProductItem";
import Breadcrumbs from "@/Components/Core/Breadcrumbs";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Category,
  CategoryGroup,
  Department,
  PaginationProps,
  Product,
} from "@/types"; // adjust path if needed
import { Head, Link } from "@inertiajs/react";

type ShowProps = {
  category: Category & { department: Department };
  department: Department;
  products: PaginationProps<Product>;
  categoryGroups: CategoryGroup[];
};

export default function Show({
  category,
  department,
  products,
  categoryGroups,
}: ShowProps) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    {
      label: category.department.name,
      href: `/departments/${category.department.slug}`,
    },
    { label: category.name, current: true },
  ];
  console.log("products", products);

  return (
    <AuthenticatedLayout>
      <Head title="Shop" />

      <div className="bg-gray-100 py-10 text-center">

       <div className="ml-20">
         {products.data.map((product) => (
        <Breadcrumbs items={[
              { label: "Home", href: "/" },

              {
                label: product.department?.name || "Department",
                href: route("product.byDepartment", product.department.name),
              },
              {
                label: category?.name || "Category",
                // href: route("product.byDepartment", product.department.name),
              }
            ]} />
             ))}
        </div>


        <h1 className="text-3xl font-bold text-gray-800">
          Shop Products {category.name}
        </h1>
      </div>

      <div className="block lg:hidden">
        <aside className=" lg:block lg:w-1/4 bg-white shadow rounded p-4  xs:h-auto h-[500px] lg:sticky top-4 self-start">
          {categoryGroups.map((group) => (
            <div key={group.id} className="mb-6 h-full">
              <img
                src={`/storage/${group.image}`}
                alt={group.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </aside>

        <div className="grid grid-cols-1 xs:p-5 xs:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-6 p-10">
          {products.data.map((product) => (
            <div
              key={product.id}
              className="w-full h-[300px] xs:h-[350px] lg:h-[400px]"
            >
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* desktop */}
      <div className="hidden lg:block">
        <div className=" container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="sticky top-5 w-full lg:w-1/4 bg-white shadow rounded-lg p-6 h-[500px] overflow-auto">
            {categoryGroups.map((group) => (
              <div key={group.id} className=" flex flex-col h-[250px]">
                <img
                  src={`/storage/${group.image}`}
                  alt={group.name}
                  className="flex-shrink-0 h-[450px] w-full object-cover rounded"
                />
              </div>
            ))}
          </aside>

          {/* Products Section */}
          <main className="w-full lg:w-3/4">
            {products.data.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.data.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
