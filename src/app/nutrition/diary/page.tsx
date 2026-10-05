"use client";

/** Daily diary — what was eaten on a date, against the default targets. Adds go through /nutrition/log. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card, ConfirmSheet, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { authCheck, toastError } from "@/lib/fetch-helpers";
import { fmtKcal, fmtQty, num, type Macros } from "@/lib/nutrition-math";
import { MEAL_TYPE_LABEL } from "@/lib/nutrition-view";
import { TotalBar } from "../_components/tiles";

interface DiaryItem {
  id: string;
  quantity: number;
  foodItem: { id: string; name: string; brand: string | null; servingSize: number; servingUnit: string; calories: number; protein: number; carbs: number; fat: number };
}
interface DiaryMeal {
  id: string;
  mealType: string;
  notes: string | null;
  items: DiaryItem[];
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function NutritionDiaryPage() {
  const toast = useToast();
  const [date, setDate] = useState(todayKey);
  const [meals, setMeals] = useState<DiaryMeal[]>([]);
  const [totals, setTotals] = useState<Macros>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [target, setTarget] = useState<Macros | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteMeal, setDeleteMeal] = useState<DiaryMeal | null>(null);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDate(d);
  }, []);

  const fetchDay = useCallback(
    (d: string) => {
      setLoading(true);
      fetch(`/api/nutrition/meals?date=${d}`)
        .then(authCheck)
        .then((r) => (r.ok ? r.json() : { meals: [], totals: null }))
        .then((data) => {
          setMeals(data.meals ?? []);
          const t = data.totals ?? {};
          setTotals({ calories: num(t.calories), protein: num(t.protein), carbs: num(t.carbs), fat: num(t.fat) });
        })
        .catch((err: unknown) => toastError(toast, "Couldn't load the diary")(err))
        .finally(() => setLoading(false));
    },
    [toast],
  );

  useEffect(() => {
    fetchDay(date);
  }, [date, fetchDay]);
  useEffect(() => {
    fetch("/api/nutrition/targets")
      .then(authCheck)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTarget(data?.target ? { calories: num(data.target.calories), protein: num(data.target.protein), carbs: num(data.target.carbs), fat: num(data.target.fat) } : null))
      .catch(() => undefined);
  }, []);

  const removeItem = async (mealId: string, itemId: string) => {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ removeItemId: itemId }) });
    if (res.ok) fetchDay(date);
    else toast.error("Couldn't remove the item.");
  };
  const confirmDeleteMeal = async () => {
    if (!deleteMeal) return;
    const res = await fetch(`/api/nutrition/meals/${deleteMeal.id}`, { method: "DELETE" });
    setDeleteMeal(null);
    if (res.ok) fetchDay(date);
    else toast.error("Couldn't delete the meal.");
  };
  const shift = (days: number) => {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === todayKey();
  const dayLabel = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <div className="pb-8">
      <ScreenHeader title="Diary" back={{ href: "/nutrition", label: "Nutrition" }} sub={dayLabel} right={isToday ? <Stamp>Today</Stamp> : undefined} />

      <div className="flex items-center gap-2 px-5 pb-3.5">
        <Btn kind="quiet" small onClick={() => shift(-1)} aria-label="Previous day">
          ‹
        </Btn>
        <input type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)} className="flex-1 rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2 text-center font-data text-[13px] text-ft-white outline-none focus:border-ft-accent" />
        <Btn kind="quiet" small onClick={() => shift(1)} disabled={isToday} aria-label="Next day">
          ›
        </Btn>
        {!isToday && (
          <Btn kind="ghost" small onClick={() => setDate(todayKey())}>
            Today
          </Btn>
        )}
      </div>

      <div className="px-5">
        <Card className="px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="t-eyebrow">Totals{target ? " · vs default targets" : ""}</span>
            <Link href="/nutrition/targets" className="t-link">
              Targets ›
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <TotalBar label="kcal" value={totals.calories} target={target?.calories ?? null} color="bg-ft-white" />
            <TotalBar label="Fat" value={totals.fat} target={target?.fat ?? null} color="bg-ft-gold" unit="g" />
            <TotalBar label="Carb" value={totals.carbs} target={target?.carbs ?? null} color="bg-ft-accent" unit="g" />
            <TotalBar label="Protein" value={totals.protein} target={target?.protein ?? null} color="bg-ft-coral" unit="g" />
          </div>
        </Card>
      </div>

      <div className="mt-3 flex flex-col gap-2.5 px-5">
        {MEAL_TYPES.map((type) => {
          const typeMeals = meals.filter((m) => m.mealType === type);
          const items = typeMeals.flatMap((m) => m.items.map((it) => ({ it, mealId: m.id })));
          const kcal = items.reduce((s, { it }) => s + num(it.foodItem.calories) * num(it.quantity), 0);
          const label = MEAL_TYPE_LABEL[type];
          return (
            <Card key={type} band={false} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 font-data text-[14px] font-bold text-ft-white">{label}</div>
                {items.length > 0 && <span className="font-data text-[12.5px] font-bold text-ft-coral">{fmtKcal(kcal)} cal</span>}
                <Btn kind="ghost" small href={`/nutrition/log?meal=${encodeURIComponent(label)}&date=${date}`}>
                  + Add
                </Btn>
              </div>
              {loading && items.length === 0 ? (
                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-ft-surface-alt" />
              ) : items.length === 0 ? (
                <div className="mt-1.5 font-body text-[12.5px] text-ft-dim">Nothing logged</div>
              ) : (
                <div className="mt-2 divide-y divide-ft-border-faint">
                  {items.map(({ it, mealId }) => (
                    <div key={it.id} className="flex items-center gap-2.5 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-data text-[13px] font-semibold text-ft-white">{it.foodItem.name}</div>
                        <div className="font-body text-[11.5px] text-ft-dim">
                          {fmtQty(it.quantity)} × {fmtQty(it.foodItem.servingSize)} {it.foodItem.servingUnit}
                          {it.foodItem.brand ? ` · ${it.foodItem.brand}` : ""}
                        </div>
                      </div>
                      <div className="font-data text-[12.5px] font-bold text-ft-white">{fmtKcal(num(it.foodItem.calories) * num(it.quantity))}</div>
                      <button type="button" onClick={() => removeItem(mealId, it.id)} aria-label={`Remove ${it.foodItem.name}`} className="px-1 font-data text-[12px] text-ft-dim">
                        ✕
                      </button>
                    </div>
                  ))}
                  {typeMeals.map((m) => (
                    <div key={m.id} className="flex justify-end pt-2">
                      <button type="button" onClick={() => setDeleteMeal(m)} className="font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">
                        Clear {label.toLowerCase()}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <ConfirmSheet open={deleteMeal !== null} onClose={() => setDeleteMeal(null)} title={`Clear ${deleteMeal ? MEAL_TYPE_LABEL[deleteMeal.mealType] ?? deleteMeal.mealType : ""}`} body="Every item logged in this meal is removed from the diary." confirmLabel="Clear meal" danger onConfirm={confirmDeleteMeal} />
    </div>
  );
}
