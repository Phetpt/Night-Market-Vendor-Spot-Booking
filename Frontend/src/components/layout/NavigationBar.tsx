"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CodeXml, Menu, X,  } from "lucide-react";
import AuthButtons from "../auth/AuthButtons";

import NavigationItem from "./NavigationItems";
import { navigationItems } from "@/config/navigation";


function isActivePath(pathname: string, pageRef: string): boolean {
  return (
    pathname === pageRef ||
    pathname.startsWith(`${pageRef}/`)
  );
}

export default function NavigationBar() {
  const pathname = usePathname();

  // เก็บ "หน้าที่เปิดเมนูไว้" แทน true/false
  // เปลี่ยนหน้า → pathname ไม่ตรงกับที่เก็บ → เมนูปิดเอง ไม่ต้องใช้ useEffect
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const isMenuOpen = menuOpenPath === pathname;
  const setIsMenuOpen = (open: boolean) => setMenuOpenPath(open ? pathname : null);

  const mobileMenuId = useId();

  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <nav aria-label="Main navigation">
        <div className="flex items-center justify-between gap-4 px-4 py-4">

          {/* Left: Logo + Menu */}
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-3 text-zinc-950">
              <CodeXml
                size={28}
                strokeWidth={2.5}
                className="shrink-0"/>

              <span className="truncate text-lg font-semibold">
                Night Market Vendor Spot
              </span>
            </Link>

            <ul className="hidden items-center gap-6 md:flex">
            {navigationItems.map((item) => (
              <li key={item.pageRef}>
                <NavigationItem
                  title={item.title}
                  pageRef={item.pageRef}
                  isActive={isActivePath(pathname, item.pageRef)}
                />
              </li>
            ))}
          </ul>

            <div className="hidden md:block">
              <NavigationItem
                title="My Booking"
                pageRef="/my-booking"
                isActive={isActivePath(pathname, "/my-booking")}
              />
            </div>
          </div>

          {/* Right: Desktop Navigation */}
          <AuthButtons/>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="shrink-0 rounded-md p-2 text-zinc-950
              hover:bg-zinc-100 focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-zinc-950 md:hidden">

            {isMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id={mobileMenuId}
          hidden={!isMenuOpen}
          className="border-t border-zinc-200 px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <NavigationItem
                title="My Booking"
                pageRef="/my-booking"
                isActive={isActivePath(pathname, "/my-booking")}
                onClick={() => setIsMenuOpen(false)}/>
            </li>

            {navigationItems.map((item) => (
              <li key={item.pageRef}>
                <NavigationItem
                  title={item.title}
                  pageRef={item.pageRef}
                  isActive={isActivePath(pathname, item.pageRef)}
                  onClick={() => setIsMenuOpen(false)}/>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}