"use client";

/**
 * Nutrition editor — verbatim port of planning-screens.jsx
 * #NutritionCard (lines 588–667): calorie input + slider + 3 macro
 * sliders + refeed toggle. Mutates `nutritionTarget` and (for the
 * refeed toggle) the active block's `refeedWeeks` array.
 */

import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import { Slider } from "./Slider";
import type { DraftBlock, DraftNutritionTarget } from "./types";

export function NutritionEditor({
  target,
  originalCalories,
  highlightCalories,
  activeBlock,
  onChangeTarget,
  onToggleRefeed,
}: {
  target: DraftNutritionTarget;
  originalCalories: number | null;
  highlightCalories?: boolean;
  activeBlock: DraftBlock | null;
  onChangeTarget: (patch: Partial<DraftNutritionTarget>) => void;
  /** Toggle refeedWeeks: when on, set to [last week of block]; when off, []. */
  onToggleRefeed: (enabled: boolean) => void;
}) {
  const cals = target.calories ?? 2400;
  const calDelta = originalCalories != null ? cals - originalCalories : 0;
  const macros = [
    {
      key: "protein" as const,
      label: "PROTEIN",
      g: target.protein ?? 0,
      color: "rgb(var(--ft-pull))",
    },
    {
      key: "carbs" as const,
      label: "CARBS",
      g: target.carbs ?? 0,
      color: "rgb(var(--ft-push))",
    },
    {
      key: "fat" as const,
      label: "FAT",
      g: target.fat ?? 0,
      color: "rgb(var(--ft-core))",
    },
  ];
  const totalG = macros.reduce((s, m) => s + m.g, 0) || 1;
  const refeedEnabled = (activeBlock?.refeedWeeks ?? []).length > 0;

  return (
    <PlanningCard
      style={{ margin: "10px 12px 0" }}
      label="NUTRITION · DAILY TARGETS"
      accent={highlightCalories}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Marker style={{ fontSize: 10 }}>calorie target</Marker>
        {originalCalories != null && calDelta !== 0 && (
          <Archivo size={9} color="rgb(var(--ft-core))">
            {calDelta > 0 ? "+" : "−"}
            {Math.abs(calDelta)} kcal vs current
          </Archivo>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <div
          style={{
            border: highlightCalories
              ? "1.5px solid rgb(var(--ft-accent))"
              : "1px solid rgb(var(--ft-border))",
            padding: "6px 10px",
            minWidth: 120,
            background: highlightCalories ? "rgb(var(--ft-accent-faint))" : "transparent",
            boxShadow: highlightCalories ? "0 0 0 3px rgb(var(--ft-accent-faint))" : "none",
          }}
        >
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            KCAL/DAY
          </Archivo>
          <input
            type="number"
            value={target.calories ?? ""}
            onChange={(e) =>
              onChangeTarget({ calories: e.target.value === "" ? null : Number(e.target.value) })
            }
            className="font-data tabular-nums"
            style={{
              display: "block",
              fontSize: 26,
              fontWeight: 700,
              color: highlightCalories ? "rgb(var(--ft-accent))" : "rgb(var(--ft-text-primary))",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "1px 0",
              width: "100%",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            className="font-body"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 7,
              color: "rgb(var(--ft-text-tertiary))",
              marginBottom: 3,
              letterSpacing: ".1em",
            }}
          >
            <span>1200</span>
            <span>2400</span>
            <span>3000</span>
          </div>
          <Slider
            value={Math.max(1200, Math.min(3000, cals))}
            min={1200}
            max={3000}
            step={50}
            glow={highlightCalories}
            onChange={(v) => onChangeTarget({ calories: v })}
            ariaLabel="Calorie target"
          />
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ marginTop: 3, letterSpacing: ".06em", display: "block" }}
          >
            FLOOR 1300 · CEIL 3000
          </Archivo>
        </div>
      </div>

      <PlanningDashed style={{ margin: "12px 0 10px" }} />

      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}
      >
        <Marker style={{ fontSize: 10 }}>macros</Marker>
        <Archivo size={9} color="rgb(var(--ft-text-secondary))">
          P/C/F %
        </Archivo>
      </div>

      {macros.map((m) => {
        const pct = Math.round((m.g / totalG) * 100);
        return (
          <div key={m.key} style={{ marginBottom: 8 }}>
            <div
              className="font-body"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                letterSpacing: ".12em",
                marginBottom: 3,
              }}
            >
              <span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>
              <span>
                <input
                  type="number"
                  value={m.g}
                  onChange={(e) => onChangeTarget({ [m.key]: Number(e.target.value) })}
                  className="font-data tabular-nums"
                  style={{
                    width: 56,
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px dashed rgb(var(--ft-border))",
                    color: "rgb(var(--ft-text-primary))",
                    fontWeight: 700,
                    fontSize: 11,
                    outline: "none",
                    textAlign: "right",
                  }}
                />
                <span style={{ marginLeft: 2 }}>g</span>
                <span style={{ color: "rgb(var(--ft-text-tertiary))", marginLeft: 6 }}>· {pct}%</span>
              </span>
            </div>
            <Slider
              value={m.g}
              min={0}
              max={400}
              step={5}
              color={m.color}
              onChange={(v) => onChangeTarget({ [m.key]: v })}
              ariaLabel={`${m.label} grams`}
            />
          </div>
        );
      })}

      <PlanningDashed style={{ margin: "10px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Marker style={{ fontSize: 10 }}>refeed</Marker>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".1em", display: "block" }}
          >
            {refeedEnabled
              ? activeBlock?.refeedWeeks.map((w) => `WK${w}`).join(" · ")
              : "OFF · WEEKLY +400 KCAL WHEN ON"}
          </Archivo>
        </div>
        <button
          onClick={() => onToggleRefeed(!refeedEnabled)}
          aria-pressed={refeedEnabled}
          aria-label="Toggle refeed weeks"
          style={{
            width: 38,
            height: 18,
            border: "1px solid rgb(var(--ft-accent-border))",
            background: refeedEnabled ? "rgb(var(--ft-accent-faint))" : "rgb(var(--ft-surface-alt))",
            position: "relative",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 1,
              bottom: 1,
              left: refeedEnabled ? "auto" : 1,
              right: refeedEnabled ? 1 : "auto",
              width: 16,
              background: refeedEnabled ? "rgb(var(--ft-accent))" : "rgb(var(--ft-text-tertiary))",
            }}
          />
        </button>
      </div>
    </PlanningCard>
  );
}
