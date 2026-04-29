"use client";

import { useEffect, useState } from "react";
import {
  Stamp,
  Chip,
  FilterChip,
  MovementTag,
  DifficultyBars,
  DaysDots,
  WeeksBar,
  StepHeader,
  PickerHeading,
  PickerButton,
  CornerStamp,
  PickerCard,
} from "./PickerPrimitives";
import { DisciplineIcon, type DisciplineKind } from "./icons";
import { CalorieScale } from "./CalorieScale";
import { BodyWeightChart } from "./BodyWeightChart";
import { FieldRow, NumInput } from "./FieldRow";
import type { PickerPlan } from "./derive";

/* ─── Filter spec ──────────────────────────────────────────────── */

export type FilterKey = "goal" | "experience" | "daysPerWeek" | "equipment";
export type Filters = Partial<Record<FilterKey, string>>;

export const FILTER_GROUPS: {
  key: FilterKey;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "goal",
    label: "Primary goal",
    options: [
      { value: "hypertrophy", label: "Build muscle" },
      { value: "strength", label: "Get stronger" },
      { value: "fat_loss", label: "Lose fat" },
      { value: "athletic", label: "Move better" },
      { value: "general", label: "Stay healthy" },
      { value: "powerlifting", label: "Compete" },
    ],
  },
  {
    key: "experience",
    label: "Experience",
    options: [
      { value: "beginner", label: "New" },
      { value: "intermediate", label: "1+ year" },
      { value: "advanced", label: "3+ years" },
    ],
  },
  {
    key: "daysPerWeek",
    label: "Days / week",
    options: [
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
    ],
  },
  {
    key: "equipment",
    label: "Equipment",
    options: [
      { value: "home", label: "Home" },
      { value: "limited_gym", label: "Limited gym" },
      { value: "full_gym", label: "Full gym" },
    ],
  },
];

/* ─── Step 1 — Welcome ─────────────────────────────────────────── */

export function Step1Welcome({ onPick, onSkip }: { onPick: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-6 pt-14 pb-7 relative">
      <Stamp className="mb-9 self-start">FITTRACK · NEW MEMBER</Stamp>
      <PickerHeading kicker="STEP 01" variant={1}>
        Pick your
        <br />
        Gameplan.
      </PickerHeading>
      <p className="font-body text-[15px] leading-relaxed text-ft-light mt-3">
        A Gameplan is your training, nutrition, and lifestyle in one editable plan.
      </p>

      <div className="flex-1" />

      {/* Stenciled-schedule-sheet placeholder ornament — verbatim port of
          picker-screens.jsx#Step1Welcome lines 526–552. The triangle
          wedge + G/P stencil text is intentionally decorative; on iron
          chrome it picks up Stardos Stencil for the G/P glyph. */}
      <div className="my-8 -mx-6 px-6 py-7 border-y border-dashed border-ft-border flex items-center justify-between gap-4">
        <div>
          <Stamp className="block mb-2">CONTAINS</Stamp>
          <span className="font-data tabular-nums text-2xl text-ft-white">03</span>
          <span className="font-body text-[11px] uppercase tracking-[0.1em] text-ft-light ml-2">COMPONENTS</span>
          <div className="mt-1.5 font-body text-[13px] text-ft-white">Training · Nutrition · Lifestyle</div>
        </div>
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 text-ft-accent">
          <polygon points="32,4 60,56 4,56" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          <line x1="32" y1="4" x2="32" y2="56" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontSize="14"
            fill="currentColor"
            className="font-display"
          >
            G/P
          </text>
        </svg>
      </div>

      <PickerButton variant="primary" full onClick={onPick}>
        Pick a Gameplan
      </PickerButton>
      <PickerButton variant="ghost" full onClick={onSkip} className="mt-2">
        Skip — just let me log
      </PickerButton>
      <div className="mt-3.5 text-center font-body text-[11px] text-ft-dim">
        You can pick one later from the Programs tab.
      </div>

      <CornerStamp />
    </div>
  );
}

/* ─── Step 2 — Filter ──────────────────────────────────────────── */

