// src/lib/program-engine/rules/exercise-pools.ts
// ============================================================================
// Exercise Library → Engine Category Mapping
//
// The seeded exercise library uses string fields (movementPattern, primaryMuscle,
// equipment). This module maps those strings to the engine's typed enums.
// ============================================================================

import type { MovementCategory, MuscleGroup, EquipmentType, ExerciseRecord, MappedExercise } from '../types';

// ---------------------------------------------------------------------------
// Movement Pattern String → MovementCategory Mapping
//
// The DB stores broad patterns like "Push", "Pull", "Legs".
// We need to subdivide based on exercise name + primary muscle.
// ---------------------------------------------------------------------------

/** Map an exercise from the DB to engine categories */
export function mapExercise(ex: ExerciseRecord): MappedExercise {
  return {
    ...ex,
    movementCategories: inferMovementCategories(ex),
    muscleGroups: inferMuscleGroups(ex),
    equipmentType: inferEquipmentType(ex),
  };
}

/** Map an entire exercise library */
export function mapExerciseLibrary(exercises: ExerciseRecord[]): MappedExercise[] {
  return exercises.map(mapExercise);
}

// ---------------------------------------------------------------------------
// Movement Category Inference
// ---------------------------------------------------------------------------

function inferMovementCategories(ex: ExerciseRecord): MovementCategory[] {
  const name = ex.name.toLowerCase();
  const pattern = (ex.movementPattern || '').toLowerCase();
  const muscle = (ex.primaryMuscle || '').toLowerCase();
  const categories: MovementCategory[] = [];

  // --- Push movements ---
  if (pattern === 'push' || pattern.includes('push')) {
    if (isIsolation(name)) {
      // Isolation push exercises get specific isolation categories only
      if (muscle.includes('chest') || name.includes('fly') || name.includes('crossover') || name.includes('pec')) {
        categories.push('chest_isolation');
      }
      if (muscle.includes('shoulder') || muscle.includes('delt') || name.includes('lateral') || name.includes('front raise')) {
        categories.push('shoulder_isolation');
      }
      if (muscle.includes('tricep') || name.includes('tricep') || name.includes('pushdown') || name.includes('extension') || name.includes('skull')) {
        categories.push('tricep');
      }
    } else {
      // Compound push exercises
      if (isVerticalPush(name, muscle)) {
        categories.push('vertical_push');
      } else {
        categories.push('horizontal_push');
      }
    }
  }

  // --- Pull movements ---
  if (pattern === 'pull' || pattern.includes('pull')) {
    if (isIsolation(name)) {
      // Isolation pull exercises get specific isolation categories only
      if (name.includes('curl') || muscle.includes('bicep')) {
        categories.push('bicep');
      }
      if (name.includes('reverse fly') || name.includes('face pull') || name.includes('rear delt')) {
        categories.push('rotator_cuff');
        categories.push('back_isolation');
      }
      if (name.includes('straight arm') || name.includes('pullover')) {
        categories.push('back_isolation');
      }
    } else {
      // Compound pull exercises
      if (isVerticalPull(name)) {
        categories.push('vertical_pull');
      } else {
        categories.push('horizontal_pull');
      }
    }
  }

  // --- Leg movements ---
  // IMPORTANT: Check lunges BEFORE squats because "split squat" contains "squat"
  if (pattern === 'legs' || pattern.includes('leg')) {
    if (isLungePattern(name)) {
      categories.push('lunge');
    } else if (isSquatPattern(name)) {
      categories.push('squat');
    } else if (isHingePattern(name)) {
      categories.push('hip_hinge');
    } else if (isLungePattern(name)) {
      categories.push('lunge');
    } else if (muscle.includes('quad')) {
      categories.push(isIsolation(name) ? 'quad_isolation' : 'squat');
    } else if (muscle.includes('hamstring')) {
      categories.push(isIsolation(name) ? 'hamstring_isolation' : 'hip_hinge');
    } else if (muscle.includes('glute')) {
      categories.push(isIsolation(name) ? 'glute_isolation' : 'hip_hinge');
    } else if (muscle.includes('calf') || muscle.includes('calves')) {
      categories.push('calf');
    } else {
      // Default: try to infer from name
      categories.push('squat');
    }
  }

  // --- Core ---
  if (pattern === 'core' || pattern.includes('core') || pattern.includes('abs')) {
    categories.push('core');
  }

  // --- Carry ---
  if (name.includes('farmer') || name.includes('carry') || name.includes('suitcase')) {
    categories.push('carry');
  }

  // Fallback: if nothing matched, try primary muscle
  if (categories.length === 0) {
    const fallback = muscleFallbackCategory(muscle);
    if (fallback) categories.push(fallback);
  }

  return [...new Set(categories)]; // deduplicate
}

