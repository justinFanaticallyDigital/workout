"use client";

/**
 * Section header — kicker (uppercase tracked-out) + display heading +
 * spray underline. Verbatim port of gameplan-active.jsx#SectionH
 * (lines 410–420).
 *
 * The Marker heading rotates ~−0.6° on graffiti and stays level on
 * every other chrome via {@link Marker}'s tilt guard.
 */

import type { CSSProperties, ReactNode } from "react";
import { Marker, Archivo } from "./typography";
import { SprayUnderline } from "./Ornaments";

export function SectionH({
  children,
  kicker,
  sprayWidth = 110,
  color,
  style,
}: {
  children: ReactNode;
  kicker?: string;
  sprayWidth?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      {kicker && (
        <Archivo
          size={9}
          color="rgb(var(--ft-text-on-bg-ter))"
          style={{ letterSpacing: ".22em", display: "block", marginBottom: 3, textTransform: "uppercase" }}
        >
          {kicker}
        </Archivo>
      )}
      <Marker
        style={{
          fontSize: 18,
          color: "rgb(var(--ft-text-on-bg))",
          display: "block",
          lineHeight: 1,
          transform: "rotate(-.6deg)",
          transformOrigin: "left",
        }}
      >
        {children}
      </Marker>
      <SprayUnderline width={sprayWidth} color={color} style={{ marginTop: -1, marginLeft: -3 }} />
    </div>
  );
}
