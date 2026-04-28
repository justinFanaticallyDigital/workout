// Planning Mode Sandbox — Blueprint theme
// All screens render inside a 390×800 phone frame.


// ─── Theme bridge ──────────────────────────────────────────────
// Originally written for Blueprint. Now reads from theme-bridge.jsx so it
// can render in any of the 7 FitTrack themes. The host calls
// setActivePlanningTheme('blueprint'|'lab'|...) before render.
let BP = window.getFitTrackTheme ? window.getFitTrackTheme('blueprint') : {};
function _resolvePlanningTheme(themeId) {
  return window.getFitTrackTheme(themeId);
}
function setActivePlanningTheme(themeId) {
  BP = _resolvePlanningTheme(themeId);
}
window.setActivePlanningTheme = setActivePlanningTheme;

const { useState: usePMState, useMemo: usePMMemo } = React;

// ─── Shared typography (bound to BP) ─────────────────────────
// Marker → fontDisplay, Reenie → fontNumber||fontBody, Archivo → fontData.
// stripTilt drops transforms on non-graffiti themes — used for rotated stamps.
const _BP_TYPO = window.makeFitTrackTypography(() => BP);
const Marker = _BP_TYPO.Marker;
const Reenie = _BP_TYPO.Reenie;
const Archivo = _BP_TYPO.Archivo;
const stripTilt = _BP_TYPO.stripTilt;
const isGraffitiBP = _BP_TYPO.isGraffiti;
const isBlueprint = () => BP.chrome === 'blueprint';

// ─── Movement colors (constant across themes) ──────────────
const PM_MOVE = {
  push: BP.push,
  pull: BP.pull,
  legs: BP.legs,
  core: BP.core,
};

// ─── Crosshair corner mark (drafting target) ───────────────
function Crosshair({ size = 10, color = BP.textTer, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ position: 'absolute', ...style }}>
      <path d={`M5 0 L5 10 M0 5 L10 5`} stroke={color} strokeWidth="1" />
    </svg>
  );
}

// ─── Card wrapper with crosshair corners ───────────────────
function BPCard({ children, style, label, accent }) {
  const cardStyle = {
    position: 'relative',
    background: BP.surface,
    border: `1px solid ${BP.border}`,
    color: BP.text,
    padding: '14px 14px 12px',
    ...(accent ? { boxShadow: `inset 0 0 0 1px ${BP.accentBorder}, 0 0 0 1px ${BP.accentFaint}` } : {}),
    ...style,
  };
  return (
    <div style={cardStyle}>
      <Crosshair style={{ top: -5, left: -5 }} />
      <Crosshair style={{ top: -5, right: -5 }} />
      <Crosshair style={{ bottom: -5, left: -5 }} />
      <Crosshair style={{ bottom: -5, right: -5 }} />
      {label ? (
        <div style={{
          position: 'absolute', top: -8, left: 12,
          background: BP.surface,
          fontFamily: BP.fontBody,
          fontSize: 8, letterSpacing: '.18em',
          padding: '0 6px',
          color: BP.textSec,
        }}>{label}</div>
      ) : null}
      {children}
    </div>
  );
}

// ─── Dashed divider ─────────────────────────────────────────
function Dashed({ color = BP.borderStrong, style }) {
  return (
    <div style={{
      height: 1,
      backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%)`,
      backgroundSize: '6px 1px',
      backgroundRepeat: 'repeat-x',
      ...style,
    }}/>
  );
}
function DashedV({ color, style }) {
  const c = color ?? BP.borderStrong ?? BP.border;
  return (
    <div style={{
      width: 1,
      backgroundImage: `linear-gradient(0deg, ${color} 50%, transparent 50%)`,
      backgroundSize: '1px 6px',
      backgroundRepeat: 'repeat-y',
      ...style,
    }}/>
  );
}

// ─── DWG title block strip (bottom edge metadata) ──────────
function DWGStrip({ vNum = 'v2', user = 'USR-7723' }) {
  return (
    <div style={{
      borderTop: `1px solid ${BP.borderStrong}`,
      background: BP.bgAlt,
      fontFamily: BP.fontBody,
      fontSize: 7,
      letterSpacing: '.12em',
      color: BP.textOnBg,
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr 1fr .7fr',
      lineHeight: 1.3,
    }}>
      <div style={{ padding: '4px 8px', borderRight: `1px solid ${BP.borderStrong}` }}>
        <div style={{ opacity: .55, fontSize: 6 }}>DWG</div>
        <div style={{ fontWeight: 700 }}>GAMEPLAN-DRAFT-{vNum}</div>
      </div>
      <div style={{ padding: '4px 8px', borderRight: `1px solid ${BP.borderStrong}` }}>
        <div style={{ opacity: .55, fontSize: 6 }}>USER</div>
        <div style={{ fontWeight: 700 }}>{user}</div>
      </div>
      <div style={{ padding: '4px 8px', borderRight: `1px solid ${BP.borderStrong}` }}>
        <div style={{ opacity: .55, fontSize: 6 }}>DATE</div>
        <div style={{ fontWeight: 700 }}>2026-04-25</div>
      </div>
      <div style={{ padding: '4px 8px', textAlign: 'right' }}>
        <div style={{ opacity: .55, fontSize: 6 }}>SHT</div>
        <div style={{ fontWeight: 700 }}>1/1</div>
      </div>
    </div>
  );
}

// ─── PLANNING MODE stamp (rotated) ─────────────────────────
// Rotation only renders on graffiti — stripTilt flattens it elsewhere.
// On blueprint the stamp gets the cyan stencil, on other themes it falls
// back to a flat themed pill.
function PlanningStamp({ small }) {
  const fs = small ? 8 : 10;
  const onBlueprint = isBlueprint();
  const baseStyle = {
    display: 'inline-block',
    border: onBlueprint ? `1.5px solid ${BP.accentBorder}` : `1px solid ${BP.accentBorder}`,
    color: BP.accent,
    padding: small ? '2px 6px' : '4px 9px',
    fontFamily: BP.fontDisplay,
    fontSize: fs,
    letterSpacing: '.22em',
    transform: 'rotate(-3deg)',
    background: onBlueprint ? BP.accentFaint : (BP.accentBg || BP.accentFaint),
    whiteSpace: 'nowrap',
  };
  return <div style={stripTilt(baseStyle)}>PLANNING MODE</div>;
}

// ─── Pill button (outline) ─────────────────────────────────
function PillBtn({ children, primary, ghost, size = 'md', style, accent, disabled }) {
  const pad = size === 'sm' ? '5px 10px' : size === 'lg' ? '10px 18px' : '7px 14px';
  const fs = size === 'sm' ? 9 : size === 'lg' ? 12 : 10;
  let border = `1px solid ${BP.borderStrong}`;
  let bg = 'transparent';
  let color = BP.textOnBg;
  if (primary) { border = `1.5px solid ${BP.accent}`; color = BP.accent; bg = BP.accentFaint; }
  if (ghost)   { border = `1px dashed ${BP.borderStrong}`; color = BP.textOnBgSec; }
  if (disabled) { color = BP.textOnBgTer; border = `1px dashed ${BP.borderFaint || BP.border}`; }
  return (
    <button disabled={disabled} style={{
      border, background: bg, color,
      padding: pad,
      fontFamily: BP.fontBody,
      fontSize: fs, letterSpacing: '.14em',
      textTransform: 'uppercase',
      borderRadius: 999,
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</button>
  );
}

// ─── Sandbox header ────────────────────────────────────────
function SandboxHeader({ pending = 4, applyDisabled = false, recommendation = false }) {
  return (
    <div style={{
      position: 'relative',
      padding: '12px 14px 10px',
      borderBottom: `1px solid ${BP.borderStrong}`,
      background: BP.bgAlt,
    }}>
      {/* Stamp top-right */}
      <div style={{ position: 'absolute', top: 8, right: 12 }}>
        <PlanningStamp />
      </div>

      <div style={{
        fontFamily: BP.fontDisplay,
        fontSize: 13, letterSpacing: '.05em',
        color: BP.textOnBg,
      }}>edit gameplan</div>

      <div style={{
        fontFamily: BP.fontBody,
        fontSize: 9, letterSpacing: '.18em',
        color: BP.textOnBgSec, marginTop: 2, fontWeight: 600,
      }}>
        SUMMER CUT · BLOCK 2 / 4 · WK 7
      </div>

      {/* Pending counter + buttons row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <div style={{
          fontFamily: BP.fontBody,
          fontSize: 10,
          color: applyDisabled ? BP.textOnBgTer : BP.accent,
          border: `1px solid ${applyDisabled ? BP.borderFaint : BP.accentBorder}`,
          padding: '4px 8px',
          letterSpacing: '.1em',
        }}>
          [{String(pending).padStart(2,'0')}] {pending === 1 ? 'CHANGE' : 'CHANGES'} PENDING
        </div>
        <div style={{ flex: 1 }} />
        <PillBtn size="sm" ghost>Discard</PillBtn>
        <PillBtn size="sm" primary disabled={applyDisabled}>Apply ↗</PillBtn>
      </div>

      <div style={{ marginTop: 6 }}>
        <button style={{
          background: 'transparent', border: 'none',
          fontFamily: BP.fontBody,
          fontSize: 9, letterSpacing: '.12em',
          color: BP.textOnBgSec, fontWeight: 600,
          textDecoration: 'underline dashed',
          textUnderlineOffset: 3,
          padding: 0, cursor: 'pointer',
        }}>↺ reset to original</button>
      </div>
    </div>
  );
}

// ─── Recommendation banner ─────────────────────────────────
function RecommendationBanner() {
  return (
    <div style={{
      position: 'relative',
      margin: '10px 12px 0',
      padding: '9px 11px 9px 32px',
      border: `1px solid ${BP.accentBorder}`,
      background: BP.accentFaint,
      fontFamily: BP.fontBody,
      fontSize: 10,
      lineHeight: 1.4,
      color: BP.textOnBg,
    }}>
      <div style={{
        position: 'absolute', left: 8, top: 8,
        width: 18, height: 18,
        border: `1px solid ${BP.accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: BP.fontDisplay,
        fontSize: 11,
        color: BP.accent,
      }}>!</div>
      <div style={{
        fontFamily: BP.fontDisplay,
        fontSize: 9, letterSpacing: '.18em',
        color: BP.accent,
      }}>recommendation pre-staged</div>
      <div style={{ marginTop: 3 }}>
        Drop calories <b>−100/day</b> to get back on track. Field highlighted below.
      </div>
    </div>
  );
}

