// src/lib/program-engine/exercise-selector.ts
// ============================================================================
// Exercise Selector
// Fills each CategorySlot with a primary exercise and 1-3 alternatives
// from the exercise library, filtered and ranked.
// ============================================================================

import type {
  ProgramConfig, ScheduleSkeleton, BlockSkeleton, DaySkeleton,
  DayBlueprint, CategorySlot, SlotTemplate, MappedExercise,
  ExerciseAssignment, MovementCategory, ExerciseRole, EquipmentType,
  BlockBlueprint,
} from './types';
import { isEquipmentCompatible } from './rules/exercise-pools';
import { STICKING_POINT_VARIATIONS } from './rules/categories';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function selectExercises(
  skeleton: ScheduleSkeleton,
  exercises: MappedExercise[],
  config: ProgramConfig,
): { blocks: BlockBlueprint[]; warnings: string[] } {
  const warnings: string[] = [];
  const excludedIds = new Set(config.excludedExercises || []);

  // Collect injury body parts to filter
  const injuredParts = new Set((config.injuries || []).map((i) => {
    // Normalize: "shoulder_l" → "shoulder"
    return i.replace(/_[lr]$/, '');
  }));

  // Pre-filter exercise library for equipment compatibility
  const availableExercises = exercises.filter((ex) =>
    isEquipmentCompatible(ex.equipmentType, config.equipment) &&
    !excludedIds.has(ex.id)
  );

  // Track exercises used across days to avoid duplicates
  const blocks = skeleton.blocks.map((block) => {
    const usedExerciseIds = new Set<string>();

    const days: DayBlueprint[] = block.days.map((day) => {
      if (day.dayType !== 'lifting') {
        return {
          name: day.name,
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          slots: [],
        };
      }

      const slots: CategorySlot[] = day.slotTemplates.map((template) => {
        const result = fillSlot(
          template,
          availableExercises,
          usedExerciseIds,
          injuredParts,
          config,
        );

        if (!result) {
          warnings.push(
            `No exercises found for ${template.category.replace(/_/g, ' ')} on ${day.name}. Slot left as placeholder.`
          );
          return createPlaceholderSlot(template);
        }

        // Mark primary as used
        usedExerciseIds.add(result.primary.exerciseId);

        return result;
      });

      return {
        name: day.name,
        dayNumber: day.dayNumber,
        dayType: day.dayType,
        slots,
      };
    });

    // Construct BlockBlueprint without spreading BlockSkeleton (avoids days type conflict)
    const result: BlockBlueprint = {
      name: block.name,
      phase: block.phase,
      durationWeeks: block.durationWeeks,
      blockNumber: block.blockNumber,
      volumeModifier: block.volumeModifier,
      intensityModifier: block.intensityModifier,
      days,
    };
    return result;
  });

  return { blocks, warnings };
}

// ---------------------------------------------------------------------------
// Slot Filling
// ---------------------------------------------------------------------------

function fillSlot(
  template: SlotTemplate,
  exercises: MappedExercise[],
  usedIds: Set<string>,
  injuredParts: Set<string>,
  config: ProgramConfig,
): CategorySlot | null {
  // 1. Filter to matching exercises
  let candidates = exercises.filter((ex) => {
    // Must match the movement category
    if (!ex.movementCategories.includes(template.category)) return false;

    // Filter out exercises targeting injured body parts
    if (hasInjuryConflict(ex, injuredParts)) return false;

    return true;
  });

  // 2. Apply variant hints (e.g., 'incline', 'cable')
  if (template.variant) {
    const variantCandidates = candidates.filter((ex) =>
      ex.name.toLowerCase().includes(template.variant!.toLowerCase())
    );
    if (variantCandidates.length > 0) {
      candidates = variantCandidates;
    }
    // If no variant matches, fall through to full candidate list
  }

  // 3. Boost sticking point exercises for powerlifting
  if (config.primaryGoal === 'powerlifting' && config.stickingPoints) {
    candidates = boostStickingPointExercises(candidates, template, config);
  }

  // 4. Rank candidates
  const ranked = rankExercises(candidates, template, usedIds, config);

  if (ranked.length === 0) {
    // Fallback: broaden search
    const broadened = broadenSearch(template, exercises, usedIds, injuredParts, config);
    if (broadened.length === 0) return null;
    return buildSlotFromRanked(template, broadened);
  }

  return buildSlotFromRanked(template, ranked);
}

// ---------------------------------------------------------------------------
// Exercise Ranking
// ---------------------------------------------------------------------------

interface RankedExercise {
  exercise: MappedExercise;
  score: number;
}

