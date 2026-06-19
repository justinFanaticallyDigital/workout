// fallback-questionnaire.jsx
// FitTrack · 5.6 — Fallback Questionnaire  (sheet from the Shelf filter rail)
//
// The guided alternative to free-browsing the Shelf. Reached from the
// "Not sure? Answer a few questions" link at the top of the filter rail.
// Five linear steps, each mapping directly to a filter answer; on submit the
// rail is auto-populated and the user lands back on the Shelf with a narrowed
// result set. Internally this wraps the legacy R4 engine flow; the UX is a
// simpler one-question-per-screen guide.
//
//   1 Goals · 2 Training days · 3 Experience · 4 Equipment · 5 Commitment → See recommendations
//
// Copy rules (CLAUDE.md): headers are noun labels (not questions), hints only
// when functional, data over prose, one idea per line, buttons are verbs.
//
// Renders through any of the 7 themes via theme-bridge. Host passes
// theme / tab (programs|gameplans) and remounts on change.

const { useState: useFQState } = React;

// ── Question fixtures ────────────────────────────────────────────────────────
const FQ_STEPS = [
  { key: 'goals',      label: 'Goals',         hint: 'Select all that apply' },
  { key: 'days',       label: 'Training days', hint: 'One choice' },
  { key: 'experience', label: 'Experience',    hint: 'One choice' },
  { key: 'equipment',  label: 'Equipment',     hint: 'One choice' },
  { key: 'commitment', label: 'Commitment',    hint: 'One choice' },
];

const FQ_GOALS = [
  { id: 'lose',      label: 'Lose weight / burn fat' },
  { id: 'tone',      label: 'Improve tone / definition' },
  { id: 'mass',      label: 'Build muscle mass' },
  { id: 'strength',  label: 'Gain strength' },
  { id: 'endurance', label: 'Improve endurance' },
  { id: 'perform',   label: 'Athletic performance' },
  { id: 'health',    label: 'Address a health concern' },
  { id: 'fun',       label: 'Stay active and have fun' },
];

const FQ_DAYS = ['2', '3', '4', '5', '6+'];

const FQ_EXPERIENCE = [
  { id: 'new',  label: 'Brand new',    desc: 'New to the gym, or just starting out' },
  { id: 'some', label: 'Some experience', desc: 'Comfortable with basic equipment' },
  { id: 'int',  label: 'Intermediate', desc: 'Follow a routine on my own' },
  { id: 'adv',  label: 'Advanced',     desc: 'Program my own training' },
];

const FQ_EQUIPMENT = [
  { id: 'bw',     label: 'Bodyweight only',  desc: 'No equipment' },
  { id: 'db',     label: 'Dumbbells',        desc: 'Adjustable or fixed' },
  { id: 'dbband', label: 'Dumbbells + bands', desc: 'Light home setup' },
  { id: 'home',   label: 'Full home gym',    desc: 'Rack, barbell, plates' },
  { id: 'gym',    label: 'Commercial gym',   desc: 'Full equipment access' },
];

const FQ_COMMIT = [
  { n: 1, label: 'Just exploring',  desc: 'Checking things out for now' },
  { n: 2, label: 'Would be nice',   desc: "Unsure I can commit yet" },
  { n: 3, label: 'A priority',      desc: 'Other commitments may slow me' },
  { n: 4, label: 'Very important',  desc: 'Willing to put in the work' },
  { n: 5, label: 'All in',          desc: 'Non-negotiable — ready to go' },
];

const FQ_TOTALS = { programs: 14, gameplans: 6 };

// Live result count — narrows as filters get more specific. Lands on the
// filter-rail default (8 of 14) for the default answer set.
function fqCount(tab, st) {
  const total = FQ_TOTALS[tab];
  const big = tab === 'programs';
  let c = total;
  if (st.days)       c -= big ? 2 : 1;
  if (st.experience) c -= big ? 1 : 0;
  if (st.equipment)  c -= big ? 2 : 1;
  c -= Math.max(0, st.goals.length - 1) * (big ? 1 : 1);
  return Math.max(big ? 4 : 2, c);
}

// ── Local primitives (theme-driven) ──────────────────────────────────────────
function FQHint({ T, children }) {
  return (
    <span style={{
      fontFamily: T.fontData, fontSize: 10, letterSpacing: '.14em',
      color: T.textOnBgTer || T.textTer, textTransform: 'uppercase', fontWeight: 600,
    }}>{children}</span>
  );
}

