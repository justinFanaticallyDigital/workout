// src/lib/program-engine/category-mapper.ts
// ============================================================================
// Category Mapper
// Takes day skeletons from ScheduleBuilder and:
// 1. Trims slots based on session time budget
// 2. Applies injury exclusions and movement limitation substitutions
// 3. Applies physique weak-point volume boosts
// 4. Returns finalized slot templates ready for exercise selection
// ============================================================================

import type {
  ProgramConfig, ScheduleSkeleton, BlockSkeleton, DaySkeleton,
  SlotTemplate, MovementCategory, MuscleGroup,
} from './types';
import { getTimeBudget } from './rules/volume';
import {
  INJURY_CATEGORY_MAP,
  LIMITATION_ADJUSTMENTS,
  CATEGORY_MUSCLES,
} from './rules/categories';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function mapCategories(
  skeleton: ScheduleSkeleton,
  config: ProgramConfig,
): { skeleton: ScheduleSkeleton; warnings: string[] } {
  const warnings: string[] = [];
  const timeBudget = getTimeBudget(config.minutesPerSession);

  // Compute sets of categories to avoid/modify based on injuries
  const { avoidCategories, modifyCategories, injuryNotes } = computeInjuryFilters(config);
  warnings.push(...injuryNotes);

  // Compute limitation adjustments
  const { limitationSubs, limitationNotes } = computeLimitationAdjustments(config);
  warnings.push(...limitationNotes);

  // Process each block → each day
  const processedBlocks: BlockSkeleton[] = skeleton.blocks.map((block) => ({
    ...block,
    days: block.days.map((day) => processDay(day, {
      timeBudget,
      avoidCategories,
      modifyCategories,
      limitationSubs,
      config,
    })),
  }));

  return {
    skeleton: { ...skeleton, blocks: processedBlocks },
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Day Processing
// ---------------------------------------------------------------------------

interface ProcessContext {
  timeBudget: ReturnType<typeof getTimeBudget>;
  avoidCategories: Set<MovementCategory>;
  modifyCategories: Map<MovementCategory, string>;
  limitationSubs: Map<MovementCategory, MovementCategory>;
  config: ProgramConfig;
}

function processDay(day: DaySkeleton, ctx: ProcessContext): DaySkeleton {
  if (day.dayType !== 'lifting') return day; // only process lifting days

  let slots = [...day.slotTemplates];

  // 1. Remove slots for avoided categories (injuries)
  slots = slots.filter((slot) => {
    if (ctx.avoidCategories.has(slot.category)) {
      return false; // remove this slot entirely
    }
    return true;
  });

  // 2. Apply limitation substitutions
  slots = slots.map((slot) => {
    const sub = ctx.limitationSubs.get(slot.category);
    if (sub && sub !== slot.category) {
      return {
        ...slot,
        category: sub,
        muscleGroups: CATEGORY_MUSCLES[sub] || slot.muscleGroups,
      };
    }
    return slot;
  });

  // 3. Add injury modification notes to affected slots
  slots = slots.map((slot) => {
    const note = ctx.modifyCategories.get(slot.category);
    if (note) {
      return { ...slot, variant: slot.variant ? `${slot.variant} (${note})` : note };
    }
    return slot;
  });

  // 4. Apply physique weak-point boosts (add extra isolation slots)
  if (ctx.config.primaryGoal === 'physique' && ctx.config.weakPoints) {
    slots = applyWeakPointSlots(slots, ctx.config.weakPoints);
  }

  // 5. Trim to time budget
  slots = trimToTimeBudget(slots, ctx.timeBudget);

  // 6. Re-number sort order
  slots = slots.map((s, i) => ({ ...s, sortOrder: i + 1 }));

  return { ...day, slotTemplates: slots };
}

// ---------------------------------------------------------------------------
// Injury Filtering
// ---------------------------------------------------------------------------

function computeInjuryFilters(config: ProgramConfig): {
  avoidCategories: Set<MovementCategory>;
  modifyCategories: Map<MovementCategory, string>;
  injuryNotes: string[];
} {
  const avoid = new Set<MovementCategory>();
  const modify = new Map<MovementCategory, string>();
  const notes: string[] = [];

  if (!config.injuries || config.injuries.length === 0) {
    return { avoidCategories: avoid, modifyCategories: modify, injuryNotes: notes };
  }

  for (const injury of config.injuries) {
    const mapping = INJURY_CATEGORY_MAP[injury];
    if (!mapping) continue;

    for (const cat of mapping.avoid) {
      avoid.add(cat);
      notes.push(`Removed ${cat.replace(/_/g, ' ')} exercises due to ${injury.replace(/_/g, ' ')} injury.`);
    }
    for (const cat of mapping.modify) {
      modify.set(cat, `modified for ${injury.replace(/_/g, ' ')} injury`);
    }
  }

  return { avoidCategories: avoid, modifyCategories: modify, injuryNotes: notes };
}

// ---------------------------------------------------------------------------
// Movement Limitation Adjustments
// ---------------------------------------------------------------------------

function computeLimitationAdjustments(config: ProgramConfig): {
  limitationSubs: Map<MovementCategory, MovementCategory>;
  limitationNotes: string[];
} {
  const subs = new Map<MovementCategory, MovementCategory>();
  const notes: string[] = [];

  if (!config.movementLimitations || config.movementLimitations.length === 0) {
    return { limitationSubs: subs, limitationNotes: notes };
  }

  for (const limitation of config.movementLimitations) {
    const adj = LIMITATION_ADJUSTMENTS[limitation];
    if (!adj) continue;

    for (const sub of adj.substitute) {
      subs.set(sub.from, sub.to);
    }
    notes.push(adj.notes);
  }

  return { limitationSubs: subs, limitationNotes: notes };
}

// ---------------------------------------------------------------------------
// Physique Weak Point Slot Additions
// ---------------------------------------------------------------------------

function applyWeakPointSlots(slots: SlotTemplate[], weakPoints: MuscleGroup[]): SlotTemplate[] {
  const result = [...slots];

  for (const muscle of weakPoints) {
    // Check if there's already an isolation slot targeting this muscle
    const hasExisting = result.some(
      (s) => s.muscleGroups.includes(muscle) && (s.role === 'isolation' || s.role === 'accessory')
    );

    if (!hasExisting) {
      // Add an isolation slot for the weak point
      const category = muscleToIsolationCategory(muscle);
      if (category) {
        result.push({
          category,
          muscleGroups: CATEGORY_MUSCLES[category] || [muscle],
          role: 'isolation',
          sortOrder: result.length + 1,
          variant: 'weak point focus',
        });
      }
    }
  }

  return result;
}

function muscleToIsolationCategory(muscle: MuscleGroup): MovementCategory | null {
  const map: Partial<Record<MuscleGroup, MovementCategory>> = {
    chest: 'chest_isolation',
    back: 'back_isolation',
    shoulders: 'shoulder_isolation',
    rear_delts: 'rotator_cuff',
    quads: 'quad_isolation',
    hamstrings: 'hamstring_isolation',
    glutes: 'glute_isolation',
    biceps: 'bicep',
    triceps: 'tricep',
    calves: 'calf',
    core: 'core',
  };
  return map[muscle] || null;
}

// ---------------------------------------------------------------------------
// Time Budget Trimming
// ---------------------------------------------------------------------------

function trimToTimeBudget(
  slots: SlotTemplate[],
  budget: ReturnType<typeof getTimeBudget>,
): SlotTemplate[] {
  if (slots.length <= budget.totalSlots) return slots;

  // Prioritize keeping compounds, then isolations, then accessories
  // Remove from the bottom (accessories first)
  const compounds = slots.filter((s) =>
    s.role === 'primary_compound' || s.role === 'secondary_compound'
  );
  const isolations = slots.filter((s) => s.role === 'isolation');
  const accessories = slots.filter((s) =>
    s.role === 'accessory' || s.role === 'warmup'
  );

  const trimmedCompounds = compounds.slice(0, budget.maxCompounds);
  const trimmedIsolations = isolations.slice(0, budget.maxIsolations);
  const remainingSlots = budget.totalSlots - trimmedCompounds.length - trimmedIsolations.length;
  const trimmedAccessories = accessories.slice(0, Math.max(0, remainingSlots));

  return [...trimmedCompounds, ...trimmedIsolations, ...trimmedAccessories];
}
