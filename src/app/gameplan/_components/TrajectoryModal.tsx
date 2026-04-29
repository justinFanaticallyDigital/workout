"use client";

/**
 * Bottom-sheet modal wrapping `TrajectoryGraph`. Verbatim port of
 * gameplan-active.jsx#TrajectoryModal (lines 903–970): drag-handle bar
 * + header (icon tile + Marker title + SprayUnderline) + close button.
 *
 * `goal` shape is the live `GoalCard` payload (label + icon + series).
 * Closes on backdrop tap or × press.
 */

import { Marker } from "./typography";
import { SprayUnderline } from "./Ornaments";
import { GoalIcon, type GoalIconKind } from "./icons";
import { TrajectoryGraph } from "./TrajectoryGraph";
import type { SeriesInput } from "./seriesUtil";

export interface TrajectoryGoal {
  label: string;
  icon: GoalIconKind;
  series: SeriesInput;
  variancePct?: number;
  decimals?: number;
}

export function TrajectoryModal({
  goal,
  onClose,
}: {
  goal: TrajectoryGoal | null;
  onClose: () => void;
}) {
  if (!goal) return null;
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label={`${goal.label} trajectory`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgb(0 0 0 / 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "rgb(var(--ft-surface-alt))",
          borderTop: "2px solid rgb(var(--ft-info-fg))",
          padding: "16px 18px 22px",
          position: "relative",
          boxShadow: "0 -8px 30px rgba(0,0,0,.5)",
          maxHeight: "88%",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 4,
            background: "rgb(var(--ft-border))",
            borderRadius: 2,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            marginTop: 6,
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                border: "2px solid rgb(var(--ft-info-border))",
                background: "rgb(var(--ft-info-bg))",
                display: "grid",
                placeItems: "center",
                transform: "rotate(-3deg)",
                flexShrink: 0,
                marginTop: 2,
                color: "rgb(var(--ft-text-primary))",
              }}
            >
              <GoalIcon kind={goal.icon} size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                className="font-data"
                style={{
                  fontSize: 9,
                  color: "rgb(var(--ft-text-tertiary))",
                  letterSpacing: ".20em",
                  textTransform: "uppercase",
                }}
              >
                TRAJECTORY · 16 WEEKS
              </span>
              <Marker
                style={{
                  fontSize: 28,
                  color: "rgb(var(--ft-text-primary))",
                  display: "block",
                  lineHeight: 1,
                  marginTop: 2,
                  transform: "rotate(-1deg)",
                  transformOrigin: "left",
                }}
              >
                {goal.label}
              </Marker>
              <SprayUnderline width={Math.min(220, goal.label.length * 14)} style={{ marginTop: 1, marginLeft: -3 }} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trajectory"
            className="font-data"
            style={{
              background: "transparent",
              border: "1px solid rgb(var(--ft-border))",
              color: "rgb(var(--ft-text-primary))",
              fontSize: 14,
              cursor: "pointer",
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <TrajectoryGraph series={goal.series} variancePct={goal.variancePct} decimals={goal.decimals} />
      </div>
    </div>
  );
}
