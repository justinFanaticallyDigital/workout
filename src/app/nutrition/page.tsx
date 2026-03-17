"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, ProgressBar } from "@/components/ui";

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

  // Custom food form
  const [cfName, setCfName] = useState("");
  const [cfCal, setCfCal] = useState("");
  const [cfProtein, setCfProtein] = useState("");
  const [cfCarbs, setCfCarbs] = useState("");
  const [cfFat, setCfFat] = useState("");
  const [cfServing, setCfServing] = useState("100");
  const [cfUnit, setCfUnit] = useState("g");

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  // Search by text
  useEffect(() => {
    if (mode !== "search" || query.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/nutrition/foods?search=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((r) => r.ok ? r.json() : { foods: [] })
        .then((data) => setResults(data.foods ?? []))
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setResults([]);
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, mode]);

  const handleBarcodeLookup = () => {
    if (!barcode.trim()) return;
    setSearching(true);
    fetch(`/api/nutrition/foods?barcode=${encodeURIComponent(barcode.trim())}`)
      .then((r) => r.ok ? r.json() : { foods: [] })
      .then((data) => {
        setResults(data.foods ?? []);
        if (data.foods?.length === 1) {
          setSelected(data.foods[0]);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  };

  const handleCustomSubmit = () => {
    if (!cfName.trim()) return;
    const food: FoodItem = {
      id: null,
      name: cfName.trim(),
      brand: null,
      barcode: null,
      servingSize: parseFloat(cfServing) || 100,
      servingUnit: cfUnit,
      calories: parseFloat(cfCal) || 0,
      protein: parseFloat(cfProtein) || 0,
      carbs: parseFloat(cfCarbs) || 0,
      fat: parseFloat(cfFat) || 0,
      fiber: null,
      sugar: null,
      sodium: null,
      source: "custom",
      externalId: null,
    };
    onSelect(food, parseFloat(quantity) || 1);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected, parseFloat(quantity) || 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ft-bg/95 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-ft-dim hover:text-ft-light text-sm font-mono">
            &larr; Cancel
          </button>
          <h2 className="font-mono text-lg font-bold text-ft-white">Add Food</h2>
          <div className="w-16" />
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-3">
          {(["search", "barcode", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelected(null); setResults([]); }}
              className={`flex-1 py-1.5 rounded text-xs font-mono transition-colors ${
                mode === m ? "bg-ft-white text-ft-bg font-bold" : "bg-ft-surface text-ft-dim"
              }`}
            >
              {m === "search" ? "Search" : m === "barcode" ? "Barcode" : "Custom"}
            </button>
          ))}
        </div>

        {/* Selected food confirmation */}
        {selected ? (
          <div className="space-y-3">
            <Card>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-ft-white text-sm font-mono font-bold">{selected.name}</p>
                  {selected.brand && (
                    <p className="text-ft-muted text-xs font-mono">{selected.brand}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light"
                >
                  Change
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-ft-dim text-[10px] font-mono uppercase">Cal</p>
                  <p className="text-ft-white text-sm font-mono font-bold">{Math.round(selected.calories)}</p>
                </div>
                <div>
                  <p className="text-ft-dim text-[10px] font-mono uppercase">Protein</p>
                  <p className="text-ft-white text-sm font-mono font-bold">{Math.round(selected.protein)}g</p>
                </div>
                <div>
                  <p className="text-ft-dim text-[10px] font-mono uppercase">Carbs</p>
                  <p className="text-ft-white text-sm font-mono font-bold">{Math.round(selected.carbs)}g</p>
                </div>
                <div>
                  <p className="text-ft-dim text-[10px] font-mono uppercase">Fat</p>
                  <p className="text-ft-white text-sm font-mono font-bold">{Math.round(selected.fat)}g</p>
                </div>
              </div>
              <p className="text-ft-muted text-[10px] font-mono mt-1.5 text-center">
                per {selected.servingSize}{selected.servingUnit}
              </p>
            </Card>
            <div className="flex items-center gap-3">
              <label className="text-ft-dim text-xs font-mono">Servings:</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="flex-1 bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white text-center focus:outline-none focus:border-ft-dim"
              />
            </div>
            <button
              onClick={handleConfirm}
              className="w-full bg-ft-white text-ft-bg font-mono text-sm font-bold py-2.5 rounded hover:bg-ft-light transition-colors"
            >
              Add to Meal
            </button>
          </div>
        ) : (
          <>
            {/* Search mode */}
            {mode === "search" && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search foods (e.g. chicken breast)..."
                  className="w-full bg-ft-surface border border-ft-card rounded px-3 py-2.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim mb-3"
                />
                <div className="flex-1 overflow-y-auto pb-8">
                  {searching && (
                    <p className="text-ft-dim text-xs font-mono text-center py-4">Searching...</p>
                  )}
                  {!searching && query.length >= 2 && results.length === 0 && (
                    <p className="text-ft-muted text-xs font-mono text-center py-4">No foods found</p>
                  )}
                  {results.map((food, i) => (
                    <button
                      key={food.id ?? `${food.source}-${i}`}
                      onClick={() => setSelected(food)}
                      className="w-full text-left px-3 py-2.5 border-b border-ft-card hover:bg-ft-surface transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-ft-white text-sm font-mono">{food.name}</p>
                          <p className="text-ft-dim text-xs font-mono mt-0.5">
                            {Math.round(food.calories)} cal · {Math.round(food.protein)}p · {Math.round(food.carbs)}c · {Math.round(food.fat)}f
                            {food.brand && ` · ${food.brand}`}
                          </p>
                        </div>
                        {food.source !== "custom" && food.source !== "local" && (
                          <span className="text-ft-muted text-[9px] font-mono uppercase">{food.source}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Barcode mode */}
            {mode === "barcode" && (
              <div className="space-y-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeLookup()}
                  placeholder="Enter barcode number..."
                  inputMode="numeric"
                  className="w-full bg-ft-surface border border-ft-card rounded px-3 py-2.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <button
                  onClick={handleBarcodeLookup}
                  disabled={!barcode.trim() || searching}
                  className="w-full bg-ft-surface border border-ft-card rounded py-2.5 text-sm font-mono text-ft-light hover:border-ft-dim transition-colors disabled:opacity-50"
                >
                  {searching ? "Looking up..." : "Look Up Barcode"}
                </button>
                {results.length === 0 && !searching && barcode.trim() && (
                  <p className="text-ft-muted text-xs font-mono text-center">
                    No product found for this barcode
                  </p>
                )}
                {results.map((food, i) => (
                  <button
                    key={food.id ?? `barcode-${i}`}
                    onClick={() => setSelected(food)}
                    className="w-full text-left px-3 py-2.5 border border-ft-card rounded hover:bg-ft-surface transition-colors"
                  >
                    <p className="text-ft-white text-sm font-mono">{food.name}</p>
                    <p className="text-ft-dim text-xs font-mono mt-0.5">
                      {Math.round(food.calories)} cal · {Math.round(food.protein)}p · {Math.round(food.carbs)}c · {Math.round(food.fat)}f
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Custom food mode */}
            {mode === "custom" && (
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={cfName}
                  onChange={(e) => setCfName(e.target.value)}
                  placeholder="Food name"
                  className="w-full bg-ft-surface border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={cfServing}
                    onChange={(e) => setCfServing(e.target.value)}
                    placeholder="Serving size"
                    className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                  />
                  <select
                    value={cfUnit}
                    onChange={(e) => setCfUnit(e.target.value)}
                    className="bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                  >
                    <option value="g">grams</option>
                    <option value="oz">ounces</option>
                    <option value="ml">ml</option>
                    <option value="cup">cups</option>
                    <option value="piece">pieces</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Calories</label>
                    <input type="number" value={cfCal} onChange={(e) => setCfCal(e.target.value)} placeholder="0"
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
                  </div>
                  <div>
                    <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Protein</label>
                    <input type="number" value={cfProtein} onChange={(e) => setCfProtein(e.target.value)} placeholder="0"
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
                  </div>
                  <div>
                    <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Carbs</label>
                    <input type="number" value={cfCarbs} onChange={(e) => setCfCarbs(e.target.value)} placeholder="0"
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
                  </div>
                  <div>
                    <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Fat</label>
                    <input type="number" value={cfFat} onChange={(e) => setCfFat(e.target.value)} placeholder="0"
                      className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1.5 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-ft-dim text-xs font-mono">Servings:</label>
                  <input
                    type="number" step="0.25" min="0.25" value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 bg-ft-bg border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white text-center focus:outline-none focus:border-ft-dim"
                  />
                </div>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!cfName.trim()}
                  className="w-full bg-ft-white text-ft-bg font-mono text-sm font-bold py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
                >
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

  // Add food overlay
  const [addingTo, setAddingTo] = useState<string | null>(null); // mealType or mealId
  const [addingMealType, setAddingMealType] = useState<string>(""); // the mealType when adding

  // Target form
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [tCal, setTCal] = useState("");
  const [tProtein, setTProtein] = useState("");
  const [tCarbs, setTCarbs] = useState("");
  const [tFat, setTFat] = useState("");

  const fetchDay = useCallback((d: string) => {
    setLoading(true);
    fetch(`/api/nutrition/meals?date=${d}`)
      .then((r) => r.ok ? r.json() : { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } })
      .then((data) => {
        setMeals(data.meals ?? []);
        setTotals(data.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDay(date);
    // Fetch targets
    fetch("/api/nutrition/targets")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.target) {
          setTarget(data.target);
          setTCal(data.target.calories?.toString() ?? "");
          setTProtein(data.target.protein?.toString() ?? "");
          setTCarbs(data.target.carbs?.toString() ?? "");
          setTFat(data.target.fat?.toString() ?? "");
        }
      })
      .catch(() => {});
  }, [date, fetchDay]);

  const handleAddFood = async (food: FoodItem, quantity: number, mealType: string) => {
    // Find existing meal of this type for this date, or create one
    const existingMeal = meals.find((m) => m.mealType === mealType);

    if (existingMeal) {
      // Add item to existing meal
      const res = await fetch(`/api/nutrition/meals/${existingMeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addItem: {
            foodItemId: food.id,
            food: food.id ? undefined : food,
            quantity,
          },
        }),
      });
      if (res.ok) {
        fetchDay(date);
      }
    } else {
      // Create new meal with this item
      const res = await fetch("/api/nutrition/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mealType,
          items: [{
            foodItemId: food.id,
            food: food.id ? undefined : food,
            quantity,
          }],
        }),
      });
      if (res.ok) {
        fetchDay(date);
      }
    }
    setAddingTo(null);
  };

  const handleRemoveItem = async (mealId: string, itemId: string) => {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeItemId: itemId }),
    });
    if (res.ok) {
      fetchDay(date);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const res = await fetch(`/api/nutrition/meals/${mealId}`, { method: "DELETE" });
    if (res.ok) {
      fetchDay(date);
    }
  };

  const handleSaveTargets = async () => {
    const res = await fetch("/api/nutrition/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calories: tCal ? parseFloat(tCal) : null,
        protein: tProtein ? parseFloat(tProtein) : null,
        carbs: tCarbs ? parseFloat(tCarbs) : null,
        fat: tFat ? parseFloat(tFat) : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTarget(data);
      setShowTargetForm(false);
    }
  };

  const changeDate = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split("T")[0]);
  };

  // Group meals by type
  const mealsByType = MEAL_TYPES.map((type) => ({
    type,
    label: MEAL_LABELS[type],
    meals: meals.filter((m) => m.mealType === type),
  }));

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Food Search Overlay */}
      {addingTo && (
        <FoodSearch
          onSelect={(food, qty) => handleAddFood(food, qty, addingMealType)}
          onClose={() => setAddingTo(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-mono font-bold tracking-wide">Nutrition</h1>
        <a
          href="/nutrition/plans"
          className="px-3 py-1.5 text-sm font-mono text-ft-dim hover:text-ft-light border border-ft-border rounded transition-colors"
        >
          Meal Plans
        </a>
      </div>
      <p className="text-ft-dim text-sm font-mono mb-4">Track your daily food intake</p>

      {/* Date Picker */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => changeDate(-1)} className="text-ft-dim hover:text-ft-light text-lg font-mono px-2">
          &larr;
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-ft-surface border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim"
        />
        <button onClick={() => changeDate(1)} className="text-ft-dim hover:text-ft-light text-lg font-mono px-2">
          &rarr;
        </button>
      </div>

      {/* Daily Summary */}
      <Card className="mb-4">
        <div className="grid grid-cols-4 gap-3 text-center mb-3">
          <div>
            <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Calories</p>
            <p className="text-ft-white text-lg font-mono font-bold">{totals.calories}</p>
            {target?.calories && (
              <p className="text-ft-muted text-[10px] font-mono">/ {Number(target.calories)}</p>
            )}
          </div>
          <div>
            <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Protein</p>
            <p className="text-ft-white text-lg font-mono font-bold">{totals.protein}g</p>
            {target?.protein && (
              <p className="text-ft-muted text-[10px] font-mono">/ {Number(target.protein)}g</p>
            )}
          </div>
          <div>
            <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Carbs</p>
            <p className="text-ft-white text-lg font-mono font-bold">{totals.carbs}g</p>
            {target?.carbs && (
              <p className="text-ft-muted text-[10px] font-mono">/ {Number(target.carbs)}g</p>
            )}
          </div>
          <div>
            <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider">Fat</p>
            <p className="text-ft-white text-lg font-mono font-bold">{totals.fat}g</p>
            {target?.fat && (
              <p className="text-ft-muted text-[10px] font-mono">/ {Number(target.fat)}g</p>
            )}
          </div>
        </div>
        {target?.calories && (
          <ProgressBar
            value={Math.min(totals.calories, Number(target.calories))}
            max={Number(target.calories)}
            label="Daily Calories"
            showValues
          />
        )}
        <button
          onClick={() => setShowTargetForm(!showTargetForm)}
          className="mt-2 text-ft-muted text-[10px] font-mono hover:text-ft-light transition-colors"
        >
          {target ? "Edit targets" : "Set daily targets"}
        </button>
        {showTargetForm && (
          <div className="mt-3 pt-3 border-t border-ft-border space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Cal</label>
                <input type="number" value={tCal} onChange={(e) => setTCal(e.target.value)} placeholder="2000"
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
              </div>
              <div>
                <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Protein</label>
                <input type="number" value={tProtein} onChange={(e) => setTProtein(e.target.value)} placeholder="150"
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
              </div>
              <div>
                <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Carbs</label>
                <input type="number" value={tCarbs} onChange={(e) => setTCarbs(e.target.value)} placeholder="200"
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
              </div>
              <div>
                <label className="text-ft-dim text-[10px] font-mono uppercase block mb-0.5">Fat</label>
                <input type="number" value={tFat} onChange={(e) => setTFat(e.target.value)} placeholder="65"
                  className="w-full bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowTargetForm(false)} className="text-ft-dim text-xs font-mono hover:text-ft-light">
                Cancel
              </button>
              <button onClick={handleSaveTargets} className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-3 py-1 rounded hover:bg-ft-light">
                Save
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Meals by Type */}
      {loading ? (
        <p className="text-ft-dim text-sm font-mono text-center py-8">Loading...</p>
      ) : (
        <div className="space-y-4">
          {mealsByType.map(({ type, label, meals: typeMeals }) => (
            <Card key={type}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm font-bold text-ft-white">{label}</h3>
                <button
                  onClick={() => { setAddingMealType(type); setAddingTo(type); }}
                  className="text-ft-dim text-xs font-mono hover:text-ft-light"
                >
                  + Add
                </button>
              </div>

              {typeMeals.length === 0 ? (
                <p className="text-ft-muted text-xs font-mono py-2">No items logged</p>
              ) : (
                <div className="space-y-1">
                  {typeMeals.flatMap((meal) =>
                    meal.items.map((item) => {
                      const cal = Math.round(Number(item.foodItem.calories) * Number(item.quantity));
                      const pro = Math.round(Number(item.foodItem.protein) * Number(item.quantity));
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1.5 border-b border-ft-border/30 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-ft-light text-xs font-mono truncate">
                              {item.foodItem.name}
                            </p>
                            <p className="text-ft-muted text-[10px] font-mono">
                              {Number(item.quantity)} serving{Number(item.quantity) !== 1 ? "s" : ""} · {cal} cal · {pro}g protein
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(meal.id, item.id)}
                            className="text-ft-muted text-xs hover:text-ft-danger ml-2 shrink-0"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })
                  )}
                  {/* Meal subtotal */}
                  {typeMeals.some((m) => m.items.length > 0) && (
                    <div className="flex items-center justify-between pt-1.5 text-ft-dim">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase">Subtotal</span>
                        {typeMeals.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleDeleteMeal(m.id)}
                            className="text-[10px] font-mono text-ft-muted hover:text-ft-danger transition-colors"
                            title="Delete meal"
                          >
                            Delete
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono">
                        {typeMeals.reduce(
                          (sum, m) => sum + m.items.reduce((s, i) => s + Math.round(Number(i.foodItem.calories) * Number(i.quantity)), 0),
                          0
                        )} cal
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
