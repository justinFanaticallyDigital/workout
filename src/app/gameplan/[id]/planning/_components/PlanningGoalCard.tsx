"use client";

/**
 * Goal card editor — verbatim port of planning-screens.jsx#GoalCard
 * (lines 325–393) with the prototype's read-only fields wired to
 * controlled inputs that mutate the PlanningDraft.
 *
 * Distinct from R5 dashboard `GoalCard` (which is a tap-target card
 * with mini-trajectory). This is the planning-mode editor variant.
 */

import { Reenie, Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import { feasibilityBand } from "@/lib/goal-engine/feasibility";
import type { GoalKind } from "@/lib/goal-engine/types";
import type { DraftGoal } from "./types";

interface ChangeMap {
  startValue?: number | null;
  targetValue?: number | null;
  targetDate?: string | null;
}

export function PlanningGoalCard({
  goal,
  highlighted,
  onChange,
}: {
  goal: DraftGoal;
  highlighted?: boolean;
  onChange: (patch: ChangeMap) => void;
}) {
  // Compute current → target → delta + rate.
  const start = goal.startValue ?? 0;
  const target = goal.targetValue ?? start;
  const deltaNum = target - start;
  const deltaSign = deltaNum >= 0 ? "+" : "−";
  const deltaAbs = Math.abs(deltaNum).toFixed(deltaNum % 1 === 0 ? 0 : 1);
  const unit = goal.targetUnit ?? "";

  // R8: feasibility band derives from goal-engine. Replaces the prior
  // inline `ratePctOfStart` heuristic. The engine returns the same
  // sustainable / aggressive / unrealistic tiers but applies per-goal-
  // kind thresholds (spec §8.3) — body-weight goals scale to %BW; strength
  // goals scale to lift size; etc.
  const todayIso = new Date().toISOString().slice(0, 10);
  const startIso = todayIso;
  const targetIso = goal.targetDate ?? new Date(Date.now() + 84 * 86400000).toISOString().slice(0, 10);
  const band = feasibilityBand({
    kind: goal.type as GoalKind,
    startValue: start,
    targetValue: target,
    startDate: startIso,
    targetDate: targetIso,
  });
  const ratePerWk = band.ratePerWeek;
  const status: "sustainable" | "aggressive" | "danger" =
    band.status === "unrealistic" ? "danger" : band.status;
  const statusColor =
    status === "aggressive"
      ? "rgb(var(--ft-core))"
      : status === "danger"
      ? "rgb(var(--ft-legs))"
      : "rgb(var(--ft-pull))";

  const fmtRate = `${ratePerWk >= 0 ? "+" : "−"}${Math.abs(ratePerWk).toFixed(2)} ${unit}/wk`;

  return (
    <PlanningCard style={{ margin: "10px 12px 0" }} accent={highlighted}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <Marker style={{ fontSize: 11, letterSpacing: ".12em" }}>{goal.title.toLowerCase()}</Marker>
        <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".15em" }}>
          GOAL · ACTIVE
        </Archivo>
      </div>

      <PlanningDashed style={{ margin: "8px 0" }} />

      {/* current → target row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          alignItems: "end",
          gap: 8,
        }}
      >
        <div>
          <Archivo
            size={7}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em" }}
          >
            CURRENT
          </Archivo>
          <input
            type="number"
            value={start || ""}
            onChange={(e) =>
              onChange({ startValue: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="font-data tabular-nums"
            style={{
              display: "block",
              fontSize: 22,
              fontWeight: 700,
              color: "rgb(var(--ft-text-primary))",
              background: "transparent",
              border: "none",
              borderBottom: "1px dashed rgb(var(--ft-border))",
              outline: "none",
              padding: "1px 0",
              width: "100%",
            }}
          />
        </div>
        <div
          className="font-body"
          style={{ fontSize: 18, color: "rgb(var(--ft-text-tertiary))", paddingBottom: 2 }}
        >
          →
        </div>
        <div
          style={{
            border: "1px solid rgb(var(--ft-accent-border))",
            padding: "4px 8px",
            background: "rgb(var(--ft-accent-faint))",
          }}
        >
          <Archivo size={7} color="rgb(var(--ft-accent))" style={{ letterSpacing: ".18em" }}>
            TARGET
          </Archivo>
          <input
            type="number"
            value={target || ""}
            onChange={(e) =>
              onChange({ targetValue: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="font-data tabular-nums"
            style={{
              display: "block",
              fontSize: 22,
              fontWeight: 700,
              color: "rgb(var(--ft-accent))",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "1px 0",
              width: "100%",
            }}
          />
        </div>
        <div
          className="font-body"
          style={{ fontSize: 14, color: "rgb(var(--ft-text-tertiary))", paddingBottom: 4 }}
        >
          Δ
        </div>
        <div>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            DELTA
          </Archivo>
          <Reenie
            style={{
              display: "block",
              fontSize: 19,
              fontWeight: 700,
              color: "rgb(var(--ft-pull))",
            }}
          >
            {deltaSign}
            {deltaAbs} {unit}
          </Reenie>
        </div>
      </div>

      <PlanningDashed style={{ margin: "10px 0 8px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            TARGET DATE
          </Archivo>
          <input
            type="date"
            value={goal.targetDate ?? ""}
            onChange={(e) => onChange({ targetDate: e.target.value || null })}
            className="font-body"
            style={{
              display: "block",
              border: "1px dashed rgb(var(--ft-border))",
              padding: "3px 8px",
              marginTop: 2,
              fontSize: 11,
              background: "transparent",
              color: "rgb(var(--ft-text-primary))",
              outline: "none",
            }}
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            COMPUTED RATE
          </Archivo>
          <Reenie
            style={{ display: "block", fontSize: 13, fontWeight: 700, color: statusColor, marginTop: 2 }}
          >
            {fmtRate}
          </Reenie>
          <Archivo size={8} color={statusColor} style={{ letterSpacing: ".1em", textTransform: "uppercase" }}>
            · {status}
          </Archivo>
        </div>
      </div>
    </PlanningCard>
  );
}