function rankExercises(
  candidates: MappedExercise[],
  template: SlotTemplate,
  usedIds: Set<string>,
  config: ProgramConfig,
): RankedExercise[] {
  const scored = candidates.map((ex) => {
    let score = 50; // base score

    // Equipment preference bonus
    score += equipmentPreferenceScore(ex.equipmentType, config.exercisePreference);

    // Compound preference for compound slots, isolation for isolation slots
    if (template.role === 'primary_compound' || template.role === 'secondary_compound') {
      if (['barbell', 'dumbbell'].includes(ex.equipmentType)) score += 10;
      if (ex.equipmentType === 'bodyweight' && isCompoundBodyweight(ex.name)) score += 8;
    }
    if (template.role === 'isolation') {
      if (['cable', 'machine'].includes(ex.equipmentType)) score += 5;
    }

    // Variety bonus: haven't used this exercise on another day
    if (!usedIds.has(ex.id)) score += 15;

    // Slight penalty for duplicate equipment type in same day
    // (encourages variety: barbell bench + dumbbell OHP rather than barbell everything)
    // This is handled by alternative selection logic below

    // Physique division muscle priority
    if (config.primaryGoal === 'physique' && config.physiqueDivision) {
      score += physiquePriorityScore(ex, config.physiqueDivision);
    }

    return { exercise: ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function equipmentPreferenceScore(exerciseEquip: EquipmentType, pref: string): number {
  switch (pref) {
    case 'barbell':
      return exerciseEquip === 'barbell' ? 20 : exerciseEquip === 'dumbbell' ? 5 : 0;
    case 'dumbbell':
      return exerciseEquip === 'dumbbell' ? 20 : exerciseEquip === 'barbell' ? 5 : 0;
    case 'machine':
      return exerciseEquip === 'machine' ? 20 : exerciseEquip === 'cable' ? 15 : 0;
    case 'mixed':
    default:
      return 0; // no preference
  }
}

function isCompoundBodyweight(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes('pull-up') || n.includes('dip') || n.includes('push-up') ||
         n.includes('chin-up') || n.includes('row');
}

function physiquePriorityScore(ex: MappedExercise, division: string): number {
  // Import would be circular, so inline the logic
  const priorities: Record<string, string[]> = {
    bikini: ['glutes', 'shoulders'],
    wellness: ['glutes', 'quads', 'hamstrings'],
    classic_physique: ['back', 'shoulders'],
    mens_physique: ['shoulders', 'back', 'biceps'],
    bodybuilding: [],
    figure: ['shoulders', 'back'],
  };

  const priorityMuscles = priorities[division] || [];
  const matchCount = ex.muscleGroups.filter((m) => priorityMuscles.includes(m)).length;
  return matchCount * 5;
}

// ---------------------------------------------------------------------------
// Sticking Point Boosting
// ---------------------------------------------------------------------------

function boostStickingPointExercises(
  candidates: MappedExercise[],
  template: SlotTemplate,
  config: ProgramConfig,
): MappedExercise[] {
  if (!config.stickingPoints) return candidates;

  // Determine which lift this slot maps to
  let lift: 'squat' | 'bench' | 'deadlift' | null = null;
  if (template.category === 'squat') lift = 'squat';
  if (template.category === 'horizontal_push') lift = 'bench';
  if (template.category === 'hip_hinge') lift = 'deadlift';

  if (!lift) return candidates;

  const stickingPoint = config.stickingPoints[lift];
  if (!stickingPoint) return candidates;

  const variationPatterns = STICKING_POINT_VARIATIONS[lift]?.[stickingPoint] || [];

  // Sort variation-matching exercises to the front
  const matches: MappedExercise[] = [];
  const nonMatches: MappedExercise[] = [];

  for (const ex of candidates) {
    const name = ex.name.toLowerCase();
    const isVariation = variationPatterns.some((p) => name.includes(p.toLowerCase()));
    if (isVariation) {
      matches.push(ex);
    } else {
      nonMatches.push(ex);
    }
  }

  return [...matches, ...nonMatches];
}

// ---------------------------------------------------------------------------
// Injury Conflict Check
// ---------------------------------------------------------------------------

function hasInjuryConflict(ex: MappedExercise, injuredParts: Set<string>): boolean {
  if (injuredParts.size === 0) return false;

  const primary = (ex.primaryMuscle || '').toLowerCase();

  // Map muscle names to body parts
  const muscleToBodyPart: Record<string, string> = {
    shoulder: 'shoulder', delt: 'shoulder',
    chest: 'shoulder', // chest exercises stress shoulders
    bicep: 'elbow', tricep: 'elbow',
    forearm: 'wrist',
    quad: 'knee', hamstring: 'knee',
    calf: 'ankle', calves: 'ankle',
    glute: 'hip',
    'lower back': 'lower_back', erector: 'lower_back',
  };

  for (const [muscle, bodyPart] of Object.entries(muscleToBodyPart)) {
    if (primary.includes(muscle) && injuredParts.has(bodyPart)) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Broadened Search (fallback)
// ---------------------------------------------------------------------------

function broadenSearch(
  template: SlotTemplate,
  allExercises: MappedExercise[],
  usedIds: Set<string>,
  injuredParts: Set<string>,
  config: ProgramConfig,
): RankedExercise[] {
  // Try broader equipment filter
  const broaderCandidates = allExercises.filter((ex) => {
    if (!ex.movementCategories.includes(template.category)) return false;
    if (hasInjuryConflict(ex, injuredParts)) return false;
    // Skip equipment filter — allow anything
    return true;
  });

  if (broaderCandidates.length > 0) {
    return rankExercises(broaderCandidates, template, usedIds, config);
  }

  // Try broader category (e.g., chest_isolation → horizontal_push)
  const fallbackCategories = getCategoryFallbacks(template.category);
  for (const fallbackCat of fallbackCategories) {
    const fallbackCandidates = allExercises.filter((ex) => {
      if (!ex.movementCategories.includes(fallbackCat)) return false;
      if (hasInjuryConflict(ex, injuredParts)) return false;
      return true;
    });
    if (fallbackCandidates.length > 0) {
      return rankExercises(fallbackCandidates, template, usedIds, config);
    }
  }

  return [];
}

function getCategoryFallbacks(category: MovementCategory): MovementCategory[] {
  const fallbacks: Partial<Record<MovementCategory, MovementCategory[]>> = {
    chest_isolation: ['horizontal_push'],
    back_isolation: ['horizontal_pull', 'vertical_pull'],
    shoulder_isolation: ['vertical_push'],
    quad_isolation: ['squat', 'lunge'],
    hamstring_isolation: ['hip_hinge'],
    glute_isolation: ['hip_hinge', 'lunge'],
    rotator_cuff: ['shoulder_isolation', 'back_isolation'],
  };
  return fallbacks[category] || [];
}

// ---------------------------------------------------------------------------
// Build CategorySlot from Ranked Results
// ---------------------------------------------------------------------------

function buildSlotFromRanked(
  template: SlotTemplate,
  ranked: RankedExercise[],
): CategorySlot {
  const primary = ranked[0].exercise;

  // Select alternatives: different equipment than primary, up to 3
  const alternatives: MappedExercise[] = [];
  const usedEquipment = new Set([primary.equipmentType]);

  for (let i = 1; i < ranked.length && alternatives.length < 3; i++) {
    const candidate = ranked[i].exercise;
    // Prefer different equipment for meaningful alternatives
    if (!usedEquipment.has(candidate.equipmentType) || alternatives.length < 1) {
      alternatives.push(candidate);
      usedEquipment.add(candidate.equipmentType);
    }
  }

  // If we still have no alternatives, just take the next ranked regardless of equipment
  if (alternatives.length === 0 && ranked.length > 1) {
    alternatives.push(ranked[1].exercise);
  }

  return {
    category: template.category,
    muscleGroups: template.muscleGroups,
    role: template.role,
    sortOrder: template.sortOrder,
    primary: toAssignment(primary),
    alternatives: alternatives.map(toAssignment),
  };
}

function toAssignment(ex: MappedExercise): ExerciseAssignment {
  // Progression details are filled by the ProgressionAssigner — use placeholders
  return {
    exerciseId: ex.id,
    exerciseName: ex.name,
    targetSets: 0,     // filled later
    targetRepRange: '', // filled later
    targetRpe: '',      // filled later
    progressionType: 'double', // default, overridden later
  };
}

// ---------------------------------------------------------------------------
// Placeholder Slot (no exercises found)
// ---------------------------------------------------------------------------

function createPlaceholderSlot(template: SlotTemplate): CategorySlot {
  return {
    category: template.category,
    muscleGroups: template.muscleGroups,
    role: template.role,
    sortOrder: template.sortOrder,
    primary: {
      exerciseId: '',
      exerciseName: 'Select exercise',
      targetSets: 3,
      targetRepRange: '8-12',
      targetRpe: '7',
      progressionType: 'double',
      notes: 'No matching exercise found for this category. Please select manually.',
    },
    alternatives: [],
  };
}
