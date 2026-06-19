// pillar-rail.jsx
// Themed, collapsible in-pillar side-rail — the secondary nav that sits inside
// each of the three bottom-shell pillars (Training / Nutrition / Lifestyle).
//
// The neutral exploration (pillar-shell.jsx) proved the structure on NB tokens.
// This is the production version: it reads the theme bridge `T` so it renders
// in all 7 themes, and it has TWO modes: a single labelled rail (a medium
// icon+label column, ~76px) or no rail at all (a sticky chip). Label font-size
// auto-shrinks to fit slots longer than "Gameplan".
//
// Positional symmetry is the whole point: slot order is identical across
// pillars — Today / This-{Block|Week} / {Program|Model|Routine} / Gameplan.
// Locked slots (e.g. Program + Gameplan for a Logger) render dimmed with a
// lock dot instead of disappearing, so the structure a tier *would* unlock is
// always legible from the rail itself.
//
// Blueprint note: the rail is a SURFACE (T.surface = dark navy on Blueprint),
// so everything inside uses the normal card tokens (T.text / T.textSec /
// T.textTer / T.accent), which are all correct on navy. No on-bg tokens here —
// those are only for chrome drawn directly on the page background.
//
//   <PillarRail T={T} pillar="training" tier="logger"
//               activeKey="today" onSetMode={fn}/>
//
// Layout contract (host screen):
//   <div absolute inset0 flex column>
//     <Header/>                              // full width, pinned top
//     <div flex:1 flex row minHeight:0>
//       <PillarRail .../>                    // flexShrink:0
//       <div flex:1 overflow:auto pb:84>…</div>
//     </div>
//   </div>   (+ BottomNav absolute bottom via navSlot)

const RAIL_W = 76;

// Auto-fit the slot label: default size carries up to "Gameplan" (8 chars);
// longer slots (e.g. "This Week", "Model Day") step the size down to fit.
function railLabelFont(label) {
  const n = (label || '').length;
  if (n <= 8)  return 9.5;
  if (n <= 10) return 8.5;
  return 7.5;
}

// ── Rail glyphs — simple geometric line icons, theme-agnostic ─────────────
function RailGlyph({ name, size = 21, color = 'currentColor', strokeWidth = 1.7 }) {
  const s = {
    width: size, height: size, stroke: color, strokeWidth, fill: 'none',
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'today': return ( // sun / now
      <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>
    );
    case 'block': return ( // week / block grid
      <svg {...s} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M9 5v14M15 5v14"/></svg>
    );
    case 'model': return ( // program / template
      <svg {...s} viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
    );
    case 'gameplan': return ( // rings / target
      <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill={color} stroke="none"/></svg>
    );
    case 'chevL': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
    );
    case 'chevR': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
    );
    case 'chevDown': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
    );
    case 'menu': return ( // stacked rows = the rail's slot list
      <svg {...s} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    );
    case 'hide': return ( // double chevron — push the rail away
      <svg {...s} viewBox="0 0 24 24"><path d="M13 6l-6 6 6 6M19 6l-6 6 6 6"/></svg>
    );
    case 'lock': return (
      <svg {...s} viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
    );
    default: return null;
  }
}

// ── Per-pillar/-tier rail items ───────────────────────────────────────────
// Slot order is fixed. `tier` decides what's locked. A Logger has no program,
// so slots 2–4 are locked; a Program tier unlocks Block + Program; a Gameplan
// tier unlocks everything.
function railItemsForTier(pillar, tier, activeKey) {
  const slot2 = { training: 'Block', nutrition: 'This Week', lifestyle: 'This Week' };
  const slot3 = { training: 'Program', nutrition: 'Model Day', lifestyle: 'Routine' };
  const lockMap = {
    logger:   { block: true,  model: true,  gameplan: true },
    program:  { block: false, model: false, gameplan: true },
    gameplan: { block: false, model: false, gameplan: false },
  };
  const locks = lockMap[tier] || lockMap.logger;
  const base = [
    { key: 'today',    label: 'Today',                  icon: 'today' },
    { key: 'block',    label: slot2[pillar] || 'Block', icon: 'block',    locked: locks.block },
    { key: 'model',    label: slot3[pillar] || 'Model', icon: 'model',    locked: locks.model },
    { key: 'gameplan', label: 'Gameplan',               icon: 'gameplan', locked: locks.gameplan },
  ];
  return base.map((i) => ({ ...i, active: i.key === activeKey }));
}

