// history-detail-screen.jsx
// 2.14 — Single Workout Library  ·  /log/library
// 2.6  — Workout History Detail  ·  /history/[id]
//
// 2.14 is the browse-and-pick surface for running a one-off workout now: a
// search + category filter over saved frames and built-in templates. It's the
// browse variant of the Saved-frames grid in 2.1 / launch row in 2.2.
//
// 2.6 replays a past session read-only — logged sets vs target, set by set,
// with PRs flagged — and carries Repeat (seeds a 2.4 session) + Save as frame.
// It reads the real mock session from logger-data.jsx (window.SESSION).
//
// Reuses Card / Button / Chip / Stamp / Header (tier-homes-screens.jsx),
// TLTypeGlyph / RailGlyph, CATEGORY_COLOR / loggerStats (logger-data.jsx).
// Locals are HD-prefixed.

const { useState, useMemo } = React;

// ════════════════════════════════════════════════════════════════════════
// 2.14 — SINGLE WORKOUT LIBRARY

const HD_WORKOUTS = [
  { name: 'Push Day A',    cat: 'push',     glyph: 'lift',    lifts: 'Bench · OHP · Incline · Lateral · Triceps', dur: 52, equip: 'Barbell',     used: 9,  kind: 'frame' },
  { name: 'Pull Day A',    cat: 'pull',     glyph: 'lift',    lifts: 'Pulldown · Row · Face pull · Curl', dur: 48, equip: 'Cable + DB',  used: 7,  kind: 'frame' },
  { name: 'Lower Heavy',   cat: 'legs',     glyph: 'lift',    lifts: 'Squat · RDL · Leg press · Calf', dur: 58, equip: 'Barbell',     used: 6,  kind: 'frame' },
  { name: 'Quick HIIT',    cat: 'hiit',     glyph: 'hiit',    lifts: '6 rounds · 40s / 20s', dur: 22, equip: 'Bodyweight',  used: 4,  kind: 'frame' },
  { name: 'Mobility Flow', cat: 'mobility', glyph: 'stretch', lifts: '9 movements', dur: 18, equip: 'None',        used: 11, kind: 'frame' },
  { name: 'DB Only Full',  cat: 'full',     glyph: 'lift',    lifts: '6 lifts · full body', dur: 44, equip: 'Dumbbells',   used: 3,  kind: 'frame' },
  { name: 'Full Body Starter', cat: 'full', glyph: 'lift',    lifts: 'Squat · Bench · Row · Curl', dur: 45, equip: 'Barbell',     kind: 'template' },
  { name: '5×5 Upper',    cat: 'push', glyph: 'lift',    lifts: 'Bench · OHP · Row', dur: 40, equip: 'Barbell',     kind: 'template' },
];

const HD_FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'push',     label: 'Push' },
  { id: 'pull',     label: 'Pull' },
  { id: 'legs',     label: 'Legs' },
  { id: 'full',     label: 'Full body' },
  { id: 'hiit',     label: 'HIIT' },
  { id: 'mobility', label: 'Mobility' },
];

function HDFilterChip({ T, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '7px 13px', cursor: 'pointer', whiteSpace: 'nowrap',
      borderRadius: 999,
      background: active ? T.accent : T.surface,
      color: active ? T.textOnAccent : T.textSec,
      border: `1px solid ${active ? T.accent : T.border}`,
      fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, letterSpacing: '.01em',
    }}>{label}</button>
  );
}

function HDSearch({ T, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px',
      background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
    }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth={2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search workouts" style={{
        flex: 1, padding: '11px 0', background: 'transparent', border: 'none', outline: 'none',
        color: T.text, fontFamily: T.fontBody, fontSize: 14,
      }}/>
    </div>
  );
}

