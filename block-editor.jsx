// block-editor.jsx
// 3.7 — BLOCK / DAY DETAIL EDITOR · /blocks/[id]
//
// Block-duration + schedule editing lives in Planning Mode (3.5). This is the
// missing piece: the day-level exercise editor. Per the L1 edit contract
// (CLAUDE.md / pillar L1), structural edits never commit inline — they stage in
// a sandbox (diff → confirm → undo). So the editor carries a sticky PLANNING
// stamp and a pending-diff Apply footer, exactly like 3.5.
//
// Views:
//   block — block overview, the days in this block, drill into one
//   day   — the day exercise editor (reorder · sets/reps/load steppers ·
//           remove · add/swap), with a live pending-changes footer
//   add   — the add/swap-exercise sheet over the day editor
//
// Reuses Header, Card, Button, Chip, Stamp, SectionLabel, Stepper, Sheet,
// SheetStage. Locals BE-prefixed. Stepper is wide (~138px), so set/rep/load
// fields stack as label-left / stepper-right ROWS — three side-by-side
// overflow a 410 phone.

const { useState: useBE } = React;

// ── sticky planning stamp (sandbox signal) ──────────────────────────────────
function BEPlanningBar({ T }) {
  return (
    <div className="ft-on-bg" style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px',
      background: T.accentFaintOnBg, borderBottom: `1px solid ${T.accentBorderOnBg}`,
    }}>
      <span style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.accentOnBg }}>◇</span>
      <span style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: T.accentOnBg, letterSpacing: '.14em', textTransform: 'uppercase' }}>Planning Mode · Sandbox</span>
      <span style={{ marginLeft: 'auto', fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgSec }}>Not live until applied</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// VIEW · BLOCK OVERVIEW

const BE_DAYS = [
  { d: 'Mon', type: 'Upper · Push',   lifts: 5, state: 'done' },
  { d: 'Tue', type: 'Lower · Heavy',  lifts: 5, state: 'done' },
  { d: 'Wed', type: 'Upper · Pull',   lifts: 6, state: 'current' },
  { d: 'Thu', type: 'Rest',           lifts: 0, state: 'rest' },
  { d: 'Fri', type: 'Lower · Volume', lifts: 5, state: 'upcoming' },
  { d: 'Sat', type: 'Conditioning',   lifts: 3, state: 'upcoming' },
  { d: 'Sun', type: 'Rest',           lifts: 0, state: 'rest' },
];

function BlockOverview({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Hypertrophy block" subtitle="Block 2 of 4"/>
      <BEPlanningBar T={T}/>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
        <div style={{ padding: '12px 16px 0' }}>
          <Card T={T} style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <Stamp T={T}>Duration</Stamp>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 3 }}>4 weeks · 4 days / wk</div>
            </div>
            <Button T={T} kind="secondary" size="sm">Edit schedule</Button>
          </Card>
        </div>
        <SectionLabel T={T} right="tap a day">Days in this block</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BE_DAYS.map((d, i) => {
            const rest = d.state === 'rest';
            return (
              <Card T={T} key={i} style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                background: d.state === 'current' ? T.accentFaint : T.surface,
                opacity: rest ? .6 : 1,
              }}>
                <span style={{
                  width: 38, height: 38, borderRadius: T.radiusMd || 8, flexShrink: 0,
                  background: rest ? T.surfaceAlt : T.accentFaint, color: rest ? T.textTer : T.accent,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.fontData, fontSize: 11, fontWeight: 700, letterSpacing: '.03em',
                }}>{d.d}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{d.type}</div>
                  <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>
                    {rest ? 'No session' : `${d.lifts} exercises`}
                  </div>
                </div>
                {!rest && <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent }}>Edit ›</span>}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// VIEW · DAY EDITOR

const BE_EXERCISES = [
  { name: 'Bench Press',      sets: 4, reps: 5,  load: 185, changed: false },
  { name: 'Overhead Press',   sets: 3, reps: 8,  load: 95,  changed: false },
  { name: 'Incline DB Press', sets: 3, reps: 10, load: 60,  changed: true  },
  { name: 'Lateral Raise',    sets: 3, reps: 12, load: 20,  changed: false },
];

