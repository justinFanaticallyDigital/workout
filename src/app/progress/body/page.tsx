import { Card, SectionHeader } from "@/components/ui";

export default function BodyMetricsPage() {
  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Body Metrics
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Track weight, measurements, and body composition
        </p>
      </div>

      <Card>
        <SectionHeader
          title="Weight Log"
          action={
            <button className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1">
              + Log Weight
            </button>
          }
        />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-ft-muted text-sm font-mono">
            No weight entries yet
          </p>
          <p className="text-ft-dim text-xs font-mono mt-1">
            Start logging your body weight to see trends
          </p>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Measurements" />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-ft-muted text-sm font-mono">
            No measurements recorded
          </p>
          <p className="text-ft-dim text-xs font-mono mt-1">
            Track chest, waist, arms, and more
          </p>
        </div>
      </Card>
    </div>
  );
}
