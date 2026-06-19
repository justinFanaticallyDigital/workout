// training-program.jsx
// 3.2 — TRAINING TAB (Program) · /training (bottom-nav slot 2)
//
// Promotes the archived neutral Three-Pillar R2 study (Today / This-Block /
// Program layers, built on NB tokens) into the THEMED tier-homes vocabulary —
// exactly as logger-pillars.jsx did for the Logger nutrition/lifestyle tabs.
//
// Obeys the pillar layout contract (CLAUDE.md):
//   Header → [PillarRail | scroll content] → BottomNav (host navSlot)
// with TWO modes: Rail (single labelled column) and Chip (sticky bar, no rail).
//
// Rail slots for a Program tier are Today / Block / Program / Gameplan — the
// first three unlocked, Gameplan dimmed + locked (the next-tier upsell). The
// active layer is chosen by `activeKey` (today | block | model | gameplan).
//
// The rail/chip is a SURFACE, so inside it the normal card tokens apply
// (Blueprint-safe). Chrome drawn on the page bg uses the on-bg tokens via the
// shared Header / SectionLabel primitives.
//
// Reuses: Header, Card, Button, Chip, Stamp, SectionLabel, ErrorBanner,
//   PillarRail, PillarRailChip, railItemsForTier. Locals are TP-prefixed.

const { useState: useTP } = React;

// ── shared pillar shell ────────────────────────────────────────────────────
// Thin wrapper over the canonical PillarShell (pillar-rail.jsx). Keeps the
// Program clusters' call sites unchanged while routing the actual layout
// through the one shared shell, so it can't drift from logger/gameplan.
function ProgramPillarShell({ T, pillar, tier = 'program', activeKey, items, railMode = 'rail', onSetRailMode, title, subtitle, error, children }) {
  return (
    <PillarShell
      T={T} pillar={pillar} tier={tier} activeKey={activeKey} items={items}
      railMode={railMode} onSetRailMode={onSetRailMode}
      header={<Header T={T} kind="home" title={title} subtitle={subtitle}/>}>
      {error && <div style={{ paddingTop: 12 }}><ErrorBanner T={T} {...error}/></div>}
      {children}
    </PillarShell>
  );
}

// ── small themed bits shared across layers ──────────────────────────────────
function TPStatTile({ T, label, value, unit, sub }) {
  return (
    <Card T={T} style={{ padding: '12px 13px' }}>
      <Stamp T={T}>{label}</Stamp>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 5 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer }}>{unit}</span>}
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

// Per-item shuffle/lock controls — themed port of ShuffleLockItem.
function TPShuffleLock({ T, locked }) {
  const base = {
    width: 26, height: 26, borderRadius: T.radiusSm || 5,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
  };
  const Ico = ({ d, c }) => (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  );
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
      <button title="Lock" style={{ ...base, background: locked ? T.accent : T.surface, border: `1px solid ${locked ? T.accent : T.border}` }}>
        <Ico c={locked ? T.textOnAccent : T.textTer} d={<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>}/>
      </button>
      <button title="Re-roll this" style={{ ...base, background: T.surface, border: `1px solid ${T.border}` }}>
        <Ico c={T.textTer} d={<><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></>}/>
      </button>
      <button title="Swap from library" style={{ ...base, background: T.surface, border: `1px solid ${T.border}` }}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill={T.textTer}><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
      </button>
    </div>
  );
}

