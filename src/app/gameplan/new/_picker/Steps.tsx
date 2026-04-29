"use client";

import { ReactNode } from "react";
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
} from "./PickerPrimitives";
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
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-6 pt-14 pb-7">
      <Stamp className="mb-9 self-start">FITTRACK · NEW MEMBER</Stamp>
      <PickerHeading kicker="STEP 01">
        Pick your
        <br />
        Gameplan.
      </PickerHeading>
      <p className="font-body text-[15px] leading-relaxed text-ft-light mt-3">
        A Gameplan is your training, nutrition, and lifestyle in one editable plan.
      </p>

      <div className="flex-1" />

      <div className="my-8 -mx-6 px-6 py-7 border-y border-dashed border-ft-border flex items-center justify-between gap-4">
        <div>
          <Stamp className="block mb-2">CONTAINS</Stamp>
          <span className="font-data text-2xl text-ft-white">03</span>
          <span className="font-body text-[11px] uppercase tracking-[0.1em] text-ft-light ml-2">COMPONENTS</span>
          <div className="mt-1.5 font-body text-[13px] text-ft-white">Training · Nutrition · Lifestyle</div>
        </div>
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 text-ft-accent">
          <polygon points="32,4 60,56 4,56" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          <line x1="32" y1="4" x2="32" y2="56" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
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
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5 pb-5">
      <StepHeader step={2} onBack={onBack} onSkip={onSkip} />
      <PickerHeading>Help us narrow it down.</PickerHeading>

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
      className="ft-card w-full text-left bg-ft-surface border border-ft-border p-3.5 hover:border-ft-accent transition-colors relative"
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
            <span className="font-data text-sm text-ft-white">{plan.durationWeeks}</span>
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
    </button>
  );
}

