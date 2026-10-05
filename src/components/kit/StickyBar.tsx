import type { ReactNode } from "react";

/** Sticky bottom bar — surface bg, top border; stats left, primary action right. */
export default function StickyBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[600px] border-t border-ft-border bg-ft-surface px-5 pt-2.5 pb-safe ${className}`}>
      {children}
    </div>
  );
}