function TPShuffleHeader({ T, locked, total }) {
  return (
    <Card T={T} style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Button T={T} kind="primary" size="md" style={{ flex: 1 }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.textOnAccent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
        Re-roll the rest
      </Button>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px',
        background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusMd || 8,
        fontFamily: T.fontNumber, fontSize: 12, fontWeight: 700, color: T.textSec,
      }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth={1.9}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
        {locked}<span style={{ color: T.textTer }}>/{total}</span>
      </span>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · TODAY — the day's scheduled session (the launchpad)

const TP_TODAY_LIFTS = [
  { name: 'Bench Press',      sets: '4 × 5',  load: '185 lb' },
  { name: 'Overhead Press',   sets: '3 × 8',  load: '95 lb'  },
  { name: 'Incline DB Press', sets: '3 × 10', load: '60 lb'  },
  { name: 'Lateral Raise',    sets: '3 × 12', load: '20 lb'  },
  { name: 'Tricep Pushdown',  sets: '3 × 12', load: '50 lb'  },
];

function TrainingTodayLayer({ T }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      {/* Hero */}
      <Card T={T} raised style={{ padding: '15px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Stamp T={T}>Wednesday · Day 12 of 40</Stamp>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 21, fontWeight: 700, color: T.text, marginTop: 4, letterSpacing: '-.01em', lineHeight: 1.1 }}>Upper · Push focus</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 4 }}>5 exercises · ~52 min · last done 4d ago</div>
          </div>
          <Chip T={T} tone="accent" size="sm">Block 2/4</Chip>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>Start workout →</Button>
        </div>
      </Card>

      <SectionLabel T={T} right="5 lifts">Plan</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {TP_TODAY_LIFTS.map((e, i) => (
          <div key={e.name} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: T.radiusSm || 4, flexShrink: 0,
              background: T.surfaceAlt, color: T.textTer,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontNumber, fontSize: 11, fontWeight: 700,
            }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>{e.name}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>{e.sets} · {e.load}</div>
            </div>
            <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
          </div>
        ))}
      </Card>

      <SectionLabel T={T}>This week</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TPStatTile T={T} label="Volume" value="42" unit="k lb" sub="+8% vs last wk"/>
        <TPStatTile T={T} label="Streak" value="11" unit="days" sub="3 sessions / wk avg"/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · THIS BLOCK — week strip + shuffle/lock day list

const TP_WEEK = [
  { short: 'M', type: 'Upper', state: 'done',     date: '07' },
  { short: 'T', type: 'Lower', state: 'done',     date: '08' },
  { short: 'W', type: 'Upper', state: 'current',  date: '09' },
  { short: 'T', type: 'Off',   state: 'upcoming', date: '10' },
  { short: 'F', type: 'Lower', state: 'upcoming', date: '11' },
  { short: 'S', type: 'Cond.', state: 'upcoming', date: '12' },
  { short: 'S', type: 'Off',   state: 'upcoming', date: '13' },
];

const TP_BLOCK_LIFTS = [
  { name: 'Bench Press',      meta: '4 × 5 · 185 lb',  locked: true  },
  { name: 'Overhead Press',   meta: '3 × 8 · 95 lb',   locked: false },
  { name: 'Incline DB Press', meta: '3 × 10 · 60 lb',  locked: false },
  { name: 'Lateral Raise',    meta: '3 × 12 · 20 lb',  locked: false },
  { name: 'Tricep Pushdown',  meta: '3 × 12 · 50 lb',  locked: true  },
];

function TrainingBlockLayer({ T }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      {/* Block phase header */}
      <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <Stamp T={T}>Block 2 · Hypertrophy</Stamp>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 3, letterSpacing: '-.01em' }}>Week 2 of 4</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} style={{ width: 22, height: 6, borderRadius: 999, background: n <= 2 ? T.accent : T.surfaceAlt }}/>
          ))}
        </div>
      </Card>

      <SectionLabel T={T} right="3 of 20 pinned">Shuffle &amp; lock</SectionLabel>
      <TPShuffleHeader T={T} locked={3} total={20}/>

      <SectionLabel T={T} right="Tap a day">Week strip</SectionLabel>
      <div style={{ display: 'flex', gap: 5 }}>
        {TP_WEEK.map((d, i) => {
          const cur = d.state === 'current';
          const done = d.state === 'done';
          const off = d.type === 'Off';
          return (
            <div key={i} style={{
              flex: 1, borderRadius: T.radiusSm || 4, padding: '7px 0 8px', textAlign: 'center',
              background: cur ? T.accent : done ? T.accentFaint : T.surface,
              border: off ? `1px dashed ${T.border}` : `1px solid ${cur ? T.accent : T.borderFaint}`,
              color: cur ? T.textOnAccent : off ? T.textTer : T.text,
              opacity: done ? .7 : 1, position: 'relative',
            }}>
              <div style={{ fontFamily: T.fontData, fontSize: 9, fontWeight: 700, opacity: .8 }}>{d.short}</div>
              <div style={{ fontFamily: T.fontNumber, fontSize: 13, fontWeight: 700, marginTop: 1 }}>{d.date}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 8.5, fontWeight: 600, marginTop: 2 }}>{d.type}</div>
            </div>
          );
        })}
      </div>

      <SectionLabel T={T} right="5 lifts">Wed · Upper</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {TP_BLOCK_LIFTS.map((e, i) => (
          <div key={e.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>{e.name}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>{e.meta}</div>
            </div>
            <TPShuffleLock T={T} locked={e.locked}/>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · PROGRAM (Model) — active template, read-only, edits → Planning Mode

const TP_BLOCKS = [
  { n: 1, name: 'Accumulation',    wk: '3 wk', rpe: 'RPE 6–7',   state: 'done' },
  { n: 2, name: 'Hypertrophy',     wk: '4 wk', rpe: 'RPE 7–8',   state: 'current' },
  { n: 3, name: 'Intensification', wk: '3 wk', rpe: 'RPE 8–9',   state: 'upcoming' },
  { n: 4, name: 'Peak',            wk: '2 wk', rpe: 'RPE 9–10',  state: 'upcoming' },
];

const TP_SPLIT = [
  { d: 'M', t: 'Upper', on: true },
  { d: 'T', t: 'Lower', on: true },
  { d: 'W', t: 'Off',   on: false },
  { d: 'T', t: 'Upper', on: true },
  { d: 'F', t: 'Lower', on: true },
  { d: 'S', t: 'Cond.', on: 'cond' },
  { d: 'S', t: 'Off',   on: false },
];

function TrainingProgramLayer({ T }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      {/* Active template */}
      <Card T={T} raised style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: T.accent }}/>
        <div style={{ paddingLeft: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Stamp T={T}>Active template</Stamp>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 3, letterSpacing: '-.01em', lineHeight: 1.15 }}>Size &amp; Strength · 12 wk</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 3 }}>4 blocks · upper/lower split · 4 sessions / wk</div>
          </div>
          <Chip T={T} tone="neutral" size="sm">Wk 5/12</Chip>
        </div>
      </Card>

      <SectionLabel T={T} right="4 blocks">Block progression</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {TP_BLOCKS.map((b, i) => (
          <div key={b.n} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
            background: b.state === 'current' ? T.accentFaint : 'transparent',
            opacity: b.state === 'done' ? .6 : 1,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999, flexShrink: 0,
              background: b.state === 'current' ? T.accent : T.surfaceAlt,
              color: b.state === 'current' ? T.textOnAccent : T.textTer,
              border: b.state === 'done' ? `1.5px solid ${T.success}` : 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontNumber, fontSize: 11, fontWeight: 700,
            }}>{b.state === 'done' ? '✓' : b.n}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: b.state === 'current' ? 700 : 600, color: T.text }}>{b.name}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>{b.wk} · {b.rpe}</div>
            </div>
          </div>
        ))}
      </Card>

      <SectionLabel T={T} right="day shape">Weekly split</SectionLabel>
      <Card T={T} style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {TP_SPLIT.map((d, i) => {
          const fill = d.on === true ? T.accent : d.on === 'cond' ? T.accentFaint : T.surfaceAlt;
          const fg = d.on === true ? T.textOnAccent : d.on === 'cond' ? T.accent : T.textTer;
          return (
            <div key={i} style={{
              background: fill, color: fg, borderRadius: T.radiusSm || 4, padding: '6px 0', textAlign: 'center',
              border: d.on === false ? `1px dashed ${T.border}` : 'none',
            }}>
              <div style={{ fontFamily: T.fontData, fontSize: 9, fontWeight: 700, opacity: .8 }}>{d.d}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 9.5, fontWeight: 700, marginTop: 2 }}>{d.t}</div>
            </div>
          );
        })}
      </Card>

      {/* Planning Mode entry — dashed, signals sandbox not direct CRUD */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: T.surface, border: `1px dashed ${T.borderStrong}`, borderRadius: T.radiusLg || 10,
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: T.radiusMd || 8, flexShrink: 0,
            background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700,
          }}>◇</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Edit program · Planning Mode</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>Sandbox · diff · confirm · undo</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </div>
        <Card T={T} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.textSec }}>Browse program templates</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · GAMEPLAN (locked) — next-tier upsell, never a gate

