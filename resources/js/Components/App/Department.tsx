import React from "react";
import { Link, usePage } from '@inertiajs/react';
import type { PageProps as MyPageProps, Department } from '@/types'; // Your custom types

type DataItem = {
  department: string;
  // add other properties if needed
};

type DepartmentProps = {
  data?: DataItem[]; // optional now
};

 function Department() {
  // Destructure needed props from Inertia page props
  const { dpts, location, getLocation, openDropdown, setOpenDropdown, data } = usePage().props as MyPageProps & DepartmentProps;

  // Get unique department names from data if you want (optional, you may not need if dpts is enough)
  const getUniqueDepartment = (data: DataItem[], property: keyof DataItem): string[] => {
    const values = data?.map((item) => item[property]) ?? [];
    return Array.from(new Set(values));
  };

  const uniqueDepartments = getUniqueDepartment(data ?? [], "department");

  return (
    <div >
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-center md:justify-around py-7 px-4">
        {/* Render official departments with product counts */}
        {dpts.map((department: Department) => {
          if (department.productsCount === 0) return null;

          const isActive = route().current("product.byDepartment", department.slug);

          return (
            <li key={department.id} className="whitespace-nowrap list-none">
              <Link
                href={route("product.byDepartment", department.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
                }`}
              >
                {department.name}
              </Link>
            </li>
          );
        })}

        {/* Optionally render unique department buttons from 'data' */}
        {uniqueDepartments.map((item, index) => (
          <Link
            key={index}
            href={`/d/${item}`}
            className="uppercase bg-gradient-to-r from-red-500 to-purple-500 text-white px-3 py-1 rounded-md cursor-pointer inline-block"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}



export default Department;
