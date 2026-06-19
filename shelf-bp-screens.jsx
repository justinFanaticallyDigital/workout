// Shelf screens — Blueprint
// Tier Landing (1.5), Shelf main (5.1), Filter Rail, Empty.
// Mobile-first, designed for 410×860 Blueprint phone.

const T_SCR = window.BPS;

// ── Shared chrome ───────────────────────────────────────────────────────
function BPShelfHeader({ title, eyebrow, onBack, right, slugRight }) {
  return (
    <div style={{
      height: 52, flexShrink: 0,
      ...T_SCR.gridBg,
      borderBottom: `1px solid ${T_SCR.paperLine2}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 12px 0 4px',
      position: 'relative', zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {onBack && (
          <button style={{
            width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T_SCR.paperInk, padding: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div style={{ fontSize: 10, color: T_SCR.paperInk2, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, fontFamily: T_SCR.mono }}>
              {eyebrow}
            </div>
          )}
          <div style={{
            fontSize: 19, fontWeight: 700, color: T_SCR.paperInk,
            letterSpacing: '-.005em', fontFamily: T_SCR.disp,
            lineHeight: 1.15,
          }}>{title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {right}
        {slugRight && (
          <div style={{
            fontSize: 10, color: T_SCR.paperInk2, letterSpacing: '.18em', textTransform: 'uppercase',
            fontWeight: 700, fontFamily: T_SCR.mono, paddingRight: 4,
          }}>{slugRight}</div>
        )}
        <button style={{
          width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T_SCR.paperInk2, padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.37 16.97l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Sample data (re-export so detail screen can read it too) ───────────
const BP_SAMPLE_PROGRAMS = [
  { id: 'sas', name: 'Size & Strength', tagline: 'Compound-driven 4-day split. Hypertrophy with a strength bias.',
    price: 39, weeks: 12, daysPerWeek: 4, level: 'Int', method: 'Upper / Lower', mood: 'strength',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'lift' }, { d: 'W', kind: 'rest' },
      { d: 'T', kind: 'lift', today: true }, { d: 'F', kind: 'lift' },
      { d: 'S', kind: 'cardio' }, { d: 'S', kind: 'rest' },
    ],
  },
  { id: 'first90', name: 'First 90 Days', tagline: 'Build the habit. 3 days a week, simple lifts, repeatable.',
    price: 29, weeks: 13, daysPerWeek: 3, level: 'Beg', method: 'Full Body', mood: 'classic',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'rest' }, { d: 'W', kind: 'lift' },
      { d: 'T', kind: 'rest' }, { d: 'F', kind: 'lift' }, { d: 'S', kind: 'rest' }, { d: 'S', kind: 'rest' },
    ],
  },
  { id: 'leanout', name: 'Lean Out', tagline: 'Recomp protocol. 5 lifts a week, conditioning on off-days.',
    price: 49, weeks: 10, daysPerWeek: 5, level: 'Int', method: 'PPL', mood: 'recomp',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'lift' }, { d: 'W', kind: 'cardio' },
      { d: 'T', kind: 'lift' }, { d: 'F', kind: 'lift' }, { d: 'S', kind: 'cardio' }, { d: 'S', kind: 'rest' },
    ],
  },
  { id: 'busyp', name: 'Busy Parent', tagline: '30-minute sessions, 3×/wk, anywhere. Strong without the gym.',
    price: 29, weeks: 8, daysPerWeek: 3, level: 'Beg', method: 'Full Body', mood: 'classic',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'rest' }, { d: 'W', kind: 'lift' },
      { d: 'T', kind: 'rest' }, { d: 'F', kind: 'lift' }, { d: 'S', kind: 'rest' }, { d: 'S', kind: 'rest' },
    ], owned: true,
  },
  { id: 'powerb', name: 'Powerbuilder', tagline: 'Strong + look strong. Heavy compounds + hypertrophy work.',
    price: 49, weeks: 16, daysPerWeek: 4, level: 'Adv', method: 'Upper / Lower', mood: 'strength',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'lift' }, { d: 'W', kind: 'rest' },
      { d: 'T', kind: 'lift' }, { d: 'F', kind: 'lift' }, { d: 'S', kind: 'rest' }, { d: 'S', kind: 'rest' },
    ],
  },
  { id: 'athfo', name: 'Athletic Foundations', tagline: 'Move better. Mobility, power, hinge, carry. 4 sessions / wk.',
    price: 39, weeks: 8, daysPerWeek: 4, level: 'Int', method: 'Athletic', mood: 'athletic',
    days: [
      { d: 'M', kind: 'lift' }, { d: 'T', kind: 'class' }, { d: 'W', kind: 'rest' },
      { d: 'T', kind: 'lift' }, { d: 'F', kind: 'class' }, { d: 'S', kind: 'stretch' }, { d: 'S', kind: 'rest' },
    ],
  },
];

const BP_SAMPLE_GAMEPLANS = [
  { id: 'firstbench', name: '100 lb Bench in 12 Weeks',
    tagline: 'Goal-aware: deloads, refeeds, weekly check-ins, all aimed at one number.',
    weeks: 12, daysPerWeek: 4, scope: 'Training + Nutrition', mood: 'strength',
    start: { label: 'WK 0', value: '75 lb' },
    target: { label: 'WK 12', value: '100 lb' },
    milestones: [
      { at: 0.28, label: 'WK 3', value: '82', passed: true },
      { at: 0.55, label: 'WK 7', value: '90' },
      { at: 0.80, label: 'WK 10', value: '95' },
    ],
    ticker: '127 coaching',
  },
  { id: 'cut15', name: 'Cut 15 in 10',
    tagline: 'Drop body fat without losing lifts. Adaptive calories, refeed-aware.',
    weeks: 10, daysPerWeek: 5, scope: 'Nutrition + Lifestyle', mood: 'recomp',
    start: { label: 'WK 0', value: '195 lb' },
    target: { label: 'WK 10', value: '180 lb' },
    milestones: [
      { at: 0.3, label: 'WK 3', value: '192', passed: true },
      { at: 0.6, label: 'WK 6', value: '187' },
      { at: 0.85, label: 'WK 9', value: '182' },
    ],
    ticker: '342 coaching',
  },
  { id: 'sleep', name: 'Sleep-First Recovery',
    tagline: 'Reset sleep, stress, and training output in one Gameplan.',
    weeks: 8, daysPerWeek: 3, scope: 'Lifestyle + Training', mood: 'recovery',
    start: { label: 'WK 0', value: '6h 10m' },
    target: { label: 'WK 8', value: '7h 45m' },
    milestones: [
      { at: 0.3, label: 'WK 2', value: '6h 40m', passed: true },
      { at: 0.65, label: 'WK 5', value: '7h 15m' },
    ],
    ticker: '89 coaching',
  },
];

// ── Tier Landing (1.5) — PENDING ────────────────────────────────────────
function BPTierLanding() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...T_SCR.gridBg, color: T_SCR.paperInk, fontFamily: T_SCR.mono }}>
      {/* Header — step indicator */}
      <div style={{ padding: '18px 22px 8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === 2 ? 18 : 6, height: 6,
              background: i <= 2 ? T_SCR.paperInk : T_SCR.paperLine2,
            }}/>
          ))}
        </div>
        <span style={{ fontSize: 11, color: T_SCR.paperInk2, fontFamily: T_SCR.mono, fontWeight: 700, letterSpacing: '.18em' }}>STEP 03 / 03</span>
      </div>

      <div style={{ padding: '4px 22px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: 10.5, color: T_SCR.paperInk2, letterSpacing: '.20em', textTransform: 'uppercase', fontWeight: 700, fontFamily: T_SCR.mono, marginBottom: 10 }}>
          FITTRACK · ONBOARDING / 1.5
        </div>
        <div style={{
          fontSize: 30, fontWeight: 600, color: T_SCR.paperInk,
          letterSpacing: '-.015em', lineHeight: 1.1, fontFamily: T_SCR.disp,
        }}>
          Where do you<br/>want to start?
        </div>
        <div style={{ fontSize: 13.5, color: T_SCR.paperInk2, marginTop: 12, lineHeight: 1.55, maxWidth: 340, fontFamily: T_SCR.mono }}>
          Three ways to use FitTrack. Pick what fits today —{'\u00A0'}you can move between them whenever you{"'"}re ready.
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <BPTierCard
          tier="Logger" sub="FREE FOREVER" code="01"
          headline="Track your workouts. You own your data."
          bullets={['Unlimited logging', 'All 7 themes', 'Drive sync · CSV export']}
          ctaLabel="Continue as Logger"
          mood="classic"
        />
        <BPTierCard
          tier="Programs" sub="ONE-TIME · $29+" code="02"
          headline="Pick a plan. Run it on your own. Keep it forever."
          bullets={['Pre-built multi-week programs', 'Planning Mode · swap, skip, edit', 'Includes meal & lifestyle templates']}
          ctaLabel="Browse Programs"
          mood="strength"
          recommended
        />
        <BPTierCard
          tier="Gameplan" sub="SUB · $19 / MO" code="03"
          headline="Get coached. The app adapts your plan each week."
          bullets={['Weekly check-ins', 'Adaptive deloads & refeeds', 'Recommendations you can apply']}
          ctaLabel="Browse Gameplans"
          mood="recovery"
        />

        <button style={{
          marginTop: 4, padding: '12px 14px',
          background: 'transparent', border: `1px dashed ${T_SCR.paperLine2}`,
          color: T_SCR.paperInk2, fontSize: 11, fontWeight: 700, letterSpacing: '.16em',
          textTransform: 'uppercase', cursor: 'pointer', fontFamily: T_SCR.mono,
        }}>
          What{"'"}s the difference? &nbsp;›
        </button>

        <div style={{ fontSize: 10.5, color: T_SCR.paperInk3, textAlign: 'center', marginTop: 4, lineHeight: 1.6, fontFamily: T_SCR.mono, letterSpacing: '.06em' }}>
          ⋯ WHAT YOU BUY, YOU KEEP FOREVER ⋯<br/>
          ⋯ WHAT YOU SUBSCRIBE TO, YOU KEEP WHILE YOU PAY ⋯
        </div>
      </div>
    </div>
  );
}

function BPTierCard({ tier, sub, code, headline, bullets, ctaLabel, mood, recommended }) {
  return (
    <div style={{
      flexShrink: 0,
      background: T_SCR.card, color: T_SCR.cardInk,
      border: `1px solid ${recommended ? T_SCR.accent : T_SCR.cardLine2}`,
      boxShadow: recommended ? `0 0 0 2px ${T_SCR.accent}` : 'none',
      position: 'relative',
      fontFamily: T_SCR.mono,
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -10, right: 12,
          padding: '3px 8px',
          background: T_SCR.accent, color: T_SCR.card,
          fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
          fontFamily: T_SCR.mono,
        }}>RECOMMENDED</div>
      )}
      <div style={{
        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px dashed ${T_SCR.cardLine}`,
      }}>
        <span style={{ fontSize: 10.5, color: T_SCR.cardInk2, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, fontFamily: T_SCR.mono }}>
          TIER {code}
        </span>
        <span style={{ fontSize: 10.5, color: T_SCR.cardInk2, letterSpacing: '.14em', fontWeight: 700, fontFamily: T_SCR.mono }}>
          {sub}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '14px 14px 8px' }}>
        <div style={{ width: 78, flexShrink: 0, overflow: 'hidden', alignSelf: 'flex-start', border: `1px solid ${T_SCR.cardLine}` }}>
          <BPHeroPlaceholder mood={mood} aspect="4:3"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 24, fontWeight: 600, color: T_SCR.cardInk,
            letterSpacing: '-.01em', fontFamily: T_SCR.disp,
            lineHeight: 1.05,
          }}>{tier}</div>
          <div style={{ fontSize: 13, color: T_SCR.cardInk, fontWeight: 500, marginTop: 7, lineHeight: 1.45, fontFamily: T_SCR.mono }}>
            {headline}
          </div>
        </div>
      </div>
      <div style={{ padding: '4px 14px 16px' }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: T_SCR.cardInk2, lineHeight: 1.5, fontFamily: T_SCR.mono }}>
              <span style={{ color: T_SCR.cardInk, marginTop: 1, fontWeight: 700 }}>+</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <button style={{
        display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', border: 'none', cursor: 'pointer',
        background: T_SCR.accent, color: T_SCR.card,
        fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
        fontFamily: T_SCR.mono,
      }}>
        <span>{ctaLabel}</span>
        <span style={{ fontSize: 16 }}>→</span>
      </button>
      <BPCrosshair color={T_SCR.cardLine3} size={8} style={{ top: 2, left: 2 }}/>
      <BPCrosshair color={T_SCR.cardLine3} size={8} style={{ bottom: 2, right: 2 }}/>
    </div>
  );
}

