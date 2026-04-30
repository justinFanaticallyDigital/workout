"use client";

/**
 * Per-block weeks bar chart — verbatim port of planning-screens.jsx
 * #BlockBars (lines 838–877).
 */

import { Archivo } from "@/app/gameplan/_components/typography";

const PHASE_COLOR: Record<string, string> = {
  accumulation: "rgb(var(--ft-pull))",
  intensification: "rgb(var(--ft-push))",
  peaking: "rgb(var(--ft-legs))",
  peak_week: "rgb(var(--ft-legs))",
  deload: "rgb(var(--ft-text-secondary))",
  prep: "rgb(var(--ft-accent))",
};

interface BlockBar {
  shortName: string;
  weeks: number;
  phase: string | null;
  delta: string;
}

export function BlockBars({ blocks, max = 5 }: { blocks: BlockBar[]; max?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 72 }}>
      {blocks.map((b, i) => {
        const c = b.phase === "deload" ? "rgb(var(--ft-text-secondary))" : PHASE_COLOR[b.phase ?? ""] ?? "rgb(var(--ft-accent))";
        const isDeload = b.phase === "deload";
        return (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Archivo size={9} color="rgb(var(--ft-text-primary))" style={{ fontWeight: 700 }}>
              {b.weeks}w
            </Archivo>
            <div
              aria-hidden
              style={{
                width: "100%",
                height: `${(b.weeks / max) * 52}px`,
                background: isDeload
                  ? `repeating-linear-gradient(45deg, ${c} 0 3px, transparent 3px 6px)`
                  : `${c}40`,
                border: `1px solid ${c}`,
                marginTop: 3,
              }}
            />
            <Archivo size={8} color={c} style={{ marginTop: 3, fontWeight: 700 }}>
              {b.shortName}
            </Archivo>
            <Archivo
              size={7}
              color={b.delta === "0" ? "rgb(var(--ft-text-tertiary))" : "rgb(var(--ft-accent))"}
              style={{ letterSpacing: ".06em" }}
            >
              {b.delta}
            </Archivo>
          </div>
        );
      })}
    </div>
  );
}
