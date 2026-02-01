"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Calculator" },
    { href: "/how-it-works", label: "How it works?" },
    { href: "/why", label: "Why this matters?" },
    { href: "/about", label: "Who made this?" },
  ];

  return (
    <nav className="px-6 py-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-end gap-6 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-slate-600 transition hover:text-slate-900 ${
                  isActive ? "underline decoration-2 underline-offset-4 decoration-slate-900" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
