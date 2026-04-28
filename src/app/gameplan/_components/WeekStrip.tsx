"use client";

import type { ActiveBlock } from "./types";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const TYPE_COLOR: Record<string, string> = {
  lifting: "rgb(var(--ft-push))",
  cardio: "rgb(var(--ft-pull))",
  conditioning: "rgb(var(--ft-core))",
  mobility: "rgb(var(--ft-accent))",
  rest: "rgb(var(--ft-dim))",
};

/**
 * 7-day strip showing this-week's schedule. Days from the active
 * block's `days` array map to Mon..Sun by index — rest days fill the
 * remaining slots.
 */
export default function WeekStrip({
  block,
  todayDayOfWeek,
}: {
  block: ActiveBlock;
  todayDayOfWeek: number;
}) {
  // Build a 7-slot week from block days (cycling if dayCount < 7).
  const cells = Array.from({ length: 7 }).map((_, i) => {
    const day = block.days[i] ?? null;
    return {
      label: WEEK_LABELS[i],
      day,
      isToday: i === todayDayOfWeek,
    };
  });

  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((c, i) => {
        const t = c.day?.dayType ?? "rest";
        const color = TYPE_COLOR[t] ?? TYPE_COLOR.rest;
        const isRest = t === "rest" || !c.day;
        return (
          <div
            key={i}
            className={[
              "py-2 text-center border-t-2 relative",
              c.isToday ? "ring-1 ring-ft-accent ring-inset" : "",
            ].join(" ")}
            style={{
              background: isRest ? "rgba(255,255,255,0.02)" : `${color}1f`,
              borderColor: isRest ? "rgba(255,255,255,0.1)" : color,
            }}
          >
            <div className="font-body text-[9px] tracking-[0.1em] text-ft-light">{c.label}</div>
            <div
              className="font-body text-[9px] uppercase tracking-wider mt-0.5 truncate px-0.5"
              style={{ color: isRest ? "rgb(var(--ft-dim))" : color }}
            >
              {isRest ? "—" : (c.day?.name ?? "").split(" ")[0].slice(0, 5)}
            </div>
            {c.isToday && (
              <div className="absolute top-0 right-0.5 font-body text-[7px] uppercase tracking-[0.15em] text-ft-accent">
                NOW
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
