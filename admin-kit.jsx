// admin-kit.jsx
// Cluster 7 — Admin · shared primitives
//
// Role-gated authoring tools. Reached only from Settings → Admin. Functional,
// dense, data-first — tables and forms, not marketing surfaces. Reuses the
// shared kit (Card, Button, Chip, Stamp, ErrorBanner) already on window from
// tier-homes-screens.jsx, plus the theme tokens via the T prop.
//
// Every screen sits on the page bg below the status bar; chrome rendered
// directly on the bg uses the on-bg tokens (textOnBg*, accentOnBg*) + the
// .ft-on-bg class so Blueprint (light page / dark cards) stays legible.

const { useState: useAdminState } = React;

// ── Back affordance ─────────────────────────────────────────────────────
function AdminBack({ T, onClick }) {
  const onBg = T.textOnBg || T.text;
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, flexShrink: 0, borderRadius: 999,
      background: 'transparent', border: `1px solid ${T.borderFaint || T.border}`,
      color: onBg, fontFamily: T.fontBody, fontSize: 17, lineHeight: 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>‹</button>
  );
}

// ── Top bar — back · title/eyebrow · optional right action ────────────────
// The eyebrow carries the "ADMIN" role context so every authoring screen
// reads as gated without a heavy banner.
function AdminTopBar({ T, title, eyebrow = 'ADMIN', back = true, onBack, right }) {
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;
  const accentOnBg = T.accentOnBg || T.accent;
  return (
    <div className="ft-on-bg" style={{
      padding: '10px 16px 12px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {back && <AdminBack T={T} onClick={onBack}/>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && (
          <div style={{
            fontFamily: T.fontData, fontSize: 9.5, fontWeight: 700,
            color: accentOnBg, letterSpacing: '.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: accentOnBg }}/>
            {eyebrow}
          </div>
        )}
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700,
          color: onBg, letterSpacing: '-.01em', lineHeight: 1.15,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// ── Screen wrapper ────────────────────────────────────────────────────────
function AdminScreen({ T, title, eyebrow, back = true, onBack, right, children, footer, pad = 28 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: footer ? 92 : pad }}>
      <AdminTopBar T={T} title={title} eyebrow={eyebrow} back={back} onBack={onBack} right={right}/>
      {children}
      {footer && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 16px 16px', background: T.surface,
          borderTop: `1px solid ${T.borderFaint}`,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>{footer}</div>
      )}
    </div>
  );
}

// ── Section label on the page bg ──────────────────────────────────────────
function AdminLabel({ T, children, right }) {
  return (
    <div className="ft-on-bg" style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '16px 16px 7px', gap: 10,
    }}>
      <div style={{
        fontFamily: T.fontData, fontSize: 10, fontWeight: 700,
        color: T.textOnBg || T.text, letterSpacing: '.12em', textTransform: 'uppercase',
      }}>{children}</div>
      {right != null && (
        <span style={{
          fontFamily: T.fontData, fontSize: 10, color: T.textOnBgTer || T.textTer,
          letterSpacing: '.04em', whiteSpace: 'nowrap',
        }}>{right}</span>
      )}
    </div>
  );
}

// ── Pill button row (secondary actions on the bg) ─────────────────────────
function AdminGhostBtn({ T, glyph, children, onClick, tone }) {
  const accentOnBg = T.accentOnBg || T.accent;
  const fg = tone === 'accent' ? accentOnBg : (T.textOnBgSec || T.textSec);
  return (
    <button onClick={onClick} className="ft-on-bg" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: T.radiusMd || 6,
      background: 'transparent',
      border: `1px solid ${tone === 'accent' ? (T.accentBorderOnBg || T.accentBorder) : (T.borderFaint || T.border)}`,
      color: fg, fontFamily: T.fontBody, fontSize: 12, fontWeight: 700,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {glyph && <span style={{ fontSize: 13, lineHeight: 1 }}>{glyph}</span>}
      {children}
    </button>
  );
}

// ── Status badge — Live · Staging · Draft · Archived ──────────────────────
function StatusBadge({ T, status, size = 'md' }) {
  const map = {
    live:     { tone: 'success', label: 'Live' },
    staging:  { tone: 'warn',    label: 'Staging' },
    draft:    { tone: 'neutral', label: 'Draft' },
    archived: { tone: 'neutral', label: 'Archived' },
    error:    { tone: 'danger',  label: 'Error' },
    review:   { tone: 'accent',  label: 'In review' },
  }[status] || { tone: 'neutral', label: status };
  return <Chip T={T} tone={map.tone} size={size}>{map.label}</Chip>;
}

