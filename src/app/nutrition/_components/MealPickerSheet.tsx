"use client";

import { useEffect, useMemo, useState } from "react";
import { MacroTriple, Sheet } from "@/components/kit";
import { fmtKcal } from "@/lib/nutrition-math";
import { toMealView, type MealView } from "@/lib/nutrition-view";

const CHIPS = ["all", "breakfast", "lunch", "dinner", "snack"] as const;

interface MealPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (meal: MealView) => void;
  excludeIds?: string[];
  title?: string;
}

/** Pick one of My Meals. */
export default function MealPickerSheet({ open, onClose, onPick, excludeIds = [], title = "From My Meals" }: MealPickerSheetProps) {
  const [meals, setMeals] = useState<MealView[] | null>(null);
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("all");
  useEffect(() => {
    if (!open) return;
    setMeals(null);
    fetch("/api/nutrition/saved-meals")
      .then((r) => (r.ok ? r.json() : { meals: [] }))
      .then((d) => setMeals((d.meals ?? []).map(toMealView)))
      .catch(() => setMeals([]));
  }, [open]);
  const list = useMemo(() => (meals ?? []).filter((m) => !excludeIds.includes(m.id)).filter((m) => chip === "all" || m.mealType === chip), [meals, chip, excludeIds]);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="mb-3 flex gap-1.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChip(c)}
            className={["rounded-full border px-[11px] py-[5px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em]", chip === c ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface text-ft-light"].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-ft-border-faint">
        {meals === null && <li className="py-4 font-body text-[13px] text-ft-dim">Loading…</li>}
        {meals !== null && list.length === 0 && <li className="py-4 font-body text-[13px] text-ft-dim">No meals here yet.</li>}
        {list.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => onPick(m)} className="flex w-full items-center gap-3 py-2.5 text-left">
              <div className="min-w-0 flex-1">
                <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{m.name}</div>
                <MacroTriple f={m.macros.fat} c={m.macros.carbs} p={m.macros.protein} size={10.5} gap={10} className="mt-0.5" />
              </div>
              <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(m.macros.calories)} cal</div>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
