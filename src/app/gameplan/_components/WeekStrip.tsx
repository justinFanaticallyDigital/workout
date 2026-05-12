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
 * 7-day strip showing this-week's schedule with workout name + adherence
 * status per cell. Cells render: day label · color block · workout name
 * (up to 9 chars, never truncating mid-word when possible) · status pill
 * (DONE / TODAY / OPEN / MISSED / REST).
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
        const movementKey = day?.exercises?.[0]?.movementPattern ?? null;
        const cellColor = isRest ? "rgb(var(--ft-text-tertiary))" : moveColor(movementKey);

        const isToday = i === todayDayOfWeek;
        const isPast = i < todayDayOfWeek;
        const isLogged = !!workoutsByDow?.[i];
        // Adherence state. Past + scheduled + not logged → MISSED.
        // Today / future + scheduled → OPEN / PLAN.
        const status: "done" | "today" | "missed" | "open" | "plan" | "rest" = isRest
          ? "rest"
          : isLogged
            ? "done"
            : isToday
              ? "today"
              : isPast
                ? "missed"
                : "plan";

        const override = overrides.find((o) => o.dayOfWeek === i);

        const tilt = i % 2 === 0 ? -0.4 : 0.3;
        const dayName = isRest ? "REST" : truncateWorkoutName(day?.name ?? "");

        return (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: 0,
              position: "relative",
              border: isToday
                ? `2px solid ${cellColor}`
                : `1px solid ${status === "done" ? cellColor : "rgb(var(--ft-border-faint))"}`,
              backgroundColor: isToday
                ? "rgb(var(--ft-accent) / 0.13)"
                : status === "done"
                  ? "rgb(var(--ft-success) / 0.08)"
                  : status === "missed"
                    ? "rgb(var(--ft-warn) / 0.06)"
                    : "transparent",
              padding: "6px 2px 7px",
              textAlign: "center",
              transform: graffiti ? `rotate(${tilt}deg)` : "none",
              opacity: status === "rest" && !isToday ? 0.55 : 1,
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
                width: "60%",
                height: 4,
                background: cellColor,
                margin: "4px auto 4px",
                opacity: isRest ? 0.4 : 1,
                display: "block",
              }}
            />
            <Archivo
              size={9}
              color={
                isToday
                  ? cellColor
                  : status === "done"
                    ? "rgb(var(--ft-text-secondary))"
                    : "rgb(var(--ft-text-tertiary))"
              }
              style={{
                display: "block",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                lineHeight: 1.15,
                wordBreak: "break-word",
              }}
              title={day?.name ?? "Rest"}
            >
              {dayName}
            </Archivo>
            <StatusPill status={status} cellColor={cellColor} />
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

/** Truncate the workout name to ~9 chars without breaking mid-word. */
function truncateWorkoutName(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "—";
  const upper = cleaned.toUpperCase();
  if (upper.length <= 9) return upper;
  // Prefer breaking at a space; otherwise hard-cut.
  const firstChunk = upper.split(" ")[0];
  if (firstChunk.length <= 9) return firstChunk;
  return upper.slice(0, 8) + "…";
}

function StatusPill({
  status,
  cellColor,
}: {
  status: "done" | "today" | "missed" | "open" | "plan" | "rest";
  cellColor: string;
}) {
  const map: Record<typeof status, { label: string; color: string }> = {
    done: { label: "✓ DONE", color: "rgb(var(--ft-success-fg))" },
    today: { label: "TODAY", color: cellColor },
    missed: { label: "MISSED", color: "rgb(var(--ft-warn-fg))" },
    open: { label: "OPEN", color: "rgb(var(--ft-text-secondary))" },
    plan: { label: "PLAN", color: "rgb(var(--ft-text-tertiary))" },
    rest: { label: "OFF", color: "rgb(var(--ft-text-tertiary))" },
  };
  const { label, color } = map[status];
  return (
    <Archivo
      size={7}
      color={color}
      style={{
        display: "block",
        marginTop: 4,
        letterSpacing: ".10em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {label}
    </Archivo>
  );
}
