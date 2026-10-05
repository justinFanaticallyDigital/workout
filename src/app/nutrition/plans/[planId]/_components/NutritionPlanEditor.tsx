"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, ConfirmSheet, DayHeader, MacroTriple, PromptSheet, ReorderList, ScreenHeader, Seg, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtKcal } from "@/lib/nutrition-math";
import type { DayView, PlanDayView } from "@/lib/nutrition-view";
import { plural } from "@/lib/training";
import DayPickerSheet from "../../../_components/DayPickerSheet";

interface Props {
  plan: { id: string; name: string; isActive: boolean };
  days: PlanDayView[];
}

export default function NutritionPlanEditor({ plan: initialPlan, days: initialDays }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [plan, setPlan] = useState(initialPlan);
  const [days, setDays] = useState(initialDays);
  useEffect(() => {
    setPlan(initialPlan);
    setDays(initialDays);
  }, [initialPlan, initialDays]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong.");
  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/nutrition/plans/${plan.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
    router.refresh();
  };
  const setDayOrder = async (next: PlanDayView[]) => {
    const prev = days;
    setDays(next);
    try {
      await patch({ savedDayIds: next.map((d) => d.id) });
    } catch (e) {
      setDays(prev);
      fail(e);
    }
  };

  // A plan may repeat a day (Workout · Rest · Workout), so rows are keyed by position, not by the saved day.
  const rows = days.map((d) => ({ id: d.rowId, day: d }));
  const addDay = (d: DayView) => setDayOrder([...days, { ...d, rowId: `new-${Date.now()}` }]);

  return (
    <div className="pb-8">
      <ScreenHeader title={plan.name} back={{ href: "/nutrition/plans", label: "Plans" }} sub={plural(days.length, "day")} right={<Stamp tone={plan.isActive ? "teal" : "muted"}>{plan.isActive ? "active" : "archived"}</Stamp>} />
      <div className="px-5 pb-4">
        <Seg
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
          value={plan.isActive ? "active" : "archived"}
          onChange={async (v) => {
            const isActive = v === "active";
            setPlan((p) => ({ ...p, isActive }));
            try {
              await patch({ isActive });
            } catch (e) {
              setPlan((p) => ({ ...p, isActive: !isActive }));
              fail(e);
            }
          }}
        />
      </div>

      <div className="px-5">
        <ReorderList rows={rows} onReorder={(order) => setDayOrder(order.map((id) => days.find((d) => d.rowId === id)!))}>
          {({ day }, grip, i) => (
            <div className="pb-2.5">
              <Card className="flex items-center gap-2.5 px-4 py-3">
                <span {...grip} className={`font-data text-[13px] tracking-[2px] text-ft-dim ${grip.className ?? ""}`} aria-label="Drag to reorder">
                  ⠿
                </span>
                <div className="min-w-0 flex-1">
                  <DayHeader day={i + 1} name={day.name} right={day.override ? <Stamp tone="gold">Override</Stamp> : undefined} />
                  <MacroTriple f={day.macros.fat} c={day.macros.carbs} p={day.macros.protein} size={11} gap={10} className="mt-1" />
                </div>
                <div className="font-data text-[13px] font-bold text-ft-coral">{fmtKcal(day.macros.calories)}</div>
                <Link href={`/nutrition/days/${day.id}?plan=${plan.id}`} className="font-data text-[14px] text-ft-accent" aria-label={`Edit ${day.name}`}>
                  ›
                </Link>
                <button type="button" onClick={() => setDayOrder(days.filter((d) => d.rowId !== day.rowId))} aria-label={`Remove ${day.name} from plan`} className="px-1 font-data text-[12px] text-ft-dim">
                  ✕
                </button>
              </Card>
            </div>
          )}
        </ReorderList>
        <button type="button" onClick={() => setPickerOpen(true)} className="w-full rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-4 py-[11px] text-center font-data text-[11.5px] font-bold uppercase tracking-[0.12em] text-ft-accent">
          + Add day
        </button>
      </div>

      <div className="mt-6 flex gap-2.5 px-5">
        <Btn kind="quiet" small className="flex-1" onClick={() => setRenameOpen(true)}>
          Rename plan
        </Btn>
        <Btn kind="ghost" small className="flex-1 !border-ft-coral/50 !text-ft-coral" onClick={() => setDeleteOpen(true)}>
          Delete plan
        </Btn>
      </div>

      <DayPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(d) => {
          setPickerOpen(false);
          addDay(d);
        }}
      />
      <PromptSheet
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename plan"
        label="Name"
        initial={plan.name}
        onSubmit={async (name) => {
          try {
            await patch({ name });
            setPlan((p) => ({ ...p, name }));
            setRenameOpen(false);
          } catch (e) {
            fail(e);
          }
        }}
      />
      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete plan"
        body={`${plan.name} is deleted. Its days stay in My Days.`}
        confirmLabel="Delete plan"
        danger
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/nutrition/plans/${plan.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Couldn't delete the plan.");
            router.push("/nutrition/plans");
            router.refresh();
          } catch (e) {
            fail(e);
          }
        }}
      />
    </div>
  );
}