function FrequencyRow({ plan }: { plan: PickerPlan }) {
  const fmt = (v: number | [number, number]) =>
    Array.isArray(v) ? (v[0] === v[1] ? `${v[0]}` : `${v[0]}–${v[1]}`) : `${v}`;
  const items: { label: string; val: number | [number, number] }[] = [
    { label: "LIFT", val: plan.freq.lift },
    { label: "CARDIO", val: plan.freq.cardio },
    { label: "COND", val: plan.freq.cond },
  ];
  return (
    <div className="flex gap-3.5 items-start">
      <div className="flex-1 flex flex-col gap-1.5">
        {items.map((it) => {
          const dim = it.val === 0 || (Array.isArray(it.val) && it.val[1] === 0);
          return (
            <div
              key={it.label}
              className={`grid grid-cols-[54px_30px_1fr] items-center gap-2 ${dim ? "opacity-40" : ""}`}
            >
              <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-dim">{it.label}</div>
              <div className="flex items-baseline gap-px justify-end">
                <span className={`font-data text-sm leading-none ${dim ? "text-ft-dim" : "text-ft-white"}`}>
                  {fmt(it.val)}
                </span>
                <span className="font-body text-[8px] uppercase tracking-[0.1em] text-ft-dim">×</span>
              </div>
              <div className="text-[10px] text-ft-dim font-body">/wk</div>
            </div>
          );
        })}
      </div>
      {(plan.freq.nutrition || plan.freq.mobility) && (
        <div className="flex flex-col gap-1.5 pl-3 border-l border-dashed border-ft-border self-stretch">
          {plan.freq.nutrition && (
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-accent">NUTR</span>
          )}
          {plan.freq.mobility && (
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-accent">MOB</span>
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
  onPickPlan,
  onClearFilter,
  onBack,
}: {
  plans: PickerPlan[];
  filters: Filters;
  filtersBypassed: boolean;
  onPickPlan: (id: string) => void;
  onClearFilter: (key: FilterKey) => void;
  onBack: () => void;
}) {
  const activeFilters = (Object.entries(filters) as [FilterKey, string | undefined][])
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ({ key: k, label: filterLabel(k, v!) }));

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5">
      <StepHeader
        step={3}
        onBack={onBack}
        trailingLabel={`${plans.length} GAMEPLAN${plans.length === 1 ? "" : "S"}`}
      />
      <PickerHeading>{filtersBypassed ? "Pick a Gameplan." : "Closest fits."}</PickerHeading>

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
        <EmptyResultsBanner onBack={onBack} />
      ) : (
        <div className="flex-1 overflow-auto pb-4 flex flex-col gap-2.5">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onPick={() => onPickPlan(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyResultsBanner({ onBack }: { onBack: () => void }) {
  return (
    <div className="border border-dashed border-ft-danger/60 bg-ft-danger/5 p-4 mt-4">
      <Stamp className="text-ft-danger">NO MATCH</Stamp>
      <div className="font-body text-xs text-ft-white mt-2 leading-relaxed">
        No Gameplans match every filter. Try removing one above, or:
      </div>
      <button
        onClick={onBack}
        className="mt-3 font-body text-[12px] uppercase tracking-[0.1em] text-ft-accent border-b border-ft-accent"
      >
        ← Broaden filter
      </button>
    </div>
  );
}

function filterLabel(key: FilterKey, value: string): string {
  const group = FILTER_GROUPS.find((g) => g.key === key);
  const opt = group?.options.find((o) => o.value === value);
  if (key === "daysPerWeek") return `${value} D/WK`;
  return (opt?.label ?? value).toUpperCase();
}

/* ─── Step 4 — Preview ─────────────────────────────────────────── */

export function Step4Preview({
  plan,
  blueprint,
  loading,
  error,
  onConfirm,
  onPickAnother,
  onBack,
}: {
  plan: PickerPlan;
  blueprint: PreviewBlueprint | null;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onPickAnother: () => void;
  onBack: () => void;
}) {
  const blocks = blueprint?.blocks ?? [];
  const wkPattern = plan.pattern;

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5">
      <StepHeader step={4} onBack={onBack} />
      <PickerHeading>{plan.name}</PickerHeading>
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
        <div className="flex-1 mt-4 flex flex-col gap-4">
          <BlockCalendar blueprint={blueprint} />
          <SampleWeek blueprint={blueprint} />
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
    </div>
  );
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

export function Step5Setup({
  plan,
  startDate,
  setStartDate,
  daysPerWeek,
  setDaysPerWeek,
  submitting,
  onSubmit,
  onBack,
}: {
  plan: PickerPlan;
  startDate: string;
  setStartDate: (s: string) => void;
  daysPerWeek: number;
  setDaysPerWeek: (n: number) => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col px-5 pt-5">
      <StepHeader step={5} onBack={onBack} trailingLabel={plan.name.toUpperCase()} />
      <PickerHeading>Let&apos;s set you up.</PickerHeading>

      <div className="flex-1 mt-4 flex flex-col gap-5">
        <Field label="Start date" kicker="01">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-ft-bg/40 border border-ft-border px-3 py-2 font-data text-base text-ft-white focus:outline-none focus:border-ft-accent transition-colors rounded-ft"
          />
        </Field>

        <Field label="Days per week" kicker="02">
          <Segments
            options={[3, 4, 5, 6].map((n) => ({ value: n, label: `${n}` }))}
            active={daysPerWeek}
            onChange={(v) => setDaysPerWeek(v)}
          />
          <div className="font-body text-[10px] text-ft-dim mt-1.5 uppercase tracking-wider">
            Template default: {plan.daysPerWeek}
          </div>
        </Field>

        <div className="border-t border-dashed border-ft-border pt-3 text-ft-dim font-body text-[11px] uppercase tracking-[0.15em]">
          Goal targets and customization come next, after the program is created.
        </div>
      </div>

      <div className="py-4">
        <PickerButton variant="primary" full onClick={onSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Start Gameplan"}
        </PickerButton>
      </div>
    </div>
  );
}

function Field({ label, kicker, children }: { label: string; kicker?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        {kicker && <Stamp>{kicker}</Stamp>}
        <span className="font-body text-[13px] uppercase tracking-[0.1em] text-ft-white">{label}</span>
      </div>
      {children}
    </div>
  );
}

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