// ── Tabs — segmented control for Library/Upload sub-views ─────────────────
function AdminTabs({ T, items, active, onChange }) {
  return (
    <div style={{ padding: '2px 16px 0' }}>
      <div style={{
        display: 'flex', gap: 4, padding: 4,
        background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`,
        borderRadius: T.radiusMd || 8,
      }}>
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onChange && onChange(it.id)} style={{
              flex: 1, padding: '8px 6px', cursor: 'pointer',
              background: on ? T.surface : 'transparent',
              border: `1px solid ${on ? T.border : 'transparent'}`,
              borderRadius: (T.radiusSm != null ? T.radiusSm : 4),
              boxShadow: on ? T.shadowSm : 'none',
              fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700,
              color: on ? T.text : T.textTer,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {it.label}
              {it.count != null && (
                <span style={{
                  fontFamily: T.fontData, fontSize: 10, fontWeight: 700,
                  color: on ? T.accent : T.textTer,
                  background: on ? T.accentFaint : 'transparent',
                  padding: on ? '1px 5px' : 0, borderRadius: 999,
                }}>{it.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Search field ──────────────────────────────────────────────────────────
function AdminSearch({ T, placeholder = 'Search…', value, trailing }) {
  return (
    <div style={{ padding: '12px 16px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '9px 12px', background: T.surface,
        border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
      }}>
        <span style={{ fontSize: 14, color: T.textTer, lineHeight: 1 }}>⌕</span>
        <span style={{
          flex: 1, fontFamily: T.fontBody, fontSize: 13,
          color: value ? T.text : T.textTer,
        }}>{value || placeholder}</span>
        {trailing}
      </div>
    </div>
  );
}

// ── Library item row — title · meta · version · status ────────────────────
function ItemRow({ T, glyph, title, meta, version, status, selected, onClick }) {
  return (
    <Card T={T} onClick={onClick} style={{
      padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 12,
      cursor: onClick ? 'pointer' : 'default',
      borderColor: selected ? T.accent : undefined,
    }}>
      {glyph && (
        <span style={{
          width: 38, height: 38, flexShrink: 0, borderRadius: T.radiusMd || 6,
          background: T.surfaceAlt, color: T.textSec, border: `1px solid ${T.borderFaint}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700,
        }}>{glyph}</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text,
          lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        <div style={{
          fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 3,
          letterSpacing: '.02em', display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {meta}
          {version && <span style={{ color: T.textTer }}>· {version}</span>}
        </div>
      </div>
      {status && <StatusBadge T={T} status={status} size="sm"/>}
    </Card>
  );
}

// ── Stat tile — value + label, used in dashboard & analytics ──────────────
function StatTile({ T, value, unit, label, delta, tone = 'neutral' }) {
  const accentColor = tone === 'accent' ? T.accent : T.text;
  return (
    <Card T={T} style={{ padding: '13px 14px 14px' }}>
      <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 27, fontWeight: 700, color: accentColor, lineHeight: 1, letterSpacing: '-.01em' }}>{value}</span>
        {unit && <span style={{ fontFamily: T.fontData, fontSize: 12, color: T.textTer }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{ marginTop: 7, fontFamily: T.fontData, fontSize: 10.5, color: delta.dir === 'up' ? T.success : delta.dir === 'down' ? T.danger : T.textTer, letterSpacing: '.02em' }}>
          {delta.dir === 'up' ? '▲' : delta.dir === 'down' ? '▼' : '·'} {delta.text}
        </div>
      )}
    </Card>
  );
}

