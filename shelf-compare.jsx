// shelf-compare.jsx
// 5.3 · Side-by-side Compare — themed
//
// Two cards, eleven rows, winner-per-row marking, sticky pick-a-side bar.
// Handles cross-type (Program vs Gameplan), same-type, and a one-card-
// unavailable error fallback.
//
// Themed via theme-bridge: host calls setCompareTheme(themeId) before
// render. All chrome / type / accent comes from CMP_T.

let CMP_T = window.getFitTrackTheme ? window.getFitTrackTheme('lab') : {};
function setCompareTheme(themeId) { CMP_T = window.getFitTrackTheme(themeId); }
window.setCompareTheme = setCompareTheme;

// ── Sample card data ────────────────────────────────────────────────────
// Two of each type so we can build all three combos.
const CMP_CARDS = {
  // Programs (one-time purchase)
  'size-strength': {
    id: 'size-strength', type: 'program', name: 'Size & Strength',
    glyph: 'barbell',
    price: 39, billing: 'once',
    weeks: 12, daysPerWeek: 4, level: 'Intermediate',
    scope: 'Training', scopeRank: 1,
    method: 'Upper / Lower',
    adapts: false, adaptsLabel: 'Self-directed',
    checkins: 'None',
    equipCount: 4,
    target: 'Visible size gains',
    afterEnd: 'Yours forever',
  },
  'starter-strength': {
    id: 'starter-strength', type: 'program', name: 'Starter Strength',
    glyph: 'dumbbell',
    price: 24, billing: 'once',
    weeks: 8, daysPerWeek: 3, level: 'Beginner',
    scope: 'Training', scopeRank: 1,
    method: 'Full body',
    adapts: false, adaptsLabel: 'Self-directed',
    checkins: 'None',
    equipCount: 2,
    target: 'First barbell milestones',
    afterEnd: 'Yours forever',
  },
  // Gameplans (subscription)
  '100-bench': {
    id: '100-bench', type: 'gameplan', name: '100 lb Bench in 12 Weeks',
    glyph: 'barbell',
    price: 19, billing: 'mo',
    weeks: 12, daysPerWeek: 4, level: 'Intermediate',
    scope: 'Training + Nutrition', scopeRank: 2,
    method: 'Upper / Lower',
    adapts: true, adaptsLabel: 'Yes — weekly',
    checkins: 'Weekly',
    equipCount: 4,
    target: '100 lb bench, 12 wks',
    afterEnd: 'Earned credit applies',
  },
  'cut-10': {
    id: 'cut-10', type: 'gameplan', name: 'Cut 10 lb · Hold strength',
    glyph: 'plate',
    price: 19, billing: 'mo',
    weeks: 10, daysPerWeek: 4, level: 'Intermediate',
    scope: 'Training + Nutrition', scopeRank: 2,
    method: 'Upper / Lower',
    adapts: true, adaptsLabel: 'Yes — weekly',
    checkins: 'Weekly',
    equipCount: 3,
    target: '10 lb body-weight loss',
    afterEnd: 'Earned credit applies',
  },
};

// ── Hero glyph (mini placeholder for column heads) ──────────────────────
function CmpGlyph({ name, color, size = 36 }) {
  const s = { width: size, height: size, stroke: color, strokeWidth: 1.2, fill: 'none',
              strokeLinecap: 'round', strokeLinejoin: 'round', opacity: .7 };
  if (name === 'barbell') return (
    <svg {...s} viewBox="0 0 64 64">
      <path d="M6 26v12M14 18v28M50 18v28M58 26v12M14 32h36"/>
    </svg>
  );
  if (name === 'dumbbell') return (
    <svg {...s} viewBox="0 0 64 64">
      <path d="M14 22v20M22 18v28M42 18v28M50 22v20M22 32h20"/>
    </svg>
  );
  if (name === 'plate') return (
    <svg {...s} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="10"/>
    </svg>
  );
  return null;
}

