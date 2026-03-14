import { Card, SectionHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Settings
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          App preferences and configuration
        </p>
      </div>

      <Card>
        <SectionHeader title="Units" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-mono">Weight unit</span>
            <span className="text-ft-dim text-sm font-mono">lbs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ft-light text-sm font-mono">Distance unit</span>
            <span className="text-ft-dim text-sm font-mono">miles</span>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Profile" />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-ft-muted text-sm font-mono">
            Profile settings coming soon
          </p>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Data" />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-ft-muted text-sm font-mono">
            Export and backup options coming soon
          </p>
        </div>
      </Card>
    </div>
  );
}
