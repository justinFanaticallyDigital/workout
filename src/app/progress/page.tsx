import { Card, SectionHeader } from "@/components/ui";

const weightData = [
  { month: "Oct", value: 204 },
  { month: "Nov", value: 202.5 },
  { month: "Dec", value: 201 },
  { month: "Jan", value: 200 },
  { month: "Feb", value: 199 },
  { month: "Mar", value: 198.4 },
];

const volumeData = [
  { week: "W1", value: 32000 },
  { week: "W2", value: 35000 },
  { week: "W3", value: 38000 },
  { week: "W4", value: 40000 },
  { week: "W5", value: 42000 },
  { week: "W6", value: 41000 },
];

const milestones = [
  { date: "Mar 12", exercise: "Bench Press", performance: "245×3", e1rm: "260", delta: "+5 lbs" },
  { date: "Mar 8", exercise: "Squat", performance: "315×5", e1rm: "354", delta: "+10 lbs" },
  { date: "Mar 1", exercise: "Deadlift", performance: "405×1", e1rm: "405", delta: "+15 lbs" },
  { date: "Feb 22", exercise: "OHP", performance: "155×4", e1rm: "170", delta: "+5 lbs" },
  { date: "Feb 15", exercise: "Barbell Row", performance: "205×6", e1rm: "239", delta: "+8 lbs" },
];

const photos = [
  { date: "Jan 1" },
  { date: "Feb 1" },
  { date: "Mar 1" },
  { date: "Mar 14" },
];

function BarChart({
  data,
  labelKey,
  valueKey,
  maxValue,
  formatLabel,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  maxValue: number;
  formatLabel?: (v: number) => string;
}) {
  const lastIndex = data.length - 1;
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((item, i) => {
        const value = item[valueKey] as number;
        const label = item[labelKey] as string;
        const heightPct = (value / maxValue) * 100;
        const isLatest = i === lastIndex;
        return (
          <div key={label} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs font-mono text-ft-dim">
              {formatLabel ? formatLabel(value) : value}
            </span>
            <div
              className={`w-full rounded-sm transition-colors ${
                isLatest ? "bg-ft-white" : "bg-ft-muted"
              }`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-xs font-mono text-ft-dim">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Progress
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Track body metrics, training volume, and strength
        </p>
      </div>

      {/* Body Weight Chart */}
      <Card>
        <SectionHeader title="Body Weight" subtitle="6-month trend" />
        <BarChart
          data={weightData}
          labelKey="month"
          valueKey="value"
          maxValue={210}
        />
        <p className="text-ft-success text-sm font-mono mt-3">
          Down 5.6 lbs over 6 months
        </p>
      </Card>

      {/* Weekly Volume Trend */}
      <Card>
        <SectionHeader title="Weekly Volume" subtitle="Last 6 weeks" />
        <BarChart
          data={volumeData}
          labelKey="week"
          valueKey="value"
          maxValue={45000}
          formatLabel={(v) => `${(v / 1000).toFixed(0)}k`}
        />
      </Card>

      {/* Strength Milestones */}
      <Card>
        <SectionHeader title="Strength Milestones" subtitle="Recent PRs" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-ft-dim text-left text-xs uppercase tracking-wider">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Exercise</th>
                <th className="pb-2 pr-4">Weight x Reps</th>
                <th className="pb-2 pr-4">e1RM</th>
                <th className="pb-2">Delta</th>
              </tr>
            </thead>
            <tbody className="text-ft-light">
              {milestones.map((m) => (
                <tr key={`${m.date}-${m.exercise}`} className="border-t border-ft-border">
                  <td className="py-2 pr-4 text-ft-dim">{m.date}</td>
                  <td className="py-2 pr-4">{m.exercise}</td>
                  <td className="py-2 pr-4">{m.performance}</td>
                  <td className="py-2 pr-4">{m.e1rm}</td>
                  <td className="py-2 text-ft-success">{m.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Progress Photos */}
      <Card>
        <SectionHeader
          title="Progress Photos"
          action={
            <button className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1">
              + Upload
            </button>
          }
        />
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.date}
              className="aspect-[3/4] bg-ft-card rounded border border-ft-border flex items-center justify-center"
            >
              <span className="text-ft-dim text-xs font-mono">{photo.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
