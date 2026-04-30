"use client";

/**
 * R15 — `/log/library` single-workout library list.
 *
 * Surfaces the 8 curated one-offs from `@/lib/workout-library`. The
 * +Log FAB sheet's "Single workout from library" tile routes here.
 * Tapping a card lands on the per-entry detail page where the user
 * can preview the slot list and start the workout. Created sessions
 * carry source=SINGLE_LIBRARY so they don't count toward Gameplan
 * adherence.
 */

import Link from "next/link";
import { WORKOUT_LIBRARY, type WorkoutLibraryEntry } from "@/lib/workout-library";

export const dynamic = "force-dynamic";

export default function WorkoutLibraryPage() {
  return (
    <main className="px-4 py-6 pb-24 max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/gameplan"
          className="text-sm text-ft-light hover:text-ft-white font-body"
        >
          ← Gameplan
        </Link>
        <h1 className="font-display text-3xl text-ft-on-bg mt-2 leading-tight">
          Single-workout library
        </h1>
        <p className="font-body text-base text-ft-on-bg-sec mt-2 leading-relaxed">
          One-off sessions for travel, equipment-limited days, or when the plan calls for
          something else. These don&apos;t count toward Gameplan adherence.
        </p>
      </div>

      <div className="space-y-3">
        {WORKOUT_LIBRARY.map((entry) => (
          <LibraryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </main>
  );
}

function LibraryCard({ entry }: { entry: WorkoutLibraryEntry }) {
  return (
    <Link
      href={`/log/library/${entry.id}`}
      className="block ft-card bg-ft-surface border border-ft-border p-4 hover:border-ft-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl text-ft-on-bg leading-tight">{entry.name}</h2>
          <p className="font-body text-sm text-ft-on-bg-sec mt-1 leading-relaxed">
            {entry.description}
          </p>
        </div>
        <DurationChip min={entry.durationMin} />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <EquipmentTag eq={entry.equipment} />
        {entry.tags.map((t) => (
          <span
            key={t}
            className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter border border-ft-border-faint px-2 py-0.5"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-dashed border-ft-border flex items-center justify-between">
        <span className="font-body text-[11px] uppercase tracking-[0.14em] text-ft-on-bg-ter">
          {entry.slots.length} exercise{entry.slots.length === 1 ? "" : "s"}
        </span>
        <span className="font-body text-xs uppercase tracking-[0.14em] text-ft-accent">
          Preview →
        </span>
      </div>
    </Link>
  );
}

function DurationChip({ min }: { min: number }) {
  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="font-data text-2xl text-ft-on-bg leading-none">{min}</span>
      <span className="font-body text-[9px] uppercase tracking-[0.18em] text-ft-on-bg-ter mt-0.5">
        MIN
      </span>
    </div>
  );
}

function EquipmentTag({ eq }: { eq: WorkoutLibraryEntry["equipment"] }) {
  const label =
    eq === "none"
      ? "No equipment"
      : eq === "dumbbells"
        ? "Dumbbells"
        : eq === "full_gym"
          ? "Full gym"
          : "Any";
  return (
    <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-accent border border-ft-accent-border px-2 py-0.5">
      {label}
    </span>
  );
}