function CmpHeroPlaceholder({ glyph }) {
  const T = CMP_T;
  const dark = T.isDark;
  const isBP = T.chrome === 'blueprint';
  const ground = isBP ? T.surface : dark ? T.surfaceAlt : '#2A3540';
  const ink = dark || isBP ? T.textSec : '#E8ECEF';
  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop: '66.66%',
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
        <CmpGlyph name={glyph} color={ink} size={48}/>
      </div>
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────
function CmpHeader() {
  const T = CMP_T;
  const onBgTer = T.textOnBgTer || T.textTer;
  const onBg = T.textOnBg || T.text;
  const ic = {
    width: 20, height: 20, stroke: 'currentColor', fill: 'none',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  return (
    <div style={{
      flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      borderBottom: `1px solid ${T.borderFaint}`,
      background: T.bg,
    }}>
      <button style={{
        background: 'transparent', border: 'none', padding: 4,
        color: onBg, cursor: 'pointer', display: 'flex',
      }}>
        <svg {...ic} viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div style={{
        textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{
          fontSize: 9.5, color: onBgTer, fontFamily: T.fontData, fontWeight: 700,
          letterSpacing: '.16em', textTransform: 'uppercase', lineHeight: 1,
        }}>2 Pinned</div>
        <div style={{
          fontSize: 15, color: onBg, fontFamily: T.fontDisplay, fontWeight: 700,
          letterSpacing: '-.005em', lineHeight: 1,
        }}>Compare</div>
      </div>
      <button style={{
        background: 'transparent', border: 'none', padding: 4,
        color: onBg, cursor: 'pointer', display: 'flex',
      }}>
        <svg {...ic} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
        </svg>
      </button>
    </div>
  );
}

// ── Column head — mini hero + name + type chip + remove/swap controls ──
function CmpColumnHead({ card, letter, hideSwap }) {
  const T = CMP_T;
  const onCard = T.text;
  const isProgram = card.type === 'program';
  return (
    <div style={{
      borderRadius: T.radiusMd,
      overflow: 'hidden',
      background: T.surface,
      border: `1px solid ${T.borderFaint}`,
      boxShadow: T.shadowSm,
      position: 'relative',
    }}>
      <CmpHeroPlaceholder glyph={card.glyph}/>

      {/* Top-left letter A/B */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        padding: '2px 7px',
        borderRadius: T.radiusSm >= 4 ? T.radiusSm : 0,
        background: T.accent, color: T.textOnAccent,
        fontFamily: T.fontData, fontWeight: 700, fontSize: 10,
        letterSpacing: '.12em',
      }}>{letter}</div>

      {/* Top-right remove (X) */}
      <button title="Remove from compare" style={{
        position: 'absolute', top: 6, right: 6,
        width: 22, height: 22,
        borderRadius: T.radiusSm >= 4 ? 999 : 0,
        background: 'rgba(0,0,0,.5)', color: '#FFFFFF',
        border: '1px solid rgba(255,255,255,.30)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>

      {/* Body — type chip, name, swap link */}
      <div style={{ padding: '8px 10px 9px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{
            fontSize: 9, fontFamily: T.fontData, fontWeight: 700,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: T.textTer,
          }}>{isProgram ? 'Program' : 'Gameplan'}</span>
          {!hideSwap && (
            <button title="Swap with another pinned" style={{
              background: 'transparent', border: 'none', padding: 0,
              fontSize: 9, fontFamily: T.fontData, fontWeight: 700,
              letterSpacing: '.14em', textTransform: 'uppercase',
              color: T.textTer, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 3,
              opacity: .8,
            }}>
              <span>Swap</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h12l-3-3M17 17H5l3 3"/>
              </svg>
            </button>
          )}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: onCard,
          fontFamily: T.fontDisplay, lineHeight: 1.2,
          letterSpacing: '-.005em',
          minHeight: 32,
        }}>{card.name}</div>
        <div style={{
          marginTop: 5,
          fontSize: 11, fontFamily: T.fontData, fontWeight: 700,
          color: T.text, letterSpacing: '.02em',
        }}>${card.price}{card.billing === 'mo' ? '/mo' : ''}</div>
      </div>
    </div>
  );
}

// ── Headline-diff strip removed (per request) ──────────────────────────

// ── Row scaffold ───────────────────────────────────────────────────────
// rowSpec: { label, get(card) -> { display }, sub? }
function CmpRow({ label, a, b, sub }) {
  const T = CMP_T;
  const onBg = T.textOnBg || T.text;
  const cellBase = {
    fontSize: 12.5, fontWeight: 600, color: onBg,
    fontFamily: T.fontBody, lineHeight: 1.35, letterSpacing: '-.005em',
    minWidth: 0,
  };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '78px 1fr 1fr',
      padding: '11px 14px',
      borderBottom: `1px solid ${T.borderFaint}`,
      alignItems: 'flex-start', gap: 12,
      background: T.bg,
    }}>
      <div style={{
        fontSize: 9.5, color: T.textOnBgTer || T.textTer, fontFamily: T.fontData, fontWeight: 700,
        letterSpacing: '.14em', textTransform: 'uppercase', paddingTop: 2,
      }}>
        {label}
        {sub && (
          <div style={{ fontWeight: 600, letterSpacing: '.10em', marginTop: 2, opacity: .8 }}>{sub}</div>
        )}
      </div>
      <div style={cellBase}>
        {a}
      </div>
      <div style={cellBase}>
        {b}
      </div>
    </div>
  );
}

