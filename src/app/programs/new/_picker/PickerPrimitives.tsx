"use client";

import { ReactNode } from "react";

/* ─── Visual primitives shared across picker steps ─────────────────
 *
 * These are intentionally Tailwind-only (no inline `style` props) so
 * that the per-theme chrome from globals.css (.ft-card brass rib on
 * iron, pixel bezel on arcade, paper shadow on notebook, etc.) and
 * the data-theme color tokens apply automatically.
 * ────────────────────────────────────────────────────────────────── */

/** Small-caps stamp pill (theme-adaptive shape). */
export function Stamp({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ft-stamp ${className}`}>{children}</span>;
}

/** Filter chip — toggleable selection. */
export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3.5 py-2 text-xs font-body font-medium rounded-ft border transition-colors whitespace-nowrap",
        active
          ? "bg-ft-accent text-ft-bg border-ft-accent"
          : "bg-transparent text-ft-white border-ft-border hover:border-ft-dim",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** Removable summary chip (shows applied filter). */
export function FilterChip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-body uppercase tracking-[0.1em] border border-ft-accent text-ft-accent bg-ft-surface rounded-ft">
      {children}
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove filter" className="text-base leading-none opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </span>
  );
}

/** Movement-color tag (uses ft-push/pull/legs/core constant tokens). */
export function MovementTag({
  kind,
  children,
}: {
  kind: "push" | "pull" | "legs" | "core" | "accent";
  children: ReactNode;
}) {
  const cls = {
    push: "text-ft-push border-ft-push/40",
    pull: "text-ft-pull border-ft-pull/40",
    legs: "text-ft-legs border-ft-legs/40",
    core: "text-ft-core border-ft-core/40",
    accent: "text-ft-accent border-ft-accent/40",
  }[kind];
  return (
    <span className={`px-1.5 py-0.5 text-[9px] font-body uppercase tracking-[0.2em] border ${cls}`}>
      {children}
    </span>
  );
}

/** Difficulty bars — 5 vertical ticks, level highlights first N. */
export function DifficultyBars({ level }: { level: number }) {
  return (
    <div className="inline-flex items-end gap-[2px] h-3.5" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={[
            "w-[3px]",
            i <= level ? "bg-ft-accent" : "bg-ft-border",
            i === 1 ? "h-[5px]" : i === 2 ? "h-[7px]" : i === 3 ? "h-[9px]" : i === 4 ? "h-[11px]" : "h-[13px]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/**
 * 7-day training pattern dots. `pattern[i]` 1=training, 0=rest.
 * Day labels: M T W T F S S.
 */
export function DaysDots({ pattern, compact }: { pattern: number[]; compact?: boolean }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const size = compact ? "w-[18px] h-[18px] text-[9px]" : "w-[22px] h-[22px] text-[10px]";
  return (
    <div className="inline-flex gap-0.5">
      {labels.map((l, i) => (
        <div
          key={i}
          className={[
            size,
            "flex items-center justify-center font-body font-semibold border",
            pattern[i]
              ? "bg-ft-accent text-ft-bg border-ft-accent"
              : "bg-transparent text-ft-dim border-ft-border/60",
          ].join(" ")}
        >
          {l}
        </div>
      ))}
    </div>
  );
}

/**
 * Periodization weeks bar — N cells, optionally split into colored blocks.
 * `blocks: [{ wks, color }]` defines the band; otherwise a flat accent bar.
 */
export function WeeksBar({
  weeks,
  blocks,
  height = 14,
  showLabel = true,
}: {
  weeks: number;
  blocks?: { wks: number; color: string }[];
  height?: number;
  showLabel?: boolean;
}) {
  const cells: string[] = [];
  if (blocks && blocks.length) {
    blocks.forEach((b) => {
      for (let i = 0; i < b.wks; i++) cells.push(b.color);
    });
  } else {
    for (let i = 0; i < weeks; i++) cells.push("var(--ft-accent-color, rgb(var(--ft-accent)))");
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-px flex-1" style={{ height }}>
        {cells.map((c, i) => (
          <div key={i} className="flex-1 h-full opacity-85" style={{ background: c, borderTop: `2px solid ${c}` }} />
        ))}
      </div>
      {showLabel && (
        <div className="flex items-baseline gap-0.5">
          <span className="font-data text-base text-ft-white">{weeks}</span>
          <span className="font-body text-[9px] uppercase tracking-[0.15em] text-ft-dim">WK</span>
        </div>
      )}
    </div>
  );
}

/**
 * Step indicator — "STEP NN / 05" stamp + optional skip link.
 */
export function StepHeader({
  step,
  total = 5,
  trailingLabel,
  onBack,
  onSkip,
}: {
  step: number;
  total?: number;
  trailingLabel?: string;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="text-ft-accent text-base leading-none px-1" aria-label="Back">
            ‹
          </button>
        )}
        <Stamp>
          STEP {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
          {trailingLabel ? ` · ${trailingLabel}` : ""}
        </Stamp>
      </div>
      {onSkip && (
        <button
          onClick={onSkip}
          className="font-body text-[11px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent"
        >
          Skip →
        </button>
      )}
    </div>
  );
}

/**
 * Big page heading with theme-adaptive display font and optional kicker.
 */
export function PickerHeading({
  kicker,
  children,
  className = "",
}: {
  kicker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 ${className}`}>
      {kicker && (
        <div className="font-body text-[10px] uppercase tracking-[0.3em] text-ft-accent mb-1">{kicker}</div>
      )}
      <h1 className="font-display text-3xl leading-tight tracking-wide text-ft-white m-0">{children}</h1>
    </div>
  );
}

/**
 * Primary CTA — full-width, theme-adaptive via .cta-underline.
 */
export function PickerButton({
  variant = "primary",
  full,
  small,
  onClick,
  disabled,
  children,
  className = "",
}: {
  variant?: "primary" | "ghost";
  full?: boolean;
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const sizing = small ? "px-3.5 py-2 text-[11px]" : "px-5 py-3.5 text-[13px]";
  const width = full ? "w-full" : "w-auto";
  const palette =
    variant === "primary"
      ? "text-ft-accent border-ft-accent"
      : "text-ft-light border-transparent hover:border-ft-border";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        sizing,
        width,
        palette,
        "font-body font-medium uppercase tracking-[0.1em] bg-transparent border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