// ── Dropzone — file intake ────────────────────────────────────────────────
function Dropzone({ T, glyph = '⤒', title, sub, formats }) {
  return (
    <div style={{ padding: '4px 16px 0' }}>
      <div style={{
        padding: '28px 20px', borderRadius: T.radiusLg || 8,
        border: `1.5px dashed ${T.border}`, background: T.surfaceAlt,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8,
      }}>
        <span style={{
          width: 48, height: 48, borderRadius: 999,
          background: T.accentFaint, color: T.accent, border: `1px solid ${T.accentBorder}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700,
        }}>{glyph}</span>
        <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{title}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, lineHeight: 1.4, maxWidth: 240 }}>{sub}</div>}
        <div style={{ marginTop: 6 }}>
          <Button T={T} kind="primary" size="md">Choose file</Button>
        </div>
        {formats && (
          <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.06em', marginTop: 2 }}>{formats}</div>
        )}
      </div>
    </div>
  );
}

// ── Form field — read-only display styled as an input ─────────────────────
function Field({ T, label, value, placeholder, hint, multiline, suffix, tone }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{
        padding: multiline ? '10px 12px' : '10px 12px',
        minHeight: multiline ? 64 : 'auto',
        background: T.surface, border: `1px solid ${tone === 'accent' ? T.accentBorder : T.border}`,
        borderRadius: T.radiusMd || 6,
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <span style={{
          fontFamily: T.fontBody, fontSize: 13, lineHeight: multiline ? 1.45 : 1.2,
          color: value ? T.text : T.textTer,
        }}>{value || placeholder}</span>
        {suffix && <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, flexShrink: 0 }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, lineHeight: 1.35 }}>{hint}</div>}
    </div>
  );
}

// ── Toggle (visual) ───────────────────────────────────────────────────────
function AdminToggle({ T, on }) {
  return (
    <span style={{
      width: 42, height: 25, flexShrink: 0, borderRadius: 999,
      background: on ? T.accent : T.surfaceAlt,
      border: `1px solid ${on ? T.accent : T.border}`, position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2,
        width: 19, height: 19, borderRadius: 999,
        background: on ? T.textOnAccent : T.surface,
        boxShadow: '0 1px 3px rgba(0,0,0,.3)',
      }}/>
    </span>
  );
}

// ── Grouped card of rows (hairline dividers) ──────────────────────────────
function AdminGroup({ T, children, style }) {
  const items = React.Children.toArray(children);
  return (
    <div style={{ padding: '0 16px', ...style }}>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {items.map((c, i) => (
          <div key={i} style={{ borderTop: i ? `1px solid ${T.borderFaint}` : 'none' }}>{c}</div>
        ))}
      </Card>
    </div>
  );
}

// One row inside an AdminGroup. value = mono right text, right = node.
function GRow({ T, label, sub, value, right, glyph, tone, chevron, mono = true, onClick }) {
  const tileMap = {
    accent: { bg: T.accentFaint, fg: T.accent, br: T.accentBorder },
    success: { bg: T.successBg, fg: T.success, br: T.successBorder },
    warn: { bg: T.warnBg, fg: T.warn, br: T.warnBorder },
    danger: { bg: T.dangerBg, fg: T.danger, br: T.dangerBorder },
    neutral: { bg: T.surfaceAlt, fg: T.textSec, br: T.borderFaint },
  };
  const c = tileMap[tone] || tileMap.neutral;
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: onClick ? 'pointer' : 'default' }}>
      {glyph && (
        <span style={{
          width: 28, height: 28, flexShrink: 0, borderRadius: T.radiusMd || 6,
          background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700,
        }}>{glyph}</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {value != null && (
        <span style={{ fontFamily: mono ? T.fontData : T.fontBody, fontSize: 11.5, color: T.textSec, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '.02em' }}>{value}</span>
      )}
      {right != null && right}
      {chevron && right == null && value == null && (
        <span style={{ fontFamily: T.fontBody, fontSize: 17, color: T.textTer, flexShrink: 0, lineHeight: 1 }}>›</span>
      )}
    </div>
  );
}

// ── Step progress (upload flow) ───────────────────────────────────────────
function StepDots({ T, total, step }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '0 16px 4px' }}>
      {[...Array(total)].map((_, i) => (
        <span key={i} style={{
          flex: 1, height: 3, borderRadius: 999,
          background: i < step ? T.accent : T.surfaceAlt,
        }}/>
      ))}
    </div>
  );
}

// ── Horizontal bar (analytics) ────────────────────────────────────────────
function BarRow({ T, label, value, max, sub, color }) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textSec, flexShrink: 0 }}>{sub}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: color || T.accent }}/>
      </div>
    </div>
  );
}

// ── Column-bar mini chart (analytics trend) ───────────────────────────────
function ColumnChart({ T, data, height = 96 }) {
  const max = Math.max(...data.map((d) => d.v)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', height: `${Math.max(4, (d.v / max) * 100)}%`,
            background: d.hi ? T.accent : T.textTer, opacity: d.hi ? 1 : 0.6,
            borderRadius: (T.radiusSm != null ? T.radiusSm : 2),
          }}/>
          <span style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.02em' }}>{d.k}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  AdminBack, AdminTopBar, AdminScreen, AdminLabel, AdminGhostBtn,
  StatusBadge, AdminTabs, AdminSearch, ItemRow, StatTile, Dropzone,
  Field, AdminToggle, AdminGroup, GRow, StepDots, BarRow, ColumnChart,
});
