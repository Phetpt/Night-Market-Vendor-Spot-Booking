
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CodeXml } from "lucide-react";
import NavigationItems from "./NavigationItems";
import { navigationItems } from "@/config/navigation";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="flex w-full items-baseline justify-between px-4 py-4" >
          <div className="flex items-baseline gap-6">
            <Link
            href="/"
            className="flex items-baseline gap-4 text-zinc-950" >
              <CodeXml size={28} strokeWidth={2.5} className="self-center"/>
              <span className="text-xl font-semibold">
                Night Market Vendor Spot
              </span>
            </Link>
            <NavigationItems title="My Booking" pageRef="/my-booking" isActive={pathname === "/my-booking"}/>
          </div>
        

        <ul className="flex items-baseline gap-6">
          {navigationItems.map((item) => (
            <li key={item.pageRef}>
              <NavigationItems
                title={item.title}
                pageRef={item.pageRef}
                isActive={pathname === item.pageRef}
              />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
