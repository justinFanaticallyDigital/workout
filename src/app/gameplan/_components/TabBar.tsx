"use client";

import type { TabId } from "./types";

const TABS: { id: TabId; label: string }[] = [
  { id: "training", label: "Training" },
  { id: "nutrition", label: "Nutrition" },
  { id: "lifestyle", label: "Lifestyle" },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <div className="flex border-b border-ft-border bg-ft-bg sticky top-[88px] z-[9]">
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              "flex-1 py-3 font-body text-xs uppercase tracking-[0.15em] transition-colors",
              on
                ? "text-ft-accent border-b-2 border-ft-accent -mb-px"
                : "text-ft-dim border-b-2 border-transparent hover:text-ft-light",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
