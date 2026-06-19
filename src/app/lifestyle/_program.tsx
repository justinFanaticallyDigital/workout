"use client";

/**
 * 3.4 Lifestyle — Program tier. Rail-driven layers (Today / Week / Routine /
 * Gameplan-locked) through the shared PillarShell. Wired to the existing
 * LifestyleTarget + LifestyleLog data (per active program). Quick-log writes
 * to /api/lifestyle-logs. The Gameplan (adaptive, check-in-driven) layer is
 * a locked preview.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PillarShell, Header, Card, Button, Chip, Stamp, SectionLabel, Stepper } from "@/components/v2";
import type { RailKey } from "@/components/v2";
import { LIFESTYLE_VARIABLES } from "@/lib/goal-engine/lifestyle-variables";

interface Target {
  key: string;
  value: number;
  unit: string;
  comparator: "gte" | "lte" | "eq";
}
interface LogRow {
  date: string;
  variableKey: string;
  numValue: number | null;
}

const VAR = new Map(LIFESTYLE_VARIABLES.map((v) => [v.key, v]));
const SYM: Record<Target["comparator"], string> = { gte: "≥", lte: "≤", eq: "=" };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function stepFor(unit: string): number {
  if (/hour/i.test(unit)) return 0.5;
  if (/step/i.test(unit)) return 500;
  if (/min/i.test(unit)) return 5;
  if (/^g$|gram|protein/i.test(unit)) return 10;
  return 1;
}
function inBand(v: number, t: Target): boolean {
  return t.comparator === "gte" ? v >= t.value : t.comparator === "lte" ? v <= t.value : v === t.value;
}
function label(key: string): string {
  return VAR.get(key)?.display ?? key.replace(/_/g, " ");
}

export default function ProgramLifestyleTab() {
  const [programId, setProgramId] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [activeKey, setActiveKey] = useState<RailKey>("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      const home = await fetch("/api/home").then((r) => (r.ok ? r.json() : null));
      const pid: string | null = home?.activeProgram?.id ?? null;
      if (!live) return;
      setProgramId(pid);
      const weekAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
      const [tg, lg] = await Promise.all([
        fetch(`/api/lifestyle-targets${pid ? `?programId=${pid}` : ""}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/lifestyle-logs?from=${weekAgo}&to=${todayISO()}`).then((r) => (r.ok ? r.json() : { logs: [] })),
      ]);
      if (!live) return;
      setTargets(Array.isArray(tg) ? tg : []);
      setLogs(lg?.logs ?? []);
      setLoading(false);
    })().catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const todayVal = useCallback(
    (key: string): number | null => {
      const t = todayISO();
      const row = logs.find((l) => l.date === t && l.variableKey === key);
      return row?.numValue ?? null;
    },
    [logs],
  );

  const logValue = useCallback(async (key: string, value: number, unit: string) => {
    const t = todayISO();
    setLogs((prev) => {
      const rest = prev.filter((l) => !(l.date === t && l.variableKey === key));
      return [...rest, { date: t, variableKey: key, numValue: value }];
    });
    await fetch("/api/lifestyle-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variableKey: key, date: t, numValue: value, unit }),
    }).catch(() => undefined);
  }, []);

  const layer = loading ? (
    <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
  ) : activeKey === "block" ? (
    <WeekLayer targets={targets} logs={logs} />
  ) : activeKey === "model" ? (
    <RoutineLayer targets={targets} programId={programId} />
  ) : activeKey === "gameplan" ? (
    <GameplanLocked />
  ) : (
    <TodayLayer targets={targets} todayVal={todayVal} onLog={logValue} />
  );

  return (
    <PillarShell
      pillar="lifestyle"
      activeKey={activeKey}
      onSelectRail={setActiveKey}
      header={<Header kind="home" title="Lifestyle" subtitle="Program" right="gear" />}
    >
      {layer}
    </PillarShell>
  );
}

// ── Today ──
function TodayLayer({
  targets,
  todayVal,
  onLog,
}: {
  targets: Target[];
  todayVal: (key: string) => number | null;
  onLog: (key: string, value: number, unit: string) => void;
}) {
  if (targets.length === 0) {
    return (
      <div className="px-4 pt-3">
        <Card className="px-4 py-4">
          <Stamp>Lifestyle targets</Stamp>
          <div className="mt-1.5 font-display text-base font-bold text-ft-white">No targets set</div>
          <p className="mt-1 font-body text-xs leading-relaxed text-ft-light">
            Lifestyle targets are seeded with a Gameplan, or set in Planning Mode. Log against them here once they exist.
          </p>
        </Card>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2.5 px-4 pt-3">
      {targets.map((t) => {
        const v = todayVal(t.key);
        const band = v != null && inBand(v, t);
        const step = stepFor(t.unit);
        const display = v ?? t.value;
        return (
          <Card key={t.key} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <div className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">{label(t.key)}</div>
                <div className="mt-1 font-number text-2xl font-bold text-ft-white">
                  {v != null ? v : "—"}
                  <span className="ml-1 text-xs font-normal text-ft-dim">{t.unit}</span>
                </div>
                <div className="mt-0.5 font-body text-[11px] text-ft-dim">
                  Target {SYM[t.comparator]} {t.value} {t.unit}
                </div>
              </div>
              {v != null ? (
                <Chip tone={band ? "success" : "warn"} size="sm">
                  {band ? "On track" : t.comparator === "lte" ? "Over" : "Under"}
                </Chip>
              ) : (
                <Chip tone="neutral" size="sm">
                  Not logged
                </Chip>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-body text-xs text-ft-light">Log today</span>
              <Stepper
                value={display}
                step={step}
                min={0}
                onChange={(next) => onLog(t.key, next, t.unit)}
                fmt={(x) => `${x % 1 === 0 ? x : x.toFixed(1)} ${t.unit}`}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Week ──
function WeekLayer({ targets, logs }: { targets: Target[]; logs: LogRow[] }) {
  const days = Array.from({ length: 7 }).map((_, i) =>
    new Date(Date.now() - (6 - i) * 86_400_000).toISOString().slice(0, 10),
  );
  if (targets.length === 0) {
    return <div className="px-4 pt-6 font-body text-sm text-ft-dim">No targets to summarize.</div>;
  }
  return (
    <div className="px-4 pt-3">
      <SectionLabel right="Last 7 days">This week</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {targets.map((t) => (
          <Card key={t.key} className="px-3.5 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-body text-[13px] font-semibold text-ft-white">{label(t.key)}</span>
              <span className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">
                {SYM[t.comparator]} {t.value} {t.unit}
              </span>
            </div>
            <div className="flex gap-1.5">
              {days.map((d) => {
                const row = logs.find((l) => l.date === d && l.variableKey === t.key);
                const v = row?.numValue ?? null;
                const band = v != null && inBand(v, t);
                return (
                  <div
                    key={d}
                    title={`${d}: ${v ?? "—"}`}
                    className={[
                      "h-9 flex-1 rounded-ft-sm",
                      v == null
                        ? "border border-dashed border-ft-border-faint bg-ft-surface-alt"
                        : band
                          ? "bg-ft-success"
                          : "bg-ft-warn",
                    ].join(" ")}
                  />
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Routine ──
function RoutineLayer({ targets, programId }: { targets: Target[]; programId: string | null }) {
  return (
    <div className="px-4 pt-3">
      <Card raised className="px-4 py-3.5">
        <Stamp>Routine</Stamp>
        <div className="mt-1 font-display text-base font-bold tracking-[-0.01em] text-ft-white">Daily targets</div>
        <p className="mt-1 font-body text-xs text-ft-dim">The cues your plan holds you to. Edit them in Planning Mode.</p>
      </Card>

      {targets.length > 0 ? (
        <>
          <SectionLabel right={`${targets.length}`}>Targets</SectionLabel>
          <Card className="overflow-hidden p-0">
            {targets.map((t, i) => (
              <div
                key={t.key}
                className={["flex items-center justify-between px-3.5 py-3", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
              >
                <span className="font-body text-[13px] font-semibold text-ft-white">{label(t.key)}</span>
                <span className="font-data text-[11.5px] tracking-[0.02em] text-ft-light">
                  {SYM[t.comparator]} {t.value} {t.unit}
                </span>
              </div>
            ))}
          </Card>
        </>
      ) : (
        <p className="px-1 pt-3 font-body text-xs text-ft-dim">No targets configured yet.</p>
      )}

      {programId && (
        <Link href={`/gameplan/${programId}/planning`} className="mt-3 block">
          <Button kind="secondary" size="md" fullWidth>
            Edit in Planning Mode →
          </Button>
        </Link>
      )}
    </div>
  );
}

// ── Gameplan locked ──
function GameplanLocked() {
  const features = [
    "Readiness from sleep, HRV, soreness",
    "Check-in tunes targets weekly",
    "Pain flags + contingency cues",
  ];
  return (
    <div className="px-4 pt-3">
      <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
        <div className="flex items-center justify-between">
          <Stamp>Gameplan tier</Stamp>
          <Chip tone="neutral" size="sm">
            Locked
          </Chip>
        </div>
        <div className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Adaptive lifestyle</div>
        <div className="mt-3 flex flex-col gap-1.5">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
              <span className="mt-px text-ft-accent">·</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex gap-2">
          <Link href="/shelf" className="flex-1">
            <Button kind="primary" size="md" fullWidth>
              See Gameplan →
            </Button>
          </Link>
          <Link href="/shelf/compare">
            <Button kind="secondary" size="md">
              Compare
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
