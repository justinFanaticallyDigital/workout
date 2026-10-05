"use client";

import { useState } from "react";
import { Sheet } from "@/components/kit";
import { plural, type PlanBlock } from "@/lib/training";

interface BlockSwitcherProps {
  blocks: PlanBlock[];
  current: PlanBlock;
  onPick: (blockId: string) => void;
}

/** Pre-made multi-block plans only: the section stamp picks the block whose days are shown. */
export default function BlockSwitcher({ blocks, current, onPick }: BlockSwitcherProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex max-w-[160px] items-center gap-1 whitespace-nowrap rounded-full border border-ft-accent/40 px-2.5 py-[3px] font-data text-[9px] uppercase tracking-[0.18em] text-ft-accent"
      >
        <span className="truncate">{current.name}</span>
        <span aria-hidden="true">▾</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Block">
        <ul className="divide-y divide-ft-border-faint">
          {blocks.map((b) => {
            const on = b.id === current.id;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(b.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span className="t-day">B{b.blockNumber}</span>
                  <span className={["min-w-0 flex-1 truncate font-data text-[14px] font-semibold", on ? "text-ft-accent" : "text-ft-white"].join(" ")}>{b.name}</span>
                  <span className="font-data text-[10.5px] uppercase tracking-[0.1em] text-ft-dim">{plural(b.days.length, "day")}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </>
  );
}
