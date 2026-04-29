import { PlanningStamp } from "@/components/ui/PlanningSection";

export const dynamic = "force-dynamic";

export default function CheckInPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Weekly check-in
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Coming soon — the weekly check-in surfaces snapshot data and
          recommendations from the Goal Engine. Schema and API are
          wired; the UI port from <code>checkin-screens.jsx</code>
          ships in R2.
        </p>
      </div>
    </div>
  );
}
