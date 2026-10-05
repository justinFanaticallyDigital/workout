"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Btn,
  Card,
  CategoryChip,
  CategoryPickerSheet,
  Chev,
  ConfirmSheet,
  DayHeader,
  ExercisePickerSheet,
  PromptSheet,
  ScreenHeader,
  Seg,
  StatusStamp,
  TargetSheet,
  TargetTag,
  type PickedExercise,
} from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtStarted } from "@/lib/dates";
import { fmtTarget, plural, type Plan, type PlanDay, type PlanExercise, type PlanStatusValue } from "@/lib/training";

interface PlanEditorProps {
  plan: Plan;
  initialDayId: string | null;
}

type SheetState =
  | { kind: "none" }
  | { kind: "pick-exercise"; dayId: string; rowId?: string }
  | { kind: "category"; row: PlanExercise }
  | { kind: "target"; dayId: string; row: PlanExercise }
  | { kind: "rename-day"; day: PlanDay }
  | { kind: "delete-day"; day: PlanDay }
  | { kind: "rename-plan" }
  | { kind: "delete-plan" };

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

export default function PlanEditor({ plan: initial, initialDayId }: PlanEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const [plan, setPlan] = useState(initial);
  useEffect(() => setPlan(initial), [initial]);

  const [blockIdx, setBlockIdx] = useState(() => {
    if (initialDayId) {
      const i = initial.blocks.findIndex((b) => b.days.some((d) => d.id === initialDayId));
      if (i >= 0) return i;
    }
    const i = initial.blocks.findIndex((b) => b.status !== "completed");
    return i >= 0 ? i : 0;
  });
  const block = plan.blocks[Math.min(blockIdx, Math.max(0, plan.blocks.length - 1))] ?? null;
  const [openDayId, setOpenDayId] = useState<string | null>(initialDayId ?? block?.days[0]?.id ?? null);
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" });
  const close = useCallback(() => setSheet({ kind: "none" }), []);

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong.");
  const refresh = () => router.refresh();

  // ── plan-level ──
  const setStatus = async (status: PlanStatusValue) => {
    const prev = plan.status;
    setPlan((p) => ({ ...p, status }));
    try {
      await api(`/api/programs/${plan.id}`, "PATCH", { status });
      refresh();
    } catch (e) {
      setPlan((p) => ({ ...p, status: prev }));
      fail(e);
    }
  };
  const renamePlan = async (name: string) => {
    try {
      await api(`/api/programs/${plan.id}`, "PATCH", { name });
      setPlan((p) => ({ ...p, name }));
      close();
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const deletePlan = async () => {
    try {
      await api(`/api/programs/${plan.id}`, "DELETE");
      toast.success("Plan deleted");
      router.push("/training/plans");
      refresh();
    } catch (e) {
      fail(e);
    }
  };

  // ── days ──
  const addDay = async () => {
    if (!block) return;
    const name = `Day ${block.days.length + 1}`;
    try {
      const created = await api(`/api/blocks/${block.id}/days`, "POST", { name });
      setOpenDayId(created?.id ?? null);
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const renameDay = async (day: PlanDay, name: string) => {
    try {
      await api(`/api/blocks/day/${day.id}`, "PATCH", { name });
      mutateDay(day.id, (d) => ({ ...d, name }));
      close();
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const deleteDay = async (day: PlanDay) => {
    try {
      await api(`/api/blocks/day/${day.id}`, "DELETE");
      setPlan((p) => ({ ...p, blocks: p.blocks.map((b) => ({ ...b, days: b.days.filter((d) => d.id !== day.id) })) }));
      close();
      refresh();
    } catch (e) {
      fail(e);
    }
  };

  // ── exercises ──
  const mutateDay = (dayId: string, fn: (d: PlanDay) => PlanDay) =>
    setPlan((p) => ({ ...p, blocks: p.blocks.map((b) => ({ ...b, days: b.days.map((d) => (d.id === dayId ? fn(d) : d)) })) }));

  const pickExercise = async (dayId: string, rowId: string | undefined, ex: PickedExercise) => {
    close();
    try {
      if (rowId) {
        await api(`/api/blocks/day/${dayId}/exercises/${rowId}`, "PATCH", { exerciseId: ex.id });
        mutateDay(dayId, (d) => ({
          ...d,
          exercises: d.exercises.map((r) => (r.id === rowId ? { ...r, exerciseId: ex.id, name: ex.name, movementPattern: ex.movementPattern, primaryMuscle: ex.primaryMuscle, equipment: ex.equipment } : r)),
        }));
      } else {
        await api(`/api/blocks/day/${dayId}/exercises`, "POST", { exerciseId: ex.id, targetSets: 3, targetRepRange: "8-12" });
      }
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const setCategory = async (row: PlanExercise, movementPattern: string) => {
    close();
    try {
      await api(`/api/exercises/${row.exerciseId}`, "PATCH", { movementPattern });
      setPlan((p) => ({
        ...p,
        blocks: p.blocks.map((b) => ({ ...b, days: b.days.map((d) => ({ ...d, exercises: d.exercises.map((r) => (r.exerciseId === row.exerciseId ? { ...r, movementPattern } : r)) })) })),
      }));
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const setTarget = async (dayId: string, row: PlanExercise, next: { sets: number; reps: string }) => {
    try {
      await api(`/api/blocks/day/${dayId}/exercises/${row.id}`, "PATCH", { targetSets: next.sets, targetRepRange: next.reps });
      mutateDay(dayId, (d) => ({ ...d, exercises: d.exercises.map((r) => (r.id === row.id ? { ...r, targetSets: next.sets, targetRepRange: next.reps } : r)) }));
      close();
      refresh();
    } catch (e) {
      fail(e);
    }
  };
  const removeExercise = async (dayId: string, row: PlanExercise) => {
    mutateDay(dayId, (d) => ({ ...d, exercises: d.exercises.filter((r) => r.id !== row.id) }));
    try {
      await api(`/api/blocks/day/${dayId}/exercises/${row.id}`, "DELETE");
      refresh();
    } catch (e) {
      fail(e);
      refresh();
    }
  };
  const reorder = async (dayId: string, order: string[]) => {
    mutateDay(dayId, (d) => ({ ...d, exercises: order.map((id, i) => ({ ...d.exercises.find((r) => r.id === id)!, sortOrder: i + 1 })) }));
    try {
      await api(`/api/blocks/day/${dayId}/exercises/reorder`, "PATCH", { order });
    } catch (e) {
      fail(e);
      refresh();
    }
  };

  const dayCount = block?.days.length ?? 0;
  const started = fmtStarted(plan.startDate);

  return (
    <div className="pb-8">
      <ScreenHeader
        title={plan.name}
        back={{ href: "/training/plans", label: "Plans" }}
        sub={`${plural(dayCount, "day")}${started ? ` · started ${started}` : ""}`}
        right={<StatusStamp status={plan.status} />}
      />

      <div className="px-5 pb-4">
        <Seg
          options={[
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "completed", label: "Completed" },
          ]}
          value={plan.status}
          onChange={(v) => setStatus(v as PlanStatusValue)}
        />
      </div>

      {plan.blocks.length > 1 && (
        <div className="px-5 pb-4">
          <div className="t-eyebrow mb-1.5">Block</div>
          <Seg
            options={plan.blocks.map((b, i) => ({ value: String(i), label: `B${b.blockNumber}` }))}
            value={String(Math.min(blockIdx, plan.blocks.length - 1))}
            onChange={(v) => {
              setBlockIdx(Number(v));
              setOpenDayId(plan.blocks[Number(v)]?.days[0]?.id ?? null);
            }}
          />
          {block && <div className="mt-1.5 font-body text-[12.5px] text-ft-light">{block.name}</div>}
        </div>
      )}

      <div className="flex flex-col gap-2.5 px-5">
        {block?.days.map((day, i) => (
          <EdDay
            key={day.id}
            day={day}
            index={i + 1}
            open={openDayId === day.id}
            onToggle={() => setOpenDayId(openDayId === day.id ? null : day.id)}
            onAdd={() => setSheet({ kind: "pick-exercise", dayId: day.id })}
            onRename={() => setSheet({ kind: "rename-day", day })}
            onDelete={() => setSheet({ kind: "delete-day", day })}
            onPickName={(row) => setSheet({ kind: "pick-exercise", dayId: day.id, rowId: row.id })}
            onPickCategory={(row) => setSheet({ kind: "category", row })}
            onPickTarget={(row) => setSheet({ kind: "target", dayId: day.id, row })}
            onRemove={(row) => removeExercise(day.id, row)}
            onReorder={(order) => reorder(day.id, order)}
          />
        ))}
        <button
          type="button"
          onClick={addDay}
          className="rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-4 py-[11px] text-center font-data text-[11.5px] font-bold uppercase tracking-[0.12em] text-ft-accent"
        >
          + Add day
        </button>
      </div>

      <div className="mt-6 flex gap-2.5 px-5">
        <Btn kind="quiet" small className="flex-1" onClick={() => setSheet({ kind: "rename-plan" })}>
          Rename plan
        </Btn>
        <Btn kind="ghost" small className="flex-1 !border-ft-coral/50 !text-ft-coral" onClick={() => setSheet({ kind: "delete-plan" })}>
          Delete plan
        </Btn>
      </div>

      <ExercisePickerSheet
        open={sheet.kind === "pick-exercise"}
        onClose={close}
        title={sheet.kind === "pick-exercise" && sheet.rowId ? "Swap exercise" : "Add exercise"}
        onPick={(ex) => {
          if (sheet.kind === "pick-exercise") void pickExercise(sheet.dayId, sheet.rowId, ex);
        }}
      />
      <CategoryPickerSheet
        open={sheet.kind === "category"}
        onClose={close}
        current={sheet.kind === "category" ? sheet.row.movementPattern : null}
        onPick={(p) => {
          if (sheet.kind === "category") void setCategory(sheet.row, p);
        }}
      />
      <TargetSheet
        open={sheet.kind === "target"}
        onClose={close}
        sets={sheet.kind === "target" ? sheet.row.targetSets : null}
        reps={sheet.kind === "target" ? sheet.row.targetRepRange : null}
        onSave={(next) => {
          if (sheet.kind === "target") void setTarget(sheet.dayId, sheet.row, next);
        }}
      />
      <PromptSheet
        open={sheet.kind === "rename-day"}
        onClose={close}
        title="Rename day"
        label="Name"
        initial={sheet.kind === "rename-day" ? sheet.day.name : ""}
        onSubmit={(v) => {
          if (sheet.kind === "rename-day") void renameDay(sheet.day, v);
        }}
      />
      <ConfirmSheet
        open={sheet.kind === "delete-day"}
        onClose={close}
        title="Delete day"
        body={sheet.kind === "delete-day" ? `${sheet.day.name} and its ${plural(sheet.day.exercises.length, "exercise")} are removed from the plan. Logged sessions stay in history.` : null}
        confirmLabel="Delete day"
        danger
        onConfirm={() => {
          if (sheet.kind === "delete-day") void deleteDay(sheet.day);
        }}
      />
      <PromptSheet open={sheet.kind === "rename-plan"} onClose={close} title="Rename plan" label="Name" initial={plan.name} onSubmit={renamePlan} />
      <ConfirmSheet
        open={sheet.kind === "delete-plan"}
        onClose={close}
        title="Delete plan"
        body={`${plan.name} and its days are removed. Logged sessions stay in history.`}
        confirmLabel="Delete plan"
        danger
        onConfirm={deletePlan}
      />
    </div>
  );
}

interface EdDayProps {
  day: PlanDay;
  index: number;
  open: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onRename: () => void;
  onDelete: () => void;
  onPickName: (row: PlanExercise) => void;
  onPickCategory: (row: PlanExercise) => void;
  onPickTarget: (row: PlanExercise) => void;
  onRemove: (row: PlanExercise) => void;
  onReorder: (order: string[]) => void;
}

function EdDay({ day, index, open, onToggle, onAdd, onRename, onDelete, onPickName, onPickCategory, onPickTarget, onRemove, onReorder }: EdDayProps) {
  return (
    <Card className={open ? "px-4 pb-1.5 pt-[13px]" : "px-4 py-[13px]"}>
      <button type="button" onClick={onToggle} className="w-full text-left" aria-expanded={open}>
        <DayHeader
          day={index}
          name={day.name}
          right={
            <>
              {!open && <span className="font-data text-[11px] uppercase tracking-[0.04em] text-ft-dim">{plural(day.exercises.length, "exercise")}</span>}
              <Chev open={open} />
            </>
          }
        />
      </button>
      {open && (
        <div className="mt-1.5">
          <ReorderList rows={day.exercises} onReorder={onReorder}>
            {(row, grip) => (
              <EdExRow row={row} grip={grip} onPickName={() => onPickName(row)} onPickCategory={() => onPickCategory(row)} onPickTarget={() => onPickTarget(row)} onRemove={() => onRemove(row)} />
            )}
          </ReorderList>
          {day.exercises.length === 0 && <div className="py-3 font-body text-[13px] text-ft-dim">No exercises yet.</div>}
          <div className="flex items-center justify-between py-2.5">
            <button type="button" onClick={onAdd} className="font-data text-[11px] uppercase tracking-[0.12em] text-ft-accent">
              + Add exercise
            </button>
            <span className="font-data text-[11px] uppercase tracking-[0.12em] text-ft-dim">
              <button type="button" onClick={onRename}>
                Rename
              </button>
              {" · "}
              <button type="button" onClick={onDelete}>
                Delete day
              </button>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function EdExRow({ row, grip, onPickName, onPickCategory, onPickTarget, onRemove }: { row: PlanExercise; grip: React.HTMLAttributes<HTMLSpanElement>; onPickName: () => void; onPickCategory: () => void; onPickTarget: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-ft-border-faint py-2">
      <span {...grip} className="cursor-grab touch-none select-none font-data text-[13px] tracking-[2px] text-ft-dim active:cursor-grabbing" aria-label="Drag to reorder">
        ⠿
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-[7px] py-0.5">
        <button type="button" onClick={onPickName} className="max-w-full truncate text-left font-data text-[13.5px] font-semibold text-ft-white">
          {row.name} <span className="text-[11px] text-ft-dim">▾</span>
        </button>
        <button type="button" onClick={onPickCategory} className="text-left">
          <CategoryChip variant="pill" movementPattern={row.movementPattern} primaryMuscle={row.primaryMuscle} />
        </button>
      </div>
      <button type="button" onClick={onPickTarget}>
        <TargetTag icon>{fmtTarget(row.targetSets, row.targetRepRange, true)}</TargetTag>
      </button>
      <button type="button" onClick={onRemove} aria-label={`Remove ${row.name}`} className="px-1 font-data text-[12px] text-ft-dim">
        ✕
      </button>
    </div>
  );
}

/** Pointer-driven reorder: drag from the grip, rows slide, commit on release. */
function ReorderList({ rows, onReorder, children }: { rows: PlanExercise[]; onReorder: (order: string[]) => void; children: (row: PlanExercise, grip: React.HTMLAttributes<HTMLSpanElement>) => React.ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; from: number; to: number; dy: number } | null>(null);
  const ids = useMemo(() => rows.map((r) => r.id), [rows]);

  const start = (id: string, from: number, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const startY = e.clientY;
    const rowEls = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-row]") ?? []);
    const centers = rowEls.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      const y = centers[from] + dy;
      let to = 0;
      for (let i = 0; i < centers.length; i++) if (y > centers[i]) to = i;
      setDrag({ id, from, to, dy });
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setDrag((d) => {
        if (d && d.to !== d.from) {
          const next = ids.slice();
          const [m] = next.splice(d.from, 1);
          next.splice(d.to, 0, m);
          onReorder(next);
        }
        return null;
      });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  return (
    <div ref={listRef}>
      {rows.map((row, i) => {
        let style: React.CSSProperties | undefined;
        if (drag) {
          if (row.id === drag.id) style = { transform: `translateY(${drag.dy}px)`, opacity: 0.75, position: "relative", zIndex: 2 };
          else if (drag.from < drag.to && i > drag.from && i <= drag.to) style = { transform: "translateY(-100%)", transition: "transform 120ms" };
          else if (drag.from > drag.to && i >= drag.to && i < drag.from) style = { transform: "translateY(100%)", transition: "transform 120ms" };
        }
        return (
          <div key={row.id} data-row style={style}>
            {children(row, { onPointerDown: (e) => start(row.id, i, e) })}
          </div>
        );
      })}
    </div>
  );
}
