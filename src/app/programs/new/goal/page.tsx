"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

const GOAL_TYPES = [
  { value: "strength", label: "Strength PR", icon: "🏋️", desc: "Hit a specific weight on a lift" },
  { value: "weight", label: "Body Weight", icon: "⚖️", desc: "Reach a target body weight" },
  { value: "frequency", label: "Frequency", icon: "📅", desc: "Train a set number of days per week" },
  { value: "competition", label: "Powerlifting", icon: "🏆", desc: "Prepare for a competition" },
];

export default function GoalWizardPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState("");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("lbs");
  const [targetDate, setTargetDate] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [programWeeks, setProgramWeeks] = useState("12");
  const [saving, setSaving] = useState(false);

  const handleSelectType = (type: string) => {
    setGoalType(type);
    // Auto-suggest title
    const gt = GOAL_TYPES.find((t) => t.value === type);
    if (gt && !title) setTitle(gt.label);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!goalType || !title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: goalType,
          title: title.trim(),
          targetValue: targetValue ? parseFloat(targetValue) : null,
          targetUnit: targetUnit || null,
          targetDate: targetDate || null,
          createProgram: true,
          programName: title.trim(),
          programWeeks: programWeeks ? parseInt(programWeeks) : 12,
          daysPerWeek: daysPerWeek ? parseInt(daysPerWeek) : 4,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      router.push(`/programs/${data.program.id}`);
    } catch {
      toast.error("Failed to create goal and program.");
      setSaving(false);
    }
  };

  // Auto-suggest duration based on target date
  const suggestedWeeks = targetDate
    ? Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
    : null;

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-2xl mx-auto">
      <Link
        href="/programs/new"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>New Program</span>
      </Link>

      <h1 className="font-mono text-2xl font-bold tracking-tight mb-2">
        Goal-Driven Program
      </h1>
      <p className="text-ft-dim text-sm font-mono mb-8">
        Step {step} of 3 — {step === 1 ? "Pick your goal" : step === 2 ? "Set your target" : "Training setup"}
      </p>

      {/* Step 1: Goal Type */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {GOAL_TYPES.map((gt) => (
            <button key={gt.value} onClick={() => handleSelectType(gt.value)} className="text-left">
              <Card className={`h-full hover:border-ft-dim transition-colors ${goalType === gt.value ? "border-ft-white" : ""}`}>
                <span className="text-2xl mb-2 block">{gt.icon}</span>
                <h3 className="font-mono text-sm font-bold mb-1">{gt.label}</h3>
                <p className="text-ft-dim text-xs font-mono">{gt.desc}</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Target */}
      {step === 2 && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                Goal Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 315 Bench Press"
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
              />
            </div>

            {(goalType === "strength" || goalType === "weight" || goalType === "competition") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. 315"
                    className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                  />
                </div>
                <div>
                  <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <select
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="bw">body weight</option>
                  </select>
                </div>
              </div>
            )}

            {goalType === "frequency" && (
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Target Days/Week
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  max="7"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                />
              </div>
            )}

            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                Target Date (optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  // Auto-update program weeks
                  const weeks = Math.max(1, Math.ceil((new Date(e.target.value).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)));
                  setProgramWeeks(weeks.toString());
                }}
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim"
              />
              {suggestedWeeks && (
                <p className="text-ft-dim text-xs font-mono mt-1">
                  ~{suggestedWeeks} weeks from now
                </p>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(1)} className="text-ft-dim text-sm font-mono hover:text-ft-light">
                &larr; Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!title.trim()}
                className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Training Setup */}
      {step === 3 && (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Training Days/Week
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} days</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Program Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={programWeeks}
                    onChange={(e) => setProgramWeeks(e.target.value)}
                    min="1"
                    className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim"
                  />
                  <span className="text-ft-dim text-xs font-mono whitespace-nowrap">weeks</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-ft-bg border border-ft-border rounded">
              <p className="text-ft-dim text-[10px] font-mono uppercase tracking-wider mb-2">
                Program Preview
              </p>
              <p className="text-ft-light text-xs font-mono mb-1">
                <span className="text-ft-white font-bold">{title}</span> &middot; {programWeeks} weeks &middot; {daysPerWeek} days/week
              </p>
              <p className="text-ft-muted text-xs font-mono">
                {Math.max(1, Math.ceil(parseInt(programWeeks || "12") / 4))} blocks will be auto-created (
                {Math.floor(parseInt(programWeeks || "12") / Math.max(1, Math.ceil(parseInt(programWeeks || "12") / 4)))} weeks each)
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(2)} className="text-ft-dim text-sm font-mono hover:text-ft-light">
                &larr; Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-6 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Program"}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
