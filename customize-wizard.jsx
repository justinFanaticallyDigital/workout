// customize-wizard.jsx
// FitTrack · 5.4 — Customize Wizard  (route: /shelf/[type]/[slug]/customize)
//
// The opt-in "Customize first" path off the Card Detail / Compare sticky CTA.
// Most users tap "Start now" and only pick a start date at checkout; this is
// the deeper 6-step flow for users who want control before they buy.
//
//   1 Start date · 2 Current state · 3 Schedule · 4 Personalize · 5 Review · 6 Confirm → checkout
//
// One component, branched internally by `flow`:
//   gameplan → Training + Nutrition + Lifestyle + Goals · subscription
//   program  → Training only · one-time license (leaner step 4 + review)
//
// Copy rules (CLAUDE.md): labels are nouns, buttons are verbs, no marketing
// prose, hints only when functional, data over sentences, one idea per line.
//
// Renders through any of the 7 themes via theme-bridge. Host passes
// theme / flow / showDraft / showWarnings and remounts on change.

const { useState: useCWState } = React;

// ── Plan fixtures ───────────────────────────────────────────────────────────
const CW_PLANS = {
  gameplan: {
    flow: 'gameplan',
    name: '100 lb Bench in 12 Weeks',
    sub: 'Gameplan · Intermediate',
    weeks: 12,
    daysAllowed: [3, 4, 5],
    daysDefault: 4,
    scope: 'Training + Nutrition',
    price: 19, billing: 'mo',
    split: ['Bench', 'Pull', '', 'Lower', 'Press', '', ''],
    patternDefault: [1, 1, 0, 1, 1, 0, 0],
    goal: { label: 'Bench press · 1RM', current: 80, target: 100, unit: 'lb' },
  },
  program: {
    flow: 'program',
    name: 'Push / Pull / Legs',
    sub: 'Program · Intermediate',
    weeks: 12,
    daysAllowed: [5, 6],
    daysDefault: 6,
    scope: 'Training',
    price: 49, billing: 'once',
    split: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', ''],
    patternDefault: [1, 1, 1, 1, 1, 1, 0],
    goal: null,
  },
};

const CW_STEPS = ['Start date', 'Current state', 'Schedule', 'Personalize', 'Review', 'Confirm'];
const CW_DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const CW_INJURIES = [
  { id: 'none', label: 'None' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'lowerback', label: 'Lower back' },
  { id: 'knee', label: 'Knee' },
  { id: 'elbow', label: 'Elbow' },
  { id: 'wrist', label: 'Wrist' },
  { id: 'hip', label: 'Hip' },
];

// ── Local primitives (theme-driven, no globals) ─────────────────────────────
function CWStamp({ T, children, style }) {
  // Bare label on the page background — use the bridge's on-bg tertiary token,
  // which is legible on every theme's page. (T.stampFg is dark on Graffiti /
  // white on Blueprint because it's meant to sit on an accent chip, not bare.)
  return (
    <span style={{
      fontFamily: T.fontData, fontSize: 9, letterSpacing: '.18em',
      color: T.textOnBgTer || T.textTer, textTransform: 'uppercase', fontWeight: 600, ...style,
    }}>{children}</span>
  );
}

function CWSectionLabel({ T, children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '16px 18px 7px',
    }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em',
        color: T.textOnBgTer || T.textTer, textTransform: 'uppercase', fontWeight: 600,
      }}>{children}</span>
      {right && <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer }}>{right}</span>}
    </div>
  );
}

function CWCard({ T, children, style, tone }) {
  const toneMap = {
    warn: { bg: T.warnBg, br: T.warnBorder },
    info: { bg: T.accentFaint, br: T.accentBorder },
    success: { bg: T.successBg, br: T.successBorder },
  };
  const c = toneMap[tone];
  return (
    <div className="ft-card" style={{
      background: c ? c.bg : T.surface,
      border: `1px solid ${c ? c.br : (T.chrome === 'iron' || T.chrome === 'graffiti' ? T.border : T.borderFaint)}`,
      borderRadius: T.radiusLg || 10,
      ...style,
    }}>{children}</div>
  );
}

