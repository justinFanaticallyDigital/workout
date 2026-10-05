"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Stamp from "./Stamp";

type Action = { label: string; href: string } | { label: string; onClick: () => void };

interface SectionHeaderProps {
  title: ReactNode;
  stamp?: ReactNode;
  action?: Action;
  className?: string;
}

/** Section title + optional stamp + optional "Edit ›" link. Shared by Training and Nutrition. */
export default function SectionHeader({ title, stamp, action, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-2.5 flex items-center gap-2.5 px-5 ${className}`}>
      <h2 className="min-w-0 truncate font-data text-[14.5px] font-bold uppercase tracking-[0.05em] text-ft-white">{title}</h2>
      {stamp && (typeof stamp === "string" ? <Stamp>{stamp}</Stamp> : stamp)}
      <div className="flex-1" />
      {action &&
        ("href" in action ? (
          <Link href={action.href} className="t-link">
            {action.label} ›
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className="t-link">
            {action.label} ›
          </button>
        ))}
    </div>
  );
}
