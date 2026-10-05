"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, CardStrip, Chev, MacroTriple, ScreenHeader } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal } from "@/lib/nutrition-math";
import { MEAL_TYPE_LABEL, type MealView } from "@/lib/nutrition-view";
import { plural } from "@/lib/training";
import { SlotPills } from "../../_components/meal-ui";
import { FoodTile } from "../../_components/tiles";

const CHIPS = ["all", "breakfast", "lunch", "dinner", "snack"] as const;
type Chip = (typeof CHIPS)[number];

export default function MyMeals({ meals }: { meals: MealView[] }) {
  const router = useRouter();
  const toast = useToast();
  const [chip, setChip] = useState<Chip>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => meals.filter((m) => chip === "all" || m.mealType === chip), [meals, chip]);

  const newMeal = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/nutrition/saved-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New meal", mealType: chip === "all" ? null : chip, items: [] }),
      });
      if (!res.ok) throw new Error("Couldn't create the meal.");
      const meal = await res.json();
      router.push(`/nutrition/meals/${meal.id}?back=${encodeURIComponent("/nutrition/meals")}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the meal.");
      setCreating(false);
    }
  };

  return (
    <div className="pb-8">
      <ScreenHeader
        title="My Meals"
        back={{ href: "/nutrition", label: "Nutrition" }}
        right={
          <Btn small onClick={newMeal} disabled={creating}>
            + New meal
          </Btn>
        }
      />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-3.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChip(c)}
            className={[
              "flex-shrink-0 rounded-full border px-[11px] py-[5px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em]",
              chip === c ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface text-ft-light",
            ].join(" ")}
          >
            {c === "all" ? "All" : MEAL_TYPE_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 px-5">
        {list.length === 0 && (
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">{meals.length === 0 ? "No meals yet" : "Nothing tagged like that"}</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">{meals.length === 0 ? "Build a meal from a frame — protein, carb, fat, filling, flavor — or a free ingredient list." : "Tag a meal from its builder, or switch back to All."}</p>
            {meals.length === 0 && (
              <Btn small className="mt-3" onClick={newMeal} disabled={creating}>
                + New meal
              </Btn>
            )}
          </Card>
        )}
        {list.map((m) => (
          <MealCard key={m.id} meal={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
        ))}
      </div>
    </div>
  );
}

function MealCard({ meal, open, onToggle }: { meal: MealView; open: boolean; onToggle: () => void }) {
  return (
    <Card band={open} className="px-4 py-[13px]">
      <button type="button" onClick={onToggle} className="flex w-full flex-col gap-[7px] text-left" aria-expanded={open}>
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1 truncate font-data text-[14.5px] font-bold text-ft-white">{meal.name}</div>
          <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(meal.macros.calories)} cal</div>
          <Chev open={open} />
        </div>
        <MacroTriple f={meal.macros.fat} c={meal.macros.carbs} p={meal.macros.protein} size={11.5} />
        {meal.template ? (
          <SlotPills template={meal.template} roles={meal.roles} />
        ) : (
          <div className="font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">
            No frame · {plural(meal.items.length, "ingredient")}
          </div>
        )}
      </button>
      {open && (
        <>
          {meal.items.length > 0 ? (
            <CardStrip inset className="mt-2.5">
              {meal.items.map((it) => (
                <FoodTile key={it.id} item={it} />
              ))}
            </CardStrip>
          ) : (
            <div className="mt-2.5 font-body text-[12.5px] text-ft-dim">No ingredients yet.</div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-ft-border-faint pt-2">
            <span className="font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">{meal.usedInDays > 0 ? `In ${plural(meal.usedInDays, "day")}` : "Not in a day"}</span>
            <Link href={`/nutrition/meals/${meal.id}?back=${encodeURIComponent("/nutrition/meals")}`} className="t-link">
              Edit meal ›
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
