import { Disclosure } from "@headlessui/react";
import { Department } from "@/types";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface CategoriesDropdownProps {
  departments: Department[];
}

export default function CategoriesDropdown({ departments }: CategoriesDropdownProps) {
  return (
    <div className="w-full">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span>Categories</span>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Disclosure.Button>

            <Disclosure.Panel className="mt-2 w-full rounded-md bg-white shadow ring-1 ring-black ring-opacity-5 max-h-96 overflow-auto px-4 py-4">
              {departments?.length === 0 ? (
                <p className="text-center text-gray-500">No departments found.</p>
              ) : (
                departments?.map((dept) => (
                  <div key={dept.id} className="mb-4 last:mb-0">
                    <div className="flex items-center mb-2 space-x-2">
                      {dept.image && (
                        <img
                          src={dept.image}
                          alt={dept.name}
                          className="h-5 w-5 rounded object-cover"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    </div>
                    <ul className="pl-5 list-disc text-gray-700 text-sm">
                      {dept.categories.map((cat) => (
                        <li key={cat.id}>
                          <a href={`/categories/${cat.id}`} className="hover:text-indigo-600">
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
