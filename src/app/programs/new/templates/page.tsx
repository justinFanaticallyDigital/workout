"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";

interface TemplateBlock {
  name: string;
  weeks: number;
  days: { name: string; type: string; exercises: string[] }[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  level: string;
  tags: string[];
  blocks: TemplateBlock[];
}

const TEMPLATES: Template[] = [
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    description: "Classic 6-day bodybuilding split. Two rotations per week targeting all muscle groups.",
    durationWeeks: 8,
    daysPerWeek: 6,
    level: "Intermediate",
    tags: ["hypertrophy", "6-day"],
    blocks: [
      {
        name: "Hypertrophy",
        weeks: 8,
        days: [
          { name: "Push A", type: "lifting", exercises: ["Bench Press - BB", "OHP - DB", "Incline DB Press", "Lateral Raise", "Tricep Pushdown"] },
          { name: "Pull A", type: "lifting", exercises: ["Barbell Row", "Pull-Up", "Face Pull", "Barbell Curl", "Hammer Curl"] },
          { name: "Legs A", type: "lifting", exercises: ["Squat - BB", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Push B", type: "lifting", exercises: ["OHP - BB", "Dumbbell Bench Press", "Cable Fly", "Lateral Raise", "Overhead Tricep Extension"] },
          { name: "Pull B", type: "lifting", exercises: ["Deadlift - BB", "Seated Cable Row", "Lat Pulldown", "Preacher Curl", "Rear Delt Fly"] },
          { name: "Legs B", type: "lifting", exercises: ["Front Squat", "Hip Thrust", "Walking Lunge", "Leg Extension", "Seated Calf Raise"] },
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower Split",
    description: "4-day split alternating upper and lower body. Great balance of volume and recovery.",
    durationWeeks: 8,
    daysPerWeek: 4,
    level: "Intermediate",
    tags: ["hypertrophy", "4-day"],
    blocks: [
      {
        name: "Base Phase",
        weeks: 8,
        days: [
          { name: "Upper A", type: "lifting", exercises: ["Bench Press - BB", "Barbell Row", "OHP - DB", "Pull-Up", "Bicep Curl"] },
          { name: "Lower A", type: "lifting", exercises: ["Squat - BB", "Romanian Deadlift", "Leg Press", "Leg Curl", "Calf Raise"] },
          { name: "Upper B", type: "lifting", exercises: ["Incline DB Press", "Seated Cable Row", "Lateral Raise", "Face Pull", "Tricep Pushdown"] },
          { name: "Lower B", type: "lifting", exercises: ["Deadlift - BB", "Bulgarian Split Squat", "Hip Thrust", "Leg Extension", "Seated Calf Raise"] },
        ],
      },
    ],
  },
  {
    id: "full-body-3x",
    name: "Full Body 3x/Week",
    description: "Three full-body sessions per week. Ideal for beginners or those with limited time.",
    durationWeeks: 12,
    daysPerWeek: 3,
    level: "Beginner",
    tags: ["strength", "3-day"],
    blocks: [
      {
        name: "Foundation",
        weeks: 12,
        days: [
          { name: "Day A", type: "lifting", exercises: ["Squat - BB", "Bench Press - BB", "Barbell Row", "OHP - DB", "Plank"] },
          { name: "Day B", type: "lifting", exercises: ["Deadlift - BB", "OHP - BB", "Pull-Up", "Dumbbell Bench Press", "Leg Curl"] },
          { name: "Day C", type: "lifting", exercises: ["Front Squat", "Incline DB Press", "Seated Cable Row", "Lateral Raise", "Bicep Curl"] },
        ],
      },
    ],
  },
  {
    id: "531",
    name: "5/3/1 Style",
    description: "Periodized strength program with 4-week mesocycles. Focus on the big four lifts.",
    durationWeeks: 12,
    daysPerWeek: 4,
    level: "Intermediate+",
    tags: ["strength", "4-day", "periodized"],
    blocks: [
      {
        name: "Cycle 1 (5s)",
        weeks: 4,
        days: [
          { name: "Squat Day", type: "lifting", exercises: ["Squat - BB", "Leg Press", "Leg Curl", "Ab Wheel"] },
          { name: "Bench Day", type: "lifting", exercises: ["Bench Press - BB", "Dumbbell Bench Press", "Tricep Pushdown", "Face Pull"] },
          { name: "Deadlift Day", type: "lifting", exercises: ["Deadlift - BB", "Romanian Deadlift", "Barbell Row", "Plank"] },
          { name: "OHP Day", type: "lifting", exercises: ["OHP - BB", "Lateral Raise", "Pull-Up", "Bicep Curl"] },
        ],
      },
      {
        name: "Cycle 2 (3s)",
        weeks: 4,
        days: [
          { name: "Squat Day", type: "lifting", exercises: ["Squat - BB", "Front Squat", "Leg Extension", "Calf Raise"] },
          { name: "Bench Day", type: "lifting", exercises: ["Bench Press - BB", "Incline DB Press", "Cable Fly", "Overhead Tricep Extension"] },
          { name: "Deadlift Day", type: "lifting", exercises: ["Deadlift - BB", "Hip Thrust", "Seated Cable Row", "Plank"] },
          { name: "OHP Day", type: "lifting", exercises: ["OHP - BB", "Arnold Press", "Rear Delt Fly", "Hammer Curl"] },
        ],
      },
      {
        name: "Cycle 3 (1s)",
        weeks: 4,
        days: [
          { name: "Squat Day", type: "lifting", exercises: ["Squat - BB", "Pause Squat", "Walking Lunge", "Ab Wheel"] },
          { name: "Bench Day", type: "lifting", exercises: ["Bench Press - BB", "Close-Grip Bench", "Dumbbell Fly", "Tricep Dip"] },
          { name: "Deadlift Day", type: "lifting", exercises: ["Deadlift - BB", "Deficit Deadlift", "Barbell Row", "Plank"] },
          { name: "OHP Day", type: "lifting", exercises: ["OHP - BB", "Push Press", "Lateral Raise", "Face Pull"] },
        ],
      },
    ],
  },
];

export default function TemplateBrowserPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);

  const selected = TEMPLATES.find((t) => t.id === selectedId);

  const handleClone = async (template: Template) => {
    setCloning(true);
    try {
      const res = await fetch("/api/programs/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, template }),
      });
      if (!res.ok) throw new Error("Failed");
      const program = await res.json();
      router.push(`/programs/${program.id}`);
    } catch {
      toast.error("Failed to create program from template.");
      setCloning(false);
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-4xl mx-auto">
      <Link
        href="/programs/new"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-body hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>New Program</span>
      </Link>

      <h1 className="font-body text-2xl font-bold tracking-tight mb-2">
        Program Templates
      </h1>
      <p className="text-ft-dim text-sm font-body mb-8">
        Pick a template to clone into your account
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
            className="text-left"
          >
            <Card
              className={`h-full transition-colors ${
                t.id === selectedId ? "border-ft-white" : "hover:border-ft-dim"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-body text-sm font-bold">{t.name}</h2>
                <Tag>{t.level}</Tag>
              </div>
              <p className="text-ft-dim text-xs font-body mb-3">{t.description}</p>
              <div className="flex items-center gap-3 text-[10px] font-body text-ft-muted">
                <span>{t.durationWeeks} weeks</span>
                <span>&middot;</span>
                <span>{t.daysPerWeek} days/week</span>
                <span>&middot;</span>
                <span>{t.blocks.length} block{t.blocks.length > 1 ? "s" : ""}</span>
              </div>
              {t.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-body text-ft-dim bg-ft-card px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </button>
        ))}
      </div>

      {/* Selected template details */}
      {selected && (
        <div className="mt-6">
          <Card className="border-ft-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-body text-lg font-bold">{selected.name}</h2>
              <button
                onClick={() => handleClone(selected)}
                disabled={cloning}
                className="bg-ft-white text-ft-bg font-body text-sm font-bold px-6 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {cloning ? "Creating..." : "Use This Template"}
              </button>
            </div>

            <div className="space-y-3">
              {selected.blocks.map((block, bi) => (
                <div key={bi} className="border border-ft-border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-ft-light text-xs font-body font-bold">
                      Block {bi + 1}: {block.name}
                    </span>
                    <span className="text-ft-muted text-[10px] font-body">
                      {block.weeks} weeks
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {block.days.map((day, di) => (
                      <div key={di} className="bg-ft-bg rounded px-2 py-1.5">
                        <span className="text-ft-light text-xs font-body font-bold">
                          {day.name}
                        </span>
                        <div className="text-ft-dim text-[10px] font-body mt-0.5">
                          {day.exercises.slice(0, 3).join(", ")}
                          {day.exercises.length > 3 && ` +${day.exercises.length - 3} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
