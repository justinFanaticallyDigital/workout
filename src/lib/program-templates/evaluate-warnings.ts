import type { ProgramTemplate, EngineWarning } from "./types";

// Loose answer shape — matches what the customize form produces.
// Values can be string (select, text, date), number, boolean, or string[] (multi_select).
export type CustomizationAnswers = Record<
  string,
  string | number | boolean | string[] | null | undefined
>;

const SEVERITY_ORDER: Record<EngineWarning["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2,
};

/**
 * Walks a template's engineWarnings and returns the subset that fire
 * given the user's customization answers, sorted error → warning → info.
 *
 * Trigger strings on the template are human-readable (not programmatic),
 * so we dispatch by `template.slug` and match each warning's `trigger`
 * field against a known check. Anything unrecognized is silently skipped
 * — better to under-warn than to throw on data we don't understand.
 *
 * Adding a new template? Add a `case "<slug>":` block. Adding a new
 * warning to an existing template? Add a `if (warning.trigger === "...")`
 * branch inside that template's case.
 */
export function evaluateWarnings(
  template: ProgramTemplate,
  answers: CustomizationAnswers,
): EngineWarning[] {
  const fired: EngineWarning[] = [];

  for (const warning of template.engineWarnings ?? []) {
    if (warningFires(template.slug, warning, answers)) {
      fired.push(warning);
    }
  }

  return fired.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

function warningFires(
  slug: string,
  warning: EngineWarning,
  a: CustomizationAnswers,
): boolean {
  switch (slug) {
    case "powerbuilder":
      return powerbuilderFires(warning, a);
    case "lean-out":
      return leanOutFires(warning, a);
    case "size-and-strength":
      return sizeAndStrengthFires(warning, a);
    case "first-90-days":
      return first90DaysFires(warning, a);
    case "busy-parent":
      return busyParentFires(warning, a);
    case "athletic-foundations":
      return athleticFoundationsFires(warning, a);
    case "comeback":
      return comebackFires(warning, a);
    case "longevity":
      return longevityFires(warning, a);
    default:
      return false;
  }
}

// -------------------------------------------------------------
// Powerbuilder
// -------------------------------------------------------------
// Inputs: days_per_week, current_squat_1rm, current_bench_1rm,
// current_deadlift_1rm, current_ohp_1rm (opt), bodyweight,
// goal_direction (gain|maintain), weak_lift, sticking_points,
// competition_target (date)
function powerbuilderFires(
  w: EngineWarning,
  a: CustomizationAnswers,
): boolean {
  // "User has a meet date in the next 16 weeks"
  if (w.trigger.includes("meet date")) {
    const meet = a.competition_target;
    if (typeof meet !== "string" || !meet) return false;
    return isWithinDays(meet, 16 * 7);
  }

  // "User reports lower back / knee / shoulder injury"
  // Powerbuilder has no `injuries` input — we accept the user-typed signal
  // via a generic `injuries` answer if the form ever supplies one. Since
  // the template doesn't ask, this never fires by itself; it stays here so
  // the warning surfaces if a future revision adds the input.
  if (w.trigger.toLowerCase().includes("injury")) {
    const inj = a.injuries;
    return Array.isArray(inj) && inj.length > 0;
  }

  // "User doesn't know their 1RMs"
  // We treat 0 / blank / NaN on any of the three required 1RMs as "doesn't know"
  if (w.trigger.includes("doesn't know their 1RMs")) {
    return (
      !isPositiveNumber(a.current_squat_1rm) ||
      !isPositiveNumber(a.current_bench_1rm) ||
      !isPositiveNumber(a.current_deadlift_1rm)
    );
  }

  // "User reports <2 years consistent training"
  // No direct input — could only fire if a `years_training` answer is supplied.
  // Kept for future-proofing.
  if (w.trigger.includes("<2 years")) {
    const yrs = a.years_training;
    return typeof yrs === "number" && yrs < 2;
  }

  // "Goal direction is 'lose'"
  if (w.trigger.includes("Goal direction is 'lose'")) {
    return a.goal_direction === "lose";
  }

  return false;
}

// -------------------------------------------------------------
// Lean Out
// -------------------------------------------------------------
// Inputs: bodyweight_start, bodyweight_goal, goal_date, bodyfat_estimate,
// days_per_week, cardio_preference, recent_cuts, injuries[]
function leanOutFires(w: EngineWarning, a: CustomizationAnswers): boolean {
  // "Body fat estimate is 'low'"
  if (w.trigger.includes("Body fat estimate is 'low'")) {
    return a.bodyfat_estimate === "low";
  }

  // "User reports 3+ recent cuts in past 12 months"
  if (w.trigger.includes("3+ recent cuts")) {
    return a.recent_cuts === "3+";
  }

  // "User has no muscle baseline"
  // No direct input. Could be inferred from a future `years_training` answer,
  // or skipped — we leave it disabled by default.
  if (w.trigger.includes("no muscle baseline")) {
    const yrs = a.years_training;
    return typeof yrs === "number" && yrs < 1;
  }

  // "Goal is more than 25 lb in 12 weeks"
  if (w.trigger.includes("more than 25 lb")) {
    const start = toNumber(a.bodyweight_start);
    const goal = toNumber(a.bodyweight_goal);
    if (start === null || goal === null) return false;
    return start - goal > 25;
  }

  return false;
}

// -------------------------------------------------------------
// Stubs for the other 6 — populate when those template files land.
// All return false today, which is the correct conservative default
// (no spurious warnings) until each template's inputs are confirmed.
// -------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-unused-vars */
function sizeAndStrengthFires(
  _w: EngineWarning,
  _a: CustomizationAnswers,
): boolean {
  return false;
}
function first90DaysFires(
  _w: EngineWarning,
  _a: CustomizationAnswers,
): boolean {
  return false;
}
function busyParentFires(
  _w: EngineWarning,
  _a: CustomizationAnswers,
): boolean {
  return false;
}
function athleticFoundationsFires(
  _w: EngineWarning,
  _a: CustomizationAnswers,
): boolean {
  return false;
}
function comebackFires(_w: EngineWarning, _a: CustomizationAnswers): boolean {
  return false;
}
function longevityFires(_w: EngineWarning, _a: CustomizationAnswers): boolean {
  return false;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isPositiveNumber(v: unknown): boolean {
  const n = toNumber(v);
  return n !== null && n > 0;
}

function isWithinDays(isoDate: string, days: number): boolean {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return false;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return false; // date already passed
  return diffMs <= days * 24 * 60 * 60 * 1000;
}
