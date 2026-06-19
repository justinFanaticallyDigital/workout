"use client";

/**
 * 2.7 Nutrition pillar (Logger layer) — Cluster 2.
 *
 * Logger-tier nutrition: local meals only (no DB). Macro summary + today's
 * meal cards from the local logger-store; "+ Log meal" → the meal logger.
 * Program/Gameplan Model-Day/Week layers are Cluster 3. The macro-target
 * editor (2.7a sheet) is a TODO; targets render the empty state until then.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PillarShell, Header, Card, Button, Stamp, SectionLabel } from "@/components/v2";
import { listSessions, type LocalSession } from "@/lib/logger-store";

const MEAL_SECTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

interface MealData {
  mealType?: string;
  kcal?: number;
  items?: { name: string; detail?: string }[];
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function NutritionLoggerPillar() {
  const [sessions, setSessions] = useState<LocalSession[] | null>(null);

  useEffect(() => {
    let live = true;
    listSessions().then((s) => live && setSessions(s));
    return () => {
      live = false;
    };
  }, []);

  const todaysMeals = (sessions ?? []).filter((s) => s.kind === "meal" && isToday(s.startedAt));

  // Group local meal sessions by section.
  const bySection: Record<string, { kcal: number; items: { name: string; detail?: string }[] }> = {};
  for (const sec of MEAL_SECTIONS) bySection[sec] = { kcal: 0, items: [] };
  for (const s of todaysMeals) {
    const d = (s.data as MealData) ?? {};
    const sec = MEAL_SECTIONS.includes(d.mealType as (typeof MEAL_SECTIONS)[number])
      ? (d.mealType as string)
      : "Snacks";
    bySection[sec].kcal += d.kcal ?? 0;
    bySection[sec].items.push(...(d.items ?? []));
  }
  const eaten = MEAL_SECTIONS.reduce((sum, sec) => sum + bySection[sec].kcal, 0);

  return (
    <PillarShell
      pillar="nutrition"
      activeKey="today"
      header={<Header kind="home" title="Nutrition" subtitle="Logger" right="gear" />}
    >
      {/* Macro summary — empty (no local targets editor yet, 2.7a). */}
      <div className="px-4 pt-1">
        <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
          <Stamp>Macro targets</Stamp>
          <div className="mt-1.5 font-display text-[17px] font-bold tracking-[-0.01em] text-ft-white">
            No targets set
          </div>
          <p className="mt-1 font-body text-[12.5px] leading-relaxed text-ft-light">
            Set a calorie + macro split to track against. You can change it any time.
          </p>
          {/* TODO(2.7a): inline macro-target editor sheet. */}
          <Link href="/nutrition/log" className="mt-3 block">
            <Button kind="primary" size="md" fullWidth>
              Set macro targets →
            </Button>
          </Link>
        </Card>
      </div>

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
