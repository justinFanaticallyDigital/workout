"use client";

/**
 * /log/frame/[frameId] — start a frame. Loads the frame, builds the logger's
 * exercise shape, stores it under the new-blank draft key with the frame
 * reference, and opens the logger. No Workout row until Finish.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { draftKey, makeExercise, type WorkoutDraft } from "../../[workoutId]/_logger/types";

interface FrameResponse {
  id: string;
  name: string;
  exercises: {
    id: string;
    exerciseId: string;
    targetSets: number | null;
    targetRepRange: string | null;
    targetRpe: string | null;
    notes: string | null;
    exercise: { id: string; name: string; movementPattern: string | null; primaryMuscle: string | null };
  }[];
}

export default function StartFramePage({ params }: { params: { frameId: string } }) {
  const router = useRouter();
  const toast = useToast();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const res = await fetch(`/api/frames/${params.frameId}`);
      if (!res.ok) {
        toast.error("That frame isn't available.");
        router.replace("/training");
        return;
      }
      const frame = (await res.json()) as FrameResponse;
      const draft: WorkoutDraft = {
        exercises: frame.exercises.map((fe, idx) =>
          makeExercise({
            id: `frame-${frame.id}-${idx}`,
            exerciseId: fe.exerciseId,
            name: fe.exercise.name,
            movementPattern: fe.exercise.movementPattern,
            primaryMuscle: fe.exercise.primaryMuscle,
            targetSets: fe.targetSets,
            targetRepRange: fe.targetRepRange,
            targetRpe: fe.targetRpe,
            notes: fe.notes,
          }),
        ),
        workoutNotes: "",
        savedAt: Date.now(),
        frameId: frame.id,
        frameName: frame.name,
      };
      try {
        localStorage.setItem(draftKey("new-blank"), JSON.stringify(draft));
      } catch {
        toast.error("Couldn't prepare the workout on this device.");
        return;
      }
      router.replace("/log/new-blank");
    })();
  }, [params.frameId, router, toast]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-body text-sm text-ft-dim">Starting…</p>
    </div>
  );
}
