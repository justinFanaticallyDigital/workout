"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui";
import { authCheck } from "@/lib/fetch-helpers";

// ─── Types ─────────────────────────────────────────────
interface FoodItem {
  id: string | null;
  name: string;
  brand: string | null;
  barcode: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  source: string;
  externalId: string | null;
}

interface MealItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
}

interface Meal {
  id: string;
  mealType: string;
  notes: string | null;
  items: MealItem[];
}

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionTarget {
  id: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

// ─── Food Search Component ─────────────────────────────
function FoodSearch({
  onSelect,
  onClose,
}: {
  onSelect: (food: FoodItem, quantity: number) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [mode, setMode] = useState<"search" | "barcode" | "custom">("search");
  const inputRef = useRef<HTMLInputElement>(null);

  const [cfName, setCfName] = useState("");
  const [cfCal, setCfCal] = useState("");
  const [cfProtein, setCfProtein] = useState("");
  const [cfCarbs, setCfCarbs] = useState("");
  const [cfFat, setCfFat] = useState("");
  const [cfServing, setCfServing] = useState("100");
  const [cfUnit, setCfUnit] = useState("g");

  useEffect(() => { inputRef.current?.focus(); }, [mode]);

  useEffect(() => {
    if (mode !== "search" || query.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/nutrition/foods?search=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((r) => r.ok ? r.json() : { foods: [] })
        .then((data) => setResults(data.foods ?? []))
        .catch((err) => { if (err instanceof DOMException && err.name === "AbortError") return; setResults([]); })
        .finally(() => setSearching(false));
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, mode]);

  const handleBarcodeLookup = () => {
    if (!barcode.trim()) return;
    setSearching(true);
    fetch(`/api/nutrition/foods?barcode=${encodeURIComponent(barcode.trim())}`)
      .then((r) => r.ok ? r.json() : { foods: [] })
      .then((data) => { setResults(data.foods ?? []); if (data.foods?.length === 1) setSelected(data.foods[0]); })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  };

  const handleCustomSubmit = () => {
    if (!cfName.trim()) return;
    const food: FoodItem = {
      id: null, name: cfName.trim(), brand: null, barcode: null,
      servingSize: parseFloat(cfServing) || 100, servingUnit: cfUnit,
      calories: parseFloat(cfCal) || 0, protein: parseFloat(cfProtein) || 0,
      carbs: parseFloat(cfCarbs) || 0, fat: parseFloat(cfFat) || 0,
      fiber: null, sugar: null, sodium: null, source: "custom", externalId: null,
    };
    onSelect(food, parseFloat(quantity) || 1);
  };

  const handleConfirm = () => { if (selected) onSelect(selected, parseFloat(quantity) || 1); };

  return (
    <div className="fixed inset-0 z-50 bg-ft-bg/95 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-tertiary hover:text-ft-light text-sm font-body">&larr; Cancel</button>
          <h2 className="font-display text-lg text-ft-white">Add Food</h2>
          <div className="w-16" />
        </div>

        <div className="flex gap-1 mb-3">
          {(["search", "barcode", "custom"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setSelected(null); setResults([]); }}
              className={`flex-1 py-1.5 rounded text-xs font-body font-semibold transition-colors ${mode === m ? "bg-ft-card text-ft-white" : "text-tertiary"}`}>
              {m === "search" ? "Search" : m === "barcode" ? "Barcode" : "Custom"}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="space-y-3">
            <Card>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-ft-white text-sm font-body font-semibold">{selected.name}</p>
                  {selected.brand && <p className="text-tertiary text-xs font-body">{selected.brand}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="text-tertiary text-xs font-body hover:text-ft-light">Change</button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[{ l: "Cal", v: selected.calories }, { l: "Protein", v: selected.protein, u: "g" }, { l: "Carbs", v: selected.carbs, u: "g" }, { l: "Fat", v: selected.fat, u: "g" }].map((x) => (
                  <div key={x.l}>
                    <p className="text-tertiary text-[10px] font-body uppercase">{x.l}</p>
                    <p className="text-ft-white text-sm font-body font-bold">{Math.round(x.v)}{x.u || ""}</p>
                  </div>
                ))}
              </div>
              <p className="text-tertiary text-[10px] font-body mt-1.5 text-center">per {selected.servingSize}{selected.servingUnit}</p>
            </Card>
            <div className="flex items-center gap-3">
              <label className="text-tertiary text-xs font-body">Servings:</label>
              <input type="number" step="0.25" min="0.25" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 bg-ft-card border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white text-center" />
            </div>
            <button onClick={handleConfirm} className="cta-underline text-ft-white font-display text-sm">Add to Meal</button>
          </div>
        ) : (
          <>
            {mode === "search" && (
              <>
                <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search foods..." className="w-full bg-ft-card border border-ft-border rounded px-3 py-2.5 text-sm font-body text-ft-white placeholder:text-tertiary mb-3" />
                <div className="flex-1 overflow-y-auto pb-8">
                  {searching && <p className="text-tertiary text-xs font-body text-center py-4">Searching...</p>}
                  {!searching && query.length >= 2 && results.length === 0 && <p className="text-tertiary text-xs font-body text-center py-4">No foods found</p>}
                  {results.map((food, i) => (
                    <button key={food.id ?? `${food.source}-${i}`} onClick={() => setSelected(food)}
                      className="w-full text-left px-3 py-2.5 border-b border-ft-border/30 hover:bg-ft-card/50 transition-colors">
                      <p className="text-ft-white text-sm font-body">{food.name}</p>
                      <p className="text-tertiary text-xs font-body mt-0.5">
                        {Math.round(food.calories)} cal &middot; {Math.round(food.protein)}p &middot; {Math.round(food.carbs)}c &middot; {Math.round(food.fat)}f
                        {food.brand && ` · ${food.brand}`}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {mode === "barcode" && (
              <div className="space-y-3">
                <input ref={inputRef} type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeLookup()} placeholder="Enter barcode..."
                  inputMode="numeric" className="w-full bg-ft-card border border-ft-border rounded px-3 py-2.5 text-sm font-body text-ft-white placeholder:text-tertiary" />
                <button onClick={handleBarcodeLookup} disabled={!barcode.trim() || searching}
                  className="cta-underline text-ft-white font-display text-sm disabled:opacity-50">
                  {searching ? "Looking up..." : "Look Up"}
                </button>
              </div>
            )}
            {mode === "custom" && (
              <div className="space-y-2">
                <input ref={inputRef} type="text" value={cfName} onChange={(e) => setCfName(e.target.value)} placeholder="Food name"
                  className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white placeholder:text-tertiary" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={cfServing} onChange={(e) => setCfServing(e.target.value)} placeholder="Serving size"
                    className="bg-ft-card border border-ft-border rounded px-2 py-1.5 text-xs font-body text-ft-white" />
                  <select value={cfUnit} onChange={(e) => setCfUnit(e.target.value)}
                    className="bg-ft-card border border-ft-border rounded px-2 py-1.5 text-xs font-body text-ft-white">
                    <option value="g">grams</option><option value="oz">ounces</option><option value="ml">ml</option>
                    <option value="cup">cups</option><option value="piece">pieces</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[{ l: "Cal", v: cfCal, s: setCfCal }, { l: "Protein", v: cfProtein, s: setCfProtein }, { l: "Carbs", v: cfCarbs, s: setCfCarbs }, { l: "Fat", v: cfFat, s: setCfFat }].map((x) => (
                    <div key={x.l}>
                      <label className="text-tertiary text-[10px] font-body uppercase block mb-0.5">{x.l}</label>
                      <input type="number" value={x.v} onChange={(e) => x.s(e.target.value)} placeholder="0"
                        className="w-full bg-ft-card border border-ft-border rounded px-2 py-1.5 text-xs font-body text-ft-white" />
                    </div>
                  ))}
                </div>
                <button onClick={handleCustomSubmit} disabled={!cfName.trim()} className="cta-underline text-ft-white font-display text-sm disabled:opacity-50">
                  Add Custom Food
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Nutrition Page ───────────────────────────────
export default function NutritionPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DayTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [target, setTarget] = useState<NutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addingMealType, setAddingMealType] = useState<string>("");
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [tCal, setTCal] = useState("");
  const [tProtein, setTProtein] = useState("");
  const [tCarbs, setTCarbs] = useState("");
  const [tFat, setTFat] = useState("");

  const fetchDay = useCallback((d: string) => {
    setLoading(true);
    fetch(`/api/nutrition/meals?date=${d}`)
      .then(authCheck)
      .then((r) => r.ok ? r.json() : { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } })
      .then((data) => { setMeals(data.meals ?? []); setTotals(data.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDay(date);
    fetch("/api/nutrition/targets")
      .then(authCheck)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.target) { setTarget(data.target); setTCal(data.target.calories?.toString() ?? ""); setTProtein(data.target.protein?.toString() ?? ""); setTCarbs(data.target.carbs?.toString() ?? ""); setTFat(data.target.fat?.toString() ?? ""); }
      }).catch(() => {});
  }, [date, fetchDay]);

  const handleAddFood = async (food: FoodItem, quantity: number, mealType: string) => {
    const existingMeal = meals.find((m) => m.mealType === mealType);
    if (existingMeal) {
      const res = await fetch(`/api/nutrition/meals/${existingMeal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addItem: { foodItemId: food.id, food: food.id ? undefined : food, quantity } }) });
      if (res.ok) fetchDay(date);
    } else {
      const res = await fetch("/api/nutrition/meals", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, mealType, items: [{ foodItemId: food.id, food: food.id ? undefined : food, quantity }] }) });
      if (res.ok) fetchDay(date);
    }
    setAddingTo(null);
  };

  const handleRemoveItem = async (mealId: string, itemId: string) => {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ removeItemId: itemId }) });
    if (res.ok) fetchDay(date);
  };

  const handleDeleteMeal = async (mealId: string) => {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, { method: "DELETE" });
    if (res.ok) fetchDay(date);
  };

  const handleSaveTargets = async () => {
    const res = await fetch("/api/nutrition/targets", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calories: tCal ? parseFloat(tCal) : null, protein: tProtein ? parseFloat(tProtein) : null, carbs: tCarbs ? parseFloat(tCarbs) : null, fat: tFat ? parseFloat(tFat) : null }) });
    if (res.ok) { const data = await res.json(); setTarget(data); setShowTargetForm(false); }
  };

  const changeDate = (offset: number) => {
    const d = new Date(date); d.setDate(d.getDate() + offset); setDate(d.toISOString().split("T")[0]);
  };

  const mealsByType = MEAL_TYPES.map((type) => ({ type, label: MEAL_LABELS[type], meals: meals.filter((m) => m.mealType === type) }));

  return (
    <div className="space-y-5 tab-enter">
      {addingTo && <FoodSearch onSelect={(food, qty) => handleAddFood(food, qty, addingMealType)} onClose={() => setAddingTo(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Nutrition</h1>
        <a href="/nutrition/plans" className="text-tertiary font-body text-xs hover:text-ft-light">Meal Plans &rarr;</a>
      </div>

      {/* Macro Targets Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Protein", value: totals.protein, target: target?.protein, unit: "g", color: "var(--ft-pull)" },
          { label: "Carbs", value: totals.carbs, target: target?.carbs, unit: "g", color: "var(--ft-core)" },
          { label: "Fat", value: totals.fat, target: target?.fat, unit: "g", color: "var(--ft-legs)" },
          { label: "Calories", value: totals.calories, target: target?.calories, unit: "kcal", color: "var(--ft-accent)" },
        ].map((m) => {
          const pct = m.target ? (m.value / Number(m.target)) * 100 : 0;
          return (
            <div key={m.label} className="bg-ft-surface rounded-lg p-2.5 border border-ft-border text-center">
              <p className="text-tertiary font-body text-[9px] uppercase tracking-wider">{m.label}</p>
              <p className="font-handwritten text-xl text-ft-white mt-0.5">
                {m.value}{m.unit !== "kcal" ? m.unit : ""}
              </p>
              {m.target && (
                <div className="w-full h-1 bg-ft-card rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: `rgb(${m.color})` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Date Picker */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => changeDate(-1)} className="text-tertiary hover:text-ft-light text-lg px-2">&lsaquo;</button>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-ft-surface border border-ft-border rounded px-3 py-1.5 text-sm font-body text-ft-white" />
        <button onClick={() => changeDate(1)} className="text-tertiary hover:text-ft-light text-lg px-2">&rsaquo;</button>
      </div>

      {/* Target editing */}
      <div className="text-center">
        <button onClick={() => setShowTargetForm(!showTargetForm)} className="text-tertiary font-body text-[10px] hover:text-ft-light">
          {target ? "Edit targets" : "Set daily targets"}
        </button>
        {showTargetForm && (
          <div className="mt-3 bg-ft-surface rounded-lg p-3 border border-ft-border space-y-2">
            <div className="grid grid-cols-4 gap-2">
              {[{ l: "Cal", v: tCal, s: setTCal, p: "2000" }, { l: "Protein", v: tProtein, s: setTProtein, p: "150" }, { l: "Carbs", v: tCarbs, s: setTCarbs, p: "200" }, { l: "Fat", v: tFat, s: setTFat, p: "65" }].map((x) => (
                <div key={x.l}>
                  <label className="text-tertiary text-[10px] font-body uppercase block mb-0.5">{x.l}</label>
                  <input type="number" value={x.v} onChange={(e) => x.s(e.target.value)} placeholder={x.p}
                    className="w-full bg-ft-card border border-ft-border rounded px-2 py-1 text-xs font-body text-ft-white" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowTargetForm(false)} className="text-tertiary font-body text-xs">Cancel</button>
              <button onClick={handleSaveTargets} className="cta-underline text-ft-white font-display text-xs">Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Meals by Type */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-ft-surface rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {mealsByType.map(({ type, label, meals: typeMeals }) => (
            <div key={type} className="bg-ft-surface rounded-lg p-3 border border-ft-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-body text-sm font-semibold text-ft-white">{label}</h3>
                <button onClick={() => { setAddingMealType(type); setAddingTo(type); }}
                  className="text-tertiary text-xs font-body hover:text-ft-light">+ Add</button>
              </div>
              {typeMeals.length === 0 ? (
                <p className="text-tertiary text-xs font-body py-1">No items logged</p>
              ) : (
                <div className="space-y-1">
                  {typeMeals.flatMap((meal) => meal.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1 section-divider first:border-0 first:pt-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-secondary text-xs font-body truncate">{item.foodItem.name}</p>
                        <p className="text-tertiary text-[10px] font-body">
                          {Number(item.quantity)} srv &middot; {Math.round(Number(item.foodItem.calories) * Number(item.quantity))} cal
                        </p>
                      </div>
                      <button onClick={() => handleRemoveItem(meal.id, item.id)} className="text-tertiary text-xs hover:text-ft-danger ml-2">&times;</button>
                    </div>
                  )))}
                  {typeMeals.some((m) => m.items.length > 0) && (
                    <div className="flex items-center justify-between pt-1 text-tertiary">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-body uppercase">Subtotal</span>
                        {typeMeals.map((m) => (
                          <button key={m.id} onClick={() => handleDeleteMeal(m.id)}
                            className="text-[9px] font-body text-tertiary hover:text-ft-danger">Delete</button>
                        ))}
                      </div>
                      <span className="text-[10px] font-body">
                        {typeMeals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + Math.round(Number(i.foodItem.calories) * Number(i.quantity)), 0), 0)} cal
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="section-divider pt-4 grid grid-cols-2 gap-3">
        <a href="/nutrition/plans" className="bg-ft-surface rounded-lg p-3 border border-ft-border text-center hover:border-ft-dim transition-colors">
          <p className="font-display text-xs text-ft-white">Generate Plan</p>
          <p className="text-tertiary font-body text-[10px] mt-0.5">AI-powered from your macros</p>
        </a>
        <a href="/nutrition/plans" className="bg-ft-surface rounded-lg p-3 border border-ft-border text-center hover:border-ft-dim transition-colors">
          <p className="font-display text-xs text-ft-white">Grocery List</p>
          <p className="text-tertiary font-body text-[10px] mt-0.5">From this week&apos;s plan</p>
        </a>
      </div>
    </div>
  );
}
