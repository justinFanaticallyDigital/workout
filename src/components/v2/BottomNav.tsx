"use client";

/**
 * v2 BottomNav — the ONE bottom shell (ARCHITECTURE.md §3, MIGRATION_MAP §1.1).
 *
 *   [1] Tier home · [2] Training · [3] +Log (FAB) · [4] Nutrition · [5] Lifestyle
 *
 * Slot 1's label/route follow the active tier; slot 5 (Lifestyle) preview-locks
 * on the logger tier (dot badge, still navigable to the locked preview). NEVER
 * contains Progress or Settings — those are reached from slot 1 / the gear.
 *
 * Rendered as a normal flex child by PillarShell (the shell positions it); not
 * fixed itself. The +Log FAB opens the shared LogActivitySheet.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTier } from "@/providers/TierProvider";
import { tierHome } from "@/lib/tier";
import LogActivitySheet from "@/components/ui/LogActivitySheet";

type Slot = {
  id: number;
  label: string;
  href: string;
  icon: ReactNode;
  locked?: boolean;
};

function Icon({ path, strong = false }: { path: ReactNode; strong?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strong ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}

export default function BottomNav() {
  const { tier } = useTier();
  const pathname = usePathname();
  const [logOpen, setLogOpen] = useState(false);
  const home = tierHome(tier);

  const slots: Slot[] = [
    {
      id: 1,
      label: home.label,
      href: home.href,
      icon: <Icon path={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />,
    },
    {
      id: 2,
      label: "Training",
      href: "/training",
      icon: <Icon path={<><path d="M6.5 6.5l11 11" /><path d="M4 8l4-4 2 2-4 4zM16 20l4-4-2-2-4 4z" /></>} />,
    },
    {
      id: 4,
      label: "Nutrition",
      href: "/nutrition",
      icon: <Icon path={<><path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></>} />,
    },
    {
      id: 5,
      label: "Lifestyle",
      href: "/lifestyle",
      locked: tier === "logger",
      icon: <Icon path={<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />} />,
    },
  ];

  // Hidden on full-screen flows (own footer / takeover UI) — the single nav
  // for the whole app (ARCHITECTURE §3). Mounted once, globally, in layout.
  const hidden =
    (pathname.match(/^\/log\/[^/]+$/) && pathname !== "/log/library") ||
    pathname.startsWith("/log/activity/") ||
    pathname.startsWith("/log/frame/") ||
    pathname === "/log/stretch-timer" ||
    pathname === "/nutrition/log" ||
    pathname === "/library/as-gameplan" ||
    pathname === "/gameplan/new" ||
    pathname === "/checkin" ||
    pathname === "/signin" ||
    pathname === "/welcome" ||
    !!pathname.match(/^\/gameplan\/[^/]+\/planning$/) ||
    !!pathname.match(/^\/programs\/[^/]+\/planning$/) ||
    !!pathname.match(/^\/programs\/[^/]+\/blocks\//) ||
    !!pathname.match(/^\/history\/[^/]+$/) ||
    (!!pathname.match(/^\/exercises\/[^/]+$/) && pathname !== "/exercises/new") ||
    pathname.startsWith("/canary");
  if (hidden) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const left = slots.slice(0, 2);
  const right = slots.slice(2);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[600px] items-stretch border-t border-ft-border-faint bg-ft-surface"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {left.map((s) => (
          <NavSlot key={s.id} slot={s} active={isActive(s.href)} />
        ))}

        {/* center +Log FAB — a sheet trigger, not a route */}
        <div className="flex flex-1 items-start justify-center">
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            aria-label="Log an activity"
            className="-mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-ft-accent text-ft-on-accent shadow-ft-md transition-transform active:scale-95"
          >
            <Icon path={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} strong />
          </button>
        </div>

        {right.map((s) => (
          <NavSlot key={s.id} slot={s} active={isActive(s.href)} />
        ))}
      </nav>

      <LogActivitySheet open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  );
}

function NavSlot({ slot, active }: { slot: Slot; active: boolean }) {
  return (
    <Link
      href={slot.href}
      className={[
        "relative flex flex-1 flex-col items-center gap-[3px] px-0 pt-2",
        active ? "text-ft-accent" : slot.locked ? "text-ft-dim" : "text-ft-light",
      ].join(" ")}
    >
      {slot.icon}
      <span className="font-body text-[10px] tracking-[0.01em]">{slot.label}</span>
      {slot.locked && (
        <span className="absolute right-[28%] top-1.5 h-1.5 w-1.5 rounded-full bg-ft-warn" />
      )}
    </Link>
  );
}
