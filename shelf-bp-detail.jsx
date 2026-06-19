// Card Detail (5.2) + Compare (5.3) — Blueprint
// Body scrolls on light blue paper, hero is navy grid at top, sections are
// drawn as drafting blocks with hairline borders + corner crosshairs.

const T_DT = window.BPS;

// ── Detail scaffold ─────────────────────────────────────────────────────
function BPDetailScaffold({ type, name, tagline, mood, price, weeks, daysPerWeek, scope, method, level,
                            equipment, whoFor, leadVisual, sample, outcomes, warnings }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...T_DT.gridBg, color: T_DT.paperInk, fontFamily: T_DT.mono }}>

      {/* Hero — full-bleed 16:9 navy grid */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <BPHeroPlaceholder mood={mood} aspect="16:9">
          {/* Top chrome — translucent buttons over hero */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 4,
          }}>
            <button style={{
              width: 34, height: 34,
              background: 'rgba(19,44,82,.55)', border: `1px solid ${T_DT.cardLine2}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T_DT.cardInk, padding: 0, fontFamily: T_DT.mono,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{
                width: 34, height: 34,
                background: 'rgba(19,44,82,.55)', border: `1px solid ${T_DT.cardLine2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: T_DT.cardInk, padding: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="12" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="14" cy="18" r="2"/>
                  <path d="M8 11l4-3M8 13l4 3"/>
                </svg>
              </button>
              <button style={{
                width: 34, height: 34,
                background: 'rgba(19,44,82,.55)', border: `1px solid ${T_DT.cardLine2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: T_DT.cardInk, padding: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>
                </svg>
              </button>
            </div>
          </div>
          {/* Bottom gradient + meta */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '70%',
            background: 'linear-gradient(to top, rgba(7,17,33,.78), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }}/>
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: T_DT.cardInk, zIndex: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
                fontFamily: T_DT.mono, padding: '4px 9px',
                background: 'transparent', color: T_DT.cardInk,
                border: `1px solid ${T_DT.cardLine3}`,
              }}>{type === 'program' ? 'PROGRAM · 5.2' : 'GAMEPLAN · 5.2'}</span>
              <span style={{ fontSize: 12, fontFamily: T_DT.mono, fontWeight: 700, letterSpacing: '.10em', color: T_DT.cardInk2 }}>
                {type === 'program' ? `$${price} · ONE-TIME` : '$19 / MO · SUB'}
              </span>
            </div>
            <div style={{
              fontSize: 30, fontWeight: 600, color: T_DT.cardInk,
              letterSpacing: '-.01em', lineHeight: 1.1,
              fontFamily: T_DT.disp,
              textShadow: '0 2px 8px rgba(0,0,0,.35)',
            }}>{name}</div>
            <div style={{ fontSize: 13.5, color: T_DT.cardInk2, marginTop: 8, lineHeight: 1.5, maxWidth: 360, fontFamily: T_DT.mono }}>
              {tagline}
            </div>
          </div>
        </BPHeroPlaceholder>
      </div>

      {/* Scrolling body */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>

        {/* Quick stats row */}
        <div style={{
          background: T_DT.card, color: T_DT.cardInk,
          borderTop: `1px solid ${T_DT.cardLine3}`, borderBottom: `1px solid ${T_DT.cardLine3}`,
          padding: '16px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          fontFamily: T_DT.mono,
        }}>
          {[
            { label: 'WEEKS', value: weeks },
            { label: 'PER WK', value: `${daysPerWeek}×` },
            { label: 'METHOD', value: (method || scope), narrow: true },
            { label: 'LEVEL', value: level },
          ].map((s, i, arr) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', gap: 5,
              padding: '0 10px',
              borderRight: i < arr.length - 1 ? `1px dashed ${T_DT.cardLine2}` : 'none',
              alignItems: 'flex-start',
            }}>
              <div style={{
                fontSize: 10.5, color: T_DT.cardInk2, fontFamily: T_DT.mono,
                letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700,
              }}>{s.label}</div>
              <div style={{
                fontSize: s.narrow ? 13.5 : 18, fontWeight: 700, color: T_DT.cardInk,
                fontFamily: T_DT.mono, letterSpacing: '.02em',
              }}>{String(s.value)}</div>
            </div>
          ))}
        </div>

        {/* Who this is for */}
        <BPSection label="WHO THIS IS FOR" code="A.01">
          <div style={{ fontSize: 13.5, color: T_DT.paperInk, lineHeight: 1.6, fontFamily: T_DT.mono }}>
            {whoFor}
          </div>
        </BPSection>

        {/* Lead visual */}
        <BPSection
          label={type === 'program' ? 'THE WEEK SHAPE' : 'THE TRAJECTORY'}
          code="A.02"
          sub={type === 'program'
            ? "A typical training week. You'll repeat this rhythm — the specific lifts shift block to block."
            : `Where you are today, where you'll be in ${weeks} weeks, and the milestones along the way.`}
        >
          {leadVisual}
        </BPSection>

        {/* Sample */}
        <BPSection label="SAMPLE WORKOUT" code="A.03"
                   sub={`Day ${sample.day} · ${sample.dayName} · ${sample.summary}`}>
          <BPSampleWorkout exercises={sample.exercises}/>
        </BPSection>

        {/* Equipment */}
        <BPSection label="WHAT YOU'LL NEED" code="A.04">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {equipment.map((e, i) => (
              <span key={i} style={{
                padding: '6px 12px',
                background: 'transparent', border: `1px solid ${T_DT.paperLine2}`,
                color: T_DT.paperInk, fontSize: 12.5, fontWeight: 600,
                letterSpacing: '.02em', fontFamily: T_DT.mono,
              }}>{e}</span>
            ))}
          </div>
        </BPSection>

        {/* Outcomes */}
        <BPSection label="WHAT CHANGES" code="A.05" sub="By the end, you should be able to expect:">
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {outcomes.map((o, i) => (
              <li key={i} style={{
                position: 'relative',
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px',
                background: 'rgba(255,255,255,.45)',
                border: `1px solid ${T_DT.paperLine2}`,
              }}>
                <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, left: -4 }}/>
                <BPCrosshair color={T_DT.paperLine2} size={8} style={{ bottom: -4, right: -4 }}/>
                <div style={{
                  width: 30, height: 30, flexShrink: 0,
                  border: `1px solid ${T_DT.paperInk}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: T_DT.paperInk,
                  fontFamily: T_DT.mono, letterSpacing: '.04em',
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: T_DT.paperInk, letterSpacing: '-.005em', fontFamily: T_DT.disp }}>
                    {o.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: T_DT.paperInk2, marginTop: 6, lineHeight: 1.55, fontFamily: T_DT.mono }}>
                    {o.body}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </BPSection>

        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <BPSection label="HEADS UP" code="A.06">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {warnings.map((w, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '11px 12px',
                  background: 'rgba(240,205,90,.10)',
                  border: `1px solid rgba(240,205,90,.45)`,
                  color: T_DT.paperInk,
                  fontFamily: T_DT.mono,
                }}>
                  <div style={{ flexShrink: 0, marginTop: 1, color: '#9B7A2A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4l10 18H2L12 4zM12 11v5M12 19v.5"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 12.5, color: T_DT.paperInk, lineHeight: 1.55 }}>{w}</div>
                </div>
              ))}
            </div>
          </BPSection>
        )}

        <div style={{
          padding: '24px 16px 16px', textAlign: 'center',
          fontSize: 11, color: T_DT.paperInk2, lineHeight: 1.6,
          fontFamily: T_DT.mono, letterSpacing: '.10em', textTransform: 'uppercase',
        }}>
          {type === 'program'
            ? '⋯ ONE-TIME PURCHASE · YOURS TO KEEP FOREVER ⋯'
            : '⋯ CANCEL ANYTIME · PAUSE 1–3 MONTHS INSTEAD ⋯'}
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: T_DT.card, color: T_DT.cardInk,
        borderTop: `1px solid ${T_DT.cardLine3}`,
        padding: '14px 14px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        display: 'flex', gap: 10, alignItems: 'center',
        boxShadow: '0 -2px 14px rgba(19,44,82,.18)',
        fontFamily: T_DT.mono,
      }}>
        <button style={{
          width: 44, height: 44, flexShrink: 0,
          background: 'transparent', border: `1px solid ${T_DT.cardLine3}`,
          cursor: 'pointer', color: T_DT.cardInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h7v12H3zM14 6h7v12h-7z"/>
          </svg>
        </button>
        <button style={{
          flex: 1, background: T_DT.accent, color: T_DT.card, border: 'none',
          padding: '14px 16px', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
          fontFamily: T_DT.mono,
        }}>
          <span>START CUSTOMIZING</span>
          <span style={{ fontSize: 16 }}>→</span>
        </button>
      </div>
    </div>
  );
}

function BPSection({ label, code, sub, children }) {
  return (
    <div style={{ padding: '22px 16px 4px', fontFamily: T_DT.mono }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 11.5, color: T_DT.paperInk, letterSpacing: '.16em', textTransform: 'uppercase',
          fontWeight: 700, fontFamily: T_DT.mono,
        }}>{label}</div>
        {code && (
          <div style={{
            fontSize: 10.5, color: T_DT.paperInk2, letterSpacing: '.12em', fontWeight: 700,
            fontFamily: T_DT.mono,
          }}>§ {code}</div>
        )}
      </div>
      <div style={{
        height: 1, background: 'transparent',
        borderTop: `1px dashed ${T_DT.paperLine2}`, marginBottom: 12,
      }}/>
      {sub && (
        <div style={{
          fontSize: 13, color: T_DT.paperInk2, marginBottom: 14, lineHeight: 1.55, fontFamily: T_DT.mono,
        }}>{sub}</div>
      )}
      {children}
    </div>
  );
}

function BPSampleWorkout({ exercises }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.45)',
      border: `1px solid ${T_DT.paperLine2}`,
      overflow: 'hidden', position: 'relative',
      fontFamily: T_DT.mono,
    }}>
      <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, left: -4 }}/>
      <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, right: -4 }}/>
      {exercises.map((ex, i) => (
        <div key={i} style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: i > 0 ? `1px dashed ${T_DT.paperLine}` : 'none',
        }}>
          <div style={{
            width: 30, height: 30, flexShrink: 0,
            border: `1px solid ${T_DT.paperInk}`,
            color: T_DT.paperInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 700, fontFamily: T_DT.mono,
          }}>{String.fromCharCode(65 + i)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: T_DT.paperInk,
              letterSpacing: 0, fontFamily: T_DT.disp,
            }}>{ex.name}</div>
            {ex.note && (
              <div style={{ fontSize: 12, color: T_DT.paperInk2, marginTop: 3, fontFamily: T_DT.mono, letterSpacing: '.02em' }}>
                {ex.note}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: T_DT.paperInk, fontFamily: T_DT.mono, fontWeight: 700, textAlign: 'right', letterSpacing: '.04em' }}>
            {ex.sets}×{ex.reps}
            {ex.rir && <div style={{ color: T_DT.paperInk2, marginTop: 2 }}>@ {ex.rir}</div>}
          </div>
        </div>
      ))}
      <div style={{
        padding: '10px 14px', fontSize: 11.5, color: T_DT.paperInk2, fontFamily: T_DT.mono, fontWeight: 700,
        background: 'transparent', borderTop: `1px dashed ${T_DT.paperLine}`,
        letterSpacing: '.14em', textTransform: 'uppercase',
      }}>+ 02 MORE AFTER START</div>
      <BPCrosshair color={T_DT.paperLine2} size={8} style={{ bottom: -4, left: -4 }}/>
      <BPCrosshair color={T_DT.paperLine2} size={8} style={{ bottom: -4, right: -4 }}/>
    </div>
  );
}

// ── Program Detail ─────────────────────────────────────────────────────
function BPProgramDetail() {
  const days = [
    { d: 'M', kind: 'lift' }, { d: 'T', kind: 'lift' }, { d: 'W', kind: 'rest' },
    { d: 'T', kind: 'lift' }, { d: 'F', kind: 'lift' }, { d: 'S', kind: 'cardio' }, { d: 'S', kind: 'rest' },
  ];
  return (
    <BPDetailScaffold
      type="program"
      name="Size & Strength"
      tagline="Compound-driven 4-day split. Get bigger and stronger without overhauling your life."
      mood="strength" price={39} weeks={12} daysPerWeek={4} level="Intermediate" method="Upper / Lower"
      equipment={['Barbell + rack', 'Dumbbells', 'Adjustable bench', 'Cable column (opt.)']}
      whoFor="Lifters with ~6 months of consistent training who want a structured plan. Squat, bench, deadlift, OHP form is in place — this isn't your first program."
      leadVisual={
        <div style={{
          background: 'rgba(255,255,255,.45)',
          border: `1px solid ${T_DT.paperLine2}`,
          padding: '14px 12px 14px', position: 'relative',
        }}>
          <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, left: -4 }}/>
          <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, right: -4 }}/>
          <BPWeekStrip days={days} size="medium" onPaper/>
          <div style={{
            display: 'flex', gap: 14, marginTop: 16, paddingTop: 12,
            borderTop: `1px dashed ${T_DT.paperLine2}`,
            fontSize: 12, color: T_DT.paperInk2, fontFamily: T_DT.mono, fontWeight: 700,
            letterSpacing: '.08em', textTransform: 'uppercase', flexWrap: 'wrap',
          }}>
            {[
              { c: '#FAFDFF', l: 'LIFT ×4' },
              { c: '#90C8FF', l: 'CARDIO ×1' },
              { c: 'transparent', l: 'REST ×2' },
            ].map((k, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: k.c, border: `1px solid ${T_DT.paperInk}` }}/>
                {k.l}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 14 }}>
            {[
              { label: 'ACCUMULATION', sub: 'WK 1–4' },
              { label: 'INTENSIFICATION', sub: 'WK 5–9' },
              { label: 'REALIZATION', sub: 'WK 10–12' },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '8px 10px', background: 'transparent',
                border: `1px solid ${T_DT.paperLine2}`,
              }}>
                <div style={{ fontSize: 10.5, color: T_DT.paperInk2, fontFamily: T_DT.mono, fontWeight: 700, letterSpacing: '.12em' }}>
                  PHASE 0{i+1} · {p.sub}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T_DT.paperInk, marginTop: 6, letterSpacing: 0, fontFamily: T_DT.disp }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
									 										   						   
									 
									   
        </div>
      }
      sample={{
        day: 1, dayName: 'Upper A', summary: 'Push focus · ~55 min',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '5–7', rir: 'RIR 2', note: 'Top set, then 3 back-off' },
          { name: 'DB Overhead Press', sets: 3, reps: '8–10', rir: 'RIR 2' },
          { name: 'Pendlay Row', sets: 4, reps: '6–8', rir: 'RIR 2' },
          { name: 'Lat Pulldown', sets: 3, reps: '10–12', rir: 'RIR 1' },
        ],
      }}
      outcomes={[
        { title: '+15–25 lb on your main lifts', body: 'Bench, OHP, row, and deadlift all progress through the 12-week arc.' },
        { title: 'Visible upper-body size', body: 'Hypertrophy work is built in — most users see meaningful change in 8 weeks.' },
        { title: 'A repeatable training rhythm', body: 'After Week 12 you can re-run, swap into Powerbuilder, or pick a new plan.' },
      ]}
      warnings={[
        "Assumes you can squat and deadlift safely without supervision. If you're less than ~6 months into lifting, Athletic Foundations is a better starting point.",
      ]}
    />
  );
}

// ── Gameplan Detail ────────────────────────────────────────────────────
function BPGameplanDetail() {
  return (
    <BPDetailScaffold
      type="gameplan"
      name="100 lb Bench in 12 Weeks"
      tagline="One number. Twelve weeks. The plan moves with you — deloads, refeeds, weekly check-ins."
      mood="strength" weeks={12} daysPerWeek={4} level="Intermediate" scope="Training + Nutrition"
      equipment={['Barbell + bench', 'Dumbbells', 'Cable column (opt.)', 'Body-weight scale']}
      whoFor="Lifters benching ~75 lb who want a structured push to 100. Comfortable with weekly check-ins. Willing to let calories adapt week to week."
      leadVisual={
        <div style={{
          background: 'rgba(255,255,255,.45)',
          border: `1px solid ${T_DT.paperLine2}`,
          padding: '16px 12px 12px', position: 'relative',
        }}>
          <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, left: -4 }}/>
          <BPCrosshair color={T_DT.paperLine2} size={8} style={{ top: -4, right: -4 }}/>
          <BPGoalArc
            start={{ label: 'WK 0', value: '75 lb' }}
            target={{ label: 'WK 12', value: '100 lb' }}
            milestones={[
              { at: 0.28, label: 'WK 3', value: '82', passed: true },
              { at: 0.55, label: 'WK 7', value: '90' },
              { at: 0.80, label: 'WK 10', value: '95' },
            ]}
            size="medium" alive onPaper
          />
          <div style={{
            marginTop: 14, paddingTop: 10, borderTop: `1px dashed ${T_DT.paperLine2}`,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}>
            {[
              { l: 'CADENCE', v: 'Weekly check-in' },
              { l: 'ADAPTATION', v: 'Calories + volume' },
              { l: 'REFEED', v: '1 day / 2 wks' },
              { l: 'DELOAD', v: 'Wk 4 · Wk 8' },
            ].map((k, i) => (
              <div key={i}>
                <div style={{ fontSize: 10.5, color: T_DT.paperInk2, fontFamily: T_DT.mono, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  {k.l}
                </div>
                <div style={{ fontSize: 13.5, color: T_DT.paperInk, fontWeight: 600, marginTop: 5, letterSpacing: 0, fontFamily: T_DT.disp }}>
                  {k.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      sample={{
        day: 1, dayName: 'Bench Day', summary: 'Primary press + accessories · ~60 min',
        exercises: [
          { name: 'Bench Press', sets: 5, reps: '3–5', rir: 'RIR 1', note: 'Top single, then back-off' },
          { name: 'Close-grip Bench', sets: 3, reps: '6–8', rir: 'RIR 2' },
          { name: 'DB Overhead Press', sets: 3, reps: '8–10', rir: 'RIR 2' },
          { name: 'Cable Tricep Pushdown', sets: 3, reps: '10–12', rir: 'RIR 1' },
        ],
      }}
      outcomes={[
        { title: 'A real shot at 100 lb', body: 'For lifters at ~75 lb today, 12 weeks is achievable with steady adherence — the engine adapts when adherence slips.' },
        { title: 'Calories that move with you', body: 'Stall a week? Targets adjust. Sleep tanks? The plan offers a refeed. You stop guessing.' },
        { title: 'A record of what worked', body: 'Every adaptation, check-in, and apply lives in your history. Useful for the next goal.' },
      ]}
      warnings={[
        'Assumes you currently bench in the 70–80 lb range. Lower than that, the engine will recalibrate at week 1; higher, you may hit the target early and the goal will roll forward.',
        'Calorie adaptations require honest weekly weigh-ins. Skip too many check-ins and recommendations stall.',
      ]}
    />
  );
}

// ── Compare (5.3) ──────────────────────────────────────────────────────
function BPCompareView() {
  const program = BP_SAMPLE_PROGRAMS[0];
  const gameplan = BP_SAMPLE_GAMEPLANS[0];
  const rows = [
    { label: 'TYPE', a: 'Program', b: 'Gameplan' },
    { label: 'COMMITMENT', a: '$39 once', b: '$19 / mo' },
    { label: 'DURATION', a: '12 weeks', b: '12 weeks' },
    { label: 'PER WEEK', a: '4 days', b: '4 days' },
    { label: 'METHOD', a: 'Upper / Lower', b: 'Upper / Lower' },
    { label: 'ADAPTIVE', a: 'No · self-directed', b: 'Yes · weekly', highlight: true },
    { label: 'CHECK-INS', a: '—', b: 'Weekly', highlight: true },
    { label: 'REFEEDS / DELOADS', a: 'Fixed schedule', b: 'Engine-driven', highlight: true },
    { label: 'AFTER CANCEL', a: 'Forever', b: 'Credit applies', highlight: true },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', ...T_DT.gridBg, color: T_DT.paperInk, fontFamily: T_DT.mono }}>
      <BPShelfHeader title="Compare" eyebrow="FT · 5.3" slugRight="A vs B" onBack/>

      {/* Card mini-previews row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        padding: '14px 16px',
        borderBottom: `1px dashed ${T_DT.paperLine2}`,
      }}>
        <BPCompareCardHead {...program} type="program" tag="A"/>
        <BPCompareCardHead {...gameplan} type="gameplan" tag="B"/>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 96 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '118px 1fr 1fr',
            padding: '14px 16px',
            borderTop: i === 0 ? 'none' : `1px dashed ${T_DT.paperLine}`,
            alignItems: 'flex-start', gap: 12, fontFamily: T_DT.mono,
          }}>
            <div style={{
              fontSize: 11, color: T_DT.paperInk2, fontFamily: T_DT.mono, fontWeight: 700,
              letterSpacing: '.16em', textTransform: 'uppercase', paddingTop: 2,
            }}>{r.label}</div>
            <div style={{ fontSize: 13.5, color: r.highlight ? T_DT.paperInk2 : T_DT.paperInk, fontWeight: 600, lineHeight: 1.45, letterSpacing: '.02em' }}>
              {r.a}
            </div>
            <div style={{
              position: 'relative',
              fontSize: 13.5, color: T_DT.paperInk, fontWeight: 700, lineHeight: 1.45, letterSpacing: '.02em',
              ...(r.highlight ? {
                background: 'rgba(116,216,148,.20)',
                padding: '4px 10px',
                margin: '-4px -10px',
                border: `1px dashed ${T_DT.paperInk}`,
              } : {}),
            }}>{r.b}</div>
          </div>
        ))}
      </div>

      {/* Sticky CTAs */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: T_DT.card, borderTop: `1px solid ${T_DT.cardLine3}`,
        padding: '14px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        boxShadow: '0 -2px 14px rgba(19,44,82,.18)',
        fontFamily: T_DT.mono,
      }}>
        <button style={{
          background: 'transparent', border: `1px solid ${T_DT.cardLine3}`,
          padding: '12px 8px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 700, color: T_DT.cardInk,
          letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_DT.mono,
        }}>START SIZE & STRENGTH</button>
        <button style={{
          background: T_DT.accent, color: T_DT.card, border: 'none',
          padding: '12px 8px', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 700,
          letterSpacing: '.10em', textTransform: 'uppercase', fontFamily: T_DT.mono,
        }}>START 100 LB BENCH</button>
      </div>
    </div>
  );
}

function BPCompareCardHead({ name, mood, type, tag }) {
  return (
    <div style={{
      overflow: 'hidden', position: 'relative',
      border: `1px solid ${T_DT.cardLine3}`,
      background: T_DT.card, color: T_DT.cardInk,
      fontFamily: T_DT.mono,
    }}>
      <div style={{ position: 'relative' }}>
        <BPHeroPlaceholder mood={mood} aspect="4:3"/>
        <div style={{
          position: 'absolute', top: 6, left: 6,
          padding: '3px 8px',
          fontFamily: T_DT.mono, fontWeight: 700, fontSize: 11, letterSpacing: '.16em',
          background: T_DT.accent, color: T_DT.card,
          textTransform: 'uppercase',
        }}>{tag}</div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 10.5, color: T_DT.cardInk2, fontFamily: T_DT.mono, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          {type}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T_DT.cardInk, letterSpacing: '-.005em', lineHeight: 1.2, marginTop: 5, fontFamily: T_DT.disp }}>
          {name}
        </div>
      </div>
      <BPCrosshair color={T_DT.cardLine3} size={7} style={{ top: 2, right: 2 }}/>
    </div>
  );
}

Object.assign(window, {
  BPDetailScaffold, BPSection, BPSampleWorkout,
  BPProgramDetail, BPGameplanDetail, BPCompareView, BPCompareCardHead,
});
