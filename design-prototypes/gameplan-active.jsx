// Active Gameplan Tab — Graffiti / 90s Street theme
// Main artboard (Training tab) + Nutrition preview + Lifestyle preview
// + Empty state + Rest day variant.
//
// Themable via theme-bridge: setActiveGameplanTheme(themeId) before render,
// the GP constant updates and every inline reference to GP.bg / GP.surface /
// GP.accent / GP.fontDisplay etc resolves to the active theme's value.

const { useState: useGPState, useMemo: useGPMemo } = React;

// ─── Live theme reference ─────────────────────────────────────
// Default to graffiti (the file's original native theme) so screens render
// correctly even if the host forgets to call the setter.
let GP = window.getFitTrackTheme ? window.getFitTrackTheme('graffiti') : {};
function setActiveGameplanTheme(themeId) {
  GP = window.getFitTrackTheme(themeId);
}
window.setActiveGameplanTheme = setActiveGameplanTheme;

// ─── Movement colors (driven by theme) ────────────────────────
// Legacy MOVE object — keys remain push/pull/legs/core/off but values pull
// from the active theme so muscle-group accents harmonize per theme.
const MOVE = new Proxy({}, {
  get(_, key) {
    if (key === 'off') return GP.textTer || '#6B6B70';
    return GP[key] || '#666';
  },
});

// ─── Concrete noise texture (CSS-only, layered radial dots) ───
// Graffiti only — every other theme uses a flat themed bg.
const concreteBg_graffiti = {
  background: `
    radial-gradient(circle at 12% 18%, rgba(255,255,255,.018) 0 1px, transparent 1.5px),
    radial-gradient(circle at 38% 72%, rgba(255,255,255,.020) 0 1px, transparent 1.5px),
    radial-gradient(circle at 67% 31%, rgba(255,255,255,.014) 0 1px, transparent 1.5px),
    radial-gradient(circle at 88% 88%, rgba(255,255,255,.022) 0 1px, transparent 1.5px),
    radial-gradient(circle at 22% 55%, rgba(0,0,0,.30) 0 1.5px, transparent 2px),
    radial-gradient(circle at 78% 12%, rgba(0,0,0,.25) 0 1.5px, transparent 2px),
    radial-gradient(circle at 50% 92%, rgba(0,0,0,.22) 0 1.5px, transparent 2px),
    radial-gradient(circle at 8% 80%, rgba(0,0,0,.18) 0 1px, transparent 1.5px),
    #23272A
  `,
  backgroundSize: '180px 180px, 220px 220px, 160px 160px, 240px 240px, 90px 90px, 110px 110px, 130px 130px, 70px 70px, 100% 100%',
};
// Theme-aware bg: graffiti gets concrete texture, others get flat theme bg.
const concreteBg = new Proxy({}, {
  get(_, key) {
    if (GP.chrome === 'graffiti') return concreteBg_graffiti[key];
    if (key === 'background') return GP.bg;
    return undefined;
  },
  ownKeys() { return GP.chrome === 'graffiti' ? Object.keys(concreteBg_graffiti) : ['background']; },
  getOwnPropertyDescriptor(_, key) { return { enumerable: true, configurable: true }; },
});

// Type helpers + tilt guard come from the shared theme-typography module.
// Bind them to GP via a getter so every render sees the current theme.
const {
  Marker,
  Reenie,
  Archivo,
  stripTilt,
  isGraffiti,
} = window.makeFitTrackTypography(() => GP);

// ─── Spray-paint underline (torn, ragged SVG) ──────────────────
// Graffiti-native ornament. On other themes renders a clean themed accent
// rule so the visual hierarchy is preserved without the graffiti idiom.
function SprayUnderline({ width = 180, color, style }) {
  const c = color || GP.info;
  if (!isGraffiti()) {
    // Clean themed underline for non-graffiti themes
    const isNotebook = GP.chrome === 'notebook';
    return (
      <div style={{
        width,
        height: isNotebook ? 3 : 2,
        background: c,
        opacity: isNotebook ? 0.55 : 0.7,
        borderRadius: isNotebook ? 2 : 0,
        ...style,
      }}/>
    );
  }
  return (
    <svg width={width} height="14" viewBox="0 0 180 14" style={{ display: 'block', ...style }}>
      <defs>
        <filter id="sprayBlur" x="-5%" y="-50%" width="110%" height="200%">
          <feGaussianBlur stdDeviation=".4"/>
        </filter>
      </defs>
      <g filter="url(#sprayBlur)">
        <path d="M2 7 Q 22 4, 44 6 T 88 5 Q 110 8, 132 5 T 178 7"
              fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"/>
        <path d="M5 9 Q 30 11, 60 9 T 120 10 Q 150 8, 175 10"
              fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
      </g>
      {/* spray dots flanking the line */}
      <circle cx="3" cy="3" r="0.8" fill={c} opacity=".6"/>
      <circle cx="40" cy="12" r="0.6" fill={c} opacity=".5"/>
      <circle cx="92" cy="2" r="0.7" fill={c} opacity=".55"/>
      <circle cx="155" cy="13" r="0.6" fill={c} opacity=".45"/>
      <circle cx="175" cy="2" r="0.5" fill={c} opacity=".4"/>
    </svg>
  );
}

// ─── Spray-paint button underline (slightly chunkier) ──────────
// Graffiti-only ornament; other themes get a flat themed underline.
function ButtonSpray({ width = 120, color, style }) {
  const c = color || GP.text;
  if (!isGraffiti()) {
    return (
      <div style={{
        width, height: 2, background: c, opacity: 0.75, marginTop: 2,
        ...style,
      }}/>
    );
  }
  return (
    <svg width={width} height="10" viewBox="0 0 120 10" style={{ display: 'block', ...style }}>
      <path d="M3 5 Q 18 2, 36 4 T 72 4 Q 90 7, 117 5"
            fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity=".95"/>
      <path d="M6 8 Q 30 9, 60 7 T 115 8"
            fill="none" stroke={c} strokeWidth="1" strokeLinecap="round" opacity=".5"/>
      <circle cx="2" cy="3" r="0.6" fill={c} opacity=".7"/>
      <circle cx="118" cy="3" r="0.5" fill={c} opacity=".6"/>
    </svg>
  );
}

// ─── FRESH stamp/badge — graffiti-native, themed equivalents elsewhere ──
function FreshTape({ rotate = -8, size = 'md', label = 'FRESH', style }) {
  const s = size === 'sm' ? { fs: 10, py: 4, px: 11 } : size === 'lg' ? { fs: 15, py: 7, px: 16 } : { fs: 12, py: 5, px: 14 };
  // Non-graffiti themes: render a plain accent badge in the theme's idiom.
  if (!isGraffiti()) {
    return (
      <div style={{
        display: 'inline-block',
        background: GP.accent,
        color: GP.textOnAccent,
        fontFamily: GP.fontData,
        fontSize: s.fs - 1,
        fontWeight: 600,
        letterSpacing: '.18em',
        padding: `${s.py}px ${s.px}px`,
        borderRadius: GP.radiusSm,
        boxShadow: GP.shadowSm,
        transform: `rotate(${GP.chrome === 'iron' || GP.chrome === 'blueprint' || GP.chrome === 'cyberpunk' || GP.chrome === 'arcade' ? 0 : rotate * 0.3}deg)`,
        ...style,
      }}>
        {label}
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-block',
      background: GP.accent,
      color: GP.bg,
      fontFamily: GP.fontDisplay,
      fontSize: s.fs,
      letterSpacing: '.18em',
      padding: `${s.py}px ${s.px}px`,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 1px 0 rgba(0,0,0,.4), 0 4px 8px rgba(0,0,0,.25)',
      // torn-tape edges via clip-path
      clipPath: 'polygon(2% 18%, 6% 6%, 12% 14%, 22% 4%, 32% 12%, 44% 2%, 56% 14%, 68% 4%, 80% 12%, 92% 2%, 98% 14%, 99% 86%, 94% 96%, 86% 84%, 76% 96%, 64% 86%, 52% 96%, 40% 86%, 28% 96%, 16% 86%, 6% 96%, 2% 84%)',
      ...style,
    }}>
      {label}
    </div>
  );
}

// ─── Scattered spray-paint dots layer ──────────────────────────
function SprayDotsLayer({ seed = 1 }) {
  // Deterministic dot positions per seed
  const dots = useGPMemo(() => {
    const out = [];
    let s = seed * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 18; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        r: 0.6 + rand() * 1.6,
        o: 0.08 + rand() * 0.12,
        c: rand() > 0.7 ? GP.info : GP.accent,
      });
    }
    return out;
  }, [seed]);
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      {dots.map((d, i) => (
        <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r={d.r} fill={d.c} opacity={d.o}/>
      ))}
    </svg>
  );
}

// ─── Dashed divider ────────────────────────────────────────────
function DashedDivider({ style }) {
  return <div style={{
    height: 1,
    backgroundImage: `repeating-linear-gradient(90deg, ${GP.borderFaint} 0 6px, transparent 6px 12px)`,
    margin: '14px 0',
    ...style,
  }}/>;
}

