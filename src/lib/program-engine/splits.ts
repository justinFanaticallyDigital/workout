// src/lib/program-engine/rules/splits.ts
// ============================================================================
// Split Definitions — Category Slots Per Day
// ============================================================================

import type { MovementCategory, ExerciseRole, Split, PrimaryGoal } from './types';

// ---------------------------------------------------------------------------
// Slot Template Definition (used in split configs)
// ---------------------------------------------------------------------------

export interface SplitSlotDef {
  category: MovementCategory;
  role: ExerciseRole;
  variant?: string;                      // hint for exercise selector
  alternatesWith?: MovementCategory;     // for day-to-day rotation
}

export interface SplitDayDef {
  name: string;
  dayType: 'lifting' | 'cardio' | 'conditioning' | 'mobility' | 'rest';
  slots: SplitSlotDef[];
}

export interface SplitDefinition {
  daysPerCycle: number;
  days: SplitDayDef[];
}

// ---------------------------------------------------------------------------
// All Split Definitions
// ---------------------------------------------------------------------------

export const SPLIT_DEFINITIONS: Record<Exclude<Split, 'auto'>, SplitDefinition> = {

  full_body: {
    daysPerCycle: 1,
    days: [
      {
        name: 'Full Body',
        dayType: 'lifting',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'vertical_push', role: 'secondary_compound', alternatesWith: 'vertical_pull' },
          { category: 'hip_hinge', role: 'secondary_compound' },
          { category: 'core', role: 'accessory' },
        ],
      },
    ],
  },

  upper_lower: {
    daysPerCycle: 2,
    days: [
      {
        name: 'Upper',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'vertical_pull', role: 'secondary_compound' },
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
        ],
      },
      {
        name: 'Lower',
        dayType: 'lifting',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ],
      },
    ],
  },

  push_pull_legs: {
    daysPerCycle: 3,
    days: [
      {
        name: 'Push',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'vertical_push', role: 'primary_compound' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
        ],
      },
      {
        name: 'Pull',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'primary_compound' },
          { category: 'back_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ],
      },
      {
        name: 'Legs',
        dayType: 'lifting',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'glute_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ],
      },
    ],
  },

  push_pull: {
    daysPerCycle: 2,
    days: [
      {
        name: 'Push + Quads',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'squat', role: 'primary_compound' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'quad_isolation', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
        ],
      },
      {
        name: 'Pull + Hams',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ],
      },
    ],
  },

  bro_split: {
    daysPerCycle: 5,
    days: [
      {
        name: 'Chest',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'secondary_compound', variant: 'incline' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'chest_isolation', role: 'isolation', variant: 'cable' },
        ],
      },
      {
        name: 'Back',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'back_isolation', role: 'isolation' },
        ],
      },
      {
        name: 'Shoulders + Arms',
        dayType: 'lifting',
        slots: [
          { category: 'vertical_push', role: 'primary_compound' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ],
      },
      {
        name: 'Legs',
        dayType: 'lifting',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'glute_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
        ],
      },
      {
        name: 'Arms + Weak Points',
        dayType: 'lifting',
        slots: [
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ],
      },
    ],
  },

  powerlifting: {
    daysPerCycle: 3,
    days: [
      {
        name: 'Squat Day',
        dayType: 'lifting',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'squat', role: 'secondary_compound', variant: 'variation' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'quad_isolation', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ],
      },
      {
        name: 'Bench Day',
        dayType: 'lifting',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'secondary_compound', variant: 'variation' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
        ],
      },
      {
        name: 'Deadlift Day',
        dayType: 'lifting',
        slots: [
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'secondary_compound', variant: 'variation' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'back_isolation', role: 'isolation' },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Split Suggestion Engine
// ---------------------------------------------------------------------------

interface SplitScore {
  split: Exclude<Split, 'auto'>;
  score: number;
  reason: string;
  warnings: string[];
}

/** Rank splits by suitability. Returns top 3. */
export function suggestSplits(
  daysPerWeek: number,
  goal: PrimaryGoal,
  _experience: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): SplitScore[] {
  const scores: SplitScore[] = [];

  const allSplits: Exclude<Split, 'auto'>[] = [
    'full_body', 'upper_lower', 'push_pull_legs', 'push_pull', 'bro_split', 'powerlifting',
  ];

  for (const split of allSplits) {
    const def = SPLIT_DEFINITIONS[split];
    let score = 0;
    const warnings: string[] = [];
    let reason = '';

    // Frequency fit: how well does this split's cycle match the available days?
    const cyclesPerWeek = daysPerWeek / def.daysPerCycle;

    if (cyclesPerWeek >= 1 && cyclesPerWeek <= 3) {
      score += 30; // good frequency match
    } else if (cyclesPerWeek >= 0.5) {
      score += 15; // workable but not ideal
    } else {
      score += 0;
      warnings.push(`${split} needs ${def.daysPerCycle}+ days per cycle. With ${daysPerWeek} days you won't complete a full rotation each week.`);
    }

    // Perfect matches get a bonus
    if (daysPerWeek === 2 && (split === 'full_body' || split === 'upper_lower')) {
      score += 20;
      reason = `Great match for ${daysPerWeek} training days.`;
    }
    if (daysPerWeek === 3 && (split === 'full_body' || split === 'push_pull_legs')) {
      score += 20;
      reason = `Clean ${daysPerWeek}-day rotation.`;
    }
    if (daysPerWeek === 4 && split === 'upper_lower') {
      score += 25;
      reason = 'Upper/Lower x2 per week — optimal 4-day setup.';
    }
    if (daysPerWeek === 5 && (split === 'push_pull_legs' || split === 'upper_lower')) {
      score += 20;
      reason = `Solid ${daysPerWeek}-day frequency.`;
    }
    if (daysPerWeek === 6 && split === 'push_pull_legs') {
      score += 25;
      reason = 'PPL x2 — each muscle hit twice per week.';
    }

    // Goal biases
    if (goal === 'powerlifting' && split === 'powerlifting') {
      score += 30;
      reason = 'SBD-focused days for meet prep.';
    }
    if (goal === 'powerlifting' && split !== 'powerlifting') {
      score -= 10;
    }
    if ((goal === 'strength') && (split === 'upper_lower' || split === 'full_body')) {
      score += 15;
      reason = reason || 'Higher frequency per muscle for strength gains.';
    }
    if (goal === 'hypertrophy' && (split === 'push_pull_legs' || split === 'bro_split')) {
      score += 15;
      reason = reason || 'Higher volume per session for muscle growth.';
    }
    if ((goal === 'fat_loss' || goal === 'recomp') && (split === 'full_body' || split === 'upper_lower')) {
      score += 10;
      reason = reason || 'Higher frequency burns more calories and maintains muscle.';
    }
    if (goal === 'physique' && (split === 'push_pull_legs' || split === 'bro_split')) {
      score += 15;
      reason = reason || 'Allows targeted volume per muscle group.';
    }
    if (goal === 'general' && split === 'full_body') {
      score += 10;
      reason = reason || 'Balanced full-body approach.';
    }

    // Feasibility warnings
    if (daysPerWeek === 2 && split === 'push_pull_legs') {
      warnings.push('PPL needs 3+ days. With 2 days each pattern is hit once every ~10 days.');
    }
    if (daysPerWeek === 2 && split === 'bro_split') {
      warnings.push('Bro split needs 4-5+ days to hit each muscle group weekly.');
    }
    if (daysPerWeek >= 6 && split === 'full_body') {
      warnings.push('Full body 6x/week is very high fatigue. Consider PPL for better recovery.');
    }
    if (daysPerWeek <= 3 && split === 'bro_split') {
      warnings.push('Bro split with 3 or fewer days means some muscle groups only get hit every 10+ days.');
    }

    if (!reason) {
      reason = `${split.replace(/_/g, ' ')} with ${daysPerWeek} days/week.`;
    }

    scores.push({ split, score, reason, warnings });
  }

  // Sort descending by score, return top 3
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3);
}

