"use client";

import Link from "next/link";
import { Sheet } from "@/components/kit";

const OPTIONS: { href: string; label: string; sub: string }[] = [
  { href: "/log/activity/hiit", label: "HIIT", sub: "Interval session" },
  { href: "/log/activity/liss", label: "Cardio", sub: "Steady-state" },
  { href: "/log/activity/class", label: "Class", sub: "Group session" },
  { href: "/log/stretch-timer", label: "Stretch", sub: "Timed routine" },
  { href: "/log/activity/custom", label: "Custom", sub: "Anything else" },
];

/** Non-lifting activities — logged as ActivityLog rows, counted in Stats as a trained day. */
export default function ActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Other activity">
      <ul className="divide-y divide-ft-border-faint">
        {OPTIONS.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="flex items-center gap-3 py-3" onClick={onClose}>
              <span className="min-w-0 flex-1">
                <span className="block font-data text-[14px] font-semibold text-ft-white">{o.label}</span>
                <span className="block font-body text-[12px] text-ft-dim">{o.sub}</span>
              </span>
              <span className="font-data text-[14px] text-ft-accent">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
