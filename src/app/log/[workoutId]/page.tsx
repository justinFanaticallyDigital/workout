"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, SectionHeader, Tag } from "@/components/ui";

const exercises = [
  {
    name: "Bench Press - Incline Barbell",
    shortName: "Inc. Bench",
    category: "Horizontal Push",
    progression: "Linear +5lbs",
    target: "3\u00d76-8 @ RPE 7-8",
    lastBest: "155\u00d78",
    sets: [
      { set: 1, weight: 155, reps: 8, rir: 2, done: true },
      { set: 2, weight: 155, reps: 8, rir: 2, done: true },
      { set: 3, weight: 155, reps: 7, rir: 1, done: true },
    ],
    history: [
      { week: 1, value: "145\u00d78" },
      { week: 2, value: "150\u00d78" },
      { week: 3, value: "155\u00d78" },
      { week: 4, value: "\u2014" },
    ],
  },
  {
    name: "Fly - Machine",
    shortName: "Machine Fly",
    category: "Horizontal Push",
    progression: "Double progression",
    target: "3\u00d710-12 @ RPE 8",
    lastBest: "120\u00d712",
    sets: [
      { set: 1, weight: 120, reps: 12, rir: 2, done: true },
      { set: 2, weight: 120, reps: 11, rir: null, done: false },
      { set: 3, weight: null, reps: null, rir: null, done: false },
    ],
    history: [
      { week: 1, value: "110\u00d710" },
      { week: 2, value: "115\u00d711" },
      { week: 3, value: "120\u00d712" },
      { week: 4, value: "\u2014" },
    ],
  },
  {
    name: "Lateral Raise - Seated Dumbbell",
    shortName: "Lat. Raise",
    category: "Shoulder Isolation",
    progression: "Double progression",
    target: "3\u00d712-15 @ RPE 8-9",
    lastBest: "25\u00d714",
    sets: [
      { set: 1, weight: null, reps: null, rir: null, done: false },
      { set: 2, weight: null, reps: null, rir: null, done: false },
      { set: 3, weight: null, reps: null, rir: null, done: false },
    ],
    history: [
      { week: 1, value: "20\u00d712" },
      { week: 2, value: "22\u00d713" },
      { week: 3, value: "25\u00d714" },
      { week: 4, value: "\u2014" },
    ],
  },
];

function isExerciseComplete(ex: (typeof exercises)[number]) {
  return ex.sets.every((s) => s.done);
}

export default function ActiveWorkoutPage() {
  const [activeEx, setActiveEx] = useState(0);
  const current = exercises[activeEx];

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-ft-bg border-b border-ft-card px-4 pt-4 pb-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/log"
            className="text-ft-dim hover:text-ft-light text-sm font-mono transition-colors"
          >
            &larr; Block 2
          </Link>
          <span className="text-ft-muted text-sm font-mono">/</span>
          <span className="text-ft-dim text-sm font-mono">
            Day 1 &middot; Upper Push
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-lg font-bold text-ft-white">
              Day 1 &middot; Upper Push
            </h1>
            <p className="text-ft-dim text-xs font-mono mt-0.5">
              Wed, Mar 12 &middot; Week 3
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-ft-surface border border-ft-card rounded px-2.5 py-1.5">
              <span className="text-ft-dim text-xs font-mono">&#9201;</span>
              <span className="text-ft-light text-sm font-mono tabular-nums">
                42:15
              </span>
            </div>
            <button className="bg-ft-success/20 text-ft-success font-mono text-sm font-bold px-4 py-1.5 rounded hover:bg-ft-success/30 transition-colors">
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Tabs */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {exercises.map((ex, i) => {
            const complete = isExerciseComplete(ex);
            const isActive = i === activeEx;
            return (
              <button
                key={i}
                onClick={() => setActiveEx(i)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition-colors ${
                  isActive
                    ? "bg-ft-white text-ft-bg font-bold"
                    : "bg-ft-surface text-ft-dim hover:text-ft-light border border-ft-card"
                }`}
              >
                <span>
                  {complete ? "\u2713" : `E${i + 1}`}
                </span>
                <span>{ex.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Active Exercise Detail */}
        <Card>
          <div className="mb-4">
            <h2 className="font-mono text-base font-bold text-ft-white">
              {current.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Tag>{current.category}</Tag>
              <Tag>{current.progression}</Tag>
            </div>
          </div>

          {/* Target & Last Best */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-ft-bg rounded p-2.5">
              <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                Target
              </p>
              <p className="text-ft-light text-sm font-mono font-bold">
                {current.target}
              </p>
            </div>
            <div className="flex-1 bg-ft-bg rounded p-2.5">
              <p className="text-ft-dim text-[11px] font-mono uppercase tracking-wider mb-0.5">
                Last Best
              </p>
              <p className="text-ft-light text-sm font-mono font-bold">
                {current.lastBest}
              </p>
            </div>
          </div>

          {/* Set Table */}
          <div className="mb-3">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_36px] gap-1.5 mb-1.5">
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Set
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Weight
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                Reps
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                RIR
              </span>
              <span className="text-ft-dim text-[11px] font-mono uppercase text-center">
                &#10003;
              </span>
            </div>

            {/* Set Rows */}
            {current.sets.map((s, si) => (
              <div
                key={si}
                className="grid grid-cols-[40px_1fr_1fr_1fr_36px] gap-1.5 mb-1.5"
              >
                <div className="flex items-center justify-center">
                  <span className="text-ft-dim text-sm font-mono">
                    {s.set}
                  </span>
                </div>
                <input
                  type="text"
                  defaultValue={s.weight ?? ""}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <input
                  type="text"
                  defaultValue={s.reps ?? ""}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <input
                  type="text"
                  defaultValue={s.rir ?? ""}
                  placeholder="-"
                  className={`${
                    s.done ? "bg-ft-card" : "bg-ft-bg"
                  } border border-ft-card rounded px-2 py-1.5 text-center text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors`}
                />
                <div className="flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      s.done
                        ? "bg-ft-success/20 border-ft-success text-ft-success"
                        : "border-ft-card hover:border-ft-dim"
                    }`}
                  >
                    {s.done && (
                      <span className="text-xs">&#10003;</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Set */}
            <button className="w-full mt-1 border border-dashed border-ft-card rounded py-2 text-ft-dim text-xs font-mono hover:border-ft-dim hover:text-ft-light transition-colors">
              + Add Set
            </button>
          </div>
        </Card>

        {/* Recent History */}
        <Card>
          <SectionHeader title="Recent History" />
          <div className="grid grid-cols-4 gap-2">
            {current.history.map((h, hi) => (
              <div key={hi} className="bg-ft-bg rounded p-2 text-center">
                <p className="text-ft-dim text-[11px] font-mono uppercase mb-1">
                  Wk {h.week}
                </p>
                <p className="text-ft-light text-sm font-mono font-bold">
                  {h.value}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <SectionHeader title="Notes" />
          <textarea
            rows={3}
            defaultValue="Left shoulder felt tight on set 3..."
            placeholder="Add notes for this exercise..."
            className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
          />
        </Card>
      </div>
    </div>
  );
}