function HDWorkoutRow({ T, w }) {
  const tone = { push: T.push, pull: T.pull, legs: T.legs, full: T.core, hiit: T.core, mobility: T.pull }[w.cat] || T.accent;
  return (
    <Card T={T} onClick={() => {}} style={{
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <span style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: T.radiusMd || 8,
        background: T.surfaceAlt, color: tone,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${T.borderFaint || T.border}`,
      }}>
        <TLTypeGlyph kind={w.glyph} size={20} color={tone}/>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 14.5, fontWeight: 700, color: T.text, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</span>
          {w.kind === 'template' && <Chip T={T} tone="neutral" size="sm">Template</Chip>}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.lifts}</div>
        <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.05em', textTransform: 'uppercase', marginTop: 4 }}>
          {w.dur} min · {w.equip}{w.used ? ` · used ${w.used}×` : ''}
        </div>
      </div>
      <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent, whiteSpace: 'nowrap', flexShrink: 0 }}>Start →</span>
    </Card>
  );
}

function SingleWorkoutLibrary({ T, initialQ = '' }) {
  const [q, setQ] = useState(initialQ);
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => HD_WORKOUTS.filter((w) => {
    const okFilter = filter === 'all' || w.cat === filter;
    const okQ = !q.trim() || w.name.toLowerCase().includes(q.trim().toLowerCase());
    return okFilter && okQ;
  }), [q, filter]);

  const frames = list.filter((w) => w.kind === 'frame');
  const templates = list.filter((w) => w.kind === 'template');

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Pick a workout" subtitle="Run once"/>
      {/* search */}
      <div style={{ padding: '4px 16px 10px' }}>
        <HDSearch T={T} value={q} onChange={setQ}/>
      </div>
      {/* filters */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {HD_FILTERS.map((f) => (
          <HDFilterChip key={f.id} T={T} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)}/>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '0 16px 88px' }}>
        {list.length === 0 ? (
          <HDNoResults T={T} q={q}/>
        ) : (
          <>
            {frames.length > 0 && (
              <>
                <HDListLabel T={T} right={`${frames.length}`}>Saved frames</HDListLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {frames.map((w) => <HDWorkoutRow key={w.name} T={T} w={w}/>)}
                </div>
              </>
            )}
            {templates.length > 0 && (
              <>
                <HDListLabel T={T} right={`${templates.length}`}>Templates</HDListLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {templates.map((w) => <HDWorkoutRow key={w.name} T={T} w={w}/>)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HDListLabel({ T, children, right }) {
  return (
    <div className="ft-on-bg" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 2px 8px' }}>
      <span style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec || T.textSec, letterSpacing: '.1em', textTransform: 'uppercase' }}>{children}</span>
      {right && <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer }}>{right}</span>}
    </div>
  );
}

function HDNoResults({ T, q }) {
  return (
    <div className="ft-on-bg" style={{ padding: '48px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
      <div style={{
        width: 72, height: 72, borderRadius: T.radiusLg || 8,
        background: T.surfaceAlt, border: `1px dashed ${T.border}`, color: T.textTer,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth={1.7} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </div>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.textOnBg || T.text }}>No workouts match</div>
      <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgTer || T.textTer, lineHeight: 1.45, maxWidth: 250 }}>
        Nothing named “{q}” in your frames or templates. Start a freestyle session instead.
      </div>
      <Button T={T} kind="primary" size="md">Start freestyle →</Button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2.6 — WORKOUT HISTORY DETAIL  (read-only session replay from window.SESSION)

function HDStat({ T, label, value, unit }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 3 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 21, fontWeight: 700, color: T.text, letterSpacing: '.01em' }}>{value}</span>
        {unit && <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer }}>{unit}</span>}
      </div>
    </div>
  );
}

function HDSetChip({ T, set, isPR }) {
  const bw = set.w === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
      padding: '5px 9px', borderRadius: T.radiusSm || 4,
      background: isPR ? T.accentFaint : T.surfaceAlt,
      border: `1px solid ${isPR ? T.accentBorder : T.borderFaint || T.border}`,
      fontFamily: T.fontNumber, fontSize: 12.5, fontWeight: 700, color: T.text, letterSpacing: '.01em',
    }}>
      {isPR && <span style={{ color: T.accent, fontSize: 11 }}>★</span>}
      <span>{bw ? 'BW' : set.w}{bw ? '' : <span style={{ fontWeight: 400, fontSize: 10, color: T.textTer }}>lb</span>}</span>
      <span style={{ color: T.borderStrong }}>×</span>
      <span>{set.r}</span>
      <span style={{ fontWeight: 400, fontSize: 9.5, color: T.textTer, marginLeft: 1 }}>@{set.rpe}</span>
    </span>
  );
}

function HDLaneBlock({ T, lane, session }) {
  const wi = session.currentWeekIdx;
  const tone = { push: T.push, pull: T.pull, legs: T.legs, core: T.core }[CATEGORY_COLOR[lane.category]] || T.accent;
  const sets = lane.sets[wi] || [];
  const w3 = lane.sets[wi - 1] || [];
  const topThis = Math.max(...sets.map((s) => s.w || 0), 0);
  const topPrev = Math.max(...w3.map((s) => s.w || 0), 0);
  const isPRLane = topThis > topPrev && topThis > 0;
  const note = (lane.notes && lane.notes['w' + (wi + 1)]) || null;

  return (
    <Card T={T} style={{ padding: '13px 14px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: tone, flexShrink: 0, marginTop: 4 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 14.5, fontWeight: 700, color: T.text, lineHeight: 1.2, letterSpacing: '-.01em' }}>{lane.variant}</div>
          <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.04em', marginTop: 3 }}>
            Target {lane.targetSets}×{lane.targetReps} @ RPE {lane.rpeTarget}
          </div>
        </div>
        {isPRLane && <Chip T={T} tone="accent" size="sm">PR</Chip>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
        {sets.map((s, i) => (
          <HDSetChip key={i} T={T} set={s} isPR={isPRLane && (s.w || 0) === topThis}/>
        ))}
      </div>
      {note && (
        <div style={{
          marginTop: 11, paddingTop: 10, borderTop: `1px solid ${T.borderFaint}`,
          fontFamily: T.fontBody, fontSize: 12, color: T.textSec, fontStyle: 'italic', lineHeight: 1.4,
        }}>“{note}”</div>
      )}
    </Card>
  );
}

function WorkoutHistoryDetail({ T }) {
  const s = window.SESSION;
  const stats = loggerStats(s);
  const prCount = s.lanes.filter((l) => {
    const wi = s.currentWeekIdx;
    const tThis = Math.max(...(l.sets[wi] || []).map((x) => x.w || 0), 0);
    const tPrev = Math.max(...(l.sets[wi - 1] || []).map((x) => x.w || 0), 0);
    return tThis > tPrev && tThis > 0;
  }).length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Upper · Push" subtitle="Feb 24 · logged"/>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '4px 16px 92px' }}>
        {/* summary */}
        <Card T={T} raised style={{ padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Stamp T={T}>Session summary</Stamp>
            <Chip T={T} tone="success" size="sm">Logged</Chip>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <HDStat T={T} label="Duration" value="52" unit="min"/>
            <HDStat T={T} label="Volume" value={(stats.volume / 1000).toFixed(1)} unit="k lb"/>
            <HDStat T={T} label="Sets" value={stats.done}/>
            <HDStat T={T} label="PRs" value={prCount}/>
          </div>
        </Card>

        {/* per-exercise replay */}
        <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec || T.textSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '18px 2px 9px' }}>
          {s.lanes.length} exercises
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.lanes.map((lane) => <HDLaneBlock key={lane.id} T={T} lane={lane} session={s}/>)}
        </div>
      </div>

      {/* footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px 16px', background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`, display: 'flex', gap: 8,
      }}>
        <Button T={T} kind="secondary" size="lg" style={{ flexShrink: 0 }}>Save as frame</Button>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Repeat workout →</Button>
      </div>
    </div>
  );
}

Object.assign(window, { SingleWorkoutLibrary, WorkoutHistoryDetail, HD_WORKOUTS });