export function Step2Filter({
  filters,
  setFilter,
  onContinue,
  onSkip,
  onBack,
}: {
  filters: Filters;
  setFilter: (key: FilterKey, value: string | undefined) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5 pb-5 relative">
      <StepHeader step={2} onBack={onBack} onSkip={onSkip} />
      <PickerHeading variant={2}>Help us narrow it down.</PickerHeading>

      <div className="flex-1 flex flex-col gap-4 mt-2">
        {FILTER_GROUPS.map((g) => (
          <div key={g.key}>
            <div className="font-body text-[10px] uppercase tracking-[0.25em] text-ft-dim border-b border-dashed border-ft-border pb-1 mb-2">
              {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map((opt) => {
                const active = filters[g.key] === opt.value;
                return (
                  <Chip
                    key={opt.value}
                    active={active}
                    onClick={() => setFilter(g.key, active ? undefined : opt.value)}
                  >
                    {opt.label}
                  </Chip>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <PickerButton variant="primary" full onClick={onContinue} className="mt-4">
        Show me Gameplans →
      </PickerButton>

      <CornerStamp />
    </div>
  );
}

/* ─── Step 3 — List ────────────────────────────────────────────── */

function PlanCard({
  plan,
  onPick,
}: {
  plan: PickerPlan;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className="w-full text-left transition-colors hover:[&_.ft-card]:border-ft-accent"
    >
      <PickerCard
        padding={14}
        style={{ paddingTop: 14, paddingBottom: 12 }}
      >
        {plan.bestFit && (
          <div className="absolute top-2 right-2 font-body text-[9px] tracking-[0.2em] uppercase text-ft-accent">
            BEST FIT
          </div>
        )}
        <div className="font-display text-lg text-ft-white tracking-wide mb-0.5">{plan.name}</div>
        <div className="font-body text-xs text-ft-light mb-2.5">{plan.description}</div>

        <div className="pt-2.5 border-t border-dashed border-ft-border">
          <div className="flex justify-between items-baseline mb-1.5">
            <Stamp>FREQUENCY · PER WEEK</Stamp>
            <div className="flex items-center gap-1.5">
              <span className="font-data tabular-nums text-sm text-ft-white">{plan.durationWeeks}</span>
              <span className="font-body text-[8px] uppercase tracking-[0.18em] text-ft-dim">WK</span>
              <span className="w-px h-2.5 bg-ft-border mx-1" />
              <DifficultyBars level={plan.difficulty} />
            </div>
          </div>
          <FrequencyRow plan={plan} />
        </div>

        <div className="flex gap-1 flex-wrap mt-2.5 pt-2 border-t border-dashed border-ft-border">
          {plan.tags.map((t) => (
            <MovementTag key={t.label} kind={t.kind}>
              {t.label}
            </MovementTag>
          ))}
        </div>
      </PickerCard>
    </button>
  );
}

/**
 * FrequencyRow — extended port of picker-screens.jsx#FrequencyRow
 * (lines 282–375). Each discipline row renders:
 *   - tracked-out label (LIFT / CARDIO / COND)
 *   - tabular-num count (e.g. "3" or "3–4")
 *   - **repeating DisciplineIcon** glyphs: solid = guaranteed (lo),
 *     outline = optional (lo+1 .. hi)
 * Right column shows nutrition + mobility flags when set.
 */
function FrequencyRow({ plan }: { plan: PickerPlan }) {
  const fmt = (v: number | [number, number]) =>
    Array.isArray(v) ? (v[0] === v[1] ? `${v[0]}` : `${v[0]}–${v[1]}`) : `${v}`;
  const lo = (v: number | [number, number]) => (Array.isArray(v) ? v[0] : v);
  const hi = (v: number | [number, number]) => (Array.isArray(v) ? v[1] : v);
  const items: { label: string; kind: DisciplineKind; val: number | [number, number] }[] = [
    { label: "LIFT", kind: "lift", val: plan.freq.lift },
    { label: "CARDIO", kind: "cardio", val: plan.freq.cardio },
    { label: "COND", kind: "cond", val: plan.freq.cond },
  ];
  const ICON = 13;

  return (
    <div className="flex gap-3.5 items-start">
      <div className="flex-1 flex flex-col gap-1.5">
        {items.map((it) => {
          const dim = it.val === 0 || (Array.isArray(it.val) && it.val[1] === 0);
          const lowVal = lo(it.val);
          const hiVal = hi(it.val);
          return (
            <div
              key={it.label}
              className={`grid grid-cols-[54px_30px_1fr] items-center gap-2 ${dim ? "opacity-40" : ""}`}
            >
              <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-dim">{it.label}</div>
              <div className="flex items-baseline gap-px justify-end">
                <span className={`font-data tabular-nums text-sm leading-none ${dim ? "text-ft-dim" : "text-ft-white"}`}>
                  {fmt(it.val)}
                </span>
                <span className="font-body text-[8px] uppercase tracking-[0.1em] text-ft-dim">×</span>
              </div>
              <div className="flex gap-[3px] items-center">
                {hiVal === 0 ? (
                  <span className="font-body text-[9px] tracking-[0.15em] text-ft-border">—</span>
                ) : (
                  Array.from({ length: Math.max(hiVal, 1) }, (_, i) => {
                    const guaranteed = i < lowVal;
                    const optional = i >= lowVal && i < hiVal;
                    if (!guaranteed && !optional) return null;
                    return (
                      <span
                        key={i}
                        style={{
                          color: guaranteed
                            ? "rgb(var(--ft-accent))"
                            : "rgb(var(--ft-accent) / 0.4)",
                          display: "inline-flex",
                        }}
                      >
                        <DisciplineIcon kind={it.kind} size={ICON} />
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      {(plan.freq.nutrition || plan.freq.mobility) && (
        <div className="flex flex-col gap-1.5 pl-3 border-l border-dashed border-ft-border self-stretch">
          {plan.freq.nutrition && (
            <div className="flex items-center gap-1.5">
              <span style={{ color: "rgb(var(--ft-accent))", display: "inline-flex" }}>
                <DisciplineIcon kind="nutrition" size={ICON} />
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-accent">NUTR</span>
            </div>
          )}
          {plan.freq.mobility && (
            <div className="flex items-center gap-1.5">
              <span style={{ color: "rgb(var(--ft-accent))", display: "inline-flex" }}>
                <DisciplineIcon kind="mobility" size={ICON} />
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-accent">MOB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Step3List({
  plans,
  filters,
  filtersBypassed,
  closestFit,
  onPickPlan,
  onClearFilter,
  onBack,
}: {
  plans: PickerPlan[];
  filters: Filters;
  filtersBypassed: boolean;
  /** When `plans` is empty after filtering, this is the single closest
   *  match drawn from the full template list — surfaces the prototype's
   *  "STATE — Empty filter result" closest-fit recovery flow. */
  closestFit?: PickerPlan | null;
  onPickPlan: (id: string) => void;
  onClearFilter: (key: FilterKey) => void;
  onBack: () => void;
}) {
  const activeFilters = (Object.entries(filters) as [FilterKey, string | undefined][])
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ({ key: k, label: filterLabel(k, v!) }));

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5 relative">
      <StepHeader
        step={3}
        onBack={onBack}
        trailingLabel={
          plans.length === 0 && closestFit
            ? "NO EXACT MATCH"
            : filtersBypassed
            ? `ALL ${plans.length} GAMEPLAN${plans.length === 1 ? "" : "S"}`
            : `${plans.length} GAMEPLAN${plans.length === 1 ? "" : "S"}`
        }
      />
      <PickerHeading variant={plans.length === 0 && closestFit ? 2 : filtersBypassed ? 5 : 4}>
        {plans.length === 0 && closestFit
          ? "Closest fit."
          : filtersBypassed
          ? "Pick a Gameplan."
          : "Closest fits."}
      </PickerHeading>
      {filtersBypassed && (
        <div className="font-body text-[11px] text-ft-dim mt-0.5 mb-2">
          Filter skipped · showing all
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 mb-3">
          {activeFilters.map((f) => (
            <FilterChip key={f.key} onRemove={() => onClearFilter(f.key)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      )}

      {plans.length === 0 ? (
        <ClosestFitFallback
          activeFilters={activeFilters}
          closestFit={closestFit}
          onPickPlan={onPickPlan}
          onBack={onBack}
        />
      ) : filtersBypassed ? (
        <div className="flex-1 overflow-auto pb-4 flex flex-col gap-1.5">
          {plans.map((p) => (
            <CompactPlanRow key={p.id} plan={p} onPick={() => onPickPlan(p.id)} />
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-auto pb-4 flex flex-col gap-2.5">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onPick={() => onPickPlan(p.id)} />
          ))}
        </div>
      )}
      <CornerStamp />
    </div>
  );
}

/**
 * Empty-result recovery — verbatim port of picker-screens.jsx
 * #StateEmptyFilter (lines 1259–1303). Renders a danger-tinted
 * advisory banner + a single closest-fit PlanCard + broaden-filter
 * link. Closest fit is sourced from the full template list when no
 * filtered results match (set by parent via `closestFit` prop).
 */
function ClosestFitFallback({
  activeFilters,
  closestFit,
  onPickPlan,
  onBack,
}: {
  activeFilters: { key: FilterKey; label: string }[];
  closestFit: PickerPlan | null | undefined;
  onPickPlan: (id: string) => void;
  onBack: () => void;
}) {
  const reason =
    activeFilters.length === 0
      ? "No Gameplans available right now."
      : `${activeFilters.map((f) => f.label).join(" + ")} is too restrictive. Try broadening one of the filters above${closestFit ? ", or pick the closest fit below." : "."}`;
  return (
    <div className="flex-1 flex flex-col">
      <div className="border border-dashed border-ft-danger/60 bg-ft-danger/5 p-4 mt-2">
        <Stamp className="text-ft-danger">NO MATCH</Stamp>
        <div className="font-body text-xs text-ft-white mt-2 leading-relaxed">{reason}</div>
      </div>

      {closestFit && (
        <>
          <Stamp className="mt-4 mb-2 block">CLOSEST FIT</Stamp>
          <PlanCard plan={closestFit} onPick={() => onPickPlan(closestFit.id)} />
        </>
      )}

      <button
        onClick={onBack}
        className="mt-4 mb-4 py-2.5 self-stretch text-center font-body text-[12px] uppercase tracking-[0.1em] text-ft-accent border-t border-dashed border-ft-border"
      >
        ← Broaden filter
      </button>
    </div>
  );
}

/**
 * Compact one-line plan row — verbatim port of picker-screens.jsx
 * #StateFilterSkipped row body (lines 1326–1346). Used when the user
 * skipped the filter and we render all templates as a dense list.
 */
function CompactPlanRow({ plan, onPick }: { plan: PickerPlan; onPick: () => void }) {
  return (
    <button onClick={onPick} className="w-full text-left">
      <PickerCard padding={10} style={{ paddingTop: 8, paddingBottom: 10 }}>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="flex-1 font-display text-sm text-ft-white tracking-wide">{plan.name}</div>
          <DifficultyBars level={plan.difficulty} />
          <span className="text-ft-accent text-base leading-none">›</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <WeeksBar weeks={plan.durationWeeks} blocks={plan.blocks} height={5} showLabel={false} />
          </div>
          <DaysDots pattern={plan.pattern} compact />
        </div>
      </PickerCard>
    </button>
  );
}

function filterLabel(key: FilterKey, value: string): string {
  const group = FILTER_GROUPS.find((g) => g.key === key);
  const opt = group?.options.find((o) => o.value === value);
  if (key === "daysPerWeek") return `${value} D/WK`;
  return (opt?.label ?? value).toUpperCase();
}

/* ─── Step 4 — Preview ─────────────────────────────────────────── */

/**
 * R6 — LifestyleTarget row passed to LifestylePicksCard. Subset of
 * the Prisma LifestyleTarget model.
 */
export interface LifestyleTargetRow {
  key: string;
  value: number;
  unit: string;
  comparator: "gte" | "lte" | "eq";
}

function formatComparator(c: "gte" | "lte" | "eq"): string {
  return c === "gte" ? "≥" : c === "lte" ? "≤" : "=";
}

export function Step4Preview({
  plan,
  blueprint,
  loading,
  error,
  maintenanceCalories,
  lifestyleTargets,
  onConfirm,
  onPickAnother,
  onBack,
}: {
  plan: PickerPlan;
  blueprint: PreviewBlueprint | null;
  loading: boolean;
  error: string | null;
  /** R6 — User.maintenanceCalories from /api/profile. null when unset. */
  maintenanceCalories: number | null;
  /** R6 — LifestyleTarget rows from /api/lifestyle-targets. */
  lifestyleTargets: LifestyleTargetRow[];
  onConfirm: () => void;
  onPickAnother: () => void;
  onBack: () => void;
}) {
  const blocks = blueprint?.blocks ?? [];
  const wkPattern = plan.pattern;

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5 relative">
      <StepHeader step={4} onBack={onBack} />
      <PickerHeading variant={5}>{plan.name}</PickerHeading>
      <p className="font-body text-[13px] text-ft-light m-0">{plan.description}</p>

      <div className="grid grid-cols-[1fr_auto_auto] gap-3.5 items-end mt-3 pb-3 border-b border-dashed border-ft-border">
        <div>
          <Stamp className="mb-1 block">
            {plan.durationWeeks} WEEKS · {blocks.length || Math.ceil(plan.durationWeeks / 4)} BLOCKS
          </Stamp>
          <WeeksBar weeks={plan.durationWeeks} blocks={plan.blocks} height={8} showLabel={false} />
        </div>
        <div>
          <Stamp className="mb-1 block">{plan.daysPerWeek} D/WK</Stamp>
          <DaysDots pattern={wkPattern} compact />
        </div>
        <div>
          <Stamp className="mb-1 block">DIFF</Stamp>
          <DifficultyBars level={plan.difficulty} />
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-ft-dim font-body text-sm">
          Loading preview…
        </div>
      )}

      {error && !loading && (
        <div className="border border-dashed border-ft-warn/60 bg-ft-warn/5 p-4 mt-4">
          <Stamp className="text-ft-warn">PREVIEW UNAVAILABLE</Stamp>
          <div className="font-body text-xs text-ft-white mt-2">
            We couldn&apos;t pre-render the schedule. You can still start the program — the engine generates everything when you confirm.
          </div>
        </div>
      )}

      {blueprint && !loading && (
        <div className="flex-1 mt-4 flex flex-col gap-3">
          <BlockCalendar blueprint={blueprint} />
          <SampleWeek blueprint={blueprint} />
          <NutritionCard
            blueprint={blueprint}
            plan={plan}
            maintenanceCalories={maintenanceCalories}
          />
          <LifestylePicksCard plan={plan} lifestyleTargets={lifestyleTargets} />
          <GoalsToGenerateCard blueprint={blueprint} plan={plan} />
          {blueprint.warnings && blueprint.warnings.length > 0 && (
            <div className="border border-dashed border-ft-warn/60 bg-ft-warn/5 p-3">
              <Stamp className="text-ft-warn">HEADS UP</Stamp>
              <ul className="font-body text-xs text-ft-light mt-2 list-disc pl-5 space-y-1">
                {blueprint.warnings.slice(0, 3).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 mt-4 border-t border-dashed border-ft-border pb-5">
        <PickerButton variant="primary" full onClick={onConfirm}>
          Customize and start →
        </PickerButton>
        <PickerButton variant="ghost" full onClick={onPickAnother} className="mt-1.5">
          Pick another
        </PickerButton>
      </div>
      <CornerStamp />
    </div>
  );
}

/**
 * NUTRITION card — port of picker-screens.jsx Step4 lines 928–945.
 * Renders the calorie scale with a delta-vs-maintenance estimate
 * derived from the engine blueprint.
 *
 * Reads `User.maintenanceCalories` from `/api/profile` (R6 schema
 * landing) when set; falls back to a 2400 kcal generic baseline when
 * the user hasn't entered their TDEE yet. The baseline-fallback
 * bypass is acceptable because the picker's own goal flow doesn't
 * yet collect TDEE — that's a Settings entry point.
 */
function NutritionCard({
  blueprint,
  plan,
  maintenanceCalories,
}: {
  blueprint: PreviewBlueprint;
  plan: PickerPlan;
  /** R6 — user's stored TDEE; null when Settings hasn't been filled in. */
  maintenanceCalories: number | null;
}) {
  const cals = blueprint.nutritionTargets?.calories;
  if (!cals) return null;
  const baseline = maintenanceCalories ?? 2400;
  const delta = Math.round(cals - baseline);
  // Range estimate: ±100 around the projected delta to show the band.
  const range: [number, number] = [delta - 100, delta + 100];
  return (
    <PickerCard padding={12} style={{ paddingTop: 12 }}>
      <div className="flex justify-between items-baseline mb-0.5 pt-1">
        <Stamp className="text-ft-accent">NUTRITION</Stamp>
        <span className="font-body text-[10px] text-ft-dim uppercase tracking-[0.1em]">
          vs maintenance
        </span>
      </div>
      <CalorieScale delta={delta} range={range} />
      <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-ft-border-faint font-body text-[11px] text-ft-white">
        <span>~{plan.freq.nutrition ? "1 g protein / lb" : "macros: optional"}</span>
        <span className="text-ft-dim">·</span>
        <span>{plan.freq.nutrition ? "Macros tracked" : "Untracked"}</span>
      </div>
    </PickerCard>
  );
}

/**
 * LIFESTYLE PICKS card — port of Step4 lines 947–955.
 *
 * Renders the user's stored `LifestyleTarget` rows (R6 schema
 * landing). Falls back to template-tag-derived picks when the user
 * hasn't set targets yet — keeps the card useful for first-time
 * picker users before they've configured Settings. Once a user has
 * any LifestyleTarget rows, those override the tag-derived picks.
 */
function LifestylePicksCard({
  plan,
  lifestyleTargets,
}: {
  plan: PickerPlan;
  /** R6 — user's stored lifestyle targets; empty when not yet set. */
  lifestyleTargets: LifestyleTargetRow[];
}) {
  const picks: { kind: "push" | "pull" | "legs" | "core" | "accent"; label: string }[] = [];

  // Prefer user's stored targets when present.
  for (const t of lifestyleTargets) {
    if (t.key === "sleep_hours_min") {
      picks.push({ kind: "pull", label: `SLEEP · ${formatComparator(t.comparator)} ${t.value}h` });
    } else if (t.key === "stress_max") {
      picks.push({ kind: "push", label: `STRESS · ${formatComparator(t.comparator)} ${t.value}` });
    } else if (t.key === "protein_g") {
      picks.push({ kind: "core", label: `PROTEIN · ${formatComparator(t.comparator)} ${Math.round(t.value)}g` });
    } else if (t.key === "protein_g_per_lb") {
      picks.push({ kind: "core", label: `PROTEIN · ${formatComparator(t.comparator)} ${t.value}g/lb` });
    }
  }

  // Fallback to tag-derived picks when no user targets are set.
  if (picks.length === 0) {
    const tags = plan.raw.tags;
    if (tags.some((t) => ["recovery", "longevity", "any-level"].includes(t))) {
      picks.push({ kind: "pull", label: "SLEEP · 7+ H" });
    }
    if (tags.some((t) => ["strength", "powerlifting", "advanced"].includes(t))) {
      picks.push({ kind: "push", label: "STRESS · ≤3" });
    }
    if (tags.some((t) => ["cut", "fat-loss", "physique", "bikini", "hypertrophy"].includes(t))) {
      picks.push({ kind: "core", label: "PROTEIN · 1g/lb" });
    }
  }
  if (picks.length === 0) {
    picks.push({ kind: "accent", label: "BALANCED" });
  }
  return (
    <PickerCard padding={12} style={{ paddingTop: 12 }}>
      <Stamp className="text-ft-accent block mb-1.5">LIFESTYLE PICKS</Stamp>
      <div className="flex gap-1.5 flex-wrap">
        {picks.map((p) => (
          <MovementTag key={p.label} kind={p.kind}>
            {p.label}
          </MovementTag>
        ))}
      </div>
    </PickerCard>
  );
}

/**
 * GOALS IT'LL GENERATE card — port of Step4 lines 957–968.
 *
 * Renders a vertical accent-bordered list of metric targets the engine
 * persists when the program is generated (`/api/programs/generate`
 * already writes these to ProgramBenchmark). The engine populates
 * `blueprint.metricTargets` based on goal/duration/experience.
 */
function GoalsToGenerateCard({
  blueprint,
  plan,
}: {
  blueprint: PreviewBlueprint;
  plan: PickerPlan;
}) {
  const targets = (blueprint as PreviewBlueprint & { metricTargets?: { metricKey: string; targetValue: number; unit: string }[] }).metricTargets;
  // Fallback to a derived list when the engine doesn't return targets.
  const lines = targets?.length
    ? targets.map((t) => `${humanMetric(t.metricKey)} · ${t.targetValue} ${t.unit} · ${plan.durationWeeks} wk`)
    : [
        `Sessions completed · ${plan.durationWeeks * plan.daysPerWeek} of ${plan.durationWeeks * plan.daysPerWeek}`,
        `Body weight · trend over ${plan.durationWeeks} wk`,
      ];
  return (
    <PickerCard padding={12} style={{ paddingTop: 12, marginBottom: 4 }}>
      <Stamp className="text-ft-accent block mb-1.5">GOALS IT&apos;LL GENERATE</Stamp>
      <div className="flex flex-col gap-1">
        {lines.slice(0, 4).map((g, i) => (
          <div
            key={i}
            className="font-body text-xs text-ft-white pl-2.5"
            style={{ borderLeft: "2px solid rgb(var(--ft-accent))" }}
          >
            {g}
          </div>
        ))}
      </div>
    </PickerCard>
  );
}

function humanMetric(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface PreviewBlueprint {
  name?: string;
  durationWeeks?: number;
  blocks: Array<{
    name: string;
    blockNumber: number;
    durationWeeks: number;
    phase?: string | null;
    days: Array<{
      name: string;
      dayNumber: number;
      dayType: string;
      slots?: Array<{ category: string }>;
    }>;
  }>;
  warnings?: string[];
  /** Engine-derived nutrition macros (Step4 NutritionCard reads). */
  nutritionTargets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  /** Engine-derived metric targets (Step4 GoalsToGenerateCard reads). */
  metricTargets?: Array<{
    metricKey: string;
    targetValue: number;
    unit: string;
  }>;
}

function phaseColor(phase?: string | null): string {
  switch (phase) {
    case "accumulation":
      return "rgb(var(--ft-pull))";
    case "intensification":
      return "rgb(var(--ft-push))";
    case "peaking":
    case "peak_week":
      return "rgb(var(--ft-legs))";
    case "deload":
      return "rgb(var(--ft-core))";
    default:
      return "rgb(var(--ft-accent))";
  }
}

function BlockCalendar({ blueprint }: { blueprint: PreviewBlueprint }) {
  const blocks = blueprint.blocks;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <Stamp>BLOCK CALENDAR</Stamp>
        <Stamp>1 CELL = 1 WEEK</Stamp>
      </div>
      <div className="flex gap-2.5 flex-wrap mb-1.5">
        {Array.from(new Map(blocks.map((b) => [b.name, b])).values()).map((b) => (
          <div key={b.name} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5" style={{ background: phaseColor(b.phase) }} />
            <span className="font-body text-[9px] uppercase tracking-[0.18em] text-ft-light">{b.name}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {blocks.map((b) => {
          const color = phaseColor(b.phase);
          return (
            <div key={b.blockNumber} className="grid grid-cols-[88px_1fr] gap-1 items-center">
              <div className="pr-2 border-r border-dashed border-ft-border/60">
                <div className="font-display text-xs text-ft-white tracking-wide leading-none">{b.name}</div>
                <div
                  className="font-body text-[8px] uppercase tracking-[0.2em] mt-1"
                  style={{ color }}
                >
                  {b.durationWeeks} WK · {b.phase ?? "—"}
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: b.durationWeeks }).map((_, w) => {
                  const isDeload = w === b.durationWeeks - 1 && b.phase !== "deload" && b.durationWeeks >= 4;
                  return (
                    <div
                      key={w}
                      className="aspect-square flex-1 flex flex-col items-center justify-center border"
                      style={{
                        background: `${color}26`,
                        borderColor: `${color}aa`,
                        borderTop: `3px solid ${color}`,
                      }}
                    >
                      <span className="font-data text-sm text-ft-white leading-none">{w + 1}</span>
                      {isDeload && (
                        <span
                          className="font-body text-[7px] uppercase tracking-[0.18em] mt-0.5"
                          style={{ color }}
                        >
                          DELOAD
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SampleWeek({ blueprint }: { blueprint: PreviewBlueprint }) {
  const firstBlock = blueprint.blocks[0];
  if (!firstBlock) return null;
  const days = firstBlock.days;
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  // Fill 7-day grid: training days from blueprint, rest days as gaps
  const dayCount = days.length;
  const trainingMask = patternMaskFor(dayCount);
  let trainIdx = 0;

  return (
    <div>
      <Stamp className="mb-1.5 block">SAMPLE WEEK · BLOCK 1</Stamp>
      <div className="grid grid-cols-7 gap-1">
        {labels.map((label, i) => {
          const isTraining = trainingMask[i] === 1 && trainIdx < dayCount;
          const day = isTraining ? days[trainIdx] : null;
          if (isTraining) trainIdx += 1;
          const color = day ? dayTypeColor(day.dayType) : null;
          return (
            <div
              key={i}
              className="py-1.5 text-center border-t-2"
              style={{
                background: color ? `${color}22` : "rgba(255,255,255,0.02)",
                borderColor: color ?? "rgba(255,255,255,0.1)",
              }}
            >
              <div className="font-body text-[9px] tracking-[0.1em] text-ft-light">{label}</div>
              <div
                className="font-body text-[9px] uppercase tracking-wider mt-0.5"
                style={{ color: color ?? "rgb(var(--ft-dim))" }}
              >
                {day ? day.name.split(" ")[0].slice(0, 5) : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function patternMaskFor(daysPerWeek: number): number[] {
  const masks: Record<number, number[]> = {
    2: [1, 0, 0, 1, 0, 0, 0],
    3: [1, 0, 1, 0, 1, 0, 0],
    4: [1, 1, 0, 1, 1, 0, 0],
    5: [1, 1, 0, 1, 1, 1, 0],
    6: [1, 1, 1, 1, 1, 1, 0],
  };
  return masks[daysPerWeek] ?? masks[3];
}

function dayTypeColor(t: string): string {
  switch (t) {
    case "lifting":
      return "rgb(var(--ft-push))";
    case "cardio":
      return "rgb(var(--ft-pull))";
    case "conditioning":
      return "rgb(var(--ft-core))";
    case "mobility":
      return "rgb(var(--ft-accent))";
    default:
      return "rgb(var(--ft-dim))";
  }
}

/* ─── Step 5 — Setup ───────────────────────────────────────────── */

/** Body weight goal payload for parent state. */
export interface BodyWeightGoal {
  current: string;
  target: string;
  byDate: string;
}

/** Strength goal payload for parent state. */
export interface StrengthGoal {
  exerciseId: string;
  exerciseName: string;
  current1RM: string;
  target1RM: string;
}

interface ExerciseSearchResult {
  id: string;
  name: string;
  primaryMuscle: string | null;
  movementPattern: string | null;
}

export function Step5Setup({
  plan,
  startDate,
  setStartDate,
  daysPerWeek,
  setDaysPerWeek,
  bodyWeight,
  setBodyWeight,
  strength,
  setStrength,
  submitting,
  onSubmit,
  onBack,
}: {
  plan: PickerPlan;
  startDate: string;
  setStartDate: (s: string) => void;
  daysPerWeek: number;
  setDaysPerWeek: (n: number) => void;
  bodyWeight: BodyWeightGoal;
  setBodyWeight: (v: BodyWeightGoal) => void;
  strength: StrengthGoal;
  setStrength: (v: StrengthGoal) => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const bwStart = parseFloat(bodyWeight.current);
  const bwTarget = parseFloat(bodyWeight.target);
  const showBwChart = Number.isFinite(bwStart) && Number.isFinite(bwTarget) && bwStart !== bwTarget;

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5 relative">
      <StepHeader step={5} onBack={onBack} trailingLabel={plan.name.toUpperCase()} />
      <PickerHeading variant={6}>Let&apos;s set you up.</PickerHeading>

      <div className="flex-1 mt-4 flex flex-col">
        <FieldRow label="Start date" kicker="01" icon="calendar">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-ft-bg/40 border border-ft-border px-3 py-2 font-data text-base text-ft-white focus:outline-none focus:border-ft-accent transition-colors"
          />
        </FieldRow>

        <FieldRow label="Days per week" kicker="02" icon="days">
          <Segments
            options={[3, 4, 5, 6].map((n) => ({ value: n, label: `${n}` }))}
            active={daysPerWeek}
            onChange={(v) => setDaysPerWeek(v)}
          />
          <div className="font-body text-[10px] text-ft-dim mt-1.5 uppercase tracking-wider">
            Template default: {plan.daysPerWeek}
          </div>
        </FieldRow>

        <FieldRow label="Body weight goal" kicker="03 · OPTIONAL" icon="scale">
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <div>
              <div className="font-body ft-stamp text-[8px] text-ft-dim mb-0.5">CURRENT</div>
              <NumInput
                value={bodyWeight.current}
                onChange={(v) => setBodyWeight({ ...bodyWeight, current: v })}
                unit="LB"
                placeholder="—"
              />
            </div>
            <div>
              <div className="font-body ft-stamp text-[8px] text-ft-dim mb-0.5">TARGET</div>
              <NumInput
                value={bodyWeight.target}
                onChange={(v) => setBodyWeight({ ...bodyWeight, target: v })}
                unit="LB"
                placeholder="—"
              />
            </div>
            <div>
              <div className="font-body ft-stamp text-[8px] text-ft-dim mb-0.5">BY</div>
              <input
                type="date"
                value={bodyWeight.byDate}
                onChange={(e) => setBodyWeight({ ...bodyWeight, byDate: e.target.value })}
                className="w-full bg-ft-bg/40 border border-ft-border px-2 py-2 font-data text-sm text-ft-white focus:outline-none focus:border-ft-accent transition-colors"
              />
            </div>
          </div>
          {showBwChart && (
            <BodyWeightChart start={bwStart} target={bwTarget} weeks={plan.durationWeeks} />
          )}
        </FieldRow>

        <FieldRow label="Strength goal" kicker="04 · OPTIONAL" icon="barbell">
          <StrengthGoalPicker strength={strength} setStrength={setStrength} />
        </FieldRow>
      </div>

      <div className="py-4">
        <PickerButton variant="primary" full onClick={onSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Start Gameplan"}
        </PickerButton>
      </div>
      <CornerStamp />
    </div>
  );
}

/**
 * Strength-goal picker — exercise search bar + current/target 1RM
 * NumInputs. Verbatim port of picker-screens.jsx Step5 lines 1228–1247
 * (Strength goal field). Search hits live `/api/exercises?search=`.
 */
function StrengthGoalPicker({
  strength,
  setStrength,
}: {
  strength: StrengthGoal;
  setStrength: (v: StrengthGoal) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/exercises?search=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { exercises: [] }))
        .then((data: { exercises: ExerciseSearchResult[] }) =>
          setResults((data.exercises ?? []).slice(0, 8)),
        )
        .catch(() => {});
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div>
      <div
        className="border border-ft-border px-3 py-2 mb-2 flex items-center justify-between"
        style={{ background: "rgb(var(--ft-bg-alt))" }}
      >
        <span className="font-data tabular-nums text-base text-ft-white truncate">
          {strength.exerciseName || "Pick an exercise…"}
        </span>
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="font-body text-[11px] uppercase tracking-[0.1em] text-ft-accent border-b border-ft-accent"
        >
          {strength.exerciseName ? "Change" : "Pick"}
        </button>
      </div>

      {showSearch && (
        <div className="mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-ft-bg/40 border border-ft-border px-3 py-2 font-body text-sm text-ft-white placeholder:text-ft-dim focus:outline-none focus:border-ft-accent"
          />
          {results.length > 0 && (
            <div className="mt-1 border border-ft-border max-h-44 overflow-auto">
              {results.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setStrength({ ...strength, exerciseId: ex.id, exerciseName: ex.name });
                    setQuery("");
                    setShowSearch(false);
                  }}
                  className="w-full text-left px-3 py-2 border-b border-ft-border last:border-b-0 hover:bg-ft-card transition-colors"
                >
                  <div className="font-body text-sm text-ft-white">{ex.name}</div>
                  <div className="font-body text-[10px] text-ft-dim">
                    {[ex.primaryMuscle, ex.movementPattern].filter(Boolean).join(" · ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="font-body ft-stamp text-[8px] text-ft-dim mb-0.5">CURRENT 1RM</div>
          <NumInput
            value={strength.current1RM}
            onChange={(v) => setStrength({ ...strength, current1RM: v })}
            unit="LB"
            placeholder="—"
          />
        </div>
        <div>
          <div className="font-body ft-stamp text-[8px] text-ft-dim mb-0.5">TARGET 1RM</div>
          <NumInput
            value={strength.target1RM}
            onChange={(v) => setStrength({ ...strength, target1RM: v })}
            unit="LB"
            placeholder="—"
          />
        </div>
      </div>
    </div>
  );
}

// Note: the R1 `Field` helper (kicker + label header) was replaced by
// `FieldRow` in R4 — adds the per-field icon glyph (calendar/days/scale/
// barbell) per picker-screens.jsx#FieldRow (lines 1128–1145). Imported
// from `./FieldRow` at the top of this file.

function Segments<T extends string | number>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex border border-ft-border rounded-ft overflow-hidden">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={[
            "px-4 py-2 font-data text-sm border-r border-ft-border last:border-r-0 transition-colors",
            opt.value === active ? "bg-ft-accent text-ft-bg" : "bg-transparent text-ft-white hover:bg-ft-surface",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
