// Lifestyle sub-tab + per-variable log sheets — Cyberpunk theme native
//
// 5 artboards:
//   1. ScreenLifestyleTab    — the Lifestyle sub-tab (3 vital cards)
//   2. ScreenSheetNumeric    — log sheet for SLEEP (numeric, stepper + chips)
//   3. ScreenSheetGYR        — log sheet for RECOVERY (Green / Yellow / Red)
//   4. ScreenSheetScale      — log sheet for STRESS (1–5 scale)
//   5. ScreenHistory         — 8-week heatmap + streak for one variable
//
// Themable end-to-end via the existing theme-bridge — every inline color and
// font reference reads through LS (set by setActiveLifestyleTheme).

const { useState: useLSState, useMemo: useLSMemo } = React;

// ─── Live theme reference ────────────────────────────────────
let LS = window.getFitTrackTheme ? window.getFitTrackTheme('cyberpunk') : {};
function setActiveLifestyleTheme(themeId) {
  LS = window.getFitTrackTheme(themeId);
}
window.setActiveLifestyleTheme = setActiveLifestyleTheme;

const {
  Marker, Reenie, Archivo, stripTilt, isGraffiti,
} = window.makeFitTrackTypography(() => LS);

// ─── Cyberpunk-flavored helpers (graceful in all themes) ─────
function isCyber()    { return LS.chrome === 'cyberpunk'; }
function isArcade()   { return LS.chrome === 'arcade'; }
function isLSBlueprint(){ return LS.chrome === 'blueprint'; }
function isLab()      { return LS.chrome === 'lab'; }
function isNotebook() { return LS.chrome === 'notebook'; }

function glow(color, intensity = 0.55) {
  if (!isCyber() && !isArcade()) return 'none';
  return `0 0 8px ${color}${Math.round(intensity * 255).toString(16).padStart(2,'0')}, 0 0 18px ${color}${Math.round(intensity * 90).toString(16).padStart(2,'0')}`;
}
function textGlow(color, intensity = 0.55) {
  if (!isCyber() && !isArcade()) return 'none';
  return `0 0 6px ${color}${Math.round(intensity * 255).toString(16).padStart(2,'0')}, 0 0 14px ${color}${Math.round(intensity * 70).toString(16).padStart(2,'0')}`;
}

// Corner brackets — wraps any container with 4 L-shaped corners (cyber/arcade)
function CornerBrackets({ color, size = 10, inset = 0, thickness = 1.5 }) {
  if (!isCyber() && !isArcade()) return null;
  const c = color || LS.accent;
  const s = { position: 'absolute', width: size, height: size, pointerEvents: 'none' };
  const t = thickness;
  return (
    <>
      <div style={{ ...s, top: inset, left: inset,
        borderTop: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` }}/>
      <div style={{ ...s, top: inset, right: inset,
        borderTop: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` }}/>
      <div style={{ ...s, bottom: inset, left: inset,
        borderBottom: `${t}px solid ${c}`, borderLeft: `${t}px solid ${c}` }}/>
      <div style={{ ...s, bottom: inset, right: inset,
        borderBottom: `${t}px solid ${c}`, borderRight: `${t}px solid ${c}` }}/>
    </>
  );
}

// Status pill — "// LIVE", "// SYNCED", etc.
function StatusPill({ color, label, dot = true, style }) {
  const c = color || LS.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 7px',
      border: `1px solid ${c}66`,
      background: isCyber() ? `${c}11` : LS.accentFaint,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: c, boxShadow: glow(c, 0.6),
        }}/>
      )}
      <Archivo style={{ fontSize: 8.5, letterSpacing: '.18em', color: c }}>{label}</Archivo>
    </span>
  );
}

// Section header — kicker line + title with optional accent rule
function SectionHL({ kicker, title, color, style }) {
  const c = color || LS.accent;
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <Archivo style={{
        fontSize: 9, letterSpacing: '.22em',
        color: LS.textOnBgTer || LS.textTer, display: 'block',
      }}>
        {kicker}
      </Archivo>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Marker style={{
          fontSize: 18, color: LS.textOnBg || LS.text,
          letterSpacing: isCyber() ? '.06em' : '.01em',
          textShadow: textGlow(c, 0.4),
        }}>
          {title}
        </Marker>
        <div style={{
          flex: 1, height: 1, background: `${c}40`,
        }}/>
      </div>
    </div>
  );
}

// Scanline overlay (cyber/arcade decoration)
function ScanlineOverlay() {
  if (!isCyber() && !isArcade()) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
      background: 'repeating-linear-gradient(0deg, rgba(0,240,255,.04) 0 1px, transparent 1px 3px)',
      mixBlendMode: 'screen', opacity: isCyber() ? 0.45 : 0.55,
    }}/>
  );
}

