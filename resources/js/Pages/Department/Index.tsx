import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ProductItem from "@/Components/App/ProductItem";
import { PageProps, PaginationProps, Product, Department } from "@/types";
import { PlusCircle, MinusCircle } from "lucide-react";

type Props = PageProps<{
  products: PaginationProps<Product>;
  departments: Department[];
  department: Department;
  filters: {
    department_id: string | null;
    category_id: string | null;
    max_price: string | null;
    sort_by: string | null;
  };
}>;

const DEFAULT_MAX_PRICE = 1000;

export default function Index({
  department,
  products,
  departments,
  filters,
}: Props) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    filters.department_id
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    filters.category_id
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    filters.max_price ? parseInt(filters.max_price) : DEFAULT_MAX_PRICE
  );
  const [sortBy, setSortBy] = useState<string>(filters.sort_by || "default");
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleDepartment = (id: string) => {
    setExpandedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    const selectedDepartmentSlug = departments.find(
      (d) => d.id.toString() === selectedDepartment?.toString()
    )?.slug;

    if (!selectedDepartmentSlug) {
      console.error("No slug found for selected department");
      return;
    }

    router.get(
      route("product.byDepartment", selectedDepartmentSlug),
      {
        department_id: selectedDepartment,
        category_id: selectedCategory,
        max_price: maxPrice.toString(),
        sort_by: sortBy,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleResetFilters = () => {
    if (!department?.slug) return; // Safe check

    setSelectedCategory(null);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSortBy("default");

    router.get(
      route("product.byDepartment", department.slug),
      {}, // no query params
      {
        preserveScroll: true,
        preserveState: false, // force state refresh
      }
    );
  };

  const ShowAllProducts = () => {
    setSelectedDepartment(null);
    setSelectedCategory(null);
    setExpandedDepartments([]);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSortBy("default");

    // Fetch all products with no filters
    router.get(
      route("shop.search"),
      {},
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };
  console.log("department", department);
  return (
    <AuthenticatedLayout>
      <Head title="Product List" />

      <div className="bg-gray-200 py-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Products in Department: {department.name}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Filters */}
        <aside className="hidden lg:block lg:w-1/4 bg-white shadow rounded p-4 h-auto sticky top-4 self-start">


          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              onClick={ShowAllProducts}
              type="button"
            >
              All Products
            </button>
          </div>

          {/* Department Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Categories</h3>

            {department ? (
              <div>
                <div className="font-semibold mb-2">{department.name}</div>

                <ul className="text-sm space-y-1">
                  {department?.categories?.map((category) => (
                    <li key={category.id}>
                      <label className="inline-flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id.toString()}
                          onChange={() =>
                            setSelectedCategory(category.id.toString())
                          }
                        />
                        <span>{category.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Please select a department to see categories.</p>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <input
              type="range"
              min={0}
              max={6000}
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

          {/* Apply + Reset Buttons */}
          <div className="flex flex-col gap-2">
            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>

            <button
              className="w-full bg-gray-300 text-gray-800 py-2 rounded"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Mobile filter toggle button */}
        <div className="lg:hidden p-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowFilterModal(true)}
          >
            Open Filters
          </button>
        </div>
        {showFilterModal && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center"
            onClick={() => setShowFilterModal(false)} // click on backdrop
          >
            {/* Prevent click inside modal from closing */}
            <div
              className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowFilterModal(false)}
              >
                &times;
              </button>

              {/* Your Filters Go Here */}
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* Categories */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Categories</h3>
                  <ul className="text-sm space-y-1">
                    {department?.categories?.map((category) => (
                      <li key={category.id}>
                        <label className="inline-flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={category.id.toString()}
                            checked={
                              selectedCategory === category.id.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              requestAnimationFrame(() => {
                                setSelectedCategory(value);
                              });
                            }}
                          />

                          <span>{category.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Price Range</h3>
                  <input
                    type="range"
                    min={0}
                    max={6000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Up to ${maxPrice}
                  </p>
                </div>

                {/* Sort */}
                <div>
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

                {/* Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded"
                    onClick={() => {
                      handleApplyFilters();
                      setShowFilterModal(false);
                    }}
                  >
                    Apply
                  </button>
                  <button
                    className="w-full bg-gray-300 text-gray-800 py-2 rounded"
                    onClick={() => {
                      handleResetFilters();
                      setShowFilterModal(false);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <main className="w-full lg:w-full ">
          {products.data.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No products found.
            </div>
          ) : (
            <div className=" grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:mr-5">
              {products.data.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex justify-center space-x-2">
            {products.meta.links.map((link, index) =>
              link.url ? (
                <a
                  key={index}
                  href={link.url}
                  className={`px-3 py-1 border rounded ${
                    link.active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={index}
                  className="px-3 py-1 border rounded text-gray-400"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
