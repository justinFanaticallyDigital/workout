"use client";

/**
 * Sticky-bottom Apply/Discard bar — verbatim port of
 * planning-screens.jsx#StickyApplyBar (lines 1004–1030). Includes
 * the blueprint-only `DWGStrip` chrome footer.
 */

import { Archivo } from "@/app/gameplan/_components/typography";
import { PillBtn } from "./PillBtn";
import { DWGStrip } from "./Ornaments";

export function ConfirmBar({
  pending,
  disabled,
  onDiscard,
  onApply,
}: {
  pending: number;
  disabled: boolean;
  onDiscard: () => void;
  onApply: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgb(var(--ft-bg-alt))",
        borderTop: "1px solid rgb(var(--ft-border-strong))",
        zIndex: 30,
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px dashed rgb(var(--ft-border-faint))",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <Archivo
          size={9}
          color={disabled ? "rgb(var(--ft-text-on-bg-ter))" : "rgb(var(--ft-text-on-bg))"}
          style={{ letterSpacing: ".1em" }}
        >
          {disabled ? "NO CHANGES TO APPLY" : `${pending} CHANGES READY`}
        </Archivo>
        <div style={{ flex: 1 }} />
        <PillBtn ghost size="sm" onClick={onDiscard}>
          Discard
        </PillBtn>
        <PillBtn primary size="sm" disabled={disabled} onClick={onApply}>
          Apply ↗
        </PillBtn>
      </div>
      <DWGStrip />
    </div>
  );
}
