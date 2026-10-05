"use client";

/**
 * Transitional (P2 → P10): pages not yet rebuilt in the kit assumed the root
 * <main> carried `px-4 py-4`. Kit screens own their own 20px gutters, so the
 * root no longer pads. This shim pads only the legacy routes. Delete it once
 * every route below has been restyled.
 */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LEGACY_PADDED: RegExp[] = [
  /^\/exercises(\/|$)/,
  /^\/history$/,
  /^\/progress\//,
  /^\/nutrition\/diary/,
  /^\/settings\/units/,
  /^\/log\/stretch-timer/,
];

export default function MainFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const padded = LEGACY_PADDED.some((re) => re.test(pathname));
  return (
    <main id="main-content" className={["mx-auto min-h-screen max-w-[600px] pb-24", padded ? "px-4 py-4" : ""].join(" ")}>
      {children}
    </main>
  );
}
