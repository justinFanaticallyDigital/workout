"use client";

/** Food library — search the library (local + USDA) and add a custom food by hand. */
import { useEffect, useState } from "react";
import { Btn, Card, MacroTriple, ScreenHeader, SearchIcon, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal, fmtQty } from "@/lib/nutrition-math";
import NewFoodSheet, { type Food } from "../_components/NewFoodSheet";

export default function FoodsPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [library, setLibrary] = useState<Food[] | null>(null);
  const [libraryTick, setLibraryTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/nutrition/foods?mine=1", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { foods: [] }))
      .then((d) => setLibrary(d.foods ?? []))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [libraryTick]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setFoods([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/nutrition/foods?search=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { foods: [] }))
        .then((d) => setFoods(d.foods ?? []))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const searching = query.trim().length >= 2;
  const shown = searching ? foods : library ?? [];

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Foods"
        back={{ href: "/nutrition", label: "Nutrition" }}
        right={
          <Btn small onClick={() => setNewOpen(true)}>
            + New food
          </Btn>
        }
      />
      <div className="px-5">
        <label className="flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5">
          <SearchIcon size={16} className="text-ft-dim" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search foods" className="w-full bg-transparent font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted" />
        </label>
        <div className="t-eyebrow mb-1.5 mt-4">{searching ? (loading ? "Searching" : `${foods.length} results`) : library === null ? "Loading library" : `Library · ${library.length}`}</div>
        <div className="flex flex-col gap-2">
          {shown.map((f, i) => (
            <Card key={f.id ?? `${f.name}-${i}`} band={false} className="px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{f.name}</div>
                  <div className="font-body text-[11.5px] text-ft-dim">
                    {fmtQty(f.servingSize)} {f.servingUnit}
                    {f.brand ? ` · ${f.brand}` : ""}
                  </div>
                </div>
                <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(f.calories)} cal</div>
                {f.source !== "custom" && f.source !== "guide" && <Stamp tone="muted">{f.source}</Stamp>}
              </div>
              <MacroTriple f={Number(f.fat)} c={Number(f.carbs)} p={Number(f.protein)} size={10.5} gap={10} className="mt-1" />
            </Card>
          ))}
        </div>
      </div>
      <NewFoodSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSaved={(f) => {
          setNewOpen(false);
          toast.success(`${f.name} added`);
          setQuery("");
          setLibraryTick((t) => t + 1);
        }}
      />
    </div>
  );
}
