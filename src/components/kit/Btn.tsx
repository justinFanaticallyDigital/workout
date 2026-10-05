"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type BtnKind = "primary" | "coral" | "ghost" | "quiet";

const KIND: Record<BtnKind, string> = {
  primary: "border border-ft-accent-deep bg-ft-accent text-ft-on-accent shadow-ft-sm",
  coral: "border border-[#BE3A22] bg-ft-coral text-ft-on-accent shadow-ft-sm",
  ghost: "border border-ft-accent/40 bg-transparent text-ft-accent",
  quiet: "border border-ft-border bg-ft-surface-alt text-ft-light",
};

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  kind?: BtnKind;
  small?: boolean;
  /** Renders a Next link instead of a button. */
  href?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Button — Oxanium 600 uppercase .08em, radius 10. Regular 13px / small 11px. */
export default function Btn({ kind = "primary", small = false, href, fullWidth = false, className = "", children, type = "button", ...rest }: BtnProps) {
  const cls = [
    "inline-flex items-center justify-center gap-1.5 rounded-ft-md font-data font-semibold uppercase tracking-[0.08em] transition-opacity active:opacity-80 disabled:opacity-50",
    small ? "px-3.5 py-[7px] text-[11px]" : "px-[18px] py-3 text-[13px]",
    KIND[kind],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