// ── Filter Rail ─────────────────────────────────────────────────────────
function BPFilterRail({ onClose, resultCount = 8, totalCount = 14, tab = 'Programs' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(19,44,82,.55)' }}/>
      <div style={{
        position: 'relative', width: 340, maxWidth: '92%', height: '100%',
        background: T_SCR.card, color: T_SCR.cardInk, marginLeft: 'auto',
        boxShadow: '-12px 0 28px rgba(0,0,0,.32)',
        display: 'flex', flexDirection: 'column',
        fontFamily: T_SCR.mono,
        borderLeft: `1px solid ${T_SCR.cardLine3}`,
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: `1px dashed ${T_SCR.cardLine}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{
              fontSize: 20, fontWeight: 600, color: T_SCR.cardInk,
              letterSpacing: '-.005em', fontFamily: T_SCR.disp,
            }}>Filters</div>
            <button onClick={onClose} style={{
              width: 28, height: 28, border: `1px solid ${T_SCR.cardLine2}`, background: 'transparent',
              cursor: 'pointer', padding: 0, color: T_SCR.cardInk,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <div style={{
              padding: '4px 9px', background: 'transparent',
              border: `1px solid ${T_SCR.cardLine3}`, color: T_SCR.cardInk,
              fontSize: 11, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase',
              fontFamily: T_SCR.mono,
            }}>
              {resultCount} / {totalCount} {tab}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 12px' }}>
          {/* Not-sure CTA */}
          <button style={{
            margin: '10px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: 'calc(100% - 32px)',
            padding: '11px 14px', background: 'transparent',
            border: `1px dashed ${T_SCR.cardLine2}`, cursor: 'pointer',
            color: T_SCR.cardInk2, fontSize: 12.5, fontWeight: 600,
            letterSpacing: '.04em', fontFamily: T_SCR.mono,
          }}>
            Not sure? Answer questions
            <span>›</span>
          </button>

          <BPSectionLabel>· FILTERS</BPSectionLabel>
          <BPAccordionQuestion label="Goals" answer="Build muscle · Lose fat" expanded>
            <BPChipGroup options={[
              { id: 'lose', label: 'Lose weight', selected: true },
              { id: 'tone', label: 'Improve tone' },
              { id: 'mass', label: 'Build muscle', selected: true },
              { id: 'strength', label: 'Gain strength' },
              { id: 'endurance', label: 'Endurance' },
              { id: 'health', label: 'Health concern' },
              { id: 'perform', label: 'Athletic perf.' },
              { id: 'fun', label: 'Stay active' },
            ]}/>
          </BPAccordionQuestion>
          <BPAccordionQuestion label="Workout frequency" answer="4 days / wk"/>
          <BPAccordionQuestion label="Gym comfort level" answer="Intermediate"/>
          <BPAccordionQuestion label="Equipment access" answer="Commercial gym"/>

          <div style={{ height: 10 }}/>
          <BPSectionLabel>· TELL US ABOUT YOU</BPSectionLabel>
          <BPAccordionQuestion label="Commitment right now" answer="—" muted/>
          <BPAccordionQuestion label="History with goals" answer="—" muted/>
          <BPAccordionQuestion label="What have you tried?" answer="—" muted/>
        </div>

        <div style={{
          padding: '12px 16px 14px', borderTop: `1px dashed ${T_SCR.cardLine}`, flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', gap: 12,
        }}>
          <button style={{
            background: 'transparent', border: `1px solid ${T_SCR.cardLine2}`, cursor: 'pointer',
            color: T_SCR.cardInk2, fontSize: 11.5, fontWeight: 700, padding: '8px 12px',
            letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
          }}>Reset</button>
          <button style={{
            background: T_SCR.accent, border: 'none', cursor: 'pointer',
            color: T_SCR.card, fontSize: 11.5, fontWeight: 700, padding: '8px 16px',
            letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>Save as profile <span>›</span></button>
        </div>
      </div>
    </div>
  );
}

function BPSectionLabel({ children }) {
  return (
    <div style={{
      padding: '8px 16px 8px',
      fontSize: 10.5, color: T_SCR.cardInk2, letterSpacing: '.18em',
      textTransform: 'uppercase', fontWeight: 700, fontFamily: T_SCR.mono,
    }}>{children}</div>
  );
}

function BPAccordionQuestion({ label, answer, expanded, muted, children }) {
  return (
    <div style={{
      borderTop: `1px solid ${T_SCR.cardLine}`,
      background: expanded ? 'rgba(255,255,255,.04)' : 'transparent',
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T_SCR.cardInk, letterSpacing: 0, fontFamily: T_SCR.disp }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: muted ? T_SCR.cardInk3 : T_SCR.cardInk2, fontFamily: T_SCR.mono, fontWeight: 500, letterSpacing: '.02em' }}>
            {answer}
          </div>
        </div>
        <span style={{ color: T_SCR.cardInk2, fontSize: 16, fontFamily: T_SCR.mono, fontWeight: 700, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
      </div>
      {expanded && children && (
        <div style={{ padding: '4px 16px 14px' }}>{children}</div>
      )}
    </div>
  );
}

function BPChipGroup({ options }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {options.map(o => (
        <span key={o.id} style={{
          padding: '6px 12px',
          background: o.selected ? T_SCR.accent : 'transparent',
          color: o.selected ? T_SCR.card : T_SCR.cardInk,
          border: `1px solid ${o.selected ? T_SCR.accent : T_SCR.cardLine2}`,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          letterSpacing: '.02em', fontFamily: T_SCR.mono,
        }}>{o.label}</span>
      ))}
    </div>
  );
}

// ── Shelf main ──────────────────────────────────────────────────────────
function BPShelf({ tab = 'programs', filtersOpen = false, comparePinned = 0, emptyState = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...T_SCR.gridBg, color: T_SCR.paperInk, fontFamily: T_SCR.mono }}>
      <BPShelfHeader title="Browse" eyebrow="FT · 5.1" slugRight="14 / 6" onBack/>

      {/* Tab strip */}
      <div style={{
        flexShrink: 0,
        borderBottom: `1px solid ${T_SCR.paperLine2}`,
        padding: '0 18px', display: 'flex', gap: 22, alignItems: 'center', position: 'relative',
        background: 'transparent',
      }}>
        {[
          { id: 'programs', label: 'PROGRAMS', count: 14 },
          { id: 'gameplans', label: 'GAMEPLANS', count: 6 },
        ].map(t => (
          <button key={t.id} style={{
            padding: '14px 0 12px', background: 'transparent', border: 'none', cursor: 'pointer',
            color: tab === t.id ? T_SCR.paperInk : T_SCR.paperInk2,
            fontSize: 13.5, fontWeight: 700, letterSpacing: '.14em',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: T_SCR.mono,
            position: 'relative',
          }}>
            {t.label}
            <span style={{
              fontSize: 10.5, fontFamily: T_SCR.mono, fontWeight: 700, letterSpacing: '.06em',
              color: tab === t.id ? T_SCR.paperInk : T_SCR.paperInk2,
              padding: '2px 7px',
              border: `1px solid ${tab === t.id ? T_SCR.paperInk : T_SCR.paperLine2}`,
            }}>{String(t.count).padStart(2,'0')}</span>
            {tab === t.id && (
              <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: T_SCR.paperInk }}/>
            )}
          </button>
        ))}
      </div>

      {/* Sort + filter bar */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        borderBottom: `1px dashed ${T_SCR.paperLine2}`,
        background: 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: T_SCR.paperInk2, fontFamily: T_SCR.mono, fontWeight: 700, letterSpacing: '.10em' }}>
          <span style={{ color: T_SCR.paperInk2 }}>SORT</span>
          <button style={{
            background: 'transparent', border: `1px solid ${T_SCR.paperLine2}`, padding: '5px 11px',
            cursor: 'pointer', color: T_SCR.paperInk, fontSize: 11.5, fontWeight: 700,
            letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            RECOMMENDED <span style={{ fontSize: 9 }}>▼</span>
          </button>
        </div>
        <button style={{
          padding: '6px 13px', background: 'transparent', border: `1px solid ${T_SCR.paperInk}`,
          color: T_SCR.paperInk, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
        }}>
          FILTER
          <span style={{
            fontSize: 10.5, color: T_SCR.page, background: T_SCR.paperInk, padding: '2px 6px',
            fontFamily: T_SCR.mono, fontWeight: 700, letterSpacing: '.06em',
          }}>02</span>
        </button>
      </div>

      {/* Card grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 90px' }}>
        {emptyState ? (
          <BPEmptyShelf otherTab={tab === 'programs' ? 'gameplans' : 'programs'} otherCount={tab === 'programs' ? 4 : 9}/>
        ) : tab === 'programs' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {BP_SAMPLE_PROGRAMS.map((p, i) => (
              <BPProgramCard key={p.id} {...p}
                pinned={(comparePinned >= 1 && i === 0) || (comparePinned >= 2 && i === 4)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BP_SAMPLE_GAMEPLANS.map((g, i) => (
              <BPGameplanCard key={g.id} {...g}
                pinned={(comparePinned >= 1 && i === 0) || (comparePinned >= 2 && i === 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compare bar */}
      {comparePinned === 2 && (
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 16,
          padding: '12px 14px',
          background: T_SCR.card, color: T_SCR.cardInk,
          border: `1px solid ${T_SCR.accent}`,
          boxShadow: `0 8px 22px rgba(19,44,82,.22)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10, cursor: 'pointer',
          fontFamily: T_SCR.mono,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontSize: 10.5, color: T_SCR.cardInk2, letterSpacing: '.18em', fontWeight: 700,
            }}>PINNED · 02</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: T_SCR.cardInk, letterSpacing: '-.005em', fontFamily: T_SCR.disp }}>
              Compare these two
            </span>
          </div>
          <span style={{
            color: T_SCR.card, background: T_SCR.accent, padding: '6px 12px',
            fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em',
            fontFamily: T_SCR.mono, textTransform: 'uppercase',
          }}>OPEN ›</span>
        </div>
      )}

      {filtersOpen && <BPFilterRail tab={tab === 'programs' ? 'Programs' : 'Gameplans'}/>}
    </div>
  );
}

