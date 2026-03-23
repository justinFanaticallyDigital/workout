"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";
import { Card, Tag, EmptyState } from "@/components/ui";
import StatusIcon from "@/components/ui/StatusIcon";
import Timeline from "@/components/ui/Timeline";
import { useToast } from "@/components/ui/Toast";
import { authCheck, toastError } from "@/lib/fetch-helpers";

interface MetricTarget {
  id: string;
  metricKey: string;
  targetValue: number;
  unit: string;
  programId: string | null;
}

interface ProgramData {
  id: string;
  name: string;
  description?: string | null;
  durationWeeks: number | null;
  startDate: string | null;
  status: string;
  blocks: {
    id: string;
    name: string;
    blockNumber: number;
    durationWeeks: number | null;
    status: string;
  }[];
  _count?: { blocks: number };
}

interface MetricDisplay {
  key: string;
  label: string;
  current: number | null;
  target: number;
  unit: string;
  trend: string | null;
}

export default function ProgramTab() {
  const toast = useToast();
  const [activeProgram, setActiveProgram] = useState<ProgramData | null>(null);
  const [otherPrograms, setOtherPrograms] = useState<ProgramData[]>([]);
  const [targets, setTargets] = useState<MetricTarget[]>([]);
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/programs").then(authCheck).then((r) => r.ok ? r.json() : { programs: [] }),
      fetch("/api/metric-targets").then(authCheck).then((r) => r.ok ? r.json() : []),
      fetch("/api/home").then(authCheck).then((r) => r.ok ? r.json() : null),
    ])
      .then(([programsRes, tgts, homeData]) => {
        const programs: ProgramData[] = programsRes.programs ?? programsRes;
        const active = programs.find((p) => p.status === "active") ?? null;
        const others = programs.filter((p) => p.status !== "active");
        setActiveProgram(active);
        setOtherPrograms(others);
        setTargets(Array.isArray(tgts) ? tgts : []);

        // Build metric display list
        const metricList: MetricDisplay[] = (Array.isArray(tgts) ? tgts : []).map((t: MetricTarget) => ({
          key: t.metricKey,
          label: t.metricKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          current: t.metricKey === "body_weight" && homeData?.currentWeight
            ? homeData.currentWeight
            : null,
          target: t.targetValue,
          unit: t.unit,
          trend: null,
        }));

        setMetrics(metricList);
      })
      .catch(toastError(toast, "Failed to load program data"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveTarget = async (metricKey: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;

    const existing = targets.find((t) => t.metricKey === metricKey);
    await fetch("/api/metric-targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metricKey,
        targetValue: val,
        unit: existing?.unit || "lbs",
        programId: activeProgram?.id || null,
      }),
    });

    setTargets((prev) =>
      prev.map((t) => (t.metricKey === metricKey ? { ...t, targetValue: val } : t))
    );
    setMetrics((prev) =>
      prev.map((m) => (m.key === metricKey ? { ...m, target: val } : m))
    );
    setEditingKey(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-ft-surface rounded animate-pulse" />
        <div className="h-20 bg-ft-surface rounded-lg animate-pulse" />
        <div className="h-40 bg-ft-surface rounded-lg animate-pulse" />
      </div>
    );
  }

  // Calculate active program progress
  const weeksElapsed = activeProgram?.startDate
    ? Math.ceil((Date.now() - new Date(activeProgram.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 0;
  const totalWeeks = activeProgram?.durationWeeks || 12;
  const activeBlock = activeProgram?.blocks.find((b) => b.status === "active");
  const progressPct = activeProgram?.durationWeeks
    ? Math.min(Math.round((weeksElapsed / totalWeeks) * 100), 100)
    : 0;

  const pausedPrograms = otherPrograms.filter((p) => p.status === "paused");
  const completedPrograms = otherPrograms.filter((p) => p.status === "completed");

  return (
    <div className="space-y-5 tab-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ft-white tracking-wide">Program</h1>
          {activeProgram && (
            <p className="text-secondary font-body text-sm mt-0.5">
              {activeBlock?.name || activeProgram.name} &middot; {totalWeeks} weeks
            </p>
          )}
        </div>
        <Link
          href="/programs/new"
          className="cta-underline text-ft-white font-display text-sm"
        >
          + New Program
        </Link>
      </div>

      {/* Active Program Section */}
      {activeProgram ? (
        <>
          {/* Progress bar */}
          <Link href={`/programs/${activeProgram.id}`}>
            <Card className="border-l-4 border-l-ft-white hover:border-ft-dim transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon type="program" status="active" size="md" />
                <Tag className="bg-ft-white text-ft-bg">Active</Tag>
                <span className="text-ft-white font-body font-bold ml-1">{activeProgram.name}</span>
              </div>

              {/* Block Timeline */}
              {activeProgram.blocks.length > 0 && (
                <Timeline
                  className="mb-3"
                  segments={activeProgram.blocks.map((block) => ({
                    label: block.name,
                    width: block.durationWeeks ?? 1,
                    status: block.status as "active" | "completed" | "upcoming",
                  }))}
                  currentPosition={progressPct}
                />
              )}

              <ProgressBar
                value={Math.min(weeksElapsed, totalWeeks)}
                max={totalWeeks}
                label={`Week ${weeksElapsed} of ${totalWeeks}`}
                showValues
              />
            </Card>
          </Link>

          {/* Metrics List */}
          {metrics.length > 0 && (
            <div className="space-y-2">
              {metrics.map((m) => {
                const pct = m.current && m.target ? (m.current / m.target) * 100 : 0;
                const color = pct >= 80 ? "rgb(var(--ft-success))" : pct >= 50 ? "rgb(var(--ft-warn))" : "rgb(var(--ft-danger))";
                const isEditing = editingKey === m.key;

                return (
                  <div
                    key={m.key}
                    className="bg-ft-surface rounded-lg p-4 border border-ft-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-secondary font-body text-sm">{m.label}</span>
                      <span className="text-tertiary font-body text-xs">
                        {m.current ?? "—"} / {m.target} {m.unit}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-ft-card rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                      />
                    </div>

                    {m.trend && (
                      <p className="text-tertiary font-body text-xs">{m.trend}</p>
                    )}

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-ft-card border border-ft-border rounded px-2 py-1 text-ft-white font-body text-sm w-24"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveTarget(m.key)}
                          className="text-ft-success font-body text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="text-tertiary font-body text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingKey(m.key); setEditValue(String(m.target)); }}
                        className="text-tertiary font-body text-[10px] mt-1 hover:text-ft-light"
                      >
                        Edit Target
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Card className="border-dashed">
          <EmptyState
            title="No active program"
            description="Create a program to organize your training into blocks, days, and exercises."
            actionLabel="Create Program"
            actionHref="/programs/new"
          />
        </Card>
      )}

      {/* Paused Programs */}
      {pausedPrograms.length > 0 && (
        <div className="section-divider pt-4">
          <h2 className="font-body text-sm font-bold text-ft-light mb-3 uppercase tracking-wider">
            Paused
          </h2>
          <div className="space-y-2">
            {pausedPrograms.map((p) => (
              <Link key={p.id} href={`/programs/${p.id}`}>
                <Card className="hover:border-ft-dim transition-colors border-l-4 border-l-ft-warn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon type="program" status="paused" />
                      <span className="font-body text-sm font-bold text-ft-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-body text-ft-muted">
                      {p.durationWeeks && <span>{p.durationWeeks}wk</span>}
                      <span>{p.blocks.length} blocks</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Programs */}
      {completedPrograms.length > 0 && (
        <div className="section-divider pt-4">
          <h2 className="font-body text-sm font-bold text-ft-light mb-3 uppercase tracking-wider">
            Completed
          </h2>
          <div className="space-y-2">
            {completedPrograms.map((p) => (
              <Link key={p.id} href={`/programs/${p.id}`}>
                <Card className="hover:border-ft-dim transition-colors border-l-4 border-l-ft-success">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon type="program" status="completed" />
                      <span className="font-body text-sm font-bold text-ft-white">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-body text-ft-muted">
                      {p.durationWeeks && <span>{p.durationWeeks}wk</span>}
                      <span>{p.blocks.length} blocks</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
