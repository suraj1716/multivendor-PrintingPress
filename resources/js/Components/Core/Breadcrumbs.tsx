import React from "react";
import { Link } from "@inertiajs/react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center">
        {items.map((item, index) => (
          <li key={index} className="text-left">
            <div className={`flex items-center ${index === 0 ? "" : "ml-2"}`}>
              {index !== 0 && <span className="mx-2 text-gray-400">/</span>}
              <div className="-m-1">
                {item.href && !item.current ? (
                  <Link
                    href={item.href}
                    className="rounded-md p-1 text-sm font-medium text-gray-600 focus:text-gray-900 focus:shadow hover:text-gray-800"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={item.current ? "page" : undefined}
                    className="rounded-md p-1 text-sm font-medium text-gray-900"
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
