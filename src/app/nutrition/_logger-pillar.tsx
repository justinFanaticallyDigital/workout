"use client";

/**
 * 2.7 Nutrition pillar (Logger layer) — Cluster 2.
 *
 * Logger-tier nutrition: local meals only (no DB). Macro summary + today's
 * meal cards from the local logger-store; "+ Log meal" → the meal logger.
 * Program/Gameplan Model-Day/Week layers are Cluster 3. Macro targets are set
 * manually via the 2.7a editor sheet and persisted locally (logger-store).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PillarShell, Header, Card, Button, Stamp, SectionLabel } from "@/components/v2";
import {
  listSessions,
  getMacroTarget,
  saveMacroTarget,
  type LocalSession,
  type LocalMacroTarget,
} from "@/lib/logger-store";

const MEAL_SECTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

interface MealData {
  mealType?: string;
  kcal?: number;
  items?: { name: string; detail?: string }[];
  macros?: { p?: number; c?: number; f?: number };
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function NutritionLoggerPillar() {
  const [sessions, setSessions] = useState<LocalSession[] | null>(null);
  const [target, setTarget] = useState<LocalMacroTarget | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let live = true;
    listSessions().then((s) => live && setSessions(s));
    getMacroTarget().then((t) => live && setTarget(t));
    return () => {
      live = false;
    };
  }, []);

  const todaysMeals = (sessions ?? []).filter((s) => s.kind === "meal" && isToday(s.startedAt));

  // Group local meal sessions by section + sum the day's macros.
  const bySection: Record<string, { kcal: number; items: { name: string; detail?: string }[] }> = {};
  for (const sec of MEAL_SECTIONS) bySection[sec] = { kcal: 0, items: [] };
  const ate = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const s of todaysMeals) {
    const d = (s.data as MealData) ?? {};
    const sec = MEAL_SECTIONS.includes(d.mealType as (typeof MEAL_SECTIONS)[number])
      ? (d.mealType as string)
      : "Snacks";
    bySection[sec].kcal += d.kcal ?? 0;
    bySection[sec].items.push(...(d.items ?? []));
    ate.kcal += d.kcal ?? 0;
    ate.p += d.macros?.p ?? 0;
    ate.c += d.macros?.c ?? 0;
    ate.f += d.macros?.f ?? 0;
  }
  const eaten = ate.kcal;

  const onSaveTarget = async (next: LocalMacroTarget) => {
    setTarget(next);
    setEditing(false);
    await saveMacroTarget(next);
  };

  return (
    <PillarShell
      pillar="nutrition"
      activeKey="today"
      header={<Header kind="home" title="Nutrition" subtitle="Logger" right="gear" />}
    >
      {/* Macro summary — eaten vs manually-set local targets (2.7a). */}
      <div className="px-4 pt-1">
        {target && (target.calories || target.protein || target.carbs || target.fat) ? (
          <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
            <div className="flex items-center justify-between">
              <Stamp>Today vs target</Stamp>
              <button type="button" onClick={() => setEditing(true)} className="font-body text-xs font-bold text-ft-accent">
                Edit
              </button>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-number text-[26px] font-bold leading-none text-ft-white">{eaten.toLocaleString()}</span>
              <span className="font-body text-[13px] text-ft-dim">
                / {target.calories ? target.calories.toLocaleString() : "—"} kcal
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              <MacroBar label="Protein" eaten={ate.p} target={target.protein} color="bg-ft-push" />
              <MacroBar label="Carbs" eaten={ate.c} target={target.carbs} color="bg-ft-core" />
              <MacroBar label="Fat" eaten={ate.f} target={target.fat} color="bg-ft-legs" />
            </div>
          </Card>
        ) : (
          <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
            <Stamp>Macro targets</Stamp>
            <div className="mt-1.5 font-display text-[17px] font-bold tracking-[-0.01em] text-ft-white">No targets set</div>
            <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ft-light">
              Set a calorie + macro split to track against. You can change it any time.
            </p>
            <Button kind="primary" size="md" fullWidth className="mt-3" onClick={() => setEditing(true)}>
              Set macro targets →
            </Button>
          </Card>
        )}
      </div>

      {editing && <MacroTargetSheet initial={target} onSave={onSaveTarget} onClose={() => setEditing(false)} />}

      <SectionLabel right={eaten > 0 ? `${eaten.toLocaleString()} kcal` : "Nothing logged"}>
        Today&apos;s meals
      </SectionLabel>
      <div className="flex flex-col gap-2.5 px-4">
        {MEAL_SECTIONS.map((sec) => {
          const m = bySection[sec];
          const logged = m.items.length > 0;
          return (
            <Card key={sec} className="px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-[14.5px] font-bold tracking-[-0.01em] text-ft-white">{sec}</span>
                {logged ? (
                  <span className="font-number text-[12.5px] text-ft-light">{m.kcal} kcal</span>
                ) : (
                  <Link href={`/nutrition/log?meal=${sec}`} className="font-body text-xs font-bold text-ft-accent">
                    + Add food
                  </Link>
                )}
              </div>
              {logged && (
                <div className="mt-2 flex flex-col gap-1.5 border-t border-ft-border-faint pt-2">
                  {m.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-body text-[12.5px] text-ft-light">
                        {it.name}
                        {it.detail ? ` · ${it.detail}` : ""}
                      </span>
                      <span className="font-body text-base leading-none text-ft-dim">›</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        <Link href="/nutrition/log" className="block">
          <Button kind="primary" size="lg" fullWidth>
            + Log meal
          </Button>
        </Link>
      </div>
    </PillarShell>
  );
}

function MacroBar({ label, eaten, target, color }: { label: string; eaten: number; target: number | null; color: string }) {
  const pct = target && target > 0 ? Math.min(100, Math.round((eaten / target) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-body text-[12px] font-semibold text-ft-light">{label}</span>
        <span className="font-number text-[11.5px] text-ft-dim">
          {eaten}
          {target != null ? ` / ${target} g` : " g"}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ft-surface-alt">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── 2.7a — manual macro-target editor (bottom sheet) ──
const MACRO_FIELDS: { key: keyof LocalMacroTarget; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

function MacroTargetSheet({
  initial,
  onSave,
  onClose,
}: {
  initial: LocalMacroTarget | null;
  onSave: (t: LocalMacroTarget) => void;
  onClose: () => void;
}) {
  const [vals, setVals] = useState<Record<keyof LocalMacroTarget, string>>({
    calories: initial?.calories != null ? String(initial.calories) : "",
    protein: initial?.protein != null ? String(initial.protein) : "",
    carbs: initial?.carbs != null ? String(initial.carbs) : "",
    fat: initial?.fat != null ? String(initial.fat) : "",
  });
  const set = (k: keyof LocalMacroTarget, v: string) => setVals((p) => ({ ...p, [k]: v.replace(/[^\d]/g, "") }));
  const save = () => {
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    onSave({ calories: num(vals.calories), protein: num(vals.protein), carbs: num(vals.carbs), fat: num(vals.fat) });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative rounded-t-ft-lg border-t border-ft-border bg-ft-surface px-4 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Stamp>Macro targets</Stamp>
            <div className="mt-0.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Daily split</div>
          </div>
          <button type="button" onClick={onClose} className="font-body text-sm text-ft-dim">
            Close
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {MACRO_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-3">
              <span className="font-body text-[13px] font-semibold text-ft-white">{f.label}</span>
              <div className="flex items-center gap-2">
                <input
                  value={vals[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                  className="w-24 rounded-ft-md border border-ft-border bg-ft-surface-alt px-3 py-2 text-right font-number text-sm text-ft-white outline-none placeholder:text-ft-dim"
                />
                <span className="w-9 font-body text-[11.5px] text-ft-dim">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <Button kind="primary" size="lg" fullWidth className="mt-4" onClick={save}>
          Save targets
        </Button>
      </div>
    </div>
  );
}
