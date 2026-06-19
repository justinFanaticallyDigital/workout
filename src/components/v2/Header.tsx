"use client";

/**
 * v2 Header — collapse-aware top bar handed to PillarShell (ARCHITECTURE.md §4).
 *
 * MUST honour `collapsed`: PillarShell clones the header with `collapsed` once
 * content scrolls, and the header shrinks to a compact one-line bar (drops the
 * logo + subtitle, shrinks the title).
 *
 * Sits directly on the page bg → all chrome uses on-bg tokens + `.ft-on-bg`
 * so it stays legible on Blueprint's light page.
 *
 * kind:  'home' (logo left) · 'sub' (back chevron left) · 'onb' (centered, no chrome)
 * right: 'gear' (settings) · 'skip' · null
 */
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  kind?: "home" | "sub" | "onb";
  right?: "gear" | "skip" | null;
  collapsed?: boolean;
  onBack?: () => void;
  onGear?: () => void;
  onSkip?: () => void;
}

function Logo() {
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-ft-md bg-ft-on-bg font-display text-sm font-bold tracking-[-0.02em] text-ft-bg">
      F
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  small = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "inline-flex flex-shrink-0 items-center justify-center rounded-full border border-ft-border-faint text-ft-on-bg",
        small ? "h-[26px] w-[26px] text-[13px]" : "h-[34px] w-[34px] text-base",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Header({
  title,
  subtitle,
  kind = "home",
  right = "gear",
  collapsed = false,
  onBack,
  onGear,
  onSkip,
}: HeaderProps) {
  return (
    <div
      className={[
        "ft-on-bg flex items-center justify-between gap-3 transition-[padding] duration-150",
        collapsed ? "px-[18px] pt-[5px] pb-1.5" : "px-[18px] pt-2.5 pb-3",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {kind === "home" && !collapsed && <Logo />}
        {kind === "sub" && (
          <IconBtn label="Back" onClick={onBack}>
            ‹
          </IconBtn>
        )}
        <div className="min-w-0">
          <div
            className={[
              "truncate font-display font-semibold leading-tight tracking-[-0.01em] text-ft-on-bg",
              collapsed ? "text-sm" : "text-[17px]",
            ].join(" ")}
          >
            {title}
          </div>
          {subtitle && !collapsed && (
            <div className="mt-px font-body text-[11px] uppercase tracking-[0.04em] text-ft-on-bg-ter">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {right === "gear" && (
        <IconBtn label="Settings" onClick={onGear} small={collapsed}>
          ⚙
        </IconBtn>
      )}
      {right === "skip" && (
        <button
          type="button"
          onClick={onSkip}
          className="px-1 py-1.5 font-body text-[13px] text-ft-on-bg-ter"
        >
          Skip
        </button>
      )}
    </div>
  );
}
