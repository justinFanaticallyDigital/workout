"use client";

/**
 * Block timeline editor — verbatim port of planning-screens.jsx
 * #BlockTimeline (lines 429–552): original row dashed (read-only) +
 * draft row solid with -/+ duration buttons per block, deload-hatched
 * fill, +1w / +NEW edit badges.
 *
 * Distinct from R5 dashboard `BlockTimeline` (read-only proportional
 * bar). The drag-edge gesture from the prototype is replaced by
 * explicit -/+ buttons because precise duration edits are easier to
 * get right with discrete controls than with a drag.
 */

import { Marker, Archivo } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import type { DraftBlock } from "./types";

const PHASE_COLOR: Record<string, string> = {
  accumulation: "rgb(var(--ft-pull))",
  intensification: "rgb(var(--ft-push))",
  peaking: "rgb(var(--ft-legs))",
  peak_week: "rgb(var(--ft-legs))",
  deload: "rgb(var(--ft-text-secondary))",
  prep: "rgb(var(--ft-accent))",
};
function phaseColor(phase: string | null | undefined): string {
  if (!phase) return "rgb(var(--ft-accent))";
  return PHASE_COLOR[phase] ?? "rgb(var(--ft-accent))";
}

export function PlanningBlockTimeline({
  draftBlocks,
  originalBlocks,
  onChangeDuration,
}: {
  draftBlocks: DraftBlock[];
  originalBlocks: DraftBlock[];
  onChangeDuration: (blockId: string, newDuration: number) => void;
}) {
  const totalOrig = originalBlocks.reduce((s, b) => s + (b.durationWeeks ?? 4), 0) || 1;
  const totalDraft = draftBlocks.reduce((s, b) => s + (b.durationWeeks ?? 4), 0) || 1;
  const sOrig = new Map(originalBlocks.map((b) => [b.id, b]));

  return (
    <PlanningCard
      style={{ margin: "10px 12px 0" }}
      label={`TIMELINE · ${totalOrig}WK → ${totalDraft}WK`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Marker style={{ fontSize: 10 }}>periodization</Marker>
        <Archivo size={9} color="rgb(var(--ft-accent))">
          {totalDraft - totalOrig === 0
            ? "no duration change"
            : `${totalDraft - totalOrig > 0 ? "+" : "−"}${Math.abs(totalDraft - totalOrig)} wk`}
        </Archivo>
      </div>

      <PlanningDashed style={{ margin: "8px 0" }} />

      {/* ORIGINAL row */}
      <div style={{ marginBottom: 12 }}>
        <Archivo
          size={7}
          color="rgb(var(--ft-text-tertiary))"
          style={{ letterSpacing: ".18em", marginBottom: 4, display: "block" }}
        >
          ORIGINAL · {totalOrig} WK
        </Archivo>
        <div style={{ display: "flex", height: 22, gap: 1, opacity: 0.55 }}>
          {originalBlocks.map((b, i) => {
            const c = phaseColor(b.phase);
            return (
              <div
                key={i}
                style={{
                  flex: b.durationWeeks ?? 4,
                  background: "transparent",
                  border: `1px dashed ${c}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  letterSpacing: ".1em",
                  color: c,
                }}
                className="font-body"
              >
                {b.durationWeeks ?? 4}w
              </div>
            );
          })}
        </div>
      </div>

      {/* DRAFT row */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Archivo size={7} color="rgb(var(--ft-accent))" style={{ letterSpacing: ".18em" }}>
            DRAFT · {totalDraft} WK
          </Archivo>
          <Archivo
            size={7}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em" }}
          >
            TAP −/+ TO ADJUST
          </Archivo>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {draftBlocks.map((b) => {
            const c = phaseColor(b.phase);
            const orig = sOrig.get(b.id);
            const dur = b.durationWeeks ?? 4;
            const origDur = orig?.durationWeeks ?? null;
            const isDeload = b.phase === "deload";
            const changedBadge =
              origDur != null && origDur !== dur ? `${dur > origDur ? "+" : "−"}${Math.abs(dur - origDur)}w` : null;
            return (
              <div
                key={b.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  className="font-body"
                  style={{
                    flex: dur,
                    background: isDeload
                      ? `repeating-linear-gradient(45deg, ${c} 0 3px, transparent 3px 6px)`
                      : `${c}20`,
                    border: `${changedBadge ? "1.5px" : "1px"} solid ${c}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    letterSpacing: ".06em",
                    color: c,
                    padding: "4px 6px",
                    position: "relative",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{b.name}</span>
                  <span style={{ fontSize: 8, opacity: 0.85 }}>{dur}w</span>
                  {changedBadge && (
                    <span
                      style={{
                        position: "absolute",
                        top: -7,
                        right: 4,
                        fontSize: 9,
                        color: "rgb(var(--ft-accent))",
                        background: "rgb(var(--ft-bg-alt))",
                        padding: "0 4px",
                      }}
                    >
                      {changedBadge}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => onChangeDuration(b.id, Math.max(1, dur - 1))}
                    className="font-body"
                    style={{
                      width: 24,
                      height: 24,
                      border: "1px solid rgb(var(--ft-border))",
                      background: "transparent",
                      color: "rgb(var(--ft-text-primary))",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    aria-label={`Decrease ${b.name}`}
                  >
                    −
                  </button>
                  <button
                    onClick={() => onChangeDuration(b.id, dur + 1)}
                    className="font-body"
                    style={{
                      width: 24,
                      height: 24,
                      border: "1px solid rgb(var(--ft-accent))",
                      background: "rgb(var(--ft-accent-faint))",
                      color: "rgb(var(--ft-accent))",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    aria-label={`Increase ${b.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PlanningCard>
  );
}