function TPGameplanLocked({ T }) {
  return (
    <div>
      {/* faded preview of the would-be surface */}
      <div style={{ padding: '8px 16px 0', opacity: .45, pointerEvents: 'none' }}>
        <Card T={T} style={{ padding: '14px 16px' }}>
          <Stamp T={T}>Goal pulse · projected</Stamp>
          <svg viewBox="0 0 280 84" style={{ width: '100%', height: 84, marginTop: 8, display: 'block' }}>
            <path d="M6 70 Q90 30 150 40 T274 16" stroke={T.accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M6 70 Q90 30 150 40 T274 16 L274 84 L6 84 Z" fill={T.accentFaint}/>
          </svg>
        </Card>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <Card T={T} raised style={{ padding: 16, borderColor: T.accentBorder }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stamp T={T}>Gameplan tier</Stamp>
            <Chip T={T} tone="neutral" size="sm">Locked</Chip>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 6, letterSpacing: '-.01em' }}>Adaptive training</div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['Weekly check-in tunes your volume + loads', 'Goal-pulse trajectory vs target', 'Recommendation feed, accept or dismiss'].map((f) => (
              <div key={f} style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, display: 'flex', gap: 8 }}>
                <span style={{ color: T.accent, marginTop: 1 }}>·</span><span>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Button T={T} kind="primary" size="md" style={{ flex: 1 }}>See Gameplan →</Button>
            <Button T={T} kind="secondary" size="md" style={{ flexShrink: 0 }}>Compare</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3.2 — assembled tab

function TrainingProgramTab({ T, activeKey = 'today', railMode = 'rail', onSetRailMode, state = 'default' }) {
  const error = state === 'error'
    ? { title: 'Program failed to load', body: "This week's plan didn't sync. Saved progress is safe.", action: 'Retry' }
    : null;
  const layer =
    activeKey === 'block'    ? <TrainingBlockLayer T={T}/>   :
    activeKey === 'model'    ? <TrainingProgramLayer T={T}/> :
    activeKey === 'gameplan' ? <TPGameplanLocked T={T}/>     :
                               <TrainingTodayLayer T={T}/>;
  return (
    <ProgramPillarShell T={T} pillar="training" activeKey={activeKey} railMode={railMode}
      onSetRailMode={onSetRailMode} title="Training" subtitle="Program" error={error}>
      {layer}
    </ProgramPillarShell>
  );
}

Object.assign(window, {
  ProgramPillarShell, TPStatTile, TPShuffleLock, TPShuffleHeader,
  TrainingTodayLayer, TrainingBlockLayer, TrainingProgramLayer, TPGameplanLocked,
  TrainingProgramTab,
});
