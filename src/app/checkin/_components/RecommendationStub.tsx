"use client";

/**
 * Goal Engine recommendation feed — R8: implemented in goal-engine.
 * R10: Apply now hits POST /api/recommendations/[id]/apply which
 * mutates the underlying field + writes a GameplanChange audit row.
 * Toast Undo posts to /api/gameplan-changes/[id]/undo to revert.
 *
 * File name retained for caller-API stability (`/checkin/[id]/page.tsx`
 * + `/checkin/page.tsx` import the default export).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Plex, Mono, SectionH, Card } from "./primitives";
import { IconInfo } from "./icons";

interface RecRow {
  id: string;
  kind:
    | "behind_target"
    | "ahead_target"
    | "adherence_low"
    | "plateau_detected"
    | "lifestyle_streak_broken"
    | "pain_flag"
    | "adherence_low_streak";
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
  const toast = useToast();
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

  const dismiss = async (id: string, reason?: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed", dismissedReason: reason ?? null }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  /** R10 — POST /api/recommendations/[id]/apply runs the dispatcher,
   *  writes a GameplanChange audit row, and flips the rec to applied.
   *  On success we toast with an Undo affordance that posts to the
   *  paired undo endpoint. */
  const applyDirectly = async (rec: RecRow) => {
    setBusyId(rec.id);
    try {
      const res = await fetch(`/api/recommendations/${rec.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        // Field not in dispatcher → fall back to Planning Mode.
        if (res.status === 400 && rec.programId) {
          toast.info("This recommendation needs Planning Mode to apply", 3000);
          openInPlanningMode(rec);
          return;
        }
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { change } = (await res.json()) as {
        change: { id: string; field: string; oldValue: unknown; newValue: unknown };
      };
      await reload();
      toast.success(
        `Applied · ${change.field}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`,
        6000,
        {
          label: "Undo",
          onClick: () => {
            void undoChange(change.id);
          },
        },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Apply failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const undoChange = async (changeId: string) => {
    try {
      const res = await fetch(`/api/gameplan-changes/${changeId}/undo`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      await reload();
      toast.info("Reverted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Undo failed");
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
                  {rec.suggestedField && rec.suggestedValue && (
                    <button
                      onClick={() => applyDirectly(rec)}
                      disabled={busy}
                      className="font-body"
                      style={pillBtnStyle("apply")}
                    >
                      Apply
                    </button>
                  )}
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
                  <button
                    onClick={() => dismiss(rec.id)}
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
    case "lifestyle_streak_broken":
      return "LIFESTYLE STREAK";
    case "pain_flag":
      return "PAIN FLAG";
    case "adherence_low_streak":
      return "ADHERENCE STREAK";
  }
}

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(1);
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("value" in o) return formatValue(o.value);
  }
  return JSON.stringify(v);
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
