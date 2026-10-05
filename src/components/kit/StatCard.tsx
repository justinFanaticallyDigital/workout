import type { ReactNode } from "react";
import Card from "./Card";

interface StatCardProps {
  label: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Stats card: eyebrow label row (with a right slot) over a plot or a hero number. */
export default function StatCard({ label, right, children, className = "" }: StatCardProps) {
  return (
    <Card className={`px-4 pb-3.5 pt-3.5 ${className}`}>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="font-data text-[10.5px] uppercase tracking-[0.18em] text-ft-dim">{label}</div>
        <div className="flex-1" />
        {right}
      </div>
      {children}
    </Card>
  );
}
