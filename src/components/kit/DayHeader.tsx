import type { ReactNode } from "react";

interface DayHeaderProps {
  day: number;
  name: string;
  right?: ReactNode;
  /** Title size: cards 14.5 · mini cards 12.5 */
  size?: "default" | "mini";
  className?: string;
}

/** "DAY N · name · right slot" — shared by day cards, accordions, editor rows and mini cards. */
export default function DayHeader({ day, name, right, size = "default", className = "" }: DayHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={size === "mini" ? "t-day !text-[9.5px] !tracking-[0.14em]" : "t-day"}>DAY {day}</span>
      <span className={["min-w-0 flex-1 truncate font-data font-bold text-ft-white", size === "mini" ? "text-[12.5px]" : "text-[14.5px]"].join(" ")}>
        {name}
      </span>
      {right}
    </div>
  );
}
