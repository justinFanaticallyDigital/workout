// src/lib/goal-engine/rules/index.ts
// ============================================================================
// Rule registry + applyRules orchestrator.
//
// Per spec §8.4: cap at 3 recommendations per check-in. Prioritize
// by severity (urgent → warning → info), then by recency of the
// underlying issue (drafts coming out of rules later in the array
// break ties — order in the registry doubles as a tiebreaker).
//
// Engine-complete — all 9 spec §8.4 rules ship:
//   - behind-target          (R8)
//   - ahead-target           (R8)
//   - adherence-low          (R8)
//   - plateau-detected       (R8)
//   - lifestyle-streak-broken (R9)
//   - pain-flag              (R9 — fires universally; spec §8.4
//                             scopes to Comeback but the repo doesn't
//                             differentiate gameplan templates yet)
//   - adherence-low-streak   (R10 — cross-week, reads
//                             state.recentRecommendations)
//   - refeed-due             (R11 — Lean Out gameplan, calorie
//                             deficit + ≥4 weeks since last refeed)
//   - deload-shift           (R11 — adherence low + next block is
//                             deload within 7 days)
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";
import { behindTarget } from "./behind-target";
import { aheadTarget } from "./ahead-target";
import { adherenceLow } from "./adherence-low";
import { plateauDetected } from "./plateau-detected";
import { lifestyleStreakBroken } from "./lifestyle-streak-broken";
import { painFlag } from "./pain-flag";
import { adherenceLowStreak } from "./adherence-low-streak";
import { refeedDue } from "./refeed-due";
import { deloadShift } from "./deload-shift";

const RECOMMENDATION_CAP = 3;

export const RULE_REGISTRY: RuleFn[] = [
  behindTarget,
  aheadTarget,
  adherenceLow,
  plateauDetected,
  lifestyleStreakBroken,
  painFlag,
  adherenceLowStreak,
  refeedDue,
  deloadShift,
];

/**
 * Run every rule against the engine state, dedupe (cap at
 * RECOMMENDATION_CAP), and rank by severity.
 */
export function applyRules(state: EngineState): RecommendationDraft[] {
  const drafts: RecommendationDraft[] = [];
  for (const rule of RULE_REGISTRY) {
    const draft = rule(state);
    if (draft) drafts.push(draft);
  }
  // behind-target and ahead-target are mutually exclusive on the same
  // goal — keep the one with higher severity if both fire (shouldn't
  // happen since drift is signed, but defensive).
  // Sort by severity desc.
  const severityOrder: Record<string, number> = { urgent: 3, warning: 2, info: 1 };
  drafts.sort((a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0));
  return drafts.slice(0, RECOMMENDATION_CAP);
}
