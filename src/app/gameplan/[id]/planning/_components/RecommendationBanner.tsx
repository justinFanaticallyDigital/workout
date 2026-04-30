"use client";

/**
 * Recommendation pre-staged banner — verbatim layout port of
 * planning-screens.jsx#RecommendationBanner (lines 247–279).
 *
 * R8: implemented in goal-engine. The banner now fetches the
 * recommendation by `id` and surfaces its `title` + `body`. When the
 * id doesn't resolve (recommendation expired / dismissed / dangling
 * URL), the banner renders nothing rather than a misleading shell.
 */

import { useEffect, useState } from "react";
import { Marker, Archivo } from "@/app/gameplan/_components/typography";

interface RecRow {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "urgent";
  suggestedField: string | null;
}

export function RecommendationBanner({
  recommendationId,
  message,
}: {
  /** R8: when present, fetches /api/recommendations/{id} and renders. */
  recommendationId?: string;
  /** Fallback message when no id is passed (legacy R7 callers). */
  message?: string;
}) {
  const [rec, setRec] = useState<RecRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!recommendationId) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/recommendations/${recommendationId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.title === "string") setRec(data as RecRow);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [recommendationId]);

  // Fallback path: no id → use message prop. Used by callers that
  // haven't migrated to id-based hydration.
  if (!recommendationId && message) {
    return <BannerShell title="recommendation pre-staged" body={message} severity="info" />;
  }
  // Loading: render the banner shell with a placeholder so layout doesn't shift.
  if (recommendationId && !loaded) {
    return <BannerShell title="loading recommendation…" body="" severity="info" />;
  }
  // Resolved id with no row → render nothing rather than mislead.
  if (recommendationId && loaded && !rec) return null;
  if (!rec) return null;

  return <BannerShell title={rec.title} body={rec.body} severity={rec.severity} />;
}

function BannerShell({
  title,
  body,
  severity,
}: {
  title: string;
  body: string;
  severity: "info" | "warning" | "urgent";
}) {
  const ringColor =
    severity === "urgent"
      ? "rgb(var(--ft-danger-border))"
      : severity === "warning"
      ? "rgb(var(--ft-warn-border))"
      : "rgb(var(--ft-accent-border))";
  const tintColor =
    severity === "urgent"
      ? "rgb(var(--ft-danger-bg))"
      : severity === "warning"
      ? "rgb(var(--ft-warn-bg))"
      : "rgb(var(--ft-accent-faint))";
  const accentColor =
    severity === "urgent"
      ? "rgb(var(--ft-danger-fg))"
      : severity === "warning"
      ? "rgb(var(--ft-warn-fg))"
      : "rgb(var(--ft-accent))";
  return (
    <div
      style={{
        position: "relative",
        margin: "10px 12px 0",
        padding: "9px 11px 9px 32px",
        border: `1px solid ${ringColor}`,
        background: tintColor,
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
          border: `1px solid ${ringColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accentColor,
        }}
      >
        <Marker style={{ fontSize: 11 }}>!</Marker>
      </div>
      <Marker style={{ fontSize: 9, letterSpacing: ".18em", color: accentColor }}>
        {title}
      </Marker>
      {body && (
        <Archivo
          size={10}
          color="rgb(var(--ft-text-on-bg))"
          style={{ marginTop: 3, display: "block", lineHeight: 1.4 }}
        >
          {body}
        </Archivo>
      )}
    </div>
  );
}
