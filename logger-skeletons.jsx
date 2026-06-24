// logger-skeletons.jsx — four structural layouts for the Log screen.
// All skeletons use theme-tokens.css tokens so any theme renders them
// correctly. Each skeleton shares the same data (window.SESSION).
//
// A · HorizontalWeeks — baseline: category rail + W1..W4 lanes (REUSES LoggerScreen)
// B · FocusCard       — one exercise fullscreen; exercise pager below; set pips
// C · DenseGrid       — whole session as a compact spreadsheet, big target column,
//                        all sets visible simultaneously, minimal chrome per row
// D · TimerFirst      — active set is a giant hero; upcoming sets are skinny rows
//                        below; rest timer is the centerpiece

const { useState: uS, useMemo: uM } = React;

/* ════════════════════════════════════════════════════════════════
   Shared phone chrome + mini status bar (reused across skeletons)
   ════════════════════════════════════════════════════════════════ */
function MiniHeader({ theme, session, titleOverride }) {
  const titleColor = 'rgb(var(--ft-white))';
  return (
    <div className="ft-on-bg" style={{
      padding: '12px 14px 10px',
      borderBottom: '1px solid rgba(var(--ft-border),.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div className="ft-display" style={{ fontSize: 15, color: titleColor, lineHeight: 1.1 }}>
          {titleOverride || session.day}
        </div>
        <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-muted))', marginTop: 3, letterSpacing: '.15em' }}>
          {session.block.toUpperCase()} · WK {session.currentWeekIdx + 1}/4
        </div>
      </div>
      <span className="ft-stamp">{theme === 'arcade' ? 'LOG' : 'LOG SESSION'}</span>
    </div>
  );
}

