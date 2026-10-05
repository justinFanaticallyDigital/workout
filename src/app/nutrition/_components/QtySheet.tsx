"use client";

import { useEffect, useState } from "react";
import { Btn, Sheet } from "@/components/kit";
import { fmtKcal, fmtQty, foodMacros, num, portionLabel } from "@/lib/nutrition-math";
import type { FoodView } from "@/lib/nutrition-view";

interface QtySheetProps {
  open: boolean;
  onClose: () => void;
  food: FoodView | null;
  quantity: number;
  onSave: (quantity: number) => void | Promise<void>;
}

const QUICK = [0.5, 1, 1.5, 2, 3];
const round = (n: number) => Math.round(n * 100) / 100;

/** Servings for one ingredient. Weight and volume foods also take an amount in their own unit. */
export default function QtySheet({ open, onClose, food, quantity, onSave }: QtySheetProps) {
  const [qty, setQty] = useState(quantity);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setQty(quantity);
      setAmount("");
    }
  }, [open, quantity]);
  if (!food) return null;

  const size = num(food.servingSize);
  const byAmount = ["g", "ml", "oz"].includes(food.servingUnit);
  const macros = foodMacros(food, qty);
  const setByAmount = (s: string) => {
    setAmount(s);
    const n = parseFloat(s);
    if (Number.isFinite(n) && n > 0 && size > 0) setQty(round(n / size));
  };
  const save = async () => {
    if (busy || qty <= 0) return;
    setBusy(true);
    try {
      await onSave(qty);
    } finally {
      setBusy(false);
    }
  };
  const stepBtn = "flex h-11 w-12 items-center justify-center rounded-ft-md border border-ft-border bg-ft-surface-raised font-data text-[18px] font-bold text-ft-accent";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={food.name}
      footer={
        <Btn fullWidth onClick={save} disabled={qty <= 0 || busy}>
          Set {portionLabel(food, qty)}
        </Btn>
      }
    >
      <div className="t-eyebrow">
        Serving · {fmtQty(size)} {food.servingUnit} · {fmtKcal(food.calories)} cal
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className={stepBtn} onClick={() => setQty((v) => Math.max(0.25, round(v - 0.25)))} aria-label="Less">
          −
        </button>
        <div className="flex-1 text-center">
          <div className="font-data text-[32px] font-bold leading-none text-ft-white">{fmtQty(qty)}</div>
          <div className="t-eyebrow mt-1 !text-[9px]">{qty === 1 ? "serving" : "servings"}</div>
        </div>
        <button type="button" className={stepBtn} onClick={() => setQty((v) => round(v + 0.25))} aria-label="More">
          +
        </button>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {QUICK.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setQty(v);
              setAmount("");
            }}
            className={["rounded-ft-md border py-2 font-data text-[12.5px] font-semibold", qty === v ? "border-ft-accent bg-ft-accent/[.12] text-ft-accent" : "border-ft-border bg-ft-surface text-ft-light"].join(" ")}
          >
            {fmtQty(v)}×
          </button>
        ))}
      </div>
      {byAmount && (
        <label className="mt-3 flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2">
          <span className="t-eyebrow flex-1 !text-[9px]">Amount</span>
          <input inputMode="decimal" value={amount} placeholder={String(Math.round(size * qty))} onChange={(e) => setByAmount(e.target.value.replace(/[^\d.]/g, ""))} className="w-20 bg-transparent text-right font-data text-[18px] font-bold text-ft-white outline-none placeholder:text-ft-dim" />
          <span className="font-data text-[11px] text-ft-dim">{food.servingUnit}</span>
        </label>
      )}
      <div className="mt-3 font-data text-[12px] text-ft-light">
        {fmtKcal(macros.calories)} cal · {Math.round(macros.fat)}F · {Math.round(macros.carbs)}C · {Math.round(macros.protein)}P
      </div>
    </Sheet>
  );
}
