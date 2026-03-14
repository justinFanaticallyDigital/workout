import { Card, SectionHeader } from "@/components/ui";

export default function ProgressPhotosPage() {
  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Progress Photos
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Visual progress over time
        </p>
      </div>

      <Card>
        <SectionHeader
          title="Photo Gallery"
          action={
            <button className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1">
              + Upload
            </button>
          }
        />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-ft-muted text-sm font-mono">
            No photos uploaded yet
          </p>
          <p className="text-ft-dim text-xs font-mono mt-1">
            Upload your first progress photo to start tracking
          </p>
        </div>
      </Card>
    </div>
  );
}
