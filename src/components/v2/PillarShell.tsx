"use client";

/**
 * PillarShell — THE canonical pillar layout (ARCHITECTURE.md §2).
 *
 * Every pillar screen (Training / Nutrition / Lifestyle) across every tier
 * (logger / program / gameplan) renders through this one component. NEVER
 * hand-roll the Header → [rail | scroll] → BottomNav tree in a screen.
 *
 *   <PillarShell pillar="training" activeKey="today" header={<Header …/>}>
 *     {content}
 *   </PillarShell>
 *
 * - Owns the layout, the Rail ↔ Chip switch, locked-slot rendering (via tier),
 *   and the auto-collapsing header.
 * - The header is cloned with a `collapsed` prop once content scrolls past the
 *   threshold (hysteresis 28/8); any header handed in MUST honour `collapsed`.
 * - Renders the single v2 BottomNav by default (override via `nav`).
 * - Fixed-viewport shell so the collapsing header + rail/chip behave like the
 *   prototype phone frame, independent of the legacy padded <main>.
 */
import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";
import { useTier } from "@/providers/TierProvider";
import type { Tier } from "@/lib/tier";
import {
  PillarRail,
  PillarRailChip,
  railItemsForTier,
  type Pillar,
  type RailItem,
  type RailKey,
} from "./PillarRail";

type HeaderCollapse = "auto" | "expanded" | "collapsed";

interface PillarShellProps {
  pillar: Pillar;
  activeKey: RailKey;
  /** Override the active tier (defaults to the TierProvider value). */
  tier?: Tier;
  /** Override the rail slots (defaults to railItemsForTier). */
  items?: RailItem[];
  /** Header element — cloned with `collapsed` on scroll. */
  header?: ReactElement;
  /** Bottom nav — defaults to the single v2 BottomNav. */
  nav?: ReactNode;
  /** Absolutely-positioned z-0 background layer (e.g. spray dots). */
  decoration?: ReactNode;
  /** Bottom padding for the scroll area (default 88, clears the nav). */
  contentPad?: number;
  /** Force the header collapse state for preview (default 'auto'). */
  headerCollapse?: HeaderCollapse;
  /** Called when a rail slot is selected (within-pillar L2/L3/gameplan layer). */
  onSelectRail?: (key: RailKey) => void;
  children: ReactNode;
}

export default function PillarShell({
  pillar,
  activeKey,
  tier: tierProp,
  items,
  header,
  nav,
  decoration,
  contentPad = 88,
  headerCollapse = "auto",
  onSelectRail,
  children,
}: PillarShellProps) {
  const { tier: ctxTier } = useTier();
  const tier = tierProp ?? ctxTier;
  const [railMode, setRailMode] = useState<"rail" | "chip">("rail");
  const [scrolled, setScrolled] = useState(false);

  const list = items ?? railItemsForTier(pillar, tier, activeKey);

  const collapsed =
    headerCollapse === "collapsed" ? true : headerCollapse === "expanded" ? false : scrolled;

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    if (headerCollapse !== "auto") return;
    const top = e.currentTarget.scrollTop;
    // hysteresis so it doesn't flicker right at the threshold
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

      <div className="relative z-[1] flex min-h-0 flex-1">
        {railMode === "rail" && (
          <PillarRail items={list} onSetMode={setRailMode} onSelect={onSelectRail} />
        )}
        <div className="min-w-0 flex-1 overflow-y-auto" style={{ paddingBottom: contentPad }} onScroll={onScroll}>
          {railMode === "chip" && (
            <PillarRailChip items={list} activeKey={activeKey} onShow={() => setRailMode("rail")} />
          )}
          {children}
        </div>
      </div>

      {/* The single BottomNav is mounted globally in the layout (fixed, z-50),
          so the shell doesn't render its own. `nav` can still override. */}
      {nav}
    </div>
  );
}
