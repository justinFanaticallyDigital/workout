"use client";

type ProgramStatus = "active" | "paused" | "completed";
type BlockStatus = "active" | "upcoming" | "completed";
type DayType = "lifting" | "cardio" | "conditioning" | "mobility" | "rest";

interface StatusIconProps {
  type: "program" | "block" | "day";
  status?: ProgramStatus | BlockStatus;
  dayType?: DayType;
  size?: "sm" | "md";
}

const PROGRAM_ICONS: Record<ProgramStatus, { icon: string; color: string }> = {
  active: { icon: "▶", color: "text-ft-white" },
  paused: { icon: "‖", color: "text-ft-warn" },
  completed: { icon: "✓", color: "text-ft-success" },
};

const BLOCK_ICONS: Record<BlockStatus, { icon: string; color: string }> = {
  active: { icon: "●", color: "text-ft-white" },
  upcoming: { icon: "○", color: "text-ft-dim" },
  completed: { icon: "✓", color: "text-ft-success" },
};

const DAY_ICONS: Record<DayType, { icon: string; color: string }> = {
  lifting: { icon: "⬆", color: "text-ft-light" },
  cardio: { icon: "♥", color: "text-ft-warn" },
  conditioning: { icon: "⚡", color: "text-ft-warn" },
  mobility: { icon: "↻", color: "text-ft-dim" },
  rest: { icon: "—", color: "text-ft-muted" },
};

export default function StatusIcon({ type, status, dayType, size = "sm" }: StatusIconProps) {
  let icon = "?";
  let color = "text-ft-muted";

  if (type === "program" && status) {
    const cfg = PROGRAM_ICONS[status as ProgramStatus];
    if (cfg) { icon = cfg.icon; color = cfg.color; }
  } else if (type === "block" && status) {
    const cfg = BLOCK_ICONS[status as BlockStatus];
    if (cfg) { icon = cfg.icon; color = cfg.color; }
  } else if (type === "day" && dayType) {
    const cfg = DAY_ICONS[dayType as DayType];
    if (cfg) { icon = cfg.icon; color = cfg.color; }
  }

  const sizeClass = size === "md" ? "text-base w-6 h-6" : "text-xs w-4 h-4";

  return (
    <span
      className={`inline-flex items-center justify-center font-mono ${sizeClass} ${color}`}
      aria-label={`${type} ${status ?? dayType ?? ""}`}
    >
      {icon}
    </span>
  );
}
