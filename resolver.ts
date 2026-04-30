import type { PrismaClient } from "@prisma/client";
import type { ProgramTemplate, ExerciseSlot } from "./types";

/**
 * Resolves exercise names from program templates to Exercise.id values in the DB.
 *
 * Templates reference exercises by their `name` field exactly as it appears in the
 * seeded library (e.g., "Bench Press - Flat Barbell"). The seed script calls this
 * resolver to validate every name before any DB writes happen — if any name fails
 * to resolve, we throw with a precise error message ("template X, day Y, slot Z
 * has unknown primary 'Foo'") so the typo can be fixed before re-running.
 *
 * The resolver caches DB lookups so the seed script only hits the DB once per
 * unique exercise name.
 */

export interface ResolvedSlot {
  category: ExerciseSlot["category"];
  role: ExerciseSlot["role"];
  primaryId: string;
  primaryName: string;
  alt1Id?: string;
  alt1Name?: string;
  alt2Id?: string;
  alt2Name?: string;
  notes?: string;
}

export class ExerciseResolver {
  private cache = new Map<string, { id: string; name: string }>();
  private notFound = new Set<string>();

  constructor(private prisma: PrismaClient) {}

  /**
   * Look up a single exercise by name. Returns null if not found.
   * Custom user-created exercises with the same name as a global one are NOT used —
   * we only match `userId IS NULL` (global library) exercises.
   */
  async resolveOne(name: string): Promise<{ id: string; name: string } | null> {
    if (this.cache.has(name)) return this.cache.get(name)!;
    if (this.notFound.has(name)) return null;

    const ex = await this.prisma.exercise.findFirst({
      where: { name, userId: null },
      select: { id: true, name: true },
    });

    if (ex) {
      this.cache.set(name, ex);
      return ex;
    }

    this.notFound.add(name);
    return null;
  }

  /**
   * Validate that every exercise name referenced by a template resolves to a
   * real DB row. Returns a list of missing names (empty = all good).
   */
  async validateTemplate(template: ProgramTemplate): Promise<string[]> {
    const missing: string[] = [];
    const seen = new Set<string>();

    for (const day of template.days) {
      for (let slotIdx = 0; slotIdx < day.slots.length; slotIdx++) {
        const slot = day.slots[slotIdx];
        const params = day.perBlockParams.map((bp) => bp[slotIdx]);
        // Skip exercises that are dropped (sets=0) in EVERY block — no point checking
        const allDropped = params.every((p) => p && p.sets === 0);
        if (allDropped) continue;

        for (const name of [slot.primary, slot.alt1, slot.alt2]) {
          if (!name) continue;
          if (seen.has(name)) continue;
          seen.add(name);
          const found = await this.resolveOne(name);
          if (!found) {
            missing.push(`[${template.slug} / ${day.name} / slot ${slotIdx + 1}] missing: "${name}"`);
          }
        }
      }
    }

    return missing;
  }

  /**
   * Resolve a single slot's primary + alts into the form needed for
   * BlockDayExercise creation.
   */
  async resolveSlot(slot: ExerciseSlot): Promise<ResolvedSlot> {
    const primary = await this.resolveOne(slot.primary);
    if (!primary) {
      throw new Error(`Exercise not found in DB: "${slot.primary}"`);
    }

    const alt1 = slot.alt1 ? await this.resolveOne(slot.alt1) : null;
    const alt2 = slot.alt2 ? await this.resolveOne(slot.alt2) : null;

    return {
      category: slot.category,
      role: slot.role,
      primaryId: primary.id,
      primaryName: primary.name,
      alt1Id: alt1?.id,
      alt1Name: alt1?.name,
      alt2Id: alt2?.id,
      alt2Name: alt2?.name,
      notes: slot.notes,
    };
  }
}

/**
 * Builds the `notes` field for a BlockDayExercise in the format expected by
 * CategoryLaneView: `[category|role|altsJSON]` followed by any human-readable notes.
 *
 * altsJSON is a JSON-stringified array of { id, name } for the alt exercises,
 * so the workout logger can render the swap UI without an extra DB lookup.
 */
export function buildExerciseNotes(
  resolved: ResolvedSlot,
  perBlockNotesOverride?: string
): string {
  const alts: Array<{ id: string; name: string }> = [];
  if (resolved.alt1Id && resolved.alt1Name) alts.push({ id: resolved.alt1Id, name: resolved.alt1Name });
  if (resolved.alt2Id && resolved.alt2Name) alts.push({ id: resolved.alt2Id, name: resolved.alt2Name });

  const meta = `[${resolved.category}|${resolved.role}|${JSON.stringify(alts)}]`;
  const humanNotes = perBlockNotesOverride ?? resolved.notes ?? "";
  return humanNotes ? `${meta} ${humanNotes}` : meta;
}
