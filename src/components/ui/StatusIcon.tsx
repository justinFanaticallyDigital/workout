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

const PROGRAM_ICONS: Record<ProgramStatus, { icon: string; color: string; label: string }> = {
  active: { icon: "▶", color: "text-ft-white", label: "Active" },
  paused: { icon: "‖", color: "text-ft-warn", label: "Paused" },
  completed: { icon: "✓", color: "text-ft-success", label: "Completed" },
};

const BLOCK_ICONS: Record<BlockStatus, { icon: string; color: string; label: string }> = {
  active: { icon: "●", color: "text-ft-white", label: "Current block" },
  upcoming: { icon: "○", color: "text-ft-dim", label: "Upcoming block" },
  completed: { icon: "✓", color: "text-ft-success", label: "Completed block" },
};

const DAY_ICONS: Record<DayType, { icon: string; color: string; label: string }> = {
  lifting: { icon: "⬆", color: "text-ft-light", label: "Lifting day" },
  cardio: { icon: "♥", color: "text-ft-warn", label: "Cardio day" },
  conditioning: { icon: "⚡", color: "text-ft-warn", label: "Conditioning day" },
  mobility: { icon: "↻", color: "text-ft-dim", label: "Mobility day" },
  rest: { icon: "—", color: "text-ft-muted", label: "Rest day" },
};

export default function StatusIcon({ type, status, dayType, size = "sm" }: StatusIconProps) {
  let icon = "?";
  let color = "text-ft-muted";
  let label = "";

  if (type === "program" && status) {
    const cfg = PROGRAM_ICONS[status as ProgramStatus];
    if (cfg) { icon = cfg.icon; color = cfg.color; label = cfg.label; }
  } else if (type === "block" && status) {
    const cfg = BLOCK_ICONS[status as BlockStatus];
    if (cfg) { icon = cfg.icon; color = cfg.color; label = cfg.label; }
  } else if (type === "day" && dayType) {
    const cfg = DAY_ICONS[dayType as DayType];
    if (cfg) { icon = cfg.icon; color = cfg.color; label = cfg.label; }
  }

  const sizeClass = size === "md" ? "text-base w-6 h-6" : "text-xs w-4 h-4";

  return (
    <span
      className={`inline-flex items-center justify-center font-body ${sizeClass} ${color}`}
      role="img"
      aria-label={label || `${type} ${status ?? dayType ?? ""}`}
    >
      {icon}
    </span>
  );
}
