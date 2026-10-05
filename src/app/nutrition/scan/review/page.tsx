"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { SLOT_LABEL } from "@/lib/nutrition-view";
import { clearScan, loadScan, scanHref, type ScanHandoff } from "../../_components/scan-store";

type FieldKey = "servingSize" | "calories" | "fat" | "saturatedFat" | "carbs" | "fiber" | "sugar" | "protein" | "sodium";

const FIELDS: { key: FieldKey; label: string; unit: string; sub?: boolean; strong?: boolean }[] = [
  { key: "servingSize", label: "Serving size", unit: "g" },
  { key: "calories", label: "Calories", unit: "cal", strong: true },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "saturatedFat", label: "Saturated", unit: "g", sub: true },
  { key: "carbs", label: "Carb", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g", sub: true },
  { key: "sugar", label: "Sugar", unit: "g", sub: true },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
];

const LOW_CONFIDENCE = 0.7;

interface ParsedLabel {
  fields: Partial<Record<FieldKey | "name" | "brand" | "servingUnit", string | number | null>>;
  confidence: Partial<Record<string, number>>;
}

type Phase = "loading" | "parsing" | "ready" | "empty";

/**
 * Label review — the parsed (or blank) nutrition facts as an editable form.
 * Saving creates a FoodItem (source "label-scan") and, when the scan started
 * from a meal slot, fills that slot.
 */