// Big tappable option row — radio (single) or check (multi)
function FQRow({ T, active, multi, label, desc, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 13,
      padding: desc ? '14px 15px' : '15px 15px',
      background: active ? T.accentFaint : T.surface,
      border: active ? `1.5px solid ${T.accent}` : `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
      minHeight: 52,
    }}>
      <span style={{
        width: 22, height: 22, flexShrink: 0,
        borderRadius: multi ? (T.radiusSm || 5) : 999,
        border: `2px solid ${active ? T.accent : T.borderStrong}`,
        background: active ? T.accent : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: T.textOnAccent,
      }}>
        {active && (multi
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 7"/></svg>
          : <span style={{ width: 8, height: 8, borderRadius: 999, background: T.textOnAccent }}/>
        )}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: T.fontBody, fontSize: 14.5, fontWeight: 600, color: T.text, letterSpacing: '.005em' }}>{label}</span>
        {desc && <span style={{ display: 'block', fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>{desc}</span>}
      </span>
    </button>
  );
}

// Number-chip strip (training days)
function FQDayChips({ T, value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
      {FQ_DAYS.map((d) => {
        const on = d === value;
        return (
          <button key={d} onClick={() => onChange(d)} style={{
            cursor: 'pointer', aspectRatio: '0.82',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            background: on ? T.accent : T.surface,
            border: on ? `1.5px solid ${T.accent}` : `1px solid ${T.borderFaint}`,
            borderRadius: T.radiusMd || 8,
          }}>
            <span style={{ fontFamily: T.fontNumber || T.fontData, fontSize: 26, fontWeight: 700, lineHeight: 1, color: on ? T.textOnAccent : T.text }}>{d}</span>
            <span style={{ fontFamily: T.fontData, fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', color: on ? T.textOnAccent : T.textTer, opacity: on ? 0.8 : 1 }}>{d === '1' ? 'day' : 'days'}</span>
          </button>
        );
      })}
    </div>
  );
}

// 1–5 commitment scale
function FQScale({ T, value, onChange }) {
  const active = FQ_COMMIT.find((c) => c.n === value);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
        {FQ_COMMIT.map((c) => {
          const on = c.n === value;
          return (
            <button key={c.n} onClick={() => onChange(c.n)} style={{
              cursor: 'pointer', aspectRatio: '1',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: on ? T.accent : T.surface,
              border: on ? `1.5px solid ${T.accent}` : `1px solid ${T.borderFaint}`,
              borderRadius: T.radiusMd || 8,
              fontFamily: T.fontNumber || T.fontData, fontSize: 22, fontWeight: 700,
              color: on ? T.textOnAccent : T.text,
            }}>{c.n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, padding: '0 2px' }}>
        <FQHint T={T}>Low</FQHint>
        <FQHint T={T}>High</FQHint>
      </div>
      {active && (
        <div style={{
          marginTop: 13, padding: '13px 15px',
          background: T.surface, border: `1px solid ${T.borderFaint}`,
          borderLeft: `3px solid ${T.accent}`, borderRadius: T.radiusMd || 8,
        }}>
          <div style={{ fontFamily: T.fontBody, fontSize: 15, fontWeight: 700, color: T.text }}>{active.n} · {active.label}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, marginTop: 3 }}>{active.desc}</div>
        </div>
      )}
    </div>
  );
}

// ── Step body ────────────────────────────────────────────────────────────────
function FQStepBody({ T, step, st }) {
  const meta = FQ_STEPS[step - 1];
  const onBgTer = T.textOnBgTer || T.textTer;

  const Heading = (
    <div style={{ padding: '4px 18px 14px' }}>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 27, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em', lineHeight: 1.05 }}>{meta.label}</div>
      <div style={{ marginTop: 7 }}><FQHint T={T}>{meta.hint}</FQHint></div>
    </div>
  );

  // STEP 1 — Goals (multi)
  if (step === 1) {
    const toggle = (id) => st.setGoals(st.goals.includes(id) ? st.goals.filter((x) => x !== id) : [...st.goals, id]);
    return (
      <div>
        {Heading}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FQ_GOALS.map((g) => (
            <FQRow key={g.id} T={T} multi active={st.goals.includes(g.id)} label={g.label} onClick={() => toggle(g.id)}/>
          ))}
        </div>
      </div>
    );
  }

  // STEP 2 — Training days (single)
  if (step === 2) {
    return (
      <div>
        {Heading}
        <div style={{ padding: '0 18px' }}>
          <FQDayChips T={T} value={st.days} onChange={st.setDays}/>
          <div style={{ marginTop: 12, fontFamily: T.fontBody, fontSize: 12.5, color: onBgTer, lineHeight: 1.5 }}>
            {st.days ? `Plans built around ${st.days} sessions a week.` : 'Pick the most you can hold to each week.'}
          </div>
        </div>
      </div>
    );
  }

  // STEP 3 — Experience (single + desc)
  if (step === 3) {
    return (
      <div>
        {Heading}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FQ_EXPERIENCE.map((e) => (
            <FQRow key={e.id} T={T} active={st.experience === e.id} label={e.label} desc={e.desc} onClick={() => st.setExperience(e.id)}/>
          ))}
        </div>
      </div>
    );
  }

  // STEP 4 — Equipment (single + desc)
  if (step === 4) {
    return (
      <div>
        {Heading}
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FQ_EQUIPMENT.map((e) => (
            <FQRow key={e.id} T={T} active={st.equipment === e.id} label={e.label} desc={e.desc} onClick={() => st.setEquipment(e.id)}/>
          ))}
        </div>
      </div>
    );
  }

  // STEP 5 — Commitment (1–5 scale)
  return (
    <div>
      {Heading}
      <div style={{ padding: '0 18px' }}>
        <FQScale T={T} value={st.commitment} onChange={st.setCommitment}/>
        <div style={{ marginTop: 13, fontFamily: T.fontBody, fontSize: 12, color: onBgTer, lineHeight: 1.5 }}>
          Adjusts recommendation order. Never hides plans.
        </div>
      </div>
    </div>
  );
}

// ── Questionnaire shell ───────────────────────────────────────────────────────
function FallbackQuestionnaire({ theme = 'lab', tab = 'programs', startStep = 1 }) {
  const T = window.getFitTrackTheme(theme);
  const onBg = T.textOnBg || T.text;
  const onBgSec = T.textOnBgSec || T.textSec;
  const onBgTer = T.textOnBgTer || T.textTer;
  const tabName = tab === 'gameplans' ? 'Gameplans' : 'Programs';

  const [step, setStep] = useFQState(startStep);
  const [goals, setGoals] = useFQState(['lose', 'mass']);
  const [days, setDays] = useFQState('4');
  const [experience, setExperience] = useFQState('int');
  const [equipment, setEquipment] = useFQState('gym');
  const [commitment, setCommitment] = useFQState(4);

  const st = {
    goals, setGoals, days, setDays, experience, setExperience,
    equipment, setEquipment, commitment, setCommitment,
  };

  const count = fqCount(tab, st);

  const goToStep = (n) => setStep(Math.max(1, Math.min(FQ_STEPS.length, n)));
  const next = () => goToStep(step + 1);
  const back = () => goToStep(step - 1);
  const last = step === FQ_STEPS.length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'rgb(var(--ft-bg))' }}>
      {/* Header */}
      <div className="ft-on-bg" style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          width: 34, height: 34, borderRadius: 999, flexShrink: 0,
          background: 'transparent', border: `1px solid ${T.borderFaint || T.border}`,
          color: onBg, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 600, color: onBg, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>A few quick questions</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: onBgTer, letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 1 }}>Guided setup</div>
        </div>
        <div style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'baseline', gap: 4,
          padding: '5px 11px', borderRadius: 999,
          background: T.accentFaint, border: `1px solid ${T.accentBorder}`,
        }}>
          <span style={{ fontFamily: T.fontNumber || T.fontData, fontSize: 14, fontWeight: 700, color: T.accentFg }}>{count}</span>
          <span style={{ fontFamily: T.fontData, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: T.accentFg, opacity: 0.85 }}>{tabName}</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="ft-on-bg" style={{ padding: '13px 16px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 7 }}>
          <span style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em', color: onBg, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: '1 1 auto' }}>
            {String(step).padStart(2, '0')} / 05 · {FQ_STEPS[step - 1].label}
          </span>
          <span style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.12em', color: onBgTer, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>{count} of {FQ_TOTALS[tab]}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {FQ_STEPS.map((_, i) => (
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
        <div key={step}>
          <FQStepBody T={T} step={step} st={st}/>
        </div>
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
        <button onClick={() => !last && next()} style={{
          flex: 1, padding: '14px 16px', borderRadius: T.radiusMd || 8, cursor: 'pointer',
          background: T.accent, color: T.textOnAccent, border: 'none',
          fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, letterSpacing: '-.005em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: T.shadowSm,
        }}>
          <span>{last ? `See ${count} ${tabName}` : 'Next'}</span>
          <span style={{ fontSize: 16 }}>→</span>
        </button>
      </div>
    </div>
  );
}

window.FallbackQuestionnaire = FallbackQuestionnaire;