// Selectable row option (start-date quick picks)
function CWOption({ T, active, label, meta, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: T.surfaceAlt,
      border: active ? `1.5px solid ${T.accent}` : `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999, flexShrink: 0,
        border: `2px solid ${active ? T.accent : T.borderStrong}`,
        background: active ? T.accent : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <span style={{ width: 7, height: 7, borderRadius: 999, background: T.textOnAccent }}/>}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{label}</span>
        {meta && <span style={{ display: 'block', fontFamily: T.fontData, fontSize: 11, color: T.textTer, letterSpacing: '.04em', marginTop: 1 }}>{meta}</span>}
      </span>
      {badge && (
        <span style={{
          fontFamily: T.fontBody, fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em',
          textTransform: 'uppercase', color: T.accent,
          padding: '3px 8px', borderRadius: 999,
          background: T.accentFaint, border: `1px solid ${T.accentBorder}`,
        }}>{badge}</span>
      )}
    </button>
  );
}

// Segmented control
function CWSeg({ T, items, value, onChange, style }) {
  return (
    <div style={{
      display: 'flex', border: `1px solid ${T.border}`, background: T.surfaceAlt,
      borderRadius: T.radiusMd || 8, overflow: 'hidden', ...style,
    }}>
      {items.map((it, i) => {
        const v = typeof it === 'object' ? it.value : it;
        const lbl = typeof it === 'object' ? it.label : it;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, padding: '10px 4px', textAlign: 'center', cursor: 'pointer',
            background: on ? T.accent : 'transparent',
            color: on ? T.textOnAccent : T.textSec,
            border: 'none',
            borderLeft: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
            fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, letterSpacing: '.01em',
          }}>{lbl}</button>
        );
      })}
    </div>
  );
}

// Toggleable chip
function CWChip({ T, active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      cursor: 'pointer',
      padding: '7px 13px', borderRadius: 999,
      background: active ? T.accent : T.surfaceAlt,
      color: active ? T.textOnAccent : T.textSec,
      border: `1px solid ${active ? T.accent : T.borderFaint}`,
      fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, letterSpacing: '.01em',
      whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

// Numeric faux-input with unit
function CWNum({ T, value, unit, onChange, w }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 5,
      padding: '10px 12px', width: w || '100%',
      background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
    }}>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value.replace(/[^0-9.]/g, ''))}
        inputMode="decimal"
        style={{
          flex: 1, minWidth: 0, width: '100%',
          background: 'transparent', border: 'none', outline: 'none',
          fontFamily: T.fontData, fontWeight: 600, fontSize: 18, color: T.text,
          letterSpacing: '.01em', padding: 0,
        }}
      />
      {unit && <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, letterSpacing: '.06em', textTransform: 'uppercase' }}>{unit}</span>}
    </div>
  );
}

// Day grid — 7 columns, toggle training days, label shows the split
function CWDayGrid({ T, pattern, split, onToggle }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
      {CW_DOW.map((d, i) => {
        const on = pattern[i] === 1;
        const label = split[i];
        return (
          <button key={i} onClick={() => onToggle(i)} style={{
            aspectRatio: '0.66', cursor: 'pointer',
            background: on ? T.accent : T.surfaceAlt,
            border: `1px solid ${on ? T.accent : T.borderFaint}`,
            borderRadius: T.radiusMd || 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 0 8px',
          }}>
            <span style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.1em', color: on ? T.textOnAccent : T.textTer, opacity: on ? 0.7 : 1 }}>{d}</span>
            {on ? (
              <span style={{ width: 20, height: 20, borderRadius: 999, background: T.textOnAccent, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</span>
            ) : (
              <span style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px dashed ${T.borderFaint}` }}/>
            )}
            <span style={{ fontFamily: T.fontBody, fontSize: 9, fontWeight: 700, letterSpacing: '.02em', color: on ? T.textOnAccent : T.textTer, minHeight: 11 }}>
              {on ? (label || 'Train') : 'Rest'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Read-back row for the Review step
function CWReadRow({ T, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 14px',
      borderBottom: last ? 'none' : `1px solid ${T.borderFaint}`,
    }}>
      <span style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.12em', color: T.textTer, textTransform: 'uppercase', width: 96, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 500, color: T.text, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// Mini month calendar (June 2026 — Jun 1 is a Monday)
function CWCalendar({ T, selected, onPick }) {
  const cells = [];
  const lead = 1; // June 1 2026 = Monday → one blank before (Sun-first grid)
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= 30; d++) cells.push(d);
  return (
    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusMd || 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>June 2026</span>
        <span style={{ display: 'flex', gap: 6 }}>
          {['‹', '›'].map((g) => (
            <span key={g} style={{ width: 22, height: 22, borderRadius: 999, border: `1px solid ${T.borderFaint}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: T.textSec }}>{g}</span>
          ))}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 5 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ fontFamily: T.fontData, fontSize: 9, letterSpacing: '.1em', color: T.textTer, textAlign: 'center' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((n, i) => {
          if (n === null) return <div key={`b${i}`}/>;
          const on = n === selected;
          return (
            <button key={n} onClick={() => onPick(n)} style={{
              aspectRatio: '1', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontData, fontSize: 12.5, fontWeight: on ? 700 : 500,
              borderRadius: T.radiusSm || 4,
              background: on ? T.accent : 'transparent',
              color: on ? T.textOnAccent : T.text,
              border: `1px solid ${on ? T.accent : 'transparent'}`,
            }}>{n}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step body ───────────────────────────────────────────────────────────────
function CWStepBody({ T, step, st, plan, showDraft, showWarnings, goToStep }) {
  const isGP = plan.flow === 'gameplan';

  const onBg = T.textOnBg || T.text;
  const onBgSec = T.textOnBgSec || T.textSec;
  const onBgTer = T.textOnBgTer || T.textTer;

  // Resolve the chosen start date string
  const startStr = st.startMode === 'today' ? 'Thu · May 28'
    : st.startMode === 'monday' ? 'Mon · Jun 1'
    : `Mon · Jun ${st.startDay}`;

  // STEP 1 — Start date
  if (step === 1) {
    return (
      <div>
        {showDraft && (
          <div style={{ padding: '14px 18px 0' }}>
            <CWCard T={T} style={{ padding: '12px 13px', borderColor: T.accent }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Draft · Step 4 of 6</span>
                <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, letterSpacing: '.04em' }}>Saved 2h ago</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => goToStep(4)} style={{ flex: 1, cursor: 'pointer', background: T.accent, color: T.textOnAccent, border: 'none', borderRadius: T.radiusMd || 8, padding: '9px 13px', fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700 }}>Resume</button>
                <button style={{ cursor: 'pointer', background: 'transparent', color: T.textSec, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8, padding: '9px 14px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 600 }}>Start over</button>
              </div>
            </CWCard>
          </div>
        )}
        <CWSectionLabel T={T}>Start date</CWSectionLabel>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CWOption T={T} active={st.startMode === 'today'} label="Today" meta="Thu · May 28" onClick={() => st.setStartMode('today')}/>
          <CWOption T={T} active={st.startMode === 'monday'} label="Next Monday" meta="Mon · Jun 1" badge="Recommended" onClick={() => st.setStartMode('monday')}/>
          <CWOption T={T} active={st.startMode === 'custom'} label="Pick a date" meta={st.startMode === 'custom' ? `Mon · Jun ${st.startDay}` : 'Choose from calendar'} onClick={() => st.setStartMode('custom')}/>
        </div>
        {st.startMode === 'custom' && (
          <div style={{ padding: '12px 18px 0' }}>
            <CWCalendar T={T} selected={st.startDay} onPick={st.setStartDay}/>
          </div>
        )}
        <div style={{ padding: '16px 18px 8px', fontFamily: T.fontBody, fontSize: 12, color: onBgTer, lineHeight: 1.5 }}>
          Week 1 begins {startStr}. Reversible after purchase.
        </div>
      </div>
    );
  }

  // STEP 2 — Current state
  if (step === 2) {
    const toggleInjury = (id) => {
      if (id === 'none') return st.setInjuries(['none']);
      const next = st.injuries.filter((x) => x !== 'none');
      st.setInjuries(next.includes(id) ? next.filter((x) => x !== id) : [...next, id]);
    };
    return (
      <div>
        <CWSectionLabel T={T} right="Optional">Body weight</CWSectionLabel>
        <div style={{ padding: '0 18px' }}>
          <CWNum T={T} value={st.bw} unit="lb" onChange={st.setBw}/>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBgTer, marginTop: 6 }}>Used to set macro targets.</div>
        </div>

        <CWSectionLabel T={T}>Current lifts · 1RM</CWSectionLabel>
        <div style={{ padding: '0 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Bench', st.bench, st.setBench], ['Squat', st.squat, st.setSquat], ['Deadlift', st.dead, st.setDead]].map(([lbl, val, set]) => (
            <div key={lbl}>
              <CWStamp T={T} style={{ fontSize: 8.5, display: 'block', marginBottom: 4 }}>{lbl}</CWStamp>
              <CWNum T={T} value={val} unit="lb" onChange={set}/>
            </div>
          ))}
        </div>

        <CWSectionLabel T={T} right={st.injuries.filter((x) => x !== 'none').length ? `${st.injuries.filter((x) => x !== 'none').length} flagged` : null}>Injuries</CWSectionLabel>
        <div style={{ padding: '0 18px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CW_INJURIES.map((inj) => (
            <CWChip key={inj.id} T={T} active={st.injuries.includes(inj.id)} onClick={() => toggleInjury(inj.id)}>{inj.label}</CWChip>
          ))}
        </div>
        {st.injuries.filter((x) => x !== 'none').length > 0 && (
          <div style={{ padding: '12px 18px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontFamily: T.fontBody, fontSize: 12, color: onBgSec, lineHeight: 1.45 }}>
              <span style={{ color: onBgSec, fontWeight: 700 }}>↳</span>
              <span>Substitutions apply automatically. Review them in Planning Mode after start.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 3 — Schedule
  if (step === 3) {
    return (
      <div>
        <CWSectionLabel T={T} right={`${plan.daysAllowed[0]}–${plan.daysAllowed[plan.daysAllowed.length - 1]} allowed`}>Days per week</CWSectionLabel>
        <div style={{ padding: '0 18px' }}>
          <CWSeg T={T} items={plan.daysAllowed.map(String)} value={String(st.days)} onChange={(v) => st.setDays(Number(v))}/>
        </div>

        <CWSectionLabel T={T} right={`${st.pattern.filter((x) => x).length} on · ${7 - st.pattern.filter((x) => x).length} rest`}>Preferred days</CWSectionLabel>
        <div style={{ padding: '0 18px' }}>
          <CWDayGrid T={T} pattern={st.pattern} split={plan.split} onToggle={st.toggleDay}/>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBgTer, marginTop: 8 }}>
            {st.pattern.filter((x) => x).length === st.days ? 'Matches your day count.' : `Pick ${st.days} to match the day count above.`}
          </div>
        </div>

        <CWSectionLabel T={T}>Session length</CWSectionLabel>
        <div style={{ padding: '0 18px 4px' }}>
          <CWSeg T={T} items={[{ value: '45', label: '45 min' }, { value: '60', label: '60 min' }, { value: '75', label: '75 min' }, { value: '90', label: '90+' }]} value={st.session} onChange={st.setSession}/>
        </div>
      </div>
    );
  }

  // STEP 4 — Personalize
  if (step === 4) {
    return (
      <div>
        <div style={{ padding: '16px 18px 0', fontFamily: T.fontBody, fontSize: 12, color: onBgTer }}>
          Tuned for {plan.name}. All editable later.
        </div>

        <CWSectionLabel T={T}>Progression</CWSectionLabel>
        <div style={{ padding: '0 18px' }}>
          <CWSeg T={T} items={[{ value: 'linear', label: 'Linear' }, { value: 'double', label: 'Double' }, { value: 'rpe', label: 'RPE' }]} value={st.progression} onChange={st.setProgression}/>
        </div>

        <CWSectionLabel T={T}>Deload cadence</CWSectionLabel>
        <div style={{ padding: '0 18px' }}>
          <CWSeg T={T} items={[{ value: '4', label: 'Every 4 wk' }, { value: '6', label: 'Every 6 wk' }, { value: 'auto', label: 'By readiness' }]} value={st.deload} onChange={st.setDeload}/>
        </div>

        {isGP && (
          <>
            <CWSectionLabel T={T}>Refeed</CWSectionLabel>
            <div style={{ padding: '0 18px' }}>
              <CWSeg T={T} items={[{ value: 'none', label: 'None' }, { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Biweekly' }]} value={st.refeed} onChange={st.setRefeed}/>
            </div>
          </>
        )}

        <CWSectionLabel T={T} right={`${st.accessory.length} picked`}>Accessory focus</CWSectionLabel>
        <div style={{ padding: '0 18px 4px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['Chest', 'Triceps', 'Shoulders', 'Back', 'Arms', 'Legs', 'Core'].map((m) => (
            <CWChip key={m} T={T} active={st.accessory.includes(m)} onClick={() => st.setAccessory(st.accessory.includes(m) ? st.accessory.filter((x) => x !== m) : [...st.accessory, m])}>{m}</CWChip>
          ))}
        </div>
      </div>
    );
  }

  // STEP 5 — Review
  if (step === 5) {
    const injNames = st.injuries.filter((x) => x !== 'none').map((id) => CW_INJURIES.find((i) => i.id === id).label).join(', ') || 'None';
    const progLabel = { linear: 'Linear', double: 'Double progression', rpe: 'RPE-based' }[st.progression];
    const deloadLabel = { '4': 'Every 4 weeks', '6': 'Every 6 weeks', auto: 'By readiness' }[st.deload];
    return (
      <div>
        <CWSectionLabel T={T}>Schedule</CWSectionLabel>
        <CWCard T={T} style={{ margin: '0 18px' }}>
          <CWReadRow T={T} label="Starts" value={startStr}/>
          <CWReadRow T={T} label="Length" value={`${plan.weeks} weeks`}/>
          <CWReadRow T={T} label="Days" value={`${st.days} / week · ${st.session === '90' ? '90+' : st.session} min`}/>
          <CWReadRow T={T} label="Split" value={plan.split.filter((s, i) => st.pattern[i]).join(' · ')} last/>
        </CWCard>

        <CWSectionLabel T={T}>Inputs</CWSectionLabel>
        <CWCard T={T} style={{ margin: '0 18px' }}>
          <CWReadRow T={T} label="Body weight" value={`${st.bw} lb`}/>
          <CWReadRow T={T} label="Bench 1RM" value={`${st.bench} lb`}/>
          <CWReadRow T={T} label="Injuries" value={injNames} last/>
        </CWCard>

        <CWSectionLabel T={T}>Personalization</CWSectionLabel>
        <CWCard T={T} style={{ margin: '0 18px' }}>
          <CWReadRow T={T} label="Progression" value={progLabel}/>
          <CWReadRow T={T} label="Deload" value={deloadLabel}/>
          {isGP && <CWReadRow T={T} label="Refeed" value={{ none: 'None', weekly: 'Weekly', biweekly: 'Biweekly' }[st.refeed]}/>}
          <CWReadRow T={T} label="Accessory" value={st.accessory.join(', ') || 'None'} last/>
        </CWCard>

        {isGP && (
          <>
            <CWSectionLabel T={T}>Generates</CWSectionLabel>
            <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['Goal', `${plan.goal.label} → ${plan.goal.target} ${plan.goal.unit}`],
                ['Nutrition', `~1 g protein / lb · slight surplus`],
                ['Lifestyle', `Sleep 7.5 h · Protein 4× / day`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingLeft: 10, borderLeft: `2px solid ${T.borderStrong}` }}>
                  <CWStamp T={T} style={{ width: 64, flexShrink: 0 }}>{k}</CWStamp>
                  <span style={{ fontFamily: T.fontBody, fontSize: 13, color: onBg }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {showWarnings && (
          <>
            <CWSectionLabel T={T}>Before you start</CWSectionLabel>
            <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CWCard T={T} tone="warn" style={{ padding: '11px 13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 999, background: T.warn, color: T.textOnAccent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontBody, fontSize: 10, fontWeight: 700 }}>!</span>
                  <CWStamp T={T} style={{ color: T.warnFg }}>Equipment</CWStamp>
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: onBg, lineHeight: 1.4 }}>Assumes barbell + bench, 4× / week.</div>
              </CWCard>
              {st.injuries.includes('shoulder') && (
                <CWCard T={T} style={{ padding: '11px 13px', borderLeft: `3px solid ${T.accentBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: T.accent, fontWeight: 700 }}>↳</span>
                    <CWStamp T={T} style={{ color: T.accent }}>Substitution</CWStamp>
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.text, lineHeight: 1.4 }}>Shoulder flagged. Overhead press → landmine press, weeks 1–6.</div>
                </CWCard>
              )}
            </div>
          </>
        )}
        <div style={{ height: 8 }}/>
      </div>
    );
  }

  // STEP 6 — Confirm
  const priceStr = plan.billing === 'mo' ? `$${plan.price} / mo` : `$${plan.price} once`;
  return (
    <div>
      <div style={{ padding: '20px 18px 4px', textAlign: 'center' }}>
        <CWStamp T={T} style={{ display: 'block', marginBottom: 8 }}>Order summary</CWStamp>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: onBg, lineHeight: 1.1, letterSpacing: '-.01em' }}>{plan.name}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: onBgSec, marginTop: 6 }}>{plan.sub} · {plan.scope}</div>
      </div>

      <div style={{ padding: '18px 18px 0' }}>
        <CWCard T={T}>
          <CWReadRow T={T} label="Starts" value={startStr}/>
          <CWReadRow T={T} label="Schedule" value={`${st.days} days · ${plan.weeks} wk`}/>
          <CWReadRow T={T} label="Customized" value={`${1 + (isGP ? 1 : 0) + st.accessory.length} inputs`}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${T.border}` }}>
            <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 700, color: T.text }}>{plan.billing === 'mo' ? 'Subscription' : 'One-time'}</span>
            <span style={{ fontFamily: T.fontNumber || T.fontData, fontSize: 20, fontWeight: 700, color: T.text }}>{priceStr}</span>
          </div>
        </CWCard>
      </div>

      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'flex-start', gap: 9, fontFamily: T.fontBody, fontSize: 12, color: onBgTer, lineHeight: 1.5 }}>
        <span style={{ color: T.success, fontWeight: 700 }}>✓</span>
        <span>{plan.billing === 'mo' ? 'Cancel anytime. Schedule and inputs stay editable.' : 'Lifetime access. Re-customize or restart anytime.'}</span>
      </div>
    </div>
  );
}

// ── Wizard shell ────────────────────────────────────────────────────────────
function CustomizeWizard({ theme = 'graffiti', flow = 'gameplan', showDraft = false, showWarnings = true, startStep = 1 }) {
  const T = window.getFitTrackTheme(theme);
  const plan = CW_PLANS[flow] || CW_PLANS.gameplan;
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;

  const [step, setStep] = useCWState(startStep);
  const [startMode, setStartMode] = useCWState('monday');
  const [startDay, setStartDay] = useCWState(8);
  const [bw, setBw] = useCWState('187');
  const [bench, setBench] = useCWState('80');
  const [squat, setSquat] = useCWState('205');
  const [dead, setDead] = useCWState('255');
  const [injuries, setInjuries] = useCWState(['shoulder']);
  const [days, setDays] = useCWState(plan.daysDefault);
  const [pattern, setPattern] = useCWState(plan.patternDefault.slice());
  const [session, setSession] = useCWState('60');
  const [progression, setProgression] = useCWState('double');
  const [deload, setDeload] = useCWState('auto');
  const [refeed, setRefeed] = useCWState('weekly');
  const [accessory, setAccessory] = useCWState(flow === 'program' ? ['Back', 'Arms'] : ['Chest', 'Triceps']);

  const toggleDay = (i) => {
    const next = pattern.slice();
    next[i] = next[i] ? 0 : 1;
    setPattern(next);
  };

  const st = {
    startMode, setStartMode, startDay, setStartDay, bw, setBw,
    bench, setBench, squat, setSquat, dead, setDead,
    injuries, setInjuries, days, setDays, pattern, toggleDay, session, setSession,
    progression, setProgression, deload, setDeload, refeed, setRefeed, accessory, setAccessory,
  };

  const goToStep = (n) => setStep(Math.max(1, Math.min(CW_STEPS.length, n)));
  const next = () => goToStep(step + 1);
  const back = () => goToStep(step - 1);

  const nextLabel = step === 5 ? 'Confirm plan' : step === 6 ? `Go to checkout · ${plan.billing === 'mo' ? `$${plan.price}/mo` : `$${plan.price}`}` : 'Next';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'rgb(var(--ft-bg))' }}>
      {/* Header */}
      <div className="ft-on-bg" style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={back} disabled={step === 1} style={{
          width: 34, height: 34, borderRadius: 999, flexShrink: 0,
          background: 'transparent', border: `1px solid ${T.borderFaint || T.border}`,
          color: onBg, fontSize: 17, cursor: step === 1 ? 'default' : 'pointer',
          opacity: step === 1 ? 0.35 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 600, color: onBg, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Customize</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: onBgTer, letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.name}</div>
        </div>
        <button style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: 'transparent', border: `1px solid ${T.borderFaint || T.border}`, color: onBg, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>⚙</button>
      </div>

      {/* Step indicator */}
      <div className="ft-on-bg" style={{ padding: '12px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em', color: onBg, fontWeight: 700, textTransform: 'uppercase' }}>
            {String(step).padStart(2, '0')} / 06 · {CW_STEPS[step - 1]}
          </span>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 600, color: onBgTer, letterSpacing: '.02em', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: 10 }}>Save &amp; exit</button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {CW_STEPS.map((_, i) => (
            <button key={i} onClick={() => goToStep(i + 1)} style={{
              flex: 1, height: 4, borderRadius: 999, cursor: 'pointer', border: 'none', padding: 0,
              background: i + 1 <= step ? T.borderStrong : T.borderFaint,
              opacity: i + 1 <= step ? 1 : 0.55,
            }}/>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
        <CWStepBody T={T} step={step} st={st} plan={plan} showDraft={showDraft} showWarnings={showWarnings} goToStep={goToStep}/>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface, borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {step > 1 && (
          <button onClick={back} style={{
            padding: '13px 18px', borderRadius: T.radiusMd || 8, cursor: 'pointer',
            background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`,
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          }}>Back</button>
        )}
        <button onClick={next} style={{
          flex: 1, padding: '14px 16px', borderRadius: T.radiusMd || 8, cursor: 'pointer',
          background: T.accent, color: T.textOnAccent, border: 'none',
          fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, letterSpacing: '-.005em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: T.shadowSm,
        }}>
          <span>{nextLabel}</span>
          {step < 6 && <span style={{ fontSize: 16 }}>→</span>}
        </button>
      </div>
    </div>
  );
}

window.CustomizeWizard = CustomizeWizard;