// ── Row specs ───────────────────────────────────────────────────────────
const CMP_ROWS = [
  { label: 'Type',     get: c => ({ display: c.type === 'program' ? 'Program' : 'Gameplan' }) },
  { label: 'Price',    get: c => ({ display: c.billing === 'mo' ? `$${c.price}/mo` : `$${c.price} once` }) },
  { label: 'Weeks',    get: c => ({ display: `${c.weeks} wk` }) },
  { label: 'Per week', get: c => ({ display: `${c.daysPerWeek}×` }) },
  { label: 'Scope',    get: c => ({ display: c.scope }) },
  { label: 'Level',    get: c => ({ display: c.level }) },
  { label: 'Method',   get: c => ({ display: c.method }) },
  { label: 'Adapts',   get: c => ({ display: c.adaptsLabel }) },
  { label: 'Check-ins',get: c => ({ display: c.checkins }) },
  { label: 'Equipment',get: c => ({ display: `${c.equipCount} items` }) },
  { label: 'Target',   get: c => ({ display: c.target }) },
  { label: 'After',    get: c => ({ display: c.afterEnd }), sub: 'subscription ends' },
];

// ── Sticky pick-a-side bar ──────────────────────────────────────────────
function StickyPick({ a, b }) {
  const T = CMP_T;
  const Col = ({ card, letter }) => (
    <button style={{
      flex: 1, minWidth: 0,
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusMd,
      padding: '9px 10px 10px',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
      fontFamily: T.fontBody,
      boxShadow: T.shadowSm,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, width: '100%',
      }}>
        <span style={{
          flexShrink: 0,
          width: 16, height: 16,
          borderRadius: T.radiusSm >= 4 ? 3 : 0,
          background: T.accent, color: T.textOnAccent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontFamily: T.fontData, fontWeight: 700,
        }}>{letter}</span>
        <span style={{
          fontSize: 11, color: T.text, fontWeight: 700, fontFamily: T.fontDisplay,
          letterSpacing: '-.005em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{card.name}</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        width: '100%', gap: 4, minWidth: 0,
      }}>
        <span style={{
          fontSize: 12.5, fontWeight: 700, color: T.text,
          fontFamily: T.fontDisplay, letterSpacing: '-.005em',
          whiteSpace: 'nowrap',
        }}>Start →</span>
        <span style={{
          fontSize: 10, color: T.textTer, fontFamily: T.fontData, fontWeight: 700,
          letterSpacing: '.02em', whiteSpace: 'nowrap',
        }}>${card.price}{card.billing === 'mo' ? '/mo' : ''}</span>
      </div>
    </button>
  );
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: T.bg, borderTop: `1px solid ${T.borderFaint}`,
      padding: '10px 12px 12px',
      boxShadow: '0 -2px 12px rgba(0,0,0,.08)',
      display: 'flex', gap: 8,
    }}>
      <Col card={a} letter="A"/>
      <Col card={b} letter="B"/>
    </div>
  );
}

