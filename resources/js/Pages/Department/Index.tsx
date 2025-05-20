import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ProductItem from "@/Components/App/ProductItem";
import {
  PageProps,
  PaginationProps,
  Product,
  Category,
  Department,
} from "@/types";

type DepartmentPageProps = PageProps<{
  department: Department; // includes slug & name
  products: PaginationProps<Product>;
  categories: Category[]; // categories in this department that have products
  filters: {
    category_id: string | null;
    max_price: string | null;
    sort_by: string | null;
    keyword?: string | null;
  };
  appName: string;
}>;

export default function DepartmentPage({
  department,
  products,
  categories,
  filters,
  appName,
}: DepartmentPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    filters.category_id
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    filters.max_price ? parseInt(filters.max_price) : 6000
  );
  const [sortBy, setSortBy] = useState<string>(filters.sort_by || "default");
  const [keyword, setKeyword] = useState<string>(filters.keyword || "");

  const hasFilterChanged =
    selectedCategory !== filters.category_id ||
    maxPrice.toString() !== filters.max_price ||
    sortBy !== filters.sort_by ||
    keyword !== (filters.keyword ?? "");

  const handleFilterChange = () => {
    router.get(
      route("product.byDepartment", { department: department.slug }),
      {
        category_id: selectedCategory || undefined,
        max_price: maxPrice.toString(),
        sort_by: sortBy,
        keyword: keyword || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const currentCategory = selectedCategory
    ? categories.find((c) => c.id.toString() === selectedCategory)
    : null;

  return (
    <AuthenticatedLayout>
      <Head>
        <title>{currentCategory?.name ?? department.name ?? appName}</title>
        <meta
          name="title"
          content={currentCategory?.name ?? department.name ?? appName}
        />
        <meta name="description" content={`Products in ${department.name}`} />
      </Head>

      {/* Department Header */}
      <div className="bg-gray-200 py-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {department.name}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-1/4 bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          {/* Keyword Search */}
          <section className="mb-6">
            <h3 className="text-sm font-medium mb-2">Search</h3>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </section>

          {/* Categories */}
          <section className="mb-6">
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <ul className="text-sm space-y-1 max-h-48 overflow-auto">
              {categories.map((category) => (
                <li key={category.id}>
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={selectedCategory === category.id.toString()}
                      onChange={() => setSelectedCategory(category.id.toString())}
                    />
                    <span>{category.name}</span>
                  </label>
                </li>
              ))}
              <li>
                <button
                  className="text-blue-500 text-xs mt-2"
                  onClick={() => setSelectedCategory(null)}
                >
                  Clear category
                </button>
              </li>
            </ul>
          </section>

          {/* Price Range */}
          <section className="mb-6">
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
          </section>

          {/* Sort Options */}
          <section className="mb-4">
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
          </section>

          <button
            disabled={!hasFilterChanged}
            className={`w-full py-2 rounded ${
              hasFilterChanged
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            onClick={handleFilterChange}
          >
            Apply Filters
          </button>
        </aside>

        {/* Products List */}
        <main className="w-full lg:w-3/4">
          {products.data.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.data.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <nav
            className="mt-6 flex justify-center space-x-2"
            aria-label="Pagination"
          >
            {products.meta?.links?.map((link, index) =>
              link.url ? (
                <Link
                  key={index}
                  href={link.url}
                  className={`px-3 py-1 border rounded ${
                    link.active ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {link.label.replace("&laquo;", "«").replace("&raquo;", "»")}
                </Link>
              ) : (
                <span
                  key={index}
                  className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </nav>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
