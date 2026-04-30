import { PlanningStamp } from "@/components/ui/PlanningSection";

export const dynamic = "force-dynamic";

export default function ProgressCheckInsPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Check-in history
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Coming soon — full list view of past check-ins with snapshot +
          per-check-in Recommendation rows + applied changes. R8 ships
          the engine + the inline recommendation feed; the dedicated
          history list lands in a later UI pass. For now, /checkin
          shows the most recent check-in plus its recommendations.
        </p>
      </div>
    </div>
  );
}
