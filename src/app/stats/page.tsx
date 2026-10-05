import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Stats tab — temporary stub (P1). The real screen lands in P8, when the
 * /progress sub-pages move under /stats. Until then they are linked here.
 */
const LINKS: [string, string][] = [
  ["/progress/body", "Body metrics"],
  ["/progress/photos", "Progress photos"],
  ["/progress/calendar", "Calendar"],
  ["/progress/injuries", "Injuries"],
  ["/history", "Workout history"],
];

export default function StatsPage() {
  return (
    <div className="px-5 pt-4">
      <h1 className="font-display text-xl text-ft-white">Stats</h1>
      <p className="mt-1 font-body text-sm text-ft-light">Being rebuilt. Existing views:</p>
      <div className="mt-5 flex flex-col gap-2">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-ft-md border border-ft-border bg-ft-surface px-4 py-3 font-body text-sm font-semibold text-ft-white">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
