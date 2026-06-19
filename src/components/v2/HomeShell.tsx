"use client";

/**
 * HomeShell — the non-pillar slot-1 shell (ARCHITECTURE.md §3).
 *
 * Tier homes (Workouts Library / My Program / Gameplan) and other non-pillar
 * surfaces (Progress, Check-in, Recommendations) are NOT pillars, so they don't
 * get a rail. They still need the one collapse-aware Header + the single
 * BottomNav — that's all this provides: Header → scroll → BottomNav, no rail.
 *
 * Shares the collapsing-header contract with PillarShell (clones the header
 * with `collapsed` on scroll, hysteresis 28/8). Fixed-viewport, like the shell.
 */
import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";

type HeaderCollapse = "auto" | "expanded" | "collapsed";

interface HomeShellProps {
  header?: ReactElement;
  nav?: ReactNode;
  decoration?: ReactNode;
  contentPad?: number;
  headerCollapse?: HeaderCollapse;
  children: ReactNode;
}

export default function HomeShell({
  header,
  nav,
  decoration,
  contentPad = 88,
  headerCollapse = "auto",
  children,
}: HomeShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const collapsed =
    headerCollapse === "collapsed" ? true : headerCollapse === "expanded" ? false : scrolled;

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    if (headerCollapse !== "auto") return;
    const top = e.currentTarget.scrollTop;
    setScrolled((prev) => (prev ? top > 8 : top > 28));
  };

  const hdr =
    header && isValidElement(header)
      ? cloneElement(header as ReactElement<{ collapsed?: boolean }>, { collapsed })
      : header;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      {decoration}
      {hdr && <div className="relative z-[1] flex-shrink-0">{hdr}</div>}
      <div
        className="relative z-[1] min-h-0 flex-1 overflow-y-auto"
        style={{ paddingBottom: contentPad }}
        onScroll={onScroll}
      >
        {children}
      </div>
      {/* The single BottomNav is mounted globally in the layout. */}
      {nav}
    </div>
  );
}
