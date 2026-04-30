"use client";

/**
 * Lifestyle-target editor — REPURPOSE NEW. The prototype mutes this
 * tab; R7 ships a wired editor for the LifestyleTarget rows that
 * R6 added. Edits `value` / `unit` / `comparator` per key.
 *
 * Apply orchestrator emits one POST /api/lifestyle-targets per
 * changed key (upsert by userId+programId+key).
 */

import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import type { DraftLifestyleTarget } from "./types";

const KNOWN_KEYS: Array<{
  key: string;
  label: string;
  defaultValue: number;
  defaultUnit: string;
  defaultComparator: "gte" | "lte" | "eq";
}> = [
  { key: "sleep_hours_min", label: "SLEEP HOURS (MIN)", defaultValue: 7.5, defaultUnit: "h", defaultComparator: "gte" },
  { key: "stress_max", label: "STRESS (MAX)", defaultValue: 5, defaultUnit: "score", defaultComparator: "lte" },
  { key: "protein_g", label: "PROTEIN (DAILY)", defaultValue: 130, defaultUnit: "g", defaultComparator: "gte" },
  { key: "protein_g_per_lb", label: "PROTEIN PER LB", defaultValue: 1.0, defaultUnit: "g/lb", defaultComparator: "gte" },
];

export function LifestyleEditor({
  targets,
  programId,
  onUpsert,
}: {
  targets: DraftLifestyleTarget[];
  programId: string;
  onUpsert: (target: DraftLifestyleTarget) => void;
}) {
  return (
    <PlanningCard style={{ margin: "10px 12px 0" }} label="LIFESTYLE · TARGETS">
      <Marker style={{ fontSize: 11, marginBottom: 4 }}>habit thresholds</Marker>
      <Archivo
        size={9}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".1em", display: "block", marginBottom: 8 }}
      >
        Drives dashboard SleepCard / StressCard / ProteinHitCard target bands.
      </Archivo>
      {KNOWN_KEYS.map((k, i) => {
        const existing = targets.find((t) => t.key === k.key);
        const current = existing ?? {
          id: null,
          programId,
          key: k.key,
          value: k.defaultValue,
          unit: k.defaultUnit,
          comparator: k.defaultComparator,
        };
        return (
          <div key={k.key}>
            {i > 0 && <PlanningDashed style={{ margin: "8px 0" }} />}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <Archivo
                size={9}
                color="rgb(var(--ft-text-secondary))"
                style={{ letterSpacing: ".15em", fontWeight: 700 }}
              >
                {k.label}
              </Archivo>
              <select
                value={current.comparator}
                onChange={(e) =>
                  onUpsert({
                    ...current,
                    comparator: e.target.value as "gte" | "lte" | "eq",
                  })
                }
                className="font-data"
                style={{
                  fontSize: 11,
                  background: "transparent",
                  border: "1px dashed rgb(var(--ft-border))",
                  color: "rgb(var(--ft-text-primary))",
                  outline: "none",
                  padding: "2px 4px",
                }}
                aria-label={`${k.label} comparator`}
              >
                <option value="gte">≥</option>
                <option value="lte">≤</option>
                <option value="eq">=</option>
              </select>
              <input
                type="number"
                value={current.value}
                step={k.key === "protein_g_per_lb" ? 0.1 : 1}
                onChange={(e) => onUpsert({ ...current, value: Number(e.target.value) })}
                className="font-data tabular-nums"
                style={{
                  width: 70,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgb(var(--ft-text-primary))",
                  background: "transparent",
                  border: "1px dashed rgb(var(--ft-border))",
                  outline: "none",
                  padding: "2px 6px",
                  textAlign: "right",
                }}
                aria-label={`${k.label} value`}
              />
              <Archivo
                size={9}
                color="rgb(var(--ft-text-tertiary))"
                style={{ letterSpacing: ".1em" }}
              >
                {current.unit}
              </Archivo>
            </div>
          </div>
        );
      })}
    </PlanningCard>
  );
}
