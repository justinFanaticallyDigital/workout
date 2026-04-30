"use client";

/**
 * Live projection panel — verbatim port of planning-screens.jsx
 * #ProjectionPanel (lines 880–1001) with 3 sub-tabs:
 *   trajectory · daily target · vol/struct
 *
 * All math runs from the current PlanningDraft (no API calls during
 * edit). Trajectory chart pulls body-weight goal data; daily target
 * pulls nutrition target; volume/structure derives from blocks +
 * block.days.
 */

import { Reenie, Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import { PlanningTrajectoryChart } from "./PlanningTrajectoryChart";
import { VolumeBars } from "./VolumeBars";
import { BlockBars } from "./BlockBars";
import type { PlanningDraft, ProjectionTab } from "./types";

export function ProjectionPanel({
  tab,
  onChangeTab,
  snapshot,
  draft,
}: {
  tab: ProjectionTab;
  onChangeTab: (t: ProjectionTab) => void;
  snapshot: PlanningDraft;
  draft: PlanningDraft;
}) {
  return (
    <PlanningCard style={{ margin: "12px 12px 0", padding: "12px 12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Marker style={{ fontSize: 11, letterSpacing: ".12em" }}>live projection</Marker>
        <Archivo size={8} color="rgb(var(--ft-accent))" style={{ letterSpacing: ".18em" }}>
          ◉ COMPUTING
        </Archivo>
      </div>

      <div style={{ display: "flex", gap: 0, marginTop: 8, border: "1px solid rgb(var(--ft-border))" }}>
        {(["trajectory", "daily", "volume"] as ProjectionTab[]).map((t, i) => {
          const label = t === "trajectory" ? "TRAJECTORY" : t === "daily" ? "DAILY TARGET" : "VOL · STRUCT";
          return (
            <button
              key={t}
              onClick={() => onChangeTab(t)}
              className="font-body"
              style={{
                flex: 1,
                padding: "5px 4px",
                textAlign: "center",
                fontSize: 8,
                letterSpacing: ".14em",
                background: tab === t ? "rgb(var(--ft-accent))" : "transparent",
                color: tab === t ? "rgb(var(--ft-text-on-accent))" : "rgb(var(--ft-text-secondary))",
                fontWeight: tab === t ? 700 : 400,
                borderRight: i < 2 ? "1px solid rgb(var(--ft-border))" : "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-pressed={tab === t}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "trajectory" && <TrajectoryView snapshot={snapshot} draft={draft} />}
      {tab === "daily" && <DailyView snapshot={snapshot} draft={draft} />}
      {tab === "volume" && <VolumeView snapshot={snapshot} draft={draft} />}
    </PlanningCard>
  );
}

function TrajectoryView({ snapshot, draft }: { snapshot: PlanningDraft; draft: PlanningDraft }) {
  // Find body-weight goal in either snapshot or draft.
  const draftGoal = draft.goals.find((g) => g.type === "bodyweight" || g.type === "weight");
  const snapGoal = snapshot.goals.find((g) => g.type === "bodyweight" || g.type === "weight");
  if (!draftGoal || !snapGoal || draftGoal.startValue == null || draftGoal.targetValue == null) {
    return (
      <div style={{ marginTop: 14 }}>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ display: "block", textAlign: "center" }}>
          No body-weight goal — add one to see the trajectory chart.
        </Archivo>
      </div>
    );
  }
  const start = Number(draftGoal.startValue);
  const targetDraft = Number(draftGoal.targetValue);
  const targetOriginal = Number(snapGoal.targetValue ?? targetDraft);
  const weeksDraft = draft.program.durationWeeks ?? 12;
  const weeksOriginal = snapshot.program.durationWeeks ?? weeksDraft;
  // Compute today's week offset from program startDate.
  const todayWeek = (() => {
    if (!draft.program.startDate) return Math.floor(weeksDraft / 2);
    const ms = Date.now() - new Date(draft.program.startDate).getTime();
    return Math.max(0, Math.min(weeksDraft, Math.floor(ms / (7 * 86400000))));
  })();
  // Block boundaries: cumulative sum of draft block durations.
  let acc = 0;
  const boundaries = draft.blocks
    .map((b) => {
      acc += b.durationWeeks ?? 4;
      return { wk: acc, label: `${b.name.toUpperCase().slice(0, 8)}` };
    })
    .slice(0, -1);
  // Actuals: empty in this UI-pass; future PR can hydrate from /api/progress/weight.
  const actuals: Array<[number, number]> = [];

  const ratePerWk = (targetDraft - start) / weeksDraft;
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
          BODY WEIGHT (LB) × WEEK
        </Archivo>
        <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
          FEASIBILITY ▦
        </Archivo>
      </div>
      <PlanningTrajectoryChart
        startWeight={start}
        targetOriginal={targetOriginal}
        targetDraft={targetDraft}
        weeksOriginal={weeksOriginal}
        weeksDraft={weeksDraft}
        actuals={actuals}
        boundaries={boundaries}
        todayWeek={todayWeek}
      />
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Archivo size={9} color="rgb(var(--ft-text-primary))">
          RATE:{" "}
          <span style={{ color: "rgb(var(--ft-pull))", fontWeight: 700 }}>
            {ratePerWk >= 0 ? "+" : "−"}
            {Math.abs(ratePerWk).toFixed(2)} lb/wk
          </span>
        </Archivo>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))">
          HIT TARGET: WK {weeksDraft}
        </Archivo>
      </div>
    </div>
  );
}

function DailyView({ snapshot, draft }: { snapshot: PlanningDraft; draft: PlanningDraft }) {
  const cals = draft.nutritionTarget.calories ?? 0;
  const origCals = snapshot.nutritionTarget.calories ?? cals;
  const delta = cals - origCals;
  const protein = draft.nutritionTarget.protein ?? 0;
  const carbs = draft.nutritionTarget.carbs ?? 0;
  const fat = draft.nutritionTarget.fat ?? 0;
  const origP = snapshot.nutritionTarget.protein ?? protein;
  const origC = snapshot.nutritionTarget.carbs ?? carbs;
  const origF = snapshot.nutritionTarget.fat ?? fat;
  const macros = [
    { label: "PROTEIN", v: protein, d: protein - origP, c: "rgb(var(--ft-pull))" },
    { label: "CARBS", v: carbs, d: carbs - origC, c: "rgb(var(--ft-push))" },
    { label: "FAT", v: fat, d: fat - origF, c: "rgb(var(--ft-core))" },
  ];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <Archivo
          size={7}
          color="rgb(var(--ft-text-tertiary))"
          style={{ letterSpacing: ".22em", display: "block" }}
        >
          KCAL/DAY
        </Archivo>
        <Reenie style={{ display: "block", fontSize: 44, fontWeight: 700, color: "rgb(var(--ft-accent))" }}>
          {cals.toLocaleString()}
        </Reenie>
        {delta !== 0 && (
          <Archivo size={10} color="rgb(var(--ft-core))" style={{ letterSpacing: ".1em", marginTop: 2 }}>
            {delta > 0 ? "+" : "−"}
            {Math.abs(delta)} vs CURRENT
          </Archivo>
        )}
      </div>
      <PlanningDashed style={{ margin: "4px 0 8px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {macros.map((m) => (
          <div key={m.label} style={{ border: `1px dashed ${m.c}`, padding: "6px 4px", textAlign: "center" }}>
            <Archivo size={7} color={m.c} style={{ letterSpacing: ".16em", fontWeight: 700 }}>
              {m.label}
            </Archivo>
            <Reenie style={{ display: "block", fontSize: 19, fontWeight: 700, color: "rgb(var(--ft-text-primary))" }}>
              {m.v}g
            </Reenie>
            {m.d !== 0 && (
              <Archivo size={8} color="rgb(var(--ft-text-secondary))">
                {m.d > 0 ? "+" : "−"}
                {Math.abs(m.d)}g
              </Archivo>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeView({ snapshot, draft }: { snapshot: PlanningDraft; draft: PlanningDraft }) {
  // Total weeks + sessions = sum of block durations × days/week.
  const draftWeeks = draft.blocks.reduce((s, b) => s + (b.durationWeeks ?? 4), 0);
  const snapWeeks = snapshot.blocks.reduce((s, b) => s + (b.durationWeeks ?? 4), 0);
  const draftSessions = draft.blocks.reduce(
    (s, b) => s + (b.durationWeeks ?? 4) * b.days.filter((d) => d.dayType !== "rest").length,
    0,
  );
  const snapSessions = snapshot.blocks.reduce(
    (s, b) => s + (b.durationWeeks ?? 4) * b.days.filter((d) => d.dayType !== "rest").length,
    0,
  );
  const blockBars = draft.blocks.map((b) => {
    const orig = snapshot.blocks.find((x) => x.id === b.id);
    const dDur = b.durationWeeks ?? 4;
    const oDur = orig?.durationWeeks ?? dDur;
    const delta = dDur - oDur === 0 ? "0" : `${dDur - oDur > 0 ? "+" : "−"}${Math.abs(dDur - oDur)}`;
    return { shortName: b.name.split(" ")[0].slice(0, 4).toUpperCase(), weeks: dDur, phase: b.phase, delta };
  });

  // Per-movement weekly sets — coarse derivation: count exercises by
  // movementPattern (proxy via exerciseName since we don't have the
  // pattern on the draft shape) × 3 sets/exercise, summed over the
  // first block's days.
  const firstBlock = draft.blocks[0];
  const setsByMove: Record<string, number> = { PUSH: 0, PULL: 0, LEGS: 0, CORE: 0 };
  if (firstBlock) {
    for (const d of firstBlock.days) {
      for (const e of d.exercises) {
        const sets = e.targetSets ?? 3;
        const name = e.exerciseName.toLowerCase();
        if (name.includes("bench") || name.includes("press") || name.includes("dip")) setsByMove.PUSH += sets;
        else if (name.includes("row") || name.includes("pull") || name.includes("curl")) setsByMove.PULL += sets;
        else if (name.includes("squat") || name.includes("dead") || name.includes("lunge") || name.includes("leg")) setsByMove.LEGS += sets;
        else setsByMove.CORE += sets;
      }
    }
  }
  const movementData = (["PUSH", "PULL", "LEGS", "CORE"] as const).map((m) => ({
    movement: m,
    sets: setsByMove[m],
    delta: "0",
  }));

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div style={{ border: "1px dashed rgb(var(--ft-border))", padding: "6px 8px" }}>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            TOTAL WEEKS
          </Archivo>
          <Reenie style={{ display: "block", fontSize: 26, fontWeight: 700, color: "rgb(var(--ft-text-primary))" }}>
            {draftWeeks}{" "}
            {draftWeeks !== snapWeeks && (
              <span style={{ fontSize: 12, color: "rgb(var(--ft-accent))" }}>
                {draftWeeks - snapWeeks > 0 ? "+" : ""}
                {draftWeeks - snapWeeks}
              </span>
            )}
          </Reenie>
        </div>
        <div style={{ border: "1px dashed rgb(var(--ft-border))", padding: "6px 8px" }}>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            SESSIONS
          </Archivo>
          <Reenie style={{ display: "block", fontSize: 26, fontWeight: 700, color: "rgb(var(--ft-text-primary))" }}>
            {draftSessions}{" "}
            {draftSessions !== snapSessions && (
              <span style={{ fontSize: 12, color: "rgb(var(--ft-accent))" }}>
                {draftSessions - snapSessions > 0 ? "+" : ""}
                {draftSessions - snapSessions}
              </span>
            )}
          </Reenie>
        </div>
      </div>
      <Archivo
        size={7}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".18em", display: "block", marginBottom: 4 }}
      >
        BLOCK WEEKS
      </Archivo>
      <BlockBars blocks={blockBars} />
      <PlanningDashed style={{ margin: "10px 0 8px" }} />
      <Archivo
        size={7}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".18em", display: "block", marginBottom: 4 }}
      >
        WEEKLY SETS · BY MOVEMENT
      </Archivo>
      <VolumeBars data={movementData} />
    </div>
  );
}
