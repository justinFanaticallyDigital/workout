"use client";

import Link from "next/link";
import { Card, Chev } from "@/components/kit";
import { fmtKcal } from "@/lib/nutrition-math";
import { fmtMacroShort, type ItemView, type MealView } from "@/lib/nutrition-view";

/** Library entry tile on the Nutrition home (2×2 grid). */
export function LibTile({ name, sub, href }: { name: string; sub: string; href: string }) {
  return (
    <Link href={href}>
      <Card band={false} className="flex items-center gap-2.5 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-data text-[14px] font-bold text-ft-white">{name}</div>
          <div className="mt-0.5 truncate font-data text-[11px] uppercase tracking-[0.06em] text-ft-dim">{sub}</div>
        </div>
        <span className="font-data text-[15px] text-ft-accent">›</span>
      </Card>
    </Link>
  );
}

/** Meal tile in a day strip: slot eyebrow, name, kcal, short macros. */
export function MealTile({ slot, meal, active, onClick }: { slot: string; meal: MealView | null; active?: boolean; onClick?: () => void }) {
  if (!meal) {
    return (
      <div className="flex w-[150px] flex-shrink-0 flex-col justify-center rounded-ft-md border-[1.4px] border-dashed border-ft-border px-[11px] py-2.5">
        <div className="t-eyebrow !text-[9px]">{slot}</div>
        <div className="mt-1 font-data text-[12px] font-semibold text-ft-dim">Empty</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-[150px] flex-shrink-0 flex-col gap-[3px] rounded-ft-md border px-[11px] py-2.5 text-left",
        active ? "border-[1.5px] border-ft-accent bg-ft-accent/[.12]" : "border-ft-border bg-ft-surface-raised",
      ].join(" ")}
    >
      <div className="flex items-center">
        <div className="t-eyebrow flex-1 !text-[9px]">{slot}</div>
        {onClick && <Chev open={active} />}
      </div>
      <div className="truncate font-data text-[13px] font-bold text-ft-white">{meal.name}</div>
      <div className="mt-0.5 font-data text-[12.5px] font-bold text-ft-coral">{fmtKcal(meal.macros.calories)} cal</div>
      <div className="font-data text-[10.5px] text-ft-dim">{fmtMacroShort(meal.macros)}</div>
    </button>
  );
}

/** Food tile in an item strip: name, portion, kcal. */
export function FoodTile({ item, onClick }: { item: ItemView; onClick?: () => void }) {
  const inner = (
    <>
      <div className="truncate font-data text-[12px] font-bold text-ft-white">{item.food.name}</div>
      <div className="font-body text-[11.5px] text-ft-dim">{item.portion}</div>
      <div className="mt-0.5 font-data text-[11.5px] font-bold text-ft-coral">{fmtKcal(item.macros.calories)} cal</div>
    </>
  );
  const cls = "flex w-[104px] flex-shrink-0 flex-col gap-[2px] rounded-ft-md border border-ft-border-faint bg-ft-surface-alt px-2.5 py-[9px] text-left";
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Progress bar: value / target in a macro colour. */
export function TotalBar({ label, value, target, color, unit = "" }: { label: string; value: number; target: number | null; color: string; unit?: string }) {
  const pct = target && target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between font-data text-[12px]">
        <span className="text-[9.5px] uppercase tracking-[0.1em] text-ft-light">{label}</span>
        <span>
          <span className="font-bold text-ft-white">{fmtKcal(value)}</span>
          <span className="text-ft-dim">
            {" "}
            / {target != null ? fmtKcal(target) : "—"}
            {unit}
          </span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-[3px] bg-ft-border-faint">
        <div className={`h-full rounded-[3px] ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
