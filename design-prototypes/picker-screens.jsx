// Iron & Chalk · Gameplan Picker — 5 steps + 2 state variants
// Each screen renders inside a 380px artboard wrapped by Phone (status bar etc).
const { useState: usePickerState, useMemo: usePickerMemo } = React;

// ─── Theme bridge ──────────────────────────────────────────────
// Originally written for Iron & Chalk. Now reads from theme-bridge.jsx so
// it can render in any of the 7 FitTrack themes. The host calls
// setActivePickerTheme('iron'|'lab'|...) before render.
let IRON = window.getFitTrackTheme ? window.getFitTrackTheme('iron') : {};
function _resolvePickerTheme(themeId) {
  const T = window.getFitTrackTheme(themeId);
  return T;
}
function setActivePickerTheme(themeId) {
  IRON = _resolvePickerTheme(themeId);
}
window.setActivePickerTheme = setActivePickerTheme;

// Shared typography helpers bound to live IRON.
const { Marker: PickerMarker, Reenie: PickerReenie, Archivo: PickerArchivo, stripTilt: pickerStripTilt, isGraffiti: pickerIsGraffiti } =
  window.makeFitTrackTypography(() => IRON);
const isPickerIron       = () => IRON && IRON.chrome === 'iron';
const isPickerBlueprint  = () => IRON && IRON.chrome === 'blueprint';
const isPickerLab        = () => IRON && IRON.chrome === 'lab';
const isPickerNotebook   = () => IRON && IRON.chrome === 'notebook';
const isPickerArcade     = () => IRON && IRON.chrome === 'arcade';
const isPickerDarkfuture = () => IRON && IRON.chrome === 'darkfuture';


// ─── Shared ornament ────────────────────────────────────────────
// Real chalk PNG streak — uses one of 6 attached chalk dust images.
function ChalkSpray({ width = 220, height = 60, variant = 1, opacity = .55, style }) {
  // Chalk-on-blackboard ornament — only render on Iron theme.
  if (IRON.chrome !== 'iron') return null;
  return (
    <div style={{
      position: 'absolute',
      width, height,
      pointerEvents: 'none',
      backgroundImage: `url(assets/chalk-streak-${variant}.png)`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      opacity,
      mixBlendMode: 'screen',
      ...style,
    }}/>
  );
}

function BrassRib() {
  // Brass knurled rib strip — only render on Iron theme. Other themes get a
  // subtle accent line instead (or nothing for Lab, which uses clean cards).
  if (IRON.chrome === 'iron') {
    return <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 4,
      background: 'repeating-linear-gradient(90deg, rgba(200,169,110,.95) 0 2px, rgba(140,108,58,.9) 2px 4px), linear-gradient(90deg, #c8a96e, #a98855 50%, #c8a96e)',
      backgroundBlendMode: 'multiply',
      boxShadow: 'inset 0 1px 0 rgba(0,0,0,.4)',
      zIndex: 2,
    }}/>;
  }
  return null;
}

function CornerStamp({ children = 'IRON · CHALK', style }) {
  // Iron-specific corner stamp; suppressed on other themes which have their own ornaments.
  if (IRON.chrome !== 'iron') return null;
  return (
    <div className="ft-stamp" style={{
      position: 'absolute', bottom: 14, right: 14,
      transform: 'rotate(-2deg)',
      pointerEvents: 'none',
      zIndex: 3,
      border: `1px solid ${IRON.accent}`,
      padding: '3px 8px',
      letterSpacing: '.35em',
      fontSize: 9,
      color: IRON.accent,
      ...style,
    }}>
      {children}
    </div>
  );
}

// Themed card with brass rib
function IronCard({ children, style, padding = 18 }) {
  return (
    <div className="ft-card" style={{
      position: 'relative',
      background: 'rgb(var(--ft-surface))',
      border: `1px solid ${IRON.border}`,
      padding,
      ...style,
    }}>
      <BrassRib />
      {children}
    </div>
  );
}

// Outline button — Iron & Chalk primary
function IronBtn({ children, primary, ghost, full, small, style, onClick }) {
  const base = {
    fontFamily: IRON.fontBody,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    background: 'transparent',
    cursor: 'pointer',
    padding: small ? '8px 14px' : '14px 20px',
    fontSize: small ? 11 : 13,
    fontWeight: 500,
    width: full ? '100%' : 'auto',
    color: primary ? IRON.accent : ghost ? IRON.textSec : IRON.text,
    border: primary ? `1px solid ${IRON.accent}` : ghost ? '1px solid transparent' : `1px solid ${IRON.border}`,
    transition: 'all .15s',
    ...style,
  };
  return <button style={base} onClick={onClick}>{children}</button>;
}

// Section heading w/ chalk spray ornament
function IronH1({ children, kicker, variant = 3, style }) {
  return (
    <div style={{ position: 'relative', marginBottom: 14, ...style }}>
      <ChalkSpray width={360} height={120} variant={variant} opacity={.28} style={{ left: -60, top: -34, filter: 'blur(.5px)' }}/>
      {kicker && <div style={{
        fontFamily: IRON.fontBody,
        fontSize: 10, letterSpacing: '.3em', color: IRON.accent,
        textTransform: 'uppercase', marginBottom: 4, position: 'relative',
      }}>{kicker}</div>}
      <h1 style={{
        margin: 0,
        fontFamily: IRON.fontDisplay,
        fontSize: 28, fontWeight: 400, color: IRON.textOnBg || IRON.text,
        letterSpacing: '.04em', lineHeight: 1.05,
        position: 'relative',
      }}>{children}</h1>
    </div>
  );
}

// Movement-color tag
const TAG_COLORS = {
  strength: IRON.push, hypertrophy: IRON.pull, cardio: IRON.core, mobility: IRON.accent,
  fatloss: IRON.legs, performance: IRON.pull, habit: IRON.accent, recovery: IRON.pull,
  longevity: IRON.push, powerbuild: IRON.legs,
};
function Tag({ kind, children }) {
  const c = TAG_COLORS[kind] || IRON.accent;
  return <span style={{
    fontFamily: IRON.fontBody,
    fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase',
    color: c, border: `1px solid ${c}66`, padding: '2px 7px',
  }}>{children}</span>;
}

// Chip (filter)
function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: IRON.fontBody,
      fontSize: 12, letterSpacing: '.05em', fontWeight: 500,
      padding: '8px 14px',
      background: active ? IRON.accent : 'transparent',
      color: active ? IRON.bg : IRON.text,
      border: active ? `1px solid ${IRON.accent}` : `1px solid ${IRON.border}`,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      textTransform: 'none',
    }}>{children}</button>
  );
}