function MiniFinish({ theme, done, total, volume, timerSec }) {
  const pct = total ? done / total : 0;
  return (
    <div className="ft-card" style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '8px 14px 12px',
      background: 'rgb(var(--ft-surface))',
      borderTop: '1px solid rgba(var(--ft-border),.5)',
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Stat label="SETS" value={`${done}/${total}`} />
          <Stat label="VOL"  value={`${(volume/1000).toFixed(1)}k`} />
          <Stat label="REST" value={formatSec(timerSec)} accent />
        </div>
        <button style={{
          padding: '7px 14px',
          background: 'rgb(var(--ft-card))',
          border: '1px solid rgb(var(--ft-accent))',
          color: 'rgb(var(--ft-accent))',
          borderRadius: 'var(--ft-radius)',
          fontSize: 10, fontWeight: 700, letterSpacing: '.15em',
          fontFamily: 'inherit', cursor: 'pointer',
        }}>FINISH</button>
      </div>
      <div style={{
        height: 2, background: 'rgba(var(--ft-border),.4)', marginTop: 6,
      }}>
        <div style={{ height: '100%', width: `${pct*100}%`, background: 'rgb(var(--ft-accent))' }} />
      </div>
    </div>
  );
}
function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>{label}</div>
      <div className="ft-data" style={{ fontSize: 13, color: accent ? 'rgb(var(--ft-accent))' : 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}
function formatSec(s) { const m = Math.floor(s/60); return `${m}:${String(s%60).padStart(2,'0')}`; }

function fmtW(w) { return Number.isInteger(w) ? w : w.toFixed(1); }

function sessionStats(session, weekIdx) {
  let done = 0, total = 0, volume = 0;
  for (const lane of session.lanes) {
    for (const s of lane.sets[weekIdx]) {
      total++;
      if (s.done && s.w != null) { done++; volume += s.w * s.r; }
    }
  }
  return { done, total, volume };
}

/* ════════════════════════════════════════════════════════════════
   SKELETON A — HorizontalWeeks (reuses LoggerScreen — just compact)
   ════════════════════════════════════════════════════════════════ */
function SkeletonHorizontalWeeks({ theme, session = window.SESSION }) {
  return (
    <div className="ft" data-theme={theme} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--ft-bg))' }}>
      {theme === 'arcade' && <div className="ft-crt" />}
      <LoggerScreen theme={theme} session={session} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SKELETON B — FocusCard
   One exercise fills most of the screen. Large variant title,
   last-week reference stacked. Three big set targets with inline
   input-ready fields. Bottom: "pager" showing all exercises as dots
   (colored by category); current one is active.
   ════════════════════════════════════════════════════════════════ */
function SkeletonFocusCard({ theme, session = window.SESSION }) {
  const wi = session.currentWeekIdx;
  const [ix, setIx] = uS(2); // pretend we're on lane index 2 (Lateral Delt)
  const lane = session.lanes[ix];
  const prev = wi > 0 ? lane.sets[wi - 1] : null;
  const stats = sessionStats(session, wi);
  const cat = window.CATEGORY_COLOR[lane.category] || 'push';

  return (
    <div className="ft" data-theme={theme} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--ft-bg))', overflow: 'hidden' }}>
      {theme === 'arcade' && <div className="ft-crt" />}
      <MiniHeader theme={theme} session={session} />

      {/* Lane pager dots */}
      <div className="ft-on-bg" style={{
        padding: '10px 14px 6px',
        display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center',
      }}>
        {session.lanes.map((l, i) => {
          const c = window.CATEGORY_COLOR[l.category] || 'push';
          const laneDone = l.sets[wi].every(s => s.done);
          return (
            <button key={l.id} onClick={() => setIx(i)} style={{
              width: i === ix ? 28 : 8, height: 8, borderRadius: 4,
              background: i === ix ? `rgb(var(--ft-${c}))` : laneDone ? `rgb(var(--ft-${c}))` : 'rgba(var(--ft-border),.5)',
              border: 'none', cursor: 'pointer', padding: 0,
              opacity: laneDone && i !== ix ? .45 : 1,
              transition: 'width .2s',
            }} />
          );
        })}
      </div>
      <div className="ft-data ft-on-bg" style={{ textAlign: 'center', fontSize: 10, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>
        EXERCISE {ix + 1} OF {session.lanes.length}
      </div>

      {/* Hero card */}
      <div style={{
        margin: '12px 14px',
        padding: 14,
        background: 'rgb(var(--ft-surface))',
        border: 'var(--ft-card-border)',
        borderRadius: 'var(--ft-radius)',
        position: 'relative',
      }} className="ft-card">
        {/* category tag */}
        <div style={{
          display: 'inline-block', padding: '2px 8px',
          background: `rgb(var(--ft-${cat}))`, color: '#fff',
          fontSize: 9, letterSpacing: '.18em', fontWeight: 700,
          marginBottom: 8, borderRadius: theme === 'lab' ? 3 : 0,
        }}>{lane.category.toUpperCase()}</div>

        {/* Variant */}
        <div className="ft-display" style={{
          fontSize: theme === 'arcade' ? 13 : theme === 'notebook' ? 26 : 20,
          color: 'rgb(var(--ft-white))', lineHeight: 1.15,
        }}>
          {lane.variant} <span style={{ color: 'rgb(var(--ft-muted))', fontSize: '.6em' }}>▾</span>
        </div>

        {/* Target + last */}
        <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(var(--ft-border),.5)' }}>
          <div>
            <div className="ft-data" style={{ fontSize: 9, letterSpacing: '.12em', color: 'rgb(var(--ft-muted))' }}>TARGET</div>
            <div className="ft-data" style={{ fontSize: 18, color: 'rgb(var(--ft-white))', fontWeight: 700 }}>{lane.targetSets}×{lane.targetReps}</div>
            <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-muted))' }}>@{lane.rpeTarget}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="ft-data" style={{ fontSize: 9, letterSpacing: '.12em', color: 'rgb(var(--ft-muted))' }}>LAST WEEK</div>
            {prev && (
              <div className="ft-data" style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                {prev.map((s, i) => (
                  <span key={i} style={{ fontSize: 12, color: 'rgb(var(--ft-light))' }}>
                    {fmtW(s.w)}×{s.r}{i < prev.length - 1 && <span style={{ color: 'rgb(var(--ft-muted))' }}> ·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Big set rows — one per target set */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lane.sets[wi].map((s, i) => {
            const ghost = prev ? prev[i] : null;
            const filled = s.done && s.w != null;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px',
                gap: 8, alignItems: 'center',
                padding: '10px 12px',
                background: filled ? 'rgba(var(--ft-accent),.08)' : 'rgb(var(--ft-card))',
                border: `1px solid ${filled ? 'rgba(var(--ft-accent),.5)' : 'rgba(var(--ft-border),.5)'}`,
                borderRadius: 'var(--ft-radius)',
              }}>
                <div className="ft-data" style={{ fontSize: 11, color: 'rgb(var(--ft-muted))', letterSpacing: '.1em' }}>SET {i+1}</div>
                <div>
                  <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))' }}>WEIGHT</div>
                  <div className="ft-data" style={{ fontSize: 18, color: filled ? 'rgb(var(--ft-white))' : 'rgba(var(--ft-muted),.7)', fontWeight: 700 }}>
                    {filled ? fmtW(s.w) : ghost ? fmtW(ghost.w) : '—'}
                    <span style={{ fontSize: 10, marginLeft: 3, opacity: .6 }}>lb</span>
                  </div>
                </div>
                <div>
                  <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))' }}>REPS</div>
                  <div className="ft-data" style={{ fontSize: 18, color: filled ? 'rgb(var(--ft-white))' : 'rgba(var(--ft-muted),.7)', fontWeight: 700 }}>
                    {filled ? s.r : ghost ? ghost.r : '—'}
                  </div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `1.5px solid ${filled ? 'rgb(var(--ft-accent))' : 'rgba(var(--ft-border),.6)'}`,
                  background: filled ? 'rgb(var(--ft-accent))' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: filled ? (theme === 'arcade' ? '#000' : '#fff') : 'rgb(var(--ft-muted))',
                }}>
                  {filled ? (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 L6.5 12 L13 5"/></svg>
                  ) : <span style={{ fontSize: 14 }}>+</span>}
                </div>
              </div>
            );
          })}
          {/* Add-set affordance — only when below skeleton-wide cap */}
          {lane.sets[wi].length < 6 && (
            <button style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr 40px',
              gap: 8, alignItems: 'center',
              padding: '10px 12px',
              background: 'transparent',
              border: '1px dashed rgb(var(--ft-border) / .6)',
              borderRadius: 'var(--ft-radius)',
              color: 'rgb(var(--ft-muted))',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div className="ft-data" style={{ fontSize: 11, letterSpacing: '.1em' }}>+</div>
              <div className="ft-data" style={{
                fontSize: 11, letterSpacing: '.18em',
                textTransform: theme === 'notebook' ? 'none' : 'uppercase',
                fontFamily: theme === 'notebook' ? "'Caveat', cursive" : 'inherit',
                fontSize: theme === 'notebook' ? 16 : 11,
                textAlign: 'left',
              }}>{theme === 'notebook' ? 'add a set' : 'ADD SET'}</div>
              <div />
            </button>
          )}
        </div>
      </div>

      {/* Nav between exercises */}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 72,
        display: 'flex', gap: 8,
      }}>
        <button onClick={() => setIx(Math.max(0, ix - 1))} style={navBtn(theme)} disabled={ix === 0}>← PREV</button>
        <button onClick={() => setIx(Math.min(session.lanes.length - 1, ix + 1))} style={{ ...navBtn(theme), background: 'rgb(var(--ft-accent))', color: theme === 'arcade' ? '#000' : '#fff', borderColor: 'rgb(var(--ft-accent))' }}>
          NEXT →
        </button>
      </div>

      <MiniFinish theme={theme} done={stats.done} total={stats.total} volume={stats.volume} timerSec={session.restRemaining} />
    </div>
  );
}
function navBtn(theme) {
  return {
    flex: 1, padding: '10px', cursor: 'pointer',
    background: 'rgb(var(--ft-card))',
    border: '1px solid rgba(var(--ft-border),.6)',
    color: 'rgb(var(--ft-white))',
    borderRadius: 'var(--ft-radius)',
    fontSize: 11, fontWeight: 700, letterSpacing: '.15em',
    fontFamily: 'inherit',
  };
}

