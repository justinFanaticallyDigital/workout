"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, ConfirmSheet, MacroTriple, PromptSheet, ReorderList, ScreenHeader, SectionHeader, Seg, Stepper, StickyBar } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal, type Macros } from "@/lib/nutrition-math";
import { fmtMacroShort, slotLabel, type DayView, type MealView, type SlotView } from "@/lib/nutrition-view";
import MealPickerSheet from "../../../_components/MealPickerSheet";
import { TotalBar } from "../../../_components/tiles";

interface DayBuilderProps {
  day: DayView;
  index: number | null;
  defaults: Macros | null;
  backHref: string;
  backLabel: string;
}

const TARGET_FIELDS: { key: keyof Macros; label: string; unit: string; dot?: string }[] = [
  { key: "calories", label: "Kcal", unit: "" },
  { key: "fat", label: "Fat", unit: "g", dot: "bg-ft-gold" },
  { key: "carbs", label: "Carb", unit: "g", dot: "bg-ft-accent" },
  { key: "protein", label: "Protein", unit: "g", dot: "bg-ft-coral" },
];

export default function DayBuilder({ day: initial, index, defaults, backHref, backLabel }: DayBuilderProps) {
  const router = useRouter();
  const toast = useToast();
  const [day, setDay] = useState(initial);
  useEffect(() => setDay(initial), [initial]);
  const [mode, setMode] = useState<"default" | "override">(initial.override ? "override" : "default");
  const [override, setOverride] = useState<Record<keyof Macros, string>>(toFields(initial.override ?? defaults));
  const [picker, setPicker] = useState<{ slotIdx: number } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong.");

  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/nutrition/saved-days/${day.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      router.refresh();
    },
    [day.id, router],
  );

  const slotsPayload = (slots: SlotView[]) => slots.map((s) => ({ label: s.label, mealId: s.meal?.id ?? null }));

  // ── targets ──
  const switchMode = async (next: "default" | "override") => {
    setMode(next);
    try {
      if (next === "default") {
        await patch({ calories: null, protein: null, carbs: null, fat: null });
        setDay((d) => ({ ...d, override: null }));
      } else {
        const seed = toFields(day.override ?? defaults);
        setOverride(seed);
        await patch(fromFields(seed));
        setDay((d) => ({ ...d, override: numFields(seed) }));
      }
    } catch (e) {
      fail(e);
    }
  };
  const commitOverride = async () => {
    try {
      await patch(fromFields(override));
      setDay((d) => ({ ...d, override: numFields(override) }));
    } catch (e) {
      fail(e);
    }
  };

  // ── slots ──
  const setSlotCount = async (n: number) => {
    const slots = day.slots.slice();
    while (slots.length < n) slots.push({ id: `tmp-${slots.length}`, sortOrder: slots.length, label: null, meal: null });
    while (slots.length > n) slots.pop();
    setDay((d) => ({ ...d, slots }));
    try {
      await patch({ slots: slotsPayload(slots) });
    } catch (e) {
      fail(e);
    }
  };
  const assignMeal = async (slotIdx: number, meal: MealView | null) => {
    const slots = day.slots.map((s, i) => (i === slotIdx ? { ...s, meal } : s));
    setDay((d) => ({ ...d, slots }));
    setPicker(null);
    try {
      await patch({ slots: slotsPayload(slots) });
    } catch (e) {
      fail(e);
    }
  };
  const reorder = async (order: string[]) => {
    const byId = new Map(day.slots.map((s) => [s.id, s]));
    const slots = order.map((id, i) => ({ ...byId.get(id)!, sortOrder: i }));
    setDay((d) => ({ ...d, slots }));
    try {
      await patch({ slots: slotsPayload(slots) });
    } catch (e) {
      fail(e);
    }
  };
  const newMeal = async (slotIdx: number) => {
    try {
      const res = await fetch("/api/nutrition/saved-meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "New meal", items: [] }) });
      if (!res.ok) throw new Error("Couldn't create the meal.");
      const meal = await res.json();
      const slots = day.slots.map((s, i) => (i === slotIdx ? { ...s, meal: { ...s.meal, id: meal.id } as MealView } : s));
      await patch({ slots: slotsPayload(slots) });
      router.push(`/nutrition/meals/${meal.id}?back=${encodeURIComponent(`/nutrition/days/${day.id}`)}`);
    } catch (e) {
      fail(e);
    }
  };

  const totals = day.slots.reduce(
    (acc, s) => (s.meal ? { calories: acc.calories + s.meal.macros.calories, protein: acc.protein + s.meal.macros.protein, carbs: acc.carbs + s.meal.macros.carbs, fat: acc.fat + s.meal.macros.fat } : acc),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const targets: Macros | null = mode === "override" ? numFields(override) : defaults;
  const filled = day.slots.filter((s) => s.meal).length;

  const saveAndBack = async () => {
    setSaving(true);
    try {
      if (mode === "override") await patch(fromFields(override));
      router.push(backHref);
      router.refresh();
    } catch (e) {
      fail(e);
      setSaving(false);
    }
  };

  return (
    <div className="pb-48">
      <ScreenHeader
        title={index ? `Day ${index} — ${day.name}` : day.name}
        back={{ href: backHref, label: backLabel }}
        right={
          <Btn kind="quiet" small onClick={() => setRenameOpen(true)}>
            Rename
          </Btn>
        }
      />

      <div className="px-5">
        <Card className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="t-eyebrow flex-1">Targets</div>
            <Seg
              options={[
                { value: "default", label: "Default" },
                { value: "override", label: "Override" },
              ]}
              value={mode}
              onChange={switchMode}
              className="w-[190px]"
            />
          </div>
          {mode === "override" ? (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {TARGET_FIELDS.map((f) => (
                  <label key={f.key} className="min-w-0 rounded-ft-md border border-ft-accent/40 bg-ft-surface-raised px-2 py-[7px]">
                    <span className="t-eyebrow flex items-center gap-1 !text-[8.5px]">
                      {f.dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${f.dot}`} />}
                      {f.label}
                    </span>
                    <span className="mt-0.5 flex items-baseline gap-0.5">
                      <input
                        inputMode="numeric"
                        value={override[f.key]}
                        onChange={(e) => setOverride((o) => ({ ...o, [f.key]: e.target.value.replace(/[^\d]/g, "") }))}
                        onBlur={commitOverride}
                        className="w-full min-w-0 bg-transparent font-data text-[16px] font-bold text-ft-white outline-none"
                      />
                      {f.unit && <span className="font-data text-[10px] text-ft-dim">{f.unit}</span>}
                    </span>
                  </label>
                ))}
              </div>
              {defaults && (
                <div className="-mt-1 font-data text-[10.5px] uppercase tracking-[0.06em] text-ft-dim">
                  Default · {fmtKcal(defaults.calories)} · {fmtMacroShort(defaults)}
                </div>
              )}
            </>
          ) : defaults ? (
            <div className="font-data text-[12.5px] text-ft-light">
              {fmtKcal(defaults.calories)} kcal · {fmtMacroShort(defaults)}
            </div>
          ) : (
            <div className="font-body text-[12.5px] text-ft-dim">No default targets set.</div>
          )}
          <div className="flex items-center border-t border-ft-border-faint pt-3">
            <div className="t-eyebrow flex-1">Meals</div>
            <Stepper value={day.slots.length} onChange={setSlotCount} min={1} max={8} />
          </div>
        </Card>
      </div>

      <SectionHeader title="Meals" stamp={`${filled} of ${day.slots.length}`} className="mt-5" />
      <div className="px-5">
        <ReorderList rows={day.slots} onReorder={reorder}>
          {(slot, grip, i) => (
            <div className="pb-2.5">
              {slot.meal ? (
                <Card band={false} className="flex items-center gap-2.5 px-3.5 py-[11px]">
                  <span {...grip} className={`font-data text-[13px] tracking-[2px] text-ft-dim ${grip.className ?? ""}`} aria-label="Drag to reorder">
                    ⠿
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="t-eyebrow">{slotLabel(slot, i)}</div>
                    <button type="button" onClick={() => setPicker({ slotIdx: i })} className="mt-px block max-w-full truncate text-left font-data text-[14px] font-semibold text-ft-white">
                      {slot.meal.name} <span className="text-[11px] text-ft-dim">▾</span>
                    </button>
                    <MacroTriple f={slot.meal.macros.fat} c={slot.meal.macros.carbs} p={slot.meal.macros.protein} size={11} gap={10} className="mt-1" />
                  </div>
                  <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(slot.meal.macros.calories)}</div>
                  <button type="button" onClick={() => assignMeal(i, null)} aria-label="Clear slot" className="px-1 font-data text-[12px] text-ft-dim">
                    ✕
                  </button>
                </Card>
              ) : (
                <div className="rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="t-eyebrow flex-1 !text-ft-light">Meal {i + 1}</div>
                    <span className="font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">Empty</span>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Btn kind="ghost" small className="flex-1 !bg-ft-surface" onClick={() => setPicker({ slotIdx: i })}>
                      From My Meals
                    </Btn>
                    <Btn kind="ghost" small className="flex-1 !bg-ft-surface" onClick={() => newMeal(i)}>
                      New meal
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          )}
        </ReorderList>
      </div>

      <div className="mt-2 px-5">
        <Btn kind="ghost" small className="!border-ft-coral/50 !text-ft-coral" onClick={() => setDeleteOpen(true)}>
          Delete day
        </Btn>
      </div>

      <StickyBar className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <TotalBar label="Kcal" value={totals.calories} target={targets?.calories ?? null} color="bg-ft-white" />
          <TotalBar label="Fat" value={totals.fat} target={targets?.fat ?? null} color="bg-ft-gold" unit="g" />
          <TotalBar label="Carb" value={totals.carbs} target={targets?.carbs ?? null} color="bg-ft-accent" unit="g" />
          <TotalBar label="Protein" value={totals.protein} target={targets?.protein ?? null} color="bg-ft-coral" unit="g" />
        </div>
        <Btn fullWidth onClick={saveAndBack} disabled={saving}>
          {saving ? "Saving…" : "Save day"}
        </Btn>
      </StickyBar>

      <MealPickerSheet open={picker !== null} onClose={() => setPicker(null)} onPick={(m) => picker && assignMeal(picker.slotIdx, m)} />
      <PromptSheet
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename day"
        label="Name"
        initial={day.name}
        onSubmit={async (name) => {
          try {
            await patch({ name });
            setDay((d) => ({ ...d, name }));
            setRenameOpen(false);
          } catch (e) {
            fail(e);
          }
        }}
      />
      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete day"
        body={`${day.name} is removed from My Days${day.planName ? ` and from ${day.planName}` : ""}. Its meals stay in My Meals.`}
        confirmLabel="Delete day"
        danger
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/nutrition/saved-days/${day.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Couldn't delete the day.");
            router.push("/nutrition/days");
            router.refresh();
          } catch (e) {
            fail(e);
          }
        }}
      />
    </div>
  );
}

function toFields(m: Macros | null): Record<keyof Macros, string> {
  return { calories: m ? String(Math.round(m.calories)) : "", protein: m ? String(Math.round(m.protein)) : "", carbs: m ? String(Math.round(m.carbs)) : "", fat: m ? String(Math.round(m.fat)) : "" };
}
function numFields(f: Record<keyof Macros, string>): Macros {
  return { calories: Number(f.calories) || 0, protein: Number(f.protein) || 0, carbs: Number(f.carbs) || 0, fat: Number(f.fat) || 0 };
}
function fromFields(f: Record<keyof Macros, string>): Record<string, number | null> {
  return { calories: f.calories === "" ? null : Number(f.calories), protein: f.protein === "" ? null : Number(f.protein), carbs: f.carbs === "" ? null : Number(f.carbs), fat: f.fat === "" ? null : Number(f.fat) };
}
