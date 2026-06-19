/**
 * v2 Chip — small status/category pill (ARCHITECTURE.md §5).
 *
 * tone: neutral | accent | success | warn | danger.
 * `onBg`: only affects the `accent` tone — swaps to the on-bg accent family
 * so an accent chip on the page bg stays visible on Blueprint.
 */
import type { ReactNode } from "react";

interface ChipProps {
  tone?: "neutral" | "accent" | "success" | "warn" | "danger";
  size?: "sm" | "md";
  onBg?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Chip({
  tone = "neutral",
  size = "md",
  onBg = false,
  className = "",
  children,
}: ChipProps) {
  const toneCls: Record<NonNullable<ChipProps["tone"]>, string> = {
    neutral: "text-ft-light bg-ft-surface-alt border-ft-border-faint",
    accent: onBg
      ? "text-ft-accent-on-bg bg-ft-accent-faint-on-bg border-ft-accent-border-on-bg"
      : "text-ft-accent bg-ft-accent-faint border-ft-accent-border",
    success: "text-ft-success-fg bg-ft-success-bg border-ft-success-border",
    warn: "text-ft-warn-fg bg-ft-warn-bg border-ft-warn-border",
    danger: "text-ft-danger-fg bg-ft-danger-bg border-ft-danger-border",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border font-body font-semibold uppercase tracking-[0.04em] whitespace-nowrap",
        size === "sm" ? "px-[7px] py-0.5 text-[10px]" : "px-[9px] py-1 text-[11px]",
        toneCls[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
