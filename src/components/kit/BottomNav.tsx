"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NutritionIcon, SettingsIcon, StatsIcon, TrainingIcon } from "./icons";

const TABS = [
  { href: "/training", label: "Training", Icon: TrainingIcon },
  { href: "/nutrition", label: "Nutrition", Icon: NutritionIcon },
  { href: "/stats", label: "Stats", Icon: StatsIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
] as const;

/** Full-screen flows own the bottom edge: no tabs there. */
const HIDDEN: RegExp[] = [
  /^\/log\/[^/]+$/, // logger (blockDayId | new-blank)
  /^\/log\/frame\//,
  /^\/log\/activity\//,
  /^\/log\/stretch-timer$/,
  /^\/nutrition\/log$/,
  /^\/nutrition\/scan/,
  /^\/nutrition\/days\/[^/]+$/, // Day Builder (sticky totals bar)
  /^\/nutrition\/meals\/[^/]+$/, // Meal Builder (sticky save bar)
  /^\/signin/,
];

export function isNavHidden(pathname: string): boolean {
  return HIDDEN.some((re) => re.test(pathname));
}

/** The one bottom bar: Training · Nutrition · Stats · Settings. */
export default function BottomNav() {
  const pathname = usePathname();
  if (isNavHidden(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto grid max-w-[600px] grid-cols-4 border-t border-ft-border bg-ft-surface px-2.5 pt-2"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      {TABS.map(({ href, label, Icon }) => {
        const on = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={["flex flex-col items-center gap-[3px] py-1", on ? "text-ft-accent" : "text-ft-dim"].join(" ")}
          >
            <Icon size={22} />
            <span className={["font-data text-[9.5px] uppercase tracking-[0.14em]", on ? "font-bold" : "font-medium"].join(" ")}>{label}</span>
            <span className={["h-[3px] w-[22px] rounded-[2px]", on ? "ft-chrome-bar" : "bg-transparent"].join(" ")} />
          </Link>
        );
      })}
    </nav>
  );
}
