"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Archivo } from "./typography";
import type { ActiveBlock, ScheduleOverride } from "./types";

const WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** Map a movement-pattern key to the constant push/pull/legs/core token. */
function moveColor(p: string | null | undefined): string {
  if (p === "push") return "rgb(var(--ft-push))";
  if (p === "pull") return "rgb(var(--ft-pull))";
  if (p === "legs") return "rgb(var(--ft-legs))";
  return "rgb(var(--ft-core))";
}

const OVERRIDE_LABEL: Record<string, string> = {
  SKIP: "SKIP",
  SWAP: "SWAP",
  REPLACE: "REPLACE",
  REDUCE_DAYS: "REDUCE",
};

/**
 * 7-day strip showing this-week's schedule. Verbatim port of
 * gameplan-active.jsx#WeekSchedule (lines 1313–1366) with done/today/
 * future state derived from the parent's workouts-this-week fetch and
 * override pills sourced from `/api/schedule-overrides`.
 *
 * Day-of-week index is 0=Mon..6=Sun. `block.days` indexes by
 * `dayNumber − 1`; rest days fill remaining slots.
 */
export default function WeekStrip({
  block,
  todayDayOfWeek,
  workoutsByDow,
  overrides = [],
}: {
  block: ActiveBlock;
  todayDayOfWeek: number;
  /** Map of dayOfWeek (0-6) → true when a logged Workout exists this week. */
  workoutsByDow?: Record<number, boolean>;
  overrides?: ScheduleOverride[];
}) {
  const { chrome } = useTheme();
  const graffiti = chrome === "graffiti";

  return (
    <div style={{ display: "flex", gap: 5 }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const day = block.days[i] ?? null;
        const dayType = day?.dayType ?? "rest";
        const isRest = dayType === "rest" || !day;
        // Use the first exercise's movement pattern as the cell tint
        // when a day has exercises; fallback to the day-type kind.
        const movementKey = day?.exercises?.[0]?.movementPattern ?? null;
        const cellColor = isRest ? "rgb(var(--ft-text-tertiary))" : moveColor(movementKey);

        const isToday = i === todayDayOfWeek;
        const isDone = !!workoutsByDow?.[i] && i < todayDayOfWeek;

        const override = overrides.find((o) => o.dayOfWeek === i);

        const tilt = i % 2 === 0 ? -0.4 : 0.3;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              position: "relative",
              border: isToday
                ? `2px solid ${cellColor}`
                : `1px solid ${isDone ? `${cellColor}` : "rgb(var(--ft-border-faint))"}`,
              background: isToday ? `${cellColor}` : isDone ? `${cellColor}` : "transparent",
              backgroundColor: isToday
                ? "rgb(var(--ft-accent) / 0.13)"
                : isDone
                ? "rgb(var(--ft-pull) / 0.06)"
                : "transparent",
              padding: "6px 0 7px",
              textAlign: "center",
              transform: graffiti ? `rotate(${tilt}deg)` : "none",
              opacity: !day || (dayType === "rest" && !isToday) ? 0.55 : 1,
            }}
          >
            <Archivo
              size={8}
              color={isToday ? "rgb(var(--ft-text-primary))" : "rgb(var(--ft-text-tertiary))"}
              style={{ display: "block", letterSpacing: ".10em", textTransform: "uppercase" }}
            >
              {WEEK_LABELS[i]}
            </Archivo>
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                background: cellColor,
                margin: "4px auto 4px",
                opacity: isRest ? 0.4 : 1,
                display: "block",
              }}
            />
            <Archivo
              size={8}
              color={isToday ? cellColor : isDone ? "rgb(var(--ft-text-secondary))" : "rgb(var(--ft-text-tertiary))"}
              style={{ display: "block", letterSpacing: ".08em", textTransform: "uppercase" }}
            >
              {isRest ? "OFF" : (day!.name ?? "").split(" ")[0].slice(0, 5).toUpperCase()}
            </Archivo>
            {isDone && (
              <span
                aria-hidden
                className="font-data"
                style={{
                  position: "absolute",
                  top: 2,
                  right: 3,
                  color: cellColor,
                  fontSize: 9,
                }}
              >
                ✓
              </span>
            )}
            {override && (
              <Archivo
                size={7}
                color="rgb(var(--ft-warn-fg))"
                style={{
                  display: "block",
                  marginTop: 2,
                  letterSpacing: ".10em",
                  textTransform: "uppercase",
                }}
              >
                {OVERRIDE_LABEL[override.action] ?? override.action}
              </Archivo>
            )}
          </div>
        );
      })}
    </div>
  );
}
