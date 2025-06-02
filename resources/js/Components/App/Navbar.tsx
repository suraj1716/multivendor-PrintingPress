import { Link, useForm, usePage } from "@inertiajs/react";
import React, { useState, FormEventHandler } from "react";
import MiniCartDropdown from "./MiniCartDropdown";
import { Search } from "lucide-react";
import { Department as DepartmentType, PageProps } from "@/types";
import Department from "./Department";

export default function Navbar() {
  const { dpts, auth, keyword } =
    usePage<PageProps<{ keyword: string }>>().props;
  const { user } = auth;

  const SearchForm = useForm<{ keyword: string }>({
    keyword: keyword || "",
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchSuggestions = (searchTerm: string) => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    fetch(`/search-suggestions?keyword=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data: string[]) => {
        setSuggestions(data);
      })
      .catch(() => {
        setSuggestions([]);
      });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    SearchForm.setData("keyword", value);

    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setDebounceTimeout(timeout);
  };

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setSuggestions([]); // Clear suggestions on submit

    SearchForm.get("/shop", {
      data: {
        category_id: "",
        keyword: SearchForm.data.keyword,
        max_price: "",
        sort_by: "",
      },
    });
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto flex flex-wrap items-center justify-between py-3 px-4 md:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            SurajEcom
          </Link>

          {/* Search Form */}
          <form
            onSubmit={onSubmit}
            className="relative flex-grow max-w-lg mx-6"
            role="search"
            aria-label="Product search"
          >
            <input
              type="search"
              value={SearchForm.data.keyword}
              onChange={onInputChange}
              placeholder="Search products..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-indigo-600 hover:bg-indigo-100 transition"
              aria-label="Submit search"
            >
              <Search size={18} />
            </button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <ul
                className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-opacity duration-300 z-50"
                role="listbox"
              >
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="cursor-pointer px-4 py-2 hover:bg-indigo-100 text-gray-800"
                    role="option"
                    tabIndex={-1}
                  >
                    <Link
                      href={`/shop?keyword=${encodeURIComponent(suggestion)}`}
                      onClick={() => setSuggestions([])}
                      className="block w-full"
                    >
                      {suggestion}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Right Side - Cart & User */}
          <div className="flex items-center space-x-4">
            <MiniCartDropdown />

            {user ? (
              <div className="relative dropdown dropdown-end">
                <button
                  tabIndex={0}
                  aria-haspopup="true"
                  className="relative w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                <Link
                  href={route("login")}
                  className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 transition"
                >
                  Login
                </Link>
                <Link
                  href={route("register")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Departments Navbar */}
      <nav className="sticky top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center space-x-6 overflow-x-auto no-scrollbar py-2 px-4 md:px-6">
          <span className="font-semibold text-gray-700 whitespace-nowrap">
            Shop by Departments:
          </span>
          <ul className="flex space-x-4">
            <Department />
          </ul>
        </div>
      </nav>
    </>
  );
}






















// import React, { useState } from "react";
// import { MapPin } from "lucide-react";
// import { CgClose } from "react-icons/cg";
// import { FaCaretDown } from "react-icons/fa";
// import { IoCartOutline } from "react-icons/io5";
// import { Link, usePage } from "@inertiajs/react";
// import { HiMenuAlt1, HiMenuAlt3 } from "react-icons/hi";
// import ResponsiveMenu from "./ResponsiveMenu";
// import type { PageProps } from "@/types"; // Adjust to your types

// type Location = {
//   county: string;
//   state: string;
// };

// type NavbarProps = {
//   location?: Location | null;
//   getLocation: () => void;
//   openDropdown: boolean;
//   setOpenDropdown: React.Dispatch<React.SetStateAction<boolean>>;
// };

// export default function Navbar({ location, getLocation, openDropdown, setOpenDropdown }: NavbarProps) {
//   const [openNav, setOpenNav] = useState<boolean>(false);

//   // Get user info from Laravel Breeze (Inertia shared props)
//   const { auth } = usePage<PageProps>().props;
//   const user = auth?.user;

//   // Helper to check current route (from Ziggy)
//   const isActive = (routeName: string) => route().current(routeName);

//   const toggleDropdown = () => {
//     setOpenDropdown(!openDropdown);
//   };

//   return (
//     <div className="bg-white py-3 shadow-2xl px-4 md:px-0">
//       <div className="max-w-6xl mx-auto flex justify-between items-center">
//         {/* logo section */}
//         <div className="flex gap-7 items-center">
//           <Link href="/">
//             <h1 className="font-bold text-3xl">
//               <span className="text-red-500 font-serif">Z</span>aptro
//             </h1>
//           </Link>

//           <div className="md:flex gap-1 cursor-pointer text-gray-700 items-center hidden">
//             <MapPin className="text-red-500" />
//             <span className="font-semibold">
//               {location ? (
//                 <div className="-space-y-2">
//                   <p>{location.county}</p>
//                   <p>{location.state}</p>
//                 </div>
//               ) : (
//                 "Add Address"
//               )}
//             </span>
//             <FaCaretDown onClick={toggleDropdown} />
//           </div>

//           {openDropdown && (
//             <div className="w-[250px] h-max shadow-2xl z-50 bg-white fixed top-16 left-60 border-2 p-5 border-gray-100 rounded-md">
//               <h1 className="font-semibold mb-4 text-xl flex justify-between">
//                 Change Location <span onClick={toggleDropdown}><CgClose /></span>
//               </h1>
//               <button
//                 onClick={getLocation}
//                 className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-red-400"
//               >
//                 Detect my location
//               </button>
//             </div>
//           )}
//         </div>

//         {/* menu section */}
//         <nav className="flex gap-7 items-center">
//           <ul className="md:flex gap-7 items-center text-xl font-semibold hidden">
//             <li
//               className={`cursor-pointer ${
//                 isActive("home") ? "border-b-3 border-red-500 transition-all" : "text-black"
//               }`}
//             >
//               <Link href="/">Home</Link>
//             </li>
//             <li
//               className={`cursor-pointer ${
//                 isActive("products.index") ? "border-b-3 border-red-500 transition-all" : "text-black"
//               }`}
//             >
//              <Link href={route('vendor.profile', { vendor: 'vendor-store' })}>Shop</Link>
//             </li>
//             <li
//               className={`cursor-pointer ${
//                 isActive("products.index") ? "border-b-3 border-red-500 transition-all" : "text-black"
//               }`}
//             >
//              <Link href={route('vendor.profile', { vendor: 'user' })}>Book Services</Link>
//             </li>
//             <li
//               className={`cursor-pointer ${
//                 isActive("about") ? "border-b-3 border-red-500 transition-all" : "text-black"
//               }`}
//             >
//               <Link href="/about">About</Link>
//             </li>
//             <li
//               className={`cursor-pointer ${
//                 isActive("contact") ? "border-b-3 border-red-500 transition-all" : "text-black"
//               }`}
//             >
//               <Link href="/contact">Contact</Link>
//             </li>
//           </ul>

//           <Link href="/cart" className="relative">
//             <IoCartOutline className="h-7 w-7" />
//             <span className="bg-red-500 px-2 rounded-full absolute -top-3 -right-3 text-white">
//               {/* Show cart count here if you have cart context */}
//             </span>
//           </Link>

//           <div className="hidden md:block">
//             {user ? (
//               <>
//                 <span className="mr-4">Hello, {user.name}</span>
//                 <Link
//                   href={route("logout")}
//                   method="post"
//                   as="button"
//                   className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer"
//                 >
//                   Logout
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link
//                   href={route("login")}
//                   className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer mr-3"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href={route("register")}
//                   className="bg-gray-300 text-black px-3 py-1 rounded-md cursor-pointer"
//                 >
//                   Register
//                 </Link>
//               </>
//             )}
//           </div>

//           {openNav ? (
//             <HiMenuAlt3 onClick={() => setOpenNav(false)} className="h-7 w-7 md:hidden cursor-pointer" />
//           ) : (
//             <HiMenuAlt1 onClick={() => setOpenNav(true)} className="h-7 w-7 md:hidden cursor-pointer" />
//           )}
//         </nav>
//       </div>

//       <ResponsiveMenu openNav={openNav} setOpenNav={setOpenNav} />
//     </div>
//   );
// }
