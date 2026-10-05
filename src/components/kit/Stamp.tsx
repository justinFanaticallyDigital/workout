import type { HTMLAttributes, ReactNode } from "react";

export type StampTone = "teal" | "coral" | "gold" | "muted" | "success";

const TONE: Record<StampTone, string> = {
  teal: "border-ft-accent/40 text-ft-accent",
  coral: "border-ft-coral/50 text-ft-coral",
  gold: "border-ft-gold-border text-ft-gold-fg",
  muted: "border-ft-border text-ft-dim",
  success: "border-ft-success-border bg-ft-success-bg text-ft-success-fg",
};

interface StampProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StampTone;
  children: ReactNode;
}

/** Pill label — Oxanium 9px uppercase, .18em tracking, 1px border. */
export default function Stamp({ tone = "teal", className = "", children, ...rest }: StampProps) {
  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-[3px] font-data text-[9px] uppercase tracking-[0.18em]",
        TONE[tone],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
