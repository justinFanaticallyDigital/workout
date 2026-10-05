"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn, Card, CardStrip, CardStrip as Strip, Chev, DayHeader, MacroTriple, ScreenHeader, SectionHeader, Stamp } from "@/components/kit";
import { fmtHeaderDate } from "@/lib/dates";
import { fmtKcal, type Macros } from "@/lib/nutrition-math";
import { slotLabel, type PlanDayView } from "@/lib/nutrition-view";
import { plural } from "@/lib/training";
import { FoodTile, LibTile, MealTile } from "./tiles";

export interface PlanView {
  id: string;
  name: string;
  days: PlanDayView[];
}

interface NutritionHomeProps {
  defaults: Macros | null;
  counts: { days: number; meals: number; foods: number };
  todayKcal: number;
  plans: PlanView[];
  archivedCount: number;
}

export default function NutritionHome({ defaults, counts, todayKcal, plans, archivedCount }: NutritionHomeProps) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Nutrition" right={<Stamp>{fmtHeaderDate()}</Stamp>} />

      <div className="px-5 pb-3">
        <Card className="px-[18px] pb-[15px] pt-4">
          <div className="flex items-center">
            <div className="t-eyebrow">Targets · default</div>
            <div className="flex-1" />
            <Link href="/nutrition/targets" className="t-link">
              Edit ›
            </Link>
          </div>
          {defaults ? (
            <>
              <div className="mt-1.5 flex items-baseline gap-2">
                <div className="font-data text-[36px] font-bold leading-none text-ft-white">{fmtKcal(defaults.calories)}</div>
                <div className="font-data text-[12px] uppercase tracking-[0.14em] text-ft-dim">kcal / day</div>
              </div>
              <MacroTriple f={defaults.fat} c={defaults.carbs} p={defaults.protein} className="mt-3" />
            </>
          ) : (
            <div className="mt-2 font-body text-[13px] text-ft-light">No targets yet.</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-5 pb-[22px]">
        <LibTile name="My Days" sub={`${counts.days} saved`} href="/nutrition/days" />
        <LibTile name="My Meals" sub={`${counts.meals} saved`} href="/nutrition/meals" />
        <LibTile name="Diary" sub={`Today · ${fmtKcal(todayKcal)} kcal`} href="/nutrition/diary" />
        <LibTile name="Foods" sub={`${counts.foods} in library`} href="/nutrition/foods" />
      </div>

      {plans.length === 0 && (
        <div className="px-5">
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No nutrition plans</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Build days from your meals, then order them into a plan.</p>
            <Btn small href="/nutrition/plans" className="mt-3">
              + New plan
            </Btn>
          </Card>
        </div>
      )}

      {plans.map((plan, pi) => (
        <PlanSection key={plan.id} plan={plan} className={pi === 0 ? "" : "mt-5"} defaultOpen={pi === 0} />
      ))}

      <div className="mt-5 flex items-center gap-3 px-5">
        <Btn kind="ghost" small href="/nutrition/plans" className="flex-1">
          + New plan
        </Btn>
        <Link href="/nutrition/plans" className="flex-1 text-center font-data text-[11px] uppercase tracking-[0.14em] text-ft-dim">
          All plans{archivedCount ? ` · ${archivedCount} archived` : ""}
        </Link>
      </div>
    </div>
  );
}

function PlanSection({ plan, className = "", defaultOpen }: { plan: PlanView; className?: string; defaultOpen: boolean }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ? plan.days[0]?.rowId ?? null : null);
  return (
    <section className={className}>
      <SectionHeader title={plan.name} stamp={plural(plan.days.length, "day")} action={{ label: "Edit", href: `/nutrition/plans/${plan.id}` }} />
      <div className="flex flex-col gap-2.5 px-5">
        {plan.days.length === 0 && <div className="font-body text-[13px] text-ft-dim">No days in this plan yet.</div>}
        {plan.days.map((day, i) => (
          <DayAccordion key={day.rowId} day={day} index={i + 1} planId={plan.id} open={openId === day.rowId} onToggle={() => setOpenId(openId === day.rowId ? null : day.rowId)} />
        ))}
      </div>
    </section>
  );
}

function DayAccordion({ day, index, planId, open, onToggle }: { day: PlanDayView; index: number; planId: string; open: boolean; onToggle: () => void }) {
  const [mealId, setMealId] = useState<string | null>(null);
  const filled = day.slots.filter((s) => s.meal);
  const selected = filled.find((s) => s.meal?.id === mealId) ?? null;
  return (
    <Card className="px-4 py-3.5">
      <button type="button" onClick={onToggle} className="w-full text-left" aria-expanded={open}>
        <DayHeader
          day={index}
          name={day.name}
          right={
            <>
              {day.override && <Stamp tone="gold">Override</Stamp>}
              {!open && <span className="whitespace-nowrap font-data text-[10.5px] uppercase text-ft-dim">{filled.length} meals</span>}
              <span className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(day.macros.calories)}</span>
              <Chev open={open} />
            </>
          }
        />
      </button>
      {open && (
        <div className="mt-2">
          <MacroTriple f={day.macros.fat} c={day.macros.carbs} p={day.macros.protein} size={12} className="mb-2.5" />
          <CardStrip inset>
            {day.slots.map((s, i) => (
              <MealTile key={s.id} slot={slotLabel(s, i)} meal={s.meal} active={s.meal?.id === mealId} onClick={s.meal ? () => setMealId(s.meal!.id === mealId ? null : s.meal!.id) : undefined} />
            ))}
          </CardStrip>
          {selected?.meal && (
            <>
              <div className="t-eyebrow mb-1.5 mt-3 !text-[9px]">
                {selected.meal.name} · {plural(selected.meal.items.length, "item")}
              </div>
              <Strip inset className="mb-3">
                {selected.meal.items.map((it) => (
                  <FoodTile key={it.id} item={it} />
                ))}
              </Strip>
            </>
          )}
          <div className="mt-2.5 flex justify-end border-t border-ft-border-faint pt-2.5">
            <Link href={`/nutrition/days/${day.id}?plan=${planId}`} className="t-link">
              Edit day ›
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