// ---------------------------------------------------------------------------
// Helper: Is this a vertical push?
// ---------------------------------------------------------------------------

function isVerticalPush(name: string, muscle: string): boolean {
  return (
    name.includes('overhead') ||
    name.includes('ohp') ||
    name.includes('military') ||
    name.includes('shoulder press') ||
    name.includes('pike') ||
    name.includes('handstand') ||
    name.includes('arnold press') ||
    name.includes('push press') ||
    name.includes('z press') ||
    name.includes('landmine press') ||
    (name.includes('press') && muscle.includes('shoulder'))
  );
}

// ---------------------------------------------------------------------------
// Helper: Is this a vertical pull?
// ---------------------------------------------------------------------------

function isVerticalPull(name: string): boolean {
  return (
    name.includes('pull-up') ||
    name.includes('pullup') ||
    name.includes('chin-up') ||
    name.includes('chinup') ||
    name.includes('pulldown') ||
    name.includes('lat pull') ||
    name.includes('pull down')
  );
}

// ---------------------------------------------------------------------------
// Helper: Is this an isolation exercise?
// ---------------------------------------------------------------------------

function isIsolation(name: string): boolean {
  const isolationKeywords = [
    'curl', 'extension', 'fly', 'raise', 'lateral', 'kickback',
    'pushdown', 'pullover', 'crossover', 'pec deck', 'skull',
    'concentration', 'preacher', 'reverse fly', 'face pull',
    'straight arm', 'leg curl', 'leg extension', 'calf raise',
    'hip thrust', 'glute bridge', 'ab ', 'crunch', 'plank',
    'shrug',
  ];
  return isolationKeywords.some((kw) => name.includes(kw));
}

// ---------------------------------------------------------------------------
// Helper: Squat / Hinge / Lunge detection
// ---------------------------------------------------------------------------

function isSquatPattern(name: string): boolean {
  return (
    name.includes('squat') ||
    name.includes('leg press') ||
    name.includes('hack')
  );
}

function isHingePattern(name: string): boolean {
  return (
    name.includes('deadlift') ||
    name.includes('rdl') ||
    name.includes('romanian') ||
    name.includes('good morning') ||
    name.includes('hip thrust') ||
    name.includes('glute bridge') ||
    name.includes('pull through') ||
    name.includes('hyperextension') ||
    name.includes('back extension')
  );
}

function isLungePattern(name: string): boolean {
  return (
    name.includes('lunge') ||
    name.includes('split squat') ||
    name.includes('step-up') ||
    name.includes('step up') ||
    name.includes('bulgarian')
  );
}

// ---------------------------------------------------------------------------
// Helper: Muscle fallback
// ---------------------------------------------------------------------------

