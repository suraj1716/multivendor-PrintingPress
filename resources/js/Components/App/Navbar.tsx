"use client";

import { FormEventHandler, Fragment, useRef, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, useForm, usePage } from "@inertiajs/react";
import MiniCartDropdown from "./MiniCartDropdown";
import { PageProps } from "@/types";
import { Search } from "lucide-react";
import CategoriesDropdown from "./CategoriesDropdown";
import SearchBar from "./SearchBar";
import Department from "./Department";
import LoginModal from "@/Pages/Auth/Login";

interface Category {
  id: string;
  name: string;
  href: string;
}
interface Department {
  id: string;
  name: string;
  categories: Category[];
  image?: string; // optional
}

interface Props {
  departments: Department[];
}

const navigation = {
  categories: [
    {
      id: "women",
      name: "Women",
      featured: [
        {
          name: "New Arrivals",
          href: "#",
          imageSrc:
            "https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg",
          imageAlt:
            "Models sitting back to back, wearing Basic Tee in black and bone.",
        },
        {
          name: "Basic Tees",
          href: "#",
          imageSrc:
            "https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg",
          imageAlt:
            "Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.",
        },
      ],
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "Tops", href: "#" },
            { name: "Dresses", href: "#" },
            { name: "Pants", href: "#" },
            { name: "Denim", href: "#" },
            { name: "Sweaters", href: "#" },
            { name: "T-Shirts", href: "#" },
            { name: "Jackets", href: "#" },
            { name: "Activewear", href: "#" },
            { name: "Browse All", href: "#" },
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { name: "Watches", href: "#" },
            { name: "Wallets", href: "#" },
            { name: "Bags", href: "#" },
            { name: "Sunglasses", href: "#" },
            { name: "Hats", href: "#" },
            { name: "Belts", href: "#" },
          ],
        },
        {
          id: "brands",
          name: "Brands",
          items: [
            { name: "Full Nelson", href: "#" },
            { name: "My Way", href: "#" },
            { name: "Re-Arranged", href: "#" },
            { name: "Counterfeit", href: "#" },
            { name: "Significant Other", href: "#" },
          ],
        },
      ],
    },
    {
      id: "men",
      name: "Men",
      featured: [
        {
          name: "New Arrivals",
          href: "#",
          imageSrc:
            "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg",
          imageAlt:
            "Drawstring top with elastic loop closure and textured interior padding.",
        },
        {
          name: "Artwork Tees",
          href: "#",
          imageSrc:
            "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg",
          imageAlt:
            "Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.",
        },
      ],
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "Tops", href: "#" },
            { name: "Pants", href: "#" },
            { name: "Sweaters", href: "#" },
            { name: "T-Shirts", href: "#" },
            { name: "Jackets", href: "#" },
            { name: "Activewear", href: "#" },
            { name: "Browse All", href: "#" },
          ],
        },
        {
          id: "accessories",
          name: "Accessories",
          items: [
            { name: "Watches", href: "#" },
            { name: "Wallets", href: "#" },
            { name: "Bags", href: "#" },
            { name: "Sunglasses", href: "#" },
            { name: "Hats", href: "#" },
            { name: "Belts", href: "#" },
          ],
        },
        {
          id: "brands",
          name: "Brands",
          items: [
            { name: "Re-Arranged", href: "#" },
            { name: "Counterfeit", href: "#" },
            { name: "Full Nelson", href: "#" },
            { name: "My Way", href: "#" },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: "Company", href: "#" },
    { name: "Stores", href: "#" },
  ],
};

