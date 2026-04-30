"use client";

/**
 * Numbered planning section header — verbatim port of
 * planning-screens.jsx#SecHead (lines 1100–1127). Distinct from R5
 * `SectionH` (kicker + display + spray underline) — planning leans
 * on the spec-sheet "NN. title  // sub" pattern with a dashed bar
 * filling the row remainder.
 */

import { Marker, Archivo } from "@/app/gameplan/_components/typography";

export function SecHead({
  num,
  title,
  sub,
}: {
  num: string;
  title: string;
  sub: string;
}) {
  return (
    <div
      style={{
        marginBottom: 4,
        background: "rgb(var(--ft-bg-alt))",
        padding: "4px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <Archivo
          size={9}
          color="rgb(var(--ft-text-on-bg-sec))"
          style={{ letterSpacing: ".16em", fontWeight: 700 }}
        >
          {num}.
        </Archivo>
        <Marker
          style={{
            fontSize: 14,
            color: "rgb(var(--ft-text-on-bg))",
            letterSpacing: ".06em",
          }}
        >
          {title}
        </Marker>
        <div
          aria-hidden
          style={{
            flex: 1,
            height: 1,
            marginBottom: 4,
            backgroundImage:
              "linear-gradient(90deg, rgb(var(--ft-border-strong)) 50%, transparent 50%)",
            backgroundSize: "6px 1px",
          }}
        />
      </div>
      <Archivo
        size={9}
        color="rgb(var(--ft-text-on-bg-sec))"
        style={{ letterSpacing: ".06em", marginLeft: 18, fontWeight: 500, display: "block" }}
      >
        {"// "}
        {sub}
      </Archivo>
    </div>
  );
}
