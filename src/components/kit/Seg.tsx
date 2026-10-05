"use client";

interface SegProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Segmented control — surface-alt track, teal fill on the active option. */
export default function Seg<T extends string>({ options, value, onChange, className = "" }: SegProps<T>) {
  return (
    <div
      className={`grid gap-1 rounded-ft-md border border-ft-border bg-ft-surface-alt p-[3px] ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={[
              "rounded-ft-sm px-2.5 py-1.5 text-center font-data text-[11px] font-bold uppercase tracking-[0.1em] transition-colors",
              on ? "bg-ft-accent text-ft-on-accent" : "text-ft-dim",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
