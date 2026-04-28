"use client";

import { useState, useEffect } from "react";
import { Card, SectionHeader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { THEMES, type ThemeId, getTheme, setTheme } from "@/lib/theme";

function getStoredUnit(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export default function SettingsPage() {
  const [weightUnit, setWeightUnit] = useState(() => getStoredUnit("ft-weight-unit", "lbs"));
  const [distanceUnit, setDistanceUnit] = useState(() => getStoredUnit("ft-distance-unit", "miles"));
  const [activeTheme, setActiveTheme] = useState<ThemeId>("default");
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  // Hydrate theme on mount (avoids SSR mismatch)
  useEffect(() => { setActiveTheme(getTheme()); }, []);

  useEffect(() => {
    localStorage.setItem("ft-weight-unit", weightUnit);
  }, [weightUnit]);

  useEffect(() => {
    localStorage.setItem("ft-distance-unit", distanceUnit);
  }, [distanceUnit]);

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    setActiveTheme(id);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const [workoutsRes, weightRes, prsRes] = await Promise.all([
        fetch("/api/workouts?limit=1000"),
        fetch("/api/progress/weight"),
        fetch("/api/progress/prs"),
      ]);

      const workoutsData = await workoutsRes.json();
      const weightData = await weightRes.json();
      const prsData = await prsRes.json();

      const lines: string[] = ["Date,Exercise,Set,Weight,Reps,RIR,RPE,Is PR"];
      for (const workout of workoutsData.workouts ?? []) {
        const date = workout.date?.split("T")[0] ?? "";
        for (const we of workout.exercises ?? []) {
          for (const set of we.sets ?? []) {
            lines.push([
              date,
              `"${we.exercise?.name ?? ""}"`,
              set.setNumber,
              set.weight ?? "",
              set.reps ?? "",
              set.rir ?? "",
              set.rpe ?? "",
              set.isPr ? "Yes" : "",
            ].join(","));
          }
        }
      }

      const weightLines: string[] = ["Date,Weight,Body Fat %,Notes"];
      for (const entry of weightData.entries ?? []) {
        weightLines.push([
          entry.date,
          entry.weight ?? "",
          entry.bodyFatPct ?? "",
          `"${entry.notes ?? ""}"`,
        ].join(","));
      }

      const prLines: string[] = ["Exercise,PR Type,Weight,Reps,Date"];
      for (const pr of prsData.prs ?? []) {
        prLines.push([
          `"${pr.exercise ?? ""}"`,
          pr.prType ?? "",
          pr.weight ?? "",
          pr.reps ?? "",
          pr.date ?? "",
        ].join(","));
      }

      downloadCSV("fittrack-workouts.csv", lines.join("\n"));
      setTimeout(() => downloadCSV("fittrack-body-metrics.csv", weightLines.join("\n")), 500);
      setTimeout(() => downloadCSV("fittrack-prs.csv", prLines.join("\n")), 1000);
    } catch {
      toast.error("Failed to export data.");
    }
    setExporting(false);
  };

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ft-white tracking-wide">
          Settings
        </h1>
        <p className="text-ft-dim text-sm font-data mt-1">
          App preferences and configuration
        </p>
      </div>

      {/* THEME PICKER */}
      <Card>
        <SectionHeader title="Theme" />
        <p className="text-ft-dim text-sm font-data mb-4">
          Visual style. Applies app-wide and persists on this device.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const isActive = activeTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={[
                  "text-left p-3 rounded-ft border transition-colors touch-target",
                  isActive
                    ? "border-ft-accent bg-ft-card"
                    : "border-ft-border bg-ft-surface hover:bg-ft-card",
                ].join(" ")}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-ft-white text-sm font-semibold">
                    {t.label}
                  </span>
                  {isActive && (
                    <span className="ft-stamp">Active</span>
                  )}
                </div>
                <div className="text-xs text-ft-dim font-data mt-1">{t.blurb}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Units" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-data">Weight unit</span>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="bg-ft-bg border border-ft-card rounded-ft px-3 py-1.5 text-sm font-data text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-data">Distance unit</span>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="bg-ft-bg border border-ft-card rounded-ft px-3 py-1.5 text-sm font-data text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
            >
              <option value="miles">miles</option>
              <option value="km">km</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Data" />
        <div className="space-y-4">
          <p className="text-ft-dim text-sm font-data">
            Export your workout data, body metrics, and personal records as CSV files.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-ft-white text-ft-bg font-display text-sm font-bold px-4 py-2 rounded-ft hover:bg-ft-light transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export All Data (CSV)"}
          </button>
        </div>
      </Card>
    </div>
  );
}
