"use client";

/**
 * R15 — Library entry detail at `/log/library/[id]`.
 *
 * Renders the full slot list (target sets / reps / rpe / notes) plus
 * a Start CTA. Slots with multiple exercise options surface a chip
 * picker so the user chooses which variation to log; the picked indices
 * are posted alongside the libraryId. Start posts to
 * /api/workouts/from-library which creates a Workout with
 * source=SINGLE_LIBRARY and the resolved exercise rows, then routes
 * the user into the standard logger at /log/[workoutId].
 */

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { getLibraryEntry, type LibrarySlot } from "@/lib/workout-library";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LibraryEntryPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const entry = getLibraryEntry(id);
  const [starting, setStarting] = useState(false);
  const [selections, setSelections] = useState<number[]>(
    () => (entry ? entry.slots.map(() => 0) : []),
  );

  if (!entry) {
    return (
      <main className="px-4 py-6 pb-24 max-w-xl mx-auto">
        <Link
          href="/log/library"
          className="text-sm text-ft-light hover:text-ft-white font-body"
        >
          ← Library
        </Link>
        <div className="ft-card bg-ft-surface border border-ft-border p-5 mt-4">
          <h1 className="font-display text-2xl text-ft-on-bg">Workout not found</h1>
          <p className="font-body text-sm text-ft-on-bg-sec mt-2">
            We couldn&apos;t find a library entry called <code>{id}</code>.
          </p>
        </div>
      </main>
    );
  }

  const setSelection = (slotIdx: number, optionIdx: number) =>
    setSelections((prev) => {
      const next = [...prev];
      next[slotIdx] = optionIdx;
      return next;
    });

  const onStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/workouts/from-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryId: entry.id, selections }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const reason = [body.error, body.detail].filter(Boolean).join(": ");
        throw new Error(reason || `HTTP ${res.status}`);
      }
      const { workoutId, skipped } = (await res.json()) as {
        workoutId: string;
        skipped?: string[];
      };
      if (Array.isArray(skipped) && skipped.length > 0) {
        toast.info(
          `${skipped.length} exercise${skipped.length === 1 ? "" : "s"} not in your library — session continues without them`,
          5000,
        );
      }
      toast.success("Workout started");
      router.push(`/log/${workoutId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't start workout";
      toast.error(msg);
      setStarting(false);
    }
  };

  return (
    <main className="px-4 py-6 pb-32 max-w-xl mx-auto">
      <Link
        href="/log/library"
        className="text-sm text-ft-light hover:text-ft-white font-body"
      >
        ← Library
      </Link>
      <h1 className="font-display text-3xl text-ft-on-bg mt-2 leading-tight">
        {entry.name}
      </h1>
      <p className="font-body text-base text-ft-on-bg-sec mt-2 leading-relaxed">
        {entry.description}
      </p>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-accent border border-ft-accent-border px-2 py-0.5">
          {entry.durationMin} MIN
        </span>
        <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-sec border border-ft-border-faint px-2 py-0.5">
          {entry.equipment.replace("_", " ").toUpperCase()}
        </span>
        {entry.tags.map((t) => (
          <span
            key={t}
            className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter border border-ft-border-faint px-2 py-0.5"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ft-on-bg">Exercises</h2>
        {entry.slots.some((s) => s.exerciseOptions.length > 1) && (
          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter">
            Tap to choose
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {entry.slots.map((slot, i) => (
          <SlotRow
            key={i}
            slot={slot}
            index={i + 1}
            selectionIndex={selections[i] ?? 0}
            onSelect={(optionIdx) => setSelection(i, optionIdx)}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="mx-auto max-w-xl px-4 pb-6 pt-6 bg-gradient-to-t from-ft-bg via-ft-bg/95 to-transparent pointer-events-auto">
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="cta-underline w-full text-center py-3 font-display text-xl text-ft-on-bg disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start workout →"}
          </button>
        </div>
      </div>
    </main>
  );
}

function SlotRow({
  slot,
  index,
  selectionIndex,
  onSelect,
}: {
  slot: LibrarySlot;
  index: number;
  selectionIndex: number;
  onSelect: (optionIdx: number) => void;
}) {
  const hasChoice = slot.exerciseOptions.length > 1;
  const activeName = slot.exerciseOptions[selectionIndex] ?? slot.exerciseOptions[0] ?? "";

  return (
    <div className="ft-card bg-ft-surface border border-ft-border-faint p-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3 flex-1 min-w-0">
          <span className="font-data text-sm text-ft-on-bg-ter shrink-0">
            {String(index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            {slot.category && (
              <div className="font-body text-[10px] uppercase tracking-[0.18em] text-ft-on-bg-ter leading-none mb-1">
                {slot.category}
              </div>
            )}
            <h3 className="font-display text-base text-ft-on-bg truncate leading-tight">
              {activeName}
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-data text-base text-ft-on-bg">{slot.targetSets}</span>
          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter">
            ×
          </span>
          <span className="font-data text-base text-ft-on-bg">{slot.targetRepRange}</span>
          {slot.targetRpe && (
            <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ft-on-bg-ter ml-1">
              @ {slot.targetRpe}
            </span>
          )}
        </div>
      </div>

      {hasChoice && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {slot.exerciseOptions.map((name, optIdx) => {
            const active = optIdx === selectionIndex;
            return (
              <button
                key={`${name}-${optIdx}`}
                type="button"
                onClick={() => onSelect(optIdx)}
                aria-pressed={active}
                className={[
                  "font-body text-[11px] tracking-[0.02em] px-2 py-1 border transition-colors",
                  active
                    ? "bg-ft-accent text-ft-on-accent border-ft-accent"
                    : "bg-transparent text-ft-on-bg-sec border-ft-border hover:border-ft-on-bg-sec",
                ].join(" ")}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {slot.notes && (
        <p className="font-body text-xs text-ft-on-bg-sec mt-1.5 leading-relaxed">{slot.notes}</p>
      )}
    </div>
  );
}
