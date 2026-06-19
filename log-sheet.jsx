// log-sheet.jsx
// 2.11 — +Log Bottom Sheet · the universal capture sheet.
//
// Rises from the center "+" in the bottom nav (present on every tab). A grid of
// activity tiles, grouped Train / Track. Each tile routes to its logger:
//   Lift → 2.4 · HIIT / Cardio / Class / Custom → 2.13 · Stretch → 2.12 · Meal → 2.8
// For a Logger the Lifestyle tile is LOCKED — dimmed, lock dot, one factual
// line. Per CLAUDE.md it is never a gate, just a tier marker.
//
// Reuses Sheet / SheetStage (small-sheets.jsx), Card / Chip / Stamp
// (tier-homes-screens.jsx), and TLTypeGlyph (training-logger-screen.jsx).
// Locals are LS-prefixed.

// Extra glyphs the workout set (TLTypeGlyph) doesn't cover: meal + lifestyle.
function LSGlyph({ kind, size = 22, color = 'currentColor' }) {
  if (kind === 'meal') {
    const s = { width: size, height: size, stroke: color, strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    return (
      <svg {...s} viewBox="0 0 24 24"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M12 11V3"/><path d="M8 11c0-3 1-5 4-5"/></svg>
    );
  }
  if (kind === 'lifestyle') {
    const s = { width: size, height: size, stroke: color, strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    return (
      <svg {...s} viewBox="0 0 24 24"><path d="M20.5 14.2A8 8 0 1 1 9.8 3.5a6.3 6.3 0 0 0 10.7 10.7z"/></svg>
    );
  }
  return <TLTypeGlyph kind={kind} size={size} color={color}/>;
}

function LSLockBadge({ T }) {
  return (
    <span style={{
      position: 'absolute', top: 9, right: 9,
      width: 18, height: 18, borderRadius: 999,
      background: T.surfaceAlt, color: T.textTer,
      border: `1px solid ${T.borderFaint || T.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <RailGlyph name="lock" size={10} color={T.textTer} strokeWidth={2.2}/>
    </span>
  );
}

function LSTile({ T, kind, label, meta, locked = false, onClick }) {
  const fg = locked ? T.textTer : T.accent;
  return (
    <Card T={T} onClick={locked ? undefined : onClick} style={{
      padding: '14px 12px 13px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
      cursor: locked ? 'default' : 'pointer',
      opacity: locked ? 0.6 : 1,
      position: 'relative',
    }}>
      {locked && <LSLockBadge T={T}/>}
      <span style={{
        width: 40, height: 40, borderRadius: T.radiusMd || 8,
        background: locked ? T.surfaceAlt : T.accentFaint, color: fg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LSGlyph kind={kind} size={22} color={fg}/>
      </span>
      <div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.1,
        }}>{label}</div>
        <div style={{
          fontFamily: T.fontData, fontSize: 10, color: T.textTer,
          letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 3,
        }}>{meta}</div>
      </div>
    </Card>
  );
}

function LSGroupLabel({ T, children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      margin: '4px 0 9px',
    }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textSec,
        letterSpacing: '.1em', textTransform: 'uppercase',
      }}>{children}</span>
      {right && <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer }}>{right}</span>}
    </div>
  );
}

function LogSheet({ T, tier = 'logger' }) {
  const isLogger = tier === 'logger';
  const trainTypes = [
    { kind: 'lift',    label: 'Lift',    meta: 'Weights'   },
    { kind: 'hiit',    label: 'HIIT',    meta: 'Intervals' },
    { kind: 'liss',    label: 'Cardio',  meta: 'Steady'    },
    { kind: 'class',   label: 'Class',   meta: 'Group'     },
    { kind: 'stretch', label: 'Stretch', meta: 'Mobility'  },
    { kind: 'custom',  label: 'Custom',  meta: 'Blank'     },
  ];

  return (
    <Sheet T={T} title="Log activity" sub="Pick what you did — opens its logger.">
      <LSGroupLabel T={T} right="6 types">Train</LSGroupLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {trainTypes.map((t) => <LSTile key={t.kind} T={T} {...t} onClick={() => {}}/>)}
      </div>

      <div style={{ height: 1, background: T.borderFaint || T.border, margin: '18px 0 14px' }}/>

      <LSGroupLabel T={T}>Track</LSGroupLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LSTile T={T} kind="meal" label="Meal" meta="Food + macros" onClick={() => {}}/>
        <LSTile T={T} kind="lifestyle" label="Lifestyle"
          meta={isLogger ? 'Gameplan' : 'Sleep · mood'} locked={isLogger}/>
      </div>
      {isLogger && (
        <div style={{
          marginTop: 10, fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer,
          lineHeight: 1.45,
        }}>
          Lifestyle logging — sleep, energy, soreness — unlocks with Gameplan.
        </div>
      )}

      <div style={{ height: 6 }}/>
    </Sheet>
  );
}

Object.assign(window, { LogSheet, LSTile, LSGlyph });
