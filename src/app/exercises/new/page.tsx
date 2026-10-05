"use client";

/** Create a custom exercise — name built as "Movement - Modification Equipment", category from the kit list. */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, CategoryChip, CategoryPickerSheet, ScreenHeader } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

const PRIMARY_MUSCLES = ["Chest", "Lats", "Quadriceps", "Hamstrings", "Glutes", "Biceps", "Triceps", "Shoulders", "Traps", "Calves", "Forearms", "Abs", "Erectors"];
const EQUIPMENT_OPTIONS = ["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell", "Band", "Lever Plate", "Smith Machine"];

const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";

export default function NewExercisePage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [modification, setModification] = useState("");
  const [pattern, setPattern] = useState<string | null>(null);
  const [primaryMuscle, setPrimaryMuscle] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState("");
  const [equipment, setEquipment] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const generatedName = useMemo(() => (name.trim() ? `${name.trim()}${modification.trim() ? ` - ${modification.trim()}` : ""}${equipment ? ` ${equipment}` : ""}` : ""), [name, modification, equipment]);

  const submit = async () => {
    if (!generatedName || !pattern || saving) return;
    setSaving(true);
    try {
      const secondaries = secondaryMuscles.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: generatedName, equipment: equipment || null, movementPattern: pattern, primaryMuscle: primaryMuscle || null, secondaryMuscle1: secondaries[0] ?? null, secondaryMuscle2: secondaries[1] ?? null }),
      });
      if (!res.ok) throw new Error("Couldn't create the exercise.");
      const created = await res.json().catch(() => null);
      toast.success(`${generatedName} added`);
      router.push(created?.id ? `/exercises/${created.id}` : "/exercises");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the exercise.");
      setSaving(false);
    }
  };

  return (
    <div className="pb-10">
      <ScreenHeader title="New exercise" back={{ href: "/exercises", label: "Exercises" }} sub="Movement · modification · equipment" />
      <div className="flex flex-col gap-3 px-5">
        <Card className="px-4 py-3.5">
          <div className="t-eyebrow">Preview</div>
          <div className="mt-1 font-data text-[17px] font-bold text-ft-white">{generatedName || "—"}</div>
          <div className="mt-1 flex items-center gap-2">
            {pattern ? <CategoryChip variant="pill" movementPattern={pattern} primaryMuscle={primaryMuscle || null} /> : <span className="font-body text-[12px] text-ft-dim">No category yet</span>}
          </div>
        </Card>

        <Card band={false} className="flex flex-col gap-3 px-4 py-4">
          <Field label="Movement">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bench Press, Curl, Row" className={inputCls} autoFocus />
          </Field>
          <Field label="Modification">
            <input value={modification} onChange={(e) => setModification(e.target.value)} placeholder="Incline, Romanian, Lateral" className={inputCls} />
          </Field>
          <Field label="Equipment">
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputCls}>
              <option value="">None / bodyweight</option>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <button type="button" onClick={() => setPickerOpen(true)} className={`${inputCls} flex items-center justify-between text-left`}>
              <span className={pattern ? "" : "text-ft-muted"}>{pattern ?? "Pick a category"}</span>
              <span className="text-[11px] text-ft-dim">▾</span>
            </button>
          </Field>
          <Field label="Primary muscle">
            <select value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value)} className={inputCls}>
              <option value="">Optional</option>
              {PRIMARY_MUSCLES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Secondary muscles">
            <input value={secondaryMuscles} onChange={(e) => setSecondaryMuscles(e.target.value)} placeholder="Front Deltoids, Triceps" className={inputCls} />
          </Field>
        </Card>

        <div className="flex gap-2.5">
          <Btn kind="quiet" href="/exercises" className="flex-1">
            Cancel
          </Btn>
          <Btn className="flex-[2]" onClick={submit} disabled={!generatedName || !pattern || saving}>
            {saving ? "Creating…" : "Create exercise"}
          </Btn>
        </div>
      </div>
      <CategoryPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        current={pattern}
        onPick={(p) => {
          setPattern(p);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="t-eyebrow mb-1 block !text-[9px]">{label}</span>
      {children}
    </label>
  );
}
