"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav
      className="w-full flex justify-center py-4
        bg-black/60 backdrop-blur-lg border-b border-gray-800 shadow-2xl rounded-b-2xl
        animate-navbar-fade"
      style={{
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <ul className="flex gap-8">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`px-5 py-2 rounded-lg font-semibold tracking-wide transition-all duration-300
                text-gray-200 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 hover:text-white
                ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-yellow-300 shadow-md"
                    : ""
                }
              `}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Add this to your globals.css or tailwind.css for the animation: