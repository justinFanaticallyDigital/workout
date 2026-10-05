"use client";

import { Sheet } from "@/components/kit";

interface LaneMenuSheetProps {
  open: boolean;
  name: string | null;
  onClose: () => void;
  onSwap: () => void;
  onRemove: () => void;
}

/** Tapping an exercise name: swap it for another, or remove it from this session. */
export default function LaneMenuSheet({ open, name, onClose, onSwap, onRemove }: LaneMenuSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={name ?? "Exercise"}>
      <ul className="divide-y divide-ft-border-faint">
        <li>
          <button type="button" onClick={onSwap} className="flex w-full items-center py-3 text-left">
            <span className="flex-1 font-data text-[14px] font-semibold text-ft-white">Swap exercise</span>
            <span className="font-data text-[14px] text-ft-accent">›</span>
          </button>
        </li>
        <li>
          <button type="button" onClick={onRemove} className="flex w-full items-center py-3 text-left">
            <span className="flex-1 font-data text-[14px] font-semibold text-ft-coral">Remove from this workout</span>
          </button>
        </li>
      </ul>
    </Sheet>
  );
}