// Filter summary chip (removable)
function FilterChip({ children, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: IRON.fontBody,
      fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
      padding: '4px 8px',
      background: IRON.borderFaint,
      color: IRON.accent, border: `1px solid ${IRON.accent}`,
    }}>
      {children}
      <span onClick={onRemove} style={{ cursor: 'pointer', fontSize: 13, opacity: .8 }}>×</span>
    </span>
  );
}

// Numeric "data" font helper. `onBg` swaps to textOnBg color (use when the
// element sits directly on the page background, not inside a card surface).
// `hero` swaps to the theme's fontNumber (Reenie equivalent) for big metric digits.
const Data = ({ children, size = 18, style, onBg = false, hero = false }) => <span style={{
  fontFamily: hero ? (IRON.fontNumber || IRON.fontData) : IRON.fontData,
  fontWeight: 500, fontSize: size,
  letterSpacing: '.02em', lineHeight: 1,
  color: onBg ? (IRON.textOnBg || IRON.text) : IRON.text, ...style,
}}>{children}</span>;

// ─── Visual indicators ──────────────────────────────────────────

// Weeks bar — each tick = 1 week. Block boundaries shown via color bands.
// blocks: [{wks, color}] (optional). If omitted, plain ticks.
function WeeksBar({ weeks, blocks, height = 14, showLabel = true }) {
  // Build per-week color array
  const cells = [];
  if (blocks && blocks.length) {
    blocks.forEach(b => {
      for (let i = 0; i < b.wks; i++) cells.push(b.color);
    });
  } else {
    for (let i = 0; i < weeks; i++) cells.push(IRON.accent);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 1, flex: 1, height }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            flex: 1, background: `${c}`, opacity: .85,
            borderTop: `2px solid ${c}`,
            height: '100%',
          }}/>
        ))}
      </div>
      {showLabel && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <Data size={16}>{weeks}</Data>
          <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.textTer, letterSpacing: '.15em', textTransform: 'uppercase' }}>WK</span>
        </div>
      )}
    </div>
  );
}

// Days-of-week dots. dpwSet = array of indices 0..6 (M..S) that are training days.
// Discipline icons — chalk-line drawn, monochrome.
function DisciplineIcon({ kind, size = 18, color = IRON.accent }) {
  const s = { width: size, height: size, display: 'block' };
  const stroke = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'lift') return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* barbell */}
      <line x1="3" y1="12" x2="21" y2="12" {...stroke}/>
      <rect x="2" y="8" width="2" height="8" {...stroke}/>
      <rect x="20" y="8" width="2" height="8" {...stroke}/>
      <rect x="5" y="6" width="2.5" height="12" {...stroke}/>
      <rect x="16.5" y="6" width="2.5" height="12" {...stroke}/>
    </svg>
  );
  if (kind === 'cardio') return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* heart pulse */}
      <path d="M3 13 L7 13 L9 8 L12 18 L14 11 L16 13 L21 13" {...stroke}/>
    </svg>
  );
  if (kind === 'cond') return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* kettlebell */}
      <path d="M9 5 a3 3 0 0 1 6 0" {...stroke}/>
      <path d="M7 7 L17 7 L19 19 a2 2 0 0 1 -2 2 L7 21 a2 2 0 0 1 -2 -2 Z" {...stroke}/>
    </svg>
  );
  if (kind === 'nutrition') return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* fork + knife */}
      <path d="M8 3 L8 11 M6 3 L6 7 M10 3 L10 7 M8 11 L8 21" {...stroke}/>
      <path d="M16 3 C 14 5 14 9 16 11 L16 21" {...stroke}/>
    </svg>
  );
  if (kind === 'mobility') return (
    <svg viewBox="0 0 24 24" style={s}>
      {/* stretching figure */}
      <circle cx="12" cy="5" r="2" {...stroke}/>
      <path d="M12 7 L12 14 M12 14 L7 20 M12 14 L17 20 M5 11 L19 11" {...stroke}/>
    </svg>
  );
  return null;
}

