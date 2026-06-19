"use client";

/**
 * 3.3 Nutrition — Program tier. Rail-driven layers (Today / Week / Model /
 * Gameplan-locked) through the shared PillarShell. DB-backed (Program tier):
 * macro rollup from NutritionTarget + today's logged meals; week calories from
 * the meals range; model-day macro split from the target. Meal logging links to
 * the DB food diary (/nutrition/diary). The adaptive Gameplan layer is locked.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PillarShell, Header, Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import type { RailKey } from "@/components/v2";

interface Target {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}
interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
interface MealItem {
  quantity: number;
  foodItem: { name: string };
}
interface Meal {
  id: string;
  mealType: string;
  items: MealItem[];
}
interface RangeDay {
  date: string;
  totalCalories: number;
}

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

export default function ProgramNutritionTab() {
  const [target, setTarget] = useState<Target | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [week, setWeek] = useState<RangeDay[]>([]);
  const [activeKey, setActiveKey] = useState<RailKey>("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
    Promise.all([
      fetch("/api/nutrition/targets").then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/nutrition/meals?date=${today}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/nutrition/meals/range?from=${weekAgo}&to=${today}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([tg, ml, rg]) => {
        if (!live) return;
        setTarget(tg?.target ?? null);
        setTotals(ml?.totals ?? null);
        setMeals(ml?.meals ?? []);
        setWeek(rg?.days ?? []);
        setLoading(false);
      })
      .catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const layer = loading ? (
    <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
  ) : activeKey === "block" ? (
    <WeekLayer week={week} target={target} />
  ) : activeKey === "model" ? (
    <ModelLayer target={target} />
  ) : activeKey === "gameplan" ? (
    <GameplanLocked />
  ) : (
    <TodayLayer target={target} totals={totals} meals={meals} />
  );

  return (
    <PillarShell
      pillar="nutrition"
      activeKey={activeKey}
      onSelectRail={setActiveKey}
      header={<Header kind="home" title="Nutrition" subtitle="Program" right="gear" />}
    >
      {layer}
    </PillarShell>
  );
}

function pct(n: number, d: number | null): number {
  return d && d > 0 ? Math.round((n / d) * 100) : 0;
}

function MacroRollup({ target, totals }: { target: Target; totals: Totals }) {
  const calT = target.calories ?? 0;
  const calPct = pct(totals.calories, target.calories);
  const macros = [
    { label: "Protein", color: "bg-ft-legs", e: totals.protein, t: target.protein ?? 0 },
    { label: "Carbs", color: "bg-ft-core", e: totals.carbs, t: target.carbs ?? 0 },
    { label: "Fat", color: "bg-ft-push", e: totals.fat, t: target.fat ?? 0 },
  ];
  return (
    <Card raised className="px-4 py-4">
      <div className="flex items-baseline justify-between">
        <Stamp>Today · {calPct}% of target</Stamp>
        <span className="font-body text-[11.5px] text-ft-light">{Math.max(0, calT - totals.calories).toLocaleString()} left</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-number text-3xl font-bold text-ft-white">{totals.calories.toLocaleString()}</span>
        <span className="font-body text-[13px] text-ft-dim">/ {calT.toLocaleString()} kcal</span>
      </div>
      <Bar pct={calPct} className="mt-2 bg-ft-accent" />
      <div className="mt-3.5 flex gap-3.5">
        {macros.map((m) => (
          <div key={m.label} className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className={["h-2 w-2 rounded-sm", m.color].join(" ")} />
              <span className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">{m.label}</span>
            </div>
            <div className="mt-1 font-number text-[14.5px] font-bold text-ft-white">
              {m.e}
              <span className="text-[11px] font-normal text-ft-dim"> / {m.t}g</span>
            </div>
            <Bar pct={pct(m.e, m.t)} className={["mt-1.5", m.color].join(" ")} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Bar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className="h-[5px] overflow-hidden rounded-full bg-ft-surface-alt">
      <div className={["h-full", className].join(" ")} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ── Today ──
function TodayLayer({ target, totals, meals }: { target: Target | null; totals: Totals | null; meals: Meal[] }) {
  const byType = new Map<string, Meal[]>();
  for (const m of meals) {
    const k = m.mealType.toLowerCase();
    byType.set(k, [...(byType.get(k) ?? []), m]);
  }
  return (
    <div className="px-4 pt-2">
      {target && totals ? (
        <MacroRollup target={target} totals={totals} />
      ) : (
        <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
          <Stamp>Macro targets</Stamp>
          <div className="mt-1.5 font-display text-[17px] font-bold text-ft-white">No targets set</div>
          <p className="mt-1 font-body text-[12.5px] text-ft-light">Set a calorie + macro split in the food diary to track against.</p>
          <Link href="/nutrition/diary" className="mt-3 block">
            <Button kind="primary" size="md" fullWidth>
              Open food diary →
            </Button>
          </Link>
        </Card>
      )}

      <SectionLabel right={totals ? `${totals.calories.toLocaleString()} kcal` : "Nothing logged"}>
        Today&apos;s meals
      </SectionLabel>
      <div className="flex flex-col gap-2.5">
        {MEAL_ORDER.map((type) => {
          const list = byType.get(type) ?? [];
          const items = list.flatMap((m) => m.items);
          const logged = items.length > 0;
          return (
            <Card key={type} className="px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-[14.5px] font-bold capitalize tracking-[-0.01em] text-ft-white">{type}</span>
                {logged ? (
                  <span className="font-number text-[12.5px] text-ft-light">{items.length} item{items.length === 1 ? "" : "s"}</span>
                ) : (
                  <Link href={`/nutrition/diary`} className="font-body text-xs font-bold text-ft-accent">
                    + Add food
                  </Link>
                )}
              </div>
              {logged && (
                <div className="mt-2 flex flex-col gap-1 border-t border-ft-border-faint pt-2">
                  {items.slice(0, 4).map((it, i) => (
                    <span key={i} className="font-body text-[12.5px] text-ft-light">
                      {it.foodItem.name}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="px-0 pt-4">
        <Link href="/nutrition/diary" className="block">
          <Button kind="primary" size="lg" fullWidth>
            + Log meal
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Week ──
function WeekLayer({ week, target }: { week: RangeDay[]; target: Target | null }) {
  const calT = target?.calories ?? 0;
  const max = Math.max(calT, ...week.map((d) => d.totalCalories), 1);
  return (
    <div className="px-4 pt-2">
      <SectionLabel right="Last 7 days">Calories vs target</SectionLabel>
      <Card className="px-4 py-4">
        <div className="flex h-32 items-end gap-2">
          {week.map((d) => {
            const h = Math.round((d.totalCalories / max) * 100);
            const over = calT > 0 && d.totalCalories > calT;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={["w-full rounded-t-sm", over ? "bg-ft-warn" : "bg-ft-accent"].join(" ")}
                    style={{ height: `${Math.max(2, h)}%` }}
                    title={`${d.totalCalories} kcal`}
                  />
                </div>
                <span className="font-data text-[9px] text-ft-dim">{d.date.slice(8, 10)}</span>
              </div>
            );
          })}
        </div>
        {calT > 0 && (
          <div className="mt-3 border-t border-ft-border-faint pt-2 text-center font-body text-[11px] text-ft-dim">
            Target {calT.toLocaleString()} kcal/day
          </div>
        )}
      </Card>
      <Link href="/nutrition/diary" className="mt-3 block">
        <Button kind="secondary" size="md" fullWidth>
          Open food diary →
        </Button>
      </Link>
    </div>
  );
}

// ── Model (macro split) ──
function ModelLayer({ target }: { target: Target | null }) {
  const p = target?.protein ?? 0;
  const c = target?.carbs ?? 0;
  const f = target?.fat ?? 0;
  return (
    <div className="px-4 pt-2">
      <Card raised className="relative overflow-hidden px-4 py-3.5">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-ft-accent" />
        <div className="pl-1.5">
          <Stamp>Model day</Stamp>
          <div className="mt-1 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">
            {target?.calories ? `${target.calories.toLocaleString()} kcal target` : "Daily target"}
          </div>
          <div className="mt-1 font-body text-xs text-ft-dim">
            {p} g protein · {c} g carbs · {f} g fat
          </div>
        </div>
      </Card>

      <SectionLabel>Daily macro split</SectionLabel>
      <Card className="p-3.5">
        <div className="flex h-3 overflow-hidden rounded-full bg-ft-surface-alt">
          <div className="bg-ft-legs" style={{ flex: Math.max(p, 1) }} />
          <div className="bg-ft-core" style={{ flex: Math.max(c, 1) }} />
          <div className="bg-ft-push" style={{ flex: Math.max(f, 1) }} />
        </div>
        <div className="mt-2 flex justify-between">
          {[
            ["P", `${p} g`, "bg-ft-legs"],
            ["C", `${c} g`, "bg-ft-core"],
            ["F", `${f} g`, "bg-ft-push"],
          ].map(([k, v, cls]) => (
            <span key={k} className="inline-flex items-center gap-1.5 font-data text-[11px] text-ft-dim">
              <span className={["h-2 w-2 rounded-sm", cls].join(" ")} />
              {k} {v}
            </span>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-2">
        <Link href="/nutrition/diary" className="block">
          <Card className="flex items-center justify-between px-3.5 py-3">
            <span className="font-body text-[13px] font-semibold text-ft-light">Open food diary</span>
            <span className="font-body text-base text-ft-dim">›</span>
          </Card>
        </Link>
        <Link href="/nutrition/plans" className="block">
          <Card className="flex items-center justify-between px-3.5 py-3">
            <span className="font-body text-[13px] font-semibold text-ft-light">Meal plans</span>
            <span className="font-body text-base text-ft-dim">›</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// ── Gameplan locked ──
function GameplanLocked() {
  const features = [
    "Macros retune each week from your results",
    "Diet-phase trajectory vs goal weight",
    "Auto-adjusts the week plan + grocery list",
  ];
  return (
    <div>
      <div className="pointer-events-none px-4 pt-2 opacity-45">
        <Card className="px-4 py-3.5">
          <Stamp>Adaptive macros · projected</Stamp>
          <svg viewBox="0 0 280 84" className="mt-2 block h-[84px] w-full">
            <path d="M6 64 Q90 60 150 36 T274 24" stroke="rgb(var(--ft-accent))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M6 64 Q90 60 150 36 T274 24 L274 84 L6 84 Z" fill="rgb(var(--ft-accent-faint))" />
          </svg>
        </Card>
      </div>
      <div className="px-4 pt-4">
        <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
          <div className="flex items-center justify-between">
            <Stamp>Gameplan tier</Stamp>
            <Chip tone="neutral" size="sm">
              Locked
            </Chip>
          </div>
          <div className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Adaptive nutrition</div>
          <div className="mt-3 flex flex-col gap-1.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
                <span className="mt-px text-ft-accent">·</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex gap-2">
            <Link href="/shelf" className="flex-1">
              <Button kind="primary" size="md" fullWidth>
                See Gameplan →
              </Button>
            </Link>
            <Link href="/shelf/compare">
              <Button kind="secondary" size="md">
                Compare
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