// ─── Section switcher (segmented tabs) ─────────────────────
function SectionTabs({ active = 'Goals' }) {
  const tabs = ['Goals', 'Timeline', 'Nutrition', 'Training', 'Lifestyle'];
  return (
    <div style={{
      display: 'flex',
      borderTop: `1px solid ${BP.borderStrong}`,
      borderBottom: `1px solid ${BP.borderStrong}`,
      background: BP.bgAlt,
      overflowX: 'auto',
    }}>
      {tabs.map((t, i) => {
        const isActive = t === active;
        const muted = t === 'Training' || t === 'Lifestyle';
        return (
          <div key={t} style={{
            position: 'relative',
            flex: 1,
            padding: '8px 4px 7px',
            textAlign: 'center',
            fontFamily: BP.fontBody,
            fontSize: 9,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: isActive ? BP.textOnBg : muted ? BP.textOnBgTer : BP.textOnBgSec,
            fontWeight: isActive ? 700 : 500,
            borderRight: i < tabs.length - 1 ? `1px dashed ${BP.borderFaint || BP.border}` : 'none',
            background: isActive ? BP.surface : 'transparent',
          }}>
            {isActive ? <span style={{ color: BP.accent }}>▸ </span> : null}{t}
            {isActive ? (
              <div style={{
                position: 'absolute', bottom: -1, left: '15%', right: '15%',
                height: 2, background: BP.accent,
              }}/>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ─── Goal card ─────────────────────────────────────────────
function GoalCard({ name, current, target, delta, date, rate, status, highlighted }) {
  const statusColor = status === 'aggressive' ? BP.core
                    : status === 'danger' ? BP.legs
                    : BP.pull;
  return (
    <BPCard style={{ margin: '10px 12px 0' }} accent={highlighted}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: BP.fontDisplay,
          fontSize: 11, letterSpacing: '.12em',
        }}>{name}</div>
        <div style={{
          fontFamily: BP.fontBody,
          fontSize: 8, color: BP.textTer, letterSpacing: '.15em',
        }}>GOAL · ACTIVE</div>
      </div>

      <Dashed style={{ margin: '8px 0' }}/>

      {/* current → target row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr',
        alignItems: 'end', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>CURRENT</div>
          <Reenie style={{ display: 'block', fontSize: 22, fontWeight: 700, color: BP.text }}>{current}</Reenie>
        </div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 18, color: BP.textTer, paddingBottom: 2 }}>→</div>
        <div style={{
          border: `1px solid ${BP.accentBorder}`,
          padding: '4px 8px',
          background: BP.accentFaint,
        }}>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.accent, fontFamily: BP.fontBody }}>TARGET</div>
          <Reenie style={{ display: 'block', fontSize: 22, fontWeight: 700, color: BP.accent }}>{target}</Reenie>
        </div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 14, color: BP.textTer, paddingBottom: 4 }}>Δ</div>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>DELTA</div>
          <Reenie style={{ display: 'block', fontSize: 19, fontWeight: 700, color: BP.pull }}>{delta}</Reenie>
        </div>
      </div>

      <Dashed style={{ margin: '10px 0 8px' }}/>

      {/* Date row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>TARGET DATE</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            border: `1px dashed ${BP.border}`,
            padding: '3px 8px', marginTop: 2,
            fontFamily: BP.fontBody, fontSize: 11,
          }}>
            <svg width="9" height="9" viewBox="0 0 9 9"><rect x=".5" y="1.5" width="8" height="7" fill="none" stroke="currentColor"/><path d="M0 3.5 H9 M3 0 V2 M6 0 V2" stroke="currentColor"/></svg>
            {date}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>COMPUTED RATE</div>
          <Reenie style={{ display: 'block', fontSize: 13, fontWeight: 700, color: statusColor, marginTop: 2 }}>{rate}</Reenie>
          <div style={{ fontSize: 8, color: statusColor, fontFamily: BP.fontBody, letterSpacing: '.1em', textTransform: 'uppercase' }}>· {status}</div>
        </div>
      </div>
    </BPCard>
  );
}

// ─── Inline warning ────────────────────────────────────────
function Warning({ kind = 'yellow', children }) {
  const c = kind === 'red' ? BP.legs : BP.core;
  const bg = kind === 'red' ? 'rgba(217,83,79,.18)' : 'rgba(240,173,78,.22)';
  const textColor = kind === 'red' ? '#7A1F1B' : '#6B4A0F';
  return (
    <div style={{
      margin: '6px 12px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 7,
      padding: '7px 9px',
      borderLeft: `3px solid ${c}`,
      border: `1px solid ${c}`,
      borderLeftWidth: 3,
      background: bg,
      fontFamily: BP.fontBody,
      fontSize: 10,
      lineHeight: 1.35,
      color: textColor,
      fontWeight: 600,
    }}>
      <span style={{
        border: `1.5px solid ${c}`, background: c, color: '#fff',
        width: 13, height: 13, fontSize: 9,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1, fontWeight: 800,
      }}>!</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Block timeline (drag-able blocks with ghost overlay) ──
function BlockTimeline({ showGhost = true }) {
  // Original blocks: B1=4, B2=4, B3=4, B4=4 -> 16wk
  // Draft blocks: B1=4, B2=5 (extended), B2.5=1 deload, B3=4, B4=4 -> 18wk
  const original = [
    { name: 'BLOCK 1 · ACCUM', wks: 4, color: BP.pull },
    { name: 'BLOCK 2 · INTENS', wks: 4, color: BP.push },
    { name: 'BLOCK 3 · PEAK',   wks: 4, color: BP.core },
    { name: 'BLOCK 4 · TEST',   wks: 4, color: BP.legs },
  ];
  const draft = [
    { name: 'BLOCK 1', wks: 4, color: BP.pull, kind: 'block' },
    { name: 'BLOCK 2', wks: 5, color: BP.push, kind: 'block', changed: true },
    { name: 'DLD',     wks: 1, color: BP.textSec, kind: 'deload', added: true },
    { name: 'BLOCK 3', wks: 4, color: BP.core, kind: 'block' },
    { name: 'BLOCK 4', wks: 4, color: BP.legs, kind: 'block' },
  ];
  const trackW = 320;
  const totalOrig = 16;
  const totalDraft = 18;

  return (
    <BPCard style={{ margin: '10px 12px 0' }} label="TIMELINE · 16WK → 18WK">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: BP.fontDisplay, fontSize: 10 }}>periodization</div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 9, color: BP.accent }}>
          +2 wk · +1 deload
        </div>
      </div>

      <Dashed style={{ margin: '8px 0' }}/>

      {/* ORIGINAL row */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 7, letterSpacing: '.18em', fontFamily: BP.fontBody,
          color: BP.textTer, marginBottom: 4,
        }}>ORIGINAL · 16 WK</div>
        <div style={{ display: 'flex', height: 22, gap: 1, opacity: .55 }}>
          {original.map((b, i) => (
            <div key={i} style={{
              flex: b.wks,
              background: 'transparent',
              border: `1px dashed ${b.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: BP.fontBody, fontSize: 8,
              letterSpacing: '.1em',
              color: b.color,
            }}>{b.wks}w</div>
          ))}
        </div>
      </div>

      {/* DRAFT row */}
      <div>
        <div style={{
          fontSize: 7, letterSpacing: '.18em', fontFamily: BP.fontBody,
          color: BP.accent, marginBottom: 4,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>DRAFT · 18 WK</span>
          <span style={{ color: BP.textTer }}>DRAG ↔ EDGES</span>
        </div>
        <div style={{ display: 'flex', height: 28, gap: 1, position: 'relative' }}>
          {draft.map((b, i) => (
            <div key={i} style={{
              flex: b.wks,
              background: b.kind === 'deload' ? `repeating-linear-gradient(45deg, ${BP.border} 0 3px, transparent 3px 6px)` : `${b.color}30`,
              border: `${b.changed || b.added ? '1.5px' : '1px'} solid ${b.color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: BP.fontBody, fontSize: 7,
              letterSpacing: '.06em',
              color: b.color,
              position: 'relative',
            }}>
              <div style={{ fontWeight: 700 }}>{b.name}</div>
              <div style={{ fontSize: 8, opacity: .85 }}>{b.wks}w</div>
              {b.changed ? (
                <div style={{ position: 'absolute', top: -7, right: -3, fontSize: 9, color: BP.accent }}>+1w</div>
              ) : null}
              {b.added ? (
                <div style={{ position: 'absolute', top: -7, left: -3, fontSize: 9, color: BP.accent }}>＋NEW</div>
              ) : null}
              {/* drag handles */}
              {i < draft.length - 1 ? (
                <div style={{
                  position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)',
                  width: 8, height: 14,
                  background: BP.text,
                  border: `1px solid ${BP.borderStrong || BP.border}`,
                  cursor: 'ew-resize', zIndex: 2,
                }}/>
              ) : null}
            </div>
          ))}
        </div>
        {/* week scale */}
        <div style={{
          display: 'flex', marginTop: 4,
          fontFamily: BP.fontBody, fontSize: 7,
          color: BP.textTer,
          letterSpacing: '.1em',
        }}>
          {[0,4,9,10,14,18].map((w, i) => (
            <div key={i} style={{ flex: i === draft.length ? 0 : (i === 0 ? 0 : 1), textAlign: i === 0 ? 'left' : 'right' }}>
              {i === 0 ? `W${w}` : `W${w}`}
            </div>
          ))}
        </div>
      </div>

      {/* tap a block hint */}
      <div style={{
        marginTop: 10, padding: '6px 8px',
        borderTop: `1px dashed ${BP.border}`,
        fontFamily: BP.fontBody, fontSize: 8,
        color: BP.textTer, letterSpacing: '.1em',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>TAP BLOCK → +DELOAD ／ +REFEED ／ +TEST</span>
        <span style={{ color: BP.accent }}>2 EDITS</span>
      </div>
    </BPCard>
  );
}

// ─── Slider component ─────────────────────────────────────
function Slider({ pct, color = BP.accent, glow }) {
  return (
    <div style={{
      position: 'relative', height: 18,
      borderTop: `1px dashed ${BP.border}`,
      borderBottom: `1px dashed ${BP.border}`,
      background: BP.surfaceAlt || 'transparent',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct}%`, background: `${color}30`,
        borderRight: `1px solid ${color}`,
      }}/>
      <div style={{
        position: 'absolute', left: `${pct}%`, top: -3, bottom: -3,
        width: 10, transform: 'translateX(-50%)',
        background: BP.text,
        border: `1px solid ${color}`,
        boxShadow: glow ? `0 0 0 3px ${color}40` : 'none',
      }}/>
      {/* tick marks */}
      {[0,25,50,75,100].map(t => (
        <div key={t} style={{
          position: 'absolute', left: `${t}%`, top: '50%',
          width: 1, height: 4, background: BP.textTer,
          transform: 'translate(-50%, -50%)',
        }}/>
      ))}
    </div>
  );
}

// ─── Nutrition card ────────────────────────────────────────
function NutritionCard({ highlightCalories = false }) {
  return (
    <BPCard style={{ margin: '10px 12px 0' }} label="NUTRITION · DAILY TARGETS" accent={highlightCalories}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: BP.fontDisplay, fontSize: 10 }}>calorie target</div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 9, color: BP.core }}>−150 kcal vs current</div>
      </div>

      {/* Calorie input + slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <div style={{
          border: highlightCalories ? `1.5px solid ${BP.accent}` : `1px solid ${BP.border}`,
          padding: '6px 10px',
          minWidth: 110,
          background: highlightCalories ? BP.accentFaint : 'transparent',
          boxShadow: highlightCalories ? `0 0 0 3px ${BP.accentFaint}` : 'none',
        }}>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>KCAL/DAY</div>
          <Reenie style={{ display: 'block', fontSize: 26, fontWeight: 700, color: highlightCalories ? BP.accent : BP.text }}>2,250</Reenie>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: BP.fontBody, fontSize: 7,
            color: BP.textTer, marginBottom: 3, letterSpacing: '.1em',
          }}><span>1200</span><span>2400</span><span>3000</span></div>
          <Slider pct={62} glow={highlightCalories}/>
          <div style={{ fontFamily: BP.fontBody, fontSize: 8, color: BP.textTer, marginTop: 3, letterSpacing: '.06em' }}>
            FLOOR 1300 · CEIL 3000
          </div>
        </div>
      </div>

      <Dashed style={{ margin: '12px 0 10px' }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div style={{ fontFamily: BP.fontDisplay, fontSize: 10 }}>macros</div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 9, color: BP.textSec }}>P/C/F %</div>
      </div>

      {[
        { label: 'PROTEIN', g: 180, pct: 32, color: BP.pull, delta: '+10g' },
        { label: 'CARBS',   g: 220, pct: 39, color: BP.push, delta: '−25g' },
        { label: 'FAT',     g: 65,  pct: 26, color: BP.core, delta: '−5g' },
      ].map(m => (
        <div key={m.label} style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: BP.fontBody, fontSize: 9,
            letterSpacing: '.12em', marginBottom: 3,
          }}>
            <span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>
            <span><span style={{ fontWeight: 700 }}>{m.g}g</span> <span style={{ color: BP.textTer }}>· {m.pct}%</span> <span style={{ color: m.delta.startsWith('+') ? BP.pull : BP.core, marginLeft: 4 }}>{m.delta}</span></span>
          </div>
          <Slider pct={m.pct * 2.5} color={m.color}/>
        </div>
      ))}

      <Dashed style={{ margin: '10px 0' }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: BP.fontDisplay, fontSize: 10 }}>refeed</div>
          <div style={{ fontFamily: BP.fontBody, fontSize: 8, color: BP.textTer, letterSpacing: '.1em' }}>1× WEEKLY · SUN +400 KCAL</div>
        </div>
        {/* toggle */}
        <div style={{
          width: 38, height: 18,
          border: `1px solid ${BP.accentBorder}`,
          background: BP.accentFaint,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: 1, top: 1, bottom: 1,
            width: 16, background: BP.accent,
          }}/>
        </div>
      </div>
    </BPCard>
  );
}

// ─── Trajectory chart (real SVG, real coordinates) ────────
function TrajectoryChart() {
  const W = 332, H = 170;
  const padL = 30, padR = 10, padT = 14, padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Body weight model
  const startWk = 0, endOrig = 16, endDraft = 18;
  const startWeight = 187;
  const targetOrig = 175; // 12wk lose
  const targetDraft = 168; // more aggressive draft
  const yMin = 165, yMax = 192;

  const x = (w, total) => padL + (w / total) * innerW;
  const y = (lb) => padT + (1 - (lb - yMin) / (yMax - yMin)) * innerH;

  // Original prescribed (linear -ish)
  const origPts = Array.from({ length: 17 }, (_, i) => [i, startWeight - (i / 16) * (startWeight - targetOrig)]);
  // Draft prescribed (slightly slower mid, deload bump, then resume)
  const draftPts = [];
  for (let i = 0; i <= 18; i++) {
    let w = startWeight - (i / 18) * (startWeight - targetDraft);
    // small bump at deload (week 9-10)
    if (i === 9) w += 0.6;
    if (i === 10) w += 0.4;
    draftPts.push([i, w]);
  }
  // Historical actuals (current week 7)
  const actuals = [
    [0, 187.2], [1, 186.4], [2, 185.7], [3, 184.9], [4, 184.1],
    [5, 183.8], [6, 183.0], [7, 182.4],
  ];

  const pathFromOrig = (pts, total) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p[0], total)},${y(p[1])}`).join(' ');

  // Feasibility band (around draft, ±0.5 lb/wk green band, wider yellow)
  const bandPts = draftPts;
  const bandUpper = bandPts.map(([w, lb]) => [w, lb + 0.6]);
  const bandLower = bandPts.map(([w, lb]) => [w, lb - 0.6]);
  const bandPath = `${bandUpper.map((p,i)=>`${i===0?'M':'L'}${x(p[0],18)},${y(p[1])}`).join(' ')} ${bandLower.slice().reverse().map((p,i)=>`L${x(p[0],18)},${y(p[1])}`).join(' ')} Z`;

  // Block boundaries (draft): 0,4,9,10,14,18
  const boundaries = [
    { wk: 4, label: 'B2 INTENS' },
    { wk: 9, label: 'DLD' },
    { wk: 10, label: 'B3 PEAK' },
    { wk: 14, label: 'B4 TEST' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      <defs>
        <pattern id="bpgrid" x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0 H20 M0 0 V14" stroke={BP.borderFaint || BP.border} strokeWidth=".5"/>
        </pattern>
      </defs>
      {/* grid bg */}
      <rect x={padL} y={padT} width={innerW} height={innerH} fill="url(#bpgrid)" />
      {/* axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={BP.textSec} strokeWidth=".7"/>
      <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke={BP.textSec} strokeWidth=".7"/>

      {/* y labels */}
      {[170, 175, 180, 185, 190].map(lb => (
        <g key={lb}>
          <line x1={padL - 3} x2={padL} y1={y(lb)} y2={y(lb)} stroke={BP.textTer} strokeWidth=".5"/>
          <text x={padL - 5} y={y(lb) + 3} textAnchor="end" fontSize="7" fill={BP.textSec} fontFamily={BP.fontBody}>{lb}</text>
        </g>
      ))}
      {/* x labels */}
      {[0, 4, 8, 12, 16, 18].map(wk => (
        <g key={wk}>
          <line x1={x(wk, 18)} x2={x(wk, 18)} y1={padT + innerH} y2={padT + innerH + 3} stroke={BP.textTer} strokeWidth=".5"/>
          <text x={x(wk, 18)} y={padT + innerH + 12} textAnchor="middle" fontSize="7" fill={BP.textSec} fontFamily={BP.fontBody}>W{wk}</text>
        </g>
      ))}

      {/* feasibility band */}
      <path d={bandPath} fill="rgba(92,184,92,.18)" stroke="none"/>

      {/* TODAY line */}
      <line x1={x(7, 18)} x2={x(7, 18)} y1={padT} y2={padT + innerH}
            stroke={BP.accent} strokeWidth=".7" strokeDasharray="2 3" opacity=".8"/>
      <text x={x(7, 18) + 3} y={padT + 8} fontSize="7" fill={BP.accent} fontFamily={BP.fontBody}>TODAY · W7</text>

      {/* block boundary markers on draft */}
      {boundaries.map(b => (
        <g key={b.wk}>
          <line x1={x(b.wk, 18)} x2={x(b.wk, 18)}
                y1={padT} y2={padT + innerH}
                stroke={BP.textTer} strokeWidth=".5" strokeDasharray="1 2" opacity=".5"/>
          <text x={x(b.wk, 18)} y={padT - 4} fontSize="6" fill={BP.textTer} textAnchor="middle" fontFamily={BP.fontBody} letterSpacing=".05em">{b.label}</text>
        </g>
      ))}

      {/* Original line (dashed, lighter) */}
      <path d={pathFromOrig(origPts, 16)} fill="none"
            stroke={BP.textSec} strokeWidth="1.2" strokeDasharray="4 3" opacity=".6"/>
      <text x={x(16,18) - 4} y={y(targetOrig) - 4} fontSize="7" fill={BP.textSec} textAnchor="end" fontFamily={BP.fontBody}>ORIG · 175</text>

      {/* Draft line (solid, accent) */}
      <path d={pathFromOrig(draftPts, 18)} fill="none"
            stroke={BP.accent} strokeWidth="2"/>
      <circle cx={x(18, 18)} cy={y(targetDraft)} r="3" fill={BP.accent} stroke={BP.text} strokeWidth=".8"/>
      <text x={x(18, 18) - 4} y={y(targetDraft) + 12} fontSize="7" fill={BP.accent} textAnchor="end" fontFamily={BP.fontBody} fontWeight="700">DRAFT · 168</text>

      {/* Actuals (data points) */}
      {actuals.map((p, i) => (
        <g key={i}>
          <circle cx={x(p[0], 18)} cy={y(p[1])} r="1.8" fill={BP.text}/>
        </g>
      ))}
      <path d={actuals.map((p,i)=>`${i===0?'M':'L'}${x(p[0],18)},${y(p[1])}`).join(' ')}
            fill="none" stroke={BP.text} strokeWidth=".8" opacity=".85"/>

      {/* legend */}
      <g transform={`translate(${padL + 4}, ${padT + 4})`}>
        <rect x="0" y="0" width="98" height="32" fill={BP.surface} stroke={BP.border} strokeWidth=".5" opacity=".9"/>
        <line x1="4" y1="8" x2="14" y2="8" stroke={BP.textSec} strokeWidth="1" strokeDasharray="3 2"/>
        <text x="17" y="10" fontSize="7" fill={BP.text} fontFamily={BP.fontBody}>ORIGINAL</text>
        <line x1="4" y1="17" x2="14" y2="17" stroke={BP.accent} strokeWidth="1.5"/>
        <text x="17" y="19" fontSize="7" fill={BP.text} fontFamily={BP.fontBody}>DRAFT</text>
        <circle cx="9" cy="26" r="1.5" fill={BP.text}/>
        <text x="17" y="28" fontSize="7" fill={BP.text} fontFamily={BP.fontBody}>ACTUAL · 7d</text>
      </g>
    </svg>
  );
}

// ─── Volume bar chart ──────────────────────────────────────
function VolumeBars() {
  const data = [
    { m: 'PUSH', sets: 18, color: PM_MOVE.push, delta: '+2' },
    { m: 'PULL', sets: 22, color: PM_MOVE.pull, delta: '+0' },
    { m: 'LEGS', sets: 16, color: PM_MOVE.legs, delta: '−2' },
    { m: 'CORE', sets: 8,  color: PM_MOVE.core, delta: '+0' },
  ];
  const max = 24;
  return (
    <div>
      {data.map(d => (
        <div key={d.m} style={{ marginBottom: 7 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: BP.fontBody, fontSize: 9,
            letterSpacing: '.12em', marginBottom: 2,
          }}>
            <span style={{ color: d.color, fontWeight: 700 }}>{d.m}</span>
            <span style={{ color: BP.text }}>
              <span style={{ fontWeight: 700 }}>{d.sets}</span> sets/wk
              <span style={{ color: d.delta.startsWith('+') ? BP.pull : d.delta.startsWith('−') ? BP.core : BP.textTer, marginLeft: 6 }}>{d.delta}</span>
            </span>
          </div>
          <div style={{ height: 10, background: BP.surfaceAlt || 'transparent', border: `1px dashed ${BP.border}`, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${(d.sets/max)*100}%`,
              background: `repeating-linear-gradient(90deg, ${d.color} 0 4px, ${d.color}99 4px 8px)`,
            }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Block weeks bar chart ─────────────────────────────────
function BlockBars() {
  const blocks = [
    { n: 'B1', w: 4, color: BP.pull, delta: '0' },
    { n: 'B2', w: 5, color: BP.push, delta: '+1' },
    { n: 'DL', w: 1, color: BP.textSec, delta: 'NEW' },
    { n: 'B3', w: 4, color: BP.core, delta: '0' },
    { n: 'B4', w: 4, color: BP.legs, delta: '0' },
  ];
  const max = 5;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
      {blocks.map(b => (
        <div key={b.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontFamily: BP.fontBody, fontSize: 9,
            color: BP.text, fontWeight: 700,
          }}>{b.w}w</div>
          <div style={{
            width: '100%',
            height: `${(b.w/max)*52}px`,
            background: b.n === 'DL'
              ? `repeating-linear-gradient(45deg, ${BP.border} 0 3px, transparent 3px 6px)`
              : `${b.color}40`,
            border: `1px solid ${b.color}`,
            marginTop: 3,
          }}/>
          <div style={{
            fontFamily: BP.fontBody, fontSize: 8,
            color: b.color, marginTop: 3, fontWeight: 700,
          }}>{b.n}</div>
          <div style={{
            fontFamily: BP.fontBody, fontSize: 7,
            color: b.delta === '0' ? BP.textTer : BP.accent,
            letterSpacing: '.06em',
          }}>{b.delta}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Live projection panel (3 sub-tabs) ────────────────────
function ProjectionPanel({ tab = 'trajectory' }) {
  return (
    <BPCard style={{ margin: '12px 12px 0', padding: '12px 12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: BP.fontDisplay, fontSize: 11, letterSpacing: '.12em' }}>live projection</div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 8, color: BP.accent, letterSpacing: '.18em' }}>
          ◉ COMPUTING
        </div>
      </div>

      {/* sub-tab strip */}
      <div style={{
        display: 'flex', gap: 0, marginTop: 8,
        border: `1px solid ${BP.border}`,
      }}>
        {[
          { k: 'trajectory', l: 'TRAJECTORY' },
          { k: 'daily', l: 'DAILY TARGET' },
          { k: 'volume', l: 'VOL · STRUCT' },
        ].map((t, i) => (
          <div key={t.k} style={{
            flex: 1, padding: '5px 4px', textAlign: 'center',
            fontFamily: BP.fontBody, fontSize: 8,
            letterSpacing: '.14em',
            background: tab === t.k ? BP.accent : 'transparent',
            color: tab === t.k ? BP.text : BP.textSec,
            fontWeight: tab === t.k ? 700 : 400,
            borderRight: i < 2 ? `1px solid ${BP.border}` : 'none',
          }}>{t.l}</div>
        ))}
      </div>

      {/* content */}
      {tab === 'trajectory' ? (
        <div style={{ marginTop: 10 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: BP.fontBody, fontSize: 8,
            color: BP.textTer, letterSpacing: '.12em', marginBottom: 4,
          }}>
            <span>BODY WEIGHT (LB) × WEEK</span>
            <span>FEASIBILITY ▦ GREEN</span>
          </div>
          <TrajectoryChart />
          <div style={{
            marginTop: 6,
            fontFamily: BP.fontBody, fontSize: 9,
            color: BP.text, display: 'flex', justifyContent: 'space-between',
          }}>
            <span>RATE: <span style={{ color: BP.pull, fontWeight: 700 }}>−1.05 lb/wk</span></span>
            <span style={{ color: BP.textTer }}>HIT TARGET: WK 18</span>
          </div>
        </div>
      ) : null}

      {tab === 'daily' ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 7, letterSpacing: '.22em', fontFamily: BP.fontBody, color: BP.textTer }}>KCAL/DAY</div>
            <Reenie style={{ display: 'block', fontSize: 44, fontWeight: 700, color: BP.accent }}>2,250</Reenie>
            <div style={{ fontFamily: BP.fontBody, fontSize: 10, color: BP.core, letterSpacing: '.1em', marginTop: 2 }}>−150 vs CURRENT</div>
          </div>
          <Dashed style={{ margin: '4px 0 8px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { l: 'PROTEIN', v: '180g', d: '+10g', c: BP.pull },
              { l: 'CARBS',   v: '220g', d: '−25g', c: BP.push },
              { l: 'FAT',     v: '65g',  d: '−5g',  c: BP.core },
            ].map(p => (
              <div key={p.l} style={{
                border: `1px dashed ${p.c}`,
                padding: '6px 4px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: BP.fontBody, fontSize: 7, color: p.c, letterSpacing: '.16em', fontWeight: 700 }}>{p.l}</div>
                <Reenie style={{ display: 'block', fontSize: 19, fontWeight: 700, color: BP.text }}>{p.v}</Reenie>
                <div style={{ fontFamily: BP.fontBody, fontSize: 8, color: BP.textSec }}>{p.d}</div>
              </div>
            ))}
          </div>
          <Dashed style={{ margin: '8px 0' }}/>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: BP.fontBody, fontSize: 9,
          }}>
            <span style={{ color: BP.textTer, letterSpacing: '.12em' }}>P/BW RATIO</span>
            <span style={{ color: BP.pull, fontWeight: 700 }}>1.00 g/lb ✓</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 4,
            fontFamily: BP.fontBody, fontSize: 9,
          }}>
            <span style={{ color: BP.textTer, letterSpacing: '.12em' }}>FIBER · WATER</span>
            <span style={{ color: BP.text }}>34g · 3.4L</span>
          </div>
        </div>
      ) : null}

      {tab === 'volume' ? (
        <div style={{ marginTop: 10 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            marginBottom: 8,
          }}>
            <div style={{ border: `1px dashed ${BP.border}`, padding: '6px 8px' }}>
              <div style={{ fontFamily: BP.fontBody, fontSize: 7, color: BP.textTer, letterSpacing: '.18em' }}>TOTAL WEEKS</div>
              <Reenie style={{ display: 'block', fontSize: 26, fontWeight: 700, color: BP.text }}>18 <span style={{ fontSize: 12, color: BP.accent }}>+2</span></Reenie>
            </div>
            <div style={{ border: `1px dashed ${BP.border}`, padding: '6px 8px' }}>
              <div style={{ fontFamily: BP.fontBody, fontSize: 7, color: BP.textTer, letterSpacing: '.18em' }}>SESSIONS</div>
              <Reenie style={{ display: 'block', fontSize: 26, fontWeight: 700, color: BP.text }}>72 <span style={{ fontSize: 12, color: BP.accent }}>+8</span></Reenie>
            </div>
          </div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', fontFamily: BP.fontBody, color: BP.textTer, marginBottom: 4 }}>BLOCK WEEKS</div>
          <BlockBars />
          <Dashed style={{ margin: '10px 0 8px' }}/>
          <div style={{ fontSize: 7, letterSpacing: '.18em', fontFamily: BP.fontBody, color: BP.textTer, marginBottom: 4 }}>WEEKLY SETS · BY MOVEMENT</div>
          <VolumeBars />
        </div>
      ) : null}
    </BPCard>
  );
}

// ─── Bottom apply bar (sticky) ─────────────────────────────
function StickyApplyBar({ pending = 4, disabled = false }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: BP.bgAlt,
      borderTop: `1px solid ${BP.borderStrong}`,
    }}>
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px dashed ${BP.borderFaint || BP.border}`,
      }}>
        <div style={{
          fontFamily: BP.fontBody, fontSize: 9,
          color: disabled ? BP.textOnBgTer : BP.textOnBg,
          letterSpacing: '.1em',
        }}>
          {disabled ? 'NO CHANGES TO APPLY' : `${pending} CHANGES READY`}
        </div>
        <div style={{ flex: 1 }} />
        <PillBtn ghost size="sm">Discard</PillBtn>
        <PillBtn primary size="sm" disabled={disabled}>Apply ↗</PillBtn>
      </div>
      {isBlueprint() ? <DWGStrip /> : null}
    </div>
  );
}

// ─── MAIN PLANNING SCREEN ─────────────────────────────────
function PlanningMain() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div className="screen-scroll-inner" style={{
        position: 'absolute', inset: 0, bottom: 56,
        overflowY: 'auto',
        paddingBottom: 40,
      }}>
        <SandboxHeader pending={4} />
        <SectionTabs active="Goals" />

        {/* Section: GOALS */}
        <div style={{ padding: '8px 12px 0' }}>
          <SecHead num="01" title="goals" sub="2 active goals · all editable" />
        </div>
        <GoalCard
          name="body weight"
          current="187 lb"
          target="168 lb"
          delta="−19 lb"
          date="2026-08-20"
          rate="−1.05 lb/wk"
          status="aggressive"
        />
        <Warning>Rate of 1.05 lb/wk loss is aggressive at 187 lb (&gt;0.7%/wk). Consider 0.7&nbsp;lb/wk.</Warning>

        <GoalCard
          name="bench 1rm"
          current="265 lb"
          target="285 lb"
          delta="+20 lb"
          date="2026-08-20"
          rate="+1.25 lb/wk"
          status="sustainable"
        />

        {/* Section: TIMELINE */}
        <div style={{ padding: '16px 12px 0' }}>
          <SecHead num="02" title="timeline" sub="start · end · block lengths · phase events" />
        </div>
        <DateRangeCard />
        <BlockTimeline />
        <Warning>16 weeks of straight accumulation has no peaking phase — added DLD wk 9, kept B3 PEAK.</Warning>

        {/* Section: NUTRITION */}
        <div style={{ padding: '16px 12px 0' }}>
          <SecHead num="03" title="nutrition" sub="kcal · macros · refeed cadence" />
        </div>
        <NutritionCard />
        <Warning kind="red">Cutting calories below 1200 not recommended. Floor enforced at 1300.</Warning>

        {/* Live projection panel — three sub-tabs presented in sequence */}
        <div style={{ padding: '20px 12px 0' }}>
          <SecHead num="04" title="live projection" sub="updates as you edit · 3 views" />
        </div>
        <ProjectionPanel tab="trajectory" />

      </div>

      <StickyApplyBar pending={4} />
    </div>
  );
}

// ─── Section header within a screen ───────────────────────
// SecHead renders directly on the page background (NOT inside a card),
// so it uses textOnBg* tokens. The bgAlt strip + accent rule is themed.
function SecHead({ num, title, sub }) {
  return (
    <div style={{
      marginBottom: 4,
      background: BP.bgAlt,
      padding: '4px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{
          fontFamily: BP.fontBody, fontSize: 9,
          color: BP.textOnBgSec, letterSpacing: '.16em', fontWeight: 700,
        }}>{num}.</div>
        <div style={{
          fontFamily: BP.fontDisplay, fontSize: 14,
          color: BP.textOnBg, letterSpacing: '.06em',
        }}>{title}</div>
        <div style={{ flex: 1, height: 1, marginBottom: 4,
          backgroundImage: `linear-gradient(90deg, ${BP.borderStrong || BP.border} 50%, transparent 50%)`,
          backgroundSize: '6px 1px',
        }}/>
      </div>
      <div style={{
        fontFamily: BP.fontBody, fontSize: 9,
        color: BP.textOnBgSec, letterSpacing: '.06em', marginLeft: 18, fontWeight: 500,
      }}>// {sub}</div>
    </div>
  );
}

// ─── Date range card ──────────────────────────────────────
function DateRangeCard() {
  return (
    <BPCard style={{ margin: '10px 12px 0' }} label="DATES · DURATION">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>START</div>
          <div style={{
            border: `1px dashed ${BP.border}`, padding: '5px 8px', marginTop: 3,
            fontFamily: BP.fontBody, fontSize: 11,
          }}>2026-03-09</div>
        </div>
        <div style={{ fontFamily: BP.fontBody, fontSize: 14, color: BP.textTer }}>→</div>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>END</div>
          <div style={{
            border: `1px solid ${BP.accentBorder}`,
            background: BP.accentFaint,
            padding: '5px 8px', marginTop: 3,
            fontFamily: BP.fontBody, fontSize: 11, color: BP.accent, fontWeight: 700,
          }}>2026-07-13</div>
        </div>
      </div>
      <Dashed style={{ margin: '10px 0' }}/>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 7, letterSpacing: '.18em', color: BP.textTer, fontFamily: BP.fontBody }}>DURATION</div>
          <Reenie style={{ display: 'block', fontSize: 22, fontWeight: 700, color: BP.text }}>
            18 wk <span style={{ fontSize: 11, color: BP.accent, fontWeight: 400 }}>was 16</span>
          </Reenie>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{
            width: 28, height: 28,
            border: `1px solid ${BP.border}`,
            background: 'transparent', color: BP.text,
            fontFamily: BP.fontBody, fontSize: 14, cursor: 'pointer',
          }}>−</button>
          <button style={{
            width: 28, height: 28,
            border: `1px solid ${BP.accent}`,
            background: BP.accentFaint, color: BP.accent,
            fontFamily: BP.fontBody, fontSize: 14, cursor: 'pointer',
          }}>+</button>
        </div>
      </div>
    </BPCard>
  );
}

// ─── Variant: Daily Target tab in projection ──────────────
function DailyTargetView() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: 56, overflowY: 'auto', paddingBottom: 30 }}>
        <SandboxHeader pending={4} />
        <SectionTabs active="Nutrition" />
        <div style={{ padding: '8px 12px 0' }}>
          <SecHead num="03" title="nutrition" sub="kcal · macros · refeed cadence" />
        </div>
        <NutritionCard />

        <div style={{ padding: '14px 12px 0' }}>
          <SecHead num="04" title="live projection" sub="daily target view" />
        </div>
        <ProjectionPanel tab="daily" />
        <Warning kind="red">Cutting calories below 1200 not recommended.</Warning>
      </div>
      <StickyApplyBar pending={4} />
    </div>
  );
}

// ─── Variant: Volume / Structure tab ──────────────────────
function VolumeView() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: 56, overflowY: 'auto', paddingBottom: 30 }}>
        <SandboxHeader pending={4} />
        <SectionTabs active="Timeline" />
        <div style={{ padding: '8px 12px 0' }}>
          <SecHead num="02" title="timeline" sub="block lengths · phase events" />
        </div>
        <BlockTimeline />
        <div style={{ padding: '14px 12px 0' }}>
          <SecHead num="04" title="live projection" sub="volume · structure" />
        </div>
        <ProjectionPanel tab="volume" />
      </div>
      <StickyApplyBar pending={4} />
    </div>
  );
}

