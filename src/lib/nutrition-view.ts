/**
 * Serializable view shapes for the Nutrition screens, built from Prisma rows
 * (Decimals become numbers; totals are computed once, server-side).
 */
import { foodMacros, num, portionLabel, roundMacros, sumMacros, ZERO_MACROS, type Macros } from "./nutrition-math";

export interface FoodView {
  id: string;
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

export interface ItemView {
  id: string;
  foodItemId: string;
  quantity: number;
  role: string | null;
  portion: string;
  macros: Macros;
  food: FoodView;
}

export interface TemplateView {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  slots: { role: string; required: boolean; sortOrder: number; hint: string | null }[];
}

interface RawTemplate {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  slots: { role: string; required: boolean; sortOrder: number; hint: string | null }[];
}

export function toTemplateView(t: RawTemplate): TemplateView {
  return { id: t.id, slug: t.slug, name: t.name, description: t.description ?? null, slots: t.slots.map((s) => ({ role: s.role, required: s.required, sortOrder: s.sortOrder, hint: s.hint })) };
}

export interface MealView {
  id: string;
  name: string;
  mealType: string | null;
  templateId: string | null;
  notes: string | null;
  items: ItemView[];
  macros: Macros;
  /** Frame roles that have an item. */
  roles: string[];
  template: TemplateView | null;
  usedInDays: number;
}

export interface SlotView {
  id: string;
  sortOrder: number;
  label: string | null;
  meal: MealView | null;
}

export interface DayView {
  id: string;
  name: string;
  /** All four null → use the default targets. */
  override: Macros | null;
  slots: SlotView[];
  macros: Macros;
  planId: string | null;
  planName: string | null;
}

/* ── structural inputs (no Prisma types) ── */
interface RawFood {
  id: string;
  name: string;
  brand: string | null;
  servingSize: unknown;
  servingUnit: string;
  calories: unknown;
  protein: unknown;
  carbs: unknown;
  fat: unknown;
  source: string;
}
interface RawItem { id: string; foodItemId: string; quantity: unknown; role: string | null; foodItem: RawFood }
interface RawTemplate { id: string; slug: string; name: string; slots: { role: string; required: boolean; sortOrder: number; hint: string | null }[] }
interface RawMeal {
  id: string;
  name: string;
  mealType: string | null;
  templateId: string | null;
  notes: string | null;
  items: RawItem[];
  template?: RawTemplate | null;
  _count?: { daySlots: number };
}
interface RawSlot { id: string; sortOrder: number; label: string | null; meal: RawMeal | null }
interface RawDay {
  id: string;
  name: string;
  calories: unknown;
  protein: unknown;
  carbs: unknown;
  fat: unknown;
  slots: RawSlot[];
  planDays?: { plan: { id: string; name: string } }[];
}

export function toFoodView(f: RawFood): FoodView {
  return {
    id: f.id,
    name: f.name,
    brand: f.brand,
    servingSize: num(f.servingSize),
    servingUnit: f.servingUnit,
    calories: num(f.calories),
    protein: num(f.protein),
    carbs: num(f.carbs),
    fat: num(f.fat),
    source: f.source,
  };
}

export function toItemView(it: RawItem): ItemView {
  const food = toFoodView(it.foodItem);
  return {
    id: it.id,
    foodItemId: it.foodItemId,
    quantity: num(it.quantity),
    role: it.role,
    portion: portionLabel(food, it.quantity),
    macros: roundMacros(foodMacros(food, it.quantity)),
    food,
  };
}

export function toMealView(m: RawMeal): MealView {
  const items = m.items.map(toItemView);
  return {
    id: m.id,
    name: m.name,
    mealType: m.mealType,
    templateId: m.templateId,
    notes: m.notes,
    items,
    macros: roundMacros(sumMacros(items.map((i) => i.macros))),
    roles: Array.from(new Set(items.map((i) => i.role).filter((r): r is string => !!r))),
    template: m.template ? { id: m.template.id, slug: m.template.slug, name: m.template.name, slots: m.template.slots } : null,
    usedInDays: m._count?.daySlots ?? 0,
  };
}

export function toDayView(d: RawDay): DayView {
  const slots = d.slots.map((s) => ({ id: s.id, sortOrder: s.sortOrder, label: s.label, meal: s.meal ? toMealView(s.meal) : null }));
  const hasOverride = [d.calories, d.protein, d.carbs, d.fat].some((v) => v != null);
  const plan = d.planDays?.[0]?.plan ?? null;
  return {
    id: d.id,
    name: d.name,
    override: hasOverride ? { calories: num(d.calories), protein: num(d.protein), carbs: num(d.carbs), fat: num(d.fat) } : null,
    slots,
    macros: roundMacros(sumMacros(slots.map((s) => s.meal?.macros ?? ZERO_MACROS))),
    planId: plan?.id ?? null,
    planName: plan?.name ?? null,
  };
}

/** The targets a day is measured against. */
/** One position in a plan. The same SavedDay can sit at several positions, so rows carry the MealPlanDay id for keys and reordering. */
export interface PlanDayView extends DayView {
  rowId: string;
}

export function toPlanDayViews(planDays: { id: string; savedDay: RawDay | null }[]): PlanDayView[] {
  const out: PlanDayView[] = [];
  for (const pd of planDays) {
    if (pd.savedDay) out.push({ ...toDayView(pd.savedDay), rowId: pd.id });
  }
  return out;
}

export function dayTargets(day: DayView, defaults: Macros | null): Macros | null {
  return day.override ?? defaults;
}

/** "22F · 68C · 42P" */
export function fmtMacroShort(m: Macros): string {
  return `${Math.round(m.fat)}F · ${Math.round(m.carbs)}C · ${Math.round(m.protein)}P`;
}

export const SLOT_LABEL: Record<string, string> = { protein: "Protein", carb: "Carb", fat: "Fat", filling: "Filling", flavor: "Flavor" };
export const SLOT_DOT: Record<string, string> = { protein: "bg-ft-coral", carb: "bg-ft-accent", fat: "bg-ft-gold", filling: "bg-ft-success", flavor: "bg-ft-light" };
export const SLOT_ORDER = ["protein", "carb", "fat", "filling", "flavor"] as const;

export const MEAL_TYPE_LABEL: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

/** "Meal 2 · Lunch" */
export function slotLabel(slot: SlotView, index: number): string {
  const base = `Meal ${index + 1}`;
  const tag = slot.label || (slot.meal?.mealType ? MEAL_TYPE_LABEL[slot.meal.mealType] : null);
  return tag ? `${base} · ${tag}` : base;
}
