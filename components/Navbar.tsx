"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard-temp", label: "Temperature" },
    { href: "/dashboard-humidity", label: "Humidity" },
    { href: "/login", label: "Login" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      <ul className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-neutral-950/90 p-1.5 text-sm shadow-2xl shadow-black/25 ring-1 ring-white/10 backdrop-blur-xl">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`${
                  active
                    ? "bg-white font-medium text-neutral-950"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                } block whitespace-nowrap rounded-full px-4 py-2`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