// ─── State: Recommendation pre-staged ─────────────────────
function RecommendationView() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: 56, overflowY: 'auto', paddingBottom: 30 }}>
        <SandboxHeader pending={1} recommendation />
        <RecommendationBanner />
        <SectionTabs active="Nutrition" />
        <div style={{ padding: '8px 12px 0' }}>
          <SecHead num="03" title="nutrition" sub="kcal · macros · refeed cadence" />
        </div>
        <NutritionCard highlightCalories />
        <div style={{ padding: '14px 12px 0' }}>
          <SecHead num="04" title="live projection" sub="trajectory after change" />
        </div>
        <ProjectionPanel tab="trajectory" />
      </div>
      <StickyApplyBar pending={1} />
    </div>
  );
}

// ─── State: No changes yet (entry state) ──────────────────
function EmptyView() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, bottom: 56, overflowY: 'auto', paddingBottom: 30 }}>
        <SandboxHeader pending={0} applyDisabled />
        <SectionTabs active="Goals" />

        <div style={{ padding: '8px 12px 0' }}>
          <SecHead num="01" title="goals" sub="2 active goals · all editable" />
        </div>
        <GoalCard
          name="body weight"
          current="187 lb"
          target="175 lb"
          delta="−12 lb"
          date="2026-07-13"
          rate="−0.7 lb/wk"
          status="sustainable"
        />
        <GoalCard
          name="bench 1rm"
          current="265 lb"
          target="275 lb"
          delta="+10 lb"
          date="2026-07-13"
          rate="+0.6 lb/wk"
          status="sustainable"
        />

        {/* Empty state hint */}
        <div style={{
          margin: '16px 12px 0',
          padding: '20px 14px',
          border: `1px dashed ${BP.border}`,
          background: BP.surface,
          color: BP.text,
          textAlign: 'center',
          position: 'relative',
        }}>
          <Crosshair style={{ top: -5, left: -5 }} color={BP.textSec}/>
          <Crosshair style={{ top: -5, right: -5 }} color={BP.textSec}/>
          <Crosshair style={{ bottom: -5, left: -5 }} color={BP.textSec}/>
          <Crosshair style={{ bottom: -5, right: -5 }} color={BP.textSec}/>
          <div style={{
            fontFamily: BP.fontDisplay, fontSize: 12,
            letterSpacing: '.12em', color: BP.text,
          }}>sandbox · clean</div>
          <div style={{
            fontFamily: BP.fontBody, fontSize: 9, marginTop: 6,
            color: BP.textSec, letterSpacing: '.08em', lineHeight: 1.5,
          }}>
            edit any handle above to begin drafting.<br/>
            nothing applies until you confirm.
          </div>
        </div>
      </div>
      <StickyApplyBar pending={0} disabled />
    </div>
  );
}