function BPEmptyShelf({ otherTab, otherCount }) {
  return (
    <div style={{
      padding: '40px 18px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      fontFamily: T_SCR.mono, color: T_SCR.paperInk,
    }}>
      <div style={{
        width: 88, height: 88,
        background: 'transparent', border: `1px dashed ${T_SCR.paperLine2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T_SCR.paperInk2, position: 'relative',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="M16 16l5 5"/>
        </svg>
        <BPCrosshair color={T_SCR.paperLine2} size={8} style={{ top: -4, left: -4 }}/>
        <BPCrosshair color={T_SCR.paperLine2} size={8} style={{ bottom: -4, right: -4 }}/>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 600, color: T_SCR.paperInk,
        letterSpacing: '-.01em', fontFamily: T_SCR.disp,
      }}>No match</div>
      <div style={{ fontSize: 13, color: T_SCR.paperInk2, lineHeight: 1.55, maxWidth: 300, fontFamily: T_SCR.mono }}>
        Loosen a constraint, or check the other tab — <strong style={{ color: T_SCR.paperInk }}>{otherCount} {otherTab}</strong> match what you{"'"}ve picked.
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button style={{
          padding: '10px 16px', background: 'transparent', border: `1px solid ${T_SCR.paperLine2}`,
          color: T_SCR.paperInk, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
        }}>RESET</button>
        <button style={{
          padding: '10px 16px', background: T_SCR.paperInk, border: 'none',
          color: T_SCR.page, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_SCR.mono,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>SEE {otherCount} {otherTab} <span>›</span></button>
      </div>
    </div>
  );
}

Object.assign(window, {
  BPShelfHeader, BPTierLanding, BPTierCard,
  BPShelf, BPFilterRail, BPEmptyShelf,
  BPSectionLabel, BPAccordionQuestion, BPChipGroup,
  BP_SAMPLE_PROGRAMS, BP_SAMPLE_GAMEPLANS,
});
