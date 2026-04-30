"use client";

/**
 * R10 — "Recent changes" audit panel.
 *
 * Read-only list of the last 10 GameplanChange rows for the program.
 * Sources visible inline (CHECK_IN_APPLY / PLANNING_MODE / MANUAL_EDIT)
 * so the user can tell whether a change came from applying a rec or
 * from a Planning Mode session.
 *
 * Undo is exposed at apply time via toast; this panel is purely a
 * historical view. Clicking a row could deep-link to the rec that
 * drove it, but that's left for a follow-on UI pass.
 */

import { useEffect, useState } from "react";
import { Archivo } from "@/app/gameplan/_components/typography";

interface ChangeRow {
  id: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  source: "CHECK_IN_APPLY" | "PLANNING_MODE" | "MANUAL_EDIT";
  reason: string | null;
  recommendationId: string | null;
  createdAt: string;
}

export function RecentChangesPanel({ programId }: { programId: string }) {
  const [rows, setRows] = useState<ChangeRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/gameplan-changes?programId=${programId}&limit=10`);
        if (!res.ok) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setRows(Array.isArray(data?.changes) ? data.changes : []);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  if (!loaded) return null;
  if (rows.length === 0) {
    return (
      <div style={{ padding: "12px 12px 0" }}>
        <SectionHead />
        <div
          style={{
            padding: "12px 14px",
            border: "1px dashed rgb(var(--ft-border-faint))",
            background: "rgb(var(--ft-surface) / 0.6)",
          }}
        >
          <Archivo size={10} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
            No changes recorded yet. Applied recommendations and Planning Mode commits will list here.
          </Archivo>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 12px 0" }}>
      <SectionHead />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => (
          <ChangeRowCard key={r.id} row={r} />
        ))}
      </div>
    </div>
  );
}

function SectionHead() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
      <Archivo
        size={10}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
      >
        04 / RECENT CHANGES
      </Archivo>
      <Archivo
        size={9}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".12em", textTransform: "uppercase" }}
      >
        AUDIT TRAIL · LAST 10
      </Archivo>
    </div>
  );
}

function ChangeRowCard({ row }: { row: ChangeRow }) {
  const ts = new Date(row.createdAt);
  const sourceColor =
    row.source === "CHECK_IN_APPLY"
      ? "rgb(var(--ft-success-fg))"
      : row.source === "PLANNING_MODE"
      ? "rgb(var(--ft-accent))"
      : "rgb(var(--ft-text-tertiary))";

  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border-faint))",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <Archivo size={11} color="rgb(var(--ft-text-primary))" style={{ letterSpacing: ".04em" }}>
          {prettyField(row.field)}
        </Archivo>
        <Archivo size={9} color={sourceColor} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>
          {sourceLabel(row.source)}
        </Archivo>
      </div>
      <Archivo size={10} color="rgb(var(--ft-text-secondary))" style={{ letterSpacing: ".02em" }}>
        {formatValue(row.oldValue)} → {formatValue(row.newValue)}
      </Archivo>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
          {ts.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Archivo>
        {row.reason && (
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".05em", fontStyle: "italic" }}>
            {row.reason}
          </Archivo>
        )}
      </div>
    </div>
  );
}

function prettyField(field: string): string {
  if (field === "nutrition.calories") return "Daily calories";
  if (field === "nutrition.protein") return "Protein target";
  if (field === "goal.targetDate") return "Goal target date";
  if (field.startsWith("lifestyle.") && field.endsWith(".target")) {
    const key = field.slice("lifestyle.".length, -".target".length);
    return `Lifestyle · ${key.replaceAll("_", " ")}`;
  }
  return field;
}

function sourceLabel(s: ChangeRow["source"]): string {
  if (s === "CHECK_IN_APPLY") return "FROM REC";
  if (s === "PLANNING_MODE") return "PLANNING";
  return "MANUAL";
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
