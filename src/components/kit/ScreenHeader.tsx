import Link from "next/link";
import type { ReactNode } from "react";
import Orbit from "./Orbit";

interface ScreenHeaderProps {
  title: string;
  sub?: ReactNode;
  back?: { href: string; label: string; onClick?: () => void };
  right?: ReactNode;
  /** Logger / compact variants shrink the title. */
  size?: "default" | "compact";
  className?: string;
}

/** Screen title row: optional back link · orbit + Audiowide title · subtitle · right slot. */
export default function ScreenHeader({ title, sub, back, right, size = "default", className = "" }: ScreenHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 px-5 pb-3.5 pt-2.5 ${className}`}>
      <div className="min-w-0">
        {back &&
          (back.onClick ? (
            <button type="button" onClick={back.onClick} className="t-link mb-1.5 inline-flex items-center gap-1">
              <span className="text-[13px] leading-none">‹</span> {back.label}
            </button>
          ) : (
            <Link href={back.href} className="t-link mb-1.5 inline-flex items-center gap-1">
              <span className="text-[13px] leading-none">‹</span> {back.label}
            </Link>
          ))}
        <div className="flex items-center gap-[9px]">
          <Orbit size={size === "compact" ? 16 : 20} />
          <h1 className={size === "compact" ? "t-title truncate !text-[16px]" : "t-title truncate"}>{title}</h1>
        </div>
        {sub && <div className="mt-1 font-body text-[13.5px] text-ft-light">{sub}</div>}
      </div>
      {right && <div className="flex-shrink-0 pt-1">{right}</div>}
    </div>
  );
}
