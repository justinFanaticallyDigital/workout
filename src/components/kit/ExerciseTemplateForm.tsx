"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import CategoryChip from "./CategoryChip";
import CategoryPickerSheet from "./CategoryPickerSheet";
import type { PickedExercise } from "./ExercisePickerSheet";
import {
  EMPTY_TEMPLATE,
  EQUIPMENT_HINT,
  EQUIPMENT_OPTIONS,
  MODIFIER_GROUPS,
  PATTERN_MUSCLE,
  PRIMARY_MUSCLES,
  buildExerciseName,
  inferCategory,
  type ExerciseTemplate,
} from "@/lib/exercise-template";

const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";

/** Template form state: fields + whether the category was set by hand (stops auto-inference). */
export function useExerciseTemplate(initialMovement = "") {
  const [value, setValue] = useState<ExerciseTemplate>({ ...EMPTY_TEMPLATE, movement: initialMovement });
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [muscleTouched, setMuscleTouched] = useState(false);
  const reset = (movement = "") => {
    setValue({ ...EMPTY_TEMPLATE, movement });
    setCategoryTouched(false);
    setMuscleTouched(false);
  };
  // Infer category + muscle from the movement text until the user sets each by hand.
  useEffect(() => {
    if (categoryTouched && muscleTouched) return;
    const guess = inferCategory(value.movement);
    setValue((v) => {
      const pattern = categoryTouched ? v.movementPattern : guess?.movementPattern ?? null;
      const muscle = muscleTouched ? v.primaryMuscle : guess?.primaryMuscle ?? null;
      if (v.movementPattern === pattern && v.primaryMuscle === muscle) return v;
      return { ...v, movementPattern: pattern, primaryMuscle: muscle };
    });
  }, [value.movement, categoryTouched, muscleTouched]);
  const name = buildExerciseName(value);
  return { value, setValue, name, categoryTouched, setCategoryTouched, setMuscleTouched, reset, valid: name.length > 0 && !!value.movementPattern };
}

export type ExerciseTemplateState = ReturnType<typeof useExerciseTemplate>;

/** POST the template. The API hands back the existing row when the name is already in the library. */
export async function createExerciseFromTemplate(t: ExerciseTemplate): Promise<{ exercise: PickedExercise; existed: boolean }> {
  const name = buildExerciseName(t);
  const res = await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, equipment: t.equipment, movementPattern: t.movementPattern, primaryMuscle: t.primaryMuscle }),
  });
  if (!res.ok) throw new Error("Couldn't create the exercise.");
  const row = (await res.json()) as PickedExercise;
  return { exercise: { id: row.id, name: row.name, movementPattern: row.movementPattern, primaryMuscle: row.primaryMuscle, equipment: row.equipment }, existed: res.status === 200 };
}

interface ExerciseTemplateFormProps {
  state: ExerciseTemplateState;
  /** Focus the movement field on mount (sheets). */
  autoFocus?: boolean;
}

/**
 * The template fields: movement · position · grip · tempo · equipment · category · muscle.
 * The preview card at the top shows the name the fields assemble.
 */
export default function ExerciseTemplateForm({ state, autoFocus = false }: ExerciseTemplateFormProps) {
  const { value, setValue, name, categoryTouched, setCategoryTouched, setMuscleTouched } = state;
  const [categoryOpen, setCategoryOpen] = useState(false);

  const toggle = (key: "position" | "grip" | "tempo", option: string) =>
    setValue((v) => ({ ...v, [key]: v[key].includes(option) ? v[key].filter((o) => o !== option) : [...v[key], option] }));

  return (
    <div className="flex flex-col gap-3">
      <Card className="px-4 py-3.5">
        <div className="t-eyebrow">Preview</div>
        <div className="mt-1 break-words font-data text-[17px] font-bold text-ft-white">{name || "—"}</div>
        <div className="mt-1.5 flex items-center gap-2">
          {value.movementPattern ? (
            <CategoryChip movementPattern={value.movementPattern} primaryMuscle={value.primaryMuscle} />
          ) : (
            <span className="font-body text-[12px] text-ft-dim">No category yet</span>
          )}
          {value.movementPattern && !categoryTouched && <span className="t-eyebrow !text-[8.5px]">auto</span>}
        </div>
      </Card>

      <Card band={false} className="flex flex-col gap-3.5 px-4 py-4">
        <label className="block">
          <span className="t-eyebrow mb-1 block !text-[9px]">Movement</span>
          <input
            value={value.movement}
            onChange={(e) => setValue((v) => ({ ...v, movement: e.target.value }))}
            placeholder="Squat, Bench Press, Curl"
            className={inputCls}
            autoFocus={autoFocus}
            autoCapitalize="words"
          />
        </label>

        {MODIFIER_GROUPS.map((g) => (
          <ChipGroup key={g.key} label={g.label}>
            {g.options.map((o) => (
              <Chip key={o} on={value[g.key].includes(o)} onClick={() => toggle(g.key, o)}>
                {o}
              </Chip>
            ))}
          </ChipGroup>
        ))}

        <ChipGroup label="Equipment">
          {EQUIPMENT_OPTIONS.map((o) => (
            <Chip key={o} on={value.equipment === o} onClick={() => setValue((v) => ({ ...v, equipment: v.equipment === o ? null : o }))}>
              {o}
              {EQUIPMENT_HINT[o] && <span className="ml-1 normal-case tracking-normal opacity-70">{EQUIPMENT_HINT[o]}</span>}
            </Chip>
          ))}
        </ChipGroup>

        <div>
          <span className="t-eyebrow mb-1 block !text-[9px]">Category</span>
          <button type="button" onClick={() => setCategoryOpen(true)} className={`${inputCls} flex items-center justify-between text-left`}>
            <span className={value.movementPattern ? "" : "text-ft-muted"}>{value.movementPattern ?? "Pick a category"}</span>
            <span className="text-[11px] text-ft-dim">▾</span>
          </button>
        </div>

        <label className="block">
          <span className="t-eyebrow mb-1 block !text-[9px]">Primary muscle</span>
          <select
            value={value.primaryMuscle ?? ""}
            onChange={(e) => {
              setMuscleTouched(true);
              setValue((v) => ({ ...v, primaryMuscle: e.target.value || null }));
            }}
            className={inputCls}
          >
            <option value="">Optional</option>
            {PRIMARY_MUSCLES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <CategoryPickerSheet
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        current={value.movementPattern}
        onPick={(p) => {
          setCategoryTouched(true);
          setMuscleTouched(true);
          setValue((v) => ({ ...v, movementPattern: p, primaryMuscle: PATTERN_MUSCLE[p] ?? v.primaryMuscle ?? null }));
          setCategoryOpen(false);
        }}
      />
    </div>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="t-eyebrow mb-1.5 block !text-[9px]">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={[
        "rounded-full border px-2.5 py-1 font-data text-[10px] font-bold uppercase tracking-[0.1em] transition-colors",
        on ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
