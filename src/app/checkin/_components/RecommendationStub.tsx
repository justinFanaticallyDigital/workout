"use client";

/**
 * Goal Engine recommendation feed — R8: implemented in goal-engine.
 *
 * File name retained for caller-API stability (`/checkin/[id]/page.tsx`
 * + `/checkin/page.tsx` import the default export). Body now renders
 * live `Recommendation` rows from `/api/recommendations` with
 * Apply / Dismiss / Open-in-Planning-Mode actions per spec §8.5.
 *
 * Empty state preserves the prior visual shell so users with no
 * recommendations yet see the same affordance.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plex, Mono, SectionH, Card } from "./primitives";
import { IconInfo } from "./icons";

interface RecRow {
  id: string;
  kind: "behind_target" | "ahead_target" | "adherence_low" | "plateau_detected";
  status: "pending" | "applied" | "dismissed" | "expired";
  severity: "info" | "warning" | "urgent";
  title: string;
  body: string;
  suggestedField: string | null;
  suggestedValue: string | null;
  programId: string | null;
}

export default function RecommendationStub() {
  const router = useRouter();
  const [recs, setRecs] = useState<RecRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = async () => {
    try {
      const res = await fetch("/api/recommendations?status=pending&limit=10");
      if (!res.ok) {
        setRecs([]);
        setLoaded(true);
        return;
      }
      const data = await res.json();
      setRecs(Array.isArray(data?.recommendations) ? data.recommendations : []);
    } catch {
      setRecs([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const setStatus = async (id: string, status: "applied" | "dismissed", reason?: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, dismissedReason: reason ?? null }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const openInPlanningMode = (rec: RecRow) => {
    if (!rec.programId) return;
    // Pre-stage the recommendation by passing its id in the URL —
    // R7 RecommendationBanner reads ?recommendationId= and surfaces
    // the banner + highlights the suggested field.
    router.push(`/gameplan/${rec.programId}/planning?recommendationId=${rec.id}`);
  };

  return (
    <div style={{ padding: "8px 16px 4px" }}>
      <SectionH
        kicker="2.2 / Recommendations"
        title="Engine output"
        right={
          <Mono
            size={9}
            weight={600}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".12em" }}
          >
            {recs.length > 0 ? `${recs.length} PENDING` : loaded ? "NONE PENDING" : "LOADING…"}
          </Mono>
        }
      />
      {recs.length === 0 ? (
        <Card padding={16}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <IconInfo size={16} color="rgb(var(--ft-info-fg))" />
            <div style={{ flex: 1 }}>
              <Plex size={13} weight={600} style={{ display: "block", marginBottom: 4 }}>
                {loaded ? "No recommendations right now" : "Loading recommendations…"}
              </Plex>
              <Plex
                size={12}
                weight={400}
                color="rgb(var(--ft-text-secondary))"
                style={{ display: "block", lineHeight: 1.5 }}
              >
                The Goal Engine runs on each weekly check-in. Cards land here when a rule fires —
                behind-target, ahead-target, adherence, plateaus. Each surfaces an Apply, Dismiss,
                or Open-in-Planning-Mode action.
              </Plex>
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recs.map((rec) => {
            const sevColor =
              rec.severity === "urgent"
                ? "rgb(var(--ft-danger-fg))"
                : rec.severity === "warning"
                ? "rgb(var(--ft-warn-fg))"
                : "rgb(var(--ft-info-fg))";
            const busy = busyId === rec.id;
            return (
              <Card key={rec.id} padding={14}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: sevColor,
                      boxShadow: `0 0 6px ${sevColor}`,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono
                      size={9}
                      weight={600}
                      color={sevColor}
                      style={{ letterSpacing: ".12em", display: "block", marginBottom: 4 }}
                    >
                      {rec.severity.toUpperCase()} · {kindLabel(rec.kind)}
                    </Mono>
                    <Plex size={13} weight={600} style={{ display: "block", marginBottom: 4 }}>
                      {rec.title}
                    </Plex>
                    <Plex
                      size={12}
                      weight={400}
                      color="rgb(var(--ft-text-secondary))"
                      style={{ display: "block", lineHeight: 1.5 }}
                    >
                      {rec.body}
                    </Plex>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px dashed rgb(var(--ft-border-faint))",
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {rec.programId ? (
                    <button
                      onClick={() => openInPlanningMode(rec)}
                      disabled={busy}
                      className="font-body"
                      style={pillBtnStyle("primary")}
                    >
                      Open in Planning Mode
                    </button>
                  ) : null}
                  {rec.suggestedField && rec.suggestedValue && (
                    <button
                      onClick={() => setStatus(rec.id, "applied")}
                      disabled={busy}
                      className="font-body"
                      style={pillBtnStyle("apply")}
                    >
                      Apply
                    </button>
                  )}
                  <button
                    onClick={() => setStatus(rec.id, "dismissed")}
                    disabled={busy}
                    className="font-body"
                    style={pillBtnStyle("dismiss")}
                  >
                    Dismiss
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <Link
          href="/progress/check-ins"
          className="font-body"
          style={{
            color: "rgb(var(--ft-accent))",
            fontSize: 11,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            borderBottom: "1px solid rgb(var(--ft-accent))",
          }}
        >
          View past check-ins →
        </Link>
      </div>
    </div>
  );
}

function kindLabel(kind: RecRow["kind"]): string {
  switch (kind) {
    case "behind_target":
      return "BEHIND TARGET";
    case "ahead_target":
      return "AHEAD OF PLAN";
    case "adherence_low":
      return "ADHERENCE LOW";
    case "plateau_detected":
      return "PLATEAU DETECTED";
  }
}

function pillBtnStyle(variant: "primary" | "apply" | "dismiss"): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "5px 10px",
    fontSize: 9,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    borderRadius: 999,
    cursor: "pointer",
    background: "transparent",
  };
  if (variant === "primary") {
    return {
      ...base,
      border: "1.5px solid rgb(var(--ft-accent))",
      color: "rgb(var(--ft-accent))",
      background: "rgb(var(--ft-accent-faint))",
    };
  }
  if (variant === "apply") {
    return {
      ...base,
      border: "1px solid rgb(var(--ft-success-fg))",
      color: "rgb(var(--ft-success-fg))",
    };
  }
  return {
    ...base,
    border: "1px dashed rgb(var(--ft-border-strong))",
    color: "rgb(var(--ft-text-secondary))",
  };
}
