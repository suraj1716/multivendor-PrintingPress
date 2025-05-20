import { Link, useForm, usePage } from "@inertiajs/react";
import React, { useState, useEffect, FormEventHandler } from "react";
import MiniCartDropdown from "./MiniCartDropdown";
import { PageProps } from "@/types";

export default function Navbar() {
  const { auth, departments, keyword } =
    usePage<PageProps<{ keyword: string }>>().props;
  const { user } = auth;

  const SearchForm = useForm<{ keyword: string }>({
    keyword: keyword || "",
  });

  const { url } = usePage();

  // State to hold suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Debounce timer id
  let debounceTimeout: NodeJS.Timeout;

  // Fetch suggestions from server
  const fetchSuggestions = (searchTerm: string) => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    fetch(`/search-suggestions?keyword=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
      })
      .catch(() => {
        setSuggestions([]);
      });
  };

  // Debounced input change handler
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    SearchForm.setData("keyword", value);

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setSuggestions([]); // Clear suggestions on submit
    SearchForm.get(url);
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 relative">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            SurajEcom
          </Link>
        </div>

        <div className="join flex-1 relative">
          <form onSubmit={onSubmit} className="join flex-1 flex flex-col">
            <div className="flex w-full">
              <input
                value={SearchForm.data.keyword}
                onChange={onInputChange}
                className="input input-bordered join-item flex-grow"
                placeholder="Search"
                autoComplete="off"
              />
              <button type="submit" className="btn join-item">
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border rounded-b shadow max-h-60 overflow-auto z-50">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <Link
                      href={`/?keyword=${encodeURIComponent(suggestion)}`}
                      onClick={() => setSuggestions([])}
                    >
                      {suggestion}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>

        <div className="flex-none gap-8">
          <MiniCartDropdown />
          {user && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="User Avatar"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link
                    href={route("profile.edit")}
                    className="justify-between"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href={route("orders.history")} as="button">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href={route("logout")} method="post" as="button">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {!user && (
            <>
              <Link href={route("login")} className="btn">
                Login
              </Link>
              <Link href={route("register")} className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ================Nav For Departments================= */}

      <div className="navbar bg-base-100 shadow-sm  top-0 z-50 ">
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal menu-dropdown dropdown-hover px-1 z-20 py-0">
            {departments.map((department) => {
              const isActive = route().current(
                "product.byDepartment",
                department.slug
              );

              return (
                <li key={department.id}>
                  <Link
                    href={route("product.byDepartment", department.slug)}
                    className={
                      isActive ? "bg-primary text-white font-bold" : ""
                    }
                  >
                    {department.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
