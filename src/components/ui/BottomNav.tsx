"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Program",
    href: "/program",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Log",
    href: "/log",
    isCenter: true,
    icon: (active: boolean) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    label: "Nutrition",
    href: "/nutrition",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 110 8h-1" />
        <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Hide bottom nav on workout logger and stretch timer (full screen flows)
  if (pathname.match(/^\/log\/[^/]+$/) || pathname.startsWith("/stretch-timer")) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div className="h-20" />
      {/* Fade gradient above nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bottom-nav-fade h-6 pointer-events-none" />
        <nav
          className="bg-ft-bg/95 backdrop-blur-sm border-t border-ft-border flex items-end justify-around px-2 pb-safe"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {tabs.map((tab) => {
            const active = isActive(tab.href);

            if (tab.isCenter) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex flex-col items-center -mt-5"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, rgb(var(--ft-accent)), rgb(var(--ft-danger)))",
                    }}
                  >
                    <span className="text-white">{tab.icon(true)}</span>
                  </div>
                  <span
                    className="text-[10px] font-body font-semibold mt-1"
                    style={{ color: active ? "rgb(var(--ft-accent))" : "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))" }}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center pt-2 pb-1 px-3 min-w-[56px] transition-colors"
              >
                <span
                  style={{ color: active ? "rgb(var(--ft-accent))" : "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))" }}
                  className="transition-colors"
                >
                  {tab.icon(active)}
                </span>
                <span
                  className="text-[10px] font-body font-semibold mt-1 transition-colors"
                  style={{ color: active ? "rgb(var(--ft-accent))" : "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))" }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
