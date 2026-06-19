// training-logger-screen.jsx
// 2.2 Training Tab (Logger) — /training, bottom-nav slot 2.
//
// A Logger has no program, so this is NOT the scheduled "today" screen the
// Program/Gameplan tiers get. It's the *launchpad* — the do-it-now surface,
// distinct from 2.1 Workouts Library (the collection/archive). Everything here
// answers "start training right now":
//
//   1. Resume card    — only when a session is mid-flight (tweakable)
//   2. Start hero      — begin an empty freestyle session (the core Logger act)
//   3. Repeat          — horizontal scroller of recent sessions, one-tap reload
//   4. Ways to log     — Lift / HIIT / LISS / Class / Stretch / Custom loggers
//   5. Saved frames    — compact launch row, "All" links to the Library
//   6. Structure upsell— a single locked "Train on a plan" preview. Medium
//                        weight, factual. Per CLAUDE.md: structure is never a
//                        gate, no dramatized framing.
//
// All chrome reads tokens from useFitTrackTheme(theme) via the `T` prop; the
// host swaps theme through the Tweaks panel so every variant flows through one
// source of truth. Reuses global primitives from tier-homes-screens.jsx
// (Card, Button, Chip, Stamp, Header, ErrorBanner, RecentWorkoutCard). Locals
// are TL-prefixed to avoid colliding with that file's top-level globals.

// ── On-bg section label (Blueprint-safe — sits on the page bg) ────────────
function TLSectionLabel({ T, children, right }) {
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div className="ft-on-bg" style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '18px 16px 8px',
    }}>
      <div style={{
        fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700,
        color: onBg, letterSpacing: '.1em', textTransform: 'uppercase',
      }}>{children}</div>
      {right && (
        <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBgTer }}>{right}</span>
      )}
    </div>
  );
}

// ── Tiny line glyphs for the "ways to log" tiles ──────────────────────────
// All simple geometric paths, in the same spirit as the rest of the kit.
function TLTypeGlyph({ kind, size = 20, color = 'currentColor' }) {
  const s = {
    width: size, height: size, stroke: color, strokeWidth: 1.7, fill: 'none',
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (kind) {
    case 'lift': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>
    );
    case 'hiit': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M4 15v4M9 9v10M14 12v7M19 5v14"/></svg>
    );
    case 'liss': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M3 13c3 0 3-5 6-5s3 5 6 5 3-5 6-5"/></svg>
    );
    case 'class': return (
      <svg {...s} viewBox="0 0 24 24"><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 20a5 5 0 0 1 10 0M13 20a5 5 0 0 1 8-4"/></svg>
    );
    case 'stretch': return (
      <svg {...s} viewBox="0 0 24 24"><path d="M4 19a8 8 0 0 1 16 0"/><circle cx="12" cy="6" r="2.4"/></svg>
    );
    case 'custom': return (
      <svg {...s} viewBox="0 0 24 24" strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>
    );
    default: return null;
  }
}

// ── Resume card — only when a session is in progress ──────────────────────
function TLResumeCard({ T }) {
  return (
    <div style={{ padding: '4px 16px 0' }}>
      <Card T={T} raised style={{
        padding: '12px 14px',
        borderColor: T.accentBorder,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            flexShrink: 0, width: 40, height: 40, borderRadius: T.radiusMd || 8,
            background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: 999, background: T.accent,
              boxShadow: `0 0 0 4px ${T.accentFaint}`,
            }}/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Chip T={T} tone="accent" size="sm">In progress</Chip>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.text,
              lineHeight: 1.2, marginTop: 5,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>Upper · Push</div>
          </div>
          <Button T={T} kind="primary" size="sm">Resume →</Button>
        </div>
        <div style={{
          fontFamily: T.fontData, fontSize: 11, color: T.textTer,
          letterSpacing: '.04em', marginTop: 10,
          borderTop: `1px solid ${T.borderFaint || T.border}`, paddingTop: 9,
        }}>3 of 5 lifts · 8 sets · 18 min</div>
      </Card>
    </div>
  );
}

