"use client";

/**
 * Recommendation pre-staged banner — verbatim port of
 * planning-screens.jsx#RecommendationBanner (lines 247–279).
 *
 * **R8 stub**: shown only when a `?recommendationId=...` URL param
 * resolves to a known recommendation card. The Goal Engine ships
 * recommendations in R8; until then this component renders a
 * pass-through visual shell triggered by URL param presence so the
 * deep-link contract stays stable.
 */

import { Marker, Archivo } from "@/app/gameplan/_components/typography";

export function RecommendationBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "relative",
        margin: "10px 12px 0",
        padding: "9px 11px 9px 32px",
        border: "1px solid rgb(var(--ft-accent-border))",
        background: "rgb(var(--ft-accent-faint))",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          width: 18,
          height: 18,
          border: "1px solid rgb(var(--ft-accent-border))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgb(var(--ft-accent))",
        }}
      >
        <Marker style={{ fontSize: 11 }}>!</Marker>
      </div>
      <Marker style={{ fontSize: 9, letterSpacing: ".18em", color: "rgb(var(--ft-accent))" }}>
        recommendation pre-staged
      </Marker>
      <Archivo
        size={10}
        color="rgb(var(--ft-text-on-bg))"
        style={{ marginTop: 3, display: "block", lineHeight: 1.4 }}
      >
        {message}
      </Archivo>
    </div>
  );
}
