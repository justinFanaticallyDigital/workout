"use client";

/**
 * /log/frame/[id] — start a saved Frame (Cluster 2, 2.5 repeat path).
 *
 * Loads the local Frame from the logger-store, builds the same ExerciseData
 * shape the logger restores from, stashes it under the new-blank draft key,
 * and routes to /log/new-blank — mirroring the single-workout library seeder.
 * Pure local; no DB. Finishing the session saves back to the logger-store.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { getFrame } from "@/lib/logger-store";

export default function StartFramePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const frame = await getFrame(params.id);
      if (!frame) {
        toast.error("That frame is no longer saved on this device.");
        router.replace("/library");
        return;
      }

      const draftExercises = frame.exercises.map((slot, idx) => ({
        id: `frame-${frame.id}-${idx}`,
        exerciseId: slot.exerciseId ?? "",
        name: slot.name,
        shortName: slot.name.split(/[-·]/)[0].trim().slice(0, 12),
        category: "—",
        primaryMuscle: null,
        targetSets: slot.targetSets ?? 3,
        targetRepRange: slot.targetReps ?? "",
        targetRpe: null,
        progressionType: "none",
        sets: Array.from({ length: slot.targetSets ?? 3 }, (_, i) => ({
          set: i + 1,
          weight: null,
          reps: null,
          rir: null,
          done: false,
        })),
        notes: slot.notes ?? "",
        lastSets: [],
        suggestedWeight: null,
        progressionInfo: { estimated1RM: null, progressionStatus: null, stalledSessions: 0 },
      }));

      localStorage.setItem(
        "workout-draft-new-blank",
        JSON.stringify({
          savedAt: Date.now(),
          exercises: draftExercises,
          workoutNotes: frame.name,
        }),
      );

      router.replace("/log/new-blank");
    })();
  }, [params.id, router, toast]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ft-bg">
      <p className="font-body text-sm text-ft-dim">Loading frame…</p>
    </div>
  );
}
