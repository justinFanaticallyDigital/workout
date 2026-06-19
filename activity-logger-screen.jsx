// activity-logger-screen.jsx
// 2.13 — Activity loggers (HIIT / Cardio / Class / Custom)  ·  /log/[type]
// 2.12 — Stretch Timer                                       ·  /training/stretch
//
// 2.13 is ONE templated form. The frame is constant — duration hero, an effort
// scale, a calorie estimate, notes, save — and only the middle "metrics" card
// swaps its field set per type. Duration is the universal metric, so it leads.
//
// 2.12 is a self-contained full-screen guided timer: a ring countdown for the
// current move, the move queue, transport controls; running / paused / done.
//
// Both read tokens from useFitTrackTheme via `T`. Reuses Card / Button / Chip /
// Stamp / Header (tier-homes-screens.jsx), Stepper / Segmented / TextField /
// FieldLabel (small-sheets.jsx), TLTypeGlyph / RailGlyph. Locals are AL-prefixed.

const { useState, useEffect, useRef } = React;

// ════════════════════════════════════════════════════════════════════════
// 2.13 — ACTIVITY LOGGER (one template, field set swaps per type)

// type → { label, glyph, leadMeta, met (for kcal est), fields(state,set) }
const AL_TYPES = {
  hiit: {
    label: 'HIIT', glyph: 'hiit', tone: 'core', met: 9.5,
    sub: 'Interval session',
    seed: { rounds: 8, intensity: 'hard' },
    fields: (s, set, T) => ([
      { label: 'Rounds', control: <Stepper T={T} value={s.rounds} step={1} min={1} onChange={(v) => set('rounds', v)}/> },
      { label: 'Work / rest', control: <ALStaticPair T={T} a="40s" b="20s"/> },
      { label: 'Intensity', full: true, control: <Segmented T={T} value={s.intensity} onChange={(v) => set('intensity', v)}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'mod', label: 'Moderate' }, { value: 'hard', label: 'Hard' }, { value: 'max', label: 'Max' }]}/> },
    ]),
  },
  liss: {
    label: 'Cardio', glyph: 'liss', tone: 'push', met: 7.0,
    sub: 'Steady-state',
    seed: { mode: 'run', distance: 5.0, hr: 138 },
    fields: (s, set, T) => ([
      { label: 'Type', full: true, control: <Segmented T={T} value={s.mode} onChange={(v) => set('mode', v)}
          options={[{ value: 'run', label: 'Run' }, { value: 'bike', label: 'Bike' }, { value: 'row', label: 'Row' }, { value: 'walk', label: 'Walk' }]}/> },
      { label: 'Distance', control: <Stepper T={T} value={s.distance} step={0.1} min={0} onChange={(v) => set('distance', Math.round(v * 10) / 10)} fmt={(v) => `${v.toFixed(1)} km`}/> },
      { label: 'Avg heart rate', control: <Stepper T={T} value={s.hr} step={1} min={40} onChange={(v) => set('hr', v)} fmt={(v) => `${v} bpm`}/> },
    ]),
  },
  class: {
    label: 'Class', glyph: 'class', tone: 'pull', met: 6.0,
    sub: 'Group session',
    seed: { name: 'Vinyasa Flow', studio: 'CorePower · Downtown', intensity: 'mod' },
    fields: (s, set, T) => ([
      { label: 'Class', full: true, control: <TextField T={T} value={s.name} onChange={(v) => set('name', v)}/> },
      { label: 'Studio', full: true, control: <TextField T={T} value={s.studio} onChange={(v) => set('studio', v)}/> },
      { label: 'Intensity', full: true, control: <Segmented T={T} value={s.intensity} onChange={(v) => set('intensity', v)}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'mod', label: 'Moderate' }, { value: 'hard', label: 'Hard' }]}/> },
    ]),
  },
  custom: {
    label: 'Custom', glyph: 'custom', tone: 'legs', met: 5.0,
    sub: 'Anything else',
    seed: { name: 'Rock climbing', effort: 'hard' },
    fields: (s, set, T) => ([
      { label: 'Activity', full: true, control: <TextField T={T} value={s.name} onChange={(v) => set('name', v)}/> },
      { label: 'Effort', full: true, control: <Segmented T={T} value={s.effort} onChange={(v) => set('effort', v)}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'mod', label: 'Moderate' }, { value: 'hard', label: 'Hard' }, { value: 'max', label: 'Max' }]}/> },
    ]),
  },
};

