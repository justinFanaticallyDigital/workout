// Shelf cards — Blueprint theme
// Re-skin of shelf-cards.jsx onto the Blueprint visual language:
//   - dark navy cards on light blue grid paper
//   - mono type (Space Mono / Major Mono Display)
//   - crosshair drafting marks, dashed dividers
//   - cool desaturated activity coding
//
// Reads its palette from theme-bridge.jsx (the 'blueprint' theme).

// ── Theme-aware palette ──────────────────────────────────────────────────
// The Shelf was authored as a Blueprint drafting study; it now re-themes like
// every other surface. setShelfTheme(themeId) recomputes this palette from the
// active theme's bridge tokens and MUTATES window.BPS in place, so the screen +
// detail modules (which each capture window.BPS once at load) pick up the new
// theme with no edits. The drafting STRUCTURE stays (grid paper, hairline
// cards, corner crosshairs); only palette + type follow the theme.
function _bpRgba(hex, a) {
  if (typeof hex !== 'string' || hex[0] !== '#' || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

let BP_PAGE, BP_PAGE_ALT,
    BP_PAPER_INK, BP_PAPER_INK_2, BP_PAPER_INK_3, BP_PAPER_LINE, BP_PAPER_LINE_2, BP_GRID_LINE,
    BP_CARD, BP_CARD_ALT, BP_CARD_RAISED, BP_CARD_INK, BP_CARD_INK_2, BP_CARD_INK_3,
    BP_CARD_LINE, BP_CARD_LINE_2, BP_CARD_LINE_3,
    BP_ACCENT, BP_ACCENT_DK, BP_WARN, BP_OK, BP_MONO, BP_DISP,
    BP_GRID_BG, BP_GRID_DARK_BG, BP_ACTIVITY;

window.BPS = window.BPS || {};

function setShelfTheme(themeId) {
  const T = (window.getFitTrackTheme && window.getFitTrackTheme(themeId)) || {};
  const onBg = T.textOnBg || T.text || '#0E2347';

  BP_PAGE = T.bg; BP_PAGE_ALT = T.bgAlt;
  BP_PAPER_INK = onBg;
  BP_PAPER_INK_2 = _bpRgba(onBg, 0.80);
  BP_PAPER_INK_3 = _bpRgba(onBg, 0.55);
  BP_PAPER_LINE = _bpRgba(onBg, 0.22);
  BP_PAPER_LINE_2 = _bpRgba(onBg, 0.42);
  BP_GRID_LINE = _bpRgba(onBg, 0.075);

  BP_CARD = T.surface; BP_CARD_ALT = T.surfaceAlt; BP_CARD_RAISED = T.surfaceRaised;
  BP_CARD_INK = T.text; BP_CARD_INK_2 = T.textSec; BP_CARD_INK_3 = T.textTer;
  BP_CARD_LINE = _bpRgba(T.text, 0.16);
  BP_CARD_LINE_2 = _bpRgba(T.text, 0.32);
  BP_CARD_LINE_3 = _bpRgba(T.text, 0.55);

  BP_ACCENT = T.accent; BP_ACCENT_DK = T.info || T.accent;
  BP_WARN = T.warn; BP_OK = T.success;
  BP_MONO = T.fontData; BP_DISP = T.fontDisplay;

  BP_GRID_BG = {
    background: `linear-gradient(${BP_GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${BP_GRID_LINE} 1px, transparent 1px), ${BP_PAGE}`,
    backgroundSize: '24px 24px, 24px 24px, auto',
  };
  BP_GRID_DARK_BG = {
    background: `linear-gradient(${_bpRgba(T.text, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${_bpRgba(T.text, 0.05)} 1px, transparent 1px), ${BP_CARD}`,
    backgroundSize: '20px 20px, 20px 20px, auto',
  };
  BP_ACTIVITY = {
    lift:    { bg: T.accent, ink: T.textOnAccent, mark: '▮' },
    cardio:  { bg: T.push,   ink: T.textOnAccent, mark: '~' },
    class:   { bg: T.pull,   ink: T.textOnAccent, mark: '●' },
    stretch: { bg: T.core,   ink: T.textOnAccent, mark: '◇' },
    rest:    { bg: 'transparent', ink: BP_CARD_INK_3, mark: '·' },
  };

  Object.assign(window.BPS, {
    page: BP_PAGE, pageAlt: BP_PAGE_ALT,
    paperInk: BP_PAPER_INK, paperInk2: BP_PAPER_INK_2, paperInk3: BP_PAPER_INK_3,
    paperLine: BP_PAPER_LINE, paperLine2: BP_PAPER_LINE_2,
    card: BP_CARD, cardAlt: BP_CARD_ALT, cardRaised: BP_CARD_RAISED,
    cardInk: BP_CARD_INK, cardInk2: BP_CARD_INK_2, cardInk3: BP_CARD_INK_3,
    cardLine: BP_CARD_LINE, cardLine2: BP_CARD_LINE_2, cardLine3: BP_CARD_LINE_3,
    accent: BP_ACCENT, accentBlue: BP_ACCENT_DK,
    warn: BP_WARN, ok: BP_OK,
    mono: BP_MONO, disp: BP_DISP,
    gridBg: BP_GRID_BG, gridDarkBg: BP_GRID_DARK_BG,
  });
}
window.setShelfTheme = setShelfTheme;
setShelfTheme('blueprint');

// ── Crosshair drafting mark (corners) ───────────────────────────────────
function BPCrosshair({ size = 8, color = BP_CARD_LINE_3, sw = 1, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10"
         style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d="M5 0 L5 10 M0 5 L10 5" stroke={color} strokeWidth={sw}/>
    </svg>
  );
}

// Wrap any rect with 4 crosshair corners.
function BPHaloFrame({ children, color, offset = -4, sw = 1, size = 8 }) {
  return (
    <>
      <BPCrosshair color={color} sw={sw} size={size} style={{ top: offset, left: offset }}/>
      <BPCrosshair color={color} sw={sw} size={size} style={{ top: offset, right: offset }}/>
      <BPCrosshair color={color} sw={sw} size={size} style={{ bottom: offset, left: offset }}/>
      <BPCrosshair color={color} sw={sw} size={size} style={{ bottom: offset, right: offset }}/>
      {children}
    </>
  );
}

// Caps mono label, drafting style.
function BPCapsLabel({ children, color = BP_CARD_INK_3, size = 9, weight = 700, style }) {
  return (
    <div style={{
      fontSize: size, color, letterSpacing: '.18em', textTransform: 'uppercase',
      fontWeight: weight, fontFamily: BP_MONO, ...style,
    }}>{children}</div>
  );
}

// ── Hero placeholder ────────────────────────────────────────────────────
// Blueprint-style: navy card with a single white drafting glyph + grid lines
// + small caption. No photo pretense.
const BP_HERO_MOODS = {
  strength:  { glyph: 'barbell',  cap: 'STRENGTH'  },
  endurance: { glyph: 'pace',     cap: 'ENDURANCE' },
  recomp:    { glyph: 'flame',    cap: 'RECOMP'    },
  recovery:  { glyph: 'moon',     cap: 'RECOVERY'  },
  athletic:  { glyph: 'lightning',cap: 'ATHLETIC'  },
  classic:   { glyph: 'barbell',  cap: 'CLASSIC'   },
  metcon:    { glyph: 'lightning',cap: 'METCON'    },
  hybrid:    { glyph: 'split',    cap: 'HYBRID'    },
};

function BPHeroGlyph({ name, size = 64, color = BP_CARD_INK }) {
  const s = { width: size, height: size, stroke: color, strokeWidth: 1.1, fill: 'none',
              strokeLinecap: 'round', strokeLinejoin: 'round', opacity: .65 };
  switch (name) {
    case 'barbell':   return <svg {...s} viewBox="0 0 64 64"><path d="M6 26v12M6 22v20M14 18v28M14 14v36M50 14v36M50 18v28M58 22v20M58 26v12M14 32h36"/></svg>;
    case 'pace':      return <svg {...s} viewBox="0 0 64 64"><path d="M10 50c8-2 14-12 22-12s14 10 22 12M10 38c8-2 14-12 22-12s14 10 22 12"/><circle cx="48" cy="20" r="3" fill={color} stroke="none"/></svg>;
    case 'flame':     return <svg {...s} viewBox="0 0 64 64"><path d="M32 8s10 10 10 22a10 10 0 1 1-20 0c0-6 4-8 7-12-3 12 5 12 5 12s-3-8 0-14 -2-8-2-8z"/></svg>;
    case 'moon':      return <svg {...s} viewBox="0 0 64 64"><path d="M52 38a20 20 0 1 1-26-26 16 16 0 0 0 26 26z"/></svg>;
    case 'lightning': return <svg {...s} viewBox="0 0 64 64"><path d="M34 6 14 36h14L26 58l20-30H32z"/></svg>;
    case 'split':     return <svg {...s} viewBox="0 0 64 64"><path d="M10 18h44M10 32h44M10 46h44M22 10v44M42 10v44"/></svg>;
    default:          return null;
  }
}

function BPHeroPlaceholder({ mood = 'strength', aspect = '3:4', children, style }) {
  const m = BP_HERO_MOODS[mood] || BP_HERO_MOODS.strength;
  const paddingTop = aspect === '4:3' ? '75%' : aspect === '16:9' ? '56.25%' : '133.33%';
  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop,
      ...BP_GRID_DARK_BG,
      overflow: 'hidden',
      borderBottom: `1px solid ${BP_CARD_LINE}`,
      ...style,
    }}>
      {/* Diagonal blueprint cue */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,.06), rgba(0,0,0,.18))',
        pointerEvents: 'none',
      }}/>
      {/* Centre glyph */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BPHeroGlyph name={m.glyph} size={aspect === '4:3' ? 56 : aspect === '16:9' ? 78 : 64}/>
      </div>
      {/* Drafting caption — top-left, not bottom, blueprint convention */}
      <div style={{
        position: 'absolute', left: 10, top: 10,
        color: BP_CARD_INK, opacity: .65,
        fontSize: 10.5, letterSpacing: '.14em', fontWeight: 700, fontFamily: BP_MONO,
        zIndex: 1, pointerEvents: 'none',
      }}>
        PLATE · {m.cap}
      </div>
      {children}
    </div>
  );
}

