// Weekly Check-In — themable across all 7 FitTrack themes
// The screen library was originally written against a private LAB constant.
// We now pull every value from theme-bridge.jsx via setActiveCheckinTheme(),
// which the host calls before render. Inside this file, LAB still reads as
// LAB.text / LAB.border / etc — but those are now driven by the active theme.

const { useState: useCIState, useMemo: useCIMemo } = React;

// Live theme reference. The host (Weekly Check-In - …html) calls
// setActiveCheckinTheme('iron') before rendering and the next render reads
// values from the new theme's palette.
let LAB = window.getFitTrackTheme ? window.getFitTrackTheme('lab') : {};

// Map bridge keys → the legacy LAB key names this file expects.
function _resolveCheckinTheme(themeId) {
  const T = window.getFitTrackTheme(themeId);
  return {
    bg: T.bg, bgAlt: T.bgAlt, surface: T.surface, surfaceAlt: T.surfaceAlt, surfaceRaised: T.surfaceRaised,
    border: T.border, borderFaint: T.borderFaint, borderStrong: T.borderStrong,
    text: T.text, textSec: T.textSec, textTer: T.textTer,
    textOnBg: T.textOnBg, textOnBgSec: T.textOnBgSec, textOnBgTer: T.textOnBgTer,
    blue: T.accent, blueDark: T.accent, blueFaint: T.accentFaint,
    accent: T.accent, accentFg: T.accentFg, accentBg: T.accentBg, accentBorder: T.accentBorder, accentFaint: T.accentFaint,
    warn: T.warn, warnFg: T.warnFg, warnBg: T.warnBg, warnBr: T.warnBorder,
    danger: T.danger, dangerFg: T.dangerFg, dangerBg: T.dangerBg, dangerBr: T.dangerBorder,
    success: T.success, successFg: T.successFg, successBg: T.successBg, successBr: T.successBorder,
    info: T.info, infoFg: T.infoFg, infoBg: T.infoBg, infoBr: T.infoBorder,
    push: T.push, pull: T.pull, legs: T.legs, core: T.core,
    fontBody: T.fontBody, fontDisplay: T.fontDisplay, fontData: T.fontData, fontNumber: T.fontNumber,
    radiusMd: T.radiusMd, radiusLg: T.radiusLg,
    shadowSm: T.shadowSm, shadowMd: T.shadowMd,
    chrome: T.chrome,
    isDark: T.isDark,
    stampFg: T.stampFg, stampBg: T.stampBg, stampBorder: T.stampBorder,
  };
}
function setActiveCheckinTheme(themeId) {
  LAB = _resolveCheckinTheme(themeId);
}
window.setActiveCheckinTheme = setActiveCheckinTheme;

// Shared typography helpers (Marker / Reenie / Archivo) bound to the live LAB.
const { Marker: CIMarker, Reenie: CIReenie, Archivo: CIArchivo, stripTilt: ciStripTilt, isGraffiti: ciIsGraffiti } =
  window.makeFitTrackTypography(() => LAB);
const isCIBlueprint = () => LAB && LAB.chrome === 'blueprint';
const isCILab       = () => LAB && LAB.chrome === 'lab';
const isCIArcade    = () => LAB && LAB.chrome === 'arcade';
const isCIDarkfuture= () => LAB && LAB.chrome === 'darkfuture';
const isCINotebook  = () => LAB && LAB.chrome === 'notebook';
const isCIIron      = () => LAB && LAB.chrome === 'iron';

// ─── Type helpers ──────────────────────────────────────────────
// Plex/Mono are legacy names — they now read from the active theme.
// Plex = body text in active theme, Mono = data/numeric text in active theme.
const Plex = ({ children, style, weight = 400, size = 13, color, ...rest }) => (
  <span style={{
    fontFamily: LAB.fontBody,
    fontWeight: weight,
    fontSize: size,
    color: color || LAB.text,
    ...style,
  }} {...rest}>{children}</span>
);
const Mono = ({ children, style, weight = 500, size = 13, color, ...rest }) => (
  <span style={{
    fontFamily: LAB.fontData,
    fontWeight: weight,
    fontSize: size,
    fontVariantNumeric: 'tabular-nums',
    color: color || LAB.text,
    ...style,
  }} {...rest}>{children}</span>
);

// ─── Status dot ────────────────────────────────────────────────
function Dot({ tone = 'green', size = 8 }) {
  const c = tone === 'green' ? LAB.success : tone === 'yellow' ? LAB.warn : tone === 'red' ? LAB.danger : tone === 'blue' ? LAB.blue : LAB.textTer;
  return <span style={{
    display: 'inline-block', width: size, height: size, borderRadius: '50%',
    background: c, flexShrink: 0,
  }}/>;
}

// ─── Pill / severity tag ───────────────────────────────────────
function Pill({ children, tone = 'neutral', style, icon: Icon }) {
  const palette = {
    neutral: { bg: LAB.surfaceAlt || LAB.surface, fg: LAB.textSec, br: LAB.border },
    blue:    { bg: LAB.accentFaint, fg: LAB.accent, br: LAB.accentBorder || LAB.accent },
    warn:    { bg: LAB.warnBg, fg: LAB.warnFg || LAB.warn, br: LAB.warnBr },
    danger:  { bg: LAB.dangerBg, fg: LAB.dangerFg || LAB.danger, br: LAB.dangerBr },
    success: { bg: LAB.successBg, fg: LAB.successFg || LAB.success, br: LAB.successBr },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px',
      background: palette.bg,
      border: `1px solid ${palette.br}`,
      borderRadius: 3,
      fontFamily: LAB.fontData,
      fontSize: 9.5,
      fontWeight: 600,
      letterSpacing: '.10em',
      color: palette.fg,
      textTransform: 'uppercase',
      ...style,
    }}>
      {Icon && <Icon size={11} color={palette.fg}/>}
      {children}
    </span>
  );
}

