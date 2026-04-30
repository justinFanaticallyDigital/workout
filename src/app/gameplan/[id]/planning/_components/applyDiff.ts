/**
 * R7 — sequential Apply orchestrator. Walks the diff and writes
 * through the existing API endpoints (per user confirmation:
 * sequential, first-failure aborts).
 *
 * Aggregation rule (per user confirmation, hot-question 3): same-
 * entity diff entries coalesce into a single PATCH with many keys.
 * E.g. a Block whose name + duration + refeedWeeks all change → ONE
 * `PATCH /api/blocks/[id]` with all three fields.
 *
 * Endpoint ordering (matches the prompt's Apply walkthrough):
 *   1. PATCH /api/programs/[id]               — program-level
 *   2. PATCH /api/blocks/[id]                 — per-block
 *   3. PATCH /api/blocks/day/[id]             — per-day
 *   4. PATCH /api/blocks/day/[id]/exercises/[exerciseId]
 *   5. POST  /api/schedule-overrides          — new overrides
 *   6. POST  /api/metric-targets              — N/A in R7 (no UI surface yet)
 *   7. POST  /api/nutrition/targets           — calorie/macro
 *   8. POST  /api/lifestyle-targets           — sleep/stress/protein
 *   9. PATCH /api/goals/[id]                  — per-goal (R7 NEW endpoint)
 *
 * Audit log per spec §9.5 (`GameplanChange` rows with `commitId`)
 * deferred — schema model doesn't exist; flagged for a future phase.
 */

import type { DiffEntry, PlanningDraft } from "./types";

export type ApplyStep = {
  label: string;
  fn: () => Promise<void>;
};

