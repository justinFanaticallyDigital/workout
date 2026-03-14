"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "◆", href: "/" },
  { label: "Programs", icon: "▦", href: "/programs" },
  { label: "Exercises", icon: "◎", href: "/exercises" },
  { label: "Progress", icon: "◈", href: "/progress" },
];

export default function Nav() {
  const pathname = usePathname();

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

      <div className="w-8 h-8 rounded-full bg-ft-card border border-ft-border flex items-center justify-center text-ft-dim text-xs font-mono">
        U
      </div>
    </nav>
  );
}
