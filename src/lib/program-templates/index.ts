import type { ProgramTemplate } from "./types";
import { sizeAndStrength } from "./size-and-strength";
import { first90Days } from "./first-90-days";
import { leanOut } from "./lean-out";
import { powerbuilder } from "./powerbuilder";
import { busyParent } from "./busy-parent";
import { athleticFoundations } from "./athletic-foundations";
import { comeback } from "./comeback";
import { longevity } from "./longevity";

/**
 * Master registry of all program templates.
 *
 * Templates are added here in the order they should appear on /programs/new/templates.
 * The seed script reads this list to create/update Program records under the
 * system "template" user account.
 */
export const programTemplates: ProgramTemplate[] = [
  first90Days,            // 1. Beginner on-ramp
  busyParent,             // 2. Practical / time-constrained default
  sizeAndStrength,        // 3. Intermediate workhorse
  leanOut,                // 4. Cut for an event
  powerbuilder,           // 5. Strength-first with bodybuilding accessories
  athleticFoundations,    // 6. Sport / power / conditioning
  comeback,               // 7. Return from injury or break
  longevity,              // 8. 40+ healthspan
];

export type { ProgramTemplate, GameplanLifestylePick } from "./types";
export {
  sizeAndStrength,
  first90Days,
  leanOut,
  powerbuilder,
  busyParent,
  athleticFoundations,
  comeback,
  longevity,
};

/** Look up a template by slug. */
export function getTemplateBySlug(slug: string): ProgramTemplate | undefined {
  return programTemplates.find((t) => t.slug === slug);
}

/* ─── R13 compatibility surface ──────────────────────────────────
 * The R12 `@/lib/gameplan-templates` registry is folded into this
 * module; the helpers below preserve its shape so existing callers
 * (Header badge, /api/programs/generate, picker Step4Preview) keep
 * working without a sweep. New callers should use `getTemplateBySlug`
 * directly.
 */

/** R13: aliased lookup that accepts null/undefined for callers that
 *  pass `Program.gameplanKind` directly. Mirrors R12's API shape. */
export function gameplanTemplate(slug: string | null | undefined): ProgramTemplate | null {
  if (!slug) return null;
  return getTemplateBySlug(slug) ?? null;
}

/** R13: every slug is valid iff a template carries it. */
export function isValidGameplanKind(slug: string): boolean {
  return programTemplates.some((t) => t.slug === slug);
}

/** R13: legacy R12 helper. The new picker design is "pick a gameplan
 *  template directly," so program-engine template ids no longer map
 *  to gameplan kinds. Returns null in R13; deleted entirely once the
 *  R12 picker is replaced by R14's templates flow. */
export function inferGameplanKindFromTemplate(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  programEngineTemplateId: string | null | undefined,
): string | null {
  return null;
}

/** R13: legacy R12 surface. Returns the same array with a different name. */
export const GAMEPLAN_TEMPLATES = programTemplates;
/** R13: type alias for callers that imported `GameplanTemplate`. */
export type GameplanTemplate = ProgramTemplate;
/** R13: type alias for callers that imported `GameplanKind`. */
export type GameplanKind = string;
