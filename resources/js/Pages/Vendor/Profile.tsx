import ProductItem from "@/Components/App/ProductItem";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Vendor, PageProps, PaginationProps, Product } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function Profile({
  vendor,
  products,
}: PageProps<{ vendor: Vendor; products: PaginationProps<Product> }>) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>("default");

  const departments = Array.from(
    new Set(products.data.map((p) => p.department?.name).filter(Boolean))
  );

  const filteredProducts = products.data
    .filter((product: Product) => {
      const matchesDepartment = selectedDepartment
        ? product.department?.name === selectedDepartment
        : true;
      const matchesPrice = product.price <= maxPrice;
      return matchesDepartment && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  return (
    <AuthenticatedLayout>
      <Head title={`${vendor.store_name} Profile Page`} />

      {/* Top Banner */}
      <div className="bg-gray-200 py-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {vendor.store_name}
        </h1>
      </div>

      {/* Filters + Products Layout */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left: Filters */}
        <aside className="w-full lg:w-1/4 bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Department Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Department</h3>
            <ul className="space-y-1 text-sm">
              {departments.map((dept) => (
                <li key={dept}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="department"
                      value={dept}
                      checked={selectedDepartment === dept}
                      onChange={() => setSelectedDepartment(dept)}
                    />
                    <span>{dept}</span>
                  </label>
                </li>
              ))}
              <li>
                <button
                  className="text-blue-500 text-xs mt-1"
                  onClick={() => setSelectedDepartment(null)}
                >
                  Clear department
                </button>
              </li>
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <input
              type="range"
              min="0"
              max="6000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">Up to ${maxPrice}</p>
          </div>

          {/* Sort Options */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <select
              className="w-full border border-gray-300 rounded p-1 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </aside>

        {/* Right: Product List */}
        <main className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: Product) => (
              <ProductItem key={product.id} product={product} />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">No products match the selected filters.</p>
          )}
        </main>
      </div>
<div className="flex justify-center mt-6 space-x-2">
  {products.meta.links.map(link => (
  <Link
    key={link.label}
    href={link.url ?? '#'}
    className={`px-3 py-2 border ${link.active ? 'bg-indigo-500 text-white' : ''}`}
    disabled={!link.url}
  >
    <span dangerouslySetInnerHTML={{ __html: link.label }} />
  </Link>
))}
</div>



    </AuthenticatedLayout>
  );
}























// import { useState } from "react";
// import ProductItem from "@/Components/App/ProductItem";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import { Vendor, PageProps, PaginationProps, Product, Department } from "@/types";
// import { Head, Link, router } from "@inertiajs/react";

// export default function Profile({ vendor, products, departments, filters }: PageProps<{
//   vendor: Vendor;
//   products: PaginationProps<Product>;
//   departments: Department[];
//   filters: any;
// }>) {
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

//   const handleFilterChange = (newFilters: any) => {
//     router.get(route("vendor.profile", vendor.id), newFilters, {
//       preserveState: true,
//       preserveScroll: true,
//     });
//   };

//   return (
//     <AuthenticatedLayout>
//       <Head title={vendor.store_name + " Profile Page"} />

//       <div className="hero bg-gray-200 h-[150px]">
//         <div className="hero-content text-center">
//           <div className="max-w-md">
//             <h1 className="text-lg title-font text-gray-500 tracking-widest">
//               {vendor.store_name}
//             </h1>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Filter Button */}
//       <div className="md:hidden p-4">
//         <button
//           onClick={() => setMobileFiltersOpen(true)}
//           className="btn btn-outline w-full"
//         >
//           Filter Products
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 py-8">
//         {/* Sidebar Filters (Desktop) */}
//         <aside className="hidden md:block">
//          <FilterPanel
//   departments={departments}
//   selectedFilters={filters || {}} // ✅ Prevent undefined error
//   onFilterChange={handleFilterChange}
// />
//         </aside>

//         {/* Product List */}
//         <main className="md:col-span-3">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {products.data.map((product) => (
//               <ProductItem key={product.id} product={product} />
//             ))}
//           </div>
//         </main>
//       </div>

//       {/* Mobile Filter Modal */}
//       {mobileFiltersOpen && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center md:hidden">
//           <div className="bg-white w-11/12 max-w-sm rounded-lg shadow-lg p-4 relative">
//             <button
//               onClick={() => setMobileFiltersOpen(false)}
//               className="absolute top-2 right-2 text-gray-500 text-xl"
//             >
//               &times;
//             </button>

//             <h2 className="text-lg font-semibold mb-4">Filter Products</h2>

//            <FilterPanel
//   departments={departments}
//   selectedFilters={filters || {}} // ✅ Prevent undefined error
//   onFilterChange={handleFilterChange}
// />
//           </div>
//         </div>
//       )}
//     </AuthenticatedLayout>
//   );
// }

// // Filter Panel Component
// function FilterPanel({
//   departments,
//   selectedFilters = {}, // ✅ Set default here too
//   onFilterChange,
// }: {
//   departments: Department[];
//   selectedFilters?: any;
//   onFilterChange: (filters: any) => void;
// }) {
//   const toggleDepartment = (id: number) => {
//     const current = selectedFilters.departments || [];
//     const updated = current.includes(id)
//       ? current.filter((d: number) => d !== id)
//       : [...current, id];

//     onFilterChange({ ...selectedFilters, departments: updated });
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <h3 className="font-semibold mb-2">Departments</h3>
//         {departments.map((d) => (
//           <div key={d.id} className="flex items-center mb-2">
//             <input
//               type="checkbox"
//               checked={selectedFilters.departments?.includes(d.id) || false}
//               onChange={() => toggleDepartment(d.id)}
//               className="mr-2"
//             />
//             <label>{d.name}</label>
//           </div>
//         ))}
//       </div>

//       {/* Placeholder: Add Price, Sort, etc. here */}
//       <div>
//         <h3 className="font-semibold mb-2">Sort By</h3>
//         <select
//           className="w-full border rounded p-2"
//           value={selectedFilters.sort || ""}
//           onChange={(e) =>
//             onFilterChange({ ...selectedFilters, sort: e.target.value })
//           }
//         >
//           <option value="">Default</option>
//           <option value="price_asc">Price: Low to High</option>
//           <option value="price_desc">Price: High to Low</option>
//           <option value="latest">Latest</option>
//         </select>
//       </div>
//     </div>
//   );
// }
