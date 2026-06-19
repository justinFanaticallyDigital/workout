"use client";

/**
 * v2 Segmented — single-select segmented control (ported from the prototype).
 * Lives inside cards/sheets → normal surface tokens (Blueprint-safe).
 */
interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex gap-1 rounded-ft-md border border-ft-border-faint bg-ft-surface-alt p-1">
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              "flex-1 rounded-[6px] px-1.5 py-2 font-body text-[12.5px] font-semibold transition-colors",
              sel
                ? "border border-ft-border bg-ft-surface text-ft-white shadow-ft-sm"
                : "border border-transparent text-ft-dim",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
