"use client";

import { Marker } from "./typography";
import { SprayUnderline } from "./Ornaments";
import type { TabId } from "./types";

const TABS: { id: TabId; label: string }[] = [
  { id: "training", label: "TRAINING" },
  { id: "nutrition", label: "NUTRITION" },
  { id: "lifestyle", label: "LIFESTYLE" },
];

/**
 * Sub-tab nav — verbatim port of gameplan-active.jsx#SubTabs (lines
 * 1224–1252). Marker font for tab labels + spray-underline beneath
 * the active one. The whole strip sits sticky below the StatusStrip.
 */
export default function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 28,
        padding: "8px 18px 4px",
        borderBottom: "1px dashed rgb(var(--ft-border-faint))",
        background: "rgb(var(--ft-bg))",
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              position: "relative",
              paddingBottom: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 0 6px 0",
            }}
            aria-pressed={isActive}
          >
            <Marker
              style={{
                fontSize: 16,
                color: isActive ? "rgb(var(--ft-text-on-bg))" : "rgb(var(--ft-text-on-bg-ter))",
                letterSpacing: ".02em",
                transform: `rotate(${isActive ? -0.8 : 0}deg)`,
                display: "inline-block",
                transformOrigin: "left",
              }}
            >
              {t.label}
            </Marker>
            {isActive && <SprayUnderline width={t.label.length * 11 + 6} style={{ marginLeft: -3, marginTop: -2 }} />}
          </button>
        );
      })}
    </div>
  );
}