// ── Start hero — begin an empty freestyle session ─────────────────────────
function TLStartHero({ T, lastLine }) {
  return (
    <div style={{ padding: '12px 16px 0' }}>
      <Card T={T} raised style={{ padding: '16px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: T.radiusMd || 8,
            background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <TLTypeGlyph kind="lift" size={24} color={T.accent}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stamp T={T}>Freestyle</Stamp>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: 21, fontWeight: 700, color: T.text,
              marginTop: 3, lineHeight: 1.1, letterSpacing: '-.01em',
            }}>New workout</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 3, lineHeight: 1.4 }}>
              {lastLine}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>Start workout →</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Ways to log — the workout-type launchers ──────────────────────────────
function TLTypeTile({ T, kind, label, meta }) {
  return (
    <Card T={T} onClick={() => {}} style={{
      padding: '13px 13px 14px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 9,
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: T.radiusMd || 8,
        background: T.surfaceAlt, color: T.textSec,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <TLTypeGlyph kind={kind} size={19} color={T.textSec}/>
      </span>
      <div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.15,
        }}>{label}</div>
        <div style={{
          fontFamily: T.fontData, fontSize: 10, color: T.textTer,
          letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 3,
        }}>{meta}</div>
      </div>
    </Card>
  );
}

function TLWaysToLog({ T, narrow }) {
  const types = [
    { kind: 'lift',    label: 'Lift',    meta: 'Weights' },
    { kind: 'hiit',    label: 'HIIT',    meta: 'Intervals' },
    { kind: 'liss',    label: 'Cardio',  meta: 'Steady' },
    { kind: 'class',   label: 'Class',   meta: 'Group' },
    { kind: 'stretch', label: 'Stretch', meta: 'Mobility' },
    { kind: 'custom',  label: 'Custom',  meta: 'Blank' },
  ];
  return (
    <>
      <TLSectionLabel T={T} right="6 loggers">Ways to log</TLSectionLabel>
      <div style={{
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: narrow ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: 10,
      }}>
        {types.map((t) => <TLTypeTile key={t.kind} T={T} {...t}/>)}
      </div>
    </>
  );
}

