"use client";

/**
 * Date range editor — verbatim port of planning-screens.jsx
 * #DateRangeCard (lines 1130–1177). Mutates `program.startDate` +
 * `program.durationWeeks` in the PlanningDraft.
 */

import { Reenie, Archivo } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";

export function DateRangeCard({
  startDate,
  durationWeeks,
  originalDurationWeeks,
  onChange,
}: {
  startDate: string | null;
  durationWeeks: number | null;
  originalDurationWeeks: number | null;
  onChange: (patch: { startDate?: string | null; durationWeeks?: number | null }) => void;
}) {
  const dur = durationWeeks ?? 12;
  const endDate =
    startDate && durationWeeks
      ? new Date(new Date(startDate).getTime() + durationWeeks * 7 * 86400000)
          .toISOString()
          .slice(0, 10)
      : null;
  const wasDifferent = originalDurationWeeks != null && originalDurationWeeks !== dur;

  return (
    <PlanningCard style={{ margin: "10px 12px 0" }} label="DATES · DURATION">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            START
          </Archivo>
          <input
            type="date"
            value={startDate ?? ""}
            onChange={(e) => onChange({ startDate: e.target.value || null })}
            className="font-body"
            style={{
              display: "block",
              border: "1px dashed rgb(var(--ft-border))",
              padding: "5px 8px",
              marginTop: 3,
              fontSize: 11,
              background: "transparent",
              color: "rgb(var(--ft-text-primary))",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
        <div
          className="font-body"
          style={{ fontSize: 14, color: "rgb(var(--ft-text-tertiary))" }}
        >
          →
        </div>
        <div>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            END
          </Archivo>
          <div
            className="font-body"
            style={{
              border: "1px solid rgb(var(--ft-accent-border))",
              background: "rgb(var(--ft-accent-faint))",
              padding: "5px 8px",
              marginTop: 3,
              fontSize: 11,
              color: "rgb(var(--ft-accent))",
              fontWeight: 700,
            }}
          >
            {endDate ?? "—"}
          </div>
        </div>
      </div>
      <PlanningDashed style={{ margin: "10px 0" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            DURATION
          </Archivo>
          <Reenie
            style={{ display: "block", fontSize: 22, fontWeight: 700, color: "rgb(var(--ft-text-primary))" }}
          >
            {dur} wk{" "}
            {wasDifferent && (
              <span style={{ fontSize: 11, color: "rgb(var(--ft-accent))", fontWeight: 400 }}>
                was {originalDurationWeeks}
              </span>
            )}
          </Reenie>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => onChange({ durationWeeks: Math.max(1, dur - 1) })}
            className="font-body"
            style={{
              width: 28,
              height: 28,
              border: "1px solid rgb(var(--ft-border))",
              background: "transparent",
              color: "rgb(var(--ft-text-primary))",
              fontSize: 14,
              cursor: "pointer",
            }}
            aria-label="Decrease duration"
          >
            −
          </button>
          <button
            onClick={() => onChange({ durationWeeks: dur + 1 })}
            className="font-body"
            style={{
              width: 28,
              height: 28,
              border: "1px solid rgb(var(--ft-accent))",
              background: "rgb(var(--ft-accent-faint))",
              color: "rgb(var(--ft-accent))",
              fontSize: 14,
              cursor: "pointer",
            }}
            aria-label="Increase duration"
          >
            +
          </button>
        </div>
      </div>
    </PlanningCard>
  );
}
