"use client";

interface TimelineSegment {
  label: string;
  width: number; // proportional weight (e.g. durationWeeks)
  status: "active" | "completed" | "upcoming";
  current?: boolean;
}

interface TimelineMilestone {
  label: string;
  position: number; // 0-100 percentage along the timeline
  achieved?: boolean;
}

interface TimelineProps {
  segments: TimelineSegment[];
  currentPosition?: number; // 0-100 percentage for marker position
  milestones?: TimelineMilestone[];
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-ft-success",
  active: "bg-ft-white",
  upcoming: "bg-ft-card",
};

const STATUS_TEXT: Record<string, string> = {
  completed: "text-ft-success",
  active: "text-ft-white",
  upcoming: "text-ft-muted",
};

export default function Timeline({ segments, currentPosition, milestones, className = "" }: TimelineProps) {
  const totalWidth = segments.reduce((sum, s) => sum + (s.width || 1), 0);

  return (
    <div className={`w-full ${className}`}>
      {/* Bar */}
      <div className="relative flex gap-0.5 h-3 rounded-full overflow-hidden bg-ft-bg">
        {segments.map((seg, i) => {
          const pct = ((seg.width || 1) / totalWidth) * 100;
          return (
            <div
              key={i}
              className={`relative h-full transition-colors ${STATUS_COLORS[seg.status] ?? "bg-ft-card"} ${
                i === 0 ? "rounded-l-full" : ""
              } ${i === segments.length - 1 ? "rounded-r-full" : ""}`}
              style={{ width: `${pct}%` }}
              title={`${seg.label} (${seg.status})`}
            />
          );
        })}
        {/* Current position marker */}
        {currentPosition != null && currentPosition > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-ft-warn z-10"
            style={{ left: `${Math.min(currentPosition, 100)}%` }}
          />
        )}
        {/* Milestone markers */}
        {milestones?.map((ms, i) => (
          <div
            key={`ms-${i}`}
            className="absolute z-10 flex flex-col items-center"
            style={{ left: `${Math.min(ms.position, 100)}%`, top: "-2px" }}
            title={ms.label}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 ${
                ms.achieved
                  ? "bg-ft-success border-ft-success"
                  : "bg-ft-bg border-ft-dim"
              }`}
            />
          </div>
        ))}
      </div>
      {/* Labels */}
      <div className="flex gap-0.5 mt-1.5">
        {segments.map((seg, i) => {
          const pct = ((seg.width || 1) / totalWidth) * 100;
          return (
            <div key={i} style={{ width: `${pct}%` }} className="min-w-0">
              <span className={`text-[10px] font-body truncate block ${STATUS_TEXT[seg.status] ?? "text-ft-muted"}`}>
                {seg.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Milestone labels (below segment labels) */}
      {milestones && milestones.length > 0 && (
        <div className="relative h-4 mt-0.5">
          {milestones.map((ms, i) => (
            <span
              key={`ms-label-${i}`}
              className={`absolute text-[9px] font-body whitespace-nowrap ${
                ms.achieved ? "text-ft-success" : "text-ft-muted"
              }`}
              style={{ left: `${Math.min(ms.position, 100)}%`, transform: "translateX(-50%)" }}
            >
              {ms.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
