import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Training tab — temporary stub (P1). The real screen (plan sections,
 * day-card strips, Frames row) lands in P4. Until then the two things that
 * must keep working are reachable here: a blank workout and history.
 */
export default function TrainingPage() {
  return (
    <div className="px-5 pt-4">
      <h1 className="font-display text-xl text-ft-white">Training</h1>
      <p className="mt-1 font-body text-sm text-ft-light">Plans and frames are being rebuilt.</p>
      <div className="mt-5 flex flex-col gap-2">
        <Link href="/log/new-blank" className="rounded-ft-md border border-ft-accent bg-ft-accent px-4 py-3 text-center font-body text-sm font-semibold text-ft-on-accent">
          Start blank workout
        </Link>
        <Link href="/history" className="rounded-ft-md border border-ft-border bg-ft-surface px-4 py-3 text-center font-body text-sm font-semibold text-ft-white">
          Workout history
        </Link>
      </div>
    </div>
  );
}