// Frequency cluster — Lift / Cardio / Conditioning rows, optional Nutrition/Mobility column.
// freq = { lift: 3, cardio: [0,2], cond: [0,1], nutrition: true, mobility: false }
function FrequencyRow({ freq, compact }) {
  const items = [
    { key: 'lift',   label: 'LIFT',  val: freq.lift },
    { key: 'cardio', label: 'CARDIO',val: freq.cardio },
    { key: 'cond',   label: 'COND',  val: freq.cond },
  ].filter(i => i.val !== undefined && i.val !== null);

  const fmt = v => Array.isArray(v) ? (v[0] === v[1] ? `${v[0]}` : `${v[0]}–${v[1]}`) : `${v}`;
  const max = v => Array.isArray(v) ? v[1] : v;
  const min = v => Array.isArray(v) ? v[0] : v;
  const off = (v) => Array.isArray(v) ? v[1] === 0 : v === 0;
  const ICON = compact ? 13 : 16;

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {/* Left: rows */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(it => {
          const dim = off(it.val);
          const lo = min(it.val), hi = max(it.val);
          return (
            <div key={it.key} style={{
              display: 'grid',
              gridTemplateColumns: '54px 30px 1fr',
              alignItems: 'center', gap: 8,
              opacity: dim ? .4 : 1,
            }}>
              <div style={{
                fontFamily: IRON.fontBody, fontSize: 9,
                color: IRON.textTer, letterSpacing: '.2em',
                textTransform: 'uppercase',
              }}>{it.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
                <span style={{
                  fontFamily: IRON.fontData, fontWeight: 500,
                  fontSize: compact ? 16 : 18,
                  color: dim ? IRON.textTer : IRON.text,
                  lineHeight: 1,
                }}>{fmt(it.val)}</span>
                <span style={{
                  fontFamily: IRON.fontBody, fontSize: 8,
                  color: IRON.textTer, letterSpacing: '.1em',
                }}>×</span>
              </div>
              {/* Repeated icons. Solid = guaranteed (lo). Outline = optional (lo+1 .. hi). */}
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {Array.from({ length: Math.max(hi, 1) }).map((_, i) => {
                  const guaranteed = i < lo;
                  const optional = i >= lo && i < hi;
                  if (!guaranteed && !optional) return null;
                  return (
                    <DisciplineIcon
                      key={i}
                      kind={it.key}
                      size={ICON}
                      color={guaranteed ? IRON.accent : IRON.accentBorder}
                    />
                  );
                })}
                {hi === 0 && (
                  <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.borderStrong, letterSpacing: '.15em' }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right column: nutrition + mobility flags */}
      {(freq.nutrition || freq.mobility) && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          paddingLeft: 12, borderLeft: `1px dashed ${IRON.border}`,
          alignSelf: 'stretch',
        }}>
          {freq.nutrition && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DisciplineIcon kind="nutrition" size={ICON}/>
              <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.accent, letterSpacing: '.2em' }}>NUTR</span>
            </div>
          )}
          {freq.mobility && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DisciplineIcon kind="mobility" size={ICON}/>
              <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.accent, letterSpacing: '.2em' }}>MOB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Or pass `pattern` explicitly. `range` is a [min,max] showing variable days/wk.
function DaysDots({ pattern, range, compact }) {
  const labels = ['M','T','W','T','F','S','S'];
  const size = compact ? 18 : 22;
  return (
    <div style={{ display: 'inline-flex', gap: compact ? 2 : 3 }}>
      {labels.map((l, i) => {
        const on = pattern[i];
        return (
          <div key={i} style={{
            width: size, height: size,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: on ? IRON.accent : 'transparent',
            border: on ? `1px solid ${IRON.accent}` : `1px solid ${IRON.borderFaint}`,
            color: on ? IRON.bg : IRON.textTer,
            fontFamily: IRON.fontBody,
            fontSize: compact ? 9 : 10,
            fontWeight: 600,
            letterSpacing: 0,
          }}>{l}</div>
        );
      })}
    </div>
  );
}

// Difficulty meter — 5 chalk bars, n filled.
function DifficultyBars({ level, max = 5, label = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        {Array.from({length: max}).map((_, i) => {
          const on = i < level;
          const h = 6 + i * 2;
          return (
            <div key={i} style={{
              width: 4, height: h,
              background: on ? IRON.accent : IRON.borderFaint,
              boxShadow: on ? '0 0 0 0 transparent' : 'none',
            }}/>
          );
        })}
      </div>
      {label && (
        <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.textTer, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          {['','BEGINNER','EASY','MODERATE','HARD','ELITE'][level]}
        </span>
      )}
    </div>
  );
}

// Calorie scale — horizontal axis from -500 (deficit) to +500 (surplus),
// marker placed at `delta` kcal. Optional `range` shows a band.
// Negative = deficit (red), 0 = maintenance, positive = surplus (green).
function CalorieScale({ delta, range, height = 56 }) {
  const min = -700, max = 700;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  const markerL = Math.max(2, Math.min(98, pct(delta)));
  const bandL = range ? pct(range[0]) : null;
  const bandR = range ? pct(range[1]) : null;
  const sign = delta > 0 ? '+' : '';
  const label = delta === 0 ? 'MAINTENANCE'
    : delta > 0 ? (delta > 250 ? 'SURPLUS' : 'SLIGHT SURPLUS')
    : (delta < -250 ? 'DEFICIT' : 'SLIGHT DEFICIT');
  const color = Math.abs(delta) < 50 ? IRON.accent
    : delta > 0 ? IRON.pull : IRON.legs;
  return (
    <div style={{ position: 'relative', paddingTop: 6, paddingBottom: 18 }}>
      {/* axis */}
      <div style={{ position: 'relative', height: 18, marginBottom: 4 }}>
        {/* track — cut/maintain/bulk gradient. Use semantic danger → surfaceAlt → success so each theme tints correctly. */}
        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${IRON.danger} 0%, ${IRON.borderFaint} 50%, ${IRON.success} 100%)`,
          opacity: .55,
        }}/>
        {/* maintenance tick */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
          background: IRON.textTer,
        }}/>
        {/* range band */}
        {range && (
          <div style={{
            position: 'absolute',
            left: `${bandL}%`, width: `${bandR - bandL}%`,
            top: 6, height: 6,
            background: `${color}55`, border: `1px solid ${color}`,
          }}/>
        )}
        {/* marker */}
        <div style={{
          position: 'absolute', left: `${markerL}%`, top: -2, bottom: -2,
          transform: 'translateX(-50%)',
          width: 2, background: color, boxShadow: `0 0 6px ${color}aa`,
        }}/>
        <div style={{
          position: 'absolute', left: `${markerL}%`, top: -10,
          transform: 'translateX(-50%)',
          fontFamily: IRON.fontData, fontSize: 14, color, fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>{sign}{delta}</div>
      </div>
      {/* axis labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: IRON.fontBody, fontSize: 8,
        letterSpacing: '.2em', color: IRON.textTer,
        textTransform: 'uppercase', marginTop: 2,
      }}>
        <span style={{ color: 'rgba(217,83,79,.7)' }}>−500 DEFICIT</span>
        <span>MAINT</span>
        <span style={{ color: 'rgba(92,184,92,.75)' }}>+500 SURPLUS</span>
      </div>
      <div style={{
        position: 'absolute', right: 0, top: -2,
        fontFamily: IRON.fontBody, fontSize: 9, letterSpacing: '.25em',
        color, textTransform: 'uppercase', fontWeight: 600,
      }}>{label}</div>
    </div>
  );
}

// ─── Step 1 — Welcome ───────────────────────────────────────────
function Step1Welcome() {
  return (
    <div style={{
      height: '100%',
      padding: '60px 24px 28px',
      display: 'flex', flexDirection: 'column',
      background: isPickerIron()
        ? 'radial-gradient(ellipse at top, rgba(200,169,110,.06), transparent 60%), rgb(var(--ft-bg))'
        : 'rgb(var(--ft-bg))',
      position: 'relative',
    }}>
      <div className="ft-stamp" style={{ marginBottom: 36, color: IRON.accent, fontSize: 9, letterSpacing: '.4em' }}>
        FITTRACK · NEW MEMBER
      </div>
      <IronH1 variant={1} kicker="STEP 01">Pick your<br/>Gameplan.</IronH1>
      <p style={{
        fontFamily: IRON.fontBody, fontSize: 15, lineHeight: 1.55,
        color: IRON.textOnBg || IRON.text, fontWeight: 400, marginTop: 14, marginBottom: 0,
      }}>
        A Gameplan is your training, nutrition, and lifestyle in one editable plan.
      </p>

      <div style={{ flex: 1 }}/>

      {/* visual: stenciled "schedule sheet" placeholder */}
      <div style={{
        margin: '0 -24px 32px',
        padding: '28px 24px',
        borderTop: `1px dashed ${IRON.border}`,
        borderBottom: `1px dashed ${IRON.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18,
      }}>
        <div>
          <div className="ft-stamp" style={{ fontSize: 8, letterSpacing: '.3em', color: IRON.accent, marginBottom: 8 }}>
            CONTAINS
          </div>
          <Data size={20} onBg hero>03</Data>
          <span style={{ fontFamily: IRON.fontBody, fontSize: 11, color: IRON.textOnBgSec || IRON.textSec, marginLeft: 6, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            COMPONENTS
          </span>
          <div style={{ marginTop: 6, fontFamily: IRON.fontBody, fontSize: 13, color: IRON.textOnBg || IRON.text }}>
            Training · Nutrition · Lifestyle
          </div>
        </div>
        {/* Triangular wedge ornament */}
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
          <polygon points="32,4 60,56 4,56" fill="none" stroke={IRON.accent} strokeWidth="1.2" opacity=".6"/>
          <line x1="32" y1="4" x2="32" y2="56" stroke={IRON.accent} strokeWidth=".5" strokeDasharray="2 3" opacity=".4"/>
          <text x="32" y="42" textAnchor="middle" fontFamily="Stardos Stencil" fontSize="14" fill={IRON.accent}>G/P</text>
        </svg>
      </div>

      <IronBtn primary full>Pick a Gameplan</IronBtn>
      <IronBtn ghost full style={{ marginTop: 8 }}>Skip — just let me log</IronBtn>
      <div style={{
        marginTop: 14, textAlign: 'center',
        fontFamily: IRON.fontBody, fontSize: 11,
        color: IRON.textOnBgTer || IRON.textTer, letterSpacing: '.05em',
      }}>
        You can pick one later from the Gameplan tab.
      </div>

      <CornerStamp />
    </div>
  );
}

// ─── Step 2 — Filter ─────────────────────────────────────────────
function Step2Filter() {
  const groups = [
    { label: 'Primary goal', key: 'goal', opts: ['Build muscle', 'Get stronger', 'Lose fat', 'Move better', 'Stay healthy', 'Compete'], active: 'Get stronger' },
    { label: 'Experience', key: 'exp', opts: ['New', 'Returning', '1+ year', '3+ years'], active: '1+ year' },
    { label: 'Days / week', key: 'days', opts: ['2', '3', '4', '5', '6'], active: '4' },
    { label: 'Equipment', key: 'eq', opts: ['Home', 'Limited gym', 'Full gym'], active: 'Full gym' },
  ];
  return (
    <div style={{
      height: '100%', padding: '20px 22px 18px',
      display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em' }}>STEP 02 / 05</div>
        <span style={{
          fontFamily: IRON.fontBody, fontSize: 11,
          letterSpacing: '.15em', textTransform: 'uppercase',
          color: IRON.accent, cursor: 'pointer',
          borderBottom: `1px solid ${IRON.accent}`,
        }}>
          Skip →
        </span>
      </div>

      <IronH1 variant={2}>Help us narrow it down.</IronH1>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 6 }}>
        {groups.map(g => (
          <div key={g.key}>
            <div style={{
              fontFamily: IRON.fontBody,
              fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase',
              color: IRON.textOnBgTer || IRON.textTer, marginBottom: 8,
              borderBottom: `1px dashed ${IRON.border}`, paddingBottom: 4,
            }}>{g.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.opts.map(o => (
                <Chip key={o} active={o === g.active}>{o}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      <IronBtn primary full style={{ marginTop: 14 }}>Show me Gameplans →</IronBtn>
      <CornerStamp />
    </div>
  );
}

// ─── Plan card data ─────────────────────────────────────────────
// pattern = 7-day training mask (M T W T F S S)
// blocks = visual periodization for the WeeksBar
// diff = 1..5 difficulty
const PLANS = [
  { id: 'first90', name: 'First 90 Days', tag: 'Beginner on-ramp · habit-first.', wks: 12, dpw: 3, dpwLabel: '3',
    pattern: [1,0,1,0,1,0,0], diff: 1,
    freq: { lift: 3, cardio: [0,2], cond: 0, nutrition: true, mobility: true },
    blocks: [{wks:4,color:IRON.pull},{wks:4,color:IRON.accent},{wks:4,color:IRON.push}],
    tags: [['habit','HABITS'],['hypertrophy','FULL BODY']], best: false },
  { id: 'sizestrength', name: 'Size & Strength', tag: 'Block periodization workhorse.', wks: 16, dpw: 4, dpwLabel: '4–6',
    pattern: [1,1,0,1,1,0,0], diff: 3,
    freq: { lift: 4, cardio: [0,2], cond: 1, nutrition: true, mobility: false },
    blocks: [{wks:4,color:IRON.pull},{wks:4,color:IRON.push},{wks:4,color:IRON.pull},{wks:4,color:IRON.legs}],
    tags: [['strength','STRENGTH'],['hypertrophy','HYPERTROPHY']], best: true },
  { id: 'leanout', name: 'Lean Out', tag: 'Fat-loss with prescribed cardio.', wks: 12, dpw: 4, dpwLabel: '3–4',
    pattern: [1,1,0,1,0,1,0], diff: 3,
    freq: { lift: 3, cardio: 3, cond: [1,2], nutrition: true, mobility: false },
    blocks: [{wks:4,color:IRON.legs},{wks:4,color:IRON.core},{wks:4,color:IRON.legs}],
    tags: [['fatloss','FAT LOSS'],['cardio','CARDIO']], best: false },
  { id: 'powerbuild', name: 'Powerbuilder', tag: 'Strength + aesthetics, 1RM test.', wks: 16, dpw: 5, dpwLabel: '4–5',
    pattern: [1,1,0,1,1,1,0], diff: 4,
    freq: { lift: 5, cardio: [0,1], cond: [1,2], nutrition: true, mobility: true },
    blocks: [{wks:5,color:IRON.push},{wks:5,color:IRON.pull},{wks:6,color:IRON.legs}],
    tags: [['strength','STRENGTH'],['powerbuild','PEAK']], best: true },
  { id: 'busy', name: 'Busy Parent / Pro', tag: 'Time-flex · 30–45 min sessions.', wks: 12, dpw: 3, dpwLabel: '2–3',
    pattern: [1,0,1,0,1,0,0], diff: 2,
    freq: { lift: 3, cardio: [0,1], cond: 0, nutrition: false, mobility: true },
    blocks: [{wks:6,color:IRON.pull},{wks:6,color:IRON.accent}],
    tags: [['habit','TIME-FLEX'],['hypertrophy','FULL BODY']], best: false },
  { id: 'athletic', name: 'Athletic Foundations', tag: 'Conjugate · sprint, jump, plyo.', wks: 12, dpw: 5, dpwLabel: '4–5',
    pattern: [1,1,0,1,1,1,0], diff: 4,
    freq: { lift: 4, cardio: [1,2], cond: 2, nutrition: false, mobility: true },
    blocks: [{wks:4,color:IRON.pull},{wks:4,color:IRON.push},{wks:4,color:IRON.legs}],
    tags: [['performance','PERFORMANCE'],['strength','STRENGTH']], best: false },
  { id: 'comeback', name: 'Comeback', tag: 'Reverse-linear, daily readiness.', wks: 12, dpw: 3, dpwLabel: '3',
    pattern: [1,0,1,0,1,0,0], diff: 2,
    freq: { lift: 3, cardio: [0,2], cond: 0, nutrition: false, mobility: true },
    blocks: [{wks:4,color:IRON.pull},{wks:4,color:IRON.accent},{wks:4,color:IRON.push}],
    tags: [['recovery','RECOVERY'],['mobility','MOBILITY']], best: false },
  { id: 'longevity', name: 'Longevity', tag: '40+ · undulating, Z2 + VO2.', wks: 12, dpw: 4, dpwLabel: '3–4',
    pattern: [1,0,1,1,0,1,0], diff: 2,
    freq: { lift: 2, cardio: 3, cond: 0, nutrition: true, mobility: true },
    blocks: [{wks:6,color:IRON.push},{wks:6,color:IRON.pull}],
    tags: [['longevity','HEALTH'],['cardio','Z2 CARDIO']], best: false },
];

function PlanCard({ p, focused, sparse }) {
  return (
    <div style={{
      position: 'relative',
      background: focused ? IRON.accentFaint : 'rgb(var(--ft-surface))',
      border: focused ? `1px solid ${IRON.accent}` : `1px solid ${IRON.border}`,
      padding: '14px 14px 12px',
    }}>
      <BrassRib />
      {p.best && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontFamily: IRON.fontBody, fontSize: 9, letterSpacing: '.2em',
          textTransform: 'uppercase', color: IRON.accent,
        }}>
          BEST FIT
        </div>
      )}
      <div style={{
        fontFamily: IRON.fontDisplay, fontSize: 19, color: IRON.text,
        letterSpacing: '.04em', marginBottom: 2,
      }}>{p.name}</div>
      <div style={{
        fontFamily: IRON.fontBody, fontSize: 12,
        color: IRON.textSec, marginBottom: 10,
      }}>{p.tag}</div>

      {/* Frequency row */}
      <div style={{
        paddingTop: 10, marginTop: 4,
        borderTop: `1px dashed ${IRON.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, letterSpacing: '.3em' }}>
            FREQUENCY · PER WEEK
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: IRON.fontData, fontSize: 14, color: IRON.text }}>{p.wks}</span>
            <span style={{ fontFamily: IRON.fontBody, fontSize: 8, color: IRON.textTer, letterSpacing: '.18em' }}>WK</span>
            <span style={{ width: 1, height: 10, background: IRON.border, margin: '0 2px' }}/>
            <DifficultyBars level={p.diff} label={false}/>
          </div>
        </div>
        <FrequencyRow freq={p.freq}/>
      </div>

      {/* tags row */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10,
        paddingTop: 8, borderTop: `1px dashed ${IRON.border}`,
      }}>
        {p.tags.map(([k, v]) => <Tag key={v} kind={k}>{v}</Tag>)}
      </div>
    </div>
  );
}

// ─── Step 3 — List ───────────────────────────────────────────────
function Step3List({ sparse }) {
  // Filter chips at top
  const filters = sparse ? [] : ['STRONGER', '1+ YR', '4 D/WK', 'FULL GYM'];
  const plans = sparse ? PLANS : PLANS;
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative',
    }}>
      <div style={{ padding: '20px 22px 12px' }}>
        <div className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em', marginBottom: 12 }}>
          STEP 03 / 05 · {plans.length} GAMEPLANS
        </div>
        <IronH1 variant={4}>Pick a Gameplan.</IronH1>
        {filters.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {filters.map(f => <FilterChip key={f}>{f}</FilterChip>)}
          </div>
        )}
      </div>

      <div style={{
        flex: 1, overflow: 'hidden',
        padding: '0 22px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {plans.map(p => <PlanCard key={p.id} p={p} />)}
      </div>
      <CornerStamp />
    </div>
  );
}

// ─── Step 4 — Preview (Size & Strength) ──────────────────────────
function Step4Preview() {
  // Neutral chalk-toned palette — distinct from P/P/L (blue/green/red)
  // Block intensity expressed as warm tans / brass / cream / charcoal
  const blocks = [
    { name: 'Hypertrophy', short: 'HYP', wks: 4, color: IRON.accentBorder, tone: IRON.accentBorder },
    { name: 'Strength',    short: 'STR', wks: 4, color: IRON.accent, tone: IRON.accent },
    { name: 'Hypertrophy', short: 'HYP', wks: 4, color: IRON.accentBorder, tone: IRON.accentBorder },
    { name: 'Peak',        short: 'PK',  wks: 4, color: IRON.accent, tone: IRON.accent },
  ];
  // Build a flat list of 16 weeks, each tagged by block index
  const weeks = [];
  blocks.forEach((b, bi) => {
    for (let w = 0; w < b.wks; w++) weeks.push({ block: bi, weekInBlock: w });
  });

  const week = ['M','T','W','T','F','S','S'];
  const types = ['Push','Pull','—','Legs','Push','—','Pull'];
  const colors = [IRON.push,IRON.pull,null,IRON.legs,IRON.push,null,IRON.pull];
  const pattern = [1,1,0,1,1,0,1];

  return (
    <div style={{
      height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative',
    }}>
      <div style={{ padding: '18px 22px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: IRON.accent, fontSize: 14, cursor: 'pointer' }}>‹</span>
          <span className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em' }}>
            STEP 04 / 05
          </span>
        </div>
        <IronH1 variant={5} style={{ marginBottom: 6 }}>Size &amp; Strength</IronH1>
        <p style={{
          fontFamily: IRON.fontBody, fontSize: 13, margin: 0,
          color: IRON.textSec,
        }}>Block periodization workhorse for intermediates.</p>

        {/* At-a-glance stat row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto',
          gap: 14, alignItems: 'flex-end',
          marginTop: 12, paddingBottom: 12,
          borderBottom: `1px dashed ${IRON.border}`,
        }}>
          <div>
            <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, letterSpacing: '.25em', marginBottom: 4 }}>16 WEEKS · 4 BLOCKS</div>
            {/* Neutral weeks bar — chalk tones only */}
            <div style={{ display: 'flex', gap: 1, height: 8 }}>
              {weeks.map((w, i) => (
                <div key={i} style={{
                  flex: 1, height: '100%',
                  background: blocks[w.block].tone, opacity: .8,
                }}/>
              ))}
            </div>
          </div>
          <div>
            <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, letterSpacing: '.25em', marginBottom: 4 }}>4 D/WK</div>
            <DaysDots pattern={pattern} compact/>
          </div>
          <div>
            <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, letterSpacing: '.25em', marginBottom: 4 }}>DIFF</div>
            <DifficultyBars level={3} label={false}/>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 22px 12px' }}>
        {/* Block calendar — 16 weeks, 4 cols × 4 rows. Each cell = 1 week. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div className="ft-stamp" style={{ fontSize: 9, color: IRON.textTer, letterSpacing: '.25em' }}>BLOCK CALENDAR</div>
          <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, letterSpacing: '.25em' }}>1 CELL = 1 WEEK</div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          {[...new Map(blocks.map(b => [b.name, b])).values()].map(b => (
            <div key={b.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, background: b.tone, opacity: .85 }}/>
              <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.textSec, letterSpacing: '.18em', textTransform: 'uppercase' }}>{b.name}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(4, 1fr)',
          gap: 3, marginBottom: 14,
        }}>
          {/* Header row: WK 1-4 */}
          <div/>
          {[1,2,3,4].map(n => (
            <div key={n} style={{
              fontFamily: IRON.fontBody, fontSize: 8, letterSpacing: '.2em',
              color: IRON.textTer, textAlign: 'center', paddingBottom: 2,
            }}>WK {n}</div>
          ))}
          {/* 4 rows = 4 blocks */}
          {blocks.map((b, bi) => (
            <React.Fragment key={bi}>
              {/* Block label gutter */}
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                paddingRight: 8, borderRight: `1px dashed ${IRON.borderFaint}`,
              }}>
                <div style={{
                  fontFamily: IRON.fontDisplay, fontSize: 12,
                  color: IRON.text, letterSpacing: '.04em', lineHeight: 1,
                }}>{b.name}</div>
                <div style={{
                  fontFamily: IRON.fontBody, fontSize: 8, marginTop: 3,
                  color: b.tone, letterSpacing: '.2em', textTransform: 'uppercase',
                }}>{b.wks} WK</div>
              </div>
              {/* Week cells */}
              {Array.from({ length: 4 }).map((_, w) => {
                const weekNum = bi * 4 + w + 1;
                const isDeload = w === b.wks - 1; // mark last week as deload
                return (
                  <div key={w} style={{
                    aspectRatio: '1 / 1',
                    background: `${b.tone}${isDeload ? '14' : '26'}`,
                    border: `1px solid ${b.tone}${isDeload ? '55' : 'aa'}`,
                    borderTop: `3px solid ${b.tone}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span style={{
                      fontFamily: IRON.fontData, fontWeight: 500, fontSize: 18,
                      color: IRON.text, lineHeight: 1,
                    }}>{weekNum}</span>
                    {isDeload && (
                      <span style={{
                        fontFamily: IRON.fontBody, fontSize: 7,
                        color: b.tone, letterSpacing: '.18em', marginTop: 1,
                        textTransform: 'uppercase',
                      }}>DELOAD</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Sample week */}
        <div className="ft-stamp" style={{ fontSize: 9, color: IRON.textTer, marginBottom: 6, letterSpacing: '.25em' }}>SAMPLE WEEK</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 14 }}>
          {week.map((d, i) => (
            <div key={i} style={{
              padding: '6px 0',
              background: colors[i] ? `${colors[i]}22` : 'rgba(255,255,255,.02)',
              borderTop: colors[i] ? `2px solid ${colors[i]}` : `2px solid ${IRON.borderFaint}`,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.textSec, letterSpacing: '.1em' }}>{d}</div>
              <div style={{ fontFamily: IRON.fontBody, fontSize: 9, color: colors[i] || IRON.textTer, textTransform: 'uppercase', fontWeight: 500, letterSpacing: '.05em', marginTop: 2 }}>
                {types[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Nutrition — calorie scale viz */}
        <IronCard padding={12} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2, paddingTop: 4 }}>
            <div className="ft-stamp" style={{ fontSize: 9, color: IRON.accent, letterSpacing: '.25em' }}>NUTRITION</div>
            <div style={{ fontFamily: IRON.fontBody, fontSize: 10, color: IRON.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              vs maintenance
            </div>
          </div>
          <CalorieScale delta={150} range={[50, 250]}/>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 6, borderTop: `1px dashed ${IRON.borderFaint}`,
            fontFamily: IRON.fontBody, fontSize: 11, color: IRON.text,
          }}>
            <span>~1 g protein / lb</span>
            <span style={{ color: IRON.textTer }}>·</span>
            <span>Macros tracked</span>
          </div>
        </IronCard>

        {/* Lifestyle picks */}
        <IronCard padding={12} style={{ marginBottom: 10 }}>
          <div className="ft-stamp" style={{ fontSize: 9, color: IRON.accent, marginBottom: 6, paddingTop: 4, letterSpacing: '.25em' }}>LIFESTYLE PICKS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag kind="recovery">SLEEP · 7.5 H</Tag>
            <Tag kind="strength">STRESS · ≤3</Tag>
            <Tag kind="hypertrophy">PROTEIN · 4×</Tag>
          </div>
        </IronCard>

        {/* Goals it'll generate */}
        <IronCard padding={12} style={{ marginBottom: 14 }}>
          <div className="ft-stamp" style={{ fontSize: 9, color: IRON.accent, marginBottom: 6, paddingTop: 4, letterSpacing: '.25em' }}>GOALS IT'LL GENERATE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {['Bench 1RM · +20 lb · 16 wk','Squat 1RM · +30 lb · 16 wk','Body weight · +6 lb lean · 16 wk'].map(g => (
              <div key={g} style={{
                fontFamily: IRON.fontBody, fontSize: 12, color: IRON.text,
                paddingLeft: 10, borderLeft: `2px solid ${IRON.accent}`,
              }}>{g}</div>
            ))}
          </div>
        </IronCard>
      </div>

      <div style={{ padding: '0 22px 18px', borderTop: `1px dashed ${IRON.border}`, paddingTop: 12 }}>
        <IronBtn primary full>Customize and start</IronBtn>
        <IronBtn ghost full style={{ marginTop: 6 }}>Pick another</IronBtn>
      </div>
      <CornerStamp />
    </div>
  );
}

// ─── Step 5 — Setup ──────────────────────────────────────────────
// Field heading icons — small chalk-line glyphs to break up the form.
function FieldIcon({ kind, size = 14, color = IRON.accent }) {
  const s = { width: size, height: size, display: 'block' };
  const stroke = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'calendar') return (
    <svg viewBox="0 0 24 24" style={s}>
      <rect x="3" y="5" width="18" height="16" {...stroke}/>
      <line x1="3" y1="10" x2="21" y2="10" {...stroke}/>
      <line x1="8" y1="3" x2="8" y2="7" {...stroke}/>
      <line x1="16" y1="3" x2="16" y2="7" {...stroke}/>
    </svg>
  );
  if (kind === 'days') return (
    <svg viewBox="0 0 24 24" style={s}>
      <rect x="3" y="6" width="4" height="12" {...stroke}/>
      <rect x="10" y="6" width="4" height="12" {...stroke}/>
      <rect x="17" y="6" width="4" height="12" {...stroke}/>
    </svg>
  );
  if (kind === 'scale') return (
    <svg viewBox="0 0 24 24" style={s}>
      <rect x="3" y="4" width="18" height="16" {...stroke}/>
      <circle cx="12" cy="12" r="4" {...stroke}/>
      <line x1="12" y1="10" x2="14" y2="8" {...stroke}/>
    </svg>
  );
  if (kind === 'barbell') return (
    <svg viewBox="0 0 24 24" style={s}>
      <line x1="3" y1="12" x2="21" y2="12" {...stroke}/>
      <rect x="2" y="8" width="2" height="8" {...stroke}/>
      <rect x="20" y="8" width="2" height="8" {...stroke}/>
      <rect x="5" y="6" width="2.5" height="12" {...stroke}/>
      <rect x="16.5" y="6" width="2.5" height="12" {...stroke}/>
    </svg>
  );
  return null;
}

// Bodyweight projection graph — current → target over time (weeks).
// Returns a small SVG line chart with the recommended band shaded.
// Auto-flags when projected rate exits the recommended range.
function BodyWeightChart({ start, target, weeks, height = 90 }) {
  const W = 320, H = height;
  const padL = 28, padR = 10, padT = 8, padB = 18;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const totalDelta = target - start;        // lb
  const ratePerWk = totalDelta / weeks;     // lb/wk (signed)

  // Recommended ranges (as % of body weight per week, simplified)
  // Lean gain: 0.25 – 0.75 lb/wk for ~178 lb. Cut: -1 to -0.5 lb/wk.
  const recMax = totalDelta >= 0 ?  0.75 :  -0.25;
  const recMin = totalDelta >= 0 ?  0.25 :  -1.00;
  const rate = ratePerWk;

  // Are we in band?
  const inBand = totalDelta >= 0
    ? rate >= recMin && rate <= recMax
    : rate <= recMin && rate >= recMax;
  const tooFast = totalDelta >= 0 ? rate > recMax : rate < recMax;
  const tooSlow = totalDelta >= 0 ? rate < recMin : rate > recMin;
  const status = inBand ? 'SUSTAINABLE' : tooFast ? 'TOO AGGRESSIVE' : 'VERY GRADUAL';
  const color = inBand ? IRON.pull : tooFast ? IRON.legs : IRON.core;

  // Y range — pad ±2 lb around min/max of (start, target, recBand projection)
  const recEndHi = start + recMax * weeks;
  const recEndLo = start + recMin * weeks;
  const yMin = Math.min(start, target, recEndHi, recEndLo) - 1.5;
  const yMax = Math.max(start, target, recEndHi, recEndLo) + 1.5;

  const xAt = (w) => padL + (w / weeks) * innerW;
  const yAt = (lb) => padT + (1 - (lb - yMin) / (yMax - yMin)) * innerH;

  // recommended-band polygon
  const bandPath = `M ${xAt(0)} ${yAt(start)}
                    L ${xAt(weeks)} ${yAt(recEndHi)}
                    L ${xAt(weeks)} ${yAt(recEndLo)}
                    L ${xAt(0)} ${yAt(start)} Z`;

  return (
    <div style={{ position: 'relative', marginTop: 6 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* grid background */}
        <rect x={padL} y={padT} width={innerW} height={innerH} fill="rgba(0,0,0,.18)" stroke={IRON.borderFaint}/>
        {/* dashed mid line */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={padL} x2={padL + innerW} y1={padT + innerH * t} y2={padT + innerH * t} stroke={IRON.borderFaint} strokeDasharray="2 3"/>
        ))}
        {/* recommended band */}
        <path d={bandPath} fill="rgba(92,184,92,.14)" stroke="rgba(92,184,92,.5)" strokeDasharray="3 3" strokeWidth=".8"/>
        <text x={padL + innerW - 4} y={yAt(recEndHi) - 3} textAnchor="end" fontFamily="Oswald" fontSize="7" fill="rgba(92,184,92,.7)" letterSpacing=".15em">RECOMMENDED</text>

        {/* projected line */}
        <line x1={xAt(0)} y1={yAt(start)} x2={xAt(weeks)} y2={yAt(target)}
              stroke={color} strokeWidth="1.8" />
        {/* start dot */}
        <circle cx={xAt(0)} cy={yAt(start)} r="3" fill={IRON.text}/>
        <text x={xAt(0) - 4} y={yAt(start) + 3} textAnchor="end" fontFamily="Teko" fontSize="11" fill={IRON.text}>{start}</text>
        {/* target dot */}
        <circle cx={xAt(weeks)} cy={yAt(target)} r="3" fill={color}/>
        <text x={xAt(weeks) + 4} y={yAt(target) + 3} fontFamily="Teko" fontSize="11" fill={color}>{target}</text>

        {/* axis ticks */}
        <text x={padL} y={H - 4} fontFamily="Oswald" fontSize="7" fill={IRON.textTer} letterSpacing=".2em">WK 0</text>
        <text x={padL + innerW} y={H - 4} textAnchor="end" fontFamily="Oswald" fontSize="7" fill={IRON.textTer} letterSpacing=".2em">WK {weeks}</text>
        <text x={padL - 4} y={padT + 6} textAnchor="end" fontFamily="Oswald" fontSize="7" fill={IRON.textTer} letterSpacing=".15em">LB</text>
      </svg>

      {/* legend / verdict */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: IRON.fontNumber || IRON.fontData, fontSize: 18, color: color, fontVariantNumeric: 'tabular-nums' }}>
            {rate >= 0 ? '+' : ''}{rate.toFixed(2)}
          </span>
          <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: IRON.textTer, letterSpacing: '.18em' }}>LB / WK</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', border: `1px solid ${color}80`,
          background: `${color}1a`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }}/>
          <span style={{ fontFamily: IRON.fontBody, fontSize: 9, color: color, letterSpacing: '.22em' }}>
            {status}
          </span>
        </div>
      </div>
      {!inBand && (
        <div style={{
          marginTop: 5, padding: '5px 8px',
          background: `${color}15`, borderLeft: `2px solid ${color}`,
          fontFamily: IRON.fontBody, fontSize: 10, color: IRON.text, lineHeight: 1.4,
        }}>
          {tooFast
            ? `Above the recommended ${recMin.toFixed(2)}–${recMax.toFixed(2)} lb/wk band. Extend timeline to stay lean.`
            : `Below recommended pace — slower than necessary. Tighten the deadline if you want results sooner.`}
        </div>
      )}
    </div>
  );
}