export default function LabelReviewPage() {
  const router = useRouter();
  const toast = useToast();
  const [handoff, setHandoff] = useState<ScanHandoff | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [unit, setUnit] = useState("g");
  const [values, setValues] = useState<Record<FieldKey, string>>({ servingSize: "", calories: "", fat: "", saturatedFat: "", carbs: "", fiber: "", sugar: "", protein: "", sodium: "" });
  const [confidence, setConfidence] = useState<Partial<Record<string, number>>>({});
  const [mealName, setMealName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = loadScan();
    if (!h) {
      setPhase("empty");
      return;
    }
    setHandoff(h);
    if (h.mealId) {
      fetch(`/api/nutrition/saved-meals/${h.mealId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => setMealName(m?.name ?? null))
        .catch(() => undefined);
    }
    if (!h.image) {
      setPhase("ready");
      return;
    }
    setPhase("parsing");
    const ctrl = new AbortController();
    fetch("/api/nutrition/foods/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: h.image, mediaType: h.mediaType ?? "image/jpeg" }), signal: ctrl.signal })
      .then(async (r) => {
        if (r.status === 501) {
          toast.info("Automatic label reading is off — type the values from the label.");
          return null;
        }
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        return (await r.json()) as ParsedLabel;
      })
      .then((parsed) => {
        if (parsed) apply(parsed);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        toast.error(e instanceof Error ? e.message : "Couldn't read the label.");
      })
      .finally(() => setPhase("ready"));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (p: ParsedLabel) => {
    const f = p.fields ?? {};
    const str = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(v));
    if (f.name) setName(String(f.name));
    if (f.brand) setBrand(String(f.brand));
    if (f.servingUnit) setUnit(String(f.servingUnit));
    setValues((v) => {
      const next = { ...v };
      for (const { key } of FIELDS) next[key] = str(f[key]);
      return next;
    });
    setConfidence(p.confidence ?? {});
  };

  const filled = useMemo(() => FIELDS.filter((f) => values[f.key] !== "").length + (name ? 1 : 0) + (brand ? 1 : 0), [values, name, brand]);
  const flagged = (key: string) => confidence[key] !== undefined && (confidence[key] ?? 1) < LOW_CONFIDENCE;
  const num = (s: string) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || null,
          servingSize: num(values.servingSize) ?? 1,
          servingUnit: unit.trim() || "g",
          calories: num(values.calories) ?? 0,
          fat: num(values.fat) ?? 0,
          saturatedFat: num(values.saturatedFat),
          carbs: num(values.carbs) ?? 0,
          fiber: num(values.fiber),
          sugar: num(values.sugar),
          protein: num(values.protein) ?? 0,
          sodium: num(values.sodium),
          source: "label-scan",
        }),
      });
      if (!res.ok) throw new Error("Couldn't save the food.");
      const food = await res.json();

      if (handoff?.mealId) {
        const mealRes = await fetch(`/api/nutrition/saved-meals/${handoff.mealId}`);
        if (mealRes.ok) {
          const meal = await mealRes.json();
          const items: { foodItemId: string; quantity: number; role: string | null }[] = (meal.items ?? []).map((it: { foodItemId: string; quantity: unknown; role: string | null }) => ({ foodItemId: it.foodItemId, quantity: Number(it.quantity) || 1, role: it.role }));
          const slotIdx = handoff.role ? items.findIndex((it) => it.role === handoff.role) : -1;
          const entry = { foodItemId: food.id as string, quantity: 1, role: handoff.role ?? null };
          if (slotIdx >= 0) items[slotIdx] = entry;
          else items.push(entry);
          const patch = await fetch(`/api/nutrition/saved-meals/${handoff.mealId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
          if (!patch.ok) throw new Error("Saved the food, but couldn't add it to the meal.");
        }
      }
      clearScan();
      toast.success(`${food.name} saved${handoff?.mealId ? " and added" : ""}`);
      router.push(handoff?.back ?? "/nutrition/foods");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the food.");
      setSaving(false);
    }
  };

  const retakeHref = scanHref({ mealId: handoff?.mealId, role: handoff?.role, back: handoff?.back });
  const context = mealName ? `${mealName}${handoff?.role ? ` · ${SLOT_LABEL[handoff.role] ?? handoff.role}` : ""} · 1 serving` : null;

  if (phase === "empty") {
    return (
      <div className="pb-8">
        <ScreenHeader title="Review label" back={{ href: "/nutrition/foods", label: "Foods" }} />
        <div className="px-5">
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">Nothing to review</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Scan a label first, or enter a food by hand.</p>
            <div className="mt-3 flex gap-2">
              <Btn small href="/nutrition/scan">
                Scan a label
              </Btn>
              <Btn kind="quiet" small onClick={() => { setHandoff({ image: null, mediaType: null, mealId: null, role: null, back: "/nutrition/foods" }); setPhase("ready"); }}>
                Enter manually
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <ScreenHeader title="Review label" back={{ href: retakeHref, label: "Scan" }} right={<Stamp>{phase === "parsing" ? "Reading…" : `${filled} fields`}</Stamp>} />

      <div className="flex gap-3 px-5 pb-3.5">
        <div className="flex h-[112px] w-[84px] flex-shrink-0 items-end justify-center overflow-hidden rounded-ft-md border border-ft-border bg-ft-surface-alt pb-1.5 font-data text-[9px] tracking-[0.1em] text-ft-dim" style={handoff?.image ? undefined : { background: "repeating-linear-gradient(45deg, rgb(var(--ft-surface-alt)) 0 8px, rgb(var(--ft-surface)) 8px 16px)" }}>
          {handoff?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={handoff.image} alt="Label capture" className="h-full w-full object-cover" />
          ) : (
            "MANUAL"
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <TextField label="Name" value={name} onChange={setName} placeholder="Peanut Butter, Natural" autoFocus={!handoff?.image} />
          <TextField label="Brand" value={brand} onChange={setBrand} placeholder="—" />
        </div>
      </div>

      <div className="px-5">
        <Card className={["px-4 pb-1 pt-2", phase === "parsing" ? "animate-pulse" : ""].join(" ")}>
          {FIELDS.map((f, i) => {
            const flag = flagged(f.key);
            return (
              <div key={f.key} className={["flex items-center gap-2.5 py-[7px]", f.sub ? "pl-3.5" : "", i < FIELDS.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                <label htmlFor={`f-${f.key}`} className={["flex-1 font-body", f.sub ? "text-[13px] text-ft-light" : "text-[14px] text-ft-white", f.strong ? "font-semibold" : ""].join(" ")}>
                  {f.label}
                </label>
                {flag && <span className="rounded-full border border-ft-gold-border bg-ft-gold-bg px-[7px] py-[2px] font-data text-[8.5px] font-bold tracking-[0.14em] text-ft-gold-fg">CHECK</span>}
                <div className={["flex w-[108px] items-baseline justify-end gap-1 rounded-ft-sm border bg-ft-surface-raised px-2 py-[5px]", flag ? "border-ft-gold" : "border-ft-border"].join(" ")}>
                  <input
                    id={`f-${f.key}`}
                    inputMode="decimal"
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value.replace(/[^\d.]/g, "") }))}
                    placeholder="0"
                    className={["w-full bg-transparent text-right font-data text-[14.5px] font-bold outline-none placeholder:text-ft-dim", f.strong ? "text-ft-coral" : "text-ft-white"].join(" ")}
                  />
                  {f.key === "servingSize" ? (
                    <input aria-label="Serving unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-7 bg-transparent font-data text-[10.5px] text-ft-dim outline-none" />
                  ) : (
                    <span className="w-6 font-data text-[10.5px] text-ft-dim">{f.unit}</span>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {context && <div className="px-5 pt-3.5 font-data text-[10.5px] uppercase tracking-[0.12em] text-ft-dim">Adding to · {context}</div>}

      <div className="mt-5 flex gap-2.5 px-5">
        <Btn kind="quiet" href={retakeHref} className="flex-1">
          Retake
        </Btn>
        <Btn className="flex-[2]" onClick={save} disabled={!name.trim() || saving || phase === "parsing"}>
          {saving ? "Saving…" : "Save food"}
        </Btn>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <label className="block">
      <span className="t-eyebrow !text-[9px]">{label}</span>
      <input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-2.5 py-[7px] font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent" />
    </label>
  );
}