// ── Saved frames — compact launch row (full grid lives in 2.1 Library) ────
function TLFrameRow({ T, label, meta }) {
  return (
    <Card T={T} onClick={() => {}} style={{
      padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: T.radiusSm || 4,
        background: T.accentFaint, color: T.accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>{label.charAt(0)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.04em', marginTop: 1 }}>{meta}</div>
      </div>
      <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent, whiteSpace: 'nowrap' }}>Start →</span>
    </Card>
  );
}

function TLSavedFrames({ T }) {
  return (
    <>
      <TLSectionLabel T={T} right="All →">Saved frames</TLSectionLabel>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TLFrameRow T={T} label="Push Day A"  meta="5 lifts · barbell · used 9×"/>
        <TLFrameRow T={T} label="Pull Day A"  meta="5 lifts · cable + db · used 7×"/>
        <TLFrameRow T={T} label="Lower Heavy" meta="4 lifts · barbell · used 6×"/>
      </div>
    </>
  );
}

// ── Structure upsell — single locked "Train on a plan" preview ────────────
// Medium weight. Factual feature list, no persuasion. The week-strip preview
// is faded + a lock chip marks it as a Program-tier surface.
function TLStructureUpsell({ T }) {
  const days = [
    { d: 'M', on: true }, { d: 'T', on: true }, { d: 'W', on: false },
    { d: 'T', on: true }, { d: 'F', on: true }, { d: 'S', on: false }, { d: 'S', on: false },
  ];
  return (
    <>
      <TLSectionLabel T={T}>Structure</TLSectionLabel>
      <div style={{ padding: '0 16px 4px' }}>
        <Card T={T} style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Stamp T={T}>Program · Gameplan</Stamp>
            <Chip T={T} tone="neutral" size="sm">Locked</Chip>
          </div>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text,
            marginTop: 6, lineHeight: 1.15, letterSpacing: '-.01em',
          }}>Train on a plan</div>

          {/* faded week-strip preview */}
          <div style={{ display: 'flex', gap: 5, marginTop: 12, opacity: .5, pointerEvents: 'none' }}>
            {days.map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 40, borderRadius: T.radiusSm || 4,
                background: d.on ? T.accent : T.surfaceAlt,
                border: d.on ? 'none' : `1px dashed ${T.borderFaint}`,
                color: d.on ? T.textOnAccent : T.textTer,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontData, fontSize: 10, fontWeight: 700,
              }}>{d.d}</div>
            ))}
          </div>

          <div style={{
            marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {['Pre-built blocks with progression', "Today's session picked for you", 'Nutrition plans, recipes, grocery'].map((f) => (
              <div key={f} style={{
                fontFamily: T.fontBody, fontSize: 12, color: T.textSec,
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ color: T.accent, marginTop: 1 }}>·</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Button T={T} kind="primary" size="md" style={{ flex: 1 }}>See Programs →</Button>
            <Button T={T} kind="secondary" size="md" style={{ flexShrink: 0 }}>Compare</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

// ── Quiet placeholder for the empty state's history slots ─────────────────
function TLHistoryPlaceholder({ T }) {
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div style={{ padding: '4px 16px 0' }}>
      <div style={{
        padding: '18px 16px', borderRadius: T.radiusLg || 10,
        border: `1px dashed ${T.border}`, background: 'transparent',
        textAlign: 'center',
      }}>
        <div className="ft-on-bg" style={{
          fontFamily: T.fontBody, fontSize: 12, color: onBgTer, lineHeight: 1.5,
        }}>
          Recent sessions and saved frames appear here once you log one.
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
function TrainingLoggerScreen({ T, state = 'default', tweaks = {}, railMode = 'rail', onSetRailMode }) {
  const { showResume = true, showUpsell = true } = tweaks;
  const isEmpty = state === 'empty';
  const railShown = railMode !== 'chip';
  const setMode = onSetRailMode || (() => {});

  const content = (
    <>
      {state === 'error' && (
        <ErrorBanner T={T}
          title="Drive sync paused"
          body="Last sync 2 hours ago. New sessions still save locally."
          action="Retry"/>
      )}

      {!isEmpty && showResume && <TLResumeCard T={T}/>}

      <TLStartHero T={T}
        lastLine={isEmpty ? 'Add lifts as you go · saved on this device' : 'Last workout · Full body · 6d ago'}/>

      {isEmpty ? (
        <>
          <TLWaysToLog T={T}/>
          <TLHistoryPlaceholder T={T}/>
        </>
      ) : (
        <>
          <TLSectionLabel T={T} right="Last 14 days">Repeat</TLSectionLabel>
          <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto' }}>
            <RecentWorkoutCard T={T} day="YESTERDAY"   name="Upper · Push"  lifts="Bench · OHP · Lat raise" dur="52 MIN"/>
            <RecentWorkoutCard T={T} day="MON · 3 AGO" name="Lower · Heavy" lifts="Squat · RDL · Calf"       dur="61 MIN"/>
            <RecentWorkoutCard T={T} day="SAT · 5 AGO" name="Pull · Volume" lifts="Pulldown · Row · Curl"    dur="44 MIN"/>
          </div>

          <TLWaysToLog T={T}/>
          <TLSavedFrames T={T}/>
        </>
      )}

      {showUpsell && <TLStructureUpsell T={T}/>}
    </>
  );

  // Canonical pillar layout (CLAUDE.md mandate) — the same PillarShell logger,
  // program + gameplan all render through. Logger tier locks Block/Program/Gameplan.
  return (
    <PillarShell
      T={T} pillar="training" tier="logger" activeKey="today"
      railMode={railMode} onSetRailMode={onSetRailMode}
      header={<Header T={T} kind="home" title="Training" subtitle="Logger"/>}>
      {content}
    </PillarShell>
  );
}

Object.assign(window, {
  TrainingLoggerScreen,
  TLSectionLabel, TLTypeGlyph, TLResumeCard, TLStartHero,
  TLWaysToLog, TLTypeTile, TLSavedFrames, TLFrameRow, TLStructureUpsell,
  TLHistoryPlaceholder,
});
