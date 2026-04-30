"use client";

/**
 * Rounded-pill button — verbatim port of planning-screens.jsx#PillBtn
 * (lines 162–184). Distinct from R4 `PickerButton` (sharp corners) —
 * planning UI leans on rounded pills as part of its "drafting tool"
 * vocabulary.
 *
 * Variants:
 *   - default → 1px border, transparent bg
 *   - primary → 1.5px accent border + accent-faint fill
 *   - ghost   → 1px dashed border
 */

import type { CSSProperties, ReactNode } from "react";

export function PillBtn({
  children,
  primary,
  ghost,
  size = "md",
  style,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  primary?: boolean;
  ghost?: boolean;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const pad = size === "sm" ? "5px 10px" : size === "lg" ? "10px 18px" : "7px 14px";
  const fs = size === "sm" ? 9 : size === "lg" ? 12 : 10;
  let border = "1px solid rgb(var(--ft-border-strong))";
  let bg: string | undefined = "transparent";
  let color = "rgb(var(--ft-text-on-bg))";
  if (primary) {
    border = "1.5px solid rgb(var(--ft-accent))";
    color = "rgb(var(--ft-accent))";
    bg = "rgb(var(--ft-accent-faint))";
  }
  if (ghost) {
    border = "1px dashed rgb(var(--ft-border-strong))";
    color = "rgb(var(--ft-text-on-bg-sec))";
  }
  if (disabled) {
    color = "rgb(var(--ft-text-on-bg-ter))";
    border = "1px dashed rgb(var(--ft-border-faint))";
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="font-body"
      style={{
        border,
        background: bg,
        color,
        padding: pad,
        fontSize: fs,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
