import Link from "next/link";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

// Active tag style: white bg with dark text (not a built-in variant)
const activeTagClass = "bg-ft-white text-ft-bg";
import ProgressBar from "@/components/ui/ProgressBar";
import Stat from "@/components/ui/Stat";

const timelineBlocks = [
  { label: "Block 1", status: "completed" as const },
  { label: "Block 2", status: "completed" as const },
  { label: "Block 3", status: "active" as const },
  { label: "Deload", status: "upcoming" as const, half: true },
  { label: "Block 4", status: "upcoming" as const },
  { label: "Peak", status: "upcoming" as const },
];

const pastPrograms = [
  {
    id: "prog-2",
    title: "Strength Foundation",
    goal: "Build base strength across compound lifts",
    duration: "12 weeks",
    blocks: 3,
    sessions: 48,
    completedDate: "Sep 2025",
  },
  {
    id: "prog-3",
    title: "Cut & Maintain",
    goal: "Preserve muscle during caloric deficit",
    duration: "8 weeks",
    blocks: 2,
    sessions: 32,
    completedDate: "Jun 2025",
  },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-mono text-3xl font-bold tracking-tight mb-1">
            Programs
          </h1>
          <p className="text-ft-dim font-mono text-sm">
            Goal-driven training plans
          </p>
        </div>
        <button className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors">
          + New Program
        </button>
      </div>

      {/* Active Program */}
      <Link href="/programs/prog-1">
        <Card className="border-ft-white mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Tag className={activeTagClass}>Active</Tag>
          </div>

          <h2 className="font-mono text-xl font-bold mb-1">
            Hypertrophy Block Series
          </h2>
          <p className="text-ft-dim text-sm font-mono mb-1">
            Progressive overload through periodized volume and intensity blocks
          </p>
          <p className="text-ft-muted text-xs font-mono mb-5">24 weeks</p>

          {/* Block Timeline */}
          <div className="flex gap-1 mb-4">
            {timelineBlocks.map((block) => (
              <div
                key={block.label}
                className={`flex-1 ${block.half ? "max-w-[8%]" : ""}`}
              >
                <div
                  className={`h-2 rounded-full mb-1.5 ${
                    block.status === "completed"
                      ? "bg-ft-white"
                      : block.status === "active"
                      ? "bg-ft-muted"
                      : "bg-ft-card"
                  }`}
                />
                <span className="text-[10px] font-mono text-ft-dim">
                  {block.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ft-dim text-xs font-mono">
                Week 10 of 24 · 42%
              </span>
            </div>
            <ProgressBar value={42} max={100} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-ft-border">
            <Stat label="Sessions" value="38" small />
            <Stat label="Volume" value="186k" small />
            <Stat label="Avg Days/Wk" value="3.2" small />
            <Stat label="PRs" value="12" small />
          </div>
        </Card>
      </Link>

      {/* Past Programs */}
      <div>
        <h2 className="font-mono text-lg font-bold text-ft-light mb-4">
          Past Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastPrograms.map((program) => (
            <Link key={program.id} href={`/programs/${program.id}`}>
              <Card className="hover:border-ft-dim transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Tag>Completed</Tag>
                  <span className="text-ft-muted text-[10px] font-mono">
                    {program.completedDate}
                  </span>
                </div>
                <h3 className="font-mono text-base font-bold mb-1">
                  {program.title}
                </h3>
                <p className="text-ft-dim text-sm font-mono mb-3">
                  {program.goal}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-ft-muted">
                  <span>{program.duration}</span>
                  <span>·</span>
                  <span>{program.blocks} blocks</span>
                  <span>·</span>
                  <span>{program.sessions} sessions</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
