"use client";

/**
 * 5-tab section nav — verbatim port of planning-screens.jsx
 * #SectionTabs (lines 282–322). Training + Lifestyle are no longer
 * rendered as muted-and-empty per the prototype's `muted` contract;
 * R7 wires both editors to existing endpoints, so all 5 tabs are
 * fully active.
 */

import type { SectionTab } from "./types";

const TABS: { id: SectionTab; label: string }[] = [
  { id: "goals", label: "Goals" },
  { id: "timeline", label: "Timeline" },
  { id: "nutrition", label: "Nutrition" },
  { id: "training", label: "Training" },
  { id: "lifestyle", label: "Lifestyle" },
];

export function SectionTabs({
  active,
  onChange,
}: {
  active: SectionTab;
  onChange: (t: SectionTab) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid rgb(var(--ft-border-strong))",
        borderBottom: "1px solid rgb(var(--ft-border-strong))",
        background: "rgb(var(--ft-bg-alt))",
        overflowX: "auto",
      }}
    >
      {TABS.map((t, i) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="font-body"
            style={{
              position: "relative",
              flex: 1,
              padding: "8px 4px 7px",
              textAlign: "center",
              fontSize: 9,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: isActive ? "rgb(var(--ft-text-on-bg))" : "rgb(var(--ft-text-on-bg-sec))",
              fontWeight: isActive ? 700 : 500,
              borderRight:
                i < TABS.length - 1 ? "1px dashed rgb(var(--ft-border-faint))" : "none",
              background: isActive ? "rgb(var(--ft-surface))" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-pressed={isActive}
          >
            {isActive ? <span style={{ color: "rgb(var(--ft-accent))" }}>▸ </span> : null}
            {t.label}
            {isActive && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: "15%",
                  right: "15%",
                  height: 2,
                  background: "rgb(var(--ft-accent))",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
