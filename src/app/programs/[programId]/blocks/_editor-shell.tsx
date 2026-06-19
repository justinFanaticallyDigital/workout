"use client";

/**
 * 3.7 — shared chrome for the Block / Day editor (block-editor.jsx).
 *
 * These are full-screen sub-flows (the global BottomNav is hidden on
 * /programs/[id]/blocks/** — see BottomNav.tsx), so they get their own
 * fixed-viewport shell: a sub Header → sticky PLANNING bar → scroll → optional
 * footer. Per the L1 edit contract, structural edits stage in a sandbox
 * (diff → confirm → undo); the PlanningBar is that sandbox signal and the
 * day editor's pending-changes footer is where edits actually commit.
 */
import type { ReactNode } from "react";
import { Header } from "@/components/v2";

/** Sticky "Planning Mode · Sandbox" signal. Sits on the page bg → on-bg tokens. */
export function PlanningBar() {
  return (
    <div className="ft-on-bg flex items-center gap-2 border-b border-ft-accent-border-on-bg bg-ft-accent-faint-on-bg px-4 py-[7px]">
      <span className="font-display text-[13px] text-ft-accent-on-bg">◇</span>
      <span className="font-data text-[10px] font-bold uppercase tracking-[0.14em] text-ft-accent-on-bg">
        Planning Mode · Sandbox
      </span>
      <span className="ml-auto font-body text-[11.5px] text-ft-on-bg-sec">Not live until applied</span>
    </div>
  );
}

export function EditorShell({
  title,
  subtitle,
  onBack,
  footer,
  contentPad = 24,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  footer?: ReactNode;
  contentPad?: number;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <div className="flex-shrink-0">
        <Header kind="sub" title={title} subtitle={subtitle} right={null} onBack={onBack} />
        <PlanningBar />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: contentPad }}>
        {children}
      </div>
      {footer}
    </div>
  );
}
