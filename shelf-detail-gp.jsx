// shelf-detail-gp.jsx
// 5.2 · Card Detail — Gameplan
//
// Tightened scaffold (vs shelf-detail.jsx R1):
//   Hero · Stats · Trajectory · Sample day · Equipment · Included · Heads up · CTA
//   Dropped: who-this-is-for prose · "what changes" outcome narrative.
//   Replaced "outcomes" with a concrete `Included` list (deliverables, not prose).
//
// All chrome reads tokens from a theme-bridge GP_T constant; host calls
// setCardDetailGPTheme(themeId) before render.

let GP_T = window.getFitTrackTheme ? window.getFitTrackTheme('lab') : {};
function setCardDetailGPTheme(themeId) {
  GP_T = window.getFitTrackTheme(themeId);
}
window.setCardDetailGPTheme = setCardDetailGPTheme;

// ── Hero placeholder ────────────────────────────────────────────────────
// Theme-aware mood ground + glyph. Reads as deliberate placeholder, not as
// a missing image. Swap for <image-slot> when real photography lands.
const GP_MOODS = {
  strength: { glyph: 'barbell', cap: 'STRENGTH' },
};

function HeroGlyph({ name, color, size = 96 }) {
  const s = { width: size, height: size, stroke: color, strokeWidth: 1.2, fill: 'none',
              strokeLinecap: 'round', strokeLinejoin: 'round', opacity: .7 };
  if (name === 'barbell') return (
    <svg {...s} viewBox="0 0 64 64">
      <path d="M6 26v12M6 22v20M14 18v28M14 14v36M50 14v36M50 18v28M58 22v20M58 26v12M14 32h36"/>
    </svg>
  );
  return null;
}

function HeroPlaceholder({ mood = 'strength', children }) {
  // Hero ground colour is derived from the active theme so it doesn't look
  // pasted-in. Dark themes get a deeper variant; light themes get a slate-y
  // tinted ground that still reads as a placeholder.
  const T = GP_T;
  const dark = T.isDark;
  // Blueprint is the odd one — its `surface` is navy. Use that directly.
  const isBP = T.chrome === 'blueprint';
  const ground = isBP ? T.surface : dark ? T.surfaceAlt : '#2A3540';
  const ink = dark || isBP ? T.textSec : '#E8ECEF';
  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop: '56.25%',
      background: ground, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,.06), rgba(0,0,0,.18))',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HeroGlyph name={GP_MOODS[mood].glyph} color={ink} size={96}/>
      </div>
      <div style={{
        position: 'absolute', left: 14, bottom: 10,
        color: ink, opacity: .5,
        fontSize: 9.5, letterSpacing: '.16em', fontWeight: 600,
        fontFamily: T.fontData,
      }}>PHOTO · {GP_MOODS[mood].cap}</div>
      {children}
    </div>
  );
}

// ── Top chrome (back / share / settings, overlaid on hero) ──────────────
function HeroChrome() {
  const T = GP_T;
  const btn = {
    width: 36, height: 36, borderRadius: T.radiusMd >= 8 ? 999 : T.radiusSm,
    background: 'rgba(0,0,0,.40)', border: '1px solid rgba(255,255,255,.20)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#FFFFFF', padding: 0,
  };
  const ic = { width: 18, height: 18, stroke: 'currentColor', fill: 'none',
               strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 4,
    }}>
      <button style={btn}>
        <svg {...ic} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btn}>
          <svg {...ic} viewBox="0 0 24 24">
            <circle cx="6" cy="12" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="14" cy="18" r="2"/>
            <path d="M8 11l4-3M8 13l4 3"/>
          </svg>
        </button>
        <button style={btn}>
          <svg {...ic} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────────────────
function GPSection({ label, children, sub }) {
  const T = GP_T;
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div style={{ padding: '20px 16px 0' }}>
      <div style={{
        fontSize: 10, color: onBgTer, letterSpacing: '.16em', textTransform: 'uppercase',
        fontWeight: 700, fontFamily: T.fontData, marginBottom: 8,
      }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 12, color: onBgTer, marginBottom: 12, lineHeight: 1.45, fontFamily: T.fontBody }}>{sub}</div>
      )}
      {children}
    </div>
  );
}