// ── Pin (compare toggle, top-RIGHT — keeping mood caption top-left) ────
function BPPinIcon({ pinned, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', top: 8, right: 8,
      width: 30, height: 30, borderRadius: 0,
      background: pinned ? BP_ACCENT : 'rgba(19,44,82,.55)',
      border: `1px solid ${pinned ? BP_ACCENT : BP_CARD_LINE_2}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', padding: 0, zIndex: 3,
      fontFamily: BP_MONO,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24"
           fill={pinned ? BP_CARD : 'none'}
           stroke={pinned ? BP_CARD : BP_CARD_INK}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17v5M9 10.7l-3 3a1 1 0 0 0 0 1.4L9 18l9-9-3-3-9 9z" transform="rotate(-45 12 12)"/>
      </svg>
    </button>
  );
}

// ── Price chip / Subscription mark / Owned — all blueprint-styled ──────
function BPPriceChip({ price }) {
  return (
    <div style={{
      position: 'absolute', left: 8, bottom: 8,
      padding: '5px 10px',
      background: BP_ACCENT, color: BP_CARD,
      fontSize: 12.5, fontWeight: 700, letterSpacing: '.02em',
      fontFamily: BP_MONO,
      border: `1px solid ${BP_ACCENT}`,
      zIndex: 3,
    }}>${price}</div>
  );
}

function BPSubscriptionMark() {
  return (
    <div style={{
      position: 'absolute', left: 8, bottom: 8,
      padding: '5px 9px',
      background: 'transparent', color: BP_CARD_INK,
      border: `1px solid ${BP_CARD_LINE_3}`,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em',
      fontFamily: BP_MONO, textTransform: 'uppercase',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      zIndex: 3,
    }}>
      <span style={{ width: 6, height: 6, background: BP_OK, animation: 'bp-pulse 2.4s ease-in-out infinite' }}/>
      SUB · $19/MO
    </div>
  );
}

function BPOwnedBadge() {
  return (
    <div style={{
      position: 'absolute', right: 8, bottom: 8,
      padding: '4px 8px',
      background: 'transparent', color: BP_ACCENT,
      border: `1px solid ${BP_ACCENT}`,
      fontSize: 10, fontWeight: 700, letterSpacing: '.12em',
      fontFamily: BP_MONO, textTransform: 'uppercase',
      zIndex: 3,
    }}>Owned ✓</div>
  );
}

// ── WeekStrip ──────────────────────────────────────────────────────────
// Blueprint colour-codes activity types in cool, desaturated blue/green
// hues — kind reads as elevation on the grid rather than coloured paint.
// BP_ACTIVITY (activity-type block colours) is theme-derived in setShelfTheme.

function BPWeekStrip({ days, size = 'compact', showLabels = true, onPaper = false }) {
  const sizes = {
    compact: { h: 36, fs: 11, ms: 13, gap: 4, lab: 10 },
    medium:  { h: 56, fs: 13, ms: 16, gap: 6, lab: 11 },
    large:   { h: 72, fs: 14, ms: 20, gap: 8, lab: 12 },
  };
  const sz = sizes[size];
  const ink   = onPaper ? BP_PAPER_INK   : BP_CARD_INK;
  const ink3  = onPaper ? BP_PAPER_INK_3 : BP_CARD_INK_3;
  const line  = onPaper ? BP_PAPER_LINE_2 : BP_CARD_LINE_2;
  return (
    <div style={{ display: 'flex', gap: sz.gap }}>
      {days.map((d, i) => {
        const a = BP_ACTIVITY[d.kind] || BP_ACTIVITY.rest;
        const isRest = d.kind === 'rest';
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flex: 1, minWidth: 0 }}>
            {showLabels && (
              <div style={{
                fontSize: sz.lab, color: d.today ? ink : ink3,
                fontWeight: 700, fontFamily: BP_MONO,
                letterSpacing: '.06em',
              }}>{d.d}</div>
            )}
            <div style={{
              width: '100%', height: sz.h,
              background: a.bg,
              color: a.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: sz.ms, fontWeight: 700, fontFamily: BP_MONO,
              border: d.today ? `2px solid ${ink}` : `1px solid ${line}`,
              position: 'relative',
            }}>
              {!isRest ? a.mark : ''}
              {d.today && (
                <div style={{
                  position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 9, color: ink, fontFamily: BP_MONO, fontWeight: 700, letterSpacing: '.08em',
                }}>↑</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── GoalArc ────────────────────────────────────────────────────────────
function BPGoalArc({ start, target, milestones = [], size = 'compact', alive = true, onPaper = false }) {
  const sizes = {
    compact: { w: 280, h: 110, pad: { l: 36, r: 28, t: 18, b: 30 } },
    medium:  { w: 360, h: 170, pad: { l: 44, r: 36, t: 22, b: 38 } },
    large:   { w: 520, h: 220, pad: { l: 48, r: 40, t: 24, b: 48 } },
  };
  const sz = sizes[size];
  const { w, h, pad } = sz;
  const x0 = pad.l, x1 = w - pad.r;
  const y0 = h - pad.b, y1 = pad.t;
  const cx1 = x0 + (x1 - x0) * 0.45;
  const cy1 = y0 - (y0 - y1) * 0.15;
  const cx2 = x0 + (x1 - x0) * 0.65;
  const cy2 = y0 - (y0 - y1) * 0.85;
  const path = `M${x0},${y0} C${cx1},${cy1} ${cx2},${cy2} ${x1},${y1}`;
  const pointAt = (t) => {
    const it = 1 - t;
    const bx = it*it*it*x0 + 3*it*it*t*cx1 + 3*it*t*t*cx2 + t*t*t*x1;
    const by = it*it*it*y0 + 3*it*it*t*cy1 + 3*it*t*t*cy2 + t*t*t*y1;
    return { x: bx, y: by };
  };
  const ink   = onPaper ? BP_PAPER_INK   : BP_CARD_INK;
  const ink3  = onPaper ? BP_PAPER_INK_3 : BP_CARD_INK_3;
  const grid  = onPaper ? BP_PAPER_LINE  : BP_CARD_LINE;
  const fontSize = size === 'compact' ? 10 : size === 'medium' ? 11.5 : 12.5;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet"
           style={{ display: 'block', fontFamily: BP_MONO }}>
        {/* Background grid */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line key={'gv'+i} x1={x0 + (x1-x0)*t} y1={y0} x2={x0 + (x1-x0)*t} y2={y1}
                stroke={grid} strokeWidth="1" strokeDasharray="2 4"/>
        ))}
        {[0.33, 0.66].map((t, i) => (
          <line key={'gh'+i} x1={x0} y1={y0 - (y0-y1)*t} x2={x1} y2={y0 - (y0-y1)*t}
                stroke={grid} strokeWidth="1" strokeDasharray="2 4"/>
        ))}
        {/* Ground baseline */}
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={ink3} strokeWidth="1"/>
        {/* The arc */}
        <path d={path}
              fill="none" stroke={ink}
              strokeWidth="2" strokeLinecap="round"
              style={{
                strokeDasharray: 1000, strokeDashoffset: alive ? 1000 : 0,
                animation: alive ? 'arc-draw 1.2s cubic-bezier(.25,.6,.25,1) .15s forwards' : 'none',
              }}/>
        {/* Target — square reticle, blueprint convention */}
        <g>
          <rect x={x1-5} y={y1-5} width="10" height="10" fill={ink}/>
          <rect x={x1-9} y={y1-9} width="18" height="18" fill="none" stroke={ink} strokeWidth="1" opacity=".4"
                style={{ animation: alive ? 'arc-pulse 2.4s ease-in-out infinite' : 'none' }}/>
        </g>
        {/* Start — open square */}
        <rect x={x0-3.5} y={y0-3.5} width="7" height="7" fill="none" stroke={ink} strokeWidth="1.6"/>
        {/* Milestones */}
        {milestones.map((m, i) => {
          const p = pointAt(m.at);
          return (
            <g key={i}>
              <rect x={p.x-3.5} y={p.y-3.5} width="7" height="7"
                    fill={m.passed ? ink : 'none'}
                    stroke={ink} strokeWidth="1.4"/>
              <text x={p.x} y={p.y - 9}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fill={ink3} fontWeight="700"
                    letterSpacing="0.06em">{m.label}</text>
            </g>
          );
        })}
        {/* Axis labels */}
        <text x={x0} y={h - 8} fontSize={fontSize} fill={ink3} fontWeight="700" letterSpacing=".06em">{start.label}</text>
        <text x={x1} y={h - 8} textAnchor="end" fontSize={fontSize} fill={ink3} fontWeight="700" letterSpacing=".06em">{target.label}</text>
        <text x={x0 - 6} y={y0 + 3} textAnchor="end" fontSize={fontSize+1} fill={ink} fontWeight="700">{start.value}</text>
        <text x={x1 + 6} y={y1 + 3} textAnchor="start" fontSize={fontSize+1} fill={ink} fontWeight="700">{target.value}</text>
      </svg>
    </div>
  );
}

// Keyframes
if (typeof document !== 'undefined' && !document.getElementById('bp-shelf-styles')) {
  const s = document.createElement('style');
  s.id = 'bp-shelf-styles';
  s.textContent = `
    @keyframes arc-draw { to { stroke-dashoffset: 0; } }
    @keyframes arc-pulse { 0%,100% { opacity:.4; } 50% { opacity:.75; } }
    @keyframes bp-pulse { 0%,100% { opacity:.45; } 50% { opacity:1; } }
    @keyframes bp-breathe {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1px); }
    }
  `;
  document.head.appendChild(s);
}

// ── MethodBadge ────────────────────────────────────────────────────────
function BPMethodBadge({ children, onPaper = false }) {
  const ink = onPaper ? BP_PAPER_INK : BP_CARD_INK;
  const ink3 = onPaper ? BP_PAPER_INK_3 : BP_CARD_INK_3;
  const line = onPaper ? BP_PAPER_LINE_2 : BP_CARD_LINE_2;
  return (
    <span style={{
      display: 'inline-flex', padding: '4px 8px',
      background: 'transparent',
      border: `1px solid ${line}`,
      color: ink,
      fontSize: 11, fontWeight: 700, letterSpacing: '.12em',
      textTransform: 'uppercase',
      fontFamily: BP_MONO,
    }}>{children}</span>
  );
}

// ── ProgramCard (Blueprint) ─────────────────────────────────────────────
// 3:4 navy card · drafting crosshairs · price plate, no rounding.
function BPProgramCard({ name, tagline, price, weeks, daysPerWeek, level, method, mood,
                        pinned = false, owned = false, onPin, onClick, days }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative',
      background: BP_CARD, color: BP_CARD_INK,
      border: `1px solid ${pinned ? BP_ACCENT : BP_CARD_LINE_2}`,
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      boxShadow: pinned ? `0 0 0 2px ${BP_ACCENT}` : 'none',
      fontFamily: BP_MONO,
    }}>
      <BPHeroPlaceholder mood={mood} aspect="3:4">
        <BPPinIcon pinned={pinned} onClick={(e) => { e.stopPropagation(); onPin?.(); }}/>
        <BPPriceChip price={price}/>
        {owned && <BPOwnedBadge/>}
      </BPHeroPlaceholder>
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: BP_CARD_INK,
            letterSpacing: 0, lineHeight: 1.2, fontFamily: BP_DISP,
          }}>{name}</div>
          <div style={{
            fontSize: 12.5, color: BP_CARD_INK_2, marginTop: 5, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontFamily: BP_MONO,
          }}>{tagline}</div>
        </div>
        <BPWeekStrip days={days} size="compact"/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', flexWrap: 'wrap' }}>
          <BPMethodBadge>{method}</BPMethodBadge>
          <span style={{ fontSize: 11, color: BP_CARD_INK_2, fontFamily: BP_MONO, fontWeight: 700, letterSpacing: '.04em' }}>
            {weeks}WK · {daysPerWeek}×/WK · {level.toUpperCase()}
          </span>
        </div>
      </div>
      {/* drafting marks at card corners */}
      <BPCrosshair color={BP_CARD_LINE_3} size={7} style={{ top: 2, left: 2 }}/>
      <BPCrosshair color={BP_CARD_LINE_3} size={7} style={{ bottom: 2, right: 2 }}/>
    </div>
  );
}

// ── GameplanCard (Blueprint) ───────────────────────────────────────────
// 4:3 — gets a subtle breathing animation + a ticker glow.
function BPGameplanCard({ name, tagline, weeks, daysPerWeek, scope, mood,
                         start, target, milestones,
                         pinned = false, active = false, ticker, onPin, onClick }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative',
      background: BP_CARD, color: BP_CARD_INK,
      border: `1px solid ${pinned ? BP_ACCENT : BP_CARD_LINE_2}`,
      overflow: 'hidden',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      boxShadow: pinned ? `0 0 0 2px ${BP_ACCENT}` : 'none',
      animation: 'bp-breathe 5.5s ease-in-out infinite',
      fontFamily: BP_MONO,
    }}>
      <BPHeroPlaceholder mood={mood} aspect="4:3">
        <BPPinIcon pinned={pinned} onClick={(e) => { e.stopPropagation(); onPin?.(); }}/>
        <BPSubscriptionMark/>
        {active && (
          <div style={{
            position: 'absolute', right: 8, bottom: 8,
            padding: '4px 8px',
            border: `1px solid ${BP_ACCENT}`, color: BP_ACCENT,
            fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
            fontFamily: BP_MONO,
          }}>ACTIVE</div>
        )}
      </BPHeroPlaceholder>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <div style={{
            fontSize: 19, fontWeight: 700, color: BP_CARD_INK,
            letterSpacing: 0, lineHeight: 1.15, fontFamily: BP_DISP,
          }}>{name}</div>
          <div style={{ fontSize: 13, color: BP_CARD_INK_2, marginTop: 5, lineHeight: 1.45, fontFamily: BP_MONO }}>
            {tagline}
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: `1px solid ${BP_CARD_LINE}`,
          padding: '10px 8px 6px',
          position: 'relative',
        }}>
          <BPGoalArc start={start} target={target} milestones={milestones} size="compact"/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <BPMethodBadge>{scope}</BPMethodBadge>
            <span style={{ fontSize: 11, color: BP_CARD_INK_2, fontFamily: BP_MONO, fontWeight: 700, letterSpacing: '.04em' }}>
              {weeks}WK · {daysPerWeek}×/WK
            </span>
          </div>
          {ticker && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, color: BP_CARD_INK_2, fontFamily: BP_MONO, fontWeight: 700, letterSpacing: '.06em' }}>
              <span style={{ width: 7, height: 7, background: BP_OK, animation: 'bp-pulse 2s ease-in-out infinite' }}/>
              {ticker.toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <BPCrosshair color={BP_CARD_LINE_3} size={7} style={{ top: 2, left: 2 }}/>
      <BPCrosshair color={BP_CARD_LINE_3} size={7} style={{ bottom: 2, right: 2 }}/>
    </div>
  );
}

Object.assign(window, {
  BPCrosshair, BPHaloFrame, BPCapsLabel,
  BPHeroPlaceholder, BPHeroGlyph, BP_HERO_MOODS,
  BPPinIcon, BPPriceChip, BPSubscriptionMark, BPOwnedBadge, BPMethodBadge,
  BPWeekStrip, BPGoalArc, BP_ACTIVITY,
  BPProgramCard, BPGameplanCard,
});
