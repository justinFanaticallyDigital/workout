/**
 * Offline workout queue using localStorage.
 * When the user finishes a workout while offline, it's saved to the outbox.
 * On reconnect, pending workouts are synced to the server.
 */

const QUEUE_KEY = "fittrack-offline-queue";

export interface QueuedWorkout {
  id: string;
  queuedAt: number;
  payload: {
    date: string;
    blockId: string | null;
    blockDayId: string | null;
    notes: string | null;
    exercises: {
      exerciseId: string;
      notes: string | null;
      sets: {
        weight: number;
        reps: number;
        rir: number | null;
      }[];
    }[];
  };
}

export function getQueue(): QueuedWorkout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToQueue(workout: QueuedWorkout): void {
  const queue = getQueue();
  queue.push(workout);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromQueue(id: string): void {
  const queue = getQueue().filter((w) => w.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

/**
 * Attempt to sync all queued workouts to the server.
 * Returns the number of successfully synced workouts.
 */
export async function syncQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let synced = 0;

  for (const item of queue) {
    try {
      // 1. Create workout
      const workoutRes = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: item.payload.date,
          blockId: item.payload.blockId,
          blockDayId: item.payload.blockDayId,
          notes: item.payload.notes,
        }),
      });
      if (!workoutRes.ok) continue;
      const workout = await workoutRes.json();

      // 2. Add exercises and sets
      for (const ex of item.payload.exercises) {
        const weRes = await fetch(`/api/workouts/${workout.id}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: ex.exerciseId,
            notes: ex.notes,
          }),
        });
        if (!weRes.ok) continue;
        const workoutExercise = await weRes.json();

        for (const s of ex.sets) {
          await fetch("/api/sets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workoutExerciseId: workoutExercise.id,
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
            }),
          });
        }
      }

      // 3. Finalize
      await fetch(`/api/workouts/${workout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime: new Date().toISOString() }),
      });

      removeFromQueue(item.id);
      synced++;
    } catch {
      // Network still down — stop trying
      break;
    }
  }

  return synced;
}

/**
 * Set up automatic sync on reconnect.
 */
export function setupOfflineSync(): void {
  if (typeof window === "undefined") return;

  const handleOnline = () => {
    syncQueue().then((count) => {
      if (count > 0) {
        console.log(`[FitTrack] Synced ${count} offline workout(s)`);
      }
    });
  };

  window.addEventListener("online", handleOnline);

  // Also try to sync on page load if we're online
  if (navigator.onLine) {
    handleOnline();
  }
}
