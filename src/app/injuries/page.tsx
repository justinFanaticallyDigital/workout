import { Card, SectionHeader } from "@/components/ui";

export default function InjuriesPage() {
  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Injury Tracker
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Log and monitor injuries, pain levels, and recovery
        </p>
      </div>

      <Card>
        <SectionHeader
          title="Active Injuries"
          action={
            <button className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1">
              + Log Injury
            </button>
          }
        />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-ft-muted text-sm font-mono">
            No injuries logged
          </p>
          <p className="text-ft-dim text-xs font-mono mt-1">
            Stay healthy — log any issues here to track recovery
          </p>
        </div>
      </Card>
    </div>
  );
}
