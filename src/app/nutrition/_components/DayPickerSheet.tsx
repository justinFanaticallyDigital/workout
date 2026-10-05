"use client";

import { useEffect, useState } from "react";
import { Btn, MacroTriple, Sheet } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal } from "@/lib/nutrition-math";
import { toDayView, type DayView } from "@/lib/nutrition-view";

interface DayPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (day: DayView) => void;
  excludeIds?: string[];
}

/** Pick one of My Days to add to a plan, or create a new one. */
export default function DayPickerSheet({ open, onClose, onPick, excludeIds = [] }: DayPickerSheetProps) {
  const toast = useToast();
  const [days, setDays] = useState<DayView[] | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    if (!open) return;
    setDays(null);
    fetch("/api/nutrition/saved-days")
      .then((r) => (r.ok ? r.json() : { days: [] }))
      .then((d) => setDays((d.days ?? []).map(toDayView)))
      .catch(() => setDays([]));
  }, [open]);
  const list = (days ?? []).filter((d) => !excludeIds.includes(d.id));
  const createDay = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/nutrition/saved-days", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Day ${excludeIds.length + 1}`, slotCount: 3 }) });
      if (!res.ok) throw new Error("Couldn't create the day.");
      onPick(toDayView(await res.json()));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the day.");
    } finally {
      setCreating(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add day"
      footer={
        <Btn kind="ghost" fullWidth onClick={createDay} disabled={creating}>
          {creating ? "Creating…" : "+ New day"}
        </Btn>
      }
    >
      <ul className="divide-y divide-ft-border-faint">
        {days === null && <li className="py-4 font-body text-[13px] text-ft-dim">Loading…</li>}
        {days !== null && list.length === 0 && <li className="py-4 font-body text-[13px] text-ft-dim">Every saved day is already in this plan.</li>}
        {list.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => onPick(d)} className="flex w-full items-center gap-3 py-2.5 text-left">
              <div className="min-w-0 flex-1">
                <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{d.name}</div>
                <div className="mt-0.5 flex items-center gap-2">
                  <MacroTriple f={d.macros.fat} c={d.macros.carbs} p={d.macros.protein} size={10.5} gap={10} />
                  {d.planName && <span className="font-data text-[10px] uppercase tracking-[0.1em] text-ft-dim">in {d.planName}</span>}
                </div>
              </div>
              <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(d.macros.calories)} cal</div>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
