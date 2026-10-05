"use client";

/**
 * BottomNav — temporary four-tab shell (P1). Replaced by the kit BottomNav in
 * P2. Training · Nutrition · Stats · Settings; no FAB, no tier branching.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string }[] = [
  { href: "/training", label: "Training" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/stats", label: "Stats" },
  { href: "/settings", label: "Settings" },
];

export function isFullScreenRoute(pathname: string): boolean {
  return (
    (/^\/log\/[^/]+$/.test(pathname) && pathname !== "/log/library") ||
    pathname.startsWith("/log/activity/") ||
    pathname.startsWith("/log/frame/") ||
    pathname === "/log/stretch-timer" ||
    pathname === "/nutrition/log" ||
    pathname === "/signin"
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  if (isFullScreenRoute(pathname)) return null;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-w-[600px] grid-cols-4 border-t border-ft-border-faint bg-ft-surface"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={[
            "flex flex-col items-center gap-[3px] pt-2 font-body text-[10px] tracking-[0.01em]",
            isActive(t.href) ? "text-ft-accent" : "text-ft-light",
          ].join(" ")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
