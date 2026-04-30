"use client";

/**
 * Sandbox header strip — verbatim port of planning-screens.jsx
 * #SandboxHeader (lines 187–244): PLANNING MODE rotated stamp +
 * program title + WEEK badge + pending count + Discard / Apply
 * buttons + reset link.
 */

import { Marker, Archivo } from "@/app/gameplan/_components/typography";
import { PlanningModeStamp } from "./PlanningModeStamp";
import { PillBtn } from "./PillBtn";

export function PlanningHeader({
  programName,
  blockLabel,
  pending,
  applyDisabled,
  onDiscard,
  onApply,
  onReset,
}: {
  programName: string;
  blockLabel: string;
  pending: number;
  applyDisabled: boolean;
  onDiscard: () => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const counterColor = applyDisabled ? "rgb(var(--ft-text-on-bg-ter))" : "rgb(var(--ft-accent))";
  const counterBorder = applyDisabled
    ? "1px solid rgb(var(--ft-border-faint))"
    : "1px solid rgb(var(--ft-accent-border))";
  return (
    <div
      style={{
        position: "relative",
        padding: "12px 14px 10px",
        borderBottom: "1px solid rgb(var(--ft-border-strong))",
        background: "rgb(var(--ft-bg-alt))",
      }}
    >
      <div style={{ position: "absolute", top: 8, right: 12 }}>
        <PlanningModeStamp />
      </div>

      <Marker
        style={{
          fontSize: 13,
          letterSpacing: ".05em",
          color: "rgb(var(--ft-text-on-bg))",
          display: "block",
        }}
      >
        edit gameplan
      </Marker>

      <Archivo
        size={9}
        color="rgb(var(--ft-text-on-bg-sec))"
        style={{ letterSpacing: ".18em", marginTop: 2, fontWeight: 600, display: "block" }}
      >
        {programName.toUpperCase()} · {blockLabel.toUpperCase()}
      </Archivo>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <div
          className="font-body"
          style={{
            fontSize: 10,
            color: counterColor,
            border: counterBorder,
            padding: "4px 8px",
            letterSpacing: ".1em",
          }}
        >
          [{String(pending).padStart(2, "0")}] {pending === 1 ? "CHANGE" : "CHANGES"} PENDING
        </div>
        <div style={{ flex: 1 }} />
        <PillBtn size="sm" ghost onClick={onDiscard}>
          Discard
        </PillBtn>
        <PillBtn size="sm" primary disabled={applyDisabled} onClick={onApply}>
          Apply ↗
        </PillBtn>
      </div>

      <div style={{ marginTop: 6 }}>
        <button
          onClick={onReset}
          className="font-body"
          style={{
            background: "transparent",
            border: "none",
            fontSize: 9,
            letterSpacing: ".12em",
            color: "rgb(var(--ft-text-on-bg-sec))",
            fontWeight: 600,
            textDecoration: "underline dashed",
            textUnderlineOffset: 3,
            padding: 0,
            cursor: "pointer",
          }}
        >
          ↺ reset to original
        </button>
      </div>
    </div>
  );
}
