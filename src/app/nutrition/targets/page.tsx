"use client";

/** Edit the default targets (kcal · fat · carb · protein). Per-day overrides live in the Day Builder. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, ScreenHeader } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

const FIELDS: { key: "calories" | "fat" | "carbs" | "protein"; label: string; unit: string; dot?: string }[] = [
  { key: "calories", label: "Kcal", unit: "/ day" },
  { key: "fat", label: "Fat", unit: "g", dot: "bg-ft-gold" },
  { key: "carbs", label: "Carb", unit: "g", dot: "bg-ft-accent" },
  { key: "protein", label: "Protein", unit: "g", dot: "bg-ft-coral" },
];

export default function TargetsPage() {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>({ calories: "", fat: "", carbs: "", protein: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/nutrition/targets")
      .then((r) => (r.ok ? r.json() : { target: null }))
      .then((d) => {
        const t = d.target;
        if (t) setValues({ calories: t.calories ?? "", fat: t.fat ?? "", carbs: t.carbs ?? "", protein: t.protein ?? "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const body = Object.fromEntries(FIELDS.map((f) => [f.key, values[f.key] === "" ? null : Number(values[f.key])]));
      const res = await fetch("/api/nutrition/targets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Couldn't save targets.");
      toast.success("Targets saved");
      router.push("/nutrition");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save targets.");
      setSaving(false);
    }
  };

  const kcalFromMacros = (Number(values.fat) || 0) * 9 + (Number(values.carbs) || 0) * 4 + (Number(values.protein) || 0) * 4;

  return (
    <div className="pb-8">
      <ScreenHeader title="Targets" back={{ href: "/nutrition", label: "Nutrition" }} sub="Default · every day without an override" />
      <div className="px-5">
        <Card className="px-4 py-4">
          <div className="grid grid-cols-2 gap-2.5">
            {FIELDS.map((f) => (
              <label key={f.key} className="rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2">
                <span className="t-eyebrow flex items-center gap-1.5 !text-[8.5px]">
                  {f.dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${f.dot}`} />}
                  {f.label}
                </span>
                <span className="mt-0.5 flex items-baseline gap-1">
                  <input
                    inputMode="numeric"
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value.replace(/[^\d]/g, "") }))}
                    disabled={loading}
                    className="w-full bg-transparent font-data text-[22px] font-bold text-ft-white outline-none"
                    placeholder="—"
                  />
                  <span className="whitespace-nowrap font-data text-[10px] text-ft-dim">{f.unit}</span>
                </span>
              </label>
            ))}
          </div>
          {kcalFromMacros > 0 && <div className="mt-3 font-data text-[10.5px] uppercase tracking-[0.06em] text-ft-dim">Macros add up to {kcalFromMacros.toLocaleString("en-US")} kcal</div>}
        </Card>
        <Btn fullWidth className="mt-4" onClick={save} disabled={saving || loading}>
          {saving ? "Saving…" : "Save targets"}
        </Btn>
      </div>
    </div>
  );
}
