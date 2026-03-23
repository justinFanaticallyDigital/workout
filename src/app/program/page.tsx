"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";

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
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [targets, setTargets] = useState<MetricTarget[]>([]);
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/programs?status=active").then((r) => r.ok ? r.json() : { programs: [] }),
      fetch("/api/metric-targets").then((r) => r.ok ? r.json() : []),
      fetch("/api/home").then((r) => r.ok ? r.json() : null),
    ])
      .then(([programsRes, tgts, homeData]) => {
        // API returns { programs: [...] } wrapper
        const programs = programsRes.programs ?? programsRes;
        const prog = (Array.isArray(programs) ? programs[0] : null) || null;
        setProgram(prog);
        setTargets(Array.isArray(tgts) ? tgts : []);

        // Build metric display list
        const metricList: MetricDisplay[] = tgts.map((t: MetricTarget) => ({
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
      .catch(() => {})
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
        programId: program?.id || null,
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

  if (!program) {
    return (
      <div className="space-y-5 tab-enter">
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Program</h1>
        <div className="bg-ft-surface rounded-lg p-6 border border-ft-border text-center">
          <p className="text-secondary font-body">No active program</p>
          <p className="text-tertiary font-body text-sm mt-1">Set up goals and a training program to track your progress.</p>
          <Link href="/programs/new" className="cta-underline text-ft-white font-display text-sm mt-4 inline-block">
            Create Program
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current week
  const weeksElapsed = program.startDate
    ? Math.ceil((Date.now() - new Date(program.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 0;
  const totalWeeks = program.durationWeeks || 12;
  const activeBlock = program.blocks.find((b) => b.status === "active");

  return (
    <div className="space-y-5 tab-enter">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Program</h1>
        <p className="text-secondary font-body text-sm mt-0.5">
          {activeBlock?.name || program.name} &middot; {totalWeeks} weeks
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-ft-surface rounded-lg p-4 border border-ft-border">
        <ProgressBar
          value={Math.min(weeksElapsed, totalWeeks)}
          max={totalWeeks}
          label={`Week ${weeksElapsed} of ${totalWeeks}`}
          showValues
        />
      </div>

      {/* Metrics List */}
      <div className="space-y-2">
        {metrics.length === 0 && (
          <div className="bg-ft-surface rounded-lg p-4 border border-ft-border text-center">
            <p className="text-tertiary font-body text-sm">No metric targets set yet.</p>
            <p className="text-tertiary font-body text-xs mt-1">
              Add targets like body weight, 1RM estimates, weekly volume, etc.
            </p>
          </div>
        )}

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

      {/* Link to full programs page */}
      <div className="section-divider pt-4 text-center">
        <Link href={`/programs/${program.id}`} className="cta-underline text-ft-white font-display text-sm">
          View Full Program
        </Link>
      </div>
    </div>
  );
}
