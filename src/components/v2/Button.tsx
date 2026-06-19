"use client";

/**
 * v2 Button — verb-labelled action primitive (ARCHITECTURE.md §5/§6).
 *
 * kind: 'primary' (accent fill) · 'secondary' (surface-alt) · 'ghost' (text only).
 * size: 'sm' | 'md' | 'lg'.
 *
 * `onBg`: set when a ghost/secondary button sits DIRECTLY on the page bg.
 * It swaps the accent foreground/border to the on-bg accent family so the
 * button stays visible on Blueprint (where bare accent is white → invisible).
 * Primary buttons (accent fill) are always legible, so onBg is a no-op there.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glyph?: ReactNode;
  onBg?: boolean;
  fullWidth?: boolean;
}

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-xs gap-1.5",
  md: "px-3.5 py-2.5 text-sm gap-2",
  lg: "px-4 py-3.5 text-sm gap-2",
};

export default function Button({
  kind = "primary",
  size = "md",
  glyph,
  onBg = false,
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-ft-md font-body font-semibold tracking-[0.01em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  let variant: string;
  if (kind === "primary") {
    variant = "bg-ft-accent text-ft-on-accent border border-ft-accent";
  } else if (kind === "ghost") {
    variant = onBg
      ? "bg-transparent text-ft-accent-on-bg"
      : "bg-transparent text-ft-accent";
  } else {
    // secondary
    variant = onBg
      ? "bg-ft-surface text-ft-on-bg border border-ft-accent-border-on-bg"
      : "bg-ft-surface-alt text-ft-white border border-ft-border";
  }

  return (
    <button
      className={[
        base,
        SIZES[size],
        variant,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
      {glyph != null && <span className="leading-none">{glyph}</span>}
    </button>
  );
}
