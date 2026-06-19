/**
 * v2 SectionLabel — uppercase data-font section header that sits on the page
 * bg between cards (ARCHITECTURE.md §5). Uses the on-bg tokens + `.ft-on-bg`
 * so it stays legible on Blueprint's light page.
 */
import type { ReactNode } from "react";

export default function SectionLabel({
  right,
  className = "",
  children,
}: {
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "ft-on-bg flex items-baseline justify-between px-4 pt-[18px] pb-2",
        className,
      ].join(" ")}
    >
      <div className="font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg">
        {children}
      </div>
      {right != null && (
        <span className="font-body text-[11.5px] text-ft-on-bg-ter">{right}</span>
      )}
    </div>
  );
}