function ALStaticPair({ T, a, b }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
      background: T.surfaceAlt, padding: '7px 12px',
      fontFamily: T.fontNumber, fontSize: 14, fontWeight: 700, color: T.text,
    }}>
      <span>{a}</span>
      <span style={{ color: T.textTer, fontFamily: T.fontBody, fontSize: 11 }}>work</span>
      <span style={{ color: T.borderStrong }}>/</span>
      <span>{b}</span>
      <span style={{ color: T.textTer, fontFamily: T.fontBody, fontSize: 11 }}>rest</span>
    </div>
  );
}

function ALFieldRow({ T, label, control, full }) {
  if (full) {
    return (
      <div style={{ padding: '12px 0' }}>
        <FieldLabel T={T}>{label}</FieldLabel>
        {control}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0' }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{label}</span>
      {control}
    </div>
  );
}

function fmtClock(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Duration hero — a working stopwatch. Default paused at a representative time.
function ALDurationHero({ T, tone, startRunning = false, seedSec = 1820 }) {
  const [sec, setSec] = useState(seedSec);
  const [running, setRunning] = useState(startRunning);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const toneColor = T[tone] || T.accent;
  return (
    <Card T={T} raised style={{ padding: '18px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stamp T={T}>Duration</Stamp>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: running ? toneColor : T.textTer }}/>
          <span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {running ? 'Running' : 'Paused'}
          </span>
        </span>
      </div>
      <div style={{
        fontFamily: T.fontNumber, fontSize: 52, fontWeight: 700, color: T.text,
        letterSpacing: '.01em', lineHeight: 1.05, margin: '8px 0 4px',
        fontVariantNumeric: 'tabular-nums',
      }}>{fmtClock(sec)}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Button T={T} kind={running ? 'secondary' : 'primary'} size="lg" style={{ flex: 1 }}
          onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </Button>
        <Button T={T} kind="secondary" size="lg" style={{ flexShrink: 0 }} onClick={() => { setRunning(false); setSec(0); }}>
          Reset
        </Button>
      </div>
    </Card>
  );
}

function ActivityLogger({ T, type = 'hiit', running = false }) {
  const cfg = AL_TYPES[type] || AL_TYPES.hiit;
  const [s, setS] = useState(cfg.seed);
  const [effort, setEffort] = useState('mod');
  const [kcalAuto, setKcalAuto] = useState(true);
  const [kcal, setKcal] = useState(Math.round(cfg.met * 78 * (30 / 60))); // ~30 min @78kg
  const set = (k, v) => setS((prev) => ({ ...prev, [k]: v }));
  const toneColor = T[cfg.tone] || T.accent;
  const rows = cfg.fields(s, set, T);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title={cfg.label} subtitle={cfg.sub}/>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '4px 16px 92px' }}>
        <ALDurationHero T={T} tone={cfg.tone} startRunning={running}/>

        {/* swappable metrics */}
        <div style={{ marginTop: 12 }}>
          <Card T={T} style={{ padding: '4px 14px 6px' }}>
            {rows.map((r, i) => (
              <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}` }}>
                <ALFieldRow T={T} {...r}/>
              </div>
            ))}
          </Card>
        </div>

        {/* universal effort */}
        <div style={{ marginTop: 14 }}>
          <FieldLabel T={T} onBg right="How it felt">Effort</FieldLabel>
          <Segmented T={T} value={effort} onChange={setEffort}
            options={[{ value: 'easy', label: 'Easy' }, { value: 'mod', label: 'Moderate' }, { value: 'hard', label: 'Hard' }, { value: 'max', label: 'Max' }]}/>
        </div>

        {/* calories — auto estimate w/ manual override */}
        <div style={{ marginTop: 14 }}>
          <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>Calories</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>
                {kcalAuto ? 'Estimated from duration + effort' : 'Manual'}
              </div>
            </div>
            {kcalAuto ? (
              <button onClick={() => setKcalAuto(false)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6,
              }}>
                <span style={{ fontFamily: T.fontNumber, fontSize: 18, fontWeight: 700, color: T.text }}>{kcal}</span>
                <span style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, color: T.accent, textDecoration: 'underline' }}>Edit</span>
              </button>
            ) : (
              <Stepper T={T} value={kcal} step={10} min={0} onChange={setKcal} fmt={(v) => `${v} kcal`}/>
            )}
          </Card>
        </div>

        {/* notes */}
        <div style={{ marginTop: 14 }}>
          <FieldLabel T={T} onBg>Notes</FieldLabel>
          <ALNotes T={T}/>
        </div>
      </div>

      {/* footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px 16px', background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`, display: 'flex', gap: 8,
      }}>
        <Button T={T} kind="ghost" size="lg" style={{ flexShrink: 0 }}>Discard</Button>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Save activity →</Button>
      </div>
    </div>
  );
}

function ALNotes({ T }) {
  const [v, setV] = useState('');
  return (
    <textarea value={v} onChange={(e) => setV(e.target.value)} placeholder="Optional"
      style={{
        width: '100%', boxSizing: 'border-box', minHeight: 64, resize: 'none',
        padding: '11px 13px', background: T.surfaceAlt, color: T.text,
        border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
        fontFamily: T.fontBody, fontSize: 13.5, outline: 'none', lineHeight: 1.4,
      }}/>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2.12 — STRETCH TIMER (full-screen guided flow)

const AL_STRETCH = [
  { name: 'Cat–Cow',           sec: 30 },
  { name: 'World’s Greatest', sec: 45 },
  { name: 'Hip Flexor · L',  sec: 30 },
  { name: 'Hip Flexor · R',  sec: 30 },
  { name: 'Thoracic Rotation', sec: 40 },
  { name: 'Hamstring · L',   sec: 30 },
  { name: 'Hamstring · R',   sec: 30 },
  { name: 'Pigeon',            sec: 45 },
  { name: 'Child’s Pose',    sec: 60 },
];

function ALRing({ T, progress, label, size = 208 }) {
  const r = (size - 18) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - progress);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surfaceAlt} strokeWidth={9}/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.accent} strokeWidth={9}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      <div className="ft-on-bg" style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 56, fontWeight: 700, color: T.textOnBg || T.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{label}</span>
        <span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textOnBgTer || T.textTer, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 6 }}>Hold</span>
      </div>
    </div>
  );
}

