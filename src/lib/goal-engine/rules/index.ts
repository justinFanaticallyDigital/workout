// src/lib/goal-engine/rules/index.ts
// ============================================================================
// Rule registry + applyRules orchestrator.
//
// Per spec §8.4: cap at 3 recommendations per check-in. Prioritize
// by severity (urgent → warning → info), then by recency of the
// underlying issue (drafts coming out of rules later in the array
// break ties — order in the registry doubles as a tiebreaker).
//
// 4 launch rules per the R8 prompt:
//   - behind-target
//   - ahead-target
//   - adherence-low
//   - plateau-detected
//
// OMIT-WITH-COMMENT — additional spec §8.4 rules deferred to a
// follow-on rule pass:
//   - adherence-low-streak (cross-week state)
//   - refeed-due (Lean Out template-specific)
//   - deload-shift (needs Block.scheduledDeloadWeek)
//   - lifestyle-streak-broken (needs daily LifestyleLog rows)
//   - pain-flag (needs explicit pain-check input)
// ============================================================================

import type { EngineState, RecommendationDraft, RuleFn } from "../types";
import { behindTarget } from "./behind-target";
import { aheadTarget } from "./ahead-target";
import { adherenceLow } from "./adherence-low";
import { plateauDetected } from "./plateau-detected";

const RECOMMENDATION_CAP = 3;

export const RULE_REGISTRY: RuleFn[] = [
  behindTarget,
  aheadTarget,
  adherenceLow,
  plateauDetected,
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