// ─── Status strip / mini header for the screen ──────────────
function ScreenChrome({ title, dateLabel, onBack, right }) {
  return (
    <div style={{
      padding: '12px 16px 14px',
      borderBottom: `1px solid ${LS.borderFaint}`,
      position: 'relative', zIndex: 3,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {onBack !== false && (
        <button onClick={onBack || (()=>{})} style={{
          appearance: 'none', background: 'transparent',
          border: `1px solid ${LS.borderFaint}`,
          color: LS.textOnBg || LS.text,
          width: 30, height: 30, padding: 0, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 2 L4 7 L9 12" strokeLinecap="square"/>
          </svg>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Archivo style={{
          fontSize: 9, letterSpacing: '.22em',
          color: LS.textOnBgTer || LS.textTer, display: 'block',
        }}>
          {dateLabel}
        </Archivo>
        <Marker style={{
          fontSize: 16, color: LS.textOnBg || LS.text,
          letterSpacing: isCyber() ? '.08em' : '.01em',
          textShadow: textGlow(LS.accent, 0.5),
        }}>
          {title}
        </Marker>
      </div>
      {right}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIFESTYLE SUB-TAB · 3 vitals · sparkline + streak
// ═══════════════════════════════════════════════════════════════
const LIFESTYLE_VITALS = [
  {
    id: 'sleep',
    name: 'SLEEP',
    kicker: 'HOURS · 7-DAY ROLL',
    inputType: 'numeric',
    unit: 'h',
    today: '7.4h',
    delta: '+0.6 vs target',
    status: { color: 'success', label: 'ON PLAN' },
    streak: 4,
    streakLabel: 'NIGHTS ≥ 7H',
    spark: [6.2, 6.8, 7.1, 6.5, 7.0, 7.8, 7.4],
    sparkTarget: 7,
    sparkBand: [6.5, 8.5],
  },
  {
    id: 'recovery',
    name: 'RECOVERY',
    kicker: 'GREEN / YELLOW / RED',
    inputType: 'gyr',
    unit: '',
    today: 'YELLOW',
    delta: '3 GREEN this week',
    status: { color: 'warn', label: 'MIXED' },
    streak: 0,
    streakLabel: 'GREEN STREAK',
    spark: ['G','G','Y','G','G','R','Y'],
    sparkTarget: null,
    sparkBand: null,
  },
  {
    id: 'stress',
    name: 'STRESS',
    kicker: '1–5 SCALE · DAILY',
    inputType: 'scale',
    unit: '/5',
    today: '3 / 5',
    delta: '+0.4 vs last wk',
    status: { color: 'warn', label: 'WATCH' },
    streak: 2,
    streakLabel: 'DAYS ≤ 2',
    spark: [2, 3, 2, 4, 3, 3, 3],
    sparkTarget: 2,
    sparkBand: [1, 3],
  },
];

function toneColor(tone) {
  if (tone === 'success') return LS.success;
  if (tone === 'warn')    return LS.warn;
  if (tone === 'danger')  return LS.danger;
  return LS.info;
}

// Mini sparkline that adapts to the data shape (numeric or GYR letters)
function MiniSpark({ data, target, band, color, width = 220, height = 44 }) {
  const padL = 4, padR = 4, padT = 6, padB = 6;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  // GYR data: render as 7 squares with color
  if (Array.isArray(data) && typeof data[0] === 'string') {
    const colors = { G: LS.success, Y: LS.warn, R: LS.danger };
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        {data.map((v, i) => {
          const x = padL + (i / data.length) * innerW;
          const w = innerW / data.length - 3;
          const c = colors[v] || LS.textTer;
          return (
            <g key={i}>
              <rect x={x} y={padT} width={w} height={innerH} fill={`${c}26`} stroke={`${c}88`} strokeWidth="1"/>
              <text x={x + w/2} y={padT + innerH/2 + 3}
                fontFamily={LS.fontData} fontSize="9" fontWeight="700"
                fill={c} textAnchor="middle">{v}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Numeric line
  const numericData = data;
  const yMin = Math.min(...numericData, band ? band[0] : Infinity) - 0.3;
  const yMax = Math.max(...numericData, band ? band[1] : -Infinity) + 0.3;
  const ySpan = yMax - yMin;
  const xAt = (i) => padL + (i / (numericData.length - 1)) * innerW;
  const yAt = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const linePath = numericData.map((v, i) => `${i ? 'L' : 'M'}${xAt(i)} ${yAt(v)}`).join(' ');
  const areaPath = `${linePath} L${xAt(numericData.length - 1)} ${padT + innerH} L${xAt(0)} ${padT + innerH} Z`;
  const c = color || LS.accent;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* feasibility band */}
      {band && (
        <rect x={padL} y={yAt(band[1])}
          width={innerW} height={yAt(band[0]) - yAt(band[1])}
          fill={`${c}15`} stroke="none"/>
      )}
      {/* target line */}
      {target != null && (
        <line x1={padL} x2={padL + innerW}
          y1={yAt(target)} y2={yAt(target)}
          stroke={`${c}55`} strokeWidth="0.8" strokeDasharray="2 3"/>
      )}
      {/* area + line */}
      <path d={areaPath} fill={`${c}18`}/>
      <path d={linePath} fill="none" stroke={c} strokeWidth="1.4"
        style={{ filter: isCyber() ? `drop-shadow(0 0 3px ${c}aa)` : 'none' }}/>
      {/* dots */}
      {numericData.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={i === numericData.length - 1 ? 2.4 : 1.6}
          fill={c} stroke={LS.surface} strokeWidth="0.5"/>
      ))}
    </svg>
  );
}

function VitalCard({ vital, onOpen }) {
  const tone = toneColor(vital.status.color);
  return (
    <button onClick={onOpen} style={{
      appearance: 'none', textAlign: 'left',
      width: '100%',
      background: LS.surface,
      border: `1px solid ${LS.borderFaint}`,
      borderLeft: `3px solid ${tone}`,
      padding: '12px 12px 12px 14px',
      position: 'relative',
      cursor: 'pointer',
      color: 'inherit', fontFamily: 'inherit',
      boxShadow: isCyber() ? `inset 0 0 18px ${LS.accent}08` : LS.shadowSm,
    }}>
      <CornerBrackets color={LS.accent} size={9} inset={3} thickness={1}/>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Archivo style={{ fontSize: 8.5, letterSpacing: '.22em',
            color: LS.textTer, display: 'block' }}>
            {vital.kicker}
          </Archivo>
          <Marker style={{
            fontSize: 17, color: LS.text, display: 'block',
            letterSpacing: isCyber() ? '.10em' : '.02em',
            textShadow: textGlow(tone, 0.4), marginTop: 2,
          }}>
            {vital.name}
          </Marker>
        </div>
        <StatusPill color={tone} label={vital.status.label}/>
      </div>

      {/* hero + spark row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '110px 1fr',
        gap: 12, alignItems: 'center', marginTop: 10,
      }}>
        <div>
          <Reenie style={{
            fontSize: 30, fontWeight: 700,
            color: LS.text, letterSpacing: '.02em',
            textShadow: textGlow(tone, 0.5),
            display: 'block', lineHeight: 1,
            fontFamily: LS.fontNumber,
          }}>
            {vital.today}
          </Reenie>
          <Archivo style={{
            fontSize: 9, letterSpacing: '.10em',
            color: LS.textTer, display: 'block', marginTop: 4,
          }}>
            {vital.delta}
          </Archivo>
        </div>
        <div style={{ position: 'relative' }}>
          <MiniSpark data={vital.spark} target={vital.sparkTarget}
            band={vital.sparkBand} color={tone} width={200} height={44}/>
        </div>
      </div>

      {/* footer: streak + action */}
      <div style={{
        marginTop: 10, paddingTop: 9,
        borderTop: `1px dashed ${LS.borderFaint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* streak pellets */}
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} style={{
                width: 5, height: 10,
                background: i < vital.streak ? LS.accent : `${LS.borderFaint}`,
                boxShadow: i < vital.streak ? glow(LS.accent, 0.4) : 'none',
              }}/>
            ))}
          </div>
          <Archivo style={{ fontSize: 8.5, letterSpacing: '.16em',
            color: LS.textTer }}>
            {vital.streak} {vital.streakLabel}
          </Archivo>
        </div>
        <Archivo style={{ fontSize: 8.5, letterSpacing: '.20em',
          color: LS.accent }}>
          LOG →
        </Archivo>
      </div>
    </button>
  );
}

function LifestyleSubNav() {
  const tabs = [
    { id: 'training',  label: 'TRAINING' },
    { id: 'nutrition', label: 'NUTRITION' },
    { id: 'lifestyle', label: 'LIFESTYLE' },
  ];
  return (
    <div style={{
      display: 'flex', borderBottom: `1px solid ${LS.borderFaint}`,
      position: 'relative', zIndex: 3,
    }}>
      {tabs.map(t => {
        const active = t.id === 'lifestyle';
        return (
          <div key={t.id} style={{
            flex: 1, padding: '11px 8px 9px',
            textAlign: 'center', cursor: 'pointer',
            borderBottom: active ? `2px solid ${LS.accent}` : '2px solid transparent',
            background: active && isCyber() ? `${LS.accent}08` : 'transparent',
            boxShadow: active && isCyber() ? `inset 0 -8px 16px ${LS.accent}10` : 'none',
          }}>
            <Archivo style={{
              fontSize: 10, letterSpacing: '.18em',
              color: active ? LS.accent : LS.textTer,
              textShadow: active ? textGlow(LS.accent, 0.5) : 'none',
            }}>
              {t.label}
            </Archivo>
          </div>
        );
      })}
    </div>
  );
}

function HUDStrip() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      borderBottom: `1px solid ${LS.borderFaint}`,
      background: isCyber() ? `${LS.accent}06` : 'transparent',
      position: 'relative', zIndex: 3,
    }}>
      <StatusPill color={LS.accent} label="LIVE · DAY 38/112"/>
      <div style={{ flex: 1 }}/>
      <Archivo style={{
        fontSize: 9, letterSpacing: '.18em',
        color: LS.textTer,
      }}>
        SYNC · 14:02
      </Archivo>
    </div>
  );
}

function ScreenLifestyleTab({ openSheet }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: LS.bg, overflow: 'hidden',
    }}>
      <ScanlineOverlay/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 90 }}>
        <HUDStrip/>
        <LifestyleSubNav/>

        <div style={{ padding: '14px 16px 8px' }}>
          <SectionHL
            kicker="HABITS · 16-WEEK PLAN"
            title="DAILY VITALS"
            color={LS.accent}
          />
          <Archivo style={{
            display: 'block', fontSize: 10, color: LS.textTer,
            letterSpacing: '.04em', lineHeight: 1.5,
            marginBottom: 14, textWrap: 'pretty',
          }}>
            Tap a vital to log today. Solid trace = you · dashed = target · band = sustainable range.
          </Archivo>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {LIFESTYLE_VITALS.map(v => (
              <VitalCard key={v.id} vital={v} onOpen={() => openSheet && openSheet(v.id)}/>
            ))}
          </div>

          {/* lower meta */}
          <div style={{ marginTop: 18, padding: '12px 14px',
            border: `1px dashed ${LS.borderFaint}`,
            background: isCyber() ? `${LS.accent}05` : LS.bgAlt,
            position: 'relative',
          }}>
            <CornerBrackets color={LS.borderFaint} size={6} inset={2} thickness={1}/>
            <Archivo style={{ fontSize: 9, letterSpacing: '.20em',
              color: LS.textTer, display: 'block', marginBottom: 4 }}>
              CHECK-IN UNLOCKS IN
            </Archivo>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <Reenie style={{
                fontSize: 26, fontWeight: 700, lineHeight: 1,
                color: LS.text, fontFamily: LS.fontNumber,
                textShadow: textGlow(LS.accent, 0.4),
              }}>
                2D · 14H
              </Reenie>
              <Archivo style={{ fontSize: 10, color: LS.textTer, letterSpacing: '.06em' }}>
                · SUN 09:00 · WEEK 6
              </Archivo>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTTOM SHEET shell — used for all 3 log sheet variants + history
// ═══════════════════════════════════════════════════════════════
function SheetBackdrop({ children, sheetHeight = 620 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: LS.bg, overflow: 'hidden',
    }}>
      <ScanlineOverlay/>

      {/* dimmed parent screen peeking through at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 160,
        background: `linear-gradient(180deg, ${LS.surfaceAlt || LS.surface}aa, ${LS.bg})`,
        opacity: 0.4, pointerEvents: 'none',
      }}>
        <div style={{ padding: '12px 16px', opacity: 0.5 }}>
          <Archivo style={{ fontSize: 9, letterSpacing: '.22em',
            color: LS.textOnBgTer || LS.textTer, display: 'block' }}>
            LIFESTYLE · DAILY VITALS
          </Archivo>
        </div>
      </div>

      {/* bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: sheetHeight,
        background: LS.surface,
        borderTop: `1px solid ${LS.accent}55`,
        boxShadow: isCyber()
          ? `0 -20px 50px rgba(0,0,0,.55), 0 -1px 0 ${LS.accent}aa, 0 -20px 60px ${LS.accent}25`
          : `0 -20px 50px rgba(0,0,0,.25)`,
        zIndex: 5, overflow: 'hidden',
      }}>
        <CornerBrackets color={LS.accent} size={12} inset={6} thickness={1.5}/>
        {/* drag handle */}
        <div style={{
          width: 44, height: 4, margin: '8px auto 0',
          background: `${LS.accent}55`,
          boxShadow: glow(LS.accent, 0.4),
        }}/>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHEET A — NUMERIC (Sleep, hours)
// ═══════════════════════════════════════════════════════════════
function NumericValueDisplay({ value, unit, color }) {
  const c = color || LS.accent;
  return (
    <div style={{
      padding: '20px 16px 18px',
      border: `1px solid ${c}55`,
      background: isCyber() ? `${c}08` : LS.bgAlt,
      position: 'relative',
      display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6,
    }}>
      <CornerBrackets color={c} size={10} inset={4} thickness={1.5}/>
      <Reenie style={{
        fontSize: 72, fontWeight: 700, lineHeight: 1,
        color: LS.text, fontFamily: LS.fontNumber,
        letterSpacing: '.01em',
        textShadow: textGlow(c, 0.7),
      }}>
        {value}
      </Reenie>
      <Archivo style={{
        fontSize: 24, color: LS.textSec, letterSpacing: '.04em',
        fontFamily: LS.fontData,
      }}>
        {unit}
      </Archivo>
    </div>
  );
}

function LSStepper({ minus, plus, label }) {
  const Btn = ({ children, onClick }) => (
    <button onClick={onClick} style={{
      appearance: 'none', flex: 1,
      padding: '14px 0',
      background: 'transparent',
      border: `1px solid ${LS.accent}55`,
      color: LS.accent,
      cursor: 'pointer',
      fontFamily: LS.fontData,
      fontSize: 18, fontWeight: 700,
      letterSpacing: '.04em',
      boxShadow: isCyber() ? `inset 0 0 12px ${LS.accent}10` : 'none',
    }}>
      {children}
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
      <Btn onClick={minus}>− 0.25</Btn>
      <div style={{
        flex: 1, padding: '14px 0',
        textAlign: 'center',
        border: `1px solid ${LS.borderFaint}`,
        background: LS.bgAlt,
      }}>
        <Archivo style={{ fontSize: 9, letterSpacing: '.18em',
          color: LS.textTer, display: 'block' }}>
          TARGET
        </Archivo>
        <Archivo style={{ fontSize: 13, color: LS.text, letterSpacing: '.04em',
          fontFamily: LS.fontData }}>
          {label}
        </Archivo>
      </div>
      <Btn onClick={plus}>+ 0.25</Btn>
    </div>
  );
}

function QuickChips({ items, activeIndex, color }) {
  const c = color || LS.accent;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 14 }}>
      {items.map((label, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} style={{
            padding: '8px 4px',
            border: `1px solid ${active ? c : LS.borderFaint}`,
            background: active ? `${c}22` : 'transparent',
            textAlign: 'center',
            boxShadow: active ? glow(c, 0.4) : 'none',
          }}>
            <Archivo style={{
              fontSize: 11, fontWeight: 700,
              color: active ? c : LS.textSec,
              letterSpacing: '.06em',
              fontFamily: LS.fontData,
            }}>
              {label}
            </Archivo>
          </div>
        );
      })}
    </div>
  );
}

function ScreenSheetNumeric() {
  const tone = LS.success;
  return (
    <SheetBackdrop sheetHeight={680}>
      <div style={{ padding: '14px 18px 16px', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.22em',
              color: LS.textTer, display: 'block' }}>
              LOG · MON 02 MAY · 14:02
            </Archivo>
            <Marker style={{
              fontSize: 22, color: LS.text, letterSpacing: isCyber() ? '.10em' : '.02em',
              textShadow: textGlow(LS.accent, 0.5),
            }}>
              SLEEP · HOURS
            </Marker>
          </div>
          <StatusPill color={tone} label="ON PLAN"/>
        </div>

        <NumericValueDisplay value="7.5" unit="h" color={LS.accent}/>
        <LSStepper minus={()=>{}} plus={()=>{}} label="7.0 – 8.5h"/>
        <QuickChips items={["<5", "6", "7", "8", "9+"]} activeIndex={2} color={LS.accent}/>

        {/* trend mini */}
        <div style={{
          marginTop: 16, padding: '12px 12px 8px',
          border: `1px solid ${LS.borderFaint}`,
          background: LS.bgAlt, position: 'relative',
        }}>
          <CornerBrackets color={LS.borderFaint} size={6} inset={2} thickness={1}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.18em', color: LS.textTer }}>
              LAST 14 DAYS · vs 7H TARGET
            </Archivo>
            <Archivo style={{ fontSize: 9, letterSpacing: '.10em', color: tone }}>
              AVG 7.1H
            </Archivo>
          </div>
          <MiniSpark
            data={[6.0, 6.4, 6.5, 6.8, 6.2, 6.5, 6.8, 7.0, 6.8, 7.1, 6.5, 7.0, 7.8, 7.4]}
            target={7} band={[6.5, 8.5]} color={tone} width={332} height={52}
          />
        </div>

        {/* notes */}
        <div style={{
          marginTop: 12,
          border: `1px solid ${LS.borderFaint}`,
          background: 'transparent',
          padding: '8px 10px',
        }}>
          <Archivo style={{
            fontSize: 9, letterSpacing: '.18em',
            color: LS.textTer, display: 'block', marginBottom: 3,
          }}>
            NOTES · OPT
          </Archivo>
          <Archivo style={{ fontSize: 11, color: LS.textSec, fontStyle: 'italic' }}>
            Awake 02:00 briefly — back asleep fast.
          </Archivo>
          <div style={{
            marginTop: 4, height: 1,
            borderBottom: `1px dashed ${LS.borderFaint}`,
          }}/>
        </div>

        {/* CTA row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginTop: 16 }}>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${LS.borderFaint}`,
            background: 'transparent',
            color: LS.textSec, fontFamily: LS.fontData,
            fontSize: 11, letterSpacing: '.18em', fontWeight: 700,
            cursor: 'pointer',
          }}>
            CANCEL
          </button>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${LS.accent}`,
            background: isCyber() ? `${LS.accent}22` : LS.accent,
            color: isCyber() ? LS.accent : LS.textOnAccent,
            fontFamily: LS.fontData,
            fontSize: 12, letterSpacing: '.20em', fontWeight: 700,
            cursor: 'pointer',
            boxShadow: glow(LS.accent, 0.5),
            position: 'relative',
          }}>
            LOG ENTRY ⏎
          </button>
        </div>
      </div>
    </SheetBackdrop>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHEET B — GYR (Recovery)
// ═══════════════════════════════════════════════════════════════
function GYRTile({ color, glyph, label, hint, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', textAlign: 'left',
      width: '100%', display: 'flex', gap: 14, alignItems: 'center',
      padding: '16px 14px',
      border: `1px solid ${active ? color : `${color}55`}`,
      background: active ? `${color}1f` : (isCyber() ? `${color}08` : LS.bgAlt),
      cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
      boxShadow: active ? glow(color, 0.5) : 'none',
      position: 'relative',
    }}>
      {active && <CornerBrackets color={color} size={10} inset={3} thickness={1.5}/>}
      <div style={{
        width: 56, height: 56,
        display: 'grid', placeItems: 'center',
        border: `1.5px solid ${color}`,
        background: `${color}26`,
        boxShadow: active ? `inset 0 0 14px ${color}55, ${glow(color, 0.6)}` : 'none',
        flexShrink: 0,
      }}>
        <Reenie style={{
          fontSize: 28, fontWeight: 700, color, lineHeight: 1,
          fontFamily: LS.fontNumber,
          textShadow: textGlow(color, 0.6),
        }}>
          {glyph}
        </Reenie>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Marker style={{
          fontSize: 17, color: LS.text, display: 'block',
          letterSpacing: isCyber() ? '.10em' : '.02em',
          textShadow: active ? textGlow(color, 0.4) : 'none',
        }}>
          {label}
        </Marker>
        <Archivo style={{
          fontSize: 10, letterSpacing: '.04em',
          color: LS.textTer, display: 'block', marginTop: 2,
        }}>
          {hint}
        </Archivo>
      </div>
      {active && (
        <div style={{
          padding: '4px 8px',
          border: `1px solid ${color}`,
          background: `${color}22`,
        }}>
          <Archivo style={{ fontSize: 9, fontWeight: 700,
            letterSpacing: '.20em', color }}>SELECTED</Archivo>
        </div>
      )}
    </button>
  );
}

function ScreenSheetGYR() {
  return (
    <SheetBackdrop sheetHeight={680}>
      <div style={{ padding: '14px 18px 16px', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.22em',
              color: LS.textTer, display: 'block' }}>
              LOG · MON 02 MAY · 06:48
            </Archivo>
            <Marker style={{
              fontSize: 22, color: LS.text, letterSpacing: isCyber() ? '.10em' : '.02em',
              textShadow: textGlow(LS.accent, 0.5),
            }}>
              RECOVERY · STATE
            </Marker>
          </div>
          <StatusPill color={LS.warn} label="3 G THIS WK"/>
        </div>

        <Archivo style={{
          fontSize: 10, color: LS.textSec, letterSpacing: '.02em',
          display: 'block', marginBottom: 14, lineHeight: 1.5,
        }}>
          Pick the one that fits how your body is reading. Coach uses this to scale today's intensity.
        </Archivo>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GYRTile
            color={LS.success} glyph="G"
            label="FRESH · READY TO PUSH"
            hint="HRV in range · low soreness · slept &gt; 7h"
            active={false}
          />
          <GYRTile
            color={LS.warn} glyph="Y"
            label="MIXED · BACK OFF 10–15%"
            hint="Either sleep, HRV, or soreness off — proceed with care"
            active={true}
          />
          <GYRTile
            color={LS.danger} glyph="R"
            label="DEPLETED · SWAP TO LISS OR REST"
            hint="Two markers off · pushing today digs the hole deeper"
            active={false}
          />
        </div>

        {/* week tape */}
        <div style={{
          marginTop: 16, padding: '12px 12px',
          border: `1px solid ${LS.borderFaint}`,
          background: LS.bgAlt, position: 'relative',
        }}>
          <CornerBrackets color={LS.borderFaint} size={6} inset={2} thickness={1}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.18em', color: LS.textTer }}>
              THIS WEEK · 7 DAYS
            </Archivo>
            <Archivo style={{ fontSize: 9, letterSpacing: '.10em', color: LS.warn }}>
              MIXED · 3G · 2Y · 1R
            </Archivo>
          </div>
          <MiniSpark data={['G','G','Y','G','G','R','Y']} color={LS.accent} width={332} height={42}/>
        </div>

        {/* CTA row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginTop: 18 }}>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${LS.borderFaint}`,
            background: 'transparent',
            color: LS.textSec, fontFamily: LS.fontData,
            fontSize: 11, letterSpacing: '.18em', fontWeight: 700,
            cursor: 'pointer',
          }}>
            CANCEL
          </button>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${LS.warn}`,
            background: isCyber() ? `${LS.warn}22` : LS.warn,
            color: isCyber() ? LS.warn : LS.textOnAccent,
            fontFamily: LS.fontData,
            fontSize: 12, letterSpacing: '.20em', fontWeight: 700,
            cursor: 'pointer',
            boxShadow: glow(LS.warn, 0.5),
          }}>
            LOG · YELLOW ⏎
          </button>
        </div>
      </div>
    </SheetBackdrop>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHEET C — 1–5 SCALE (Stress)
// ═══════════════════════════════════════════════════════════════
function ScaleButton({ n, label, active, color, onClick }) {
  const c = color || LS.warn;
  return (
    <button onClick={onClick} style={{
      appearance: 'none',
      padding: '14px 4px 12px',
      border: `1px solid ${active ? c : LS.borderFaint}`,
      background: active ? `${c}22` : 'transparent',
      cursor: 'pointer',
      boxShadow: active ? glow(c, 0.5) : 'none',
      position: 'relative',
    }}>
      {active && <CornerBrackets color={c} size={6} inset={2} thickness={1}/>}
      <Reenie style={{
        fontSize: 28, fontWeight: 700, color: active ? c : LS.textSec,
        lineHeight: 1, display: 'block',
        fontFamily: LS.fontNumber,
        textShadow: active ? textGlow(c, 0.5) : 'none',
      }}>
        {n}
      </Reenie>
      <Archivo style={{
        fontSize: 8.5, letterSpacing: '.14em',
        color: active ? c : LS.textTer, marginTop: 4, display: 'block',
      }}>
        {label}
      </Archivo>
    </button>
  );
}

function ScreenSheetScale() {
  // selected = 3
  const tone = LS.warn;
  return (
    <SheetBackdrop sheetHeight={680}>
      <div style={{ padding: '14px 18px 16px', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.22em',
              color: LS.textTer, display: 'block' }}>
              LOG · MON 02 MAY · 21:14
            </Archivo>
            <Marker style={{
              fontSize: 22, color: LS.text, letterSpacing: isCyber() ? '.10em' : '.02em',
              textShadow: textGlow(LS.accent, 0.5),
            }}>
              STRESS · TODAY
            </Marker>
          </div>
          <StatusPill color={tone} label="WATCH"/>
        </div>

        {/* hero current */}
        <div style={{
          padding: '20px 16px 14px',
          border: `1px solid ${tone}55`,
          background: isCyber() ? `${tone}08` : LS.bgAlt,
          position: 'relative',
          textAlign: 'center', marginBottom: 14,
        }}>
          <CornerBrackets color={tone} size={10} inset={4} thickness={1.5}/>
          <Archivo style={{
            fontSize: 9, letterSpacing: '.22em',
            color: LS.textTer, display: 'block', marginBottom: 4,
          }}>
            CURRENT READING
          </Archivo>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
            <Reenie style={{
              fontSize: 72, fontWeight: 700, lineHeight: 1,
              color: LS.text, fontFamily: LS.fontNumber,
              textShadow: textGlow(tone, 0.7),
            }}>
              3
            </Reenie>
            <Archivo style={{
              fontSize: 22, color: LS.textSec, letterSpacing: '.04em',
              fontFamily: LS.fontData,
            }}>
              / 5
            </Archivo>
          </div>
          <Marker style={{
            fontSize: 14, color: tone, display: 'block', marginTop: 2,
            letterSpacing: isCyber() ? '.10em' : '.02em',
            textShadow: textGlow(tone, 0.5),
          }}>
            ELEVATED · NOT SPIKING
          </Marker>
        </div>

        {/* 5-button scale */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          <ScaleButton n="1" label="CALM"    color={LS.success}/>
          <ScaleButton n="2" label="STEADY"  color={LS.success}/>
          <ScaleButton n="3" label="ELEV."   color={LS.warn} active/>
          <ScaleButton n="4" label="STRAIN"  color={LS.warn}/>
          <ScaleButton n="5" label="SPIKE"   color={LS.danger}/>
        </div>

        {/* gradient axis */}
        <div style={{
          marginTop: 8, height: 4,
          background: `linear-gradient(90deg, ${LS.success}, ${LS.warn}, ${LS.danger})`,
          opacity: 0.7,
          boxShadow: isCyber() ? `0 0 6px ${LS.warn}55` : 'none',
        }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Archivo style={{ fontSize: 8.5, letterSpacing: '.14em', color: LS.textTer }}>CALM</Archivo>
          <Archivo style={{ fontSize: 8.5, letterSpacing: '.14em', color: LS.textTer }}>SPIKING</Archivo>
        </div>

        {/* 7-day trend */}
        <div style={{
          marginTop: 16, padding: '12px 12px',
          border: `1px solid ${LS.borderFaint}`,
          background: LS.bgAlt, position: 'relative',
        }}>
          <CornerBrackets color={LS.borderFaint} size={6} inset={2} thickness={1}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Archivo style={{ fontSize: 9, letterSpacing: '.18em', color: LS.textTer }}>
              LAST 14 DAYS · TARGET ≤ 2
            </Archivo>
            <Archivo style={{ fontSize: 9, letterSpacing: '.10em', color: tone }}>
              AVG 2.9 / 5
            </Archivo>
          </div>
          <MiniSpark
            data={[2, 1, 2, 3, 2, 2, 3, 2, 3, 2, 4, 3, 3, 3]}
            target={2} band={[1, 3]}
            color={tone} width={332} height={52}
          />
        </div>

        {/* CTA row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginTop: 16 }}>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${LS.borderFaint}`,
            background: 'transparent',
            color: LS.textSec, fontFamily: LS.fontData,
            fontSize: 11, letterSpacing: '.18em', fontWeight: 700,
            cursor: 'pointer',
          }}>
            CANCEL
          </button>
          <button style={{
            appearance: 'none', padding: '14px 0',
            border: `1px solid ${tone}`,
            background: isCyber() ? `${tone}22` : tone,
            color: isCyber() ? tone : LS.textOnAccent,
            fontFamily: LS.fontData,
            fontSize: 12, letterSpacing: '.20em', fontWeight: 700,
            cursor: 'pointer',
            boxShadow: glow(tone, 0.5),
          }}>
            LOG · 3 / 5 ⏎
          </button>
        </div>
      </div>
    </SheetBackdrop>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN E — 8-WEEK HISTORY HEATMAP (Sleep example)
// ═══════════════════════════════════════════════════════════════
function ScreenHistory() {
  const tone = LS.success;
  // 56 days = 8 weeks; build deterministic-ish values 5.5–8.5h
  const days = useLSMemo(() => {
    const out = [];
    let v = 6.4;
    for (let i = 0; i < 56; i++) {
      v += (Math.sin(i * 1.3) * 0.4) + ((i % 7 === 5 || i % 7 === 6) ? 0.5 : -0.1);
      v = Math.max(5.2, Math.min(8.6, v));
      out.push(v);
    }
    return out;
  }, []);

  const colorFor = (v) => {
    if (v >= 7.5) return LS.success;
    if (v >= 6.5) return LS.accent;
    if (v >= 5.5) return LS.warn;
    return LS.danger;
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: LS.bg, overflow: 'hidden',
    }}>
      <ScanlineOverlay/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 90 }}>
        <ScreenChrome
          title="SLEEP · HISTORY"
          dateLabel="56-DAY ROLL · BLOCK 02"
          right={<StatusPill color={tone} label="ON PLAN"/>}
        />

        {/* hero band */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            padding: '14px 14px 12px',
            border: `1px solid ${LS.borderFaint}`,
            background: isCyber() ? `${tone}06` : LS.surface,
            position: 'relative',
          }}>
            <CornerBrackets color={tone} size={8} inset={3} thickness={1}/>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
            }}>
              <div>
                <Archivo style={{ fontSize: 9, letterSpacing: '.18em',
                  color: LS.textTer, display: 'block' }}>
                  AVG · 56d
                </Archivo>
                <Reenie style={{
                  fontSize: 26, fontWeight: 700, color: LS.text, lineHeight: 1,
                  fontFamily: LS.fontNumber,
                  textShadow: textGlow(tone, 0.4),
                }}>
                  7.1<span style={{ fontSize: 14, color: LS.textSec, marginLeft: 2 }}>h</span>
                </Reenie>
                <Archivo style={{ fontSize: 9, letterSpacing: '.06em',
                  color: tone, display: 'block', marginTop: 4 }}>
                  +0.4 vs prior
                </Archivo>
              </div>
              <div>
                <Archivo style={{ fontSize: 9, letterSpacing: '.18em',
                  color: LS.textTer, display: 'block' }}>
                  STREAK
                </Archivo>
                <Reenie style={{
                  fontSize: 26, fontWeight: 700, color: LS.text, lineHeight: 1,
                  fontFamily: LS.fontNumber,
                  textShadow: textGlow(tone, 0.4),
                }}>
                  4
                </Reenie>
                <Archivo style={{ fontSize: 9, letterSpacing: '.06em',
                  color: LS.textTer, display: 'block', marginTop: 4 }}>
                  Nights ≥ 7h
                </Archivo>
              </div>
              <div>
                <Archivo style={{ fontSize: 9, letterSpacing: '.18em',
                  color: LS.textTer, display: 'block' }}>
                  ON-PLAN
                </Archivo>
                <Reenie style={{
                  fontSize: 26, fontWeight: 700, color: LS.text, lineHeight: 1,
                  fontFamily: LS.fontNumber,
                  textShadow: textGlow(tone, 0.4),
                }}>
                  68<span style={{ fontSize: 14, color: LS.textSec, marginLeft: 2 }}>%</span>
                </Reenie>
                <Archivo style={{ fontSize: 9, letterSpacing: '.06em',
                  color: LS.textTer, display: 'block', marginTop: 4 }}>
                  38 of 56 days
                </Archivo>
              </div>
            </div>
          </div>
        </div>

        {/* heatmap */}
        <div style={{ padding: '14px 16px 0' }}>
          <SectionHL kicker="DAILY GRID" title="8-WEEK MAP" color={LS.accent}/>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 26 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <Archivo style={{ fontSize: 8.5, color: LS.textTer, letterSpacing: '.10em' }}>{d}</Archivo>
              </div>
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, wk) => (
            <div key={wk} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
              <Archivo style={{
                width: 22, fontSize: 8.5,
                color: LS.textTer, letterSpacing: '.08em',
                fontFamily: LS.fontData, textAlign: 'right',
              }}>
                W{8 - wk}
              </Archivo>
              {Array.from({ length: 7 }).map((_, d) => {
                const idx = wk * 7 + d;
                const v = days[idx];
                const c = colorFor(v);
                const future = idx > 47; // today is somewhere in last row
                return (
                  <div key={d} style={{
                    flex: 1, aspectRatio: '1 / 1',
                    background: future ? 'transparent' : `${c}33`,
                    border: future
                      ? `1px dashed ${LS.borderFaint}`
                      : `1px solid ${c}88`,
                    display: 'grid', placeItems: 'center',
                    position: 'relative',
                  }}>
                    {!future && (
                      <Archivo style={{
                        fontSize: 9, fontWeight: 700,
                        color: c,
                        textShadow: isCyber() ? `0 0 4px ${c}88` : 'none',
                        fontFamily: LS.fontData,
                      }}>
                        {v.toFixed(1)}
                      </Archivo>
                    )}
                    {idx === 47 && (
                      <div style={{
                        position: 'absolute', inset: -2,
                        border: `1.5px solid ${LS.accent}`,
                        boxShadow: glow(LS.accent, 0.5),
                        pointerEvents: 'none',
                      }}/>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { c: LS.success, lab: '≥ 7.5h' },
              { c: LS.accent,  lab: '6.5–7.5h' },
              { c: LS.warn,    lab: '5.5–6.5h' },
              { c: LS.danger,  lab: '< 5.5h' },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 10, height: 10,
                  background: `${x.c}33`, border: `1px solid ${x.c}88`,
                }}/>
                <Archivo style={{ fontSize: 9, color: LS.textTer, letterSpacing: '.06em' }}>
                  {x.lab}
                </Archivo>
              </div>
            ))}
          </div>
        </div>

        {/* recent log entries */}
        <div style={{ padding: '16px 16px 0' }}>
          <SectionHL kicker="RECENT" title="LATEST LOGS" color={LS.accent}/>
          {[
            { date: 'SUN · 01 MAY', v: '7.4h', tone: LS.success, note: 'Solid. Bed 22:48, up 06:12.' },
            { date: 'SAT · 30 APR', v: '7.8h', tone: LS.success, note: 'Slept in — earned it.' },
            { date: 'FRI · 29 APR', v: '7.0h', tone: LS.accent,  note: 'Cut close. Coffee at 14:00 = mistake.' },
            { date: 'THU · 28 APR', v: '6.5h', tone: LS.warn,    note: '' },
            { date: 'WED · 27 APR', v: '7.0h', tone: LS.accent,  note: '' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderBottom: `1px dashed ${LS.borderFaint}`,
            }}>
              <div style={{ width: 84 }}>
                <Archivo style={{
                  fontSize: 9, color: LS.textTer, letterSpacing: '.10em',
                  fontFamily: LS.fontData,
                }}>
                  {row.date}
                </Archivo>
              </div>
              <Reenie style={{
                width: 60, fontSize: 18, fontWeight: 700, color: row.tone,
                fontFamily: LS.fontNumber, textAlign: 'right',
                textShadow: textGlow(row.tone, 0.4),
              }}>
                {row.v}
              </Reenie>
              <Archivo style={{
                flex: 1, fontSize: 11, color: LS.textSec,
                fontStyle: row.note ? 'italic' : 'normal',
                letterSpacing: '.01em',
              }}>
                {row.note || '—'}
              </Archivo>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTTOM NAV (lifestyle active)
// ═══════════════════════════════════════════════════════════════
// Thin adapter → the ONE canonical bottom shell (tier-homes `BottomNav`).
// This is the Lifestyle pillar surface in the Program tier → slot 5 (Lifestyle).
// The old gameplan/progress/+/nutri/set strip was a second, wrong shell.
function LifestyleBottomNav() {
  return <BottomNav T={LS} tier="program" activeSlot={5}/>;
}

Object.assign(window, {
  setActiveLifestyleTheme,
  ScreenLifestyleTab,
  ScreenSheetNumeric,
  ScreenSheetGYR,
  ScreenSheetScale,
  ScreenHistory,
  LifestyleBottomNav,
});