// ─── Apply confirmation modal (own frame) ─────────────────
function ApplyModal() {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* dimmed background screen — only blueprint shows the drafting grid */}
      {isBlueprint() ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(19,44,82,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(19,44,82,.10) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: BP.bgAlt,
          opacity: .35,
        }}/>
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: BP.bg,
        }}/>
      )}
      {/* dim overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: BP.isDark ? 'rgba(0,0,0,.5)' : 'rgba(0,0,0,.35)',
      }}/>

      <div style={{ position: 'absolute', top: 60, left: 12, right: 12 }}>
        <BPCard style={{ padding: '16px 16px 14px' }}>
          {/* Stamp */}
          <div style={{ position: 'absolute', top: -10, right: 10 }}>
            <PlanningStamp small/>
          </div>

          <div style={{
            fontFamily: BP.fontDisplay, fontSize: 14,
            letterSpacing: '.08em',
          }}>apply 4 changes?</div>
          <div style={{
            fontFamily: BP.fontBody, fontSize: 9,
            color: BP.textSec, letterSpacing: '.1em',
            marginTop: 3,
          }}>// commits draft to live gameplan · cannot be undone</div>

          <Dashed style={{ margin: '12px 0 10px' }}/>

          <div style={{
            fontSize: 8, letterSpacing: '.18em', fontFamily: BP.fontBody,
            color: BP.textTer, marginBottom: 6,
          }}>DIFF · 4 ITEMS</div>

          {[
            { f: 'Calorie target',     o: '2,400', n: '2,250', u: 'kcal/day' },
            { f: 'Bench 1RM target',   o: '275',   n: '285',   u: 'lb' },
            { f: 'Block 2 duration',   o: '4',     n: '5',     u: 'wk' },
            { f: 'Deload @ end of B2', o: '—',     n: 'added', u: '' },
          ].map((d, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto auto',
              alignItems: 'baseline',
              gap: 6,
              padding: '5px 0',
              borderBottom: i < 3 ? `1px dashed ${BP.border}` : 'none',
              fontFamily: BP.fontBody,
            }}>
              <span style={{ fontSize: 8, color: BP.textTer }}>0{i+1}</span>
              <span style={{ fontSize: 10 }}>{d.f}</span>
              <span style={{ fontSize: 10, color: BP.textTer, textDecoration: 'line-through' }}>{d.o}</span>
              <span style={{ fontSize: 10, color: BP.textTer }}>→</span>
              <span style={{ fontSize: 11, color: BP.accent, fontWeight: 700 }}>
                {d.n}{d.u ? <span style={{ fontSize: 8, color: BP.textTer, marginLeft: 2 }}> {d.u}</span> : null}
              </span>
            </div>
          ))}

          <Dashed style={{ margin: '12px 0 8px' }}/>

          <div style={{
            fontSize: 8, letterSpacing: '.18em', fontFamily: BP.fontBody,
            color: BP.textTer, marginBottom: 4,
          }}>NOTE · OPTIONAL</div>
          <div style={{
            border: `1px dashed ${BP.border}`,
            padding: '8px 10px',
            fontFamily: BP.fontBody, fontSize: 10,
            color: BP.textTer,
            fontStyle: 'italic',
          }}>e.g., wasn't losing — cutting 150 kcal_</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <PillBtn ghost size="md" style={{ flex: 1, color: BP.textSec, borderColor: BP.textTer }}>Cancel</PillBtn>
            <PillBtn primary size="md" style={{ flex: 2 }}>Confirm ↗</PillBtn>
          </div>
        </BPCard>

        {/* confirmation footer info */}
        <div style={{
          marginTop: 10,
          textAlign: 'center',
          fontFamily: BP.fontBody, fontSize: 8,
          letterSpacing: '.16em',
          color: BP.textOnBgSec, fontWeight: 600,
        }}>v2 → v3 · NEW REVISION WILL BE STAMPED</div>
      </div>
    </div>
  );
}

// Expose to global
Object.assign(window, {
  PlanningMain, DailyTargetView, VolumeView,
  RecommendationView, EmptyView, ApplyModal,
  DWGStrip,
});
