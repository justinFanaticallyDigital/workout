import type { ReactNode } from "react";

/** Dashed target tag: `⊙ 4×6–8`, `3 whole`, `80 g`. */
export default function TargetTag({ children, icon = false, className = "" }: { children: ReactNode; icon?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-ft-sm border border-dashed border-ft-border px-[7px] py-[2px] font-data text-[11px] font-semibold text-ft-light ${className}`}>
      {icon && <span aria-hidden="true">⊙</span>}
      {children}
    </span>
  );
}
