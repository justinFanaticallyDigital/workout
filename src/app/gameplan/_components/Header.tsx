"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Marker, Reenie, Archivo } from "./typography";
import { SprayUnderline } from "./Ornaments";
import type { ActiveProgram, ActiveBlock } from "./types";

interface Props {
  program: ActiveProgram;
  block: ActiveBlock | null;
}

/**
 * Sticky header strip — program name, week-of-total, current block,
 * active badge, days-left counter, and the week progress bar.
 *
 * Verbatim port of gameplan-active.jsx#StatusStrip (lines 341–407):
 * Marker display name + SprayUnderline + Archivo metadata + days-left
 * Reenie counter + chrome-branched progress bar fill (graffiti uses a
 * 45° hatched stripe; every other chrome uses a flat accent fill).
 */
export default function Header({ program, block }: Props) {
  const { chrome } = useTheme();
  const totalWeeks = program.durationWeeks ?? 12;
  const currentWeek = computeCurrentWeek(program.startDate, totalWeeks);
  const daysLeft = computeDaysLeft(program.startDate, totalWeeks);
  const weekPct = Math.min(100, Math.max(0, (currentWeek / totalWeeks) * 100));
  const progressFill =
    chrome === "graffiti"
      ? "repeating-linear-gradient(45deg, rgb(var(--ft-info-fg)) 0 4px, rgb(var(--ft-info-fg) / 0.8) 4px 8px)"
      : "rgb(var(--ft-accent))";

  return (
    <header
      className="ft-card sticky top-0 z-10"
      style={{
        background: "rgb(var(--ft-surface-alt))",
        borderBottom: "1px solid rgb(var(--ft-border-faint))",
        padding: "14px 18px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Marker
            style={{
              fontSize: 26,
              color: "rgb(var(--ft-text-primary))",
              letterSpacing: ".01em",
              display: "block",
              lineHeight: 1.05,
              transform: "rotate(-1deg)",
              transformOrigin: "left",
            }}
          >
            {program.name}
          </Marker>
          <SprayUnderline width={170} style={{ marginTop: 2, marginLeft: -4 }} />
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Archivo
              size={9}
              color="rgb(var(--ft-text-secondary))"
              style={{ letterSpacing: ".10em", textTransform: "uppercase" }}
            >
              WEEK {currentWeek} OF {totalWeeks}
            </Archivo>
            {block && (
              <>
                <span
                  aria-hidden
                  style={{
                    width: 4,
                    height: 4,
                    background: "rgb(var(--ft-border-strong))",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                <Archivo
                  size={9}
                  color="rgb(var(--ft-text-secondary))"
                  style={{ letterSpacing: ".10em", textTransform: "uppercase" }}
                >
                  BLOCK {block.blockNumber}: {block.name.toUpperCase()}
                </Archivo>
              </>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 9px",
              border: "1px solid rgb(var(--ft-success-border))",
              background: "rgb(var(--ft-success-bg))",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgb(var(--ft-success-fg))",
                boxShadow: "0 0 6px rgb(var(--ft-success-fg) / 0.55)",
                display: "inline-block",
              }}
            />
            <Archivo
              size={9}
              color="rgb(var(--ft-success-fg))"
              style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
            >
              ACTIVE
            </Archivo>
          </span>
          {daysLeft !== null && (
            <div style={{ marginTop: 8, lineHeight: 1 }}>
              <Reenie style={{ fontSize: 36, color: "rgb(var(--ft-text-primary))" }}>{daysLeft}</Reenie>
              <Archivo
                size={8}
                color="rgb(var(--ft-text-tertiary))"
                style={{ display: "block", letterSpacing: ".18em", marginTop: 2, textTransform: "uppercase" }}
              >
                DAYS LEFT
              </Archivo>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 10, position: "relative" }}>
        <div
          style={{
            height: 6,
            background: "rgb(var(--ft-border-faint))",
            border: "1px solid rgb(var(--ft-border-faint))",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${weekPct}%`,
              background: progressFill,
            }}
            aria-label={`Week ${currentWeek} of ${totalWeeks}`}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".15em", textTransform: "uppercase" }}
          >
            W1
          </Archivo>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".15em", textTransform: "uppercase" }}
          >
            W{totalWeeks}
          </Archivo>
        </div>
      </div>
    </header>
  );
}

function computeCurrentWeek(startDateStr: string | null, totalWeeks: number): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr).getTime();
  const now = Date.now();
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  if (days < 0) return 1;
  const week = Math.floor(days / 7) + 1;
  return Math.min(Math.max(1, week), totalWeeks);
}

function computeDaysLeft(startDateStr: string | null, totalWeeks: number): number | null {
  if (!startDateStr) return null;
  const start = new Date(startDateStr).getTime();
  const end = start + totalWeeks * 7 * 24 * 60 * 60 * 1000;
  const days = Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}
