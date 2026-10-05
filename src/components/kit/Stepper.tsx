interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Increment per tap (decimals allowed). */
  step?: number;
  /** Formats the value box ("5.0 km", "138 bpm"). */
  fmt?: (v: number) => string;
  className?: string;
}

/** − value + stepper on a raised surface. */
export default function Stepper({ value, onChange, min = 0, max = 99, step = 1, fmt, className = "" }: StepperProps) {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const btn = "flex h-8 w-9 items-center justify-center font-data text-[15px] font-bold text-ft-accent disabled:opacity-40";
  return (
    <div className={`inline-flex items-center overflow-hidden rounded-ft-md border border-ft-border bg-ft-surface-raised ${className}`}>
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(round(Math.max(min, value - step)))} aria-label="Decrease">
        −
      </button>
      <div className="flex h-8 min-w-[40px] items-center justify-center whitespace-nowrap border-l border-ft-border px-2 font-data text-[15px] font-bold tabular-nums text-ft-white">{fmt ? fmt(value) : value}</div>
      <button type="button" className={`${btn} border-l border-ft-border`} disabled={value >= max} onClick={() => onChange(round(Math.min(max, value + step)))} aria-label="Increase">
        +
      </button>
    </div>
  );
}
