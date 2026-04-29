"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Plex, Mono, BarcodeStrip, SectionH } from "./primitives";
import { StatusGlyph, IconPulse, IconMoon, IconBarbell, IconFlame, IconWarn } from "./icons";
import { Sparkline } from "./primitives";
import type { CheckIn } from "../types";

/**
 * Snapshot section — REPURPOSED from the prototype's body-weight /
 * sessions / calories / sleep tile grid into an 8-tile grid covering
 * the live CheckIn schema:
 *   5 × subjective ratings (1–5)  + 3 × adherence percentages (0–100).
 *
 * The visual shell (BarcodeStrip on lab/notebook, 2-col grid, tone
 * coloring, status glyph in corner) is preserved from the prototype.
 * sparkData renders empty-state when no prior check-ins are loaded.
 */
export default function SnapshotSection({
  checkIn,
  priorCheckIns,
}: {
  checkIn: CheckIn;
  priorCheckIns: CheckIn[];
}) {
  const { chrome } = useTheme();
  const showBarcode = chrome === "lab" || chrome === "notebook";

  return (
    <div style={{ padding: "16px 16px 4px" }}>
      <SectionH kicker="2.1 / Snapshot" title="This week's pulse" />
      <div
        style={{
          background: "rgb(var(--ft-surface))",
          border: "1px solid rgb(var(--ft-border))",
          borderRadius: 8,
          position: "relative",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {showBarcode && <BarcodeStrip width={18} height="auto" seed={9} />}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {/* Subjective ratings (1–5) — higher = better for the first 3, lower = better for soreness/stress */}
          <SnapshotTile
            label="Energy"
            sub="1–5 self-report"
            value={checkIn.energy != null ? String(checkIn.energy) : "—"}
            unit="/ 5"
            tone={ratingTone(checkIn.energy, "high")}
            Icon={IconPulse}
            sparkData={extractSeries(priorCheckIns, "energy")}
            border="r b"
          />
          <SnapshotTile
            label="Sleep"
            sub="Quality 1–5"
            value={checkIn.sleepQuality != null ? String(checkIn.sleepQuality) : "—"}
            unit="/ 5"
            tone={ratingTone(checkIn.sleepQuality, "high")}
            Icon={IconMoon}
            sparkData={extractSeries(priorCheckIns, "sleepQuality")}
            border="b"
          />
          <SnapshotTile
            label="Soreness"
            sub="1–5, lower better"
            value={checkIn.soreness != null ? String(checkIn.soreness) : "—"}
            unit="/ 5"
            tone={ratingTone(checkIn.soreness, "low")}
            Icon={IconBarbell}
            sparkData={extractSeries(priorCheckIns, "soreness")}
            border="r b"
          />
          <SnapshotTile
            label="Stress"
            sub="1–5, lower better"
            value={checkIn.stress != null ? String(checkIn.stress) : "—"}
            unit="/ 5"
            tone={ratingTone(checkIn.stress, "low")}
            Icon={IconWarn}
            sparkData={extractSeries(priorCheckIns, "stress")}
            border="b"
          />
          <SnapshotTile
            label="Motivation"
            sub="1–5 self-report"
            value={checkIn.motivation != null ? String(checkIn.motivation) : "—"}
            unit="/ 5"
            tone={ratingTone(checkIn.motivation, "high")}
            Icon={IconFlame}
            sparkData={extractSeries(priorCheckIns, "motivation")}
            border="r b"
          />
          <SnapshotTile
            label="Lift adherence"
            sub="% planned"
            value={checkIn.liftAdherence != null ? String(checkIn.liftAdherence) : "—"}
            unit="%"
            tone={percentTone(checkIn.liftAdherence)}
            Icon={IconBarbell}
            sparkData={extractSeries(priorCheckIns, "liftAdherence")}
            border="b"
          />
          <SnapshotTile
            label="Cardio adherence"
            sub="% planned"
            value={checkIn.cardioAdherence != null ? String(checkIn.cardioAdherence) : "—"}
            unit="%"
            tone={percentTone(checkIn.cardioAdherence)}
            Icon={IconPulse}
            sparkData={extractSeries(priorCheckIns, "cardioAdherence")}
            border="r"
          />
          <SnapshotTile
            label="Nutrition adherence"
            sub="% planned"
            value={checkIn.nutritionAdherence != null ? String(checkIn.nutritionAdherence) : "—"}
            unit="%"
            tone={percentTone(checkIn.nutritionAdherence)}
            Icon={IconFlame}
            sparkData={extractSeries(priorCheckIns, "nutritionAdherence")}
            border=""
          />
        </div>
      </div>
    </div>
  );
}

export function SnapshotTile({
  label,
  sub,
  value,
  unit,
  tone,
  Icon,
  sparkData,
  border = "",
}: {
  label: string;
  sub?: string;
  value: string;
  unit?: string;
  tone: "red" | "yellow" | "green" | "neutral";
  Icon?: React.ComponentType<{ size?: number; color?: string }>;
  sparkData?: number[] | null;
  border?: string;
}) {
  const borderRight = border.includes("r") ? "1px solid rgb(var(--ft-border-faint))" : "none";
  const borderBottom = border.includes("b") ? "1px solid rgb(var(--ft-border-faint))" : "none";
  const sparkColor =
    tone === "red" ? "rgb(var(--ft-danger-fg))"
    : tone === "yellow" ? "rgb(var(--ft-warn-fg))"
    : tone === "green" ? "rgb(var(--ft-success-fg))"
    : "rgb(var(--ft-accent))";
  const toneColor =
    tone === "red" ? "rgb(var(--ft-danger-fg))"
    : tone === "yellow" ? "rgb(var(--ft-warn-fg))"
    : tone === "green" ? "rgb(var(--ft-success-fg))"
    : "rgb(var(--ft-text-secondary))";
  return (
    <div
      style={{
        padding: "12px 12px 12px",
        borderRight,
        borderBottom,
        position: "relative",
        minHeight: 124,
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 12 }}>
        {tone !== "neutral" && <StatusGlyph tone={tone} size={9} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {Icon && <Icon size={12} color={toneColor} />}
        <Plex size={11} weight={600} color="rgb(var(--ft-text-secondary))">
          {label}
        </Plex>
      </div>
      {sub && (
        <Mono size={9} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".08em", display: "block", marginBottom: 6 }}>
          {sub}
        </Mono>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <Mono size={22} weight={700} color={value === "—" ? "rgb(var(--ft-text-tertiary))" : "rgb(var(--ft-text-primary))"} style={{ letterSpacing: "-.01em" }}>
          {value}
        </Mono>
        {unit && (
          <Mono size={10} weight={500} color="rgb(var(--ft-text-tertiary))">
            {unit}
          </Mono>
        )}
      </div>
      <Sparkline data={sparkData ?? null} color={sparkColor} />
    </div>
  );
}

/* ─── Tone helpers ─────────────────────────────────────────────── */

function ratingTone(value: number | null | undefined, direction: "high" | "low"): "red" | "yellow" | "green" | "neutral" {
  if (value == null) return "neutral";
  if (direction === "high") {
    if (value >= 4) return "green";
    if (value >= 3) return "yellow";
    return "red";
  }
  // direction === "low" — soreness, stress: lower = better
  if (value <= 2) return "green";
  if (value <= 3) return "yellow";
  return "red";
}

function percentTone(value: number | null | undefined): "red" | "yellow" | "green" | "neutral" {
  if (value == null) return "neutral";
  if (value >= 80) return "green";
  if (value >= 60) return "yellow";
  return "red";
}

function extractSeries(prior: CheckIn[], key: keyof CheckIn): number[] | null {
  const values = prior
    .slice()
    .reverse()
    .map((c) => c[key])
    .filter((v): v is number => typeof v === "number");
  return values.length === 0 ? null : values;
}
