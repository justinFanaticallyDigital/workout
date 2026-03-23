"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PlanItem {
  id: string;
  quantity: number;
  foodItem: FoodItem;
}

interface PlanMeal {
  id: string;
  mealType: string;
  items: PlanItem[];
}

interface PlanDay {
  id: string;
  dayNumber: number;
  meals: PlanMeal[];
}

interface MealPlan {
  id: string;
  name: string;
  days: number;
  calorieTarget: number | null;
  proteinPct: number | null;
  carbsPct: number | null;
  fatPct: number | null;
  mealsPerDay: number;
  preferences: string | null;
  isActive: boolean;
  planDays: PlanDay[];
  createdAt: string;
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export default function MealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Generator form state
  const [genName, setGenName] = useState("");
  const [genDays, setGenDays] = useState(7);
  const [genCalories, setGenCalories] = useState(2000);
  const [genProtein, setGenProtein] = useState(30);
  const [genCarbs, setGenCarbs] = useState(40);
  const [genFat, setGenFat] = useState(30);
  const [genMeals, setGenMeals] = useState(3);
  const [genPrefs, setGenPrefs] = useState("");

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/nutrition/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleGenerate = async () => {
    if (genCalories < 800) return;
    // Validate macro split sums to 100
    const total = genProtein + genCarbs + genFat;
    if (total < 95 || total > 105) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/nutrition/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: genName || `${genCalories} cal Plan`,
          days: genDays,
          calorieTarget: genCalories,
          proteinPct: genProtein,
          carbsPct: genCarbs,
          fatPct: genFat,
          mealsPerDay: genMeals,
          preferences: genPrefs || null,
        }),
      });
      if (res.ok) {
        setShowGenerator(false);
        setGenName("");
        setGenPrefs("");
        loadPlans();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (planId: string) => {
    const res = await fetch(`/api/nutrition/plans/${planId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    }
  };

  const handleApplyDay = async (planDay: PlanDay) => {
    // Apply a plan day's meals to today's nutrition log
    const today = new Date().toISOString().split("T")[0];

    for (const meal of planDay.meals) {
      if (meal.items.length === 0) continue;
      await fetch("/api/nutrition/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          mealType: meal.mealType,
          items: meal.items.map((item) => ({
            foodItemId: item.foodItem.id,
            quantity: Number(item.quantity),
          })),
        }),
      });
    }
    // Navigate to nutrition page
    window.location.href = "/nutrition";
  };

  const calcDayTotals = (day: PlanDay) => {
    let calories = 0,
      protein = 0,
      carbs = 0,
      fat = 0;
    for (const meal of day.meals) {
      for (const item of meal.items) {
        const qty = Number(item.quantity);
        calories += Number(item.foodItem.calories) * qty;
        protein += Number(item.foodItem.protein) * qty;
        carbs += Number(item.foodItem.carbs) * qty;
        fat += Number(item.foodItem.fat) * qty;
      }
    }
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  };

  const macroTotal = genProtein + genCarbs + genFat;
  const macroValid = macroTotal >= 95 && macroTotal <= 105;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="h-8 bg-ft-card rounded animate-pulse w-48" />
        <div className="h-40 bg-ft-card rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-body text-ft-white font-bold">
            Meal Plans
          </h1>
          <p className="text-ft-dim text-sm font-body mt-1">
            Generate and manage meal plans based on your macro targets
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/nutrition"
            className="px-3 py-1.5 text-sm font-body text-ft-dim hover:text-ft-light border border-ft-border rounded transition-colors"
          >
            Daily Log
          </Link>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="px-3 py-1.5 text-sm font-body bg-ft-white text-ft-bg rounded hover:bg-ft-light transition-colors"
          >
            + Generate Plan
          </button>
        </div>
      </div>

      {/* Generator Form */}
      {showGenerator && (
        <Card>
          <h2 className="text-ft-white font-body font-bold mb-4">
            Generate Meal Plan
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ft-dim text-xs font-body mb-1">
                  Plan Name
                </label>
                <input
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                  placeholder="e.g. Bulk Plan"
                  className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-body mb-1">
                  Days
                </label>
                <select
                  value={genDays}
                  onChange={(e) => setGenDays(Number(e.target.value))}
                  className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                >
                  {[1, 3, 5, 7, 14].map((d) => (
                    <option key={d} value={d}>
                      {d} day{d > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ft-dim text-xs font-body mb-1">
                  Daily Calories
                </label>
                <input
                  type="number"
                  value={genCalories}
                  onChange={(e) => setGenCalories(Number(e.target.value))}
                  min={800}
                  max={6000}
                  className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-body mb-1">
                  Meals Per Day
                </label>
                <select
                  value={genMeals}
                  onChange={(e) => setGenMeals(Number(e.target.value))}
                  className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                >
                  {[2, 3, 4, 5].map((m) => (
                    <option key={m} value={m}>
                      {m} meals
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-ft-dim text-xs font-body mb-1">
                Macro Split (%)
                {!macroValid && (
                  <span className="text-ft-danger ml-2">
                    Total: {macroTotal}% (must be ~100%)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-ft-dim text-xs font-body">
                    Protein
                  </span>
                  <input
                    type="number"
                    value={genProtein}
                    onChange={(e) => setGenProtein(Number(e.target.value))}
                    min={10}
                    max={60}
                    className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                  />
                </div>
                <div>
                  <span className="text-ft-dim text-xs font-body">Carbs</span>
                  <input
                    type="number"
                    value={genCarbs}
                    onChange={(e) => setGenCarbs(Number(e.target.value))}
                    min={10}
                    max={60}
                    className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                  />
                </div>
                <div>
                  <span className="text-ft-dim text-xs font-body">Fat</span>
                  <input
                    type="number"
                    value={genFat}
                    onChange={(e) => setGenFat(Number(e.target.value))}
                    min={10}
                    max={60}
                    className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
                  />
                </div>
              </div>
              {/* Visual macro bar */}
              <div className="flex h-2 mt-2 rounded overflow-hidden">
                <div
                  className="bg-ft-data-1"
                  style={{ width: `${genProtein}%` }}
                />
                <div
                  className="bg-ft-data-2"
                  style={{ width: `${genCarbs}%` }}
                />
                <div
                  className="bg-ft-data-3"
                  style={{ width: `${genFat}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-body text-ft-dim mt-1">
                <span className="text-ft-data-1">P: {genProtein}%</span>
                <span className="text-ft-data-2">C: {genCarbs}%</span>
                <span className="text-ft-data-3">F: {genFat}%</span>
              </div>
            </div>

            <div>
              <label className="block text-ft-dim text-xs font-body mb-1">
                Dietary Preferences (optional)
              </label>
              <input
                value={genPrefs}
                onChange={(e) => setGenPrefs(e.target.value)}
                placeholder="e.g. vegetarian, low carb, no dairy"
                className="w-full bg-ft-bg border border-ft-border rounded px-3 py-2 text-sm font-body text-ft-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2 text-sm font-body text-ft-dim hover:text-ft-light border border-ft-border rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || genCalories < 800 || !macroValid}
                className="px-4 py-2 text-sm font-body bg-ft-white text-ft-bg rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Plan List */}
      {plans.length === 0 && !showGenerator ? (
        <EmptyState
          icon="🍽"
          title="No meal plans yet"
          description="Generate your first plan to get started with structured daily nutrition."
          actionLabel="Generate Plan"
          onAction={() => setShowGenerator(true)}
        />
      ) : (
        plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          return (
            <Card key={plan.id}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedPlan(isExpanded ? null : plan.id)
                }
              >
                <div>
                  <h3 className="text-ft-white font-body font-bold">
                    {plan.name}
                  </h3>
                  <div className="flex gap-4 text-ft-dim text-xs font-body mt-1">
                    <span>{plan.days} days</span>
                    <span>{plan.mealsPerDay} meals/day</span>
                    {plan.calorieTarget && (
                      <span>{Number(plan.calorieTarget)} cal target</span>
                    )}
                    {plan.preferences && <span>{plan.preferences}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(plan.id);
                    }}
                    className="text-ft-dim hover:text-ft-danger text-xs font-body transition-colors"
                  >
                    Delete
                  </button>
                  <span className="text-ft-dim">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-ft-border pt-4">
                  {/* Macro split summary */}
                  {plan.proteinPct && (
                    <div className="flex gap-4 text-xs font-body">
                      <span className="text-ft-data-1">
                        Protein: {Number(plan.proteinPct)}%
                      </span>
                      <span className="text-ft-data-2">
                        Carbs: {Number(plan.carbsPct)}%
                      </span>
                      <span className="text-ft-data-3">
                        Fat: {Number(plan.fatPct)}%
                      </span>
                    </div>
                  )}

                  {plan.planDays.map((day) => {
                    const totals = calcDayTotals(day);
                    const isDayExpanded = expandedDay === day.id;
                    return (
                      <div
                        key={day.id}
                        className="border border-ft-border rounded"
                      >
                        <div
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-ft-card transition-colors"
                          onClick={() =>
                            setExpandedDay(isDayExpanded ? null : day.id)
                          }
                        >
                          <span className="text-ft-white font-body text-sm">
                            Day {day.dayNumber}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-ft-dim text-xs font-body">
                              {totals.calories} cal &middot; P:{totals.protein}g
                              C:{totals.carbs}g F:{totals.fat}g
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyDay(day);
                              }}
                              className="px-2 py-1 text-xs font-body text-ft-success border border-ft-success rounded hover:bg-ft-success hover:text-ft-bg transition-colors"
                            >
                              Apply Today
                            </button>
                            <span className="text-ft-dim text-xs">
                              {isDayExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>

                        {isDayExpanded && (
                          <div className="border-t border-ft-border px-3 py-2 space-y-2">
                            {day.meals.map((meal) => (
                              <div key={meal.id}>
                                <h4 className="text-ft-light font-body text-xs font-bold uppercase tracking-wider">
                                  {MEAL_TYPE_LABELS[meal.mealType] ||
                                    meal.mealType}
                                </h4>
                                {meal.items.length === 0 ? (
                                  <p className="text-ft-dim text-xs font-body">
                                    No items
                                  </p>
                                ) : (
                                  <div className="space-y-1 mt-1">
                                    {meal.items.map((item) => {
                                      const qty = Number(item.quantity);
                                      return (
                                        <div
                                          key={item.id}
                                          className="flex justify-between text-xs font-body"
                                        >
                                          <span className="text-ft-light">
                                            {qty !== 1 && `${qty}× `}
                                            {item.foodItem.name}
                                          </span>
                                          <span className="text-ft-dim">
                                            {Math.round(
                                              Number(item.foodItem.calories) *
                                                qty
                                            )}{" "}
                                            cal &middot; P:
                                            {Math.round(
                                              Number(item.foodItem.protein) *
                                                qty
                                            )}
                                            g
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
