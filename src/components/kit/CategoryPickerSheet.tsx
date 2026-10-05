"use client";

import Sheet from "./Sheet";
import { CategoryDot } from "./CategoryChip";
import { CATEGORY_OPTIONS, GROUP_LABEL, categoryFor } from "@/lib/categories";

interface CategoryPickerSheetProps {
  open: boolean;
  onClose: () => void;
  current: string | null;
  onPick: (movementPattern: string) => void;
}

/** Pick an exercise's category (its movementPattern), grouped by colour. */
export default function CategoryPickerSheet({ open, onClose, current, onPick }: CategoryPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Category">
      {CATEGORY_OPTIONS.map((g) => (
        <div key={g.group} className="mb-3">
          <div className="t-eyebrow mb-1 flex items-center gap-1.5">
            <CategoryDot group={g.group} size={6} /> {GROUP_LABEL[g.group]}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.patterns.map((p) => {
              const on = p === current;
              const label = categoryFor(p).label;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPick(p)}
                  className={[
                    "rounded-full border px-2.5 py-1 font-data text-[10px] font-bold uppercase tracking-[0.1em]",
                    on ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                  ].join(" ")}
                >
                  {label === p ? p : `${p} · ${label}`}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Sheet>
  );
}
