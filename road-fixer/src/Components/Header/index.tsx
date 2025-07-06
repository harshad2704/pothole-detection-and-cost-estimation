"use client";
import Link from "next/link";
import { Route, ScanFace } from "lucide-react";
import ThemeController from "./ThemeToggler";

const Header: React.FC = () => {
  return (
    <div className="navbar bg-base-100 px-[1rem] shadow-md">
      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            aria-label="Toggle menu"
            className="btn btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {/* Dropdown Menu */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow text-base"
          >
            {["Home", "About", "Contact"].map((item) => (
              <li key={item}>
                <Link
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="btn btn-ghost text-base-content"
                >
                  {item}
                </Link>
              </li>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <button className="btn btn-primary">Login</button>
            </div>
          </ul>
        </div>
        {/* Brand Logo and Tagline */}
        <Link
          href="/"
          className="text-2xl font-bold flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-200 transition-colors duration-300"
        >
          <Route className="text-primary" size={28} />
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-baseline gap-[2px]">
              <span className="text-primary font-extrabold text-xl">Road</span>
              <span className="text-accent font-semibold text-xl">Fixer</span>
            </div>
            <hr className="w-full border border-base-content" />
            <span className="text-sm text-base-content/70 italic">
              Detect, Report, Repair - Smarter Roads Ahead
            </span>
          </div>
        </Link>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-4 text-base">
          {["Home", "About", "Contact"].map((item) => (
            <li key={item}>
              <Link
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-primary-focus"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end hidden lg:flex gap-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            (document.getElementById("login") as HTMLDialogElement).showModal();
          }}
        >
          Login
        </button>
        <ThemeController />
      </div>

      {/* Mobile Theme Controller */}
      <div className="navbar-end lg:hidden">
        <ThemeController />
      </div>
    </div>
  );
};

export default Header;
