"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AddCard, Btn, CameraIcon, Card, CardStrip, ConfirmSheet, MacroTriple, PromptSheet, ScreenHeader, SearchIcon, SectionHeader, Seg, Sheet, Stamp, StickyBar } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal, foodMacros, portionLabel, roundMacros, sumMacros } from "@/lib/nutrition-math";
import { MEAL_TYPE_LABEL, SLOT_LABEL, toMealView, type FoodView, type ItemView, type MealView, type TemplateView } from "@/lib/nutrition-view";
import { plural } from "@/lib/training";
import FoodPickerSheet from "../../../_components/FoodPickerSheet";
import QtySheet from "../../../_components/QtySheet";
import TemplateSheet from "../../../_components/TemplateSheet";
import { FrameTile, RoleTag } from "../../../_components/meal-ui";
import { scanHref } from "../../../_components/scan-store";
import { FoodTile } from "../../../_components/tiles";

interface MealBuilderProps {
  meal: MealView;
  templates: TemplateView[];
  backHref: string;
  backLabel: string;
}

type View = "frame" | "ingredients";
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const DEFAULT_NAME = "New meal";

/** Picker target: a frame role, an existing item to swap, or a plain extra. */
interface PickTarget {
  role: string | null;
  replaceIdx: number | null;
}

