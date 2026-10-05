"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface AddCardProps {
  label: ReactNode;
  w?: number;
  h?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** Dashed teal "+" card — trailing slot on strips (blank workout, add item). */
export default function AddCard({ label, w = 128, h = 120, href, onClick, className = "" }: AddCardProps) {
  const cls = [
    "flex flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] text-ft-accent",
    className,
  ].join(" ");
  const inner = (
    <>
      <span className="font-data text-[24px] leading-none">+</span>
      <span className="px-2 text-center font-data text-[10px] uppercase leading-[1.4] tracking-[0.12em]">{label}</span>
    </>
  );
  const style = { width: w, height: h };
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {inner}
    </button>
  );
}
