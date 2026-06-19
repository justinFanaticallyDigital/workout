"use client";

/**
 * 2.8 Meal Logger — Cluster 2 (Logger tier).
 *
 * Full-screen search → quantity → log flow. Food search reads the shared
 * food catalog (/api/nutrition/foods, a read-only catalog) with a static
 * common-foods fallback so it works even unauthed/offline.
 *
 * Tier-aware write target (§1.4, mirroring the workout logger): the Logger
 * tier writes the meal to the LOCAL logger-store (kind:"meal"); the Program /
 * Gameplan tiers POST it to the DB (/api/nutrition/meals, which creates the
 * FoodItem inline). The Nutrition pillar groups today's meals by section.
 */
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header, Card, Button, Stamp, Stepper } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";
import { useTier } from "@/providers/TierProvider";
import { saveSession } from "@/lib/logger-store";

/** Map the sheet's meal label (Breakfast/Lunch/Dinner/Snacks) → the DB MealType enum. */
function mealTypeEnum(label: string): string {
  const l = label.toLowerCase();
  return l === "snacks" ? "snack" : l;
}

export const dynamic = "force-dynamic";

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
  const { tier } = useTier();
  const params = useSearchParams();
  const meal = params.get("meal") || "Snacks";

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Food[]>(COMMON_FOODS);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Food | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search against the shared catalog; static fallback on error/empty.
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
          const foods = data?.foods ?? [];
          setResults(
            foods.length
              ? foods
              : COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(term.toLowerCase())),
          );
        })
        .catch((e) => {
          if ((e as Error).name === "AbortError") return;
          setResults(COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(term.toLowerCase())));
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <Header kind="sub" title={`Add to ${meal}`} subtitle="Search foods" right={null} onBack={() => router.back()} />

      <div className="px-4 pb-2.5 pt-1">
        <div className="flex items-center gap-2.5 rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-ft-dim">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search foods or scan a barcode"
            className="flex-1 bg-transparent py-2.5 font-body text-sm text-ft-white outline-none placeholder:text-ft-dim"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-4 pb-24">
        <div className="ft-on-bg px-0.5 pb-2 pt-2 font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg-sec">
          {q.trim() ? (searching ? "Searching…" : `${results.length} results`) : "Common foods"}
        </div>
        <div className="flex flex-col gap-2">
          {results.map((f, i) => (
            <FoodRow key={`${f.name}-${i}`} food={f} onAdd={() => setPicked(f)} />
          ))}
          {!searching && results.length === 0 && (
            <p className="px-1 py-4 font-body text-sm text-ft-dim">No matches. Try another term.</p>
          )}
        </div>
      </div>

      {picked && (
        <QuantitySheet
          food={picked}
          meal={meal}
          onClose={() => setPicked(null)}
          onAdd={async (servings) => {
            const kcal = Math.round(picked.calories * servings);
            if (tier === "logger") {
              // Logger tier — local only (§1.4).
              await saveSession({
                kind: "meal",
                startedAt: Date.now(),
                finishedAt: Date.now(),
                data: {
                  mealType: meal,
                  kcal,
                  items: [
                    {
                      name: picked.name,
                      detail: `${servings % 1 === 0 ? servings : servings.toFixed(1)} × ${picked.servingSize}${picked.servingUnit}`,
                    },
                  ],
                  macros: {
                    p: Math.round(picked.protein * servings),
                    c: Math.round(picked.carbs * servings),
                    f: Math.round(picked.fat * servings),
                  },
                },
              });
            } else {
              // Program / Gameplan tier — persist to the DB. The meals API
              // creates the FoodItem inline from the picked food's macros.
              try {
                const res = await fetch("/api/nutrition/meals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    date: new Date().toISOString().slice(0, 10),
                    mealType: mealTypeEnum(meal),
                    items: [
                      {
                        quantity: servings,
                        food: {
                          name: picked.name,
                          brand: picked.brand ?? null,
                          servingSize: picked.servingSize,
                          servingUnit: picked.servingUnit,
                          calories: picked.calories,
                          protein: picked.protein,
                          carbs: picked.carbs,
                          fat: picked.fat,
                          source: "custom",
                        },
                      },
                    ],
                  }),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
              } catch {
                toast.error("Couldn't save the meal.");
                return;
              }
            }
            toast.success(`Added to ${meal}`);
            router.push("/nutrition");
          }}
        />
      )}
    </div>
  );
}

function FoodRow({ food, onAdd }: { food: Food; onAdd: () => void }) {
  return (
    <Card onClick={onAdd} className="flex cursor-pointer items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[13.5px] font-semibold text-ft-white">{food.name}</div>
        <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">
          {food.brand ? `${food.brand} · ` : ""}
          {food.servingSize}
          {food.servingUnit} · P{Math.round(food.protein)} C{Math.round(food.carbs)} F{Math.round(food.fat)}
        </div>
      </div>
      <span className="flex-shrink-0 font-number text-[12.5px] text-ft-light">{Math.round(food.calories)}</span>
      <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ft-accent-faint font-body text-lg leading-none text-ft-accent">
        +
      </span>
    </Card>
  );
}

function QuantitySheet({
  food,
  meal,
  onClose,
  onAdd,
}: {
  food: Food;
  meal: string;
  onClose: () => void;
  onAdd: (servings: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const scaled = (n: number) => Math.round(n * qty);
  const macros = [
    { label: "Protein", v: scaled(food.protein), color: "bg-ft-push" },
    { label: "Carbs", v: scaled(food.carbs), color: "bg-ft-core" },
    { label: "Fat", v: scaled(food.fat), color: "bg-ft-legs" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative rounded-t-2xl border-t border-ft-border bg-ft-surface px-4 pb-8 pt-4">
        <div className="mb-1 font-display text-base font-bold text-ft-white">{food.name}</div>
        <div className="mb-4 font-body text-xs text-ft-dim">
          {food.brand ? `${food.brand} · ` : ""}
          {food.servingSize}
          {food.servingUnit} per serving
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-light">Servings</div>
            <div className="mt-0.5 font-body text-[11.5px] text-ft-dim">
              {food.servingSize}
              {food.servingUnit} each
            </div>
          </div>
          <Stepper value={qty} step={0.5} min={0.5} onChange={setQty} fmt={(v) => (v % 1 === 0 ? `${v}` : v.toFixed(1))} />
        </div>

        <Card className="px-4 py-3.5">
          <div className="mb-3 flex items-baseline justify-between">
            <Stamp>This entry</Stamp>
            <span className="font-number text-xl font-bold text-ft-white">
              {scaled(food.calories)} <span className="text-xs font-normal text-ft-dim">kcal</span>
            </span>
          </div>
          <div className="flex gap-3.5">
            {macros.map((m) => (
              <div key={m.label} className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={["h-2 w-2 rounded-sm", m.color].join(" ")} />
                  <span className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">{m.label}</span>
                </div>
                <div className="mt-1 font-number text-base font-bold text-ft-white">
                  {m.v}
                  <span className="text-[11px] font-normal text-ft-dim">g</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button kind="primary" size="lg" fullWidth className="mt-4" onClick={() => onAdd(qty)}>
          Add to {meal} · {scaled(food.calories)} kcal
        </Button>
      </div>
    </div>
  );
}

export default function MealLoggerPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-ft-bg" />}>
      <MealLoggerInner />
    </Suspense>
  );
}