// ── Goal arc ────────────────────────────────────────────────────────────
// Start → target arc with milestones along the curve. The single most
// important visual on this page; it's what "Gameplan" means visually.
function GoalArc({ start, target, milestones, alive = true }) {
  const T = GP_T;
  const W = 386, H = 200;
  const padL = 28, padR = 28, padT = 24, padB = 38;

  // Bezier: bottom-left → top-right. Control points chosen so the curve
  // climbs slowly then accelerates — matches how strength gains feel.
  const P0 = { x: padL, y: H - padB };
  const P3 = { x: W - padR, y: padT };
  const P1 = { x: padL + (W - padL - padR) * 0.55, y: H - padB };
  const P2 = { x: padL + (W - padL - padR) * 0.68, y: padT + 20 };

  const at = (t) => {
    const u = 1 - t;
    return {
      x: u*u*u * P0.x + 3*u*u*t * P1.x + 3*u*t*t * P2.x + t*t*t * P3.x,
      y: u*u*u * P0.y + 3*u*u*t * P1.y + 3*u*t*t * P2.y + t*t*t * P3.y,
    };
  };

  // Path "d"
  const d = `M ${P0.x} ${P0.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`;

  // Accent — for blueprint white-on-navy the accent is white; for graffiti
  // it's yellow; etc. T.accent reads correctly across all themes.
  const accent = T.accent;
  const muted = T.borderFaint;
  const ink = T.text;

  return (
    <div style={{
      position: 'relative',
      background: T.surface,
      border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd,
      padding: '14px 12px 12px',
      boxShadow: T.shadowSm,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        {/* Faint baseline grid — two horizontals */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB}
              stroke={muted} strokeWidth="1" strokeDasharray="3 4"/>
        <line x1={padL} y1={padT} x2={W - padR} y2={padT}
              stroke={muted} strokeWidth="1" strokeDasharray="3 4"/>

        {/* The curve */}
        <path d={d} stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: 0,
                animation: 'gp-draw 1.2s ease-out forwards',
              }}/>

        {/* Start anchor — open ring */}
        <circle cx={P0.x} cy={P0.y} r="6" fill={T.surface} stroke={ink} strokeWidth="1.5"/>
        <text x={P0.x} y={P0.y + 24} textAnchor="middle"
              fill={T.textTer} fontSize="10" fontWeight="700"
              fontFamily={T.fontData} letterSpacing=".12em">
          {start.label}
        </text>
        <text x={P0.x} y={P0.y + 36} textAnchor="middle"
              fill={ink} fontSize="13" fontWeight="700"
              fontFamily={T.fontData} letterSpacing=".02em">
          {start.value}
        </text>

        {/* Milestones */}
        {milestones.map((m, i) => {
          const p = at(m.at);
          const passed = m.passed;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5"
                      fill={passed ? accent : T.surface}
                      stroke={passed ? accent : muted} strokeWidth="1.5"/>
              <text x={p.x} y={p.y - 12} textAnchor="middle"
                    fill={T.textTer} fontSize="9" fontWeight="700"
                    fontFamily={T.fontData} letterSpacing=".12em">{m.label}</text>
              <text x={p.x} y={p.y - 22} textAnchor="middle"
                    fill={ink} fontSize="11" fontWeight="700"
                    fontFamily={T.fontData}>{m.value}</text>
            </g>
          );
        })}

        {/* Target anchor — solid + pulse */}
        {alive && (
          <circle cx={P3.x} cy={P3.y} r="10"
                  fill="none" stroke={accent} strokeWidth="1.5"
                  style={{ animation: 'gp-pulse 1.6s ease-out infinite', transformOrigin: `${P3.x}px ${P3.y}px` }}/>
        )}
        <circle cx={P3.x} cy={P3.y} r="7" fill={accent} stroke={T.surface} strokeWidth="1.5"/>
        <text x={P3.x} y={P3.y - 14} textAnchor="middle"
              fill={T.textTer} fontSize="10" fontWeight="700"
              fontFamily={T.fontData} letterSpacing=".12em">{target.label}</text>
        <text x={P3.x} y={P3.y - 26} textAnchor="middle"
              fill={ink} fontSize="14" fontWeight="700"
              fontFamily={T.fontData} letterSpacing=".02em">{target.value}</text>
      </svg>

      {/* Cadence grid under the arc — pure data, no prose */}
      <div style={{
        marginTop: 8, paddingTop: 10, borderTop: `1px dashed ${T.borderFaint}`,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        {[
          { l: 'Check-in', v: 'Weekly' },
          { l: 'Adapts', v: 'Calories + volume' },
          { l: 'Refeed', v: '1d / 2wk' },
          { l: 'Deload', v: 'Wk 4 · Wk 8' },
        ].map((k, i) => (
          <div key={i}>
            <div style={{
              fontSize: 9.5, color: T.textTer, fontFamily: T.fontData, fontWeight: 700,
              letterSpacing: '.14em', textTransform: 'uppercase',
            }}>{k.l}</div>
            <div style={{
              fontSize: 13, color: T.text, fontWeight: 600, marginTop: 3,
              fontFamily: T.fontBody, letterSpacing: '-.005em',
            }}>{k.v}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes gp-draw { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
        @keyframes gp-pulse { 0% { opacity: .8; transform: scale(.7); } 70% { opacity: 0; transform: scale(2.4); } 100% { opacity: 0; transform: scale(2.4); } }
      `}</style>
    </div>
  );
}

// ── Sample workout ──────────────────────────────────────────────────────
function SampleWorkout({ exercises }) {
  const T = GP_T;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd, overflow: 'hidden', boxShadow: T.shadowSm,
    }}>
      {exercises.map((ex, i) => (
        <div key={i} style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: i > 0 ? `1px solid ${T.borderFaint}` : 'none',
        }}>
          <div style={{
            width: 26, height: 26, flexShrink: 0,
            borderRadius: T.radiusSm,
            background: T.surfaceAlt, color: T.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: T.fontData,
            border: `1px solid ${T.borderFaint}`,
          }}>{String.fromCharCode(65 + i)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: '-.005em', fontFamily: T.fontDisplay }}>
              {ex.name}
            </div>
            {ex.note && (
              <div style={{ fontSize: 11.5, color: T.textTer, marginTop: 2, fontFamily: T.fontBody }}>
                {ex.note}
              </div>
            )}
          </div>
          <div style={{
            fontSize: 12, color: T.text, fontFamily: T.fontData, fontWeight: 700,
            textAlign: 'right', letterSpacing: '.02em',
          }}>
            {ex.sets}×{ex.reps}
            {ex.rir && <div style={{ color: T.textTer, marginTop: 1, fontWeight: 600 }}>@ {ex.rir}</div>}
          </div>
        </div>
      ))}
      <div style={{
        padding: '9px 14px',
        fontSize: 10.5, color: T.textTer, fontFamily: T.fontData, fontWeight: 700,
        background: T.surfaceAlt, borderTop: `1px solid ${T.borderFaint}`,
        letterSpacing: '.14em', textTransform: 'uppercase',
      }}>+ 2 more after start</div>
    </div>
  );
}

// ── Included list — concrete deliverables, one idea per line ────────────
function IncludedList({ items }) {
  const T = GP_T;
  return (
    <ul style={{
      margin: 0, padding: 0, listStyle: 'none',
      background: T.surface, border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd, overflow: 'hidden', boxShadow: T.shadowSm,
    }}>
      {items.map((it, i) => (
        <li key={i} style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: i > 0 ? `1px solid ${T.borderFaint}` : 'none',
        }}>
          <span style={{
            flexShrink: 0, width: 18, height: 18,
            borderRadius: T.radiusMd >= 4 ? 999 : 0,
            background: T.accent, color: T.textOnAccent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-11"/>
            </svg>
          </span>
          <span style={{ fontSize: 13.5, color: T.text, fontFamily: T.fontBody, lineHeight: 1.4, fontWeight: 500 }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Equipment chips ─────────────────────────────────────────────────────
function EquipChips({ items }) {
  const T = GP_T;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((e, i) => (
        <span key={i} style={{
          padding: '6px 12px',
          borderRadius: 999,
          background: T.surface, border: `1px solid ${T.border}`,
          color: T.text, fontSize: 12.5, fontWeight: 600,
          fontFamily: T.fontBody, letterSpacing: '.01em',
        }}>{e}</span>
      ))}
    </div>
  );
}

// ── Heads up (warnings) ─────────────────────────────────────────────────
function HeadsUp({ items }) {
  const T = GP_T;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((w, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '11px 12px',
          // Layered bg: warn tint over T.surface so the tint reads correctly
          // even when the page bg is also light (blueprint).
          backgroundColor: T.surface,
          backgroundImage: `linear-gradient(${T.warnBg}, ${T.warnBg})`,
          border: `1px solid ${T.warnBorder}`,
          borderRadius: T.radiusMd, color: T.warnFg,
        }}>
          <div style={{ flexShrink: 0, marginTop: 1, color: T.warnFg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l10 18H2L12 4zM12 11v5M12 19v.5"/>
            </svg>
          </div>
          <div style={{ fontSize: 12.5, color: T.warnFg, lineHeight: 1.5, fontFamily: T.fontBody, fontWeight: 500 }}>{w}</div>
        </div>
      ))}
    </div>
  );
}

// ── Stats row ───────────────────────────────────────────────────────────
function StatsRow({ weeks, daysPerWeek, scope, level }) {
  const T = GP_T;
  const cells = [
    { label: 'Weeks',  value: weeks,            mono: true },
    { label: 'Per wk', value: `${daysPerWeek}×`, mono: true },
    { label: 'Scope',  value: scope,            mono: false, narrow: true },
    { label: 'Level',  value: level,            mono: false, narrow: true },
  ];
  return (
    <div style={{
      background: T.surface,
      borderTop: `1px solid ${T.borderFaint}`,
      borderBottom: `1px solid ${T.borderFaint}`,
      padding: '14px 14px', display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
    }}>
      {cells.map((s, i, arr) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          padding: '0 8px',
          borderRight: i < arr.length - 1 ? `1px solid ${T.borderFaint}` : 'none',
          alignItems: 'flex-start',
        }}>
          <div style={{
            fontSize: 9.5, color: T.textTer, fontFamily: T.fontData,
            letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700,
          }}>{s.label}</div>
          <div style={{
            fontSize: s.narrow ? 12.5 : 17, fontWeight: 700, color: T.text,
            fontFamily: s.mono ? T.fontData : T.fontBody,
            letterSpacing: s.mono ? '.02em' : '-.005em',
            lineHeight: 1.1,
          }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sticky CTA ──────────────────────────────────────────────────────────
// Start now is primary; Customize first is a quiet text-only secondary.
function StickyCTA({ price, billing }) {
  const T = GP_T;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: T.surface, borderTop: `1px solid ${T.borderFaint}`,
      padding: '12px 14px 14px',
      boxShadow: '0 -2px 12px rgba(0,0,0,.08)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <button style={{
        width: '100%',
        background: T.accent, color: T.textOnAccent, border: 'none',
        padding: '15px 16px', borderRadius: T.radiusMd,
        cursor: 'pointer',
        fontSize: 15, fontWeight: 700, letterSpacing: '-.005em',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        fontFamily: T.fontDisplay,
        boxShadow: T.shadowSm,
      }}>
        <span>Start now</span>
        <span style={{
          fontSize: 12, fontFamily: T.fontData, fontWeight: 700,
          opacity: .8, letterSpacing: '.02em',
        }}>${price} / {billing}</span>
      </button>
      <button style={{
        background: 'transparent', border: 'none', padding: '6px 4px',
        fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600,
        color: T.textTer, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        alignSelf: 'center',
      }}>
        <span>Customize first</span>
        <span style={{ fontSize: 13 }}>→</span>
      </button>
    </div>
  );
}

// ── Whole page ──────────────────────────────────────────────────────────
function GameplanDetail() {
  const T = GP_T;

  // Sample data
  const data = {
    name: '100 lb Bench in 12 Weeks',
    tagline: 'Twelve weeks. Calories, training, and deloads move with you.',
    price: 19, billing: 'mo',
    weeks: 12, daysPerWeek: 4, level: 'Intermediate', scope: 'Training + Nutrition',
    equipment: ['Barbell + bench', 'Dumbbells', 'Cable column (opt.)', 'Body-weight scale'],
    sample: {
      day: 1, dayName: 'Bench Day', summary: '~60 min',
      exercises: [
        { name: 'Bench Press', sets: 5, reps: '3–5', rir: 'RIR 1', note: 'Top single, then back-off' },
        { name: 'Close-grip Bench', sets: 3, reps: '6–8', rir: 'RIR 2' },
        { name: 'DB Overhead Press', sets: 3, reps: '8–10', rir: 'RIR 2' },
        { name: 'Cable Tricep Pushdown', sets: 3, reps: '10–12', rir: 'RIR 1' },
      ],
    },
    included: [
      'Weekly check-in with calorie + volume adjustment',
      'Adaptive deloads at Wk 4 + Wk 8',
      'Refeed protocol — 1 day every 2 weeks',
      'Plate-by-plate progression to 100 lb',
      'Full history kept after cancel · credit applies',
    ],
    warnings: [
      'Calorie adaptations require weekly weigh-ins. Skip too many check-ins and recommendations stall.',
    ],
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: T.fontBody, color: T.text,
    }}>
      {/* Hero */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <HeroPlaceholder mood="strength">
          <HeroChrome/>
          {/* Bottom gradient + title block */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '72%',
            background: 'linear-gradient(to top, rgba(0,0,0,.62), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', left: 16, right: 16, bottom: 14, zIndex: 3, color: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
                fontFamily: T.fontData,
                padding: '4px 9px',
                background: 'rgba(255,255,255,.18)', color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,.30)',
                borderRadius: T.radiusSm,
              }}>Gameplan</span>
              <span style={{
                fontSize: 11, fontFamily: T.fontData, fontWeight: 700,
                letterSpacing: '.08em', opacity: .85,
              }}>${data.price}/{data.billing} · SUB</span>
            </div>
            <div style={{
              fontSize: 26, fontWeight: 700, lineHeight: 1.1,
              letterSpacing: '-.015em', fontFamily: T.fontDisplay,
              textShadow: '0 1px 6px rgba(0,0,0,.30)',
            }}>{data.name}</div>
            <div style={{
              fontSize: 13, marginTop: 6, lineHeight: 1.4,
              maxWidth: 320, opacity: .92, fontFamily: T.fontBody,
            }}>{data.tagline}</div>
          </div>
        </HeroPlaceholder>
      </div>

      {/* Scrolling body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 130 }} className="gp-body">
        <StatsRow weeks={data.weeks} daysPerWeek={data.daysPerWeek} scope={data.scope} level={data.level}/>

        <GPSection label="Trajectory">
          <GoalArc
            start={{ label: 'WK 0', value: '75 lb' }}
            target={{ label: 'WK 12', value: '100 lb' }}
            milestones={[
              { at: 0.28, label: 'WK 3', value: '82', passed: true },
              { at: 0.55, label: 'WK 7', value: '90' },
              { at: 0.80, label: 'WK 10', value: '95' },
            ]}
            alive
          />
        </GPSection>

        <GPSection label="Sample day" sub={`${data.sample.dayName} · ${data.sample.summary}`}>
          <SampleWorkout exercises={data.sample.exercises}/>
        </GPSection>

        <GPSection label="Equipment">
          <EquipChips items={data.equipment}/>
        </GPSection>

        <GPSection label="Included">
          <IncludedList items={data.included}/>
        </GPSection>

        <GPSection label="Heads up">
          <HeadsUp items={data.warnings}/>
        </GPSection>

        <div style={{
          padding: '22px 16px 12px', textAlign: 'center',
          fontSize: 10.5, color: T.textOnBgTer || T.textTer, fontFamily: T.fontData, fontWeight: 600,
          letterSpacing: '.14em', textTransform: 'uppercase',
        }}>
          Cancel anytime · Credit applies after
        </div>
      </div>

      <StickyCTA price={data.price} billing={data.billing}/>

      <style>{`
        .gp-body::-webkit-scrollbar { width: 0; display: none; }
      `}</style>
    </div>
  );
}

Object.assign(window, {
  setCardDetailGPTheme, GameplanDetail,
  HeroPlaceholder, HeroChrome, GPSection, GoalArc,
  SampleWorkout, IncludedList, EquipChips, HeadsUp, StatsRow, StickyCTA,
});