function ALTransport({ T, glyph, big, onClick, label }) {
  const sz = big ? 66 : 50;
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: sz, height: sz, borderRadius: 999, cursor: 'pointer',
      background: big ? T.accent : T.surface,
      color: big ? T.textOnAccent : T.text,
      border: big ? 'none' : `1px solid ${T.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: big ? T.shadowMd : T.shadowSm,
    }}>{glyph}</button>
  );
}

function StretchTimer({ T, mode = 'running' }) {
  const total = AL_STRETCH.length;
  const idx = mode === 'complete' ? total : 2; // on 3rd move (3/9)
  const move = AL_STRETCH[Math.min(idx, total - 1)];
  const next = AL_STRETCH[idx + 1];
  const [remaining, setRemaining] = useState(18);
  const [running, setRunning] = useState(mode === 'running');
  useEffect(() => {
    if (!running || mode === 'complete') return;
    const id = setInterval(() => setRemaining((x) => (x <= 1 ? move.sec : x - 1)), 1000);
    return () => clearInterval(id);
  }, [running, mode, move.sec]);

  if (mode === 'complete') {
    const totalSec = AL_STRETCH.reduce((a, m) => a + m.sec, 0);
    return (
      <div style={{ position: 'absolute', inset: 0, background: T.bg, display: 'flex', flexDirection: 'column' }}>
        <ALStretchTop T={T} title="Mobility Flow" right=""/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', gap: 4 }}>
          <div style={{
            width: 92, height: 92, borderRadius: 999, background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
          }}>
            <RailGlyph name="model" size={40} color={T.accent} strokeWidth={2}/>
          </div>
          <div className="ft-on-bg" style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em' }}>Flow complete</div>
          <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 13, color: T.textOnBgSec || T.textSec, letterSpacing: '.04em', marginTop: 2 }}>
            {total} moves · {fmtClock(totalSec)}
          </div>
        </div>
        <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>Done</Button>
          <Button T={T} kind="secondary" size="lg" style={{ width: '100%' }}>Repeat flow</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <ALStretchTop T={T} title="Mobility Flow" right={`${idx + 1} / ${total}`}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <ALRing T={T} progress={remaining / move.sec} label={`0:${String(remaining).padStart(2, '0')}`}/>
        <div style={{ textAlign: 'center' }}>
          <div className="ft-on-bg" style={{ fontFamily: T.fontDisplay, fontSize: 25, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em' }}>{move.name}</div>
          {next && (
            <div className="ft-on-bg" style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgTer || T.textTer, marginTop: 5 }}>
              Next · {next.name}
            </div>
          )}
        </div>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: 6, padding: '0 24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 300 }}>
          {AL_STRETCH.map((m, i) => (
            <span key={i} style={{
              width: i === idx ? 22 : 8, height: 8, borderRadius: 999,
              background: i < idx ? T.accent : i === idx ? T.accent : T.surfaceAlt,
              opacity: i < idx ? 0.5 : 1,
              border: i === idx ? 'none' : `1px solid ${T.borderFaint || T.border}`,
              transition: 'width .2s',
            }}/>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <ALTransport T={T} glyph={<RailGlyph name="chevL" size={22} color={T.text} strokeWidth={2}/>} label="Previous"/>
        <ALTransport T={T} big onClick={() => setRunning((r) => !r)} label="Play / pause"
          glyph={running
            ? <span style={{ display: 'inline-flex', gap: 4 }}><span style={{ width: 5, height: 22, background: 'currentColor', borderRadius: 1 }}/><span style={{ width: 5, height: 22, background: 'currentColor', borderRadius: 1 }}/></span>
            : <span style={{ width: 0, height: 0, borderLeft: '18px solid currentColor', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }}/>}/>
        <ALTransport T={T} glyph={<RailGlyph name="chevR" size={22} color={T.text} strokeWidth={2}/>} label="Skip"/>
      </div>
    </div>
  );
}

function ALStretchTop({ T, title, right }) {
  return (
    <div className="ft-on-bg" style={{
      padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button aria-label="Close" style={{
        width: 34, height: 34, borderRadius: 999, background: 'transparent',
        border: `1px solid ${T.borderFaint || T.border}`, color: T.textOnBg || T.text,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>✕</button>
      <span style={{ fontFamily: T.fontData, fontSize: 12, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '.08em', textTransform: 'uppercase' }}>{title}</span>
      <span style={{ minWidth: 34, textAlign: 'right', fontFamily: T.fontNumber, fontSize: 14, fontWeight: 700, color: T.textOnBgSec || T.textSec }}>{right}</span>
    </div>
  );
}

Object.assign(window, { ActivityLogger, StretchTimer, AL_TYPES, AL_STRETCH });
