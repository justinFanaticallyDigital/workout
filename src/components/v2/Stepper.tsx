"use client";

/**
 * v2 Stepper — numeric +/− control (ARCHITECTURE.md §5). Lives inside cards
 * and sheets → normal surface tokens (Blueprint-safe on the dark navy card).
 */
interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Format the displayed value (e.g. (v) => `${v} g`). */
  fmt?: (value: number) => string;
}

export default function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  fmt,
}: StepperProps) {
  const btn =
    "inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center font-body text-lg leading-none text-ft-white disabled:opacity-40";
  return (
    <div className="inline-flex items-center overflow-hidden rounded-ft-md border border-ft-border bg-ft-surface-alt">
      <button
        type="button"
        className={btn}
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        −
      </button>
      <span className="min-w-[70px] text-center font-number text-[15px] font-bold tracking-[0.01em] text-ft-white">
        {fmt ? fmt(value) : value}
      </span>
      <button
        type="button"
        className={btn}
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        +
      </button>
    </div>
  );
}
