"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import LogActivitySheet from "@/components/ui/LogActivitySheet";

const moreLinks = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Exercises", href: "/exercises", icon: "💪" },
  { label: "History", href: "/history", icon: "📖" },
  { label: "Injuries", href: "/injuries", icon: "🩹" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

const tabs = [
  {
    label: "Gameplan",
    href: "/gameplan",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/progress",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
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
];

/** Compute inline styles for active nav indicator based on theme config */
function useNavIndicatorStyles(active: boolean) {
  const { theme } = useTheme();
  const { activeIndicator, activeStyle = {} } = theme.components.nav;
  if (!active) return { wrapper: {}, dot: null };

  const wrapper: Record<string, string> = {};
  let dot: React.ReactNode = null;

  switch (activeIndicator) {
    case 'underline':
    case 'border-bottom':
      wrapper.borderBottom = `${activeStyle.borderWidth || '2px'} solid ${activeStyle.borderColor || theme.colors.accent}`;
      if (activeStyle.opacity) wrapper.opacity = activeStyle.opacity;
      break;
    case 'bg-fill':
      wrapper.background = activeStyle.bgColor || `${theme.colors.accent}22`;
      wrapper.borderRadius = '8px';
      break;
    case 'glow-dot':
      dot = (
        <span
          style={{
            display: 'block',
            width: activeStyle.dotSize || '4px',
            height: activeStyle.dotSize || '4px',
            borderRadius: '50%',
            background: activeStyle.color || theme.colors.accent,
            margin: '2px auto 0',
            boxShadow: `0 0 ${activeStyle.glowRadius || '6px'} ${activeStyle.color || theme.colors.accent}`,
          }}
        />
      );
      break;
  }

  return { wrapper, dot };
}

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    // Gameplan owns: /, /gameplan/*, /program(s)/* (legacy editor + redirect),
    // /checkin (Gameplan-scoped flow per spec §6.2).
    if (href === "/gameplan") {
      return (
        pathname === "/" ||
        pathname.startsWith("/gameplan") ||
        pathname.startsWith("/program") ||
        pathname.startsWith("/programs") ||
        pathname.startsWith("/checkin")
      );
    }
    // Progress owns: /progress/*, /calendar (legacy redirect), /injuries
    // (legacy redirect), /history (workout history is a Progress-tab affordance).
    if (href === "/progress") {
      return (
        pathname.startsWith("/progress") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/injuries") ||
        pathname.startsWith("/history")
      );
    }
    // Settings owns /settings/* including the four new sub-routes.
    if (href === "/settings") {
      return pathname.startsWith("/settings");
    }
    // Nutrition owns /nutrition/*.
    if (href === "/nutrition") {
      return pathname.startsWith("/nutrition");
    }
    return pathname.startsWith(href);
  };

  // Close menu on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  // Hide bottom nav during full-screen flows per fittrack-v2-spec.md §5:
  //   /log/[workoutId], /log/stretch-timer, /gameplan/new,
  //   /gameplan/[id]/planning, /checkin
  // The /log/[workoutId] regex must not match /log/library or
  // /log/stretch-timer — those are still real subpaths but the nav
  // hides on stretch-timer separately and stays on /log/library.
  const hideNav =
    (pathname.match(/^\/log\/[^/]+$/) && pathname !== "/log/library") ||
    pathname === "/log/stretch-timer" ||
    pathname === "/gameplan/new" ||
    pathname.match(/^\/gameplan\/[^/]+\/planning$/) ||
    pathname === "/checkin" ||
    pathname === "/nutrition/log" ||
    pathname === "/library/as-gameplan" ||
    pathname.startsWith("/log/activity/") ||
    pathname.match(/^\/history\/[^/]+$/) ||
    // v2 shell routes render their own (v2) BottomNav via PillarShell.
    pathname.startsWith("/canary");
  if (hideNav) {
    return null;
  }

  const moreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div className="h-20" />

      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Fade gradient above nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40" ref={menuRef}>
        {/* More menu drawer */}
        {moreOpen && (
          <div className="bg-ft-surface border-t border-ft-border rounded-t-2xl px-4 pt-4 pb-2 mx-1 mb-[-1px] shadow-xl">
            <div className="grid grid-cols-3 gap-2">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors ${
                    pathname.startsWith(link.href)
                      ? "bg-ft-card"
                      : "hover:bg-ft-card/50"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-xs font-body text-ft-white">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bottom-nav-fade h-6 pointer-events-none" />
        <nav
          className="bg-ft-bg/95 backdrop-blur-sm border-t border-ft-border flex items-end justify-around px-2 pb-safe"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {tabs.map((tab) => {
            const active = isActive(tab.href);

            if (tab.isCenter) {
              // FAB is a sheet trigger, not a route. No active state.
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => setLogSheetOpen(true)}
                  aria-label="Log an activity"
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
                    style={{ color: "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))" }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <NavTab key={tab.href} href={tab.href} active={active} icon={tab.icon} label={tab.label} />
            );
          })}

          {/* More button */}
          <MoreTab active={moreActive || moreOpen} onClick={() => setMoreOpen(!moreOpen)} />
        </nav>
      </div>

      {/* +Log activity sheet — mounted at the BottomNav level so it
          overlays everything regardless of the active route. */}
      <LogActivitySheet open={logSheetOpen} onClose={() => setLogSheetOpen(false)} />
    </>
  );
}

/** Theme-aware nav tab with active indicator */
function NavTab({ href, active, icon, label }: { href: string; active: boolean; icon: (a: boolean) => React.ReactNode; label: string }) {
  const { wrapper, dot } = useNavIndicatorStyles(active);
  const activeColor = "rgb(var(--ft-accent))";
  const inactiveColor = "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))";

  return (
    <Link
      href={href}
      className="flex flex-col items-center pt-2 pb-1 px-3 min-w-[56px] transition-colors"
      style={wrapper}
    >
      <span style={{ color: active ? activeColor : inactiveColor }} className="transition-colors">
        {icon(active)}
      </span>
      <span
        className="text-[10px] font-body font-semibold mt-1 transition-colors"
        style={{ color: active ? activeColor : inactiveColor }}
      >
        {label}
      </span>
      {dot}
    </Link>
  );
}

/** Theme-aware More button with active indicator */
function MoreTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  const { wrapper, dot } = useNavIndicatorStyles(active);
  const activeColor = "rgb(var(--ft-accent))";
  const inactiveColor = "rgba(var(--ft-text-tertiary) / var(--ft-alpha-tertiary))";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center pt-2 pb-1 px-3 min-w-[56px] transition-colors"
      style={wrapper}
    >
      <span style={{ color: active ? activeColor : inactiveColor }} className="transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </span>
      <span
        className="text-[10px] font-body font-semibold mt-1 transition-colors"
        style={{ color: active ? activeColor : inactiveColor }}
      >
        More
      </span>
      {dot}
    </button>
  );
}
