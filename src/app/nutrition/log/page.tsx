"use client";

/**
 * Diary add-food flow — search → servings → log to today's diary meal.
 * /api/nutrition/meals creates the FoodItem inline from the picked food's macros.
 */
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Btn, Card, MacroTriple, ScreenHeader, SearchIcon, Sheet } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal, fmtQty } from "@/lib/nutrition-math";

function mealTypeEnum(label: string): string {
  const l = label.toLowerCase();
  return l === "snacks" ? "snack" : l;
}

interface Food {
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const COMMON_FOODS: Food[] = [
  { name: "Greek Yogurt", brand: "Fage 0%", servingSize: 170, servingUnit: "g", calories: 90, protein: 17, carbs: 5, fat: 0 },
  { name: "Chicken Breast", brand: "Cooked", servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: "Brown Rice", brand: "Cooked", servingSize: 1, servingUnit: "cup", calories: 215, protein: 5, carbs: 45, fat: 2 },
  { name: "Banana", brand: "Medium", servingSize: 118, servingUnit: "g", calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "Almonds", brand: "Raw", servingSize: 28, servingUnit: "g", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Whey Protein", brand: "Vanilla", servingSize: 1, servingUnit: "scoop", calories: 120, protein: 25, carbs: 3, fat: 1 },
];

function MealLoggerInner() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const meal = params.get("meal") || "Snacks";
  const dateParam = params.get("date");
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : new Date().toISOString().slice(0, 10);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Food[]>(COMMON_FOODS);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Food | null>(null);
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults(COMMON_FOODS);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      fetch(`/api/nutrition/foods?search=${encodeURIComponent(term)}`, { signal: ac.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { foods?: Food[] } | null) => {
          const foods = (data?.foods ?? []).map((f) => ({ ...f, servingSize: Number(f.servingSize), calories: Number(f.calories), protein: Number(f.protein), carbs: Number(f.carbs), fat: Number(f.fat) }));
          setResults(foods.length ? foods : COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(term.toLowerCase())));
        })
        .catch((e) => {
          if ((e as Error).name === "AbortError") return;
          setResults(COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(term.toLowerCase())));
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const add = async () => {
    if (!picked || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mealType: mealTypeEnum(meal),
          items: [{ quantity: qty, food: { name: picked.name, brand: picked.brand ?? null, servingSize: picked.servingSize, servingUnit: picked.servingUnit, calories: picked.calories, protein: picked.protein, carbs: picked.carbs, fat: picked.fat, source: "custom" } }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Added to ${meal}`);
      router.push(`/nutrition/diary?date=${date}`);
      router.refresh();
    } catch {
      toast.error("Couldn't save the entry.");
      setSaving(false);
    }
  };

  const scaled = (n: number) => Math.round(n * qty);

  return (
    <div className="pb-8">
      <ScreenHeader title={`Add to ${meal}`} back={{ href: `/nutrition/diary?date=${date}`, label: "Diary" }} sub={`Diary · ${date}`} />
      <div className="px-5">
        <label className="flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5">
          <SearchIcon size={16} className="text-ft-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods" autoFocus className="w-full bg-transparent font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted" />
        </label>
        <div className="t-eyebrow mb-1.5 mt-4">{q.trim() ? (searching ? "Searching" : `${results.length} results`) : "Common foods"}</div>
        <div className="flex flex-col gap-2">
          {results.map((f, i) => (
            <button
              key={`${f.name}-${i}`}
              type="button"
              onClick={() => {
                setPicked(f);
                setQty(1);
              }}
              className="text-left"
            >
              <Card band={false} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{f.name}</div>
                  <div className="font-body text-[11.5px] text-ft-dim">
                    {fmtQty(f.servingSize)} {f.servingUnit}
                    {f.brand ? ` · ${f.brand}` : ""}
                  </div>
                  <MacroTriple f={f.fat} c={f.carbs} p={f.protein} size={10} gap={8} className="mt-0.5" />
                </div>
                <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(f.calories)} cal</div>
              </Card>
            </button>
          ))}
          {!searching && results.length === 0 && <p className="py-4 font-body text-[13px] text-ft-dim">No matches. Try another term.</p>}
        </div>
      </div>

      <Sheet
        open={picked !== null}
        onClose={() => setPicked(null)}
        title={picked?.name ?? ""}
        footer={
          <Btn fullWidth onClick={add} disabled={saving}>
            {saving ? "Saving…" : `Add to ${meal} · ${picked ? scaled(picked.calories) : 0} cal`}
          </Btn>
        }
      >
        {picked && (
          <>
            <div className="t-eyebrow">
              Serving · {fmtQty(picked.servingSize)} {picked.servingUnit}
              {picked.brand ? ` · ${picked.brand}` : ""}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" onClick={() => setQty((v) => Math.max(0.5, v - 0.5))} className="flex h-11 w-12 items-center justify-center rounded-ft-md border border-ft-border bg-ft-surface-raised font-data text-[18px] font-bold text-ft-accent" aria-label="Less">
                −
              </button>
              <div className="flex-1 text-center">
                <div className="font-data text-[32px] font-bold leading-none text-ft-white">{fmtQty(qty)}</div>
                <div className="t-eyebrow mt-1 !text-[9px]">{qty === 1 ? "serving" : "servings"}</div>
              </div>
              <button type="button" onClick={() => setQty((v) => v + 0.5)} className="flex h-11 w-12 items-center justify-center rounded-ft-md border border-ft-border bg-ft-surface-raised font-data text-[18px] font-bold text-ft-accent" aria-label="More">
                +
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <MacroTriple f={scaled(picked.fat)} c={scaled(picked.carbs)} p={scaled(picked.protein)} size={11.5} />
              <span className="font-data text-[15px] font-bold text-ft-coral">{scaled(picked.calories)} cal</span>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}

export default function MealLoggerPage() {
  return (
    <Suspense fallback={null}>
      <MealLoggerInner />
    </Suspense>
  );
}
