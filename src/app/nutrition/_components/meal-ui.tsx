"use client";

import { CameraIcon } from "@/components/kit";
import { fmtKcal } from "@/lib/nutrition-math";
import { SLOT_DOT, SLOT_LABEL, type ItemView, type TemplateView } from "@/lib/nutrition-view";

/** Frame coverage pills — one per template slot; solid with a coloured dot once an item fills it. */
export function SlotPills({ template, roles }: { template: TemplateView; roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-[5px]">
      {template.slots.map((s) => {
        const on = roles.includes(s.role);
        return (
          <span
            key={s.role}
            className={[
              "inline-flex items-center gap-1 rounded-full border px-[7px] py-[2px] font-data text-[9px] font-bold uppercase tracking-[0.1em]",
              on ? "border-solid border-ft-border bg-ft-surface-alt text-ft-light" : "border-dashed border-ft-border text-ft-dim",
            ].join(" ")}
          >
            <span className={["h-1.5 w-1.5 rounded-full", on ? SLOT_DOT[s.role] ?? "bg-ft-light" : "border border-ft-dim"].join(" ")} />
            {SLOT_LABEL[s.role] ?? s.role}
          </span>
        );
      })}
    </div>
  );
}

/** Slot dot + uppercase role label. */
export function RoleTag({ role, size = 9, className = "" }: { role: string; size?: number; className?: string }) {
  return (
    <span className={`flex items-center gap-[5px] ${className}`}>
      <span className={`h-[7px] w-[7px] flex-shrink-0 rounded-full ${SLOT_DOT[role] ?? "bg-ft-light"}`} />
      <span className="font-data font-bold uppercase tracking-[0.12em] text-ft-light" style={{ fontSize: size }}>
        {SLOT_LABEL[role] ?? role}
      </span>
    </span>
  );
}

interface FrameTileProps {
  role: string;
  item: ItemView | null;
  hint?: string | null;
  onPick: () => void;
  onScan: () => void;
  onOpen: () => void;
}

/** 118×118 frame tile — filled (food ▾ · portion tag · kcal) or empty (+ PICK / SCAN). */
export function FrameTile({ role, item, hint, onPick, onScan, onOpen }: FrameTileProps) {
  if (!item) {
    return (
      <div className="flex h-[118px] w-[118px] flex-shrink-0 flex-col rounded-ft-md border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-[11px] py-2.5" title={hint ?? undefined}>
        <RoleTag role={role} />
        <button type="button" onClick={onPick} className="flex flex-1 items-center justify-center font-data text-[11px] font-bold tracking-[0.1em] text-ft-accent">
          + PICK
        </button>
        <button type="button" onClick={onScan} className="flex items-center justify-center gap-1 border-t border-dashed border-ft-accent/40 pt-[7px] font-data text-[10px] font-bold tracking-[0.1em] text-ft-accent">
          <CameraIcon size={13} />
          SCAN
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={onOpen} className="flex h-[118px] w-[118px] flex-shrink-0 flex-col gap-[3px] rounded-ft-md border border-ft-border bg-ft-surface-raised px-[11px] py-2.5 text-left">
      <RoleTag role={role} />
      <div className="mt-1 line-clamp-2 font-data text-[13px] font-bold leading-[1.25] text-ft-white">
        {item.food.name} <span className="text-[10px] text-ft-dim">▾</span>
      </div>
      <div className="flex-1" />
      <span className="self-start rounded-ft-sm border border-dashed border-ft-border px-1.5 py-px font-data text-[10.5px] font-semibold text-ft-light">{item.portion}</span>
      <div className="font-data text-[11.5px] font-bold text-ft-coral">{fmtKcal(item.macros.calories)} cal</div>
    </button>
  );
}
