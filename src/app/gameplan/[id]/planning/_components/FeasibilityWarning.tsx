"use client";

/**
 * Yellow/red feasibility warning callout — verbatim port of
 * planning-screens.jsx#Warning (lines 396–426). Renders an inline
 * warning with `!` icon + colored left border + tinted background.
 *
 * Per spec §9.4: "Warnings never block. User can apply anything."
 * This component is purely advisory.
 */

import type { ReactNode } from "react";

export function FeasibilityWarning({
  kind = "yellow",
  children,
}: {
  kind?: "yellow" | "red";
  children: ReactNode;
}) {
  const c = kind === "red" ? "rgb(var(--ft-legs))" : "rgb(var(--ft-core))";
  const bg = kind === "red" ? "rgb(var(--ft-danger-bg))" : "rgb(var(--ft-warn-bg))";
  const textColor = kind === "red" ? "rgb(var(--ft-danger-fg))" : "rgb(var(--ft-warn-fg))";
  return (
    <div
      role="alert"
      className="font-body"
      style={{
        margin: "6px 12px 0",
        display: "flex",
        alignItems: "flex-start",
        gap: 7,
        padding: "7px 9px",
        borderLeft: `3px solid ${c}`,
        border: `1px solid ${c}`,
        borderLeftWidth: 3,
        background: bg,
        fontSize: 10,
        lineHeight: 1.35,
        color: textColor,
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden
        style={{
          border: `1.5px solid ${c}`,
          background: c,
          color: "rgb(var(--ft-text-on-accent))",
          width: 13,
          height: 13,
          fontSize: 9,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
          fontWeight: 800,
        }}
      >
        !
      </span>
      <span>{children}</span>
    </div>
  );
}