export default function MealBuilder({ meal: initial, templates, backHref, backLabel }: MealBuilderProps) {
  const router = useRouter();
  const toast = useToast();
  const [meal, setMeal] = useState(initial);
  const [view, setView] = useState<View>(initial.template ? "frame" : "ingredients");
  const [picker, setPicker] = useState<PickTarget | null>(null);
  const [qtyIdx, setQtyIdx] = useState<number | null>(null);
  const [menuIdx, setMenuIdx] = useState<number | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong.");
  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/nutrition/saved-meals/${initial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      return toMealView(await res.json());
    },
    [initial.id],
  );

  /** Every edit autosaves (the scan flow leaves this page), optimistic first, the server row replaces the guess. */
  const commitItems = async (items: ItemView[], extra: Record<string, unknown> = {}) => {
    const prev = meal;
    setMeal((m) => withItems(m, items));
    try {
      setMeal(await patch({ ...extra, items: items.map((i) => ({ foodItemId: i.foodItemId, quantity: i.quantity, role: i.role })) }));
    } catch (e) {
      setMeal(prev);
      fail(e);
    }
  };
  const commitMeta = async (body: { name?: string; mealType?: string | null }) => {
    const prev = meal;
    setMeal((m) => ({ ...m, ...(body.name !== undefined && { name: body.name }), ...(body.mealType !== undefined && { mealType: body.mealType }) }));
    try {
      setMeal(await patch(body));
    } catch (e) {
      setMeal(prev);
      fail(e);
    }
  };

  const slots = meal.template ? [...meal.template.slots].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const slotRoles = new Set(slots.map((s) => s.role));
  const itemIdxForRole = (role: string) => meal.items.findIndex((i) => i.role === role);
  const extras = meal.items.map((it, idx) => ({ it, idx })).filter(({ it }) => !it.role || !slotRoles.has(it.role));
  const filledCount = slots.filter((s) => itemIdxForRole(s.role) >= 0).length;
  const totals = meal.macros;
  const selfHref = `/nutrition/meals/${meal.id}?back=${encodeURIComponent(backHref)}`;

  const onPickFood = async (food: FoodView) => {
    const target = picker;
    setPicker(null);
    if (!target) return;
    let items = [...meal.items];
    let idx: number;
    if (target.replaceIdx !== null && items[target.replaceIdx]) {
      idx = target.replaceIdx;
      items[idx] = mkItem(food, 1, items[idx].role);
    } else if (target.role && itemIdxForRole(target.role) >= 0) {
      idx = itemIdxForRole(target.role);
      items[idx] = mkItem(food, 1, target.role);
    } else {
      items = [...items, mkItem(food, 1, target.role)];
      idx = items.length - 1;
    }
    await commitItems(items);
    setQtyIdx(idx);
  };
  const setQty = async (idx: number, quantity: number) => {
    const items = meal.items.map((it, i) => (i === idx ? mkItem(it.food, quantity, it.role) : it));
    setQtyIdx(null);
    await commitItems(items);
  };
  const removeItem = (idx: number) => {
    setMenuIdx(null);
    void commitItems(meal.items.filter((_, i) => i !== idx));
  };
  const setRole = (idx: number, role: string | null) => {
    setMenuIdx(null);
    const items = meal.items.map((it, i) => {
      if (i === idx) return { ...it, role };
      if (role && it.role === role) return { ...it, role: null }; // the slot's previous food becomes an extra
      return it;
    });
    void commitItems(items);
  };
  const onPickTemplate = (t: TemplateView | null) => {
    setTemplateOpen(false);
    const keep = new Set((t?.slots ?? []).map((s) => s.role));
    const items = meal.items.map((it) => (it.role && !keep.has(it.role) ? { ...it, role: null } : it));
    setMeal((m) => ({ ...m, template: t, templateId: t?.id ?? null }));
    void commitItems(items, { templateId: t?.id ?? null });
    setView(t ? "frame" : "ingredients");
  };

  /** Back / Save: an untouched "New meal" is deleted rather than left in the library. */
  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      if (meal.items.length === 0 && meal.name === DEFAULT_NAME) {
        await fetch(`/api/nutrition/saved-meals/${meal.id}`, { method: "DELETE" });
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setLeaving(false);
    }
  };

  const menuItem = menuIdx !== null ? meal.items[menuIdx] ?? null : null;
  const qtyItem = qtyIdx !== null ? meal.items[qtyIdx] ?? null : null;

  return (
    <div className="pb-32">
      <ScreenHeader title={meal.name} back={{ href: backHref, label: backLabel, onClick: leave }} right={<Stamp tone="coral">{fmtKcal(totals.calories)} cal</Stamp>} />

      <div className="px-5 pb-3.5">
        <Seg
          options={[
            { value: "frame", label: "Frame" },
            { value: "ingredients", label: "Ingredients" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <div className="flex gap-2 px-5 pb-3">
        <button type="button" onClick={() => setPicker({ role: null, replaceIdx: null })} className="flex flex-1 items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5 text-left">
          <SearchIcon size={15} className="text-ft-dim" />
          <span className="font-body text-[13.5px] text-ft-dim">Add ingredient</span>
        </button>
        <Btn href={scanHref({ mealId: meal.id, back: selfHref })} className="!px-3.5">
          <CameraIcon size={18} />
          Scan
        </Btn>
      </div>

      <div className="flex items-center gap-1.5 px-5 pb-[18px]">
        <span className="t-eyebrow mr-1 !text-[9px]">Tag</span>
        {MEAL_TYPES.map((t) => {
          const on = meal.mealType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => commitMeta({ mealType: on ? null : t })}
              className={["rounded-full border px-2.5 py-[3px] font-data text-[9.5px] font-bold uppercase tracking-[0.1em]", on ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface text-ft-light"].join(" ")}
            >
              {MEAL_TYPE_LABEL[t]}
            </button>
          );
        })}
      </div>

      {view === "frame" ? (
        <>
          <SectionHeader title="Frame" stamp={meal.template ? `${filledCount} / ${slots.length}` : undefined} action={{ label: meal.template ? "Edit frame" : "Pick frame", onClick: () => setTemplateOpen(true) }} />
          <div className="px-5">
            {meal.template ? (
              <Card className="px-4 pb-3.5 pt-4">
                <CardStrip inset>
                  {slots.map((s) => {
                    const idx = itemIdxForRole(s.role);
                    return (
                      <FrameTile
                        key={s.role}
                        role={s.role}
                        hint={s.hint}
                        item={idx >= 0 ? meal.items[idx] : null}
                        onPick={() => setPicker({ role: s.role, replaceIdx: null })}
                        onScan={() => router.push(scanHref({ mealId: meal.id, role: s.role, back: selfHref }))}
                        onOpen={() => setMenuIdx(idx)}
                      />
                    );
                  })}
                </CardStrip>
                {meal.template.description && <div className="mt-3 font-body text-[12px] text-ft-light">{meal.template.name} · {meal.template.description}</div>}
              </Card>
            ) : (
              <Card className="px-4 py-4">
                <div className="font-data text-[14.5px] font-bold text-ft-white">No frame</div>
                <p className="mt-1 font-body text-[13px] text-ft-light">A frame gives the meal slots — protein, carb, fat, filling, flavor — so you can see what&apos;s covered at a glance.</p>
                <Btn small className="mt-3" onClick={() => setTemplateOpen(true)}>
                  Pick a frame
                </Btn>
              </Card>
            )}
          </div>

          <SectionHeader title="Extra" className="mt-5" />
          <div className="flex flex-wrap gap-2 px-5">
            {extras.map(({ it, idx }) => (
              <FoodTile key={it.id} item={it} onClick={() => setMenuIdx(idx)} />
            ))}
            <AddCard label="Add" w={92} h={70} onClick={() => setPicker({ role: null, replaceIdx: null })} />
          </div>
        </>
      ) : (
        <div className="px-5">
          <Card band={false} className="px-4 py-1">
            {meal.items.length === 0 && <div className="py-3 font-body text-[13px] text-ft-dim">No ingredients yet.</div>}
            {meal.items.map((it, idx) => (
              <div key={it.id} className={["flex items-center gap-2.5 py-[9px]", idx < meal.items.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                <div className="w-[68px] flex-shrink-0">{it.role && slotRoles.has(it.role) ? <RoleTag role={it.role} size={9.5} /> : <span className="font-data text-[9.5px] font-bold uppercase tracking-[0.12em] text-ft-dim">Extra</span>}</div>
                <button type="button" onClick={() => setMenuIdx(idx)} className="min-w-0 flex-1 truncate text-left font-data text-[13.5px] font-semibold text-ft-white">
                  {it.food.name} <span className="text-[11px] text-ft-dim">▾</span>
                </button>
                <button type="button" onClick={() => setQtyIdx(idx)} className="whitespace-nowrap rounded-ft-sm border border-dashed border-ft-border px-[7px] py-[2px] font-data text-[11px] font-semibold text-ft-light">
                  {it.portion}
                </button>
                <div className="w-[34px] text-right font-data text-[12.5px] font-bold text-ft-white">{fmtKcal(it.macros.calories)}</div>
                <button type="button" onClick={() => removeItem(idx)} aria-label={`Remove ${it.food.name}`} className="px-1 font-data text-[12px] text-ft-dim">
                  ✕
                </button>
              </div>
            ))}
          </Card>
          <button type="button" onClick={() => setPicker({ role: null, replaceIdx: null })} className="mt-3 w-full rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-4 py-[11px] text-center font-data text-[11.5px] font-bold uppercase tracking-[0.12em] text-ft-accent">
            + Add ingredient
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-2.5 px-5">
        <Btn kind="quiet" small className="flex-1" onClick={() => setRenameOpen(true)}>
          Rename
        </Btn>
        <Btn kind="ghost" small className="flex-1 !border-ft-coral/50 !text-ft-coral" onClick={() => setDeleteOpen(true)}>
          Delete meal
        </Btn>
      </div>

      <StickyBar className="flex items-center gap-3">
        <div className="min-w-0">
          <div className="font-data text-[18px] font-bold leading-none text-ft-white">
            {fmtKcal(totals.calories)} <span className="text-[11px] font-medium text-ft-dim">CAL</span>
          </div>
          <MacroTriple f={totals.fat} c={totals.carbs} p={totals.protein} size={11} gap={10} className="mt-1" />
        </div>
        <div className="flex-1" />
        <Btn onClick={leave} disabled={leaving}>
          Save meal
        </Btn>
      </StickyBar>

      <FoodPickerSheet open={picker !== null} onClose={() => setPicker(null)} onPick={onPickFood} title={picker?.replaceIdx !== null && picker?.replaceIdx !== undefined ? "Swap food" : picker?.role ? `Pick ${SLOT_LABEL[picker.role] ?? picker.role}` : "Add ingredient"} />
      <QtySheet open={qtyItem !== null} onClose={() => setQtyIdx(null)} food={qtyItem?.food ?? null} quantity={qtyItem?.quantity ?? 1} onSave={(q) => (qtyIdx !== null ? setQty(qtyIdx, q) : undefined)} />
      <TemplateSheet open={templateOpen} onClose={() => setTemplateOpen(false)} templates={templates} currentId={meal.templateId} onPick={onPickTemplate} />
      <Sheet open={menuItem !== null} onClose={() => setMenuIdx(null)} title={menuItem?.food.name ?? ""}>
        {menuItem && menuIdx !== null && (
          <div className="flex flex-col gap-2">
            <div className="font-body text-[12.5px] text-ft-light">
              {menuItem.portion} · {fmtKcal(menuItem.macros.calories)} cal{menuItem.role && slotRoles.has(menuItem.role) ? ` · ${SLOT_LABEL[menuItem.role] ?? menuItem.role} slot` : " · extra"}
            </div>
            <Btn kind="quiet" fullWidth onClick={() => { const i = menuIdx; setMenuIdx(null); setPicker({ role: menuItem.role, replaceIdx: i }); }}>
              Swap food
            </Btn>
            <Btn kind="quiet" fullWidth onClick={() => { const i = menuIdx; setMenuIdx(null); setQtyIdx(i); }}>
              Quantity · {menuItem.portion}
            </Btn>
            {menuItem.role && slotRoles.has(menuItem.role) && (
              <Btn kind="quiet" fullWidth onClick={() => setRole(menuIdx, null)}>
                Move to extras
              </Btn>
            )}
            {slots.filter((s) => s.role !== menuItem.role).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {slots
                  .filter((s) => s.role !== menuItem.role)
                  .map((s) => (
                    <Btn key={s.role} kind="quiet" small onClick={() => setRole(menuIdx, s.role)}>
                      Set as {SLOT_LABEL[s.role] ?? s.role}
                    </Btn>
                  ))}
              </div>
            )}
            <Btn kind="ghost" fullWidth className="!border-ft-coral/50 !text-ft-coral" onClick={() => removeItem(menuIdx)}>
              Remove
            </Btn>
          </div>
        )}
      </Sheet>
      <PromptSheet
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename meal"
        label="Name"
        initial={meal.name === DEFAULT_NAME ? "" : meal.name}
        placeholder="Oats & Eggs"
        onSubmit={async (name) => {
          await commitMeta({ name });
          setRenameOpen(false);
        }}
      />
      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete meal"
        body={`${meal.name} is deleted. ${meal.usedInDays > 0 ? `${plural(meal.usedInDays, "day slot")} that used it become empty.` : "It isn't used in any day."}`}
        confirmLabel="Delete meal"
        danger
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/nutrition/saved-meals/${meal.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Couldn't delete the meal.");
            router.push(backHref);
            router.refresh();
          } catch (e) {
            fail(e);
          }
        }}
      />
    </div>
  );
}

/* ── helpers ── */

function mkItem(food: FoodView, quantity: number, role: string | null): ItemView {
  return {
    id: `local-${food.id}-${role ?? "x"}-${Math.random().toString(36).slice(2, 8)}`,
    foodItemId: food.id,
    quantity,
    role,
    portion: portionLabel(food, quantity),
    macros: roundMacros(foodMacros(food, quantity)),
    food,
  };
}

function withItems(m: MealView, items: ItemView[]): MealView {
  return {
    ...m,
    items,
    macros: roundMacros(sumMacros(items.map((i) => i.macros))),
    roles: Array.from(new Set(items.map((i) => i.role).filter((r): r is string => !!r))),
  };
}
