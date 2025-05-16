import { Link, usePage } from "@inertiajs/react";
import React from "react";
import MiniCartDropdown from "./MiniCartDropdown";

export default function Navbar() {
  const { auth, departments } = usePage().props;
  const { user } = auth;

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            SurajEcom
          </Link>
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
                    alt="Tailwind CSS Navbar component"
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

      <div className="navbar bg-base-100 border-t min-h-4">
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal menu-dropdown dropdown-hover px-1 z-20 py-0">
            {departments.map((department) => (
              <li key={department.id}>
                <Link href={route("product.byDepartment", department.slug)}>
                  {department.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
