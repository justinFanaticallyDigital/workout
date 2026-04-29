import { PlanningStamp } from "@/components/ui/PlanningSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SettingsAdvancedPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Advanced
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Build custom Gameplan, custom exercise creation, CSV export,
          debug tools. Lives inline on the Settings index for now;
          full split lands in R9.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/gameplan/build"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Build custom Gameplan →
          </Link>
          <Link
            href="/exercises/new"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Create custom exercise →
          </Link>
          <Link
            href="/settings"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Settings (CSV export lives here) →
          </Link>
        </div>
      </div>
    </div>
  );
}