/** Build the ordered list of apply steps from the diff. */
export function buildApplySteps(
  programId: string,
  diff: DiffEntry[],
  draft: PlanningDraft,
): ApplyStep[] {
  const steps: ApplyStep[] = [];

  // 1. Program-level — coalesce all program diffs into a single PATCH.
  const programDiffs = diff.filter((d) => d.kind === "program");
  if (programDiffs.length > 0) {
    const body: Record<string, unknown> = {};
    for (const d of programDiffs) {
      if (d.kind === "program") body[d.field] = d.newValue;
    }
    steps.push({
      label: `Program ${programDiffs.length === 1 ? programDiffs[0].kind === "program" ? programDiffs[0].field : "" : `${programDiffs.length} fields`}`.trim(),
      fn: async () => {
        const res = await fetch(`/api/programs/${programId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Program update failed (${res.status})`);
      },
    });
  }

  // 2. Per-block — group by blockId, one PATCH each.
  const blockGroups = new Map<string, { name: string; body: Record<string, unknown> }>();
  for (const d of diff) {
    if (d.kind !== "block") continue;
    const g = blockGroups.get(d.blockId) ?? { name: d.blockName, body: {} };
    g.body[d.field] = d.newValue;
    blockGroups.set(d.blockId, g);
  }
  for (const [blockId, group] of Array.from(blockGroups.entries())) {
    steps.push({
      label: `Block · ${group.name}`,
      fn: async () => {
        const res = await fetch(`/api/blocks/${blockId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(group.body),
        });
        if (!res.ok) throw new Error(`Block update failed (${res.status})`);
      },
    });
  }

  // 3. Per-day — group by dayId.
  const dayGroups = new Map<string, { name: string; body: Record<string, unknown> }>();
  for (const d of diff) {
    if (d.kind !== "day") continue;
    const g = dayGroups.get(d.dayId) ?? { name: d.dayName, body: {} };
    g.body[d.field] = d.newValue;
    dayGroups.set(d.dayId, g);
  }
  for (const [dayId, group] of Array.from(dayGroups.entries())) {
    steps.push({
      label: `Day · ${group.name}`,
      fn: async () => {
        const res = await fetch(`/api/blocks/day/${dayId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(group.body),
        });
        if (!res.ok) throw new Error(`Day update failed (${res.status})`);
      },
    });
  }

  // 4. Per-exercise — group by (dayId, exerciseId).
  const exerciseGroups = new Map<
    string,
    { dayId: string; exerciseId: string; name: string; body: Record<string, unknown> }
  >();
  for (const d of diff) {
    if (d.kind !== "exercise") continue;
    const k = `${d.dayId}:${d.exerciseId}`;
    const g =
      exerciseGroups.get(k) ?? {
        dayId: d.dayId,
        exerciseId: d.exerciseId,
        name: d.exerciseName,
        body: {} as Record<string, unknown>,
      };
    g.body[d.field] = d.newValue;
    exerciseGroups.set(k, g);
  }
  for (const [, group] of Array.from(exerciseGroups.entries())) {
    steps.push({
      label: `Exercise · ${group.name}`,
      fn: async () => {
        const res = await fetch(
          `/api/blocks/day/${group.dayId}/exercises/${group.exerciseId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(group.body),
          },
        );
        if (!res.ok) throw new Error(`Exercise update failed (${res.status})`);
      },
    });
  }

  // 5. New schedule overrides — one POST per row (each is its own row by design).
  for (const o of draft.newOverrides) {
    steps.push({
      label: `Override · ${o.action} W${o.weekNumber}`,
      fn: async () => {
        const res = await fetch("/api/schedule-overrides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programId: o.programId,
            blockId: o.blockId,
            scope: o.scope,
            weekNumber: o.weekNumber,
            dayOfWeek: o.dayOfWeek,
            action: o.action,
            payload: o.payload,
          }),
        });
        if (!res.ok) throw new Error(`Schedule override create failed (${res.status})`);
      },
    });
  }

  // 7. Nutrition targets — single POST upserting calorie + macros.
  const nutritionDiffs = diff.filter((d) => d.kind === "nutrition");
  if (nutritionDiffs.length > 0) {
    steps.push({
      label: "Nutrition targets",
      fn: async () => {
        const res = await fetch("/api/nutrition/targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calories: draft.nutritionTarget.calories,
            protein: draft.nutritionTarget.protein,
            carbs: draft.nutritionTarget.carbs,
            fat: draft.nutritionTarget.fat,
          }),
        });
        if (!res.ok) throw new Error(`Nutrition target update failed (${res.status})`);
      },
    });
  }

  // 8. Lifestyle targets — one POST per changed key.
  const lifestyleKeys = new Set<string>();
  for (const d of diff) if (d.kind === "lifestyle") lifestyleKeys.add(d.key);
  for (const key of Array.from(lifestyleKeys)) {
    const t = draft.lifestyleTargets.find((x) => x.key === key);
    if (!t) continue;
    steps.push({
      label: `Lifestyle · ${key}`,
      fn: async () => {
        const res = await fetch("/api/lifestyle-targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programId: t.programId,
            key: t.key,
            value: t.value,
            unit: t.unit,
            comparator: t.comparator,
          }),
        });
        if (!res.ok) throw new Error(`Lifestyle target update failed (${res.status})`);
      },
    });
  }

  // 9. Goals — group by goalId, one PATCH each.
  const goalGroups = new Map<string, { title: string; body: Record<string, unknown> }>();
  for (const d of diff) {
    if (d.kind !== "goal") continue;
    const g = goalGroups.get(d.goalId) ?? { title: d.goalTitle, body: {} };
    g.body[d.field] = d.newValue;
    goalGroups.set(d.goalId, g);
  }
  for (const [goalId, group] of Array.from(goalGroups.entries())) {
    steps.push({
      label: `Goal · ${group.title}`,
      fn: async () => {
        const res = await fetch(`/api/goals/${goalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(group.body),
        });
        if (!res.ok) throw new Error(`Goal update failed (${res.status})`);
      },
    });
  }

  return steps;
}

/**
 * Build inverse steps for the post-Apply UndoToast. Each inverse
 * step PATCHes back to the snapshot value. Override-new and lifestyle
 * upserts cannot be cleanly reversed (there's no DELETE endpoint for
 * ScheduleOverride and lifestyle is upsert-only) — those return a
 * marker label so the toast can communicate the partial-undo limit.
 */
