"use client";

/**
 * Pillar rail — the themed, collapsible in-pillar side-nav (ARCHITECTURE.md §2,
 * ported from pillar-rail.jsx). Used only via PillarShell; not rendered directly.
 *
 * Positional symmetry is the point: slot order is identical across pillars —
 * Today / This-{Block|Week} / {Program|Model|Routine} / Gameplan. `tier`
 * decides what's locked; locked slots render DIMMED + lock badge, never hidden.
 *
 * The rail is a SURFACE (bg-ft-surface = dark navy on Blueprint), so everything
 * inside uses the normal card tokens — NOT the on-bg tokens. The chip's sticky
 * bar sits on the page bg, so it uses bg-ft-bg.
 */
import type { Tier } from "@/lib/tier";

export type Pillar = "training" | "nutrition" | "lifestyle";
export type RailKey = "today" | "block" | "model" | "gameplan";

export interface RailItem {
  key: RailKey;
  label: string;
  icon: GlyphName;
  locked?: boolean;
  active?: boolean;
}

export const RAIL_W = 76;

/** Auto-fit the slot label: longer than "Gameplan" steps the size down. */
function railLabelFont(label: string): string {
  const n = (label || "").length;
  if (n <= 8) return "9.5px";
  if (n <= 10) return "8.5px";
  return "7.5px";
}

// ── Per-pillar/-tier rail items. Slot order is fixed; tier decides locks. ──
export function railItemsForTier(pillar: Pillar, tier: Tier, activeKey: RailKey): RailItem[] {
  const slot2: Record<Pillar, string> = {
    training: "Block",
    nutrition: "This Week",
    lifestyle: "This Week",
  };
  const slot3: Record<Pillar, string> = {
    training: "Program",
    nutrition: "Model Day",
    lifestyle: "Routine",
  };
  const lockMap: Record<Tier, { block: boolean; model: boolean; gameplan: boolean }> = {
    logger: { block: true, model: true, gameplan: true },
    program: { block: false, model: false, gameplan: true },
    gameplan: { block: false, model: false, gameplan: false },
  };
  const locks = lockMap[tier] || lockMap.logger;
  const base: RailItem[] = [
    { key: "today", label: "Today", icon: "today" },
    { key: "block", label: slot2[pillar], icon: "block", locked: locks.block },
    { key: "model", label: slot3[pillar], icon: "model", locked: locks.model },
    { key: "gameplan", label: "Gameplan", icon: "gameplan", locked: locks.gameplan },
  ];
  return base.map((i) => ({ ...i, active: i.key === activeKey }));
}

// ── Rail glyphs — simple geometric line icons, theme-agnostic ──
type GlyphName =
  | "today"
  | "block"
  | "model"
  | "gameplan"
  | "chevR"
  | "menu"
  | "hide"
  | "lock";

function RailGlyph({
  name,
  size = 21,
  strokeWidth = 1.7,
}: {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "today":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
      );
    case "block":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 10h18M9 5v14M15 5v14" />
        </svg>
      );
    case "model":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "gameplan":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chevR":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "hide":
      return (
        <svg {...common}>
          <path d="M13 6l-6 6 6 6M19 6l-6 6 6 6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
  }
}

// ── Single rail row — icon over auto-fit label ──
function PillarRailItem({ item, onSelect }: { item: RailItem; onSelect?: (k: RailKey) => void }) {
  const { active, locked } = item;
  const fg = active ? "text-ft-accent" : locked ? "text-ft-dim" : "text-ft-light";
  const labelColor = active ? "text-ft-white" : locked ? "text-ft-dim" : "text-ft-light";
  return (
    <button
      type="button"
      title={item.label}
      onClick={() => onSelect?.(item.key)}
      className={[
        "relative flex w-full cursor-pointer flex-col items-center gap-[5px] px-1 py-3",
        active ? "bg-ft-accent-faint" : "bg-transparent",
        locked ? "opacity-[0.62]" : "",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-[7px] bottom-[7px] w-[3px] rounded-r-[2px] bg-ft-accent" />
      )}
      <span className={["relative inline-flex h-[22px] w-[22px] items-center justify-center", fg].join(" ")}>
        <RailGlyph name={item.icon} size={21} strokeWidth={active ? 2 : 1.7} />
        {locked && (
          <span className="absolute -right-[5px] -bottom-1 inline-flex h-[11px] w-[11px] items-center justify-center rounded-full bg-ft-surface text-ft-dim">
            <RailGlyph name="lock" size={9} strokeWidth={2.2} />
          </span>
        )}
      </span>
      <span
        className={[
          "text-center font-data font-semibold uppercase leading-[1.05] tracking-[0.02em]",
          active ? "font-bold" : "",
          labelColor,
        ].join(" ")}
        style={{ fontSize: railLabelFont(item.label), maxWidth: RAIL_W - 8, overflowWrap: "anywhere" }}
      >
        {item.label}
      </span>
    </button>
  );
}

// ── Rail — single labelled column (icon over label) ──
export function PillarRail({
  items,
  onSetMode,
  onSelect,
}: {
  items: RailItem[];
  onSetMode: (mode: "rail" | "chip") => void;
  onSelect?: (k: RailKey) => void;
}) {
  return (
    <div
      className="flex flex-shrink-0 flex-col overflow-hidden border-r border-ft-border-faint bg-ft-surface"
      style={{ width: RAIL_W }}
    >
      <button
        type="button"
        onClick={() => onSetMode("chip")}
        aria-label="Hide rail"
        className="flex h-[46px] flex-shrink-0 items-center justify-center gap-[5px] border-b border-ft-border-faint bg-transparent text-ft-dim"
      >
        <RailGlyph name="hide" size={16} strokeWidth={1.9} />
        <span className="font-data text-[8.5px] font-semibold uppercase tracking-[0.06em]">Hide</span>
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto pt-1.5 pb-[88px]">
        {items.map((it) => (
          <PillarRailItem key={it.key} item={it} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ── Rail chip — most-collapsed mode: sticky bar names active slot, opens rail ──
export function PillarRailChip({
  items,
  activeKey,
  onShow,
}: {
  items: RailItem[];
  activeKey: RailKey;
  onShow: () => void;
}) {
  const active = items.find((i) => i.key === activeKey) || items[0];
  return (
    <div className="sticky top-0 z-[6] border-b border-ft-border-faint bg-ft-bg px-4 py-[9px]">
      <button
        type="button"
        onClick={onShow}
        aria-label="Show rail"
        className="inline-flex items-center gap-2 rounded-ft-lg border border-ft-border bg-ft-surface py-[7px] pl-[9px] pr-[11px] text-ft-white shadow-ft-sm"
      >
        <span className="text-ft-accent">
          <RailGlyph name="menu" size={16} strokeWidth={2} />
        </span>
        <span className="font-body text-[12.5px] font-bold text-ft-white">{active.label}</span>
        <span className="h-[13px] w-px bg-ft-border-faint" />
        <span className="text-ft-dim">
          <RailGlyph name="chevR" size={14} strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}
