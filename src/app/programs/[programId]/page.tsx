import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

const activeTagClass = "bg-ft-white text-ft-bg";
import ProgressBar from "@/components/ui/ProgressBar";
import Stat from "@/components/ui/Stat";

const program = {
  id: "prog-1",
  title: "Hypertrophy Block Series",
  goal: "Progressive overload through periodized volume and intensity blocks",
  duration: "24 weeks",
  status: "active" as const,
  currentWeek: 10,
  totalWeeks: 24,
  stats: {
    sessions: 38,
    volume: "186k",
    avgDays: "3.2",
    prs: 12,
  },
  blocks: [
    {
      id: "block-1",
      name: "Block 1",
      subtitle: "Anatomical Adaptation",
      weeks: "1-3",
      status: "completed" as const,
      sessions: 12,
      focus: "Foundation",
    },
    {
      id: "block-2",
      name: "Block 2",
      subtitle: "Accumulation",
      weeks: "4-9",
      status: "completed" as const,
      sessions: 24,
      focus: "Volume",
    },
    {
      id: "block-3",
      name: "Block 3",
      subtitle: "Intensification",
      weeks: "10-15",
      status: "active" as const,
      sessions: 2,
      focus: "Intensity",
    },
    {
      id: "deload-1",
      name: "Deload",
      subtitle: "Recovery",
      weeks: "16",
      status: "upcoming" as const,
      sessions: 0,
      focus: "Recovery",
    },
    {
      id: "block-4",
      name: "Block 4",
      subtitle: "Strength",
      weeks: "17-21",
      status: "upcoming" as const,
      sessions: 0,
      focus: "Strength",
    },
    {
      id: "peak-1",
      name: "Peak",
      subtitle: "Peaking & Test",
      weeks: "22-24",
      status: "upcoming" as const,
      sessions: 0,
      focus: "Peak",
    },
  ],
};

export default function ProgramDetailPage({
  params,
}: {
  params: { programId: string };
}) {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>←</span>
        <span>Programs</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {program.title}
            </h1>
            <Tag className={activeTagClass}>Active</Tag>
          </div>
          <p className="text-ft-dim text-sm font-mono mb-1">{program.goal}</p>
          <p className="text-ft-muted text-xs font-mono">{program.duration}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-ft-dim text-xs font-mono">
            Week {program.currentWeek} of {program.totalWeeks} ·{" "}
            {Math.round((program.currentWeek / program.totalWeeks) * 100)}%
          </span>
        </div>
        <ProgressBar value={program.currentWeek} max={program.totalWeeks} />
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-ft-border">
          <Stat label="Sessions" value={program.stats.sessions} small />
          <Stat label="Volume" value={program.stats.volume} small />
          <Stat label="Avg Days/Wk" value={program.stats.avgDays} small />
          <Stat label="PRs" value={program.stats.prs} small />
        </div>
      </Card>

      {/* Blocks List */}
      <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
        Blocks
      </h2>
      <div className="space-y-3">
        {program.blocks.map((block) => (
          <Link
            key={block.id}
            href={`/programs/${params.programId}/blocks/${block.id}`}
          >
            <Card
              className={`mb-1 ${
                block.status === "active"
                  ? "border-ft-white"
                  : block.status === "completed"
                  ? "border-ft-muted"
                  : ""
              } hover:border-ft-dim transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      block.status === "completed"
                        ? "bg-ft-success"
                        : block.status === "active"
                        ? "bg-ft-white"
                        : "bg-ft-card"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-bold">
                        {block.name}
                      </h3>
                      <span className="text-ft-dim text-xs font-mono">
                        · {block.subtitle}
                      </span>
                    </div>
                    <p className="text-ft-muted text-xs font-mono">
                      Weeks {block.weeks}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {block.status === "active" && <Tag className={activeTagClass}>Current</Tag>}
                  {block.status === "completed" && <Tag>Done</Tag>}
                  {block.status === "upcoming" && (
                    <span className="text-ft-muted text-xs font-mono">
                      Upcoming
                    </span>
                  )}
                  <div className="text-ft-dim text-xs font-mono">
                    {block.sessions > 0 && `${block.sessions} sessions`}
                  </div>
                  <span className="text-ft-muted text-sm">→</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
