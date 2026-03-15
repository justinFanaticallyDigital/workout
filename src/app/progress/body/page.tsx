"use client";

import { useState, useEffect } from "react";
import { Card, SectionHeader } from "@/components/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeightEntry {
  id: string;
  date: string;
  weight: number | null;
  bodyFatPct: number | null;
  notes: string | null;
}

export default function BodyMetricsPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = () => {
    fetch("/api/progress/weight")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          weight: parseFloat(weight),
          bodyFatPct: bodyFat ? parseFloat(bodyFat) : null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowForm(false);
      setWeight("");
      setBodyFat("");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      fetchEntries();
    } catch {
      alert("Failed to log weight.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  const chartData = entries
    .filter((e) => e.weight)
    .map((e) => ({
      date: e.date,
      weight: e.weight,
    }));

  const latestWeight = entries.length > 0 ? entries[entries.length - 1]?.weight : null;
  const firstWeight = entries.length > 0 ? entries[0]?.weight : null;
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Body Metrics
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Track weight, measurements, and body composition
        </p>
      </div>

      {/* Weight Chart */}
      <Card>
        <SectionHeader
          title="Weight Trend"
          action={
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
            >
              + Log Weight
            </button>
          }
        />

        {/* Log Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-ft-bg rounded border border-ft-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="185.0"
                  required
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="15.0"
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !weight}
                className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Log"}
              </button>
            </div>
          </form>
        )}

        {chartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#888888", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#555555" }}
                />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{ fontSize: 10, fill: "#888888", fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={{ stroke: "#555555" }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2e2e2e",
                    border: "1px solid #555555",
                    borderRadius: 4,
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#cccccc" }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={{ fill: "#ffffff", r: 3 }}
                  name="Weight (lbs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            {entries.length === 0 ? (
              <>
                <p className="text-ft-muted text-sm font-mono">
                  No weight entries yet
                </p>
                <p className="text-ft-dim text-xs font-mono mt-1">
                  Start logging your body weight to see trends
                </p>
              </>
            ) : (
              <p className="text-ft-muted text-sm font-mono">
                Log more entries to see the trend chart
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Weight Log Table */}
      {entries.length > 0 && (
        <Card>
          <SectionHeader title="Weight Log" subtitle={`${entries.length} entries`} />
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 text-ft-muted text-[10px] font-mono uppercase tracking-wider">
              <span>Date</span>
              <span>Weight</span>
              <span>Body Fat</span>
              <span>Notes</span>
            </div>
            {[...entries].reverse().map((entry) => (
              <div key={entry.id} className="grid grid-cols-4 gap-2 text-xs font-mono border-t border-ft-border pt-1.5">
                <span className="text-ft-dim">{entry.date}</span>
                <span className="text-ft-light">{entry.weight ?? "—"} lbs</span>
                <span className="text-ft-dim">{entry.bodyFatPct ? `${entry.bodyFatPct}%` : "—"}</span>
                <span className="text-ft-muted truncate">{entry.notes ?? "—"}</span>
              </div>
            ))}
          </div>
          {weightChange && (
            <div className="mt-3 pt-3 border-t border-ft-border">
              <span className="text-ft-dim text-xs font-mono">
                Change: <span className={`font-bold ${Number(weightChange) > 0 ? "text-ft-warn" : "text-ft-success"}`}>
                  {Number(weightChange) > 0 ? "+" : ""}{weightChange} lbs
                </span>
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