// ─── Barcode strip (vertical) ──────────────────────────────────
function BarcodeStrip({ width = 18, height = '100%', orientation = 'vertical', seed = 4 }) {
  // Deterministic bar pattern
  const bars = useCIMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const out = [];
    let pos = 0;
    while (pos < 100) {
      const w = 0.4 + rand() * 1.8;
      const gap = 0.4 + rand() * 1.6;
      out.push({ pos, w });
      pos += w + gap;
    }
    return out;
  }, [seed]);

  // Lab/notebook want bright white paper barcodes; other themes: surfaceAlt + theme ink.
  const barcodeBg = (isCILab() || isCINotebook()) ? '#fff' : LAB.surfaceAlt || LAB.surface;
  const barcodeInk = (isCILab() || isCINotebook()) ? '#0a0e16' : LAB.text;

  if (orientation === 'vertical') {
    return (
      <div style={{
        position: 'relative',
        width,
        height,
        background: barcodeBg,
        borderRight: `1px solid ${LAB.borderFaint}`,
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 18 100" preserveAspectRatio="none" style={{ display: 'block' }}>
          {bars.map((b, i) => (
            <rect key={i} x="3" y={b.pos} width="12" height={b.w} fill={barcodeInk}/>
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height, background: barcodeBg, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 18" preserveAspectRatio="none">
        {bars.map((b, i) => (
          <rect key={i} y="3" x={b.pos} height="12" width={b.w} fill={barcodeInk}/>
        ))}
      </svg>
    </div>
  );
}

// ─── Sparkline ─────────────────────────────────────────────────
function Sparkline({ data, width = 76, height = 22, color = LAB.blue, target }) {
  const min = Math.min(...data, target ?? Infinity);
  const max = Math.max(...data, target ?? -Infinity);
  const span = (max - min) || 1;
  const xAt = (i) => (i / (data.length - 1)) * (width - 2) + 1;
  const yAt = (v) => height - 2 - ((v - min) / span) * (height - 4);
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  // Area fill
  const area = `${path} L ${xAt(data.length - 1).toFixed(1)} ${height - 1} L ${xAt(0).toFixed(1)} ${height - 1} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={area} fill={color} opacity=".10"/>
      {target != null && (
        <line x1="0" y1={yAt(target)} x2={width} y2={yAt(target)}
              stroke={LAB.textTer} strokeWidth=".7" strokeDasharray="2 2" opacity=".55"/>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xAt(data.length - 1)} cy={yAt(data[data.length - 1])} r="2"
              fill={LAB.surface} stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

// ─── Card chrome ───────────────────────────────────────────────
// Barcode strips read as lab-bench / notebook-margin ornament. They suppress
// to nothing on themes that don't want that metaphor (iron, arcade, blueprint,
// darkfuture, graffiti) — the card just gets a normal padding instead.
function Card({ children, style, withBarcode = false, padding }) {
  const showBarcode = withBarcode && (isCILab() || isCINotebook());
  return (
    <div style={{
      background: LAB.surface,
      border: `1px solid ${LAB.border}`,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {showBarcode && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: 18,
          borderRight: `1px solid ${LAB.borderFaint}`,
        }}>
          <BarcodeStrip width={18} height="100%" seed={withBarcode === true ? 4 : withBarcode}/>
        </div>
      )}
      <div style={{ padding: padding ?? 14, paddingLeft: showBarcode ? 30 : (padding ?? 14) }}>
        {children}
      </div>
    </div>
  );
}

// ─── Section header (uppercase mono kicker) ────────────────────
function SectionH({ kicker, title, right, style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, ...style }}>
      <div>
        {kicker && (
          <Mono size={9} weight={600} color={LAB.textTer} style={{ letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
            {kicker}
          </Mono>
        )}
        {title && <Plex size={15} weight={600}>{title}</Plex>}
      </div>
      {right}
    </div>
  );
}

// ─── Bottom Nav (Lab Report) ───────────────────────────────────
function LabBottomNav({ active = 'progress' }) {
  const items = [
    { id: 'gameplan', label: 'Gameplan' },
    { id: 'progress', label: 'Progress' },
    { id: 'log',      label: 'Log', fab: true },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 72,
      background: LAB.isDark ? `${LAB.surface}f7` : 'rgba(255,255,255,.97)',
      borderTop: `1px solid ${LAB.border}`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      paddingTop: 10,
      zIndex: 50,
    }}>
      {items.map(it => {
        if (it.fab) return (
          <div key={it.id} style={{
            position: 'relative', marginTop: -20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: LAB.accent,
              border: `3px solid ${LAB.surface}`,
              display: 'grid', placeItems: 'center',
              fontFamily: LAB.fontBody,
              color: LAB.accentFg || '#fff', fontSize: 22, fontWeight: 300, lineHeight: 1,
              boxShadow: LAB.shadowMd || '0 4px 10px rgba(0,0,0,.25)',
            }}>+</div>
            <span style={{
              fontFamily: LAB.fontBody, fontSize: 10, fontWeight: 500,
              color: LAB.textTer, letterSpacing: '.02em',
            }}>{it.label}</span>
          </div>
        );
        const isActive = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 4,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 3,
              border: `1.6px solid ${isActive ? LAB.blue : LAB.textTer}`,
              background: isActive ? LAB.blueFaint : 'transparent',
            }}/>
            <span style={{
              fontFamily: LAB.fontBody, fontSize: 10, fontWeight: 500,
              color: isActive ? LAB.blue : LAB.textTer, letterSpacing: '.02em',
            }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — Pending Check-In CARD (as it appears on Gameplan tab)
// ═══════════════════════════════════════════════════════════════
function PendingCheckInCard({ compact = false }) {
  return (
    <div style={{
      background: LAB.surface,
      border: `1px solid ${LAB.border}`,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left accent stripe (warning amber) */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: LAB.warn,
      }}/>
      {/* Dismiss × */}
      <button style={{
        position: 'absolute', top: 8, right: 8,
        width: 22, height: 22,
        background: 'transparent', border: 'none',
        color: LAB.textTer,
        fontFamily: LAB.fontBody, fontSize: 16,
        cursor: 'pointer', lineHeight: 1, padding: 0,
        display: 'grid', placeItems: 'center',
      }} aria-label="Dismiss">×</button>

      <div style={{ padding: '14px 14px 14px 18px' }}>
        {/* Top row: severity pill + specimen */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingRight: 22 }}>
          <Pill tone="warn" icon={IconWarn}>
            Action Needed
          </Pill>
          <Mono size={8.5} color={LAB.textTer} weight={500} style={{ letterSpacing: '.12em' }}>
            SPECIMEN # 2026-W17-AB42
          </Mono>
        </div>

        {/* Title + date range */}
        <div style={{ marginBottom: 6 }}>
          <Plex size={15} weight={600}>Weekly Check-In</Plex>
          <Plex size={13} weight={400} color={LAB.textSec} style={{ marginLeft: 6 }}>·</Plex>
          <Plex size={13} weight={500} color={LAB.textSec} style={{ marginLeft: 6 }}>Week 6</Plex>
        </div>
        <Mono size={11} color={LAB.textTer} weight={400} style={{ display: 'block', marginBottom: 10 }}>
          Apr 19 – Apr 25
        </Mono>

        {/* Summary */}
        <Plex size={13} weight={400} color={LAB.textSec} style={{ display: 'block', lineHeight: 1.5, textWrap: 'pretty' }}>
          You're <Mono size={13} weight={600} color={LAB.text}>1.8 lb</Mono> behind weight target. <Mono size={13} weight={600} color={LAB.text}>2</Mono> recommendations.
        </Plex>

        {/* Inline mini-summary chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <SummaryChip label="Weight" value="178.4 lb" tone="red" icon={IconWeight}/>
          <SummaryChip label="Sessions" value="4 / 5" tone="yellow" icon={IconBarbell}/>
          <SummaryChip label="Sleep" value="6.4 h" tone="red" icon={IconMoon}/>
        </div>

        {/* CTA */}
        <button style={{
          width: '100%',
          background: LAB.accent,
          color: LAB.accentFg || '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '11px 14px',
          fontFamily: LAB.fontBody,
          fontSize: 14, fontWeight: 600,
          letterSpacing: '.01em',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          Open check-in
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M3 7 L11 7 M7.5 3.5 L11 7 L7.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, tone, icon: Icon }) {
  const toneColor = tone === 'red' ? LAB.danger : tone === 'yellow' ? LAB.warn : tone === 'green' ? LAB.success : LAB.textSec;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 8px',
      background: LAB.surfaceAlt,
      border: `1px solid ${LAB.borderFaint}`,
      borderRadius: 4,
    }}>
      {Icon ? <Icon size={12} color={toneColor}/> : <Dot tone={tone} size={6}/>}
      <Plex size={10.5} weight={500} color={LAB.textSec} style={{ letterSpacing: '.01em' }}>{label}</Plex>
      <Mono size={10.5} weight={600} color={LAB.text}>{value}</Mono>
      <StatusGlyph tone={tone} size={8}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — Full check-in detail page
// ═══════════════════════════════════════════════════════════════

// 2a — Page header
function DetailHeader({ status = 'pending' }) {
  const statusPill = status === 'pending'
    ? <Pill tone="warn" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Pending Review</Pill>
    : status === 'applied'
      ? <Pill tone="success" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Fully Applied</Pill>
      : <Pill tone="neutral" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Reviewed</Pill>;
  return (
    <div style={{
      background: LAB.surface,
      borderBottom: `1px solid ${LAB.border}`,
      padding: '14px 16px 14px',
      position: 'relative',
    }}>
      {/* Back + specimen row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0,
          color: LAB.textSec,
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M9 3 L4.5 7 L9 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Plex size={12} weight={500} color={LAB.textSec}>Gameplan</Plex>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.12em', whiteSpace: 'nowrap' }}>
            SPECIMEN # 2026-W17-AB42
          </Mono>
          {statusPill}
        </div>
      </div>
      {/* Title row */}
      <div>
        <CIMarker style={{ display: 'block', fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-.01em', whiteSpace: 'nowrap', color: LAB.text }}>
          Weekly Check-In
        </CIMarker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Mono size={11} color={LAB.textSec} weight={500}>Apr 19 – Apr 25</Mono>
          <span style={{ width: 3, height: 3, background: LAB.textTer, borderRadius: '50%' }}/>
          <Mono size={11} color={LAB.textSec} weight={500}>Week 6</Mono>
        </div>
      </div>
    </div>
  );
}

// 2b — Snapshot section (4 tiles)
function SnapshotSection() {
  return (
    <div style={{ padding: '16px 16px 4px' }}>
      <SectionH kicker="2.1 / Snapshot" title="This week's metrics"/>
      <div style={{
        background: LAB.surface,
        border: `1px solid ${LAB.border}`,
        borderRadius: 8,
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {(isCILab() || isCINotebook()) && (
          <BarcodeStrip width={18} height="auto" seed={9}/>
        )}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <SnapshotTile
            label="Body weight"
            sub="Rolling 7d avg"
            value="178.4"
            unit="lb"
            delta="+0.3"
            deltaUnit="lb"
            deltaTone="red"
            tone="red"
            Icon={IconWeight}
            sparkData={[178.0, 178.2, 178.1, 178.3, 178.5, 178.4, 178.2, 178.1, 178.4, 178.3, 178.5, 178.6, 178.4, 178.4]}
            target={176.0}
            target_label="behind"
            border="r b"
          />
          <SnapshotTile
            label="Training adherence"
            sub="Sessions completed"
            value="4"
            unit="/ 5"
            delta="80%"
            deltaTone="yellow"
            tone="yellow"
            Icon={IconBarbell}
            sparkData={null}
            adherence={[1, 1, 1, 0, 1]}
            border="b"
          />
          <SnapshotTile
            label="Avg calories"
            sub="Daily intake"
            value="2,380"
            unit="kcal"
            delta="+130"
            deltaUnit="vs target"
            deltaTone="yellow"
            tone="yellow"
            Icon={IconFlame}
            sparkData={[2280, 2410, 2350, 2490, 2310, 2390, 2440, 2280, 2360, 2420, 2380, 2450, 2310, 2380]}
            target={2250}
            border="r"
          />
          <SnapshotTile
            label="Sleep duration"
            sub="Avg / night"
            value="6.4"
            unit="h"
            delta="−1.1"
            deltaUnit="vs target"
            deltaTone="red"
            tone="red"
            Icon={IconMoon}
            sparkData={[6.8, 6.2, 6.5, 5.9, 7.0, 6.4, 6.1, 6.6, 6.3, 5.8, 6.7, 6.2, 6.5, 6.4]}
            target={7.5}
            border=""
          />
        </div>
      </div>
    </div>
  );
}

function SnapshotTile({ label, sub, value, unit, delta, deltaUnit, deltaTone, tone, Icon, sparkData, target, adherence, border = '' }) {
  const borderRight = border.includes('r') ? `1px solid ${LAB.borderFaint}` : 'none';
  const borderBottom = border.includes('b') ? `1px solid ${LAB.borderFaint}` : 'none';
  const sparkColor = tone === 'red' ? LAB.danger : tone === 'yellow' ? LAB.warn : LAB.blue;
  const toneColor = tone === 'red' ? LAB.danger : tone === 'yellow' ? LAB.warn : LAB.success;
  return (
    <div style={{
      padding: '12px 12px 12px',
      borderRight,
      borderBottom,
      position: 'relative',
      minHeight: 124,
    }}>
      {/* status glyph in top-right corner */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <StatusGlyph tone={tone} size={9}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
        {Icon && <Icon size={13} color={toneColor}/>}
        <Plex size={10.5} weight={500} color={LAB.textSec} style={{ letterSpacing: '.01em' }}>
          {label}
        </Plex>
      </div>
      <Mono size={9} color={LAB.textTer} weight={400} style={{ display: 'block', marginBottom: 8, letterSpacing: '.02em', paddingLeft: 19 }}>
        {sub}
      </Mono>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <CIReenie style={{ fontSize: 22, fontWeight: 600, color: LAB.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>
          {value}
        </CIReenie>
        <Mono size={11} color={LAB.textTer} weight={500}>{unit}</Mono>
      </div>
      <div style={{ marginBottom: 8 }}>
        {(delta.startsWith('+') || delta.startsWith('−') || delta.startsWith('-')) ? (
          <DeltaToken value={delta} unit={deltaUnit} tone={deltaTone}/>
        ) : (
          <Mono size={10} weight={500} color={deltaTone === 'red' ? LAB.danger : deltaTone === 'yellow' ? LAB.warn : LAB.success}>
            {delta}{deltaUnit ? ` ${deltaUnit}` : ''}
          </Mono>
        )}
      </div>
      {sparkData && (
        <Sparkline data={sparkData} width={120} height={20} color={sparkColor} target={target}/>
      )}
      {adherence && (
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
          {adherence.map((d, i) => (
            <div key={i} style={{
              width: 18, height: 20,
              border: `1px solid ${d ? LAB.success : LAB.danger}`,
              background: d ? LAB.successBg : LAB.dangerBg,
              borderRadius: 2,
              display: 'grid', placeItems: 'center',
              fontFamily: LAB.fontData,
              fontSize: 9, fontWeight: 600,
              color: d ? LAB.success : LAB.danger,
            }}>{d ? '✓' : '×'}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// 2c — Recommendation cards
function RecommendationCardA({ applied = false }) {
  return (
    <Card style={{ marginBottom: 12 }} padding={0}>
      {/* Severity bar at top */}
      <div style={{ height: 3, background: applied ? LAB.borderFaint : LAB.warn }}/>
      <div style={{ padding: '14px 14px 12px', opacity: applied ? 0.78 : 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Pill tone={applied ? 'success' : 'warn'} icon={applied ? IconCheckCircle : IconGauge}>
            {applied ? 'Applied' : 'Adjust Rate'}
          </Pill>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.12em' }}>
            REC · 01 / 02
          </Mono>
        </div>
        <Plex size={16} weight={600} style={{ display: 'block', lineHeight: 1.25, marginBottom: 6, textWrap: 'pretty' }}>
          You're behind your weight target
        </Plex>
        <Plex size={12.5} weight={400} color={LAB.textSec} style={{ display: 'block', lineHeight: 1.5, marginBottom: 12, textWrap: 'pretty' }}>
          Your rolling 7d body weight has held at{' '}
          <Mono size={12.5} weight={600} color={LAB.text}>178.4 lb</Mono> for the past{' '}
          <Mono size={12.5} weight={600} color={LAB.text}>10 days</Mono>. At your current pace, you'll finish{' '}
          <Mono size={12.5} weight={600} color={LAB.text}>2.4 lb</Mono> above your target of{' '}
          <Mono size={12.5} weight={600} color={LAB.text}>168 lb</Mono>.
        </Plex>

        {/* Projection chart — current vs target trajectory */}
        {!applied && (
          <div style={{
            background: LAB.surfaceAlt,
            border: `1px solid ${LAB.borderFaint}`,
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Mono size={9} color={LAB.textTer} weight={600} style={{ letterSpacing: '.10em', textTransform: 'uppercase' }}>
                Projection · 60 days out
              </Mono>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 1.6, background: LAB.danger }}/>
                  <Mono size={8.5} color={LAB.textSec} weight={500}>Actual</Mono>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="2"><line x1="0" y1="1" x2="10" y2="1" stroke={LAB.success} strokeWidth="1.2" strokeDasharray="2 2"/></svg>
                  <Mono size={8.5} color={LAB.textSec} weight={500}>Target</Mono>
                </span>
              </div>
            </div>
            <ProjectionMini
              width={300}
              height={42}
              currentSeries={[184, 182.5, 181, 180, 179.2, 178.6, 178.4, 178.4, 178.4, 178.4, 178.4, 178.4, 178.4]}
              targetSeries={[184, 182.7, 181.4, 180.1, 178.8, 177.5, 176.2, 174.9, 173.6, 172.3, 171.0, 169.7, 168.4]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Mono size={8.5} color={LAB.textTer} weight={500}>W1</Mono>
              <Mono size={8.5} color={LAB.danger} weight={600}>NOW · W6</Mono>
              <Mono size={8.5} color={LAB.textTer} weight={500}>W16</Mono>
            </div>
          </div>
        )}

        {/* Underlying data */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 4 L5 7 L8 4" fill="none" stroke={LAB.textSec} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Mono size={10} weight={600} color={LAB.textSec} style={{ letterSpacing: '.10em', textTransform: 'uppercase' }}>
              Underlying data
            </Mono>
          </div>
          <DataTable rows={[
            ['Prescribed rate', '−0.7 lb / wk', null],
            ['Actual rate (last 14d)', '−0.1 lb / wk', 'red'],
            ['Gap from projection', '−1.8 lb', 'red'],
            ['Days remaining', '60', null],
          ]}/>
        </div>

        {/* Suggested action options */}
        {!applied && (
          <>
            <Mono size={10} weight={600} color={LAB.textSec} style={{ display: 'block', marginBottom: 8, letterSpacing: '.10em', textTransform: 'uppercase' }}>
              Suggested actions · pick one
            </Mono>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <OptionCard
                label="Option 1"
                title="Drop calories 100/day"
                outcome="Back on track in 14 days"
                Icon={IconFlame}
                visual="timeline"
                recommended
              />
              <OptionCard
                label="Option 2"
                title="Extend Gameplan +2 weeks"
                outcome="Keep current calories"
                Icon={IconCalendar}
                visual="extension"
              />
            </div>
          </>
        )}

        {applied && (
          <div style={{
            background: LAB.successBg,
            border: `1px solid ${LAB.successBr}`,
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 10,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ marginTop: 2, flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6.5" fill={LAB.success}/>
              <path d="M4 7.2 L6 9.2 L10 5" fill="none" stroke={LAB.isDark ? LAB.surface : '#fff'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ flex: 1 }}>
              <Plex size={12} weight={600} color={LAB.success} style={{ display: 'block' }}>
                Applied · Apr 24
              </Plex>
              <Plex size={11.5} weight={400} color={LAB.textSec} style={{ display: 'block', marginTop: 2, lineHeight: 1.45 }}>
                Option 1 — calories reduced by{' '}
                <Mono size={11.5} weight={600} color={LAB.text}>150 kcal/day</Mono> (2,400 → 2,250).
              </Plex>
              <Plex size={11} weight={500} color={LAB.blue} style={{ display: 'inline-block', marginTop: 6, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
                View change in history →
              </Plex>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!applied ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
              <PrimaryBtn>Apply Option 1</PrimaryBtn>
              <PrimaryBtn variant="secondary">Apply Option 2</PrimaryBtn>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <button style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                color: LAB.blue,
              }}>
                <svg width="11" height="11" viewBox="0 0 12 12">
                  <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
                </svg>
                <Plex size={11.5} weight={500} color={LAB.blue}>Open in Planning Mode</Plex>
              </button>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Plex size={11.5} weight={400} color={LAB.textTer} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Dismiss
                </Plex>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function RecommendationCardB({ applied = false }) {
  return (
    <Card padding={0}>
      <div style={{ height: 3, background: applied ? LAB.borderFaint : LAB.blue }}/>
      <div style={{ padding: '14px 14px 12px', opacity: applied ? 0.78 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Pill tone={applied ? 'success' : 'blue'} icon={applied ? IconCheckCircle : IconInfo}>
            {applied ? 'Acknowledged' : 'Adherence'}
          </Pill>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.12em' }}>
            REC · 02 / 02
          </Mono>
        </div>
        <Plex size={16} weight={600} style={{ display: 'block', lineHeight: 1.25, marginBottom: 6, textWrap: 'pretty' }}>
          You missed Day 4 last week
        </Plex>
        <Plex size={12.5} weight={400} color={LAB.textSec} style={{ display: 'block', lineHeight: 1.5, marginBottom: 12, textWrap: 'pretty' }}>
          <Mono size={12.5} weight={600} color={LAB.text}>1 of 5</Mono> scheduled sessions wasn't logged. Two weeks in a row would trigger a reduction recommendation.
        </Plex>

        {/* Mini week bar */}
        <div style={{
          background: LAB.surfaceAlt,
          border: `1px solid ${LAB.borderFaint}`,
          borderRadius: 6,
          padding: '10px 10px',
          marginBottom: 12,
        }}>
          <Mono size={9} color={LAB.textTer} weight={600} style={{ display: 'block', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 8 }}>
            Last week's sessions
          </Mono>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            {[
              { d: 'Mon', kind: 'Push', logged: true, color: LAB.push },
              { d: 'Tue', kind: 'Pull', logged: true, color: LAB.pull },
              { d: 'Wed', kind: 'Rest', logged: true, color: LAB.borderFaint, rest: true },
              { d: 'Thu', kind: 'Legs', logged: false, color: LAB.legs },
              { d: 'Fri', kind: 'Push', logged: true, color: LAB.push },
              { d: 'Sat', kind: 'Pull', logged: true, color: LAB.pull },
              { d: 'Sun', kind: 'Rest', logged: true, color: LAB.borderFaint, rest: true },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Mono size={8.5} color={LAB.textTer} weight={500}>{s.d}</Mono>
                <div style={{
                  width: '100%', height: 26,
                  background: s.rest ? LAB.surfaceAlt || LAB.surface : (s.logged ? s.color : 'transparent'),
                  border: s.rest
                    ? `1px dashed ${LAB.border}`
                    : (s.logged ? `1px solid ${s.color}` : `1.5px dashed ${LAB.danger}`),
                  borderRadius: 3,
                  display: 'grid', placeItems: 'center',
                }}>
                  {!s.logged && !s.rest && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M2 2 L8 8 M8 2 L2 8" stroke={LAB.danger} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <Mono size={7.5} color={s.rest ? LAB.textTer : (s.logged ? LAB.textSec : LAB.danger)} weight={600} style={{ letterSpacing: '.05em' }}>
                  {s.kind.toUpperCase()}
                </Mono>
              </div>
            ))}
          </div>
        </div>

        {applied && (
          <div style={{
            background: LAB.successBg,
            border: `1px solid ${LAB.successBr}`,
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 4,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ marginTop: 2, flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6.5" fill={LAB.success}/>
              <path d="M4 7.2 L6 9.2 L10 5" fill="none" stroke={LAB.isDark ? LAB.surface : '#fff'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ flex: 1 }}>
              <Plex size={12} weight={600} color={LAB.success} style={{ display: 'block' }}>
                Acknowledged · Apr 24
              </Plex>
              <Plex size={11.5} weight={400} color={LAB.textSec} style={{ display: 'block', marginTop: 2, lineHeight: 1.45 }}>
                Observational only — no Gameplan change.
              </Plex>
            </div>
          </div>
        )}

        {!applied && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PrimaryBtn variant="secondary" style={{ flex: '0 0 auto', padding: '8px 16px' }}>
              Acknowledge
            </PrimaryBtn>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Plex size={11.5} weight={400} color={LAB.textTer} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Dismiss
              </Plex>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function OptionCard({ label, title, outcome, recommended, Icon, visual }) {
  const accent = recommended ? LAB.blue : LAB.textSec;
  return (
    <div style={{
      border: `1px solid ${recommended ? LAB.blue : LAB.border}`,
      background: recommended ? LAB.blueFaint : LAB.surfaceAlt,
      borderRadius: 6,
      padding: '9px 10px',
      position: 'relative',
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -7, left: 8,
          background: LAB.accent,
          color: LAB.accentFg || '#fff',
          padding: '1px 6px',
          fontFamily: LAB.fontData,
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: '.10em',
          borderRadius: 2,
          textTransform: 'uppercase',
        }}>
          Recommended
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Mono size={9} weight={600} color={LAB.textTer} style={{ letterSpacing: '.12em', textTransform: 'uppercase' }}>
          {label}
        </Mono>
        {Icon && <Icon size={13} color={accent}/>}
      </div>
      <Plex size={12} weight={600} style={{ display: 'block', lineHeight: 1.3, marginBottom: 6, textWrap: 'pretty' }}>
        {title}
      </Plex>
      {/* Per-option visual */}
      {visual === 'timeline' && (
        <div style={{ marginBottom: 6 }}>
          <TimelineMini days={14} marker={14} label="days" color={accent}/>
        </div>
      )}
      {visual === 'extension' && (
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 1.5, flex: 1 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 5,
                background: i < 6 ? LAB.accent : i < 16 ? LAB.accentFaint : LAB.borderFaint,
                borderRadius: 1,
              }}/>
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`ext-${i}`} style={{
                flex: 1, height: 5,
                background: 'transparent',
                border: `1px dashed ${accent}`,
                borderRadius: 1,
              }}/>
            ))}
          </div>
          <span style={{ fontFamily: LAB.fontData, fontSize: 9, fontWeight: 600, color: accent, letterSpacing: '.05em' }}>
            +2w
          </span>
        </div>
      )}
      <Mono size={10} weight={400} color={LAB.textSec} style={{ display: 'block', lineHeight: 1.4 }}>
        → {outcome}
      </Mono>
    </div>
  );
}

function PrimaryBtn({ children, variant = 'primary', style }) {
  const styles = variant === 'primary'
    ? { background: LAB.accent, color: LAB.accentFg || '#fff', border: `1px solid ${LAB.accent}` }
    : { background: LAB.surface, color: LAB.accent, border: `1px solid ${LAB.accent}` };
  return (
    <button style={{
      ...styles,
      borderRadius: 6,
      padding: '9px 10px',
      fontFamily: LAB.fontBody,
      fontSize: 12.5, fontWeight: 600,
      letterSpacing: '.01em',
      cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

function DataTable({ rows }) {
  return (
    <div style={{
      border: `1px solid ${LAB.borderFaint}`,
      borderRadius: 4,
      overflow: 'hidden',
    }}>
      {rows.map(([label, value, tone], i) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 10px',
          background: i % 2 === 0 ? LAB.surface : LAB.surfaceAlt,
          borderBottom: i < rows.length - 1 ? `1px solid ${LAB.borderFaint}` : 'none',
        }}>
          <Plex size={11.5} weight={400} color={LAB.textSec}>{label}</Plex>
          <Mono size={11.5} weight={600} color={tone === 'red' ? LAB.danger : tone === 'green' ? LAB.success : LAB.text}>
            {value}
          </Mono>
        </div>
      ))}
    </div>
  );
}

// 2d — Week breakdown table
function WeekBreakdown() {
  const rows = [
    { date: 'Mon Apr 19', wk: 'Push',   wt: '178.2', kcal: '2,310', sleep: '6.8', steps: '8,420' },
    { date: 'Tue Apr 20', wk: 'Pull',   wt: '178.5', kcal: '2,490', sleep: '6.2', steps: '7,180' },
    { date: 'Wed Apr 21', wk: 'Rest',   wt: '178.4', kcal: '2,350', sleep: '6.5', steps: '5,210' },
    { date: 'Thu Apr 22', wk: '—',      wt: '178.6', kcal: '2,440', sleep: '5.9', steps: '4,890', missed: true },
    { date: 'Fri Apr 23', wk: 'Push',   wt: '178.4', kcal: '2,310', sleep: '7.0', steps: '9,140' },
    { date: 'Sat Apr 24', wk: 'Pull',   wt: '178.3', kcal: '2,420', sleep: '6.4', steps: '6,720' },
    { date: 'Sun Apr 25', wk: 'Rest',   wt: '178.4', kcal: '2,340', sleep: '6.1', steps: '4,310' },
  ];
  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <SectionH kicker="2.4 / Week breakdown" title="Daily activity log"
        right={<Mono size={10} color={LAB.textTer} weight={500}>7 ROWS</Mono>}/>
      <Card padding={0}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.9fr 0.7fr 0.9fr 0.6fr 0.9fr',
          background: LAB.surfaceAlt,
          borderBottom: `1px solid ${LAB.border}`,
          padding: '6px 10px',
          gap: 4,
        }}>
          {['Date', 'Workout', 'Wt', 'Kcal', 'Sleep', 'Steps'].map((h, i) => (
            <Mono key={h} size={9} color={LAB.textTer} weight={600}
                  style={{ letterSpacing: '.10em', textTransform: 'uppercase', textAlign: i >= 2 ? 'right' : 'left' }}>
              {h}
            </Mono>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.9fr 0.7fr 0.9fr 0.6fr 0.9fr',
            padding: '8px 10px',
            background: i % 2 === 0 ? LAB.surface : LAB.surfaceAlt,
            borderBottom: i < rows.length - 1 ? `1px solid ${LAB.borderFaint}` : 'none',
            gap: 4,
            alignItems: 'center',
          }}>
            <Mono size={11} weight={500} color={LAB.text}>{r.date}</Mono>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
              {r.wk !== '—' && r.wk !== 'Rest' && (
                <IconBarbell size={11} color={r.wk === 'Push' ? LAB.push : r.wk === 'Pull' ? LAB.pull : LAB.legs}/>
              )}
              <Plex size={11} weight={500} color={r.missed ? LAB.danger : (r.wk === 'Rest' || r.wk === '—' ? LAB.textTer : LAB.textSec)}
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.missed ? 'missed' : r.wk}
              </Plex>
            </div>
            <Mono size={11} weight={500} color={LAB.text} style={{ textAlign: 'right' }}>{r.wt}</Mono>
            <Mono size={11} weight={500} color={LAB.text} style={{ textAlign: 'right' }}>{r.kcal}</Mono>
            <Mono size={11} weight={500} color={LAB.text} style={{ textAlign: 'right' }}>{r.sleep}</Mono>
            <Mono size={11} weight={500} color={LAB.text} style={{ textAlign: 'right' }}>{r.steps}</Mono>
          </div>
        ))}
        {/* Totals / averages row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.9fr 0.7fr 0.9fr 0.6fr 0.9fr',
          padding: '8px 10px',
          background: LAB.surfaceAlt || LAB.surface,
          borderTop: `1.5px solid ${LAB.border}`,
          gap: 4,
          alignItems: 'center',
        }}>
          <Mono size={10} weight={600} color={LAB.textSec} style={{ letterSpacing: '.05em', textTransform: 'uppercase' }}>
            Avg
          </Mono>
          <Plex size={10.5} weight={500} color={LAB.textTer}>4 / 5</Plex>
          <Mono size={11} weight={700} color={LAB.text} style={{ textAlign: 'right' }}>178.4</Mono>
          <Mono size={11} weight={700} color={LAB.text} style={{ textAlign: 'right' }}>2,380</Mono>
          <Mono size={11} weight={700} color={LAB.text} style={{ textAlign: 'right' }}>6.4</Mono>
          <Mono size={11} weight={700} color={LAB.text} style={{ textAlign: 'right' }}>6,553</Mono>
        </div>
      </Card>
    </div>
  );
}

// 2e — History context — 6-week weight trajectory with check-in dots
function HistoryStrip() {
  return (
    <div style={{ padding: '4px 16px 14px' }}>
      <Card padding={14}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <Plex size={12.5} weight={600} style={{ display: 'block' }}>Body weight · 6-week trajectory</Plex>
            <Mono size={10} color={LAB.textTer} weight={500} style={{ display: 'block', marginTop: 2, letterSpacing: '.02em' }}>
              Daily rolling avg · check-in markers
            </Mono>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Plex size={11.5} weight={500} color={LAB.blue} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              View all →
            </Plex>
          </button>
        </div>
        <HistoryTrajectory width={360} height={92}/>
        <div style={{
          marginTop: 8, paddingTop: 8,
          borderTop: `1px dashed ${LAB.borderFaint}`,
          display: 'flex', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 1.6, background: LAB.blue }}/>
            <Mono size={9} color={LAB.textSec} weight={500}>Actual</Mono>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="2"><line x1="0" y1="1" x2="12" y2="1" stroke={LAB.success} strokeWidth="1.2" strokeDasharray="3 3"/></svg>
            <Mono size={9} color={LAB.textSec} weight={500}>Target</Mono>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <StatusGlyph tone="green" size={8}/>
            <Mono size={9} color={LAB.textSec} weight={500}>On track</Mono>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <StatusGlyph tone="yellow" size={8}/>
            <Mono size={9} color={LAB.textSec} weight={500}>Monitor</Mono>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <StatusGlyph tone="red" size={8}/>
            <Mono size={9} color={LAB.textSec} weight={500}>Behind</Mono>
          </span>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN — Pending Check-In card on Gameplan tab (just the card)
// ═══════════════════════════════════════════════════════════════
function ScreenPendingCard() {
  return (
    <div style={{ background: LAB.bg, height: '100%', position: 'relative', overflowY: 'auto' }}>
      {/* fake gameplan-tab header to give context */}
      <div style={{ padding: '14px 16px 8px', borderBottom: `1px solid ${LAB.border}`, background: LAB.surface }}>
        <Mono size={9} color={LAB.textTer} weight={600} style={{ letterSpacing: '.18em', textTransform: 'uppercase' }}>
          Gameplan · Strength Block
        </Mono>
        <Plex size={20} weight={600} style={{ display: 'block', marginTop: 3, letterSpacing: '-.01em' }}>
          Iron &amp; Grow
        </Plex>
        <Mono size={10.5} color={LAB.textSec} weight={500} style={{ display: 'block', marginTop: 2 }}>
          Week 6 / 16 · 71 days remaining
        </Mono>
      </div>

      {/* Sub-tab indicator */}
      <div style={{ padding: '12px 16px 4px' }}>
        <Mono size={9} color={LAB.textTer} weight={600} style={{ letterSpacing: '.18em', textTransform: 'uppercase' }}>
          1.0 / Pending Check-In
        </Mono>
      </div>

      {/* The card */}
      <div style={{ padding: '6px 16px 16px' }}>
        <PendingCheckInCard/>
      </div>

      {/* Filler context */}
      <div style={{ padding: '0 16px 16px' }}>
        <Mono size={9} color={LAB.textTer} weight={600} style={{ display: 'block', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          1.1 / Today's session
        </Mono>
        <Card padding={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, background: LAB.pull }}/>
                <Mono size={9.5} color={LAB.pull} weight={700} style={{ letterSpacing: '.15em' }}>
                  PULL · DAY 3
                </Mono>
              </div>
              <Plex size={16} weight={600}>Pull · 6 exercises</Plex>
              <Mono size={10.5} color={LAB.textTer} weight={500} style={{ display: 'block', marginTop: 4 }}>
                ~55 min · 4 × top sets
              </Mono>
            </div>
            <PrimaryBtn>Start →</PrimaryBtn>
          </div>
        </Card>
      </div>

      {/* placeholder area */}
      <div style={{ padding: '0 16px 80px' }}>
        <div style={{
          height: 90,
          background: isCILab() || isCINotebook()
            ? 'repeating-linear-gradient(135deg, #fff 0 8px, #F8F9FB 8px 16px)'
            : LAB.surfaceAlt || LAB.surface,
          border: `1px solid ${LAB.borderFaint}`,
          borderRadius: 8,
          display: 'grid', placeItems: 'center',
        }}>
          <Mono size={10} color={LAB.textTer} weight={500} style={{ letterSpacing: '.10em', textTransform: 'uppercase' }}>
            Goal Pulse Strip
          </Mono>
        </div>
      </div>

      <LabBottomNav active="gameplan"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN — Full check-in detail (Pending state)
// ═══════════════════════════════════════════════════════════════
function ScreenCheckInDetail({ status = 'pending' }) {
  const applied = status === 'applied';
  return (
    <div style={{ background: LAB.bg, height: '100%', position: 'relative', overflowY: 'auto' }}>
      <DetailHeader status={status}/>

      {/* Section 2b */}
      <SnapshotSection/>

      {/* Section 2c — Recommendations */}
      <div style={{ padding: '16px 16px 4px' }}>
        <SectionH
          kicker="2.2 / Recommendations"
          title={applied ? "What was applied" : "What we're suggesting"}
          right={<Mono size={10} color={LAB.textTer} weight={500}>2 ITEMS</Mono>}
        />
        <RecommendationCardA applied={applied}/>
        <RecommendationCardB applied={applied}/>
      </div>

      {/* Section 2d — Week breakdown */}
      <WeekBreakdown/>

      {/* Section 2e — History */}
      <div style={{ padding: '4px 16px 4px' }}>
        <SectionH kicker="2.5 / History" title="Past check-ins"/>
      </div>
      <HistoryStrip/>

      {/* Footer signoff */}
      <div style={{ padding: '4px 16px 90px' }}>
        <div style={{
          borderTop: `1px dashed ${LAB.border}`,
          paddingTop: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.10em' }}>
            Engine v2.4 · ran Apr 26, 8:00 AM
          </Mono>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.10em' }}>
            END / SPECIMEN
          </Mono>
        </div>
      </div>

      <LabBottomNav active="progress"/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN — Empty state (between weeks)
// ═══════════════════════════════════════════════════════════════
function ScreenEmpty() {
  const past = [
    { date: 'Apr 12 – Apr 18', wk: 5, recs: 1, applied: 1, dismissed: 0, status: 'green', summary: 'Bench e1RM tracking ahead — kept volume.' },
    { date: 'Apr 5 – Apr 11',  wk: 4, recs: 2, applied: 1, dismissed: 1, status: 'yellow', summary: 'Sleep flagged. +1 deload session offered.' },
    { date: 'Mar 29 – Apr 4',  wk: 3, recs: 0, applied: 0, dismissed: 0, status: 'green', summary: 'All metrics within ±1σ of plan.' },
  ];

  return (
    <div style={{ background: LAB.bg, height: '100%', position: 'relative', overflowY: 'auto' }}>
      <DetailHeader status="empty"/>

      {/* Override status header for empty state */}
      <div style={{ position: 'absolute', top: 14 + 30, right: 16 }}>
        {/* DetailHeader already shows; this is just visual */}
      </div>

      {/* Next check-in countdown card */}
      <div style={{ padding: '16px 16px 8px' }}>
        <SectionH kicker="3.1 / Next check-in" title="Scheduled run"/>
        <Card withBarcode={11} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Pill tone="blue" style={{ marginBottom: 8 }}>Scheduled</Pill>
              <Plex size={17} weight={600} style={{ display: 'block', lineHeight: 1.2, letterSpacing: '-.01em' }}>
                Sunday, Apr 27
              </Plex>
              <Mono size={11} color={LAB.textSec} weight={500} style={{ display: 'block', marginTop: 4 }}>
                8:00 AM · auto-run
              </Mono>
            </div>
            {/* Countdown */}
            <div style={{
              border: `1px solid ${LAB.border}`,
              borderRadius: 6,
              padding: '6px 10px',
              background: LAB.surfaceAlt,
              textAlign: 'center',
              minWidth: 84,
            }}>
              <Mono size={9} color={LAB.textTer} weight={600} style={{ letterSpacing: '.10em', textTransform: 'uppercase', display: 'block' }}>
                In
              </Mono>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginTop: 2 }}>
                <CIReenie style={{ fontSize: 26, fontWeight: 700, color: LAB.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>
                  1
                </CIReenie>
                <Mono size={11} color={LAB.textSec} weight={500}>day</Mono>
              </div>
              <Mono size={9} color={LAB.textTer} weight={500} style={{ display: 'block', marginTop: 3 }}>
                14h 22m
              </Mono>
            </div>
          </div>

          {/* Mini progress strip */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.10em', textTransform: 'uppercase' }}>
                Week so far
              </Mono>
              <Mono size={9} color={LAB.textSec} weight={600}>6 / 7 days</Mono>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 1,
                  background: i < 6 ? LAB.blue : LAB.borderFaint,
                }}/>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: `1px dashed ${LAB.borderFaint}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" fill="none" stroke={LAB.textTer} strokeWidth="1.2"/>
              <path d="M7 4 L7 7 L9.5 8.5" fill="none" stroke={LAB.textTer} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <Plex size={11.5} weight={400} color={LAB.textSec} style={{ lineHeight: 1.4 }}>
              The engine compares your last 7 days of weight, sessions, sleep & nutrition against projection.
            </Plex>
          </div>
        </Card>
      </div>

      {/* Past check-ins */}
      <div style={{ padding: '12px 16px 0' }}>
        <SectionH
          kicker="3.2 / Past check-ins"
          title="History"
          right={<Mono size={10} color={LAB.textTer} weight={500}>{past.length} ENTRIES</Mono>}
        />
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {past.map((p, i) => (
          <PastCheckInRow key={i} {...p}/>
        ))}
      </div>

      <div style={{ padding: '0 16px 90px' }}>
        <button style={{
          width: '100%', padding: '10px 14px',
          background: LAB.surface, border: `1px solid ${LAB.border}`, borderRadius: 6,
          fontFamily: LAB.fontBody,
          fontSize: 12, fontWeight: 500,
          color: LAB.textSec,
          cursor: 'pointer',
        }}>
          View all 6 check-ins →
        </button>
      </div>

      <LabBottomNav active="progress"/>
    </div>
  );
}

function PastCheckInRow({ date, wk, recs, applied, dismissed, status, summary }) {
  const color = status === 'green' ? LAB.success : status === 'yellow' ? LAB.warn : LAB.danger;
  return (
    <div style={{
      background: LAB.surface,
      border: `1px solid ${LAB.border}`,
      borderRadius: 6,
      padding: '10px 12px',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      {/* Status mark */}
      <div style={{
        width: 4, alignSelf: 'stretch',
        background: color,
        flexShrink: 0,
        marginLeft: -12, marginTop: -10, marginBottom: -10,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mono size={11.5} weight={600} color={LAB.text}>Week {wk}</Mono>
            <span style={{ width: 3, height: 3, background: LAB.textTer, borderRadius: '50%' }}/>
            <Mono size={11} weight={500} color={LAB.textSec}>{date}</Mono>
          </div>
          <svg width="11" height="11" viewBox="0 0 12 12" style={{ color: LAB.textTer }}>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <Plex size={11.5} weight={400} color={LAB.textSec} style={{ display: 'block', lineHeight: 1.4, marginBottom: 6, textWrap: 'pretty' }}>
          {summary}
        </Plex>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <SmallStat label="recs" value={recs}/>
          {applied > 0 && <SmallStat label="applied" value={applied} tone="green"/>}
          {dismissed > 0 && <SmallStat label="dismissed" value={dismissed} tone="ter"/>}
        </div>
      </div>
    </div>
  );
}

function SmallStat({ label, value, tone = 'neutral' }) {
  const fg = tone === 'green' ? LAB.success : tone === 'ter' ? LAB.textTer : LAB.textSec;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 6px',
      background: LAB.surfaceAlt,
      border: `1px solid ${LAB.borderFaint}`,
      borderRadius: 3,
    }}>
      <Mono size={10} weight={700} color={fg}>{value}</Mono>
      <Plex size={9.5} weight={500} color={LAB.textTer} style={{ letterSpacing: '.02em' }}>{label}</Plex>
    </span>
  );
}

// Empty-state header override (status pill = scheduled, no specimen yet)
// We re-render DetailHeader via a wrapped variant for empty state.
const _origDetailHeader = DetailHeader;
function DetailHeaderEmpty() { return null; }

// Override for empty state - replace via guard above. Actually to keep simple
// we'll just leave the default. Status="empty" -> "Reviewed" pill which is wrong.
// Instead patch:
function DetailHeaderForEmpty() {
  return (
    <div style={{
      background: LAB.surface,
      borderBottom: `1px solid ${LAB.border}`,
      padding: '14px 16px 14px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: LAB.textSec,
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M9 3 L4.5 7 L9 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Plex size={12} weight={500} color={LAB.textSec}>Progress</Plex>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.12em', whiteSpace: 'nowrap' }}>
            NO SPECIMEN YET
          </Mono>
          <Pill tone="blue" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Up Next</Pill>
        </div>
      </div>
      <div>
        <CIMarker style={{ display: 'block', fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-.01em', whiteSpace: 'nowrap', color: LAB.text }}>
          Check-Ins
        </CIMarker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Mono size={11} color={LAB.textSec} weight={500}>Apr 26, 2026</Mono>
          <span style={{ width: 3, height: 3, background: LAB.textTer, borderRadius: '50%' }}/>
          <Mono size={11} color={LAB.textSec} weight={500}>Between weeks</Mono>
        </div>
      </div>
    </div>
  );
}

// Replace empty screen header
const _ScreenEmptyOriginal = ScreenEmpty;
function ScreenEmptyV2() {
  return (
    <div style={{ background: LAB.bg, height: '100%', position: 'relative', overflowY: 'auto' }}>
      <DetailHeaderForEmpty/>

      {/* Next check-in countdown card */}
      <div style={{ padding: '16px 16px 8px' }}>
        <SectionH kicker="3.1 / Next check-in" title="Scheduled run"/>
        <Card withBarcode={11} padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Pill tone="blue" style={{ marginBottom: 8 }}>Scheduled</Pill>
              <Plex size={17} weight={600} style={{ display: 'block', lineHeight: 1.2, letterSpacing: '-.01em' }}>
                Sunday, Apr 27
              </Plex>
              <Mono size={11} color={LAB.textSec} weight={500} style={{ display: 'block', marginTop: 4 }}>
                8:00 AM · auto-run
              </Mono>
            </div>
            <div style={{
              border: `1px solid ${LAB.border}`, borderRadius: 6,
              padding: '6px 10px', background: LAB.surfaceAlt,
              textAlign: 'center', minWidth: 84,
            }}>
              <Mono size={9} color={LAB.textTer} weight={600} style={{ letterSpacing: '.10em', textTransform: 'uppercase', display: 'block' }}>
                In
              </Mono>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginTop: 2 }}>
                <CIReenie style={{ fontSize: 26, fontWeight: 700, color: LAB.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>1</CIReenie>
                <Mono size={11} color={LAB.textSec} weight={500}>day</Mono>
              </div>
              <Mono size={9} color={LAB.textTer} weight={500} style={{ display: 'block', marginTop: 3 }}>
                14h 22m
              </Mono>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Mono size={9} color={LAB.textTer} weight={500} style={{ letterSpacing: '.10em', textTransform: 'uppercase' }}>
                Week so far
              </Mono>
              <Mono size={9} color={LAB.textSec} weight={600}>6 / 7 days</Mono>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 1,
                  background: i < 6 ? LAB.blue : LAB.borderFaint,
                }}/>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: `1px dashed ${LAB.borderFaint}`,
          }}>
            <Mono size={9} color={LAB.textTer} weight={600} style={{ display: 'block', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 8 }}>
              How the engine thinks
            </Mono>
            <EngineFlowDiagram/>
          </div>
        </Card>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <SectionH
          kicker="3.2 / Past check-ins"
          title="History"
          right={<Mono size={10} color={LAB.textTer} weight={500}>3 ENTRIES</Mono>}
        />
      </div>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PastCheckInRow date="Apr 12 – Apr 18" wk={5} recs={1} applied={1} dismissed={0} status="green" summary="Bench e1RM tracking ahead — kept volume."/>
        <PastCheckInRow date="Apr 5 – Apr 11"  wk={4} recs={2} applied={1} dismissed={1} status="yellow" summary="Sleep flagged. +1 deload session offered."/>
        <PastCheckInRow date="Mar 29 – Apr 4"  wk={3} recs={0} applied={0} dismissed={0} status="green" summary="All metrics within ±1σ of plan."/>
      </div>

      <div style={{ padding: '0 16px 90px' }}>
        <button style={{
          width: '100%', padding: '10px 14px',
          background: LAB.surface, border: `1px solid ${LAB.border}`, borderRadius: 6,
          fontFamily: LAB.fontBody,
          fontSize: 12, fontWeight: 500, color: LAB.textSec, cursor: 'pointer',
        }}>
          View all 6 check-ins →
        </button>
      </div>

      <LabBottomNav active="progress"/>
    </div>
  );
}

// Expose to global so it can be referenced from the HTML root script
Object.assign(window, {
  ScreenPendingCard,
  ScreenCheckInDetail,
  ScreenEmptyV2,
  LAB,
});