function muscleFallbackCategory(muscle: string): MovementCategory | null {
  if (muscle.includes('chest')) return 'horizontal_push';
  if (muscle.includes('shoulder') || muscle.includes('delt')) return 'vertical_push';
  if (muscle.includes('back') || muscle.includes('lat')) return 'horizontal_pull';
  if (muscle.includes('bicep')) return 'bicep';
  if (muscle.includes('tricep')) return 'tricep';
  if (muscle.includes('quad')) return 'squat';
  if (muscle.includes('hamstring')) return 'hip_hinge';
  if (muscle.includes('glute')) return 'glute_isolation';
  if (muscle.includes('calf') || muscle.includes('calves')) return 'calf';
  if (muscle.includes('core') || muscle.includes('ab')) return 'core';
  if (muscle.includes('trap')) return 'horizontal_pull';
  if (muscle.includes('forearm')) return 'bicep';
  return null;
}

// ---------------------------------------------------------------------------
// Muscle Group Inference
// ---------------------------------------------------------------------------

function inferMuscleGroups(ex: ExerciseRecord): MuscleGroup[] {
  const groups: MuscleGroup[] = [];
  const primary = (ex.primaryMuscle || '').toLowerCase();
  const secondary = (ex.secondaryMuscles || '').toLowerCase();
  const all = `${primary} ${secondary}`;

  const mapping: [string, MuscleGroup][] = [
    ['chest', 'chest'],
    ['pec', 'chest'],
    ['lat', 'back'],
    ['back', 'back'],
    ['rhomboid', 'back'],
    ['shoulder', 'shoulders'],
    ['delt', 'shoulders'],
    ['rear delt', 'rear_delts'],
    ['quad', 'quads'],
    ['hamstring', 'hamstrings'],
    ['glute', 'glutes'],
    ['bicep', 'biceps'],
    ['tricep', 'triceps'],
    ['calf', 'calves'],
    ['calves', 'calves'],
    ['core', 'core'],
    ['ab', 'core'],
    ['oblique', 'core'],
    ['forearm', 'forearms'],
    ['grip', 'forearms'],
    ['trap', 'traps'],
  ];

  for (const [keyword, group] of mapping) {
    if (all.includes(keyword) && !groups.includes(group)) {
      groups.push(group);
    }
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Equipment Type Inference
// ---------------------------------------------------------------------------

function inferEquipmentType(ex: ExerciseRecord): EquipmentType {
  const equip = (ex.equipment || '').toLowerCase();
  const name = ex.name.toLowerCase();

  if (equip.includes('barbell') || name.includes('barbell')) return 'barbell';
  if (equip.includes('dumbbell') || name.includes('dumbbell')) return 'dumbbell';
  if (equip.includes('cable') || name.includes('cable')) return 'cable';
  if (equip.includes('machine') || name.includes('machine') || name.includes('smith')) return 'machine';
  if (equip.includes('kettlebell') || name.includes('kettlebell')) return 'kettlebell';
  if (equip.includes('band') || name.includes('band')) return 'band';
  if (equip.includes('bodyweight') || name.includes('bodyweight') || equip === '' || equip === 'none') {
    // Check if it's truly bodyweight
    if (name.includes('push-up') || name.includes('pull-up') || name.includes('dip') ||
        name.includes('plank') || name.includes('crunch') || name.includes('bodyweight')) {
      return 'bodyweight';
    }
  }

  return 'other';
}

// ---------------------------------------------------------------------------
// Equipment Compatibility Check
// ---------------------------------------------------------------------------

export function isEquipmentCompatible(
  exerciseEquipment: EquipmentType,
  userEquipment: string,
): boolean {
  switch (userEquipment) {
    case 'full_gym':
      return true; // everything available
    case 'barbell_home':
      return ['barbell', 'dumbbell', 'bodyweight', 'band'].includes(exerciseEquipment);
    case 'dumbbell_only':
      return ['dumbbell', 'bodyweight', 'band'].includes(exerciseEquipment);
    case 'home_minimal':
      return ['dumbbell', 'bodyweight', 'band'].includes(exerciseEquipment);
    case 'bodyweight':
      return exerciseEquipment === 'bodyweight';
    default:
      return true;
  }
}
