import type { PrismaClient } from "@/generated/prisma/client";
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

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Equipment is the suffix after the last " - " when it names a known implement. */
function equipmentFromName(name: string): string | null {
  const tail = name.split(" - ").pop()?.trim() ?? "";
  const known = ["Barbell", "Dumbbell", "Kettlebell", "Cable", "Machine", "Band", "Bodyweight", "TRX", "Smith Machine", "Plate-Load", "Plate Lever", "Medicine Ball", "Bench Bodyweight", "Hanging"];
  const hit = known.find((k) => tail.toLowerCase().includes(k.toLowerCase()));
  if (hit) return hit === "Bench Bodyweight" || hit === "Hanging" ? "Bodyweight" : hit;
  if (/band/i.test(name)) return "Band";
  if (/dumbbell/i.test(name)) return "Dumbbell";
  if (/kettlebell/i.test(name)) return "Kettlebell";
  if (/cable/i.test(name)) return "Cable";
  if (/medicine ball/i.test(name)) return "Medicine Ball";
  if (/bodyweight|push-up|pull-up|chin-up|jump|crawl/i.test(name)) return "Bodyweight";
  return null;
}

/** MovementCategory → the library's movementPattern / primaryMuscle vocabulary (lib/categories.ts). */
const CATEGORY_META: Record<string, { pattern: string; muscle: string | null }> = {
  squat: { pattern: "Squat", muscle: "Quadriceps" },
  hinge: { pattern: "Hip Hinge", muscle: "Hamstrings" },
  horizontal_push: { pattern: "Horizontal Push", muscle: "Chest" },
  horizontal_pull: { pattern: "Horizontal Pull", muscle: "Lats" },
  vertical_push: { pattern: "Vertical Push", muscle: "Shoulders" },
  vertical_pull: { pattern: "Vertical Pull", muscle: "Lats" },
  single_leg: { pattern: "Lunge", muscle: "Quadriceps" },
  lunge: { pattern: "Lunge", muscle: "Quadriceps" },
  quad: { pattern: "Knee Extension", muscle: "Quadriceps" },
  hamstring: { pattern: "Knee Flexion", muscle: "Hamstrings" },
  glute: { pattern: "Hip Extension", muscle: "Glutes" },
  hip_extension: { pattern: "Hip Extension", muscle: "Glutes" },
  calf: { pattern: "Plantar Flexion", muscle: "Calves" },
  bicep: { pattern: "Elbow Flexion", muscle: "Biceps" },
  tricep: { pattern: "Elbow Extension", muscle: "Triceps" },
  lateral_delt: { pattern: "Shoulder Isolation", muscle: "Shoulders" },
  rear_delt: { pattern: "Shoulder Isolation", muscle: "Rear Delts" },
  front_delt: { pattern: "Shoulder Isolation", muscle: "Shoulders" },
  core: { pattern: "Core Stability", muscle: "Core" },
  mobility: { pattern: "Stretch", muscle: null },
  power: { pattern: "Power", muscle: "Full Body" },
  conditioning: { pattern: "Cardio", muscle: "Full Body" },
};

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

    // Exact, then case-insensitive, then punctuation-insensitive ("Push-Up - TRX" ≈ "Push Up - TRX").
    let ex = await this.prisma.exercise.findFirst({ where: { name, userId: null }, select: { id: true, name: true } });
    if (!ex) {
      ex = await this.prisma.exercise.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, userId: null },
        select: { id: true, name: true },
      });
    }
    if (!ex) {
      const wanted = normalizeName(name);
      const all = await this.allLibraryNames();
      const hit = all.find((e) => normalizeName(e.name) === wanted);
      if (hit) ex = hit;
    }

    if (ex) {
      this.cache.set(name, ex);
      return ex;
    }

    this.notFound.add(name);
    return null;
  }

  private libraryNames: { id: string; name: string }[] | null = null;
  private async allLibraryNames(): Promise<{ id: string; name: string }[]> {
    if (!this.libraryNames) {
      this.libraryNames = await this.prisma.exercise.findMany({ where: { userId: null }, select: { id: true, name: true } });
    }
    return this.libraryNames;
  }

  /**
   * Make sure every exercise a template references exists. Names that don't
   * resolve are created as library rows (userId null) with a movementPattern
   * and primaryMuscle derived from the slot's MovementCategory and the
   * equipment parsed from the name's " - <Equipment>" suffix. Returns what was
   * created so the seeder can report it. With `create: false` nothing is
   * written and the missing names are returned instead.
   */
  async ensureTemplateExercises(
    template: ProgramTemplate,
    opts: { create: boolean },
  ): Promise<{ created: string[]; missing: string[] }> {
    const created: string[] = [];
    const missing: string[] = [];
    const seen = new Set<string>();
    for (const day of template.days) {
      for (let slotIdx = 0; slotIdx < day.slots.length; slotIdx++) {
        const slot = day.slots[slotIdx];
        const params = day.perBlockParams.map((bp) => bp[slotIdx]);
        if (params.every((p) => p && p.sets === 0)) continue;
        for (const name of [slot.primary, slot.alt1, slot.alt2]) {
          if (!name || seen.has(name)) continue;
          seen.add(name);
          if (await this.resolveOne(name)) continue;
          if (!opts.create) {
            missing.push(`[${template.slug} / ${day.name} / slot ${slotIdx + 1}] missing: "${name}"`);
            continue;
          }
          const meta = CATEGORY_META[slot.category] ?? { pattern: "Core Stability", muscle: null };
          const row = await this.prisma.exercise.create({
            data: {
              name,
              userId: null,
              isCustom: false,
              movementPattern: meta.pattern,
              primaryMuscle: meta.muscle,
              equipment: equipmentFromName(name),
            },
            select: { id: true, name: true },
          });
          this.notFound.delete(name);
          this.cache.set(name, row);
          this.libraryNames?.push(row);
          created.push(`${name}  →  ${meta.pattern}${meta.muscle ? " · " + meta.muscle : ""}`);
        }
      }
    }
    return { created, missing };
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
