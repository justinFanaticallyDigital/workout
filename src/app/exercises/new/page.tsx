"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

const MOVEMENT_PATTERNS = [
  "Horizontal Push",
  "Vertical Push",
  "Horizontal Pull",
  "Vertical Pull",
  "Squat",
  "Hip Hinge",
  "Elbow Flexion",
  "Elbow Extension",
  "Shoulder Isolation",
  "Core",
  "Calf",
];

const PRIMARY_MUSCLES = [
  "Chest",
  "Lats",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Biceps",
  "Triceps",
  "Shoulders",
  "Traps",
  "Calves",
  "Forearms",
  "Abs",
  "Erectors",
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Band",
  "Lever Plate",
  "Smith Machine",
];

const inputClasses =
  "w-full bg-ft-bg border border-ft-card text-ft-white font-mono text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-ft-dim transition-colors placeholder:text-ft-muted";

const labelClasses =
  "block text-ft-dim text-[10px] uppercase tracking-widest font-mono mb-1.5";

export default function NewExercisePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [modification, setModification] = useState("");
  const [pattern, setPattern] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState("");
  const [equipment, setEquipment] = useState("");

  const generatedName = [name, modification, equipment]
    .filter(Boolean)
    .join(" ")
    ? `${name}${modification ? ` - ${modification}` : ""}${equipment ? ` ${equipment}` : ""}`
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: would save the exercise
    router.push("/exercises");
  };

  return (
    <div className="min-h-screen bg-ft-bg p-6">
      {/* Breadcrumb */}
      <Link
        href="/exercises"
        className="text-ft-dim font-mono text-xs uppercase tracking-wider hover:text-ft-light transition-colors"
      >
        ← Exercises
      </Link>

      <h1 className="text-ft-white font-mono font-bold text-2xl uppercase tracking-wider mt-4 mb-6">
        New Exercise
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        {/* Name Preview */}
        {generatedName && (
          <Card>
            <p className="text-ft-dim font-mono text-[10px] uppercase tracking-widest mb-1">
              Preview
            </p>
            <p className="text-ft-white font-mono font-bold text-lg">
              {generatedName}
            </p>
            <p className="text-ft-muted font-mono text-[10px] mt-1">
              Convention: Movement - Modification Equipment
            </p>
          </Card>
        )}

        {/* Movement Name */}
        <div>
          <label className={labelClasses}>Movement Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bench Press, Curl, Row"
            className={inputClasses}
            required
          />
        </div>

        {/* Modification */}
        <div>
          <label className={labelClasses}>Modification</label>
          <input
            type="text"
            value={modification}
            onChange={(e) => setModification(e.target.value)}
            placeholder="e.g. Incline, Flat, Romanian, Lateral"
            className={inputClasses}
          />
        </div>

        {/* Equipment */}
        <div>
          <label className={labelClasses}>Equipment</label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="" disabled>
              Select equipment
            </option>
            {EQUIPMENT_OPTIONS.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        {/* Movement Pattern */}
        <div>
          <label className={labelClasses}>Movement Pattern</label>
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="" disabled>
              Select pattern
            </option>
            {MOVEMENT_PATTERNS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Muscle */}
        <div>
          <label className={labelClasses}>Primary Muscle</label>
          <select
            value={primaryMuscle}
            onChange={(e) => setPrimaryMuscle(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="" disabled>
              Select primary muscle
            </option>
            {PRIMARY_MUSCLES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Muscles */}
        <div>
          <label className={labelClasses}>Secondary Muscles</label>
          <input
            type="text"
            value={secondaryMuscles}
            onChange={(e) => setSecondaryMuscles(e.target.value)}
            placeholder="e.g. Front Deltoids, Triceps"
            className={inputClasses}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-ft-light transition-colors"
          >
            Create Exercise
          </button>
          <Link
            href="/exercises"
            className="text-ft-dim font-mono text-sm hover:text-ft-light transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