// ─── Themed card with alternating tilt ──────────────────────────
// Tilt is a graffiti idiom — flatten on other themes.
function GCard({ children, tilt = 0.4, accent, style, padding = 16, freshTape, dataAttr }) {
  const graffiti = isGraffiti();
  const borderC = graffiti ? 'rgba(255,255,255,.06)' : GP.borderFaint;
  return (
    <div {...(dataAttr || {})} style={{
      position: 'relative',
      background: GP.surface,
      border: `1px solid ${borderC}`,
      borderLeft: accent ? `4px solid ${accent}` : `1px solid ${borderC}`,
      borderRadius: GP.radiusMd,
      padding,
      transform: graffiti ? `rotate(${tilt}deg)` : 'none',
      boxShadow: graffiti
        ? '0 2px 0 rgba(0,0,0,.35), 0 8px 18px rgba(0,0,0,.30)'
        : GP.shadowSm,
      ...style,
    }}>
      {freshTape && (
        <div style={{ position: 'absolute', top: -10, right: 14, zIndex: 4 }}>
          <FreshTape rotate={-7} size="sm" label={freshTape}/>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Sparkline (14-day trend) ──────────────────────────────────
function Sparkline({ data, width = 70, height = 22, color = GP.textTer, stroke = 1.4 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((v - min) / span) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Status dot ────────────────────────────────────────────────
function StatusDot({ tone = 'green' }) {
  const c = tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : tone === 'red' ? GP.legs : GP.info;
  return <span style={{
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
    background: c, boxShadow: `0 0 6px ${c}88`,
  }}/>;
}

// ─── Type helpers ──────────────────────────────────────────────
// Marker / Reenie / Archivo / stripTilt / isGraffiti are bound above
// from window.makeFitTrackTypography(() => GP). The legacy names map to:
//   Marker  — display font   (theme.fontDisplay)
//   Reenie  — number font    (theme.fontNumber || theme.fontBody)
//   Archivo — data font      (theme.fontData)
// stripTilt(style) drops transform/transformOrigin on non-graffiti themes.

// ─── Bottom nav (with raised +Log FAB) ─────────────────────────
function BottomNav({ active = 'gameplan' }) {
  const items = [
    { id: 'gameplan', label: 'GAMEPLAN' },
    { id: 'progress', label: 'PROGRESS' },
    { id: 'log',      label: '+LOG', fab: true },
    { id: 'nutrition', label: 'NUTRI' },
    { id: 'settings', label: 'SETTINGS' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 78,
      background: GP.surfaceAlt,
      borderTop: `1px solid ${GP.border}`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      paddingTop: 12,
      zIndex: 50,
    }}>
      {items.map(it => {
        if (it.fab) return (
          <div key={it.id} style={{
            position: 'relative', marginTop: -22,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: GP.info,
              border: `3px solid ${GP.bg}`,
              display: 'grid', placeItems: 'center',
              fontFamily: GP.fontData,
              color: GP.textOnAccent, fontSize: 26, lineHeight: 1,
              transform: isGraffiti() ? 'rotate(-3deg)' : 'none',
              boxShadow: GP.shadowMd,
            }}>+</div>
            <span style={{
              fontFamily: GP.fontData, fontSize: 9,
              color: GP.textSec, letterSpacing: '.12em',
            }}>LOG</span>
          </div>
        );
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 6,
          }}>
            <div style={{
              width: 22, height: 22,
              border: `2px solid ${isActive ? GP.text : GP.textTer}`,
              background: isActive ? GP.accentFaint : 'transparent',
            }}/>
            <span style={{
              fontFamily: GP.fontData, fontSize: 9,
              color: isActive ? GP.text : GP.textTer,
              letterSpacing: '.10em',
            }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status strip (sticky top) ─────────────────────────────────
function StatusStrip({ name = 'IRON & GROW', week = 6, totalWeeks = 16, block = 'BLOCK 2: STRENGTH', daysLeft = 71 }) {
  return (
    <div style={{
      padding: '14px 18px 12px',
      background: GP.surfaceAlt,
      borderBottom: `1px solid ${GP.borderFaint}`,
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Marker style={{
            fontSize: 26, color: GP.text, letterSpacing: '.01em',
            display: 'block', lineHeight: 1.05, transform: 'rotate(-1deg)', transformOrigin: 'left',
          }}>{name}</Marker>
          <SprayUnderline width={170} style={{ marginTop: 2, marginLeft: -4 }}/>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Archivo style={{ fontSize: 9, color: GP.textSec, letterSpacing: '.1em' }}>
              WEEK {week} OF {totalWeeks}
            </Archivo>
            <span style={{ width: 4, height: 4, background: GP.borderStrong, borderRadius: '50%' }}/>
            <Archivo style={{ fontSize: 9, color: GP.textSec, letterSpacing: '.1em' }}>
              {block}
            </Archivo>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 9px',
            border: `1px solid ${GP.successBorder}`,
            background: GP.successBg,
          }}>
            <StatusDot tone="green"/>
            <Archivo style={{ fontSize: 9, color: GP.successFg, letterSpacing: '.18em' }}>ACTIVE</Archivo>
          </div>
          <div style={{ marginTop: 8, lineHeight: 1 }}>
            <Reenie style={{ fontSize: 36, color: GP.text }}>{daysLeft}</Reenie>
            <Archivo style={{ display: 'block', fontSize: 8, color: GP.textTer, letterSpacing: '.18em', marginTop: 2 }}>
              DAYS LEFT
            </Archivo>
          </div>
        </div>
      </div>
      {/* week progress bar */}
      <div style={{ marginTop: 10, position: 'relative' }}>
        <div style={{
          height: 6, background: GP.borderFaint,
          border: `1px solid ${GP.borderFaint}`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: `${(week / totalWeeks) * 100}%`,
            background: isGraffiti()
              ? `repeating-linear-gradient(45deg, ${GP.info} 0 4px, ${GP.info}cc 4px 8px)`
              : GP.accent,
          }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.15em' }}>W1</Archivo>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.15em' }}>W{totalWeeks}</Archivo>
        </div>
      </div>
    </div>
  );
}

// ─── Section header (for in-screen sections) ───────────────────
function SectionH({ children, kicker, sprayWidth = 110, color = GP.info, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      {kicker && <Archivo style={{
        fontSize: 9, color: GP.textOnBgTer, letterSpacing: '.22em', display: 'block', marginBottom: 3,
      }}>{kicker}</Archivo>}
      <Marker style={{ fontSize: 18, color: GP.textOnBg, display: 'block', lineHeight: 1, transform: 'rotate(-.6deg)', transformOrigin: 'left' }}>{children}</Marker>
      <SprayUnderline width={sprayWidth} color={color} style={{ marginTop: -1, marginLeft: -3 }}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 2 — NEXT ACTION CARDS
// ═══════════════════════════════════════════════════════════════

function NextActionPull({ tilt = 0.4 }) {
  return (
    <GCard accent={MOVE.pull} tilt={tilt} padding={16}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Archivo style={{ fontSize: 9, color: GP.pull, letterSpacing: '.20em' }}>TODAY · DAY 3</Archivo>
          <Marker style={{
            fontSize: 30, color: GP.text, display: 'block', lineHeight: 1, marginTop: 4,
            transform: 'rotate(-1.2deg)', transformOrigin: 'left',
          }}>PULL</Marker>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Reenie style={{ fontSize: 28, color: GP.text }}>~55</Reenie>
          <Archivo style={{ display: 'block', fontSize: 8, color: GP.textTer, letterSpacing: '.18em' }}>MINUTES</Archivo>
        </div>
      </div>

      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Reenie style={{ fontSize: 24, color: GP.text }}>6</Reenie>
        <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.15em' }}>EXERCISES</Archivo>
      </div>

      <DashedDivider style={{ margin: '12px 0 10px' }}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'Pull-up', sets: '4 × 6–8' },
          { name: 'Barbell Row', sets: '4 × 8' },
          { name: 'Face Pull', sets: '3 × 12' },
        ].map(ex => (
          <div key={ex.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Archivo style={{ fontSize: 11, color: GP.text, letterSpacing: '.04em' }}>{ex.name}</Archivo>
            <Reenie style={{ fontSize: 19, color: GP.textSec }}>{ex.sets}</Reenie>
          </div>
        ))}
        <Archivo style={{ fontSize: 10, color: GP.textTer, letterSpacing: '.10em', marginTop: 2 }}>
          + 3 MORE…
        </Archivo>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <Marker style={{ fontSize: 20, color: GP.text, letterSpacing: '.02em' }}>START WORKOUT</Marker>
          <ButtonSpray width={170} color={GP.info} style={{ marginTop: -2 }}/>
        </div>
        <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.15em', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          VIEW FULL DAY →
        </Archivo>
      </div>
    </GCard>
  );
}

function NextActionLogged({ tilt = -0.3 }) {
  return (
    <GCard accent={MOVE.pull} tilt={tilt} padding={16}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44,
            border: `2px solid ${GP.successBorder}`,
            background: GP.successBg,
            display: 'grid', placeItems: 'center',
            transform: 'rotate(-3deg)',
            flexShrink: 0,
            marginTop: 2,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M5 13 L10 18 L20 7" fill="none" stroke={GP.pull} strokeWidth="2.6"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Archivo style={{ fontSize: 9, color: GP.pull, letterSpacing: '.20em' }}>LOGGED TODAY</Archivo>
            <Marker style={{
              fontSize: 30, color: GP.text, display: 'block', lineHeight: 1, marginTop: 2,
              transform: 'rotate(-1deg)', transformOrigin: 'left',
            }}>PULL ✓</Marker>
            <SprayUnderline width={88} color={GP.pull} style={{ marginTop: 1, marginLeft: -3 }}/>
          </div>
        </div>
      </div>

      <DashedDivider style={{ margin: '14px 0 10px' }}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'VOLUME', val: '12.4k', sub: 'LBS' },
          { label: 'TOP SET', val: '185', sub: '× 8' },
          { label: 'TIME', val: '52', sub: 'MIN' },
        ].map(s => (
          <div key={s.label}>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.18em' }}>{s.label}</Archivo>
            <div style={{ marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <Reenie style={{ fontSize: 30, color: GP.text }}>{s.val}</Reenie>
              <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.12em' }}>{s.sub}</Archivo>
            </div>
          </div>
        ))}
      </div>

      <DashedDivider style={{ margin: '14px 0 10px' }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.18em' }}>TOMORROW</Archivo>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: MOVE.legs }}/>
            <Marker style={{ fontSize: 16, color: GP.text }}>DAY 4 — LEGS</Marker>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Archivo style={{ fontSize: 11, color: GP.text, letterSpacing: '.10em' }}>VIEW SESSION</Archivo>
          <ButtonSpray width={130} color={GP.info} style={{ marginTop: -1 }}/>
        </div>
      </div>
    </GCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 3 — PENDING CHECK-IN CARD
// ═══════════════════════════════════════════════════════════════
function CheckInCard({ tilt = 0.3 }) {
  return (
    <GCard tilt={tilt} padding={16} freshTape="FRESH" style={{
      borderLeft: `4px solid ${GP.accent}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              width: 7, height: 7, background: GP.core, borderRadius: '50%',
              boxShadow: `0 0 8px ${GP.core}aa`,
            }}/>
            <Archivo style={{ fontSize: 9, color: GP.core, letterSpacing: '.20em' }}>WEEKLY CHECK-IN</Archivo>
          </div>
          <Marker style={{
            fontSize: 22, color: GP.text, display: 'block', lineHeight: 1.05,
            transform: 'rotate(-.8deg)', transformOrigin: 'left',
          }}>2 RECOMMENDATIONS</Marker>
          <SprayUnderline width={150} color={GP.warn} style={{ marginTop: 1, marginLeft: -3 }}/>
        </div>
        <button style={{
          background: 'transparent', border: 'none',
          color: GP.textTer, fontSize: 18,
          fontFamily: GP.fontData, cursor: 'pointer',
          padding: 2, lineHeight: 1, marginTop: -4,
        }}>×</button>
      </div>

      <Archivo style={{
        display: 'block', marginTop: 10, fontSize: 11,
        color: GP.textSec, letterSpacing: '.02em', lineHeight: 1.45, fontWeight: 'normal',
        textWrap: 'pretty',
      }}>
        You're slightly behind your weight target. Suggesting a calorie tweak and an extra Zone-2 session.
      </Archivo>

      <div style={{
        marginTop: 14,
        border: `2px solid ${GP.warn}`,
        background: GP.warnBg,
        padding: '10px 14px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <Marker style={{ fontSize: 18, color: GP.text, letterSpacing: '.02em' }}>OPEN CHECK-IN →</Marker>
      </div>
    </GCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 4 — GOAL PULSE STRIP (+ TRAJECTORY MODAL)
// ═══════════════════════════════════════════════════════════════

// Build 16-week (112-day) daily series. Day 0 = start, currentDay = 38 (week 6, day 3).
// Returns { daily, rolling7, expected, currentDay, totalDays }
function buildSeries({ start, target, currentValue, drift = 0, noise = 0.5, seed = 1 }) {
  const totalDays = 112; // 16 weeks
  const currentDay = 38; // ~week 6 day 3
  // Deterministic noise
  let s = seed * 9301 + 49297;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  // Expected: linear from start → target over totalDays
  const expected = [];
  for (let i = 0; i <= totalDays; i++) {
    expected.push(start + (target - start) * (i / totalDays));
  }
  // Daily logged data up to currentDay; actual trajectory ends at currentValue
  // Path: start → currentValue + drift smoothing
  const daily = [];
  for (let i = 0; i <= currentDay; i++) {
    const t = i / currentDay;
    // S-curve interp
    const ease = t * t * (3 - 2 * t);
    const base = start + (currentValue - start) * ease;
    daily.push(base + (rand() - 0.5) * 2 * noise);
  }
  // 7-day rolling
  const rolling7 = daily.map((_, i) => {
    const w = daily.slice(Math.max(0, i - 6), i + 1);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
  return { daily, rolling7, expected, currentDay, totalDays };
}

// Determine if higher target is "better"
function isAheadOf(actual, expected, target, start) {
  // If target < start (e.g. losing weight), lower actual = ahead
  if (target < start) return actual <= expected;
  return actual >= expected;
}

function TrajectoryGraph({ goal }) {
  const series = useGPMemo(() => buildSeries(goal.series), [goal.label]);
  const { daily, rolling7, expected, currentDay, totalDays } = series;

  const W = 348, H = 220;
  const padL = 32, padR = 12, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Y range — combine actual + expected + variance band
  const variancePct = goal.variancePct ?? 0.025; // ±2.5% band
  const allValues = [...rolling7, ...expected, ...daily];
  let yMin = Math.min(...allValues), yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.15 || 1;
  yMin -= yPad; yMax += yPad;
  const ySpan = yMax - yMin;

  const xAt = (day) => padL + (day / totalDays) * innerW;
  const yAt = (val) => padT + (1 - (val - yMin) / ySpan) * innerH;

  // Build paths
  const expectedPath = expected.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const rollingPath = rolling7.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  // Variance band — above + below expected
  const bandTopPath = expected.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v * (1 + variancePct)).toFixed(1)}`).join(' ');
  const bandBotPath = expected.map((v, i) => `L ${xAt(i).toFixed(1)} ${yAt(v * (1 - variancePct)).toFixed(1)}`).reverse().join(' ');
  const bandFillPath = bandTopPath + ' ' + bandBotPath + ' Z';

  // Drift
  const currentActual = rolling7[currentDay];
  const currentExpected = expected[currentDay];
  const ahead = isAheadOf(currentActual, currentExpected, goal.series.target, goal.series.start);
  const lineColor = ahead ? GP.pull : GP.legs;
  const delta = currentActual - currentExpected;
  const deltaSign = delta >= 0 ? '+' : '−';
  const deltaAbs = Math.abs(delta).toFixed(1);

  // Hover state
  const [hover, setHover] = React.useState(null); // day index or null
  const svgRef = React.useRef(null);

  function handleMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const x = (cx / rect.width) * W; // svg coords
    if (x < padL || x > W - padR) { setHover(null); return; }
    const day = Math.round(((x - padL) / innerW) * totalDays);
    setHover(Math.max(0, Math.min(totalDays, day)));
  }
  function handleLeave() { setHover(null); }

  // Touch handling
  function handleTouch(e) {
    const t = e.touches[0] || e.changedTouches[0];
    if (!t) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = t.clientX - rect.left;
    const x = (cx / rect.width) * W;
    if (x < padL || x > W - padR) { setHover(null); return; }
    const day = Math.round(((x - padL) / innerW) * totalDays);
    setHover(Math.max(0, Math.min(totalDays, day)));
  }

  // Hover values
  const hoverDay = hover ?? currentDay;
  const hoverIsLogged = hoverDay <= currentDay;
  const hoverActual = hoverIsLogged ? rolling7[hoverDay] : null;
  const hoverExpected = expected[hoverDay];
  const hoverDate = `WEEK ${Math.floor(hoverDay / 7) + 1} · DAY ${(hoverDay % 7) + 1}`;

  // Y-axis ticks (4)
  const ticks = [];
  for (let i = 0; i <= 3; i++) {
    const v = yMin + (ySpan * i / 3);
    ticks.push({ y: yAt(v), v });
  }

  return (
    <div>
      {/* Drift readout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <div>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.18em' }}>
            {hoverIsLogged ? '7-DAY AVG' : 'PROJECTED'}
          </Archivo>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
            <Reenie style={{ fontSize: 42, color: GP.text }}>
              {hoverIsLogged ? hoverActual.toFixed(1) : '—'}
            </Reenie>
            <Archivo style={{ fontSize: 10, color: GP.textTer, letterSpacing: '.12em' }}>
              {goal.series.unit}
            </Archivo>
          </div>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.15em', marginTop: 2, display: 'block' }}>
            {hoverDate}
          </Archivo>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.18em' }}>
            VS EXPECTED
          </Archivo>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4, marginTop: 2,
            padding: '3px 9px',
            border: `1.5px solid ${ahead ? GP.pull : GP.legs}`,
            background: `${ahead ? GP.pull : GP.legs}18`,
          }}>
            <Reenie style={{ fontSize: 28, color: lineColor, lineHeight: 1 }}>
              {deltaSign}{deltaAbs}
            </Reenie>
            <Archivo style={{ fontSize: 9, color: lineColor, letterSpacing: '.12em' }}>
              {goal.series.unit}
            </Archivo>
          </div>
          <Archivo style={{
            display: 'block', marginTop: 4,
            fontSize: 9, color: lineColor, letterSpacing: '.18em',
          }}>
            {ahead ? 'AHEAD OF PLAN' : 'BEHIND PLAN'}
          </Archivo>
        </div>
      </div>

      {/* SVG graph */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleLeave}
      >
        <defs>
          <pattern id="bandHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={GP.info} strokeWidth="1" opacity=".22"/>
          </pattern>
          <filter id="drawSpray" x="-2%" y="-2%" width="104%" height="104%">
            <feGaussianBlur stdDeviation=".3"/>
          </filter>
        </defs>

        {/* Grid lines + Y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y}
                  stroke={GP.borderFaint} strokeWidth="1"
                  strokeDasharray="2 4"/>
            <text x={padL - 6} y={t.y + 3} textAnchor="end"
                  fontFamily={GP.fontData} fontSize="8"
                  fill={GP.textTer} letterSpacing=".10em">
              {t.v.toFixed(goal.series.decimals ?? 0)}
            </text>
          </g>
        ))}

        {/* Block boundaries (every 4 weeks) */}
        {[28, 56, 84].map(d => (
          <line key={d} x1={xAt(d)} y1={padT} x2={xAt(d)} y2={H - padB}
                stroke={GP.borderFaint} strokeWidth="1" strokeDasharray="3 5"/>
        ))}

        {/* Variance band */}
        <path d={bandFillPath} fill="url(#bandHatch)" stroke="none"/>
        <path d={bandFillPath} fill={GP.info} fillOpacity=".06" stroke="none"/>

        {/* Expected line — dashed, faded blue */}
        <path d={expectedPath} fill="none" stroke={GP.info}
              strokeWidth="1.5" strokeDasharray="4 4" opacity=".7"/>

        {/* Today vertical marker */}
        <line x1={xAt(currentDay)} y1={padT} x2={xAt(currentDay)} y2={H - padB}
              stroke={GP.accent} strokeWidth="1.5" opacity=".55"/>
        <text x={xAt(currentDay)} y={padT - 3} textAnchor="middle"
              fontFamily={GP.fontData} fontSize="8"
              fill={GP.accent} letterSpacing=".15em">TODAY</text>

        {/* Rolling avg line — drawn slightly wobbly via filter */}
        <path d={rollingPath} fill="none" stroke={lineColor}
              strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
              filter="url(#drawSpray)"/>
        <path d={rollingPath} fill="none" stroke={lineColor}
              strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
              opacity=".6"/>

        {/* Daily dots — light, small */}
        {daily.map((v, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(v)} r="1.1"
                  fill={lineColor} opacity=".30"/>
        ))}

        {/* Endpoint marker on actual */}
        <circle cx={xAt(currentDay)} cy={yAt(rolling7[currentDay])} r="4.5"
                fill={GP.bg} stroke={lineColor} strokeWidth="2"/>

        {/* Goal endpoint marker */}
        <g>
          <line x1={xAt(totalDays)} y1={yAt(goal.series.target) - 8}
                x2={xAt(totalDays)} y2={yAt(goal.series.target) + 8}
                stroke={GP.accent} strokeWidth="2"/>
          <line x1={xAt(totalDays) - 6} y1={yAt(goal.series.target)}
                x2={xAt(totalDays) + 0} y2={yAt(goal.series.target)}
                stroke={GP.accent} strokeWidth="2"/>
          <text x={xAt(totalDays)} y={yAt(goal.series.target) - 12} textAnchor="end"
                fontFamily={GP.fontData} fontSize="8"
                fill={GP.accent} letterSpacing=".15em">GOAL</text>
        </g>

        {/* X-axis week labels */}
        {[0, 4, 8, 12, 16].map(w => (
          <text key={w} x={xAt(w * 7)} y={H - padB + 14} textAnchor="middle"
                fontFamily={GP.fontData} fontSize="8"
                fill={GP.textTer} letterSpacing=".10em">
            W{w}
          </text>
        ))}

        {/* Hover crosshair */}
        {hover != null && (
          <g>
            <line x1={xAt(hover)} y1={padT} x2={xAt(hover)} y2={H - padB}
                  stroke={GP.borderStrong} strokeWidth="1" strokeDasharray="2 3"/>
            {hoverIsLogged && (
              <circle cx={xAt(hover)} cy={yAt(hoverActual)} r="3.5"
                      fill={lineColor} stroke={GP.bg} strokeWidth="1.5"/>
            )}
            <circle cx={xAt(hover)} cy={yAt(hoverExpected)} r="2.5"
                    fill={GP.info} stroke={GP.bg} strokeWidth="1"/>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 2.5, background: lineColor, borderRadius: 2 }}/>
          <Archivo style={{ fontSize: 8, color: GP.textSec, letterSpacing: '.12em' }}>
            7-DAY AVG
          </Archivo>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="3"><line x1="0" y1="1.5" x2="18" y2="1.5"
                stroke={GP.info} strokeWidth="1.5" strokeDasharray="3 3"/></svg>
          <Archivo style={{ fontSize: 8, color: GP.textSec, letterSpacing: '.12em' }}>
            EXPECTED
          </Archivo>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 8, background: GP.infoBg,
                        border: `1px solid ${GP.infoBorder}` }}/>
          <Archivo style={{ fontSize: 8, color: GP.textSec, letterSpacing: '.12em' }}>
            ±{(variancePct * 100).toFixed(1)}% BAND
          </Archivo>
        </div>
      </div>
    </div>
  );
}

function TrajectoryModal({ goal, onClose }) {
  if (!goal) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: GP.isDark ? 'rgba(0,0,0,.55)' : 'rgba(0,0,0,.40)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadein .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        background: GP.surfaceAlt,
        borderTop: `2px solid ${GP.info}`,
        padding: '16px 18px 22px',
        position: 'relative',
        boxShadow: '0 -8px 30px rgba(0,0,0,.5)',
        maxHeight: '88%',
        overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
          width: 40, height: 4, background: GP.border, borderRadius: 2,
        }}/>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, marginTop: 6, gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
            {goal.icon && (
              <div style={{
                width: 44, height: 44,
                border: `2px solid ${GP.infoBorder}`,
                background: GP.infoBg,
                display: 'grid', placeItems: 'center',
                transform: 'rotate(-3deg)',
                flexShrink: 0,
                marginTop: 2,
              }}>
                <GoalIcon kind={goal.icon} size={26} color="#fff"/>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.20em' }}>
                TRAJECTORY · 16 WEEKS
              </Archivo>
              <Marker style={{
                fontSize: 28, color: GP.text, display: 'block', lineHeight: 1, marginTop: 2,
                transform: 'rotate(-1deg)', transformOrigin: 'left',
              }}>{goal.label}</Marker>
              <SprayUnderline width={Math.min(220, goal.label.length * 14)} style={{ marginTop: 1, marginLeft: -3 }}/>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${GP.border}`,
            color: GP.text, fontSize: 14,
            fontFamily: GP.fontData, cursor: 'pointer',
            width: 32, height: 32, display: 'grid', placeItems: 'center',
            padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        <TrajectoryGraph goal={goal}/>
      </div>
    </div>
  );
}

// ─── Goal icons (stencil-style, graffiti tone) ────────────────
function GoalIcon({ kind, size = 22, color = GP.text, style }) {
  const s = size;
  const stroke = color;
  if (kind === 'weight') {
    // Stencil scale: platform + dial
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="9" width="18" height="11" rx="1.5"/>
          <path d="M3 13 L21 13"/>
          <circle cx="12" cy="16" r="2.4" fill={stroke} stroke="none"/>
          {/* dial ticks */}
          <path d="M6 11 L6 12 M9 11 L9 12 M12 11 L12 12 M15 11 L15 12 M18 11 L18 12" strokeWidth="1.2"/>
          {/* feet */}
          <path d="M5 20 L5 22 M19 20 L19 22"/>
        </g>
      </svg>
    );
  }
  if (kind === 'bench') {
    // Barbell with plates
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* bar */}
          <path d="M2 12 L22 12" strokeWidth="2"/>
          {/* outer plates */}
          <rect x="1" y="9" width="2.5" height="6" rx=".4" fill={stroke} stroke="none"/>
          <rect x="20.5" y="9" width="2.5" height="6" rx=".4" fill={stroke} stroke="none"/>
          {/* inner plates (bigger) */}
          <rect x="4.5" y="6" width="3" height="12" rx=".5" fill={stroke} stroke="none"/>
          <rect x="16.5" y="6" width="3" height="12" rx=".5" fill={stroke} stroke="none"/>
          {/* knurl ring */}
          <path d="M8.5 10 L8.5 14 M15.5 10 L15.5 14" strokeWidth="1.2"/>
        </g>
      </svg>
    );
  }
  if (kind === 'sleep') {
    // Crescent moon + tiny zz
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 14.5 A 7 7 0 1 1 9.5 4.5 A 5.5 5.5 0 0 0 16.5 14.5 Z" fill={stroke} stroke="none"/>
          {/* zzz */}
          <path d="M17 5 L20 5 L17 8 L20 8" strokeWidth="1.4"/>
          <path d="M14 3 L16 3 L14 5 L16 5" strokeWidth="1.2" opacity=".7"/>
        </g>
      </svg>
    );
  }
  if (kind === 'bolt') {
    // Lightning bolt — stress
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
        <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z"
              fill={stroke} stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (kind === 'protein') {
    // Drumstick / chicken leg silhouette
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* meaty top */}
          <path d="M14.5 3 C 19 3 22 6 22 10 C 22 13 20 15 17.5 15 C 16.5 15 16 14.5 15.5 14 L 13.5 16 L 11 18.5 L 9 20.5 C 8 21.5 6.5 21.5 5.5 20.5 C 4.5 19.5 4.5 18 5.5 17 L 7.5 15 L 10 12.5 L 12 10.5 C 11.5 10 11 9.5 11 8.5 C 11 6 13 3 14.5 3 Z"
                fill={stroke} stroke="none"/>
          {/* bone end */}
          <circle cx="6" cy="19" r="1.5" fill={stroke} stroke="none"/>
          <circle cx="7.5" cy="20.5" r="1.2" fill={stroke} stroke="none"/>
        </g>
      </svg>
    );
  }
  return null;
}

// Mini trajectory chart for goal cards: actual line, expected dashed line,
// target line at end, current dot. Compact — communicates the trajectory story.
function MiniTrajectory({ goal, color, width = 100, height = 38 }) {
  const series = useGPMemo(() => buildSeries(goal.series), [goal.label]);
  const { rolling7, expected, currentDay, totalDays } = series;

  const padT = 4, padB = 4, padL = 2, padR = 2;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const all = [...rolling7, ...expected];
  let yMin = Math.min(...all), yMax = Math.max(...all);
  const yPad = (yMax - yMin) * 0.2 || 1;
  yMin -= yPad; yMax += yPad;
  const ySpan = yMax - yMin;

  const xAt = (d) => padL + (d / totalDays) * innerW;
  const yAt = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const expectedPath = expected.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const rollingPath = rolling7.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* expected dashed */}
      <path d={expectedPath} fill="none" stroke={GP.info}
            strokeWidth="1" strokeDasharray="2 2" opacity=".55"/>
      {/* actual rolling */}
      <path d={rollingPath} fill="none" stroke={color}
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* current dot */}
      <circle cx={xAt(currentDay)} cy={yAt(rolling7[currentDay])} r="2.2"
              fill={color} stroke={GP.bg} strokeWidth="1"/>
      {/* goal target marker */}
      <circle cx={xAt(totalDays)} cy={yAt(goal.series.target)} r="1.8"
              fill={GP.accent}/>
    </svg>
  );
}

function GoalCard({ goal, tilt = 0, onTap }) {
  const { label, value, unit, target, tone, status, icon, series } = goal;
  const toneColor = tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs;

  // Compute drift for badge
  const s = useGPMemo(() => buildSeries(series), [label]);
  const delta = s.rolling7[s.currentDay] - s.expected[s.currentDay];
  const ahead = series.target < series.start ? delta <= 0 : delta >= 0;
  const sign = delta >= 0 ? '+' : '−';
  const deltaAbs = Math.abs(delta).toFixed(series.decimals ?? 1);

  return (
    <button onClick={onTap} style={{
      flex: '0 0 116px',
      background: GP.surface,
      border: `1px solid ${GP.borderFaint}`,
      padding: '10px 9px 9px',
      transform: `rotate(${tilt}deg)`,
      boxShadow: '0 2px 0 rgba(0,0,0,.30)',
      position: 'relative',
      textAlign: 'left',
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* row 1: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{
          width: 24, height: 24,
          border: `1.5px solid ${toneColor}66`,
          background: `${toneColor}12`,
          display: 'grid', placeItems: 'center',
          transform: 'rotate(-3deg)',
          flexShrink: 0,
        }}>
          <GoalIcon kind={icon} size={14} color={toneColor}/>
        </div>
        <Archivo style={{
          fontSize: 8, color: GP.textTer, letterSpacing: '.14em',
          lineHeight: 1.05, flex: 1, minWidth: 0,
        }}>{label}</Archivo>
      </div>

      {/* row 2: value + unit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, lineHeight: 1 }}>
        <Reenie style={{ fontSize: 34, color: GP.text }}>{value}</Reenie>
        <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>{unit}</Archivo>
      </div>

      {/* row 3: mini trajectory chart */}
      <div style={{ position: 'relative' }}>
        <MiniTrajectory goal={goal} color={toneColor} width={98} height={32}/>
        {/* delta badge */}
        <div style={{
          position: 'absolute', top: -2, right: -2,
          padding: '1px 4px',
          background: `${toneColor}22`,
          border: `1px solid ${toneColor}66`,
          fontFamily: GP.fontData,
          fontSize: 8, color: toneColor, letterSpacing: '.05em',
          lineHeight: 1.1,
        }}>
          {sign}{deltaAbs}
        </div>
      </div>

      {/* row 4: target + tap hint */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 5,
        borderTop: `1px dashed ${GP.borderFaint}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, background: GP.accent, borderRadius: '50%' }}/>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>
            {target}{unit === 'HRS' ? 'h' : ''}
          </Archivo>
        </div>
        <Archivo style={{
          fontSize: 7, color: GP.textTer, letterSpacing: '.18em',
        }}>
          GRAPH →
        </Archivo>
      </div>
    </button>
  );
}

const GOALS = [
  { label: 'BODY WEIGHT', icon: 'weight', value: '180.6', unit: 'LB', target: '168',
    spark: [182.1, 182.4, 181.8, 182.0, 181.5, 181.4, 181.1, 181.0, 180.8, 180.6, 180.7, 180.5, 180.6, 180.6],
    tone: 'red', status: 'BEHIND', tilt: -0.4,
    series: { start: 184, target: 168, currentValue: 180.6, unit: 'LB', decimals: 1, noise: 0.6, seed: 7 },
    variancePct: 0.012,
  },
  { label: 'BENCH 1RM', icon: 'bench', value: '245', unit: 'LB', target: '275',
    spark: [225, 225, 230, 230, 232, 235, 235, 237, 240, 240, 242, 243, 245, 245],
    tone: 'green', status: 'ON TRACK', tilt: 0.5,
    series: { start: 220, target: 275, currentValue: 245, unit: 'LB', decimals: 0, noise: 1.4, seed: 13 },
    variancePct: 0.025,
  },
  { label: 'SLEEP AVG', icon: 'sleep', value: '6.4', unit: 'HRS', target: '7.5',
    spark: [6.0, 6.5, 7.1, 6.2, 5.8, 6.4, 6.7, 6.8, 6.1, 5.9, 6.5, 6.6, 6.3, 6.4],
    tone: 'yellow', status: 'BELOW', tilt: -0.3,
    series: { start: 6.2, target: 7.5, currentValue: 6.4, unit: 'HRS', decimals: 1, noise: 0.45, seed: 21 },
    variancePct: 0.04,
  },
];

function GoalPulse({ initialOpen = null }) {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <>
      <div style={{
        display: 'flex', gap: 8,
        padding: '4px 18px 12px', margin: '0 -18px',
        justifyContent: 'space-between',
      }}>
        {GOALS.map(g => (
          <GoalCard key={g.label} goal={g} tilt={g.tilt} onTap={() => setOpen(g)}/>
        ))}
      </div>
      {open && <TrajectoryModal goal={open} onClose={() => setOpen(null)}/>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 5 — SUB-TAB NAV
// ═══════════════════════════════════════════════════════════════
function SubTabs({ active = 'training' }) {
  const tabs = [
    { id: 'training',  label: 'TRAINING' },
    { id: 'nutrition', label: 'NUTRITION' },
    { id: 'lifestyle', label: 'LIFESTYLE' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 18, padding: '8px 18px 4px',
      borderBottom: `1px dashed ${GP.borderFaint}`,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ position: 'relative', paddingBottom: 6 }}>
            <Marker style={{
              fontSize: 16,
              color: isActive ? GP.textOnBg : GP.textOnBgTer,
              letterSpacing: '.02em',
              transform: `rotate(${isActive ? -.8 : 0}deg)`,
              display: 'inline-block', transformOrigin: 'left',
            }}>{t.label}</Marker>
            {isActive && <SprayUnderline width={t.label.length * 11 + 6} style={{ marginLeft: -3, marginTop: -2 }}/>}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 6 — TRAINING TAB CONTENT
// ═══════════════════════════════════════════════════════════════

function BlockTimeline() {
  const blocks = [
    { name: 'BASE',     weeks: 4, color: GP.textTer },
    { name: 'STRENGTH', weeks: 5, color: GP.info, current: true, currentWeek: 2 },
    { name: 'POWER',    weeks: 4, color: '#9C27B0' },
    { name: 'PEAK',     weeks: 3, color: GP.core },
  ];
  const total = blocks.reduce((s, b) => s + b.weeks, 0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, height: 28, marginBottom: 6 }}>
        {blocks.map((b, i) => {
          const w = (b.weeks / total) * 100;
          const isCurrent = b.current;
          return (
            <div key={b.name} style={{
              flex: `0 0 ${w}%`, position: 'relative',
              background: isCurrent ? b.color : GP.borderFaint,
              border: isCurrent ? `1px solid ${b.color}` : `1px solid ${GP.borderFaint}`,
              opacity: isCurrent ? 1 : 0.85,
            }}>
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: -6, bottom: -6,
                  left: `${(b.currentWeek / b.weeks) * 100}%`,
                  width: 3,
                  background: GP.text,
                  boxShadow: `0 0 6px ${GP.text}aa`,
                }}/>
              )}
              <Archivo style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: isCurrent ? '#fff' : GP.textTer,
                letterSpacing: '.1em',
              }}>
                B{i+1}
              </Archivo>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {blocks.map(b => (
          <Archivo key={b.name} style={{
            fontSize: 8, letterSpacing: '.15em',
            color: b.current ? GP.text : GP.textTer,
          }}>{b.name}</Archivo>
        ))}
      </div>
    </div>
  );
}

function WeekSchedule() {
  const days = [
    { d: 'MON', t: 'PUSH', kind: 'push', state: 'done' },
    { d: 'TUE', t: 'OFF',  kind: 'off',  state: 'done' },
    { d: 'WED', t: 'PULL', kind: 'pull', state: 'today' },
    { d: 'THU', t: 'LEGS', kind: 'legs', state: 'future' },
    { d: 'FRI', t: 'PUSH', kind: 'push', state: 'future' },
    { d: 'SAT', t: 'CORE', kind: 'core', state: 'future' },
    { d: 'SUN', t: 'OFF',  kind: 'off',  state: 'future' },
  ];
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {days.map((d, i) => {
        const c = MOVE[d.kind];
        const isToday = d.state === 'today';
        const isDone = d.state === 'done';
        return (
          <div key={i} style={{
            flex: 1, position: 'relative',
            border: isToday ? `2px solid ${c}` : `1px solid ${isDone ? c + '66' : GP.borderFaint}`,
            background: isToday ? `${c}22` : isDone ? `${c}10` : 'transparent',
            padding: '6px 0 7px',
            textAlign: 'center',
            transform: `rotate(${i % 2 === 0 ? -.4 : .3}deg)`,
            opacity: d.state === 'future' && d.kind === 'off' ? 0.5 : 1,
          }}>
            <Archivo style={{
              display: 'block', fontSize: 8,
              color: isToday ? '#fff' : GP.textTer,
              letterSpacing: '.10em',
            }}>{d.d}</Archivo>
            <div style={{
              width: 6, height: 6,
              background: c,
              margin: '4px auto 4px',
              opacity: d.kind === 'off' ? 0.4 : 1,
            }}/>
            <Archivo style={{
              display: 'block', fontSize: 8,
              color: isToday ? c : isDone ? GP.textSec : GP.textTer,
              letterSpacing: '.08em',
            }}>{d.t}</Archivo>
            {isDone && (
              <div style={{
                position: 'absolute', top: 2, right: 3,
                color: c, fontSize: 9, fontFamily: GP.fontData,
              }}>✓</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EditPlanBtn({ align = 'flex-end' }) {
  return (
    <div style={{ display: 'flex', justifyContent: align, marginTop: 12 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Archivo style={{
          fontSize: 11, color: GP.textSec,
          letterSpacing: '.18em',
        }}>EDIT PLAN</Archivo>
        <ButtonSpray width={88} color={GP.textSec} style={{ marginTop: -1 }}/>
      </div>
    </div>
  );
}

function TrainingTab() {
  return (
    <div style={{ padding: '16px 18px 8px' }}>
      <SectionH kicker="STRUCTURE" sprayWidth={130} color={GP.info}>PROGRAM MAP</SectionH>
      <BlockTimeline/>

      <div style={{ height: 18 }}/>
      <SectionH kicker="THIS WEEK" sprayWidth={140} color={GP.info}>SCHEDULE</SectionH>
      <WeekSchedule/>

      <EditPlanBtn/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 6 (alt) — NUTRITION TAB
// ═══════════════════════════════════════════════════════════════
function NutritionTab() {
  const macros = [
    { label: 'PROTEIN', cur: 142, target: 180, unit: 'G', color: GP.pull },
    { label: 'CARBS',   cur: 220, target: 280, unit: 'G', color: GP.core },
    { label: 'FAT',     cur:  58, target:  70, unit: 'G', color: GP.legs },
  ];
  const calCur = 1840, calTarget = 2400;
  const calPct = (calCur / calTarget) * 100;
  return (
    <div style={{ padding: '16px 18px 8px' }}>
      <SectionH kicker="TODAY" sprayWidth={120} color={GP.info}>CALORIES</SectionH>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Calorie ring */}
        <svg width="86" height="86" viewBox="0 0 86 86" style={{ transform: 'rotate(-2deg)' }}>
          <circle cx="43" cy="43" r="36" fill="none" stroke={GP.borderFaint} strokeWidth="6"/>
          <circle cx="43" cy="43" r="36" fill="none" stroke={GP.info} strokeWidth="6"
                  strokeDasharray={`${(calPct/100) * 226} 226`}
                  strokeDashoffset="0"
                  transform="rotate(-90 43 43)"
                  strokeLinecap="butt"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <Reenie style={{ fontSize: 44, color: GP.textOnBg }}>{calCur.toLocaleString()}</Reenie>
            <Archivo style={{ fontSize: 9, color: GP.textOnBgTer, letterSpacing: '.15em' }}>KCAL</Archivo>
          </div>
          <Archivo style={{ fontSize: 9, color: GP.textOnBgTer, letterSpacing: '.12em' }}>
            OF <Reenie style={{ fontSize: 22, color: GP.textOnBgSec, verticalAlign: 'baseline' }}>{calTarget.toLocaleString()}</Reenie> TARGET
          </Archivo>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusDot tone="yellow"/>
            <Archivo style={{ fontSize: 9, color: GP.core, letterSpacing: '.15em' }}>560 LEFT</Archivo>
          </div>
        </div>
      </div>

      <DashedDivider style={{ margin: '14px 0 8px' }}/>

      <SectionH kicker="MACROS" sprayWidth={110} color={GP.info}>SPLIT</SectionH>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {macros.map(m => {
          const pct = (m.cur / m.target) * 100;
          return (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <Archivo style={{ fontSize: 10, color: GP.textOnBgSec, letterSpacing: '.15em' }}>{m.label}</Archivo>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <Reenie style={{ fontSize: 22, color: GP.textOnBg }}>{m.cur}</Reenie>
                  <Archivo style={{ fontSize: 9, color: GP.textOnBgTer, letterSpacing: '.10em' }}>/ {m.target}{m.unit.toLowerCase()}</Archivo>
                </div>
              </div>
              <div style={{
                height: 7, background: GP.borderFaint,
                border: `1px solid ${GP.borderFaint}`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0,
                  width: `${Math.min(pct, 100)}%`,
                  background: `repeating-linear-gradient(45deg, ${m.color} 0 4px, ${m.color}cc 4px 8px)`,
                }}/>
              </div>
            </div>
          );
        })}
      </div>

      <DashedDivider style={{ margin: '12px 0 8px' }}/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Archivo style={{ fontSize: 8, color: GP.textOnBgTer, letterSpacing: '.18em' }}>NEXT REFEED</Archivo>
          <Marker style={{ fontSize: 14, color: GP.textOnBg, display: 'block', marginTop: 1 }}>SUN · WK 8</Marker>
        </div>
        <div style={{ position: 'relative' }}>
          <Archivo style={{ fontSize: 11, color: GP.textOnBgSec, letterSpacing: '.18em' }}>EDIT PLAN</Archivo>
          <ButtonSpray width={88} color={GP.textSec} style={{ marginTop: -1 }}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REGION 6 (alt) — LIFESTYLE TAB
// ═══════════════════════════════════════════════════════════════
// Common card chrome for lifestyle metrics.
// Each card shows: icon | name + status pill | hero value | trajectory chart vs plan | footer.
function LifestyleShell({ name, icon, tone, tilt, statusLabel, kicker, hero, chart, footer }) {
  const toneColor = tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : tone === 'red' ? GP.legs : GP.textTer;
  return (
    <button style={{
      width: '100%',
      background: GP.surface,
      border: `1px solid ${GP.borderFaint}`,
      borderLeft: `4px solid ${toneColor}`,
      padding: '14px 14px 12px',
      transform: `rotate(${tilt}deg)`,
      boxShadow: '0 2px 0 rgba(0,0,0,.30), 0 6px 14px rgba(0,0,0,.18)',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
      color: 'inherit',
      position: 'relative',
    }}>
      {/* header row: icon · name+kicker · status pill */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          border: `1.5px solid ${toneColor}66`,
          background: `${toneColor}14`,
          display: 'grid', placeItems: 'center',
          transform: 'rotate(-3deg)',
          flexShrink: 0,
        }}>
          <GoalIcon kind={icon} size={20} color={toneColor}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.20em', display: 'block' }}>{kicker}</Archivo>
          <Marker style={{
            fontSize: 18, color: GP.text, display: 'block', lineHeight: 1.05,
            transform: 'rotate(-.6deg)', transformOrigin: 'left',
          }}>{name}</Marker>
        </div>
        <div style={{
          padding: '3px 7px',
          border: `1px solid ${toneColor}66`,
          background: `${toneColor}14`,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          flexShrink: 0,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: toneColor, boxShadow: `0 0 6px ${toneColor}88` }}/>
          <Archivo style={{ fontSize: 8, color: toneColor, letterSpacing: '.16em' }}>{statusLabel}</Archivo>
        </div>
      </div>

      {/* hero value */}
      <div style={{ marginTop: 8 }}>
        {hero}
      </div>

      {/* trajectory / plan chart */}
      <div style={{ marginTop: 8 }}>
        {chart}
      </div>

      {/* footer */}
      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: `1px dashed ${GP.borderFaint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {footer}
        <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.20em' }}>
          OPEN DETAIL →
        </Archivo>
      </div>
    </button>
  );
}

// SLEEP — daily values + plan-expected trajectory, like the modal but inline.
// Builds 38 days of history (current day 38 of 112-day plan).
function SleepCard({ tilt = -0.4 }) {
  const series = useGPMemo(() => buildSeries({
    start: 6.0, target: 7.5, currentValue: 6.4,
    decimals: 1, noise: 0.55, seed: 21,
  }), []);
  const { daily, rolling7, expected, currentDay, totalDays } = series;

  // Visible window: first currentDay+1 days only (history). Show 38 of 112.
  const histDays = currentDay + 1;
  const W = 348, H = 86, padT = 8, padB = 16, padL = 22, padR = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  let yMin = 4.5, yMax = 9; // 4.5h–9h sleep window
  const ySpan = yMax - yMin;
  const xAt = (d) => padL + (d / (totalDays - 1)) * innerW;
  const yAt = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const expectedPath = expected.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const rollingPath = rolling7.slice(0, histDays).map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');

  // 7-day average for hero
  const last7 = daily.slice(Math.max(0, currentDay - 6), currentDay + 1);
  const avg = last7.reduce((s, v) => s + v, 0) / last7.length;
  const avgH = Math.floor(avg);
  const avgM = Math.round((avg - avgH) * 60);
  const expectedHere = expected[currentDay];
  const delta = avg - expectedHere;
  const tone = delta < -0.5 ? 'red' : delta < -0.15 ? 'yellow' : 'green';
  const status = tone === 'red' ? 'BEHIND' : tone === 'yellow' ? 'BELOW' : 'ON TRACK';

  // Target band (target ± 0.25h)
  const targetTop = yAt(7.75);
  const targetBot = yAt(7.25);

  // Week ticks
  const weekTicks = [0, 4, 8, 12, 16];

  return (
    <LifestyleShell
      name="SLEEP"
      icon="sleep"
      tone={tone}
      tilt={tilt}
      kicker="HOURS PER NIGHT"
      statusLabel={status}
      hero={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: GP.text, lineHeight: .85 }}>
            {avgH}<span style={{ fontSize: 28 }}>h</span> {avgM}<span style={{ fontSize: 28 }}>m</span>
          </Reenie>
          <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.14em' }}>
            7-DAY AVG
          </Archivo>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.14em', display: 'block' }}>
              VS PLAN
            </Archivo>
            <Archivo style={{
              fontSize: 13, color: tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs,
              letterSpacing: '.04em',
            }}>
              {delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}h
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} style={{ display: 'block' }}>
          {/* target band (yellow) */}
          <rect x={padL} y={targetTop} width={innerW} height={targetBot - targetTop}
                fill={GP.accent} opacity=".08"/>
          <line x1={padL} y1={targetTop} x2={W - padR} y2={targetTop}
                stroke={GP.accent} strokeWidth="1" strokeDasharray="2 3" opacity=".5"/>
          {/* y-axis ticks */}
          {[5, 6, 7, 8].map(v => (
            <g key={v}>
              <line x1={padL - 2} y1={yAt(v)} x2={padL} y2={yAt(v)} stroke={GP.border} strokeWidth="1"/>
              <text x={padL - 4} y={yAt(v) + 2.5} fontSize="7" fill={GP.textTer}
                    fontFamily={GP.fontData} textAnchor="end" letterSpacing=".05em">
                {v}h
              </text>
            </g>
          ))}
          {/* expected dashed plan line */}
          <path d={expectedPath} fill="none" stroke={GP.info}
                strokeWidth="1.2" strokeDasharray="3 3" opacity=".6"/>
          {/* daily dots (history only) */}
          {daily.slice(0, histDays).map((v, i) => {
            const exp = expected[i];
            const offBand = v < 7.25 || v > 7.75;
            return (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="1.4"
                      fill={offBand ? GP.borderStrong : GP.pull}
                      opacity=".7"/>
            );
          })}
          {/* rolling-7 actual line */}
          <path d={rollingPath} fill="none"
                stroke={tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* current marker */}
          <circle cx={xAt(currentDay)} cy={yAt(rolling7[currentDay])} r="3"
                  fill="#fff" stroke={tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs}
                  strokeWidth="1.5"/>
          {/* week ticks */}
          {weekTicks.map(w => {
            const d = (w / 16) * (totalDays - 1);
            return (
              <g key={w}>
                <line x1={xAt(d)} y1={H - padB} x2={xAt(d)} y2={H - padB + 3}
                      stroke={GP.border} strokeWidth="1"/>
                <text x={xAt(d)} y={H - 3} fontSize="7" fill={GP.textTer}
                      fontFamily={GP.fontData} textAnchor="middle" letterSpacing=".08em">
                  W{w}
                </text>
              </g>
            );
          })}
          {/* "today" vertical marker line */}
          <line x1={xAt(currentDay)} y1={padT} x2={xAt(currentDay)} y2={H - padB}
                stroke="#fff" strokeWidth=".7" strokeDasharray="1 2" opacity=".4"/>
        </svg>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 2, background: GP.info, display: 'inline-block', opacity: .6 }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>PLAN</Archivo>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, background: GP.accent }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>TARGET 7.5h</Archivo>
          </div>
        </div>
      }
    />
  );
}

// STRESS — daily logs (1–10), with a "stay below 5" plan band.
// Adherence: % of plan days at or below threshold.
function StressCard({ tilt = 0.4 }) {
  const data = useGPMemo(() => {
    // 39 days of stress (1–10), most below 5.
    const arr = [];
    let s = 31 * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 39; i++) {
      const base = 3.2 + Math.sin(i / 4) * 0.8;
      const spike = rand() > 0.85 ? rand() * 4.5 : 0;
      arr.push(Math.max(1, Math.min(10, Math.round(base + (rand() - .5) * 2 + spike))));
    }
    arr[arr.length - 1] = 4; // today
    return arr;
  }, []);

  const target = 5;
  const hits = data.filter(v => v <= target).length;
  const adherence = Math.round((hits / data.length) * 100);
  const tone = adherence >= 80 ? 'green' : adherence >= 60 ? 'yellow' : 'red';
  const status = tone === 'green' ? 'IN BAND' : tone === 'yellow' ? 'OK' : 'OVER';
  const today = data[data.length - 1];

  const W = 348, H = 86, padT = 8, padB = 16, padL = 22, padR = 8;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const totalDays = 112;
  const yMin = 0, yMax = 10;
  const ySpan = yMax - yMin;
  const xAt = (d) => padL + (d / (totalDays - 1)) * innerW;
  const yAt = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const targetY = yAt(target);
  const weekTicks = [0, 4, 8, 12, 16];
  const barW = (innerW / totalDays) * 0.85;

  return (
    <LifestyleShell
      name="STRESS"
      icon="bolt"
      tone={tone}
      tilt={tilt}
      kicker="DAILY 1–10 SCALE"
      statusLabel={status}
      hero={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: GP.text, lineHeight: .85 }}>{today}</Reenie>
          <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.14em' }}>
            / 10 · TODAY
          </Archivo>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.14em', display: 'block' }}>
              IN BAND
            </Archivo>
            <Archivo style={{
              fontSize: 13, color: tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs,
              letterSpacing: '.04em',
            }}>
              {hits}/{data.length} · {adherence}%
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} style={{ display: 'block' }}>
          {/* over-band shading */}
          <rect x={padL} y={padT} width={innerW} height={targetY - padT}
                fill="#D9534F" opacity=".06"/>
          {/* target threshold line */}
          <line x1={padL} y1={targetY} x2={W - padR} y2={targetY}
                stroke={GP.accent} strokeWidth="1.2" strokeDasharray="3 3" opacity=".7"/>
          <text x={W - padR - 2} y={targetY - 3} fontSize="7" fill={GP.accent}
                fontFamily={GP.fontData} textAnchor="end" letterSpacing=".08em" opacity=".85">
            ≤ {target} TARGET
          </text>
          {/* y-axis ticks */}
          {[2, 5, 8].map(v => (
            <g key={v}>
              <line x1={padL - 2} y1={yAt(v)} x2={padL} y2={yAt(v)} stroke={GP.border} strokeWidth="1"/>
              <text x={padL - 4} y={yAt(v) + 2.5} fontSize="7" fill={GP.textTer}
                    fontFamily={GP.fontData} textAnchor="end" letterSpacing=".05em">{v}</text>
            </g>
          ))}
          {/* daily bars */}
          {data.map((v, i) => {
            const x = xAt(i) - barW / 2;
            const top = yAt(v);
            const overBand = v > target;
            return (
              <rect key={i} x={x} y={top} width={barW} height={Math.max(1, (H - padB) - top)}
                    fill={overBand ? GP.legs : GP.pull}
                    opacity={i === data.length - 1 ? 1 : .55}/>
            );
          })}
          {/* week ticks */}
          {weekTicks.map(w => {
            const d = (w / 16) * (totalDays - 1);
            return (
              <g key={w}>
                <line x1={xAt(d)} y1={H - padB} x2={xAt(d)} y2={H - padB + 3}
                      stroke={GP.border} strokeWidth="1"/>
                <text x={xAt(d)} y={H - 3} fontSize="7" fill={GP.textTer}
                      fontFamily={GP.fontData} textAnchor="middle" letterSpacing=".08em">
                  W{w}
                </text>
              </g>
            );
          })}
          {/* today line */}
          <line x1={xAt(data.length - 1)} y1={padT} x2={xAt(data.length - 1)} y2={H - padB}
                stroke="#fff" strokeWidth=".7" strokeDasharray="1 2" opacity=".4"/>
        </svg>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: GP.pull }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>IN BAND</Archivo>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: GP.legs }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>OVER</Archivo>
          </div>
        </div>
      }
    />
  );
}

// PROTEIN HIT — adherence calendar grid: weeks × 7 days, hit/miss/empty.
// Plan goal: hit ≥6 of 7 days per week.
function ProteinHitCard({ tilt = -0.3 }) {
  const totalWeeks = 16;
  const currentWeek = 6, currentDayInWeek = 3; // Wed of week 6
  const weeks = useGPMemo(() => {
    let s = 53 * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const out = [];
    for (let w = 0; w < totalWeeks; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        if (w > currentWeek - 1 || (w === currentWeek - 1 && d > currentDayInWeek)) {
          days.push('future');
        } else if (w === currentWeek - 1 && d === currentDayInWeek) {
          days.push('today-pending');
        } else {
          // Drift: harder lately. Earlier weeks more consistent.
          const baseHit = w < 3 ? 0.92 : w < 5 ? 0.78 : 0.65;
          days.push(rand() < baseHit ? 'hit' : 'miss');
        }
      }
      out.push(days);
    }
    return out;
  }, []);

  // Compute stats over completed days
  let hits = 0, total = 0, currentStreak = 0, missedThisWeek = 0;
  for (let w = 0; w < totalWeeks; w++) {
    for (let d = 0; d < 7; d++) {
      const cell = weeks[w][d];
      if (cell === 'hit') { hits++; total++; }
      else if (cell === 'miss') { total++; }
    }
  }
  // streak (back from yesterday)
  for (let w = currentWeek - 1; w >= 0; w--) {
    const startD = w === currentWeek - 1 ? currentDayInWeek - 1 : 6;
    for (let d = startD; d >= 0; d--) {
      const c = weeks[w][d];
      if (c === 'hit') currentStreak++;
      else { w = -1; break; }
    }
  }
  // this week missed (excl today)
  for (let d = 0; d < currentDayInWeek; d++) {
    if (weeks[currentWeek - 1][d] === 'miss') missedThisWeek++;
  }

  const adherence = total ? Math.round((hits / total) * 100) : 0;
  const tone = adherence >= 85 ? 'green' : adherence >= 70 ? 'yellow' : 'red';
  const status = tone === 'green' ? 'STRONG' : tone === 'yellow' ? 'SLIPPING' : 'BEHIND';

  // Grid sizing: 16 weeks horizontal, 7 days vertical
  const W = 348, H = 86, padT = 4, padB = 12, padL = 22, padR = 4;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const cellW = innerW / totalWeeks;
  const cellH = innerH / 7;
  const cellPad = 1.2;
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <LifestyleShell
      name="PROTEIN HIT"
      icon="protein"
      tone={tone}
      tilt={tilt}
      kicker="180g+ DAILY · 6/7 WEEKLY"
      statusLabel={status}
      hero={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: GP.text, lineHeight: .85 }}>{adherence}<span style={{ fontSize: 28 }}>%</span></Reenie>
          <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.14em' }}>
            {hits}/{total} DAYS HIT
          </Archivo>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.14em', display: 'block' }}>
              STREAK
            </Archivo>
            <Archivo style={{
              fontSize: 13, color: tone === 'green' ? GP.pull : tone === 'yellow' ? GP.core : GP.legs,
              letterSpacing: '.04em',
            }}>
              {currentStreak}D
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} style={{ display: 'block' }}>
          {/* day labels */}
          {dayLabels.map((dl, i) => (
            <text key={i} x={padL - 4} y={padT + cellH * (i + 0.7)} fontSize="7"
                  fill={GP.textTer} fontFamily={GP.fontData}
                  textAnchor="end" letterSpacing=".05em">
              {dl}
            </text>
          ))}
          {/* cells */}
          {weeks.map((week, w) => week.map((cell, d) => {
            const x = padL + cellW * w + cellPad;
            const y = padT + cellH * d + cellPad;
            const cw = cellW - cellPad * 2;
            const ch = cellH - cellPad * 2;
            let fill = GP.borderFaint;
            let stroke = GP.borderFaint;
            let opacity = 1;
            if (cell === 'hit') { fill = GP.pull; stroke = GP.pull; opacity = .85; }
            else if (cell === 'miss') { fill = GP.legs; stroke = GP.legs; opacity = .55; }
            else if (cell === 'today-pending') { fill = 'rgba(245,220,60,.18)'; stroke = GP.accent; }
            return (
              <rect key={`${w}-${d}`} x={x} y={y} width={cw} height={ch}
                    fill={fill} stroke={stroke} strokeWidth=".6" opacity={opacity}/>
            );
          }))}
          {/* week tick labels every 4w */}
          {[0, 4, 8, 12, 16].map(w => (
            <text key={w} x={padL + cellW * w} y={H - 2} fontSize="7"
                  fill={GP.textTer} fontFamily={GP.fontData}
                  textAnchor="middle" letterSpacing=".08em">
              W{w}
            </text>
          ))}
          {/* today vertical line */}
          <line x1={padL + cellW * (currentWeek - 1) + cellW * (currentDayInWeek + 0.5)}
                y1={padT} 
                x2={padL + cellW * (currentWeek - 1) + cellW * (currentDayInWeek + 0.5)}
                y2={padT + innerH}
                stroke="#fff" strokeWidth=".7" strokeDasharray="1 2" opacity=".5"/>
        </svg>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: GP.pull, opacity: .85 }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>HIT</Archivo>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, background: GP.legs, opacity: .55 }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>MISS</Archivo>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, border: `1px solid ${GP.accent}`, background: GP.accentFaint }}/>
            <Archivo style={{ fontSize: 8, color: GP.textTer, letterSpacing: '.10em' }}>TODAY</Archivo>
          </div>
        </div>
      }
    />
  );
}

function LifestyleTab() {
  return (
    <div style={{ padding: '16px 18px 8px' }}>
      <SectionH kicker="HABITS · 16-WEEK PLAN" sprayWidth={170} color={GP.info}>DAILY VITALS</SectionH>
      <Archivo style={{
        display: 'block', fontSize: 10, color: GP.textOnBgTer,
        letterSpacing: '.04em', lineHeight: 1.45, fontWeight: 'normal',
        marginBottom: 12, textWrap: 'pretty',
      }}>
        Where you're at vs the plan to date. Solid line = you. Dashed = plan.
      </Archivo>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SleepCard tilt={-0.4}/>
        <StressCard tilt={0.4}/>
        <ProteinHitCard tilt={-0.3}/>
      </div>
      <EditPlanBtn/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN COMPOSITION
// ═══════════════════════════════════════════════════════════════

function ScreenShell({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      ...concreteBg,
      overflow: 'hidden',
    }}>
      <SprayDotsLayer seed={3}/>
      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'auto',
        paddingBottom: 78,
      }}>
        {children}
      </div>
    </div>
  );
}

// MAIN — Training tab active, Variant A (workout not logged)
function ScreenMain({ openGoal = null }) {
  return (
    <ScreenShell>
      <StatusStrip/>
      <div style={{ position: 'relative', padding: '14px 18px 0' }}>
        {/* Floating FRESH stamp top-right of canvas (per spec — always visible somewhere) */}
        <div style={{ position: 'absolute', top: -2, right: 14, zIndex: 5 }}>
          <FreshTape rotate={8} size="sm"/>
        </div>

        <SectionH kicker="UP NEXT" sprayWidth={120} color={GP.info} style={{ marginBottom: 10 }}>NEXT ACTION</SectionH>
        <NextActionPull tilt={0.4}/>

        <div style={{ height: 14 }}/>
        <CheckInCard tilt={-0.3}/>

        <div style={{ height: 16 }}/>
        <SectionH kicker="TARGETS" sprayWidth={130} color={GP.info} style={{ marginBottom: 4 }}>GOAL PULSE</SectionH>
      </div>
      <GoalPulse initialOpen={openGoal}/>

      <div style={{ height: 6 }}/>
      <SubTabs active="training"/>
      <TrainingTab/>
    </ScreenShell>
  );
}

// VARIANT — Trajectory modal open (Body Weight, BEHIND)
function ScreenTrajectory() {
  return <ScreenMain openGoal={GOALS[0]}/>;
}
function ScreenTrajectoryBench() {
  return <ScreenMain openGoal={GOALS[1]}/>;
}

// VARIANT — Workout logged (today)
function ScreenLogged() {
  return (
    <ScreenShell>
      <StatusStrip/>
      <div style={{ padding: '14px 18px 0' }}>
        <SectionH kicker="DONE TODAY" sprayWidth={140} color={GP.pull} style={{ marginBottom: 10 }}>NEXT ACTION</SectionH>
        <NextActionLogged tilt={-0.3}/>
        <div style={{ height: 16 }}/>
        <SectionH kicker="TARGETS" sprayWidth={130} color={GP.info} style={{ marginBottom: 4 }}>GOAL PULSE</SectionH>
      </div>
      <GoalPulse/>
      <div style={{ height: 6 }}/>
      <SubTabs active="training"/>
      <TrainingTab/>
    </ScreenShell>
  );
}

// PREVIEW — Nutrition tab
function ScreenNutrition() {
  return (
    <ScreenShell>
      <StatusStrip/>
      <SubTabs active="nutrition"/>
      <NutritionTab/>
    </ScreenShell>
  );
}

// PREVIEW — Lifestyle tab
function ScreenLifestyle() {
  return (
    <ScreenShell>
      <StatusStrip/>
      <SubTabs active="lifestyle"/>
      <LifestyleTab/>
    </ScreenShell>
  );
}

// STATE — No active Gameplan / empty
function ScreenEmpty() {
  return (
    <ScreenShell>
      <div style={{
        position: 'relative',
        padding: '60px 24px 0',
        height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      }}>
        <div style={{ position: 'absolute', top: 24, right: 24 }}>
          <FreshTape rotate={6} size="sm" label="NEW"/>
        </div>

        <Marker style={{
          fontSize: 40, color: GP.textOnBg, textAlign: 'center', lineHeight: 1,
          transform: 'rotate(-1.5deg)', display: 'block', marginBottom: 6,
        }}>NO PLAN</Marker>
        <Marker style={{
          fontSize: 40, color: GP.textOnBg, textAlign: 'center', lineHeight: 1,
          transform: 'rotate(.8deg)', display: 'block',
        }}>YET.</Marker>
        <SprayUnderline width={210} style={{ marginTop: 4 }}/>

        <Archivo style={{
          marginTop: 28, fontSize: 12, color: GP.textOnBgSec,
          letterSpacing: '.02em', textAlign: 'center', lineHeight: 1.5, fontWeight: 'normal',
          maxWidth: 280, textWrap: 'pretty',
        }}>
          Pick a Gameplan to lock in training, nutrition and lifestyle targets — or freestyle and start logging now.
        </Archivo>

        <div style={{
          marginTop: 36, padding: '14px 24px',
          border: `2px solid ${GP.info}`,
          background: GP.infoBg,
          transform: 'rotate(-1deg)',
          textAlign: 'center', position: 'relative',
        }}>
          <Marker style={{ fontSize: 22, color: GP.textOnBg, letterSpacing: '.04em' }}>PICK A GAMEPLAN →</Marker>
        </div>

        <div style={{ marginTop: 22, position: 'relative', display: 'inline-block' }}>
          <Archivo style={{ fontSize: 10, color: GP.textOnBgTer, letterSpacing: '.2em' }}>OR SKIP & START LOGGING</Archivo>
          <ButtonSpray width={200} color={GP.textTer} style={{ marginTop: -1 }}/>
        </div>
      </div>
    </ScreenShell>
  );
}

// STATE — Rest day
function ScreenRest() {
  return (
    <ScreenShell>
      <StatusStrip name="IRON & GROW" daysLeft={70}/>
      <div style={{ padding: '14px 18px 0' }}>
        <SectionH kicker="TODAY" sprayWidth={120} color={GP.info} style={{ marginBottom: 10 }}>NEXT ACTION</SectionH>

        <GCard accent={MOVE.off} tilt={0.4} padding={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Archivo style={{ fontSize: 9, color: GP.textTer, letterSpacing: '.20em' }}>DAY 5 · SCHEDULED</Archivo>
              <Marker style={{
                fontSize: 34, color: GP.text, display: 'block', lineHeight: 1, marginTop: 4,
                transform: 'rotate(-1.2deg)', transformOrigin: 'left',
              }}>REST DAY.</Marker>
              <SprayUnderline width={150} color={GP.textTer} style={{ marginTop: 2, marginLeft: -3 }}/>
            </div>
            <Reenie style={{ fontSize: 60, color: GP.textTer, lineHeight: .8 }}>z<sup style={{ fontSize: 36 }}>z</sup></Reenie>
          </div>

          <Archivo style={{
            display: 'block', marginTop: 12, fontSize: 11,
            color: GP.textSec, letterSpacing: '.02em', lineHeight: 1.5, fontWeight: 'normal',
            textWrap: 'pretty',
          }}>
            Optional: a stretch routine, an easy walk. Recovery counts.
          </Archivo>

          <DashedDivider style={{ margin: '14px 0 12px' }}/>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{
              border: `1.5px solid ${GP.border}`,
              padding: '11px 8px', textAlign: 'center', background: GP.surfaceAlt,
            }}>
              <Marker style={{ fontSize: 16, color: GP.text }}>START STRETCH</Marker>
            </div>
            <div style={{
              border: `1.5px solid ${GP.border}`,
              padding: '11px 8px', textAlign: 'center', background: GP.surfaceAlt,
            }}>
              <Marker style={{ fontSize: 16, color: GP.text }}>LOG A WALK</Marker>
            </div>
          </div>
        </GCard>

        <div style={{ height: 16 }}/>
        <SectionH kicker="TARGETS" sprayWidth={130} color={GP.info} style={{ marginBottom: 4 }}>GOAL PULSE</SectionH>
      </div>
      <GoalPulse/>

      <div style={{ height: 6 }}/>
      <SubTabs active="training"/>
      <TrainingTab/>
    </ScreenShell>
  );
}

Object.assign(window, {
  ScreenMain, ScreenLogged, ScreenNutrition, ScreenLifestyle, ScreenEmpty, ScreenRest,
  ScreenTrajectory, ScreenTrajectoryBench,
  BottomNav,
});
