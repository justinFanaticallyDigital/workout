"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { label: "Dashboard", icon: "◆", href: "/" },
  { label: "Programs", icon: "▦", href: "/programs" },
  { label: "Exercises", icon: "◎", href: "/exercises" },
  { label: "Log", icon: "▶", href: "/log" },
  { label: "History", icon: "◷", href: "/history" },
  { label: "Progress", icon: "◈", href: "/progress" },
];

const secondaryItems = [
  { label: "Injuries", href: "/injuries" },
  { label: "Settings", href: "/settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-ft-bg border-b border-ft-border px-4 sm:px-6 flex items-center justify-between h-14">
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/" className="font-mono text-lg tracking-wider">
          <span className="text-ft-white font-bold">FIT</span>
          <span className="text-ft-dim font-bold">TRACK</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-mono transition-colors
                  border-b-2
                  ${
                    active
                      ? "text-ft-white bg-ft-card border-ft-white"
                      : "text-ft-dim border-transparent hover:text-ft-light"
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* User menu */}
        <div className="relative" ref={menuRef}>
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-ft-card border border-ft-border" />
          ) : session?.user ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-ft-card border border-ft-border flex items-center justify-center text-ft-dim text-xs font-mono overflow-hidden hover:border-ft-light transition-colors"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  session.user.name?.[0]?.toUpperCase() ?? "U"
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 bg-ft-card border border-ft-border rounded-md shadow-lg py-1 min-w-[160px] z-50">
                  <div className="px-3 py-2 border-b border-ft-border">
                    <p className="text-ft-white text-sm font-mono truncate">
                      {session.user.name}
                    </p>
                    <p className="text-ft-dim text-xs truncate">
                      {session.user.email}
                    </p>
                  </div>
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm font-mono text-ft-dim hover:text-ft-white hover:bg-ft-bg transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-sm font-mono text-ft-dim hover:text-ft-white hover:bg-ft-bg transition-colors border-t border-ft-border"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-sm font-mono text-ft-dim hover:text-ft-white transition-colors"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-0.5 bg-ft-light transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`w-5 h-0.5 bg-ft-light transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-ft-light transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-ft-bg border-b border-ft-border z-50 md:hidden">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-colors ${
                    active
                      ? "text-ft-white bg-ft-card"
                      : "text-ft-dim hover:text-ft-light"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-ft-border pt-1 mt-1">
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-colors ${
                    isActive(item.href)
                      ? "text-ft-white bg-ft-card"
                      : "text-ft-dim hover:text-ft-light"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
