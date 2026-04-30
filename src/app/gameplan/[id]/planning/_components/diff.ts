/**
 * R7 — diff computation between original snapshot and current draft.
 *
 * Walks every field touched by the Planning Mode editors and emits a
 * flat array of `DiffEntry` rows. Powers `DiffSummaryStrip`,
 * `ApplyModal` line items, and the sequential `applyDiff` write
 * orchestration.
 *
 * Per the user's confirmed hot-question 3 ("aggregate per scope"):
 * each entity emits one DiffEntry per changed field, but the Apply
 * orchestrator coalesces same-entity entries into a single
 * PATCH-with-many-keys call.
 */

import type { DiffEntry, PlanningDraft } from "./types";

export function computeDiff(snapshot: PlanningDraft, draft: PlanningDraft): DiffEntry[] {
  const out: DiffEntry[] = [];

  // Program-level diffs.
  const sp = snapshot.program;
  const dp = draft.program;
  if (sp.name !== dp.name) out.push({ kind: "program", field: "name", oldValue: sp.name, newValue: dp.name });
  if (sp.durationWeeks !== dp.durationWeeks)
    out.push({
      kind: "program",
      field: "durationWeeks",
      oldValue: sp.durationWeeks,
      newValue: dp.durationWeeks,
    });
  if (sp.startDate !== dp.startDate)
    out.push({ kind: "program", field: "startDate", oldValue: sp.startDate, newValue: dp.startDate });

  // Block-level diffs.
  const sBlocks = new Map(snapshot.blocks.map((b) => [b.id, b]));
  for (const db of draft.blocks) {
    const sb = sBlocks.get(db.id);
    if (!sb) continue;
    if (sb.name !== db.name)
      out.push({
        kind: "block",
        blockId: db.id,
        blockName: db.name,
        field: "name",
        oldValue: sb.name,
        newValue: db.name,
      });
    if (sb.durationWeeks !== db.durationWeeks)
      out.push({
        kind: "block",
        blockId: db.id,
        blockName: db.name,
        field: "durationWeeks",
        oldValue: sb.durationWeeks,
        newValue: db.durationWeeks,
      });
    if (sb.phase !== db.phase)
      out.push({
        kind: "block",
        blockId: db.id,
        blockName: db.name,
        field: "phase",
        oldValue: sb.phase,
        newValue: db.phase,
      });
    if (!arraysEqual(sb.refeedWeeks, db.refeedWeeks))
      out.push({
        kind: "block",
        blockId: db.id,
        blockName: db.name,
        field: "refeedWeeks",
        oldValue: sb.refeedWeeks,
        newValue: db.refeedWeeks,
      });

    // Day diffs within the block.
    const sDays = new Map(sb.days.map((d) => [d.id, d]));
    for (const dd of db.days) {
      const sd = sDays.get(dd.id);
      if (!sd) continue;
      if (sd.name !== dd.name)
        out.push({ kind: "day", dayId: dd.id, dayName: dd.name, field: "name", oldValue: sd.name, newValue: dd.name });
      if (sd.dayType !== dd.dayType)
        out.push({
          kind: "day",
          dayId: dd.id,
          dayName: dd.name,
          field: "dayType",
          oldValue: sd.dayType,
          newValue: dd.dayType,
        });

      // Exercise diffs within the day.
      const sEx = new Map(sd.exercises.map((e) => [e.id, e]));
      for (const de of dd.exercises) {
        const se = sEx.get(de.id);
        if (!se) continue;
        if (se.targetSets !== de.targetSets)
          out.push({
            kind: "exercise",
            dayId: dd.id,
            exerciseId: de.id,
            exerciseName: de.exerciseName,
            field: "targetSets",
            oldValue: se.targetSets,
            newValue: de.targetSets,
          });
        if (se.targetRepRange !== de.targetRepRange)
          out.push({
            kind: "exercise",
            dayId: dd.id,
            exerciseId: de.id,
            exerciseName: de.exerciseName,
            field: "targetRepRange",
            oldValue: se.targetRepRange,
            newValue: de.targetRepRange,
          });
        if (se.targetRpe !== de.targetRpe)
          out.push({
            kind: "exercise",
            dayId: dd.id,
            exerciseId: de.id,
            exerciseName: de.exerciseName,
            field: "targetRpe",
            oldValue: se.targetRpe,
            newValue: de.targetRpe,
          });
        if (se.progressionType !== de.progressionType)
          out.push({
            kind: "exercise",
            dayId: dd.id,
            exerciseId: de.id,
            exerciseName: de.exerciseName,
            field: "progressionType",
            oldValue: se.progressionType,
            newValue: de.progressionType,
          });
      }
    }
  }

  // Goal-level diffs.
  const sGoals = new Map(snapshot.goals.map((g) => [g.id, g]));
  for (const dg of draft.goals) {
    const sg = sGoals.get(dg.id);
    if (!sg) continue;
    const fields: (keyof typeof sg)[] = ["title", "metric", "startValue", "targetValue", "targetUnit", "targetDate"];
    for (const f of fields) {
      if (sg[f] !== dg[f]) {
        out.push({
          kind: "goal",
          goalId: dg.id,
          goalTitle: dg.title,
          field: String(f),
          oldValue: sg[f],
          newValue: dg[f],
        });
      }
    }
  }

  // Nutrition target diffs.
  const sn = snapshot.nutritionTarget;
  const dn = draft.nutritionTarget;
  for (const f of ["calories", "protein", "carbs", "fat"] as const) {
    if (sn[f] !== dn[f]) {
      out.push({ kind: "nutrition", field: f, oldValue: sn[f], newValue: dn[f] });
    }
  }

  // Lifestyle target diffs (by key).
  const sLs = new Map(snapshot.lifestyleTargets.map((t) => [t.key, t]));
  for (const dt of draft.lifestyleTargets) {
    const st = sLs.get(dt.key);
    if (!st) {
      out.push({ kind: "lifestyle", key: dt.key, field: "value", oldValue: null, newValue: dt.value });
      continue;
    }
    for (const f of ["value", "unit", "comparator"] as const) {
      if (st[f] !== dt[f]) {
        out.push({ kind: "lifestyle", key: dt.key, field: f, oldValue: st[f], newValue: dt[f] });
      }
    }
  }

  // New schedule overrides queued during this session.
  for (const o of draft.newOverrides) {
    out.push({
      kind: "override-new",
      localId: o.localId,
      summary: `${o.action} · WK${o.weekNumber}${o.dayOfWeek != null ? ` · DOW${o.dayOfWeek}` : ""}`,
    });
  }

  return out;
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
