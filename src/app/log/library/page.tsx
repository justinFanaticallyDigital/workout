import { PlanningStamp } from "@/components/ui/PlanningSection";

export const dynamic = "force-dynamic";

export default function LogLibraryPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Single-workout library
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Coming soon — a derived list of every BlockDay across every
          shipped Gameplan plus your custom Programs. Filter by goal /
          body part / duration / equipment / format, preview, and log
          a one-off without starting a Gameplan. Built in R11.
        </p>
      </div>
    </div>
  );
}
