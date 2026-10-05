"use client";

import { useState } from "react";
import { Btn, Sheet } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

/** A food row as returned by /api/nutrition/foods — id is null for USDA hits that haven't been saved locally yet. */
export interface Food {
  id: string | null;
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

const NEW_FIELDS: { key: string; label: string; unit: string }[] = [
  { key: "servingSize", label: "Serving", unit: "" },
  { key: "calories", label: "Calories", unit: "cal" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "carbs", label: "Carb", unit: "g" },
  { key: "protein", label: "Protein", unit: "g" },
];

/** Manual food entry: name, serving, calories and macros. Label scanning (P7) fills the same form. */
export default function NewFoodSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (food: Food) => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [v, setV] = useState<Record<string, string>>({ servingSize: "100", calories: "", fat: "", carbs: "", protein: "" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), servingSize: Number(v.servingSize) || 1, servingUnit: unit || "g", calories: Number(v.calories) || 0, fat: Number(v.fat) || 0, carbs: Number(v.carbs) || 0, protein: Number(v.protein) || 0, source: "custom" }),
      });
      if (!res.ok) throw new Error("Couldn't save the food.");
      onSaved(await res.json());
      setName("");
      setV({ servingSize: "100", calories: "", fat: "", carbs: "", protein: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the food.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New food"
      footer={
        <Btn fullWidth onClick={save} disabled={!name.trim() || saving}>
          {saving ? "Saving…" : "Save food"}
        </Btn>
      }
    >
      <div className="t-eyebrow mb-1">Name</div>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Peanut Butter, Natural" className="w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {NEW_FIELDS.map((f) => (
          <label key={f.key} className="rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2">
            <span className="t-eyebrow !text-[8.5px]">{f.label}</span>
            <span className="mt-0.5 flex items-baseline gap-1">
              <input inputMode="decimal" value={v[f.key]} onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value.replace(/[^\d.]/g, "") }))} className="w-full bg-transparent font-data text-[18px] font-bold text-ft-white outline-none" placeholder="0" />
              {f.key === "servingSize" ? (
                <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-12 bg-transparent text-right font-data text-[11px] text-ft-dim outline-none" />
              ) : (
                <span className="font-data text-[10px] text-ft-dim">{f.unit}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </Sheet>
  );
}
