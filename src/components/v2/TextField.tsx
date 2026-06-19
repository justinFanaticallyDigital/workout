"use client";

/** v2 TextField — single-line input. Lives inside cards/sheets (surface tokens). */
interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TextField({ value, onChange, placeholder, className = "" }: TextFieldProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-2.5 font-body text-sm text-ft-white outline-none placeholder:text-ft-dim",
        className,
      ].join(" ")}
    />
  );
}
