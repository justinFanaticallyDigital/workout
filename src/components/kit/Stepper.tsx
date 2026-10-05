"use client";

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/** − value + stepper on a raised surface. */
export default function Stepper({ value, onChange, min = 0, max = 99, className = "" }: StepperProps) {
  const btn = "flex h-8 w-9 items-center justify-center font-data text-[15px] font-bold text-ft-accent disabled:opacity-40";
  return (
    <div className={`inline-flex items-center overflow-hidden rounded-ft-md border border-ft-border bg-ft-surface-raised ${className}`}>
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">
        −
      </button>
      <div className="flex h-8 w-10 items-center justify-center border-l border-ft-border font-data text-[15px] font-bold text-ft-white">{value}</div>
      <button type="button" className={`${btn} border-l border-ft-border`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        +
      </button>
    </div>
  );
}
