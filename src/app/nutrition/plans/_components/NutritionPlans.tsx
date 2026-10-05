"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, PromptSheet, ScreenHeader, SectionHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtMonthDay } from "@/lib/dates";
import { plural } from "@/lib/training";

export interface PlanRow {
  id: string;
  name: string;
  isActive: boolean;
  days: number;
  createdAt: string;
}

export default function NutritionPlans({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [newOpen, setNewOpen] = useState(false);
  const active = plans.filter((p) => p.isActive);
  const archived = plans.filter((p) => !p.isActive);

  const create = async (name: string) => {
    try {
      const res = await fetch("/api/nutrition/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error("Couldn't create the plan.");
      const plan = await res.json();
      router.push(`/nutrition/plans/${plan.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the plan.");
    }
  };

  const rows = (list: PlanRow[], dimmed: boolean) => (
    <div className="flex flex-col gap-2.5 px-5">
      {list.map((p) => (
        <Link key={p.id} href={`/nutrition/plans/${p.id}`}>
          <Card band={!dimmed} className={["flex items-center gap-3 px-4 py-3.5", dimmed ? "opacity-75" : ""].join(" ")}>
            <div className="min-w-0 flex-1">
              <div className="truncate font-data text-[15px] font-bold text-ft-white">{p.name}</div>
              <div className="mt-[3px] font-data text-[11.5px] uppercase tracking-[0.04em] text-ft-dim">
                {plural(p.days, "day")} · created {fmtMonthDay(p.createdAt)}
              </div>
            </div>
            <Stamp tone={p.isActive ? "teal" : "muted"}>{p.isActive ? "active" : "archived"}</Stamp>
            <span className="font-data text-[14px] text-ft-dim">›</span>
          </Card>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Plans"
        back={{ href: "/nutrition", label: "Nutrition" }}
        right={
          <Btn small onClick={() => setNewOpen(true)}>
            + New plan
          </Btn>
        }
      />
      {plans.length === 0 && <div className="px-5 font-body text-[13px] text-ft-dim">No nutrition plans yet. A plan is an ordered list of your saved days.</div>}
      {active.length > 0 && (
        <>
          <SectionHeader title="Active" />
          {rows(active, false)}
        </>
      )}
      {archived.length > 0 && (
        <>
          <SectionHeader title="Archived" className="mt-[22px]" />
          {rows(archived, true)}
        </>
      )}
      <PromptSheet open={newOpen} onClose={() => setNewOpen(false)} title="New plan" label="Name" placeholder="Cut — Week A" submitLabel="Create plan" onSubmit={create} />
    </div>
  );
}
