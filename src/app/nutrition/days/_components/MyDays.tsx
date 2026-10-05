"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, MacroTriple, PromptSheet, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal } from "@/lib/nutrition-math";
import type { DayView } from "@/lib/nutrition-view";
import { plural } from "@/lib/training";

export default function MyDays({ days }: { days: DayView[] }) {
  const router = useRouter();
  const toast = useToast();
  const [newOpen, setNewOpen] = useState(false);

  const create = async (name: string) => {
    try {
      const res = await fetch("/api/nutrition/saved-days", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slotCount: 3 }) });
      if (!res.ok) throw new Error("Couldn't create the day.");
      const day = await res.json();
      router.push(`/nutrition/days/${day.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the day.");
    }
  };

  return (
    <div className="pb-8">
      <ScreenHeader
        title="My Days"
        back={{ href: "/nutrition", label: "Nutrition" }}
        right={
          <Btn small onClick={() => setNewOpen(true)}>
            + New day
          </Btn>
        }
      />
      <div className="flex flex-col gap-2.5 px-5">
        {days.length === 0 && <div className="font-body text-[13px] text-ft-dim">No saved days yet.</div>}
        {days.map((d) => {
          const filled = d.slots.filter((s) => s.meal).length;
          return (
            <Link key={d.id} href={`/nutrition/days/${d.id}`}>
              <Card band={false} className="px-4 py-[13px]">
                <div className="flex items-baseline gap-2.5">
                  <div className="min-w-0 flex-1 truncate font-data text-[14.5px] font-bold text-ft-white">{d.name}</div>
                  <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(d.macros.calories)} cal</div>
                </div>
                <MacroTriple f={d.macros.fat} c={d.macros.carbs} p={d.macros.protein} size={11.5} className="mt-1.5" />
                <div className="mt-[9px] flex items-center gap-2">
                  <span className="font-data text-[10.5px] uppercase tracking-[0.1em] text-ft-dim">{plural(filled, "meal")}</span>
                  {d.planName ? <Stamp>{d.planName}</Stamp> : <span className="font-data text-[10.5px] uppercase tracking-[0.1em] text-ft-dim">· Not in a plan</span>}
                  <div className="flex-1" />
                  <span className="font-data text-[15px] text-ft-accent">›</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <PromptSheet open={newOpen} onClose={() => setNewOpen(false)} title="New day" label="Name" placeholder="Workout" submitLabel="Create day" onSubmit={create} />
    </div>
  );
}
