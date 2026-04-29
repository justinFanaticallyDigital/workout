import { PlanningStamp } from "@/components/ui/PlanningSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProgressChartsPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Charts
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Coming soon — body weight (with rolling avg + goal trajectory),
          training volume per muscle group, e1RM curves, lifestyle
          variable graphs. Consolidated from <code>/progress/body</code>
          and per-exercise charts. Built in R9.
        </p>
        <Link
          href="/progress/body"
          className="mt-3 inline-block font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent"
        >
          Body weight chart (current location) →
        </Link>
      </div>
    </div>
  );
}
