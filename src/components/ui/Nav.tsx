"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: "◆", href: "/" },
  { label: "Programs", icon: "▦", href: "/programs" },
  { label: "Exercises", icon: "◎", href: "/exercises" },
  { label: "Progress", icon: "◈", href: "/progress" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-ft-bg border-b border-ft-border px-6 flex items-center justify-between h-14">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-mono text-lg tracking-wider">
          <span className="text-ft-white font-bold">FIT</span>
          <span className="text-ft-dim font-bold">TRACK</span>
        </Link>

        <div className="flex items-center gap-1">
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

      <div className="relative">
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-ft-card border border-ft-border" />
        ) : session?.user ? (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-ft-card border border-ft-border flex items-center justify-center text-ft-dim text-xs font-mono overflow-hidden hover:border-ft-light transition-colors"
            >
              {session.user.image ? (
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
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-sm font-mono text-ft-dim hover:text-ft-white hover:bg-ft-bg transition-colors"
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
    </nav>
  );
}
