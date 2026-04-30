"use client";

/**
 * Per-movement weekly sets bar chart — verbatim port of
 * planning-screens.jsx#VolumeBars (lines 801–835).
 */

import { Archivo } from "@/app/gameplan/_components/typography";

interface MovementVolume {
  movement: "PUSH" | "PULL" | "LEGS" | "CORE";
  sets: number;
  delta: string;
}

const MOVE_COLOR: Record<string, string> = {
  PUSH: "rgb(var(--ft-push))",
  PULL: "rgb(var(--ft-pull))",
  LEGS: "rgb(var(--ft-legs))",
  CORE: "rgb(var(--ft-core))",
};

export function VolumeBars({ data, max = 24 }: { data: MovementVolume[]; max?: number }) {
  return (
    <div>
      {data.map((d) => {
        const c = MOVE_COLOR[d.movement];
        return (
          <div key={d.movement} style={{ marginBottom: 7 }}>
            <div
              className="font-body"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                letterSpacing: ".12em",
                marginBottom: 2,
              }}
            >
              <span style={{ color: c, fontWeight: 700 }}>{d.movement}</span>
              <Archivo size={9} color="rgb(var(--ft-text-primary))">
                <span style={{ fontWeight: 700 }}>{d.sets}</span> sets/wk
                <span
                  style={{
                    color: d.delta.startsWith("+")
                      ? "rgb(var(--ft-pull))"
                      : d.delta.startsWith("−") || d.delta.startsWith("-")
                      ? "rgb(var(--ft-core))"
                      : "rgb(var(--ft-text-tertiary))",
                    marginLeft: 6,
                  }}
                >
                  {d.delta}
                </span>
              </Archivo>
            </div>
            <div
              style={{
                height: 10,
                background: "rgb(var(--ft-surface-alt))",
                border: "1px dashed rgb(var(--ft-border))",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${(d.sets / max) * 100}%`,
                  background: `repeating-linear-gradient(90deg, ${c} 0 4px, ${c}99 4px 8px)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
