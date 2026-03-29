// src/lib/program-engine/schedule-builder.ts
// ============================================================================
// Schedule Builder
// Resolves split selection, builds block periodization, generates skeletons.
// ============================================================================

import type {
  ProgramConfig, ScheduleSkeleton, BlockSkeleton, DaySkeleton,
  SlotTemplate, BlockPhase, Split, SplitSuggestion, PrimaryGoal,
} from './types';
import { SPLIT_DEFINITIONS, suggestSplits, validateSplit } from './rules/splits';
import { PHASE_MODIFIERS } from './rules/volume';
import { CATEGORY_MUSCLES } from './rules/categories';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildSchedule(config: ProgramConfig): ScheduleSkeleton {
  const warnings: string[] = [];

  // 1. Resolve split
  const { resolvedSplit, splitSuggestions, splitWarnings } = resolveSplit(config);
  warnings.push(...splitWarnings);

  // 2. Build block periodization
  const blockStructure = buildBlocks(config, resolvedSplit);

  // 3. Generate day skeletons for each block
  const blocks: BlockSkeleton[] = blockStructure.map((block) => ({
    ...block,
    days: generateDays(config, resolvedSplit, block),
  }));

  return {
    resolvedSplit,
    splitSuggestions,
    blocks,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Step 1: Split Resolution
// ---------------------------------------------------------------------------

function resolveSplit(config: ProgramConfig): {
  resolvedSplit: Exclude<Split, 'auto'>;
  splitSuggestions: SplitSuggestion[];
  splitWarnings: string[];
} {
  const suggestions = suggestSplits(config.daysPerWeek, config.primaryGoal, config.experience);
  const splitSuggestions: SplitSuggestion[] = suggestions.map((s, i) => ({
    split: s.split,
    rank: i + 1,
    reason: s.reason,
    warnings: s.warnings.length > 0 ? s.warnings : undefined,
  }));

  let resolvedSplit: Exclude<Split, 'auto'>;
  let splitWarnings: string[] = [];

  if (config.splitPreference === 'auto') {
    // Use top suggestion
    resolvedSplit = suggestions[0].split;
    if (suggestions[0].warnings.length > 0) {
      splitWarnings = suggestions[0].warnings;
    }
  } else {
    // User picked a specific split — validate but don't block
    resolvedSplit = config.splitPreference as Exclude<Split, 'auto'>;
    splitWarnings = validateSplit(resolvedSplit, config.daysPerWeek, config.experience);
  }

  return { resolvedSplit, splitSuggestions, splitWarnings };
}

// ---------------------------------------------------------------------------
// Step 2: Block Periodization
// ---------------------------------------------------------------------------

interface BlockConfig {
  name: string;
  phase: BlockPhase;
  durationWeeks: number;
  blockNumber: number;
  volumeModifier: number;
  intensityModifier: number;
}

function buildBlocks(config: ProgramConfig, split: Exclude<Split, 'auto'>): BlockConfig[] {
  const { primaryGoal, durationWeeks } = config;

  // Physique competition: special periodization
  if (primaryGoal === 'physique' && config.prepPhase) {
    return buildPhysiqueBlocks(config);
  }

  // Powerlifting with competition date: work backward
  if (primaryGoal === 'powerlifting' && config.competitionDate) {
    return buildPowerliftingBlocks(config);
  }

  // Standard periodization
  return buildStandardBlocks(durationWeeks, primaryGoal);
}

function buildStandardBlocks(weeks: number, goal: PrimaryGoal): BlockConfig[] {
  const blocks: BlockConfig[] = [];
  let blockNum = 1;

  // Goal-specific phase distribution
  const phases = getPhaseDistribution(weeks, goal);

  for (const phase of phases) {
    const phaseMods = PHASE_MODIFIERS[phase.phase];
    blocks.push({
      name: phase.name,
      phase: phase.phase,
      durationWeeks: phase.weeks,
      blockNumber: blockNum++,
      volumeModifier: phaseMods.volume,
      intensityModifier: phaseMods.intensity,
    });
  }

  return blocks;
}

interface PhaseConfig {
  name: string;
  phase: BlockPhase;
  weeks: number;
}

function getPhaseDistribution(totalWeeks: number, goal: PrimaryGoal): PhaseConfig[] {
  // Goal modifiers shift phase lengths
  const isStrength = goal === 'strength' || goal === 'powerlifting';
  const isHypertrophy = goal === 'hypertrophy' || goal === 'physique';
  const isFatLoss = goal === 'fat_loss';

  switch (totalWeeks) {
    case 4:
      return [
        { name: 'Training Block', phase: 'accumulation', weeks: 3 },
        { name: 'Deload', phase: 'deload', weeks: 1 },
      ];

    case 8:
      if (isFatLoss) {
        return [
          { name: 'Fat Loss Block 1', phase: 'accumulation', weeks: 3 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
          { name: 'Fat Loss Block 2', phase: 'accumulation', weeks: 3 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
        ];
      }
      return [
        { name: 'Accumulation', phase: 'accumulation', weeks: isHypertrophy ? 4 : 3 },
        { name: 'Intensification', phase: 'intensification', weeks: isStrength ? 4 : isHypertrophy ? 3 : 4 },
        { name: 'Deload', phase: 'deload', weeks: 1 },
      ];

    case 12:
      if (isFatLoss) {
        return [
          { name: 'Fat Loss Block 1', phase: 'accumulation', weeks: 3 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
          { name: 'Fat Loss Block 2', phase: 'accumulation', weeks: 3 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
          { name: 'Fat Loss Block 3', phase: 'intensification', weeks: 3 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
        ];
      }
      if (isStrength) {
        return [
          { name: 'Accumulation', phase: 'accumulation', weeks: 3 },
          { name: 'Intensification', phase: 'intensification', weeks: 4 },
          { name: 'Peaking', phase: 'peaking', weeks: 4 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
        ];
      }
      return [
        { name: 'Accumulation', phase: 'accumulation', weeks: 4 },
        { name: 'Intensification', phase: 'intensification', weeks: 4 },
        { name: 'Peaking', phase: 'peaking', weeks: 3 },
        { name: 'Deload', phase: 'deload', weeks: 1 },
      ];

    case 16:
      if (isStrength) {
        return [
          { name: 'Accumulation', phase: 'accumulation', weeks: 4 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
          { name: 'Intensification', phase: 'intensification', weeks: 5 },
          { name: 'Peaking', phase: 'peaking', weeks: 5 },
          { name: 'Deload', phase: 'deload', weeks: 1 },
        ];
      }
      return [
        { name: 'Accumulation', phase: 'accumulation', weeks: 5 },
        { name: 'Deload', phase: 'deload', weeks: 1 },
        { name: 'Intensification', phase: 'intensification', weeks: 5 },
        { name: 'Peaking', phase: 'peaking', weeks: 4 },
        { name: 'Deload', phase: 'deload', weeks: 1 },
      ];

    default:
      // Fallback: 3 weeks training + 1 deload, repeated
      const cycles = Math.floor(totalWeeks / 4);
      const remainder = totalWeeks % 4;
      const result: PhaseConfig[] = [];
      for (let i = 0; i < cycles; i++) {
        result.push({ name: `Block ${i + 1}`, phase: 'accumulation', weeks: 3 });
        result.push({ name: `Deload ${i + 1}`, phase: 'deload', weeks: 1 });
      }
      if (remainder > 0) {
        result.push({ name: 'Final Block', phase: 'accumulation', weeks: remainder });
      }
      return result;
  }
}

// ---------------------------------------------------------------------------
// Physique-Specific Block Building
// ---------------------------------------------------------------------------

function buildPhysiqueBlocks(config: ProgramConfig): BlockConfig[] {
  const { prepPhase, durationWeeks } = config;
  const blocks: BlockConfig[] = [];
  let blockNum = 1;

  switch (prepPhase) {
    case 'offseason':
      // Pure hypertrophy blocks
      return buildStandardBlocks(durationWeeks, 'hypertrophy');

    case 'early_prep':
      blocks.push({
        name: 'Early Prep',
        phase: 'prep',
        durationWeeks: durationWeeks - 1,
        blockNumber: blockNum++,
        volumeModifier: 0.9,
        intensityModifier: 0.8,
      });
      blocks.push({
        name: 'Deload',
        phase: 'deload',
        durationWeeks: 1,
        blockNumber: blockNum++,
        volumeModifier: 0.5,
        intensityModifier: 0.6,
      });
      return blocks;

    case 'mid_prep':
      blocks.push({
        name: 'Mid Prep',
        phase: 'prep',
        durationWeeks: durationWeeks - 1,
        blockNumber: blockNum++,
        volumeModifier: 0.85,
        intensityModifier: 0.78,
      });
      blocks.push({
        name: 'Deload',
        phase: 'deload',
        durationWeeks: 1,
        blockNumber: blockNum++,
        volumeModifier: 0.5,
        intensityModifier: 0.6,
      });
      return blocks;

    case 'late_prep':
      const mainWeeks = durationWeeks - 2;
      if (mainWeeks > 0) {
        blocks.push({
          name: 'Late Prep',
          phase: 'prep',
          durationWeeks: mainWeeks,
          blockNumber: blockNum++,
          volumeModifier: 0.72,
          intensityModifier: 0.75,
        });
      }
      blocks.push({
        name: 'Peak Week',
        phase: 'peak_week',
        durationWeeks: 1,
        blockNumber: blockNum++,
        volumeModifier: 0.4,
        intensityModifier: 0.5,
      });
      blocks.push({
        name: 'Show Week',
        phase: 'deload',
        durationWeeks: 1,
        blockNumber: blockNum++,
        volumeModifier: 0.3,
        intensityModifier: 0.4,
      });
      return blocks;

    case 'maintenance':
    default:
      return buildStandardBlocks(durationWeeks, 'hypertrophy');
  }
}

// ---------------------------------------------------------------------------
// Powerlifting-Specific Block Building
// ---------------------------------------------------------------------------

function buildPowerliftingBlocks(config: ProgramConfig): BlockConfig[] {
  const { durationWeeks, competitionDate } = config;
  // Standard powerlifting periodization working backward from comp date
  // The engine builds the same phase structure but with SBD focus
  return buildStandardBlocks(durationWeeks, 'powerlifting');
}

// ---------------------------------------------------------------------------
// Step 3: Generate Day Skeletons
// ---------------------------------------------------------------------------

function generateDays(
  config: ProgramConfig,
  split: Exclude<Split, 'auto'>,
  block: BlockConfig,
): DaySkeleton[] {
  const splitDef = SPLIT_DEFINITIONS[split];
  const days: DaySkeleton[] = [];

  // How many times does the split cycle repeat in a week?
  const fullCycles = Math.floor(config.daysPerWeek / splitDef.daysPerCycle);
  const extraDays = config.daysPerWeek % splitDef.daysPerCycle;

  let dayNum = 1;

  // Generate full cycles
  for (let cycle = 0; cycle < fullCycles; cycle++) {
    for (const dayDef of splitDef.days) {
      const suffix = fullCycles > 1 ? ` ${String.fromCharCode(65 + cycle)}` : '';
      days.push({
        name: `${dayDef.name}${suffix}`,
        dayNumber: dayNum++,
        dayType: dayDef.dayType,
        slotTemplates: dayDef.slots.map((slot, idx) => ({
          category: slot.category,
          muscleGroups: CATEGORY_MUSCLES[slot.category] || [],
          role: slot.role,
          sortOrder: idx + 1,
          variant: slot.variant,
          alternatesWith: slot.alternatesWith,
        })),
      });
    }
  }

  // Fill extra days
  // For powerlifting with a weakest lift, extra days prioritize that lift
  for (let i = 0; i < extraDays; i++) {
    let dayDef = splitDef.days[i % splitDef.days.length];

    // Powerlifting: route extra days to the weakest lift
    if (split === 'powerlifting' && config.weakestLift && i === 0) {
      const weakLiftDayMap: Record<string, string> = {
        squat: 'Squat Day',
        bench: 'Bench Day',
        deadlift: 'Deadlift Day',
      };
      const targetName = weakLiftDayMap[config.weakestLift];
      const weakDay = splitDef.days.find((d) => d.name === targetName);
      if (weakDay) dayDef = weakDay;
    }

    days.push({
      name: `${dayDef.name} (Light)`,
      dayNumber: dayNum++,
      dayType: dayDef.dayType,
      slotTemplates: dayDef.slots.map((slot, idx) => ({
        category: slot.category,
        muscleGroups: CATEGORY_MUSCLES[slot.category] || [],
        role: slot.role === 'primary_compound' ? 'secondary_compound' : slot.role,
        sortOrder: idx + 1,
        variant: slot.variant ? `${slot.variant} variation` : 'variation',
        alternatesWith: slot.alternatesWith,
      })),
    });
  }

  // Add non-lifting modality days
  if (config.modalities.includes('stretch')) {
    days.push({
      name: 'Mobility',
      dayNumber: dayNum++,
      dayType: 'mobility',
      slotTemplates: [
        { category: 'stretch', muscleGroups: [], role: 'stretch', sortOrder: 1 },
      ],
    });
  }

  if (config.modalities.includes('hiit')) {
    days.push({
      name: 'HIIT Conditioning',
      dayNumber: dayNum++,
      dayType: 'conditioning',
      slotTemplates: [
        { category: 'cardio', muscleGroups: [], role: 'cardio', sortOrder: 1 },
      ],
    });
  }

  if (config.modalities.includes('liss')) {
    days.push({
      name: 'Cardio',
      dayNumber: dayNum++,
      dayType: 'cardio',
      slotTemplates: [
        { category: 'cardio', muscleGroups: [], role: 'cardio', sortOrder: 1 },
      ],
    });
  }

  return days;
}