export function buildInverseSteps(
  programId: string,
  diff: DiffEntry[],
  snapshot: PlanningDraft,
): { steps: ApplyStep[]; partialReason: string | null } {
  const steps: ApplyStep[] = [];
  let partialReason: string | null = null;

  // Same coalescing rules as buildApplySteps but using snapshot values.
  const programDiffs = diff.filter((d) => d.kind === "program");
  if (programDiffs.length > 0) {
    const body: Record<string, unknown> = {};
    for (const d of programDiffs) {
      if (d.kind === "program") body[d.field] = d.oldValue;
    }
    steps.push({
      label: "Revert program",
      fn: async () => {
        await fetch(`/api/programs/${programId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
    });
  }

  const blockGroups = new Map<string, Record<string, unknown>>();
  for (const d of diff) {
    if (d.kind !== "block") continue;
    const g = blockGroups.get(d.blockId) ?? {};
    g[d.field] = d.oldValue;
    blockGroups.set(d.blockId, g);
  }
  for (const [blockId, body] of Array.from(blockGroups.entries())) {
    steps.push({
      label: `Revert block ${blockId.slice(0, 6)}`,
      fn: async () => {
        await fetch(`/api/blocks/${blockId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
    });
  }

  const dayGroups = new Map<string, Record<string, unknown>>();
  for (const d of diff) {
    if (d.kind !== "day") continue;
    const g = dayGroups.get(d.dayId) ?? {};
    g[d.field] = d.oldValue;
    dayGroups.set(d.dayId, g);
  }
  for (const [dayId, body] of Array.from(dayGroups.entries())) {
    steps.push({
      label: `Revert day ${dayId.slice(0, 6)}`,
      fn: async () => {
        await fetch(`/api/blocks/day/${dayId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
    });
  }

  const exGroups = new Map<string, { dayId: string; exerciseId: string; body: Record<string, unknown> }>();
  for (const d of diff) {
    if (d.kind !== "exercise") continue;
    const k = `${d.dayId}:${d.exerciseId}`;
    const g =
      exGroups.get(k) ?? {
        dayId: d.dayId,
        exerciseId: d.exerciseId,
        body: {} as Record<string, unknown>,
      };
    g.body[d.field] = d.oldValue;
    exGroups.set(k, g);
  }
  for (const [, g] of Array.from(exGroups.entries())) {
    steps.push({
      label: `Revert exercise`,
      fn: async () => {
        await fetch(`/api/blocks/day/${g.dayId}/exercises/${g.exerciseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(g.body),
        });
      },
    });
  }

  if (diff.some((d) => d.kind === "nutrition")) {
    steps.push({
      label: "Revert nutrition",
      fn: async () => {
        await fetch("/api/nutrition/targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calories: snapshot.nutritionTarget.calories,
            protein: snapshot.nutritionTarget.protein,
            carbs: snapshot.nutritionTarget.carbs,
            fat: snapshot.nutritionTarget.fat,
          }),
        });
      },
    });
  }

  const goalGroups = new Map<string, Record<string, unknown>>();
  for (const d of diff) {
    if (d.kind !== "goal") continue;
    const g = goalGroups.get(d.goalId) ?? {};
    g[d.field] = d.oldValue;
    goalGroups.set(d.goalId, g);
  }
  for (const [goalId, body] of Array.from(goalGroups.entries())) {
    steps.push({
      label: `Revert goal`,
      fn: async () => {
        await fetch(`/api/goals/${goalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
    });
  }

  // Lifestyle upserts: best-effort revert by upserting the old value.
  // For new keys (oldValue === null), we can't "delete" — flag partial.
  const lifestyleKeysWithOldNull = new Set<string>();
  const lifestyleKeysToRevert = new Set<string>();
  for (const d of diff) {
    if (d.kind !== "lifestyle") continue;
    if (d.oldValue == null) lifestyleKeysWithOldNull.add(d.key);
    else lifestyleKeysToRevert.add(d.key);
  }
  for (const key of Array.from(lifestyleKeysToRevert)) {
    const old = snapshot.lifestyleTargets.find((t) => t.key === key);
    if (!old) continue;
    steps.push({
      label: `Revert lifestyle · ${key}`,
      fn: async () => {
        await fetch("/api/lifestyle-targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programId: old.programId,
            key: old.key,
            value: old.value,
            unit: old.unit,
            comparator: old.comparator,
          }),
        });
      },
    });
  }

  // Override-new + lifestyle-with-old-null can't be cleanly reversed.
  if (
    diff.some((d) => d.kind === "override-new") ||
    lifestyleKeysWithOldNull.size > 0
  ) {
    partialReason =
      "New schedule overrides and newly-added lifestyle targets can't be auto-reverted; remove them from the dashboard manually.";
  }

  return { steps, partialReason };
}
