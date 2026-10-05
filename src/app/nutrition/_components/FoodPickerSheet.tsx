"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Btn, MacroTriple, SearchIcon, Sheet, Stamp } from "@/components/kit";
import { fmtKcal, fmtQty } from "@/lib/nutrition-math";
import { toFoodView, type FoodView } from "@/lib/nutrition-view";
import NewFoodSheet, { type Food } from "./NewFoodSheet";

interface FoodPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (food: FoodView) => void;
  title?: string;
}

/**
 * Search the food library. The user's library shows before a query; typing
 * filters it instantly and adds USDA / Open Food Facts hits after a short
 * debounce. External hits are saved to the library on pick so they get an id.
 */
export default function FoodPickerSheet({ open, onClose, onPick, title = "Add ingredient" }: FoodPickerSheetProps) {
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState<Food[] | null>(null);
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    const ctrl = new AbortController();
    fetch("/api/nutrition/foods?mine=1", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { foods: [] }))
      .then((d) => setLibrary(d.foods ?? []))
      .catch(() => setLibrary([]));
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [open]);

  const q = query.trim();
  useEffect(() => {
    if (!open || q.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/nutrition/foods?search=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { foods: [] }))
        .then((d) => setResults(d.foods ?? []))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [open, q]);

  const list = useMemo(() => {
    if (q.length < 2) return library ?? [];
    const needle = q.toLowerCase();
    const local = (library ?? []).filter((f) => f.name.toLowerCase().includes(needle) || (f.brand ?? "").toLowerCase().includes(needle));
    const seen = new Set(local.map((f) => f.id));
    return [...local, ...results.filter((f) => !f.id || !seen.has(f.id))];
  }, [q, library, results]);

  const pick = async (f: Food) => {
    if (saving) return;
    if (f.id) return onPick(toFoodView({ ...f, id: f.id }));
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition/foods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (!res.ok) throw new Error("save failed");
      onPick(toFoodView(await res.json()));
    } catch {
      /* keep the sheet open so the user can try another food */
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sheet
        open={open && !newOpen}
        onClose={onClose}
        title={title}
        footer={
          <Btn kind="quiet" fullWidth onClick={() => setNewOpen(true)}>
            + New food by hand
          </Btn>
        }
      >
        <label className="flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5">
          <SearchIcon size={16} className="text-ft-dim" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search foods" className="w-full bg-transparent font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted" />
        </label>
        <div className="t-eyebrow mb-1 mt-3">{q.length < 2 ? (library === null ? "Loading library" : `Library · ${library.length}`) : loading ? "Searching" : `${list.length} results`}</div>
        <ul className="divide-y divide-ft-border-faint">
          {list.length === 0 && library !== null && !loading && <li className="py-4 font-body text-[13px] text-ft-dim">{q.length < 2 ? "No foods in your library yet." : "Nothing matched."}</li>}
          {list.map((f, i) => (
            <li key={f.id ?? `${f.source}-${i}`}>
              <button type="button" onClick={() => pick(f)} disabled={saving} className="flex w-full items-center gap-3 py-2.5 text-left disabled:opacity-60">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{f.name}</div>
                  <div className="font-body text-[11.5px] text-ft-dim">
                    {fmtQty(f.servingSize)} {f.servingUnit}
                    {f.brand ? ` · ${f.brand}` : ""}
                  </div>
                  <MacroTriple f={Number(f.fat)} c={Number(f.carbs)} p={Number(f.protein)} size={10} gap={8} className="mt-0.5" />
                </div>
                <div className="text-right">
                  <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(f.calories)} cal</div>
                  {f.source !== "custom" && f.source !== "guide" && f.source !== "label-scan" && (
                    <Stamp tone="muted" className="mt-1">
                      {f.source}
                    </Stamp>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
      <NewFoodSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSaved={(food) => {
          setNewOpen(false);
          if (food.id) onPick(toFoodView({ ...food, id: food.id }));
        }}
      />
    </>
  );
}