// ── Error / fallback — one card unavailable ─────────────────────────────
function CmpErrorFallback({ available }) {
  const T = CMP_T;
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        margin: '16px 14px 0',
        padding: '12px 14px',
        background: T.surface,
        borderRadius: T.radiusMd,
        border: `1px solid ${T.warnBorder}`,
        backgroundColor: T.surface,
        backgroundImage: `linear-gradient(${T.warnBg}, ${T.warnBg})`,
        color: T.warnFg,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M12 4l10 18H2L12 4zM12 11v5M12 19v.5"/>
        </svg>
        <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45, fontFamily: T.fontBody, fontWeight: 500 }}>
          One card is unavailable. Comparing isn't possible.
        </div>
      </div>
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{
          fontSize: 10, color: onBgTer, letterSpacing: '.16em', textTransform: 'uppercase',
          fontWeight: 700, fontFamily: T.fontData, marginBottom: 8,
        }}>Still pinned</div>
        <CmpColumnHead card={available} letter="A" hideSwap/>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: T.bg, borderTop: `1px solid ${T.borderFaint}`,
        padding: '12px 14px 14px',
        boxShadow: '0 -2px 12px rgba(0,0,0,.08)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <button style={{
          width: '100%',
          background: T.accent, color: T.textOnAccent, border: 'none',
          padding: '14px 14px', borderRadius: T.radiusMd, cursor: 'pointer',
          fontSize: 14.5, fontWeight: 700, letterSpacing: '-.005em',
          fontFamily: T.fontDisplay,
          boxShadow: T.shadowSm,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        }}>
          <span>Open {available.name}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────
function CmpLoading() {
  const T = CMP_T;
  const Bar = ({ w, h = 11, mt = 0 }) => (
    <div style={{
      width: w, height: h, marginTop: mt,
      background: T.borderFaint, borderRadius: T.radiusSm >= 4 ? 3 : 0,
      animation: 'cmp-pulse 1.2s ease-in-out infinite',
    }}/>
  );
  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        padding: '12px 14px',
      }}>
        {[0,1].map(i => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.borderFaint}`,
            borderRadius: T.radiusMd, overflow: 'hidden',
            boxShadow: T.shadowSm,
          }}>
            <div style={{ paddingTop: '66.66%', background: T.borderFaint, animation: 'cmp-pulse 1.2s ease-in-out infinite' }}/>
            <div style={{ padding: 10 }}>
              <Bar w="40%" h={8}/>
              <Bar w="90%" h={12} mt={6}/>
              <Bar w="35%" h={9} mt={6}/>
            </div>
          </div>
        ))}
      </div>
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '78px 1fr 1fr',
          padding: '14px 14px', borderBottom: `1px solid ${T.borderFaint}`, gap: 12,
        }}>
          <Bar w="60%" h={8}/>
          <Bar w="80%" h={11}/>
          <Bar w="70%" h={11}/>
        </div>
      ))}
      <style>{`@keyframes cmp-pulse { 0%, 100% { opacity: .5; } 50% { opacity: .85; } }`}</style>
    </div>
  );
}

// ── The page ────────────────────────────────────────────────────────────
function CompareView({ aId = 'size-strength', bId = '100-bench', state = 'normal' }) {
  const T = CMP_T;
  const a = CMP_CARDS[aId];
  const b = CMP_CARDS[bId];

  const renderRows = () => CMP_ROWS.map((spec, i) => {
    const va = spec.get(a), vb = spec.get(b);
    return (
      <CmpRow key={i}
        label={spec.label} sub={spec.sub}
        a={va.display} b={vb.display}/>
    );
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: T.fontBody, color: T.text,
    }}>
      <CmpHeader/>

      {state === 'loading' && <CmpLoading/>}

      {state === 'error' && <CmpErrorFallback available={a}/>}

      {state === 'normal' && (
        <>
          {/* Column heads — scrolls with body */}
          <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }} className="cmp-body">
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
              padding: '14px 14px 10px',
            }}>
              <CmpColumnHead card={a} letter="A"/>
              <CmpColumnHead card={b} letter="B"/>
            </div>

            {/* Rows */}
            <div>
              {renderRows()}
            </div>

            <div style={{
              padding: '20px 16px 14px', textAlign: 'center',
              fontSize: 10, color: T.textOnBgTer || T.textTer, fontFamily: T.fontData, fontWeight: 600,
              letterSpacing: '.14em', textTransform: 'uppercase',
            }}>Pick a side below</div>
          </div>

          <StickyPick a={a} b={b}/>
        </>
      )}

      <style>{`.cmp-body::-webkit-scrollbar { width: 0; display: none; }`}</style>
    </div>
  );
}

Object.assign(window, {
  setCompareTheme, CompareView, CMP_CARDS,
  CmpHeader, CmpColumnHead, CmpRow, StickyPick,
  CmpErrorFallback, CmpLoading,
});
