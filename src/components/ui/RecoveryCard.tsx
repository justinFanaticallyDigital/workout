"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import FitbitIcon from "@/components/ui/FitbitIcon";

interface DailyMetric {
  date: string;
  steps: number | null;
  activeMinutes: number | null;
  caloriesBurned: number | null;
  sleepMinutes: number | null;
  sleepDeep: number | null;
  sleepLight: number | null;
  sleepRem: number | null;
  sleepWake: number | null;
  restingHr: number | null;
}

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function getSleepQuality(minutes: number): { label: string; color: string } {
  if (minutes >= 420) return { label: "Good", color: "text-ft-success" };
  if (minutes >= 360) return { label: "Fair", color: "text-ft-warn" };
  return { label: "Low", color: "text-ft-danger" };
}

function getHrTrend(metrics: DailyMetric[]): { delta: number; label: string; color: string } | null {
  const hrValues = metrics.filter((m) => m.restingHr).map((m) => m.restingHr!);
  if (hrValues.length < 3) return null;
  const recent = hrValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const baseline = hrValues.slice(0, Math.max(1, hrValues.length - 3)).reduce((a, b) => a + b, 0) / Math.max(1, hrValues.length - 3);
  const delta = Math.round(recent - baseline);
  if (delta > 3) return { delta, label: "Elevated", color: "text-ft-danger" };
  if (delta < -2) return { delta, label: "Improving", color: "text-ft-success" };
  return { delta, label: "Normal", color: "text-ft-dim" };
}

export default function RecoveryCard() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check connection first
    fetch("/api/integrations/fitbit/sync")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.connected) {
          setConnected(true);
          // Fetch daily metrics
          return fetch("/api/integrations/fitbit/daily?days=14")
            .then((r) => r.json())
            .then((d) => setMetrics(d.metrics ?? []));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render if not connected or no data
  if (!connected || loading) return null;
  if (metrics.length === 0) return null;

  const today = metrics[metrics.length - 1];
  const yesterday = metrics.length > 1 ? metrics[metrics.length - 2] : null;
  const latest = today ?? yesterday;
  if (!latest) return null;

  const hrTrend = getHrTrend(metrics);
  const sleepEntry = latest.sleepMinutes ? latest : yesterday;

  // Don't show if there's literally nothing to display
  if (!sleepEntry?.sleepMinutes && !latest.restingHr && !latest.steps) return null;

  return (
    <Card>
      <SectionHeader
        title="Recovery"
        action={
          <span className="inline-flex items-center gap-1 text-[#00B0B9] text-[10px] font-mono">
            <FitbitIcon size={10} color="#00B0B9" /> Fitbit
          </span>
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Sleep */}
        {sleepEntry?.sleepMinutes && (
          <div className="flex flex-col">
            <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">Sleep</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              {formatSleep(sleepEntry.sleepMinutes)}
            </span>
            <span className={`text-[10px] font-mono ${getSleepQuality(sleepEntry.sleepMinutes).color}`}>
              {getSleepQuality(sleepEntry.sleepMinutes).label}
            </span>
            {sleepEntry.sleepDeep != null && (
              <span className="text-ft-muted text-[10px] font-mono mt-0.5">
                Deep: {sleepEntry.sleepDeep}m · REM: {sleepEntry.sleepRem ?? 0}m
              </span>
            )}
          </div>
        )}

        {/* Resting HR */}
        {latest.restingHr && (
          <div className="flex flex-col">
            <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">Resting HR</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              {latest.restingHr} <span className="text-ft-dim text-xs">bpm</span>
            </span>
            {hrTrend && (
              <span className={`text-[10px] font-mono ${hrTrend.color}`}>
                {hrTrend.label} ({hrTrend.delta > 0 ? "+" : ""}{hrTrend.delta})
              </span>
            )}
          </div>
        )}

        {/* Steps */}
        {latest.steps != null && latest.steps > 0 && (
          <div className="flex flex-col">
            <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">Steps</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              {latest.steps.toLocaleString()}
            </span>
            {latest.activeMinutes != null && (
              <span className="text-ft-dim text-[10px] font-mono">
                {latest.activeMinutes} active min
              </span>
            )}
          </div>
        )}

        {/* Calories */}
        {latest.caloriesBurned != null && latest.caloriesBurned > 0 && (
          <div className="flex flex-col">
            <span className="text-ft-muted text-[10px] font-mono uppercase tracking-wider">Burned</span>
            <span className="text-ft-white font-mono font-bold text-lg">
              {latest.caloriesBurned.toLocaleString()}
            </span>
            <span className="text-ft-dim text-[10px] font-mono">kcal</span>
          </div>
        )}
      </div>

      {/* Sleep quality context for workout */}
      {sleepEntry?.sleepMinutes && sleepEntry.sleepMinutes < 360 && (
        <div className="mt-3 pt-3 border-t border-ft-border">
          <p className="text-ft-warn text-xs font-mono">
            Low sleep last night — consider a lighter session or active recovery.
          </p>
        </div>
      )}
      {hrTrend && hrTrend.delta > 5 && (
        <div className="mt-3 pt-3 border-t border-ft-border">
          <p className="text-ft-danger text-xs font-mono">
            Resting HR elevated +{hrTrend.delta} bpm above baseline — signs of accumulated fatigue.
          </p>
        </div>
      )}
    </Card>
  );
}
