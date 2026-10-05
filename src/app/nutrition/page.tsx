import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Nutrition tab — temporary stub (P1). The real screen (targets, libraries,
 * plan day accordions) lands in P6. The diary keeps working from here.
 */
export default function NutritionPage() {
  return (
    <div className="px-5 pt-4">
      <h1 className="font-display text-xl text-ft-white">Nutrition</h1>
      <p className="mt-1 font-body text-sm text-ft-light">Targets, days and meals are being rebuilt.</p>
      <div className="mt-5 flex flex-col gap-2">
        <Link href="/nutrition/diary" className="rounded-ft-md border border-ft-accent bg-ft-accent px-4 py-3 text-center font-body text-sm font-semibold text-ft-on-accent">
          Food diary
        </Link>
        <Link href="/nutrition/log" className="rounded-ft-md border border-ft-border bg-ft-surface px-4 py-3 text-center font-body text-sm font-semibold text-ft-white">
          Add food
        </Link>
      </div>
    </div>
  );
}
