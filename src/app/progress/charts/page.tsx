"use client";

/**
 * R15 — `/progress/charts` — single-page aggregator over body weight,
 * weekly training volume, and recent lifestyle vitals (sleep, stress,
 * protein hits). Pure aggregation — no new endpoints. Falls back
 * gracefully when a chart's data source is empty.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const dynamic = "force-dynamic";

interface WeightPoint {
  date: string;
  weight: number;
}
interface VolumePoint {
  week: string;
  volume: number;
}
interface DailyVital {
  date: string;
  sleepMinutes: number | null;
  stress: number | null;
}
interface ProteinPoint {
  date: string;
  totalProtein: number;
}

export default function ProgressChartsPage() {
  const [weights, setWeights] = useState<WeightPoint[]>([]);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [vitals, setVitals] = useState<DailyVital[]>([]);
  const [protein, setProtein] = useState<ProteinPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hRes, wRes, vRes, pRes] = await Promise.all([
          fetch("/api/home"),
          fetch("/api/progress/weight"),
          fetch("/api/integrations/fitbit/daily?days=30"),
          fetch(
            `/api/nutrition/meals/range?from=${new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}`,
          ),
        ]);
        const hData = hRes.ok ? await hRes.json() : null;
        const wData = wRes.ok ? await wRes.json() : null;
        const vData = vRes.ok ? await vRes.json() : null;
        const pData = pRes.ok ? await pRes.json() : null;
        if (cancelled) return;

        const weightArr: WeightPoint[] = Array.isArray(wData?.entries)
          ? wData.entries.map((e: { date: string; weight: number }) => ({
              date: e.date,
              weight: Number(e.weight),
            }))
          : Array.isArray(hData?.bodyWeights)
            ? hData.bodyWeights.map((b: { date: string; weight: number }) => ({
                date: b.date,
                weight: Number(b.weight),
              }))
            : [];
        setWeights(weightArr);

        const volArr: VolumePoint[] = Array.isArray(hData?.weeklyVolume)
          ? hData.weeklyVolume
          : [];
        setVolume(volArr);

        const vitalsArr: DailyVital[] = Array.isArray(vData)
          ? vData.map((d: { date: string; sleepMinutes: number | null; stress: number | null }) => ({
              date: d.date,
              sleepMinutes: d.sleepMinutes,
              stress: d.stress,
            }))
          : [];
        setVitals(vitalsArr);

        const proteinArr: ProteinPoint[] = Array.isArray(pData?.days)
          ? pData.days.map((d: { date: string; totalProtein: number }) => ({
              date: d.date,
              totalProtein: Number(d.totalProtein),
            }))
          : [];
        setProtein(proteinArr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="px-4 py-6 pb-24 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/progress"
          className="text-sm text-ft-light hover:text-ft-white font-body"
        >
          ← Progress
        </Link>
        <h1 className="font-display text-3xl text-ft-on-bg mt-2 leading-tight">
          Charts
        </h1>
        <p className="font-body text-sm text-ft-on-bg-sec mt-2 leading-relaxed">
          Body weight, training volume, and lifestyle vitals at a glance.
        </p>
      </div>

      {loading && (
        <div className="font-body text-sm text-ft-on-bg-ter uppercase tracking-[0.14em]">
          Loading…
        </div>
      )}
      {!loading && (
        <div className="space-y-6">
          <ChartCard
            title="Body weight"
            subtitle={`${weights.length} entr${weights.length === 1 ? "y" : "ies"}`}
            empty={weights.length === 0}
            emptyHref="/progress/body"
            emptyLabel="Log your first weight →"
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weights}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ft-border))" />
                <XAxis dataKey="date" stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--ft-surface))",
                    border: "1px solid rgb(var(--ft-border))",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="rgb(var(--ft-accent))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "rgb(var(--ft-accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Weekly volume"
            subtitle={`${volume.length} week${volume.length === 1 ? "" : "s"}`}
            empty={volume.length === 0}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ft-border))" />
                <XAxis dataKey="week" stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--ft-surface))",
                    border: "1px solid rgb(var(--ft-border))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" fill="rgb(var(--ft-pull))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Sleep · last 30 days"
            subtitle={`${vitals.filter((v) => v.sleepMinutes != null).length} nights logged`}
            empty={vitals.filter((v) => v.sleepMinutes != null).length === 0}
            emptyHref="/gameplan#lifestyle"
            emptyLabel="Log sleep on /gameplan →"
          >
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={vitals
                  .filter((v) => v.sleepMinutes != null)
                  .map((v) => ({ date: v.date, hours: (v.sleepMinutes ?? 0) / 60 }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ft-border))" />
                <XAxis dataKey="date" stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} domain={[4, 10]} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--ft-surface))",
                    border: "1px solid rgb(var(--ft-border))",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="hours" stroke="rgb(var(--ft-pull))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Daily protein · last 30 days"
            subtitle={`${protein.length} day${protein.length === 1 ? "" : "s"} logged`}
            empty={protein.length === 0}
            emptyHref="/nutrition"
            emptyLabel="Log a meal →"
          >
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={protein}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ft-border))" />
                <XAxis dataKey="date" stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgb(var(--ft-text-tertiary))" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--ft-surface))",
                    border: "1px solid rgb(var(--ft-border))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="totalProtein" fill="rgb(var(--ft-legs))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </main>
  );
}

function ChartCard({
  title,
  subtitle,
  empty,
  emptyHref,
  emptyLabel,
  children,
}: {
  title: string;
  subtitle: string;
  empty: boolean;
  emptyHref?: string;
  emptyLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ft-card bg-ft-surface border border-ft-border p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-lg text-ft-on-bg">{title}</h2>
        <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter">
          {subtitle}
        </span>
      </div>
      {empty ? (
        <div className="py-6 text-center">
          <p className="font-body text-sm text-ft-on-bg-ter">No data yet</p>
          {emptyHref && emptyLabel && (
            <Link
              href={emptyHref}
              className="font-body text-xs uppercase tracking-[0.14em] text-ft-accent border-b border-ft-accent inline-block mt-2"
            >
              {emptyLabel}
            </Link>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