export default function Navbar() {
  const {
    departments,
    auth,
    keyword,
    totalPrice,
    totalQuantity,
    miniCartItems,
  } = usePage<PageProps<{ keyword: string }>>().props;
  const { user } = auth;
  const [loginOpen, setLoginOpen] = useState(false);
  const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative top-0 z-50 bg-white shadow">
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <CategoriesDropdown departments={departments} />

            {user && (
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-full text-left border-t border-gray-200 px-4 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center">
                      <span>Account Settings</span>
                      <svg
                        className={`h-5 w-5 transform transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Disclosure.Button>

                    <Disclosure.Panel className="px-4 pt-2 pb-4 space-y-2 text-sm text-gray-700">
                      <Link
                        href={route("profile.edit")}
                        className="block hover:text-indigo-600"
                      >
                        Profile
                      </Link>
                      <Link
                        href={route("bookings.history")}
                        className="block hover:text-indigo-600"
                      >
                        Bookings
                      </Link>
                      <Link
                        href={route("orders.history")}
                        className="block hover:text-indigo-600"
                      >
                        Order History
                      </Link>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )}

            {user ? (
              <div>
                <Link
                  href={route("logout")}
                  method="post"
                  as="button"
                  className="hover:bg-indigo-50 px-3 py-2 rounded"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-200 px-4 py-6">
                <div className="space-y-2">
                  <span
                    onClick={() => setLoginOpen(true)}
                    className="cursor-pointer block text-gray-700 hover:text-indigo-600"
                  >
                    Sign in
                  </span>

                  <Link
                    href={route("register")}
                    className="block text-gray-700 hover:text-indigo-600"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                  className="block h-auto w-5 shrink-0"
                />
                <span className="ml-3 block text-base font-medium text-gray-900">
                  CAD
                </span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        <p className="flex h-10 items-center justify-center bg-purple-900 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>

        <nav
          aria-label="Top"
          className="sticky lg:static mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* Logo */}

              <div className=" flex lg:ml-0 items-center">
                <a href="/">
                  <span className="sr-only">Dhurva Logo</span>
                  <img
                    alt="Dhurva Logo"
                    src="/storage/a095427b2bbfa1e4d3596bd7c1adb293/Dhurva%20logo-01.png"
                    className="h-[100px] xs:p-5  md:h-20 lg:h-24 w-auto object-contain lg:p-4"
                  />
                </a>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:border-indigo-600 data-open:text-indigo-600">
                          {category.name}
                        </PopoverButton>
                      </div>

                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                      >
                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 top-1/2 bg-white shadow-sm"
                        />

                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.featured.map((item) => (
                                  <div
                                    key={item.name}
                                    className="group relative text-base sm:text-sm"
                                  >
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                    />
                                    <a
                                      href={item.href}
                                      className="mt-6 block font-medium text-gray-900"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="absolute inset-0 z-10"
                                      />
                                      {item.name}
                                    </a>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                {category.sections.map((section) => (
                                  <div key={section.name}>
                                    <p
                                      id={`${section.name}-heading`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map((item) => (
                                        <li key={item.name} className="flex">
                                          <a
                                            href={item.href}
                                            className="hover:text-gray-800"
                                          >
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}

                  {navigation.pages.map((page) => (
                    <a
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </a>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                {/* Cart (visible on all screen sizes) */}
                {/* Search */}
                <div className="flex   px-4 sm:px-6 lg:px-0 lg:ml-6">
                  <SearchBar keyword={keyword} />
                </div>

                <div className="ml-2 sm:ml-4 flow-root">
                  <MiniCartDropdown />
                </div>

                {user ? (
                  <div className="relative dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      aria-haspopup="true"
                      className="hidden md:inline-flex relative w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label="User menu"
                    >
                      <img
                        src={
                          user.name ||
                          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80"
                        }
                        alt={`${user.name}'s avatar`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu menu-sm bg-white rounded-lg shadow-lg p-2 mt-3 w-52 ring-1 ring-black ring-opacity-5 focus:outline-none"
                      aria-label="User dropdown menu"
                    >
                      <li>
                        <Link
                          href={route("profile.edit")}
                          className="hover:bg-indigo-50 px-3 py-2 rounded"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={route("orders.history")}
                          as="button"
                          className="hover:bg-indigo-50 px-3 py-2 rounded"
                        >
                          Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={route("bookings.history")}
                          as="button"
                          className="hover:bg-indigo-50 px-3 py-2 rounded"
                        >
                          Bookings
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={route("logout")}
                          method="post"
                          as="button"
                          className="hover:bg-indigo-50 px-3 py-2 rounded"
                        >
                          Logout
                        </Link>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <>
                    {/* Auth links (only visible on lg and up) */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-6 ml-4">
                      {/* Sign-in link */}
                      <span
                        onClick={() => setLoginOpen(true)}
                        className="cursor-pointer block text-gray-700 hover:text-indigo-600"
                      >
                        Sign in
                      </span>

                      {/* Login Modal */}

                      <span
                        aria-hidden="true"
                        className="h-6 w-px bg-gray-200"
                      />
                      <Link
                        href={route("register")}
                        className="text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Create account
                      </Link>
                    </div>
                    <LoginModal
                      isOpen={loginOpen}
                      onClose={() => setLoginOpen(false)}
                      canResetPassword={true}
                    />
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>
          </div>
          <div className="sticky top-4 mt-5 w-full lg:static">
            <Department />
          </div>
        </nav>
      </header>
    </div>

  );
}
