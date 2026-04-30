"use client";

/**
 * R9 — "Lifestyle this week" row on the check-in submitted view.
 * Shows each LifestyleTarget the user is tracking (program-scoped +
 * user-wide) with this-week hit/miss counts derived from
 * /api/lifestyle-logs.
 *
 * Pure read-only here. The dashboard cards on /gameplan are the
 * write surface; this is just the snapshot the engine just looked
 * at to produce the recommendations rendered below.
 */

import { useEffect, useState } from "react";
import { Plex, Mono, SectionH, Card } from "./primitives";
import {
  lifestyleVariable,
  meetsTarget,
} from "@/lib/goal-engine/lifestyle-variables";

interface TargetRow {
  key: string;
  value: number;
  unit: string;
  comparator: "gte" | "lte" | "eq";
}

interface LogRow {
  date: string;
  variableKey: string;
  numValue: number | null;
  textValue: string | null;
}

export default function LifestyleWeekRow({ programId }: { programId: string | null }) {
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 6 * 86400000);
        const fromIso = weekAgo.toISOString().slice(0, 10);
        const toIso = today.toISOString().slice(0, 10);
        const targetsUrl = programId
          ? `/api/lifestyle-targets?programId=${programId}`
          : "/api/lifestyle-targets";
        const [tRes, lRes] = await Promise.all([
          fetch(targetsUrl),
          fetch(`/api/lifestyle-logs?from=${fromIso}&to=${toIso}`),
        ]);
        const tData = tRes.ok ? await tRes.json() : [];
        const lData = lRes.ok ? await lRes.json() : { logs: [] };
        if (cancelled) return;
        setTargets(Array.isArray(tData) ? tData : []);
        setLogs(Array.isArray(lData.logs) ? lData.logs : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  if (loading) return null;
  if (targets.length === 0) return null;

  return (
    <div style={{ padding: "8px 16px 0" }}>
      <SectionH kicker="2.5 / Lifestyle" title="This week" />
      <Card padding={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {targets.map((t) => {
            const variable = lifestyleVariable(t.key);
            if (!variable) return null;
            const keyLogs = logs.filter((l) => l.variableKey === t.key);
            const { hits, total } = countHits(keyLogs, t);
            return (
              <LifestyleStatRow
                key={t.key}
                label={variable.display}
                hits={hits}
                total={total}
                target={t}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function LifestyleStatRow({
  label,
  hits,
  total,
  target,
}: {
  label: string;
  hits: number;
  total: number;
  target: TargetRow;
}) {
  const tone =
    total === 0
      ? "neutral"
      : hits / 7 >= 5 / 7
      ? "good"
      : hits / 7 >= 3 / 7
      ? "warn"
      : "bad";
  const color =
    tone === "good"
      ? "rgb(var(--ft-success-fg))"
      : tone === "warn"
      ? "rgb(var(--ft-warn-fg))"
      : tone === "bad"
      ? "rgb(var(--ft-danger-fg))"
      : "rgb(var(--ft-text-tertiary))";
  const cmpLabel = target.comparator === "gte" ? "≥" : target.comparator === "lte" ? "≤" : "=";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <div>
        <Plex size={13} weight={500} style={{ display: "block" }}>
          {label}
        </Plex>
        <Mono size={10} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
          TARGET {cmpLabel} {target.value} {target.unit}
        </Mono>
      </div>
      <div style={{ textAlign: "right" }}>
        <Mono size={16} weight={600} color={color} style={{ letterSpacing: ".04em" }}>
          {hits}/7
        </Mono>
        <Mono size={9} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".15em", textTransform: "uppercase", display: "block" }}>
          {total === 0 ? "no logs" : tone === "good" ? "on track" : tone === "warn" ? "thin" : "behind"}
        </Mono>
      </div>
    </div>
  );
}

function countHits(logs: LogRow[], target: TargetRow): { hits: number; total: number } {
  const variable = lifestyleVariable(target.key);
  if (!variable) return { hits: 0, total: 0 };
  let hits = 0;
  for (const l of logs) {
    let value: number | null = null;
    if (variable.type === "enum_gyr") {
      const t = l.textValue?.toUpperCase();
      value = t === "GREEN" ? 3 : t === "YELLOW" ? 2 : t === "RED" ? 1 : null;
    } else {
      value = l.numValue;
    }
    if (value == null) continue;
    if (meetsTarget(target.comparator, value, target.value)) hits += 1;
  }
  return { hits, total: logs.length };
}
