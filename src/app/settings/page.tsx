"use client";

import { useState, useEffect } from "react";
import { Card, SectionHeader } from "@/components/ui";

function getStoredUnit(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export default function SettingsPage() {
  const [weightUnit, setWeightUnit] = useState(() => getStoredUnit("ft-weight-unit", "lbs"));
  const [distanceUnit, setDistanceUnit] = useState(() => getStoredUnit("ft-distance-unit", "miles"));

  useEffect(() => {
    localStorage.setItem("ft-weight-unit", weightUnit);
  }, [weightUnit]);

  useEffect(() => {
    localStorage.setItem("ft-distance-unit", distanceUnit);
  }, [distanceUnit]);
  const [exporting, setExporting] = useState(false);

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

      // Build CSV for workouts
      const lines: string[] = ["Date,Exercise,Set,Weight,Reps,RIR,RPE,Is PR"];
      for (const workout of workoutsData.workouts ?? []) {
        const date = workout.date?.split("T")[0] ?? "";
        for (const we of workout.exercises ?? []) {
          for (const set of we.sets ?? []) {
            lines.push(
              [
                date,
                `"${we.exercise?.name ?? ""}"`,
                set.setNumber,
                set.weight ?? "",
                set.reps ?? "",
                set.rir ?? "",
                set.rpe ?? "",
                set.isPr ? "Yes" : "",
              ].join(",")
            );
          }
        }
      }

      // Build CSV for body metrics
      const weightLines: string[] = ["Date,Weight,Body Fat %,Notes"];
      for (const entry of weightData.entries ?? []) {
        weightLines.push(
          [
            entry.date,
            entry.weight ?? "",
            entry.bodyFatPct ?? "",
            `"${entry.notes ?? ""}"`,
          ].join(",")
        );
      }

      // Build CSV for PRs
      const prLines: string[] = ["Exercise,PR Type,Weight,Reps,Date"];
      for (const pr of prsData.prs ?? []) {
        prLines.push(
          [
            `"${pr.exercise ?? ""}"`,
            pr.prType ?? "",
            pr.weight ?? "",
            pr.reps ?? "",
            pr.date ?? "",
          ].join(",")
        );
      }

      // Download workouts CSV
      downloadCSV("fittrack-workouts.csv", lines.join("\n"));
      // Short delay then download the rest
      setTimeout(() => downloadCSV("fittrack-body-metrics.csv", weightLines.join("\n")), 500);
      setTimeout(() => downloadCSV("fittrack-prs.csv", prLines.join("\n")), 1000);
    } catch {
      alert("Failed to export data.");
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
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Settings
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          App preferences and configuration
        </p>
      </div>

      <Card>
        <SectionHeader title="Units" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-mono">Weight unit</span>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="bg-ft-bg border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-mono">Distance unit</span>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="bg-ft-bg border border-ft-card rounded px-3 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
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
          <p className="text-ft-dim text-sm font-mono">
            Export your workout data, body metrics, and personal records as CSV files.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export All Data (CSV)"}
          </button>
        </div>
      </Card>
    </div>
  );
}
