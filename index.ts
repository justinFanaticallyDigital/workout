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

export type { ProgramTemplate } from "./types";
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
