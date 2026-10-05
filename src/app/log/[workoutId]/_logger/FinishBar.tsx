"use client";

import { useEffect, useState } from "react";
import { Btn } from "@/components/kit";
import { fmtVolume, formatSec } from "./util";

interface FinishBarProps {
  setsDone: number;
  setsTotal: number;
  totalVolume: number;
  startTime: number;
  restEndsAt: number | null;
  restTotalSec: number;
  onClearRest: () => void;
  finishing: boolean;
  onFinish: () => void;
}

/** Sticky bottom bar: rest countdown (gold) above session stats and the coral Finish button. */
export default function FinishBar({ setsDone, setsTotal, totalVolume, startTime, restEndsAt, restTotalSec, onClearRest, finishing, onFinish }: FinishBarProps) {
  const now = useNow(250);
  const restRemaining = restEndsAt ? Math.max(0, restEndsAt - now) : 0;
  useEffect(() => {
    if (restEndsAt && restRemaining === 0) onClearRest();
  }, [restEndsAt, restRemaining, onClearRest]);
  const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[600px]">
      {restEndsAt && restRemaining > 0 && (
        <div className="mx-5 mb-2.5 flex items-center gap-3 rounded-ft-md border border-ft-gold-border bg-ft-gold-bg px-3.5 py-2 shadow-ft-sm">
          <span className="font-data text-[10.5px] tracking-[0.16em] text-ft-gold-fg">REST</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-ft-gold/[.22]">
            <div className="h-full rounded-[3px] bg-ft-gold transition-[width] duration-200" style={{ width: `${Math.min(100, (restRemaining / (restTotalSec * 1000)) * 100)}%` }} />
          </div>
          <span className="font-data text-[15px] font-bold tabular-nums text-ft-gold-fg">{formatSec(Math.ceil(restRemaining / 1000))}</span>
          <button type="button" onClick={onClearRest} aria-label="Skip rest" className="font-data text-[12px] text-ft-gold-fg">
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-3.5 border-t border-ft-border bg-ft-surface px-5 pt-2.5 pb-safe">
        <Stat value={String(setsDone)} suffix={`/${setsTotal}`} label="Sets" />
        <Stat value={fmtVolume(totalVolume)} label="lb vol" />
        <Stat value={formatSec(elapsed)} label="Elapsed" />
        <div className="flex-1" />
        <Btn kind="coral" onClick={onFinish} disabled={finishing}>
          {finishing ? "Saving…" : "Finish"}
        </Btn>
      </div>
    </div>
  );
}

function Stat({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  return (
    <div className="min-w-0 leading-none">
      <div className="font-data text-[14px] font-bold tabular-nums text-ft-white">
        {value}
        {suffix && <span className="font-medium text-ft-dim">{suffix}</span>}
      </div>
      <div className="mt-[3px] font-data text-[9px] uppercase tracking-[0.14em] text-ft-dim">{label}</div>
    </div>
  );
}

function useNow(everyMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
