import { PlanningStamp } from "@/components/ui/PlanningSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SettingsUnitsPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Units
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Weight (lb / kg), distance (mi / km), and time (12h / 24h)
          preferences still live inline on the Settings index for now.
          Split into sub-routes lands in R9.
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-block font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent"
        >
          Open Settings →
        </Link>
      </div>
    </div>
  );
}