function BEFieldRow({ T, label, value, step, unit, last, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${T.borderFaint}`,
    }}>
      <span style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
      <Stepper T={T} value={value} step={step} min={step} onChange={onChange} fmt={(v) => unit ? `${v}${unit}` : `${v}`}/>
    </div>
  );
}

function BEExerciseCard({ T, ex, expanded, onToggle, onField }) {
  return (
    <Card T={T} style={{ padding: '12px 13px', borderColor: ex.changed ? T.accentBorder : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onToggle}>
        <span style={{ fontFamily: T.fontBody, fontSize: 18, color: T.textTer, cursor: 'grab', lineHeight: 1 }}>⠿</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 700, color: T.text }}>{ex.name}</span>
            {ex.changed && <Chip T={T} tone="accent" size="sm">Edited</Chip>}
          </div>
          <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>
            {ex.sets} × {ex.reps} · {ex.load} lb
          </div>
        </div>
        <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textTer, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 4 }}>
          <BEFieldRow T={T} label="Sets" value={ex.sets} step={1} onChange={(v) => onField('sets', v)}/>
          <BEFieldRow T={T} label="Reps" value={ex.reps} step={1} onChange={(v) => onField('reps', v)}/>
          <BEFieldRow T={T} label="Load" value={ex.load} step={5} unit=" lb" last onChange={(v) => onField('load', v)}/>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <Button T={T} kind="ghost" size="sm" style={{ flex: 1 }}>Swap</Button>
            <Button T={T} kind="ghost" size="sm" style={{ flex: 1, color: T.danger }}>Remove</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function DayEditor({ T, onAdd }) {
  const [list, setList] = useBE(BE_EXERCISES);
  const [open, setOpen] = useBE(2); // the pre-edited row starts expanded
  const setField = (i, k, v) => setList((L) => L.map((e, idx) => idx === i ? { ...e, [k]: v, changed: true } : e));
  const changedCount = list.filter((e) => e.changed).length;
  const showFooter = changedCount > 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Wed · Upper · Pull" subtitle="Day editor"/>
      <BEPlanningBar T={T}/>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: showFooter ? 92 : 24 }}>
        <SectionLabel T={T} right={`${list.length} exercises`}>Exercises</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {list.map((ex, i) => (
            <BEExerciseCard key={ex.name} T={T} ex={ex} expanded={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)} onField={(k, v) => setField(i, k, v)}/>
          ))}
          <button onClick={onAdd} className="ft-on-bg" style={{
            width: '100%', padding: 13, marginTop: 2, cursor: 'pointer',
            background: 'transparent', border: `1.5px dashed ${T.borderStrong}`, borderRadius: T.radiusLg || 10,
            fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.accentOnBg,
          }}>+ Add exercise</button>
        </div>
      </div>

      {showFooter && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '11px 16px 16px', background: T.surface, borderTop: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.text }}>{changedCount} change{changedCount > 1 ? 's' : ''} pending</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>Sandbox · not yet applied</div>
          </div>
          <Button T={T} kind="ghost" size="md">Discard</Button>
          <Button T={T} kind="primary" size="md">Apply →</Button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// VIEW · ADD / SWAP EXERCISE SHEET

const BE_LIBRARY = [
  { name: 'Dumbbell Row',  group: 'Back',      equip: 'Dumbbells' },
  { name: 'Lat Pulldown',  group: 'Back',      equip: 'Cable' },
  { name: 'Barbell Row',   group: 'Back',      equip: 'Barbell' },
  { name: 'Face Pull',     group: 'Rear delt', equip: 'Cable' },
  { name: 'Hammer Curl',   group: 'Biceps',    equip: 'Dumbbells' },
  { name: 'Chin-up',       group: 'Back',      equip: 'Bodyweight' },
];

function AddExerciseSheet({ T }) {
  const [q, setQ] = useBE('');
  const results = BE_LIBRARY.filter((f) => !q.trim() || f.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Sheet T={T} title="Add exercise" sub="Pull focus · library">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', marginBottom: 12, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exercises" style={{ flex: 1, padding: '11px 0', background: 'transparent', border: 'none', outline: 'none', color: T.text, fontFamily: T.fontBody, fontSize: 14 }}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((f) => (
          <Card T={T} key={f.name} style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{f.name}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>{f.group} · {f.equip}</div>
            </div>
            <span style={{
              width: 28, height: 28, borderRadius: 999, flexShrink: 0,
              background: T.accentFaint, color: T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, lineHeight: 1,
            }}>+</span>
          </Card>
        ))}
      </div>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════════
// assembled — view router

function BlockDayEditor({ T, view = 'day' }) {
  if (view === 'block') return <BlockOverview T={T}/>;
  if (view === 'add') {
    return (
      <SheetStage T={T} behind={<DayEditor T={T}/>}>
        <AddExerciseSheet T={T}/>
      </SheetStage>
    );
  }
  return <DayEditor T={T}/>;
}

Object.assign(window, {
  BEPlanningBar, BlockOverview, BEFieldRow, BEExerciseCard, DayEditor, AddExerciseSheet, BlockDayEditor,
});