/* ════════════════════════════════════════════════════════════════
   SKELETON C — DenseGrid (literal spreadsheet on a phone)
   Minimal chrome. Row = exercise. Columns = sets 1–N + Target.
   Category color is the left-edge stripe (constant per row).
   Emphasizes "see everything at once."
   ════════════════════════════════════════════════════════════════ */
function SkeletonDenseGrid({ theme, session = window.SESSION }) {
  const wi = session.currentWeekIdx;
  const stats = sessionStats(session, wi);

  // Skeleton-wide column system: capacity for up to 6 sets per row,
  // plus a trailing "+" cell for adding more. Empty cells render as ·
  // placeholders so the grid stays a literal spreadsheet across all lanes.
  const MAX_SETS = 6;
  // narrower set cells than before — must fit MAX_SETS + add column.
  // Exercise/target columns trim a bit so set columns stay legible.
  const exerciseCol = theme === 'arcade' ? 78 : 70;
  const tgtCol = 30;
  const addCol = 24;
  const setCols = Array(MAX_SETS).fill('1fr').join(' ');
  const gridCols = `4px ${exerciseCol}px ${tgtCol}px ${setCols} ${addCol}px`;
  const isNotebook = theme === 'notebook';

  return (
    <div className="ft" data-theme={theme} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--ft-bg))', overflow: 'hidden' }}>
      {theme === 'arcade' && <div className="ft-crt" />}
      <MiniHeader theme={theme} session={session} />

      {/* Column headers */}
      <div className="ft-on-bg" style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: 0,
        padding: '8px 10px 6px',
        borderBottom: '1px solid rgba(var(--ft-border),.4)',
      }}>
        <div />
        <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>EXERCISE</div>
        <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em', textAlign: 'center' }}>TGT</div>
        {Array.from({ length: MAX_SETS }, (_, n) => n + 1).map(i => (
          <div key={i} className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.06em', textAlign: 'center' }}>
            {i}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      <div style={{
        position: 'absolute', top: 76, left: 0, right: 0, bottom: 62,
        overflowY: 'auto',
      }}>
        {session.lanes.map((lane, rowIdx) => {
          const cat = window.CATEGORY_COLOR[lane.category] || 'push';
          const todaySets = lane.sets[wi];
          const prev = wi > 0 ? lane.sets[wi - 1] : null;
          const canAdd = todaySets.length < MAX_SETS;
          return (
            <div key={lane.id} className="ft-on-bg" style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: 0,
              borderBottom: '1px solid rgba(var(--ft-border),.35)',
              minHeight: theme === 'arcade' ? 88 : 62,
              background: rowIdx % 2 ? 'transparent' : 'rgba(var(--ft-card),.25)',
              alignItems: 'stretch',
            }}>
              {/* Category color edge */}
              <div className={`ft-bg-${cat}`} />

              {/* Exercise column */}
              <div style={{ padding: '8px 6px 8px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Per-theme category label:
                    - Arcade: Press Start 2P, 7px, neon
                    - Notebook: Caveat chip — small handwritten pill so it's visible at row scale
                    - All others: 8px tracked-out tag in category color */}
                {theme === 'arcade' ? (
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 7,
                    color: `rgb(var(--ft-${cat}))`,
                    letterSpacing: 0,
                    lineHeight: 1.4,
                    textShadow: '1px 1px 0 rgba(0,240,255,.4)',
                  }}>{lane.category.toUpperCase()}</div>
                ) : isNotebook ? (
                  <div className={`ft-bg-${cat}`} style={{
                    display: 'inline-block',
                    alignSelf: 'flex-start',
                    padding: '0 7px 1px',
                    fontFamily: "'Caveat', cursive",
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    borderRadius: 10,
                    transform: 'rotate(-1.2deg)',
                    lineHeight: 1.2,
                    marginBottom: 1,
                  }}>{lane.category.toLowerCase()}</div>
                ) : (
                  <div className="ft-data" style={{
                    fontSize: 8, color: `rgb(var(--ft-${cat}))`,
                    letterSpacing: '.15em', fontWeight: 700,
                  }}>{lane.category.toUpperCase()}</div>
                )}
                {/* Variant uses VT323 in arcade (readable bitmap mono),
                    Press Start 2P would be unreadable below ~10px. */}
                <div style={{
                  fontFamily: theme === 'arcade'
                    ? "'VT323', monospace"
                    : 'var(--ft-font-display)',
                  fontSize: theme === 'arcade' ? 16 : isNotebook ? 14 : 11,
                  fontWeight: theme === 'arcade' ? 400 : 600,
                  color: 'rgb(var(--ft-white))',
                  lineHeight: theme === 'arcade' ? 1.05 : 1.2,
                  marginTop: theme === 'arcade' ? 4 : 2,
                  letterSpacing: theme === 'arcade' ? '.02em' : 0,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: theme === 'arcade' ? 3 : 2, WebkitBoxOrient: 'vertical',
                }}>{lane.variant.split(' — ')[1] || lane.variant}</div>
              </div>

              {/* Target column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed rgba(var(--ft-border),.35)' }}>
                <div className="ft-data" style={{ fontSize: 11, color: 'rgb(var(--ft-light))', fontWeight: 700, lineHeight: 1 }}>{lane.targetSets}×</div>
                <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-dim))', lineHeight: 1, marginTop: 1 }}>{lane.targetReps}</div>
              </div>

              {/* Set cells — always render MAX_SETS columns. Past the
                  lane's actual length, render an inert empty placeholder
                  so the grid stays aligned with the header row. */}
              {Array.from({ length: MAX_SETS }, (_, i) => {
                const s = todaySets[i];
                const filled = s && s.done && s.w != null;
                const ghost = prev ? prev[i] : null;
                const isPotential = !s; // beyond logged-set count
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderLeft: '1px solid rgba(var(--ft-border),.35)',
                    background: filled ? 'rgba(var(--ft-accent),.08)' : 'transparent',
                    opacity: isPotential ? .5 : 1,
                    position: 'relative',
                  }}>
                    {filled ? (
                      <>
                        <div className="ft-data" style={{ fontSize: theme === 'arcade' ? 22 : 14, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>{fmtW(s.w)}</div>
                        <div className="ft-data" style={{ fontSize: theme === 'arcade' ? 14 : 9, color: 'rgb(var(--ft-dim))', marginTop: theme === 'arcade' ? 2 : 0 }}>×{s.r}</div>
                      </>
                    ) : ghost && ghost.w != null && !isPotential ? (
                      <>
                        <div className="ft-data" style={{ fontSize: theme === 'arcade' ? 18 : 12, color: 'rgba(var(--ft-muted),.75)', lineHeight: 1 }}>{fmtW(ghost.w)}</div>
                        <div className="ft-data" style={{ fontSize: theme === 'arcade' ? 13 : 9, color: 'rgba(var(--ft-muted),.65)', marginTop: theme === 'arcade' ? 2 : 0 }}>×{ghost.r}</div>
                      </>
                    ) : (
                      <span style={{ fontSize: theme === 'arcade' ? 18 : 12, color: 'rgba(var(--ft-muted),.4)' }}>·</span>
                    )}
                  </div>
                );
              })}

              {/* Add-set column — clickable + when room remains, otherwise empty */}
              <button disabled={!canAdd} style={{
                borderLeft: '1px solid rgba(var(--ft-border),.35)',
                background: 'transparent',
                border: 'none',
                borderLeftWidth: 1, borderLeftStyle: 'solid',
                borderLeftColor: 'rgba(var(--ft-border),.35)',
                color: canAdd ? 'rgb(var(--ft-muted))' : 'rgba(var(--ft-muted),.25)',
                cursor: canAdd ? 'pointer' : 'default',
                fontSize: 14, fontFamily: 'inherit',
                padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {canAdd ? '+' : ''}
              </button>
            </div>
          );
        })}
      </div>

      <MiniFinish theme={theme} done={stats.done} total={stats.total} volume={stats.volume} timerSec={session.restRemaining} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SKELETON D — TimerFirst
   The active set is a huge card with the rest timer countdown.
   Upcoming sets are thin rows below. Completed sets are a single
   strip at top. The moment-of-effort is the UI.
   ════════════════════════════════════════════════════════════════ */
function SkeletonTimerFirst({ theme, session = window.SESSION }) {
  const wi = session.currentWeekIdx;
  // Pretend we just finished set 1 of lane index 2 (Lateral Delt): resting.
  const activeLaneIx = 2;
  const activeSetIdx = 1;
  const lane = session.lanes[activeLaneIx];
  const prev = wi > 0 ? lane.sets[wi - 1] : null;
  const cat = window.CATEGORY_COLOR[lane.category] || 'push';
  const stats = sessionStats(session, wi);

  // Flatten remaining queue (this lane's remaining sets, then next lanes' sets)
  const queue = [];
  for (let i = activeSetIdx + 1; i < lane.sets[wi].length; i++) {
    queue.push({ lane, setIdx: i, same: true });
  }
  for (let li = activeLaneIx + 1; li < session.lanes.length; li++) {
    const l = session.lanes[li];
    for (let i = 0; i < l.sets[wi].length; i++) queue.push({ lane: l, setIdx: i });
  }

  // Timer simulation
  const total = 90;
  const remaining = session.restRemaining;
  const pct = 1 - remaining / total;

  return (
    <div className="ft" data-theme={theme} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--ft-bg))', overflow: 'hidden' }}>
      {theme === 'arcade' && <div className="ft-crt" />}
      <MiniHeader theme={theme} session={session} />

      {/* Completed summary strip */}
      <div className="ft-on-bg" style={{
        padding: '8px 14px', display: 'flex', gap: 6, alignItems: 'center',
        borderBottom: '1px solid rgba(var(--ft-border),.35)',
      }}>
        <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.15em' }}>DONE</div>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {/* show first 2 lanes as completed dots */}
          {session.lanes.slice(0, activeLaneIx).flatMap((l, li) => l.sets[wi].map((s, si) => (
            <div key={`${li}-${si}`} style={{
              width: 14, height: 14, borderRadius: 2,
              background: `rgb(var(--ft-${window.CATEGORY_COLOR[l.category] || 'push'}))`,
              opacity: .8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 8,
            }}>
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 L6.5 12 L13 5"/></svg>
            </div>
          )))}
          {/* current lane's completed set */}
          <div style={{
            width: 14, height: 14, borderRadius: 2,
            background: `rgb(var(--ft-${cat}))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 L6.5 12 L13 5"/></svg>
          </div>
        </div>
        <div className="ft-data" style={{ fontSize: 11, color: 'rgb(var(--ft-white))', fontWeight: 700 }}>{stats.done}/{stats.total}</div>
      </div>

      {/* Hero rest timer */}
      <div style={{
        margin: '14px 14px 10px',
        padding: '18px 14px 16px',
        background: 'rgb(var(--ft-surface))',
        border: 'var(--ft-card-border)',
        borderRadius: 'var(--ft-radius)',
        position: 'relative',
      }} className="ft-card">
        {/* Category + done set */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{
            display: 'inline-block', padding: '2px 8px',
            background: `rgb(var(--ft-${cat}))`, color: '#fff',
            fontSize: 9, letterSpacing: '.18em', fontWeight: 700,
            borderRadius: theme === 'lab' ? 3 : 0,
          }}>{lane.category.toUpperCase()}</div>
          <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>
            JUST FINISHED · SET {activeSetIdx}
          </div>
        </div>
        <div className="ft-display" style={{
          fontSize: theme === 'arcade' ? 12 : theme === 'notebook' ? 22 : 17,
          color: 'rgb(var(--ft-white))', marginBottom: 14,
          lineHeight: 1.15,
        }}>
          {lane.variant}
        </div>

        {/* Countdown ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(var(--ft-border),.4)" strokeWidth="6" />
              <circle cx="55" cy="55" r="48" fill="none" stroke="rgb(var(--ft-accent))" strokeWidth="6"
                strokeDasharray={Math.PI * 2 * 48}
                strokeDashoffset={Math.PI * 2 * 48 * pct}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div className="ft-data" style={{ fontSize: theme === 'arcade' ? 22 : 32, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
                {formatSec(remaining)}
              </div>
              <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.15em', marginTop: 2 }}>REST</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>LAST SET</div>
            <div className="ft-data" style={{ fontSize: 26, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
              {prev && prev[activeSetIdx-1] ? `${fmtW(lane.sets[wi][activeSetIdx-1].w || prev[activeSetIdx-1].w)}×${lane.sets[wi][activeSetIdx-1].r || prev[activeSetIdx-1].r}` : '—'}
            </div>
            <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-dim))', marginTop: 2 }}>
              target next: <span style={{ color: 'rgb(var(--ft-accent))' }}>{lane.targetSets}×{lane.targetReps} @{lane.rpeTarget}</span>
            </div>
          </div>
        </div>

        {/* Start next set button */}
        <button style={{
          width: '100%', padding: '12px',
          background: 'rgb(var(--ft-accent))',
          border: '1px solid rgb(var(--ft-accent))',
          color: theme === 'arcade' ? '#000' : '#fff',
          borderRadius: 'var(--ft-radius)',
          fontSize: 12, fontWeight: 700, letterSpacing: '.15em',
          fontFamily: 'inherit', cursor: 'pointer',
        }}>LOG SET {activeSetIdx + 1} →</button>
      </div>

      {/* Upcoming queue */}
      <div className="ft-on-bg" style={{
        position: 'absolute', left: 14, right: 14, top: 380, bottom: 62,
        overflowY: 'auto',
      }}>
        <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.15em', marginBottom: 6 }}>
          UP NEXT · {queue.length} SETS
        </div>
        {queue.slice(0, 8).map((q, i) => {
          const qcat = window.CATEGORY_COLOR[q.lane.category] || 'push';
          const qprev = wi > 0 ? q.lane.sets[wi-1][q.setIdx] : null;
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '4px 1fr 68px',
              gap: 10, alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid rgba(var(--ft-border),.25)',
            }}>
              <div className={`ft-bg-${qcat}`} style={{ height: 24 }} />
              <div>
                <div className="ft-data" style={{ fontSize: 8, color: `rgb(var(--ft-${qcat}))`, letterSpacing: '.15em', fontWeight: 700 }}>
                  {q.lane.category.toUpperCase()} · SET {q.setIdx + 1}
                </div>
                <div style={{
                  fontFamily: 'inherit', fontSize: theme === 'arcade' ? 9 : 12, color: 'rgb(var(--ft-light))',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {q.lane.variant.split(' — ')[1] || q.lane.variant}
                </div>
              </div>
              <div className="ft-data" style={{ fontSize: 11, color: 'rgb(var(--ft-dim))', textAlign: 'right' }}>
                {qprev && qprev.w != null ? `${fmtW(qprev.w)}×${qprev.r}` : `${q.lane.targetSets}×${q.lane.targetReps}`}
              </div>
            </div>
          );
        })}
      </div>

      <MiniFinish theme={theme} done={stats.done} total={stats.total} volume={stats.volume} timerSec={remaining} />
    </div>
  );
}

Object.assign(window, {
  SkeletonHorizontalWeeks,
  SkeletonFocusCard,
  SkeletonDenseGrid,
  SkeletonTimerFirst,
});
