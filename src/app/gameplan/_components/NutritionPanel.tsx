"use client";

import Link from "next/link";
import { Marker, Archivo } from "./typography";
import { DashedDivider } from "./Ornaments";
import { EditPlanBtn } from "./EditPlanBtn";
import type { MealsData, NutritionTarget } from "./types";

interface Props {
  meals: MealsData | null;
  target: NutritionTarget | null;
  /** Active program id for the EditPlanBtn link target. */
  programId: string | null;
  /** Active block — drives the NEXT REFEED footer via `block.refeedWeeks`. */
  activeBlock: { startDate: string | null; refeedWeeks?: number[] } | null;
}

const MACRO_COLORS = {
  protein: "rgb(var(--ft-pull))",
  carbs: "rgb(var(--ft-core))",
  fat: "rgb(var(--ft-legs))",
};

export default function NutritionPanel({ meals, target, programId, activeBlock }: Props) {
  const nextRefeed = computeNextRefeedLabel(activeBlock);
  const calCur = meals ? Math.round(meals.totals.calories) : 0;
  const calTarget = target?.calories ?? null;
  const calPct = calTarget ? Math.min(100, (calCur / calTarget) * 100) : 0;
  const calLeft = calTarget ? Math.max(0, calTarget - calCur) : null;

  const macros = [
    { label: "PROTEIN", cur: Math.round(meals?.totals.protein ?? 0), target: target?.protein ?? null, color: MACRO_COLORS.protein },
    { label: "CARBS", cur: Math.round(meals?.totals.carbs ?? 0), target: target?.carbs ?? null, color: MACRO_COLORS.carbs },
    { label: "FAT", cur: Math.round(meals?.totals.fat ?? 0), target: target?.fat ?? null, color: MACRO_COLORS.fat },
  ];

  return (
    <div className="space-y-4">
      {/* Calorie ring */}
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="flex items-center gap-4">
          <CalorieRing pct={calPct} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-data text-4xl text-ft-white">{calCur.toLocaleString()}</span>
              <span className="font-body text-[10px] uppercase tracking-[0.15em] text-ft-dim">
                KCAL
              </span>
            </div>
            {calTarget != null ? (
              <div className="font-body text-[10px] uppercase tracking-[0.12em] text-ft-dim">
                OF{" "}
                <span className="font-data text-base text-ft-light">{calTarget.toLocaleString()}</span>{" "}
                TARGET
              </div>
            ) : (
              <div className="font-body text-[10px] uppercase tracking-[0.12em] text-ft-dim">
                NO TARGET SET
              </div>
            )}
            {calLeft != null && (
              <div className="mt-1 inline-flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: calPct >= 100 ? "rgb(var(--ft-warn))" : "rgb(var(--ft-success))" }}
                />
                <span
                  className="font-body text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: calPct >= 100 ? "rgb(var(--ft-warn))" : "rgb(var(--ft-success))" }}
                >
                  {calPct >= 100 ? `${calCur - calTarget!} OVER` : `${calLeft} LEFT`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim mb-3">
          MACROS · TODAY
        </div>
        <div className="flex flex-col gap-3">
          {macros.map((m) => {
            const pct = m.target != null ? Math.min(100, (m.cur / m.target) * 100) : 0;
            return (
              <div key={m.label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-body text-[10px] uppercase tracking-[0.15em] text-ft-light">
                    {m.label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-data text-lg text-ft-white">{m.cur}</span>
                    <span className="font-body text-[9px] uppercase tracking-[0.1em] text-ft-dim">
                      {m.target != null ? `/ ${m.target}g` : "g"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-ft-border/40 border border-ft-border/40 overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
        <Link
          href="/nutrition"
          className="mt-4 inline-block font-body text-[11px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent"
        >
          Log a meal →
        </Link>
      </div>

      {!target && (
        <div className="border border-dashed border-ft-warn/60 bg-ft-warn/5 p-3">
          <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-warn mb-1">
            NO TARGETS SET
          </div>
          <p className="font-body text-xs text-ft-light">
            Set calorie and macro targets in{" "}
            <Link href="/nutrition" className="underline text-ft-accent">
              Nutrition
            </Link>{" "}
            to see daily progress here.
          </p>
        </div>
      )}

      {/* NEXT REFEED footer — verbatim port of gameplan-active.jsx
          NutritionTab footer (lines 1470–1479). Reads
          `Block.refeedWeeks` (R6 schema landing) + `block.startDate`
          to compute the next upcoming refeed week. */}
      <DashedDivider style={{ margin: "12px 0 8px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-on-bg-ter))"
            style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
          >
            NEXT REFEED
          </Archivo>
          <Marker
            style={{ fontSize: 14, color: "rgb(var(--ft-text-on-bg))", display: "block", marginTop: 1 }}
          >
            {nextRefeed}
          </Marker>
        </div>
        {programId && <EditPlanBtn align="flex-end" href={`/programs/${programId}`} />}
      </div>
    </div>
  );
}

/**
 * Compute the next-upcoming refeed label (e.g. "SUN · WK 8") from
 * the active block's `refeedWeeks` array + `startDate`. Each entry
 * in `refeedWeeks` is the 1-indexed week within the block; refeed
 * day defaults to Sunday (the canonical "weekly check-in + refeed"
 * day per the prototype templates).
 *
 * Returns "—" when no upcoming refeed is scheduled.
 */
function computeNextRefeedLabel(
  block: { startDate: string | null; refeedWeeks?: number[] } | null,
): string {
  const weeks = block?.refeedWeeks ?? [];
  if (!block?.startDate || weeks.length === 0) return "—";
  const start = new Date(block.startDate).getTime();
  const now = Date.now();
  for (const w of [...weeks].sort((a, b) => a - b)) {
    // Sunday of the (w-1)-th week from block.startDate. If startDate
    // is itself a Monday, Sunday is +6 days.
    const sundayMs = start + ((w - 1) * 7 + 6) * 86400000;
    if (sundayMs >= now) {
      const sunday = new Date(sundayMs);
      const dow = sunday
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      return `${dow} · WK ${w}`;
    }
  }
  return "—";
}

function CalorieRing({ pct }: { pct: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (Math.min(100, pct) / 100) * circ;
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" aria-hidden>
      <circle cx="43" cy="43" r={radius} fill="none" stroke="rgb(var(--ft-border) / 0.4)" strokeWidth="6" />
      <circle
        cx="43"
        cy="43"
        r={radius}
        fill="none"
        stroke={pct >= 100 ? "rgb(var(--ft-warn))" : "rgb(var(--ft-accent))"}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 43 43)"
      />
    </svg>
  );
}