// ─── Step 5 — Setup ──────────────────────────────────────────────
function FieldRow({ label, kicker, icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {kicker && <div className="ft-stamp" style={{ fontSize: 9, color: IRON.textTer, letterSpacing: '.25em', marginBottom: 4 }}>{kicker}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        marginBottom: 6,
      }}>
        {icon && <FieldIcon kind={icon} size={14}/>}
        <div style={{
          fontFamily: IRON.fontBody, fontSize: 13, fontWeight: 500,
          color: IRON.text,
        }}>{label}</div>
      </div>
      {children}
    </div>
  );
}

function Segments({ items, active }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${IRON.border}` }}>
      {items.map(i => (
        <div key={i} style={{
          flex: 1, padding: '10px 0', textAlign: 'center',
          background: i === active ? IRON.borderFaint : 'transparent',
          color: i === active ? IRON.accent : IRON.textSec,
          fontFamily: IRON.fontData, fontSize: 18, fontWeight: 500,
          borderRight: i === items[items.length-1] ? 'none' : `1px solid ${IRON.borderFaint}`,
          cursor: 'pointer',
        }}>{i}</div>
      ))}
    </div>
  );
}

function NumInput({ value, unit, w = '100%' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 4,
      border: `1px solid ${IRON.border}`, padding: '8px 12px',
      width: w, background: 'rgba(0,0,0,.18)',
    }}>
      <Data size={20} style={{ color: IRON.text }}>{value}</Data>
      {unit && <span style={{ fontFamily: IRON.fontBody, fontSize: 11, color: IRON.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>{unit}</span>}
    </div>
  );
}

function Step5Setup() {
  return (
    <div style={{
      height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative',
    }}>
      <div style={{ padding: '18px 22px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: IRON.accent, fontSize: 14, cursor: 'pointer' }}>‹</span>
          <span className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em' }}>
            STEP 05 / 05 · SIZE & STRENGTH
          </span>
        </div>
        <IronH1 variant={6}>Let's set you up.</IronH1>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 22px' }}>
        <FieldRow label="Start date" kicker="01" icon="calendar">
          <div style={{
            border: `1px solid ${IRON.border}`, padding: '8px 12px',
            background: 'rgba(0,0,0,.18)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Data size={18} style={{ color: IRON.text }}>MON · APR 27</Data>
            <span style={{ color: IRON.accentBorder, fontSize: 11, fontFamily: IRON.fontBody, letterSpacing: '.1em' }}>EDIT</span>
          </div>
        </FieldRow>

        <FieldRow label="Days per week" kicker="02" icon="days">
          <Segments items={['3','4','5','6']} active="4"/>
        </FieldRow>

        <FieldRow label="Body weight goal" kicker="03 · OPTIONAL" icon="scale">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, marginBottom: 2 }}>CURRENT</div>
              <NumInput value="178.4" unit="LB"/>
            </div>
            <div>
              <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, marginBottom: 2 }}>TARGET</div>
              <NumInput value="184.0" unit="LB"/>
            </div>
            <div>
              <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, marginBottom: 2 }}>BY</div>
              <NumInput value="AUG 17" unit=""/>
            </div>
          </div>
          <BodyWeightChart start={178.4} target={184.0} weeks={16}/>
        </FieldRow>

        <FieldRow label="Strength goal" kicker="04 · OPTIONAL" icon="barbell">
          <div style={{
            border: `1px solid ${IRON.border}`, padding: '8px 12px', marginBottom: 8,
            background: 'rgba(0,0,0,.18)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Data size={16} style={{ color: IRON.text }}>BENCH PRESS</Data>
            <span style={{ color: IRON.accentBorder, fontSize: 11, fontFamily: IRON.fontBody, letterSpacing: '.1em' }}>CHANGE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, marginBottom: 2 }}>CURRENT 1RM</div>
              <NumInput value="245" unit="LB"/>
            </div>
            <div>
              <div className="ft-stamp" style={{ fontSize: 8, color: IRON.textTer, marginBottom: 2 }}>TARGET 1RM</div>
              <NumInput value="265" unit="LB"/>
            </div>
          </div>
        </FieldRow>
      </div>

      <div style={{ padding: '14px 22px 18px' }}>
        <IronBtn primary full>Start Gameplan</IronBtn>
      </div>
      <CornerStamp />
    </div>
  );
}

// ─── State variant — Empty filter result ─────────────────────────
function StateEmptyFilter() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative',
    }}>
      <div style={{ padding: '20px 22px 12px' }}>
        <div className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em', marginBottom: 12 }}>
          STEP 03 / 05 · NO EXACT MATCH
        </div>
        <IronH1 variant={2}>Closest fit.</IronH1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          <FilterChip>COMEBACK</FilterChip>
          <FilterChip>6 D/WK</FilterChip>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 22px' }}>
        <div style={{
          border: `1px dashed ${IRON.border}`, padding: '14px',
          marginBottom: 14, background: 'rgba(217,83,79,.05)',
        }}>
          <div className="ft-stamp" style={{ fontSize: 9, color: IRON.legs, letterSpacing: '.2em', marginBottom: 4 }}>NO MATCH</div>
          <div style={{ fontFamily: IRON.fontBody, fontSize: 12, color: IRON.text, lineHeight: 1.5 }}>
            6 days/week is too much volume for a Comeback plan. Try 3 days, or pick the closest fit below.
          </div>
        </div>

        <div className="ft-stamp" style={{ fontSize: 9, color: IRON.textTer, marginBottom: 8, letterSpacing: '.25em' }}>
          CLOSEST FIT
        </div>
        <PlanCard p={PLANS[6]}/>

        <div style={{
          marginTop: 16, padding: '10px 0',
          textAlign: 'center', borderTop: `1px dashed ${IRON.border}`,
          fontFamily: IRON.fontBody, fontSize: 12,
          color: IRON.accent, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
        }}>
          ← Broaden filter
        </div>
      </div>
      <CornerStamp />
    </div>
  );
}

// ─── State variant — Filter skipped, all 8 ──────────────────────
function StateFilterSkipped() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgb(var(--ft-bg))', position: 'relative',
    }}>
      <div style={{ padding: '20px 22px 12px' }}>
        <div className="ft-stamp" style={{ color: IRON.accent, fontSize: 9, letterSpacing: '.3em', marginBottom: 12 }}>
          STEP 03 / 05 · ALL 8 GAMEPLANS
        </div>
        <IronH1 variant={5}>Pick a Gameplan.</IronH1>
        <div style={{
          fontFamily: IRON.fontBody, fontSize: 11,
          color: IRON.textTer, letterSpacing: '.05em', marginTop: 2,
        }}>
          Filter skipped · showing all
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 22px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PLANS.map(p => (
          <div key={p.id} style={{
            position: 'relative',
            background: 'rgb(var(--ft-surface))',
            border: `1px solid ${IRON.borderFaint}`,
            padding: '8px 12px 10px',
          }}>
            <BrassRib />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
              <div style={{ flex: 1, fontFamily: IRON.fontDisplay, fontSize: 14, color: IRON.text, letterSpacing: '.04em' }}>{p.name}</div>
              <DifficultyBars level={p.diff} label={false}/>
              <span style={{ color: IRON.accent, fontSize: 14 }}>›</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <WeeksBar weeks={p.wks} blocks={p.blocks} height={5} showLabel={false}/>
              </div>
              <DaysDots pattern={p.pattern} compact/>
            </div>
          </div>
        ))}
      </div>
      <CornerStamp />
    </div>
  );
}

Object.assign(window, {
  Step1Welcome, Step2Filter, Step3List, Step4Preview, Step5Setup,
  StateEmptyFilter, StateFilterSkipped,
});