// ── Single rail row — icon over auto-fit label ────────────────────────────
function PillarRailItem({ T, item }) {
  const active = item.active;
  const locked = item.locked;
  const fg = active ? T.accent : locked ? T.textTer : T.textSec;
  const labelColor = active ? T.text : locked ? T.textTer : T.textSec;
  return (
    <div title={item.label} style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 5, padding: '12px 4px',
      cursor: locked ? 'default' : 'pointer',
      background: active ? T.accentFaint : 'transparent',
      opacity: locked ? 0.62 : 1,
    }}>
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: 7, bottom: 7, width: 3,
          background: T.accent, borderRadius: '0 2px 2px 0',
        }}/>
      )}
      <span style={{
        position: 'relative', width: 22, height: 22, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: fg,
      }}>
        <RailGlyph name={item.icon} size={21} color={fg} strokeWidth={active ? 2 : 1.7}/>
        {locked && (
          <span style={{
            position: 'absolute', right: -5, bottom: -4,
            width: 11, height: 11, borderRadius: 999,
            background: T.surface, color: T.textTer,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RailGlyph name="lock" size={9} color={T.textTer} strokeWidth={2.2}/>
          </span>
        )}
      </span>
      <span style={{
        fontFamily: T.fontData, fontSize: railLabelFont(item.label),
        fontWeight: active ? 700 : 600, color: labelColor,
        textAlign: 'center', lineHeight: 1.05, letterSpacing: '.02em',
        textTransform: 'uppercase',
        maxWidth: RAIL_W - 8, overflowWrap: 'anywhere',
      }}>{item.label}</span>
    </div>
  );
}

// ── Rail — single labelled column (icon over label) ───────────────────────
function PillarRail({ T, pillar = 'training', tier = 'logger', activeKey = 'today', items, onSetMode }) {
  const list = items || railItemsForTier(pillar, tier, activeKey);
  const set = onSetMode || (() => {});
  return (
    <div style={{
      width: RAIL_W, flexShrink: 0,
      background: T.surface,
      borderRight: `1px solid ${T.borderFaint || T.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* hide — drop the rail entirely (→ chip). Lives at the TOP so the
          show/hide control occupies the same spot as the chip in chip-mode. */}
      <button onClick={() => set('chip')} aria-label="Hide rail" style={{
        height: 46, flexShrink: 0,
        background: 'transparent', border: 'none',
        borderBottom: `1px solid ${T.borderFaint || T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        color: T.textTer, cursor: 'pointer',
      }}>
        <RailGlyph name="hide" size={16} color={T.textTer} strokeWidth={1.9}/>
        <span style={{
          fontFamily: T.fontData, fontSize: 8.5, fontWeight: 600, color: T.textTer,
          letterSpacing: '.06em', textTransform: 'uppercase',
        }}>Hide</span>
      </button>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: 6, paddingBottom: 88 }}>
        {list.map((it) => <PillarRailItem key={it.key} T={T} item={it}/>)}
      </div>
    </div>
  );
}

// ── Rail chip ────────────────────────────────────────────────────────────
// The most-collapsed mode: no side rail at all. A single sticky chip pinned to
// the top of the content scroll area names the active slot and opens the rail.
// Content flows full-width beneath it. The chip is a SURFACE, so normal card
// tokens apply (Blueprint-safe); the sticky bar behind it sits on the page bg.
function PillarRailChip({ T, pillar = 'training', tier = 'logger', items, activeKey = 'today', onShow }) {
  const list = items || railItemsForTier(pillar, tier, activeKey);
  const active = list.find((i) => i.key === activeKey) || list[0] || { label: 'Today', icon: 'today' };
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 6,
      background: T.bg,
      borderBottom: `1px solid ${T.borderFaint || T.border}`,
      padding: '9px 16px',
    }}>
      <button onClick={onShow} aria-label="Show rail" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 11px 7px 9px',
        background: T.surface, color: T.text,
        border: `1px solid ${T.border}`, borderRadius: T.radiusLg || 8,
        cursor: 'pointer', boxShadow: T.shadowSm,
      }}>
        <RailGlyph name="menu" size={16} color={T.accent} strokeWidth={2}/>
        <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.text }}>{active.label}</span>
        <span style={{ width: 1, height: 13, background: T.borderFaint || T.border }}/>
        <RailGlyph name="chevR" size={14} color={T.textTer} strokeWidth={2}/>
      </button>
    </div>
  );
}

