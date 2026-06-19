// ─────────────────────────────────────────────────────────────────────────
// cluster-scaffold.jsx
// Shared scaffolding for the per-cluster canvas files. The point of a cluster
// file is to be the COMPLETE inventory of that cluster's screens — designed
// screens render for real; not-yet-designed screens render as <ToDesign/>, an
// intentional, theme-aware placeholder that carries the screen's spec (id,
// name, route, status, note) so the gap is legible instead of missing.
//
// Loads AFTER phone-shell.jsx + theme-bridge.jsx. SELF-CONTAINED — it draws
// its own header bar, card, and chip from theme tokens (no tier-homes
// dependency), so any cluster file can use it regardless of which screen
// modules it loads. The placeholder body sits on a surface card, and the
// header uses on-bg tokens, so the Blueprint contrast trap never applies.
// ─────────────────────────────────────────────────────────────────────────

const FT_STATUS_TONE = {
  queued:     { tone: 'warn',    label: 'Queued · to design' },
  skeleton:   { tone: 'accent',  label: 'Skeleton · layout only' },
  explored:   { tone: 'accent',  label: 'Explored · elsewhere' },
  partial:    { tone: 'accent',  label: 'Partial · split needed' },
  blocked:    { tone: 'danger',  label: 'Blocked' },
  middleware: { tone: 'neutral', label: 'Middleware · no UI' },
  locked:     { tone: 'neutral', label: 'In product' },
};

// Status values that describe a screen-slot with no UI to design (vs. a gap).
const FT_NO_UI_STATUS = { middleware: true, locked: true };

// Faint construction-grid backdrop — reads as "drafting surface", theme-aware.
function ToDesignGrid({ T }) {
  const line = T.borderFaint || T.border;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: '22px 22px',
      maskImage: 'radial-gradient(circle at 50% 42%, #000 35%, transparent 78%)',
      WebkitMaskImage: 'radial-gradient(circle at 50% 42%, #000 35%, transparent 78%)',
    }}/>
  );
}

// Self-contained chip — tone palette mirrors the shared Chip primitive but
// reads straight from theme tokens so there's no module dependency.
function ToDesignChip({ T, tone = 'neutral', children }) {
  const map = {
    neutral: { fg: T.textSec, bg: T.surfaceAlt, br: T.borderFaint || T.border },
    accent:  { fg: T.accent, bg: T.accentFaint, br: T.accentBorder },
    warn:    { fg: T.warnFg, bg: T.warnBg, br: T.warnBorder },
    danger:  { fg: T.dangerFg, bg: T.dangerBg, br: T.dangerBorder },
  };
  const c = map[tone] || map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px',
      borderRadius: 999, background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
      fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
      letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// A full-screen placeholder for an undesigned screen. Renders inside ThemedPhone.
//   id     — screen id, e.g. "2.3"
//   name   — screen name, e.g. "Exercise Detail"
//   route  — route string, e.g. "/exercises/[id]"
//   status — one of FT_STATUS_TONE keys (default 'queued')
//   note   — short spec note (what this screen is / where its pieces live)
//   step   — optional build-plan step label, e.g. "Step 10"
function ToDesign({ T, id, name, route, status = 'queued', note, step }) {
  const st = FT_STATUS_TONE[status] || FT_STATUS_TONE.queued;
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: T.bg }}>
      {/* header bar — on the page bg, uses on-bg tokens (Blueprint-safe) */}
      <div className="ft-on-bg" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px' }}>
        <span style={{
          width: 30, height: 30, borderRadius: 999, flexShrink: 0,
          border: `1px solid ${T.borderFaint || T.border}`, color: onBg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        }}>‹</span>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 600, color: onBg, letterSpacing: '-.01em' }}>{name}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 22px' }}>
        <ToDesignGrid T={T}/>
        <div style={{
          position: 'relative', width: '100%', padding: '26px 22px 24px',
          background: T.surface, border: `1.5px dashed ${T.border}`, borderRadius: T.radiusLg || 10,
          boxShadow: T.shadowSm, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
        }}>
          <div style={{
            fontFamily: T.fontData, fontSize: 46, fontWeight: 700, lineHeight: 1,
            letterSpacing: '.02em', color: T.accent,
          }}>{id}</div>

          <ToDesignChip T={T} tone={st.tone}>{st.label}</ToDesignChip>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontFamily: T.fontDisplay || T.fontBody, fontSize: 21, fontWeight: 700, color: T.text, letterSpacing: '.005em' }}>{name}</div>
            <div style={{ fontFamily: T.fontData, fontSize: 12, color: T.textTer, letterSpacing: '.04em' }}>{route}</div>
          </div>

          {note && (
            <div style={{
              fontFamily: T.fontBody, fontSize: 12.5, lineHeight: 1.5, color: T.textSec,
              maxWidth: 280, textWrap: 'pretty',
            }}>{note}</div>
          )}

          <div style={{ width: 40, height: 1, background: T.border, margin: '2px 0' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: T.fontData, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: T.stampFg, fontWeight: 600 }}>
              {FT_NO_UI_STATUS[status] ? 'No screen · auto-routes' : 'Not yet designed'}
            </span>
            {step && (
              <>
                <span style={{ color: T.borderStrong || T.border }}>·</span>
                <span style={{ fontFamily: T.fontData, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: T.textTer, fontWeight: 600 }}>{step}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ToDesign, ToDesignGrid, ToDesignChip });
