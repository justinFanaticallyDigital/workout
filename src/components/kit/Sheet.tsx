"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "./icons";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Pinned under the scrolling body (actions). */
  footer?: ReactNode;
}

/** Bottom sheet — porcelain panel over a dimmed page. Escape and the backdrop close it. */
export default function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[#1F2A28]/40" onClick={onClose} />
      <div className="relative mx-auto flex max-h-[86vh] w-full max-w-[600px] flex-col rounded-t-ft-lg border-t border-ft-border bg-ft-surface shadow-ft-md">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ft-border" />
        {title !== undefined && (
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-3">
            <div className="min-w-0 truncate font-data text-[14.5px] font-bold uppercase tracking-[0.05em] text-ft-white">{title}</div>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 flex h-8 w-8 items-center justify-center text-ft-dim">
              <XIcon size={16} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-ft-border-faint px-5 pt-3 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}