// ── PillarShell — THE canonical pillar layout (CLAUDE.md mandate) ─────────
// Every pillar screen (Training / Nutrition / Lifestyle) across every tier
// (logger / program / gameplan) MUST render through this one component, so the
// Header → [rail | scroll content] → BottomNav contract and the Rail/Chip modes
// can never drift between clusters again.
//
//   header      — ReactNode pinned at top (a tier-homes <Header/>, or a
//                 cluster-specific bar like gameplan's <StatusStrip/>).
//   nav         — ReactNode pinned at bottom. Optional — most hosts inject the
//                 BottomNav via the phone shell's navSlot and leave this null.
//   decoration  — optional absolutely-positioned z-0 background layer
//                 (e.g. gameplan's spray dots). Caller sets zIndex:0 on it.
//   bg          — optional style merged onto the frame (background, etc).
//   contentPad  — bottom padding for the scroll area (default 88, clears nav).
//
// Rail/Chip is driven by railMode ('rail' | 'chip') + onSetRailMode, which a
// host wires to its `railMode` tweak. Locked slots come from tier via
// railItemsForTier — pass `items` only to override.
//
// Header collapse: the header auto-collapses once the content scrolls past a
// threshold — PillarShell clones the header with a `collapsed` prop, so any
// header that honours `collapsed` (tier-homes <Header/>, gameplan <StatusStrip/>)
// shrinks to a compact bar and gives the screen back its vertical space. A host
// can force the state for preview via the `headerCollapse` prop or the
// module-level setPillarHeaderCollapse() ('auto' | 'collapsed' | 'expanded').
let PILLAR_HEADER_COLLAPSE = 'auto';
function setPillarHeaderCollapse(m) {
  PILLAR_HEADER_COLLAPSE = (m === 'collapsed' || m === 'expanded') ? m : 'auto';
}
function PillarShell({
  T, pillar = 'training', tier = 'logger', activeKey = 'today', items,
  railMode = 'rail', onSetRailMode,
  header, nav, decoration, bg, contentPad = 88, contentStyle,
  headerCollapse, children,
}) {
  const railShown = railMode !== 'chip';
  const setMode = onSetRailMode || (() => {});
  const mode = headerCollapse || PILLAR_HEADER_COLLAPSE;
  const [scrolled, setScrolled] = React.useState(false);
  const collapsed = mode === 'collapsed' ? true : mode === 'expanded' ? false : scrolled;
  const onScroll = (e) => {
    if (mode !== 'auto') return;
    const top = e.target.scrollTop;
    // hysteresis so it doesn't flicker right at the threshold
    setScrolled((prev) => (prev ? top > 8 : top > 28));
  };
  const hdr = (header && React.isValidElement(header))
    ? React.cloneElement(header, { collapsed })
    : header;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...(bg || {}) }}>
      {decoration}
      {hdr && <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>{hdr}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', zIndex: 1 }}>
        {railShown && (
          <PillarRail T={T} pillar={pillar} tier={tier} activeKey={activeKey} items={items} onSetMode={setMode}/>
        )}
        <div onScroll={onScroll} style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingBottom: contentPad, ...(contentStyle || {}) }}>
          {railMode === 'chip' && (
            <PillarRailChip T={T} pillar={pillar} tier={tier} activeKey={activeKey} items={items} onShow={() => setMode('rail')}/>
          )}
          {children}
        </div>
      </div>
      {nav}
    </div>
  );
}

Object.assign(window, {
  RAIL_W,
  RailGlyph, railLabelFont, railItemsForTier, PillarRailItem, PillarRail, PillarRailChip,
  PillarShell, setPillarHeaderCollapse,
});