/** Validate a user-selected split and return warnings (never blocks). */
export function validateSplit(
  split: Exclude<Split, 'auto'>,
  daysPerWeek: number,
  experience: string,
): string[] {
  const warnings: string[] = [];
  const def = SPLIT_DEFINITIONS[split];
  const cyclesPerWeek = daysPerWeek / def.daysPerCycle;

  if (cyclesPerWeek < 1) {
    if (split === 'bro_split') {
      warnings.push(
        `Bro split is a ${def.daysPerCycle}-day cycle. With ${daysPerWeek} training days, some muscle groups will only be hit every ${Math.ceil(def.daysPerCycle / daysPerWeek * 7)} days. Consider upper/lower or full body for more balanced frequency.`
      );
    } else {
      warnings.push(
        `You have ${daysPerWeek} training days but ${split.replace(/_/g, ' ')} has a ${def.daysPerCycle}-day cycle. ` +
        `You won't complete a full rotation each week, but it can still work with rotating days.`
      );
    }
  }

  if (experience === 'beginner' && split === 'bro_split') {
    warnings.push(
      'Bro splits work at any level, but beginners often progress faster with higher frequency per muscle (full body or upper/lower).'
    );
  }

  if (daysPerWeek >= 6 && split === 'full_body') {
    warnings.push(
      'Full body 6x/week creates high cumulative fatigue. Make sure recovery (sleep, nutrition) supports this.'
    );
  }

  return warnings;
}
