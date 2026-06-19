// logger-app.jsx — the Log Workout screen, renderable in any FitTrack theme.
// Components are theme-agnostic; all chrome comes from theme-tokens.css.
//
// Structure (top to bottom on mobile frame):
//   ThemeHeader    — title + block/day + week strip
//   WeekHeader     — W1 W2 W3 [W4 active] swipe indicator
//   LaneList       — N lanes, each = [category rail][lane body]
//   FinishBar      — sticky: progress, volume, timer, FINISH
//   TabNav         — 5 icons, faded in-session
//   SetSheet       — half-sheet overlay with number pad
//
// The design intentionally mirrors the spreadsheet: a lane IS a row of the
// sheet, set cells ARE empty rectangles to be filled, weeks march rightward.

const { useState, useRef, useEffect, useMemo } = React;

/* ────────────────────── small atoms ────────────────────── */

function CategoryDot({ cat }) {
  return <span className={`ft-cat-dot ft-bg-${cat}`} />;
}

function ThemeStamp({ children, className = '' }) {
  return <span className={`ft-stamp ${className}`}>{children}</span>;
}

function IconChevron({ dir = 'down', size = 12 }) {
  const d = {
    down:  'M3 5 L8 10 L13 5',
    up:    'M3 10 L8 5 L13 10',
    left:  'M10 3 L5 8 L10 13',
    right: 'M6 3 L11 8 L6 13',
  }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function IconTarget({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="8" cy="8" r="6.2" />
      <circle cx="8" cy="8" r="3.3" />
      <circle cx="8" cy="8" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5c.5 2.2 2.5 3 2.5 5.2 0 1-.6 1.8-1.4 2.2.5-.3.8-.9.8-1.6 0-1.4-1-1.6-1.5-3.1-.3 1.3-2.2 2.3-2.2 4.8 0 2.3 1.7 3.5 3.5 3.5S13 11.1 13 8.7c0-2.9-2.6-3.7-5-7.2z" />
    </svg>
  );
}

function IconCheck({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 L6.5 12 L13 5" />
    </svg>
  );
}

/* ────────────────────── header ────────────────────── */

function ThemeHeader({ theme, session }) {
  if (theme === 'iron') {
    return (
      <div className="ft-header" style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(200,169,110,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="ft-display" style={{ fontSize: 20, lineHeight: 1, color: 'rgb(var(--ft-pale))' }}>{session.day.toUpperCase()}</div>
            <div style={{ fontSize: 11, letterSpacing: '.22em', color: 'rgb(var(--ft-muted))', marginTop: 4 }}>
              {session.block.toUpperCase()} · W{session.currentWeekIdx + 1}
            </div>
          </div>
          <ThemeStamp>IRON · CHALK</ThemeStamp>
        </div>
      </div>
    );
  }
  if (theme === 'lab') {
    return (
      <div className="ft-header" style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgb(var(--ft-border))', background: 'rgb(var(--ft-surface))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="ft-stamp" style={{ marginBottom: 4 }}>SPECIMEN · FT-2026-0224-01</div>
            <div className="ft-display" style={{ fontSize: 18, lineHeight: 1.15, color: 'rgb(var(--ft-white))' }}>{session.day}</div>
            <div className="ft-data" style={{ fontSize: 11, color: 'rgb(var(--ft-dim))', marginTop: 3 }}>
              {session.block} · week {session.currentWeekIdx + 1}/4 · {session.dateLabel}
            </div>
          </div>
          <div className="ft-barcode" style={{ width: 64 }} />
        </div>
      </div>
    );
  }
  if (theme === 'notebook') {
    return (
      <div className="ft-header" style={{ padding: '18px 16px 10px', position: 'relative' }}>
        <div className="ft-display" style={{ fontSize: 32, lineHeight: 1, color: 'rgb(var(--ft-accent))' }}>
          {session.day.split('·')[0].trim()}
        </div>
        <div style={{ fontSize: 15, color: 'rgb(var(--ft-light))', marginTop: 2, fontFamily: 'Patrick Hand' }}>
          {session.block} — week {session.currentWeekIdx + 1} of 4 · {session.dateLabel}
        </div>
        <div style={{
          position: 'absolute', top: 8, right: 14,
          fontFamily: 'Caveat', fontSize: 20, color: 'rgb(var(--ft-accent))',
          transform: 'rotate(-4deg)', border: '1.5px solid rgb(var(--ft-accent))',
          padding: '1px 10px 2px', borderRadius: 20,
        }}>log!</div>
      </div>
    );
  }
  if (theme === 'arcade') {
    return (
      <div className="ft-header" style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,80,200,.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ThemeStamp style={{ color: 'rgb(var(--ft-cyan))' }}>1P</ThemeStamp>
          <div className="ft-display" style={{ fontSize: 12, color: 'rgb(var(--ft-white))' }}>LOG SESSION</div>
          <ThemeStamp style={{ color: 'rgb(var(--ft-accent))' }}>HI 999999</ThemeStamp>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div className="ft-data" style={{ fontSize: 14, color: 'rgb(var(--ft-cyan))' }}>
            {session.day.toUpperCase().replace(/·/g, '//')}
          </div>
          <div className="ft-data" style={{ fontSize: 13, color: 'rgb(var(--ft-accent))' }}>
            WK {session.currentWeekIdx + 1}/4
          </div>
        </div>
      </div>
    );
  }

  // Fallback for blueprint / cyberpunk / graffiti — generic but theme-aware via tokens
  return (
    <div className="ft-header" style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(var(--ft-border),.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="ft-display" style={{ fontSize: theme === 'blueprint' ? 16 : 18, color: 'rgb(var(--ft-white))', lineHeight: 1.1 }}>
            {theme === 'blueprint' ? session.day.toLowerCase() : session.day}
          </div>
          <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-muted))', marginTop: 4, letterSpacing: '.18em' }}>
            {session.block.toUpperCase()} · WK {session.currentWeekIdx + 1}/4 · {session.dateLabel}
          </div>
        </div>
        <ThemeStamp>
          {theme === 'blueprint' ? 'DWG · LOG' : theme === 'cyberpunk' ? 'SYS://LOG' : 'FRESH'}
        </ThemeStamp>
      </div>
    </div>
  );
}

/* ────────────────────── week strip ────────────────────── */

function LoggerWeekStrip({ theme, session, weekIdx, setWeekIdx }) {
  const themeStyles = {
    iron: {
      bg: 'transparent',
      activeBg: 'rgb(var(--ft-card))',
      activeBorder: '1px solid rgb(var(--ft-accent))',
      inactiveColor: 'rgb(var(--ft-muted))',
      activeColor: 'rgb(var(--ft-accent))',
      completeColor: 'rgb(var(--ft-pale))',
    },
    lab: {
      bg: 'rgb(var(--ft-card))',
      activeBg: 'rgb(var(--ft-accent))',
      activeBorder: '1px solid rgb(var(--ft-accent))',
      inactiveColor: 'rgb(var(--ft-dim))',
      activeColor: '#fff',
      completeColor: 'rgb(var(--ft-pale))',
    },
    notebook: {
      bg: 'transparent',
      activeBg: 'transparent',
      activeBorder: '2px solid rgb(var(--ft-accent))',
      inactiveColor: 'rgb(var(--ft-muted))',
      activeColor: 'rgb(var(--ft-accent))',
      completeColor: 'rgb(var(--ft-pale))',
    },
    arcade: {
      bg: 'rgb(var(--ft-surface))',
      activeBg: 'rgb(var(--ft-cyan))',
      activeBorder: '1px solid rgb(var(--ft-cyan))',
      inactiveColor: 'rgba(170,160,210,.7)',
      activeColor: '#000',
      completeColor: 'rgb(var(--ft-pale))',
    },
  };
  const s = themeStyles[theme] || {
    bg: 'transparent',
    activeBg: 'rgba(var(--ft-accent),.15)',
    activeBorder: '1px solid rgb(var(--ft-accent))',
    inactiveColor: 'rgb(var(--ft-muted))',
    activeColor: 'rgb(var(--ft-accent))',
    completeColor: 'rgb(var(--ft-pale))',
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
      padding: '8px 16px 10px',
    }}>
      {session.weeks.map((w, i) => {
        const isActive = i === weekIdx;
        const isComplete = w.pastComplete;
        return (
          <button
            key={w.key}
            onClick={() => setWeekIdx(i)}
            style={{
              padding: '7px 4px', cursor: 'pointer',
              background: isActive ? s.activeBg : 'rgba(var(--ft-border),.12)',
              border: isActive ? s.activeBorder : '1px solid rgba(var(--ft-border),.55)',
              borderRadius: theme === 'lab' ? 4 : theme === 'notebook' ? 20 : 0,
              color: isActive ? s.activeColor : (isComplete ? s.completeColor : s.inactiveColor),
              boxShadow: isActive ? 'none' : 'inset 0 -2px 0 rgba(var(--ft-border),.28)',
              transition: 'all .15s',
              fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span className="ft-data" style={{ fontSize: 14, fontWeight: 600 }}>{w.label}</span>
            <span style={{ fontSize: 9, opacity: .8, letterSpacing: theme === 'arcade' ? 0 : '.05em' }}>
              {isActive ? 'TODAY' : w.date}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────── the lane (one exercise row) ────────────────────── */

function Lane({ theme, lane, weekIdx, railStyle, lastWeekMode, onTapSet, activeCell }) {
  const cat = window.CATEGORY_COLOR[lane.category] || 'push';
  const todaySets = lane.sets[weekIdx];
  const prevWeekSets = weekIdx > 0 ? lane.sets[weekIdx - 1] : null;

  // Rail variants
  const railContent = (() => {
    if (railStyle === 'rotated-64' || railStyle === 'rotated-52') {
      const width = railStyle === 'rotated-64' ? 56 : 44;
      // Per-theme rail label styling. Notebook uses Caveat lowercase so the
      // rotated text reads like a marginal scribble; arcade keeps Press Start
      // 2P at a smaller size; everything else uses the default tracked caps.
      const railLabel = (() => {
        if (theme === 'notebook') {
          return {
            fontFamily: "'Caveat', cursive",
            fontSize: railStyle === 'rotated-64' ? 22 : 19,
            fontWeight: 600,
            letterSpacing: 0,
            textTransform: 'lowercase',
          };
        }
        if (theme === 'arcade') {
          return {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: railStyle === 'rotated-64' ? 9 : 8,
            fontWeight: 400,
            letterSpacing: 0,
            textTransform: 'uppercase',
          };
        }
        return {
          fontFamily: 'inherit',
          fontSize: railStyle === 'rotated-64' ? 13 : 11,
          fontWeight: 600,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
        };
      })();
      return (
        <div className={`ft-bg-${cat}`} style={{
          width, flexShrink: 0, position: 'relative',
          borderRadius: theme === 'lab' ? 'var(--ft-radius) 0 0 var(--ft-radius)' : 0,
          color: '#fff', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            whiteSpace: 'nowrap',
            ...railLabel,
          }}>
            {lane.category}
          </div>
        </div>
      );
    }
    if (railStyle === 'stripe') {
      return <div className={`ft-bg-${cat}`} style={{ width: 6, flexShrink: 0 }} />;
    }
    return null; // chip mode — no side rail
  })();

  // Card container style per theme
  const cardStyle = {
    position: 'relative',
    background: 'rgb(var(--ft-surface))',
    border: 'var(--ft-card-border)',
    borderRadius: 'var(--ft-radius)',
    marginBottom: theme === 'notebook' ? 12 : theme === 'arcade' ? 16 : 10,
    display: 'flex',
    overflow: 'hidden',
  };

  // All themes share the same rail behavior now — notebook gets the rotated
  // category text (handwritten Caveat) just like the others get tracked caps.
  const effectiveRailStyle = railStyle;

  return (
    <div className="ft-card" style={cardStyle}>
      {effectiveRailStyle !== 'chip' && (effectiveRailStyle === 'stripe'
        ? <div className={`ft-bg-${cat}`} style={{ width: 5, flexShrink: 0 }} />
        : railContent)}

      <div style={{ flex: 1, padding: theme === 'notebook' ? '10px 14px 12px' : '10px 12px 12px', minWidth: 0 }}>
        {/* Top line: variant dropdown + target */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {effectiveRailStyle === 'chip' && (() => {
              // Per-theme chip styling. Each theme's chip leans into its own
              // material vocabulary so it feels like the rest of the system:
              //   notebook  — handwritten Caveat pill, angled upwards like a marginal note
              //   lab       — clinical rounded-3 tag, tracked-out caps (specimen sticker)
              //   iron      — sharp tag, heavy tracked caps (stamped plate)
              //   arcade    — sharp 8-bit chip with low spacing (HUD label)
              //   blueprint/cyber/graffiti — sharp chip, tracked caps (default ticket)
              const chipStyle = (() => {
                if (theme === 'notebook') {
                  return {
                    padding: '1px 12px 2px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: 0,
                    textTransform: 'lowercase',
                    fontFamily: "'Caveat', cursive",
                    borderRadius: 14,
                    marginBottom: 6,
                    // angled upwards (counter-clockwise) — feels like a margin scribble
                    transform: 'rotate(-6deg)',
                    transformOrigin: '0% 100%',
                  };
                }
                if (theme === 'lab') {
                  return {
                    padding: '2px 8px', fontSize: 9, fontWeight: 700,
                    letterSpacing: '.16em', textTransform: 'uppercase',
                    borderRadius: 3, marginBottom: 4,
                  };
                }
                if (theme === 'arcade') {
                  return {
                    padding: '2px 8px 1px', fontSize: 8, fontWeight: 700,
                    letterSpacing: '.04em', textTransform: 'uppercase',
                    fontFamily: "'Press Start 2P', monospace",
                    borderRadius: 0, marginBottom: 5,
                  };
                }
                // iron / blueprint / cyber / graffiti — default sharp tag
                return {
                  padding: '2px 8px', fontSize: 9, fontWeight: 700,
                  letterSpacing: '.14em', textTransform: 'uppercase',
                  borderRadius: 0, marginBottom: 4,
                };
              })();
              return (
                <div className={`ft-bg-${cat}`} style={{
                  display: 'inline-block',
                  color: '#fff',
                  ...chipStyle,
                }}>{lane.category}</div>
              );
            })()}
            <VariantDropdown theme={theme} lane={lane} />
          </div>
          <TargetChip theme={theme} lane={lane} />
        </div>

        {/* Set row: N cells, one per set, + AddSet affordance up to MAX_SETS.
            When the row holds 5+ cells we shrink gap + typography so 6 still
            fit comfortably on a 390-wide phone. */}
        {(() => {
          const cellCount = todaySets.length + (todaySets.length < MAX_SETS_PER_LANE ? 1 : 0);
          const dense = cellCount >= 5;
          return (
            <div style={{ display: 'flex', gap: dense ? 3 : 6 }}>
              {todaySets.map((set, i) => (
                <SetCell
                  key={i}
                  theme={theme}
                  set={set}
                  setIdx={i}
                  prev={prevWeekSets ? prevWeekSets[i] : null}
                  lastWeekMode={lastWeekMode}
                  isActive={activeCell && activeCell.laneId === lane.id && activeCell.setIdx === i}
                  cat={cat}
                  onTap={() => onTapSet(lane.id, i)}
                  dense={dense}
                />
              ))}
              {todaySets.length < MAX_SETS_PER_LANE && (
                <AddSetCell theme={theme} dense={dense} onTap={() => onTapSet(lane.id, todaySets.length, { addNew: true })} />
              )}
            </div>
          );
        })()}

        {/* Optional LAST row when lastWeekMode === 'row' */}
        {lastWeekMode === 'row' && prevWeekSets && prevWeekSets.some(s => s.w != null) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {prevWeekSets.map((s, i) => (
              <div key={i} className="ft-data" style={{
                flex: 1, textAlign: 'center',
                fontSize: 10,
                color: 'rgb(var(--ft-muted))',
                letterSpacing: '.02em',
              }}>
                {s.w != null ? `${fmtW(s.w)}×${s.r}` : '—'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtW(w) { return Number.isInteger(w) ? w : w.toFixed(1); }

/* variant dropdown */
function VariantDropdown({ theme, lane }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const isHandwritten = theme === 'notebook';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: isHandwritten ? 19 : 14,
          fontWeight: 600,
          color: 'rgb(var(--ft-white))',
          display: 'flex', alignItems: 'center', gap: 6,
          lineHeight: 1.1,
          textAlign: 'left',
          letterSpacing: theme === 'arcade' ? 0 : '-.005em',
          maxWidth: '100%',
        }}
      >
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          borderBottom: isHandwritten ? '1px dashed rgba(181,49,42,.5)' : 'none',
          paddingBottom: isHandwritten ? 1 : 0,
        }}>
          {lane.variant}
        </span>
        <span style={{ color: 'rgb(var(--ft-muted))', flexShrink: 0 }}><IconChevron dir={open ? 'up' : 'down'} size={10} /></span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: -8, marginTop: 4,
          background: 'rgb(var(--ft-card))', border: 'var(--ft-card-border)',
          borderRadius: 'var(--ft-radius)',
          zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,.3)',
          maxHeight: 180, overflow: 'auto',
        }}>
          {lane.variants.map((v, i) => (
            <div key={i} style={{
              padding: '8px 10px',
              fontSize: isHandwritten ? 17 : 13,
              color: v === lane.variant ? 'rgb(var(--ft-accent))' : 'rgb(var(--ft-light))',
              fontWeight: v === lane.variant ? 600 : 400,
              borderBottom: i < lane.variants.length - 1 ? '1px solid rgba(var(--ft-border),.4)' : 'none',
              cursor: 'pointer',
            }}>{v}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function TargetChip({ theme, lane }) {
  const isNotebook = theme === 'notebook';
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState(lane.targetSets);
  const [reps, setReps] = useState(lane.targetReps);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const stepBtn = {
    width: 26, height: 26, borderRadius: theme === 'lab' ? 4 : 0,
    background: 'rgb(var(--ft-surface))', border: '1px solid rgba(var(--ft-border),.6)',
    color: 'rgb(var(--ft-white))', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: isNotebook ? '0 1px 1px' : '2px 6px',
        border: isNotebook ? 'none' : '1px dashed rgba(var(--ft-border),.7)',
        borderBottom: isNotebook ? '1px dashed rgba(var(--ft-accent),.6)' : undefined,
        borderRadius: theme === 'lab' ? 3 : 0,
        background: open ? 'rgba(var(--ft-accent),.10)' : 'transparent',
        color: 'rgb(var(--ft-dim))', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <IconTarget size={isNotebook ? 13 : 12} />
        <span className="ft-data" style={{
          fontSize: isNotebook ? 15 : 11,
          fontWeight: 600,
          letterSpacing: theme === 'arcade' ? 0 : '.02em',
        }}>
          {sets}×{reps}
        </span>
        <span style={{ color: 'rgb(var(--ft-muted))', display: 'flex' }}><IconChevron dir={open ? 'up' : 'down'} size={9} /></span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 5, zIndex: 60,
          background: 'rgb(var(--ft-card))', border: 'var(--ft-card-border)',
          borderRadius: 'var(--ft-radius)', boxShadow: '0 8px 24px rgba(0,0,0,.3)',
          padding: 11, width: 168,
        }}>
          <div className="ft-data" style={{ fontSize: 9, letterSpacing: '.14em', color: 'rgb(var(--ft-muted))', marginBottom: 9 }}>TARGET</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="ft-data" style={{ fontSize: 11, letterSpacing: '.1em', color: 'rgb(var(--ft-light))' }}>SETS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <button onClick={() => setSets((v) => Math.max(1, v - 1))} style={stepBtn}>−</button>
              <span className="ft-data" style={{ fontSize: 16, fontWeight: 700, color: 'rgb(var(--ft-white))', minWidth: 16, textAlign: 'center' }}>{sets}</span>
              <button onClick={() => setSets((v) => Math.min(6, v + 1))} style={stepBtn}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ft-data" style={{ fontSize: 11, letterSpacing: '.1em', color: 'rgb(var(--ft-light))' }}>REPS</span>
            <input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              style={{
                width: 66, textAlign: 'center',
                background: 'rgb(var(--ft-surface))', border: '1px solid rgba(var(--ft-border),.6)',
                borderRadius: theme === 'lab' ? 4 : 0, color: 'rgb(var(--ft-white))',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '5px 6px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────── set cell ────────────────────── */

function SetCell({ theme, set, prev, setIdx, lastWeekMode, isActive, cat, onTap, dense }) {
  const filled = set.done && set.w != null;
  const showGhost = !filled && lastWeekMode === 'ghost' && prev && prev.w != null;

  // Scale down typography when the lane is dense (5–6 sets crammed into the row).
  // Arcade still gets a bump because its native sizes were undersized for legibility.
  const wFontFilled = theme === 'arcade'
    ? (dense ? 22 : 26)
    : (dense ? 16 : 20);
  const rFontFilled = theme === 'arcade'
    ? (dense ? 14 : 16)
    : (dense ? 10 : 11);
  const wFontGhost = theme === 'arcade'
    ? (dense ? 18 : 22)
    : (dense ? 14 : 17);
  const rFontGhost = theme === 'arcade'
    ? (dense ? 12 : 14)
    : (dense ? 9 : 10);

  // Per-theme set-cell surface — sits a step away from the lane card so
  // each cell reads as its own little tile (the notebook treatment, applied
  // consistently). Each theme picks a tint that fits its own palette:
  //   notebook  — warmer cream tile vs cream card (already worked)
  //   iron      — slightly darker pocket vs the brass-rimmed plate
  //   lab       — paper-white vs the off-white card surface
  //   arcade    — deeper navy pocket vs the neon-rimmed cabinet
  //   blueprint — slightly lighter navy on the dark drawing card
  //   cyberpunk — deeper midnight panel
  //   graffiti  — concrete shade darker than the wheatpaste poster
  const cellSurface = ({
    notebook:  '#FFFBEC',
    iron:      'rgb(38, 37, 35)',
    lab:       '#FFFFFF',
    arcade:    'rgb(20, 20, 38)',
    blueprint: 'rgb(40, 76, 128)',
    cyberpunk: 'rgb(8, 14, 28)',
    graffiti:  'rgb(38, 38, 42)',
  })[theme] || 'rgb(var(--ft-card))';
  const cellFilled = ({
    notebook:  'rgba(181,49,42,.10)',
    iron:      'rgba(200,169,110,.12)',
    lab:       'rgba(37,99,235,.08)',
    arcade:    'rgba(255,80,200,.18)',
    blueprint: 'rgba(250,253,255,.16)',
    cyberpunk: 'rgba(0,240,255,.10)',
    graffiti:  'rgba(245,220,60,.14)',
  })[theme] || 'rgba(var(--ft-accent),.10)';
  const cellShadow = ({
    notebook:  '0 1px 0 rgba(0,0,0,.05), inset 0 1px 0 rgba(255,255,255,.5)',
    iron:      'inset 0 1px 0 rgba(0,0,0,.35), inset 0 -1px 0 rgba(255,255,255,.04)',
    lab:       '0 1px 2px rgba(15,23,42,.06)',
    arcade:    'inset 0 0 0 1px rgba(0,240,255,.18)',
    blueprint: 'inset 0 0 0 1px rgba(255,255,255,.08)',
    cyberpunk: 'inset 0 0 12px rgba(0,240,255,.06)',
    graffiti:  '0 1px 0 rgba(0,0,0,.4)',
  })[theme] || 'none';

  const base = {
    flex: 1,
    aspectRatio: dense ? '1 / 1' : '1 / 0.85',
    minHeight: dense ? 46 : 52,
    minWidth: 0,
    position: 'relative', cursor: 'pointer',
    borderRadius: 'var(--ft-radius)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: dense ? 1 : 2,
    overflow: 'hidden',
    fontFamily: 'inherit',
    transition: 'border-color .15s, background .15s, box-shadow .15s',
  };
  if (filled) {
    // DONE — a solid logged tile: filled surface, hard accent border, raised.
    base.background = cellFilled;
    base.border = '1.5px solid rgb(var(--ft-accent))';
    base.boxShadow = cellShadow;
  } else {
    // TO-DO — an open slot: no fill, dashed faint border, recedes behind done tiles.
    base.background = 'transparent';
    base.border = '1px dashed rgba(var(--ft-border),.55)';
    base.boxShadow = 'none';
  }
  if (isActive) {
    base.background = 'rgba(var(--ft-accent),.22)';
    base.border = '1.5px solid rgb(var(--ft-accent))';
  }

  return (
    <button onClick={onTap} style={base}>
      {/* set number corner */}
      <div className="ft-data" style={{
        position: 'absolute', top: 2, left: 3,
        fontSize: dense ? 7 : 8, color: 'rgb(var(--ft-muted))', letterSpacing: '.05em',
      }}>{setIdx + 1}</div>

      {/* check corner when filled */}
      {filled && (
        <div style={{
          position: 'absolute', top: 2, right: 3,
          color: `rgb(var(--ft-${cat === 'push' ? 'push' : cat === 'pull' ? 'pull' : cat === 'legs' ? 'legs' : 'core'}))`,
        }}><IconCheck size={dense ? 8 : 10} /></div>
      )}

      {filled ? (
        <>
          <div className="ft-data" style={{
            fontSize: wFontFilled,
            lineHeight: 1,
            color: 'rgb(var(--ft-white))',
            fontWeight: 700,
          }}>{fmtW(set.w)}</div>
          {/* reps shares weight's prominence; rpe rides the same line, smaller + dim */}
          <div className="ft-data" style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4,
            marginTop: theme === 'arcade' ? 2 : 1, lineHeight: 1,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: rFontFilled, color: 'rgb(var(--ft-dim))', fontWeight: 600 }}>×</span>
              <span style={{ fontSize: wFontFilled, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>{set.r}</span>
            </span>
            {!dense && set.rpe ? (
              <span style={{ fontSize: Math.max(8, Math.round(rFontFilled * 0.9)), color: 'rgb(var(--ft-dim))', opacity: .85 }}>@{set.rpe}</span>
            ) : null}
          </div>
        </>
      ) : showGhost ? (
        <div style={{ opacity: .7, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="ft-data" style={{
            fontSize: wFontGhost,
            lineHeight: 1,
            color: 'rgba(var(--ft-muted),.85)',
            fontWeight: 500,
          }}>{fmtW(prev.w)}</div>
          <div className="ft-data" style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginTop: 1, lineHeight: 1,
          }}>
            <span style={{ fontSize: rFontGhost, color: 'rgba(var(--ft-muted),.65)' }}>×</span>
            <span style={{ fontSize: wFontGhost, color: 'rgba(var(--ft-muted),.85)', fontWeight: 500, lineHeight: 1 }}>{prev.r}</span>
          </div>
          <div className="ft-data" style={{
            position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center',
            fontSize: 6.5, letterSpacing: '.16em', color: 'rgba(var(--ft-muted),.65)',
          }}>LAST</div>
        </div>
      ) : (
        <div style={{
          fontSize: 14, color: 'rgba(var(--ft-muted),.5)',
        }}>·</div>
      )}
    </button>
  );
}

/* ────────────────────── add-set cell ──────────────────────
   Trailing affordance shown after the last set cell when the lane
   has fewer than MAX_SETS_PER_LANE entries. Uses dashed border so it
   reads as "potential" rather than a logged set. Same flex behavior
   as SetCell so it sits cleanly in the row. */
function AddSetCell({ theme, onTap, dense }) {
  return (
    <button onClick={onTap} title="Add set" style={{
      flex: '0 0 auto',
      width: dense ? 20 : 24,
      alignSelf: 'stretch',
      minHeight: dense ? 46 : 52,
      position: 'relative', cursor: 'pointer',
      background: 'transparent',
      border: '1px dashed rgb(var(--ft-border) / .55)',
      borderRadius: 'var(--ft-radius)',
      display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 0, color: 'rgb(var(--ft-muted))',
      transition: 'background .15s, color .15s, border-color .15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgb(var(--ft-accent) / .06)';
      e.currentTarget.style.borderColor = 'rgb(var(--ft-accent) / .55)';
      e.currentTarget.style.color = 'rgb(var(--ft-accent))';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'rgb(var(--ft-border) / .55)';
      e.currentTarget.style.color = 'rgb(var(--ft-muted))';
    }}>
      <div style={{ fontSize: 16, lineHeight: 1, fontWeight: 400 }}>+</div>
    </button>
  );
}

// Lanes scaffolded with up to this many cells. Beyond 6, the row pattern
// stops being usable on a phone — at that point it'd need a wholly different
// layout (paginated sets, scrollable row, etc).
const MAX_SETS_PER_LANE = 6;

/* ────────────────────── set input half-sheet ────────────────────── */

function SetSheet({ theme, session, activeCell, onCommit, onClose, lastWeekMode }) {
  if (!activeCell) return null;
  const lane = session.lanes.find(l => l.id === activeCell.laneId);
  if (!lane) return null;
  const prev = session.currentWeekIdx > 0
    ? lane.sets[session.currentWeekIdx - 1][activeCell.setIdx]
    : null;
  const [w, setW] = useState(prev?.w ?? 0);
  const [r, setR] = useState((prev?.r ?? parseInt(String(lane.targetReps).split('-')[0], 10)) || 8);
  const [rpe, setRpe] = useState(lane.rpeTarget ?? 8);
  const [focus, setFocus] = useState('w'); // 'w' | 'r' | 'rpe'

  const onPad = (k) => {
    if (k === 'clear') { setVal(focus, 0); return; }
    if (k === 'back')  { setVal(focus, Math.floor(Number(getVal(focus)) / 10)); return; }
    if (k === '.') return; // keep integer for now
    const cur = Number(getVal(focus));
    setVal(focus, cur * 10 + Number(k));
  };
  const getVal = (f) => f === 'w' ? w : f === 'r' ? r : rpe;
  const setVal = (f, v) => {
    if (f === 'w') setW(v);
    else if (f === 'r') setR(v);
    else setRpe(v);
  };

  const matchLast = () => {
    if (!prev || prev.w == null) return;
    setW(prev.w); setR(prev.r); if (prev.rpe) setRpe(prev.rpe);
  };
  const plus5 = () => setW(w + 5);
  const minus5 = () => setW(Math.max(0, w - 5));

  const fieldStyle = (isActive) => ({
    flex: 1, padding: '8px 10px',
    background: isActive ? 'rgba(var(--ft-accent),.15)' : 'rgb(var(--ft-card))',
    border: `1px solid ${isActive ? 'rgb(var(--ft-accent))' : 'rgba(var(--ft-border),.4)'}`,
    borderRadius: 'var(--ft-radius)',
    cursor: 'pointer', textAlign: 'center',
  });

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
        zIndex: 90, animation: 'fadeIn .15s',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgb(var(--ft-surface))',
        borderTop: '1px solid rgb(var(--ft-border))',
        borderTopLeftRadius: theme === 'lab' ? 16 : theme === 'notebook' ? 8 : 0,
        borderTopRightRadius: theme === 'lab' ? 16 : theme === 'notebook' ? 8 : 0,
        padding: '10px 14px 16px',
        zIndex: 91,
        boxShadow: '0 -20px 40px rgba(0,0,0,.3)',
      }}>
        {/* grabber */}
        <div style={{
          width: 36, height: 4, background: 'rgba(var(--ft-muted),.4)',
          borderRadius: 2, margin: '0 auto 10px',
        }} />

        {/* context */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="ft-data" style={{ fontSize: 10, color: 'rgb(var(--ft-muted))', letterSpacing: '.15em' }}>
              {lane.category.toUpperCase()} · SET {activeCell.setIdx + 1}
            </div>
            <div className="ft-display" style={{ fontSize: 14, color: 'rgb(var(--ft-white))', marginTop: 2 }}>
              {lane.variant}
            </div>
          </div>
          {prev && prev.w != null && (
            <button onClick={matchLast} style={{
              background: 'rgb(var(--ft-card))',
              border: '1px solid rgba(var(--ft-border),.6)',
              borderRadius: 'var(--ft-radius)',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'rgb(var(--ft-light))',
            }}>
              <div className="ft-data" style={{ fontSize: 9, letterSpacing: '.12em', color: 'rgb(var(--ft-muted))' }}>LAST</div>
              <div className="ft-data" style={{ fontSize: 13, color: 'rgb(var(--ft-white))', fontWeight: 600 }}>
                {fmtW(prev.w)}×{prev.r}
              </div>
            </button>
          )}
        </div>

        {/* three fields */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div onClick={() => setFocus('w')} style={fieldStyle(focus === 'w')}>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>WEIGHT</div>
            <div className="ft-data" style={{ fontSize: 26, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1.05 }}>{w}</div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))' }}>lb</div>
          </div>
          <div onClick={() => setFocus('r')} style={fieldStyle(focus === 'r')}>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>REPS</div>
            <div className="ft-data" style={{ fontSize: 26, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1.05 }}>{r}</div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))' }}>target {lane.targetReps}</div>
          </div>
          <div onClick={() => setFocus('rpe')} style={fieldStyle(focus === 'rpe')}>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>RPE</div>
            <div className="ft-data" style={{ fontSize: 26, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1.05 }}>{rpe}</div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))' }}>target @{lane.rpeTarget}</div>
          </div>
        </div>

        {/* +5/-5 quick */}
        {focus === 'w' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button onClick={minus5} style={quickBtn(theme)}>− 5</button>
            <button onClick={() => setW(w + 2.5)} style={quickBtn(theme)}>+ 2.5</button>
            <button onClick={plus5} style={quickBtn(theme)}>+ 5</button>
            <button onClick={() => setW(w + 10)} style={quickBtn(theme)}>+ 10</button>
          </div>
        )}

        {/* keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {['1','2','3','4','5','6','7','8','9','clear','0','back'].map(k => (
            <button key={k} onClick={() => onPad(k)} style={padBtn(theme, k)}>
              {k === 'back' ? '⌫' : k === 'clear' ? 'C' : k}
            </button>
          ))}
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(var(--ft-border),.6)',
            borderRadius: 'var(--ft-radius)',
            color: 'rgb(var(--ft-light))',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '.1em',
          }}>CANCEL</button>
          <button onClick={() => onCommit({ w, r, rpe })} style={{
            flex: 2, padding: '12px', cursor: 'pointer',
            background: 'rgb(var(--ft-accent))',
            border: '1px solid rgb(var(--ft-accent))',
            borderRadius: 'var(--ft-radius)',
            color: theme === 'arcade' ? '#000' : '#fff',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '.1em',
          }}>LOG SET</button>
        </div>
      </div>
    </>
  );
}

function quickBtn(theme) {
  return {
    flex: 1, padding: '8px',
    background: 'rgb(var(--ft-card))',
    border: '1px solid rgba(var(--ft-border),.6)',
    borderRadius: 'var(--ft-radius)',
    color: 'rgb(var(--ft-light))',
    cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
  };
}
function padBtn(theme, k) {
  const isAction = k === 'clear' || k === 'back';
  return {
    padding: '14px 0',
    background: isAction ? 'rgb(var(--ft-card))' : 'rgb(var(--ft-surface))',
    border: '1px solid rgba(var(--ft-border),.4)',
    borderRadius: 'var(--ft-radius)',
    color: 'rgb(var(--ft-white))',
    cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 20, fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  };
}

/* ────────────────────── finish bar ────────────────────── */

function FinishBar({ theme, session, weekIdx }) {
  // compute stats for viewed week
  let done = 0, total = 0, volume = 0;
  for (const lane of session.lanes) {
    for (const set of lane.sets[weekIdx]) {
      total++;
      if (set.done && set.w != null) { done++; volume += set.w * set.r; }
    }
  }
  const pct = total ? (done / total) : 0;

  return (
    <div className="ft-card" style={{
      position: 'absolute', left: 0, right: 0, bottom: 78,
      padding: '8px 14px 10px',
      background: 'rgb(var(--ft-surface))',
      borderTop: '1px solid rgba(var(--ft-border),.7)',
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>SETS</div>
            <div className="ft-data" style={{ fontSize: 14, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
              {done}<span style={{ color: 'rgb(var(--ft-muted))', fontWeight: 500 }}>/{total}</span>
            </div>
          </div>
          <div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>VOL</div>
            <div className="ft-data" style={{ fontSize: 14, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
              {(volume/1000).toFixed(1)}k
            </div>
          </div>
          <div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>TIME</div>
            <div className="ft-data" style={{ fontSize: 14, color: 'rgb(var(--ft-white))', fontWeight: 700, lineHeight: 1 }}>
              {session.elapsedMin}m
            </div>
          </div>
          <div>
            <div className="ft-data" style={{ fontSize: 9, color: 'rgb(var(--ft-muted))', letterSpacing: '.12em' }}>REST</div>
            <div className="ft-data" style={{ fontSize: 14, color: 'rgb(var(--ft-accent))', fontWeight: 700, lineHeight: 1 }}>
              {formatSec(session.restRemaining)}
            </div>
          </div>
        </div>
        <button style={{
          padding: '8px 14px',
          background: pct === 1 ? 'rgb(var(--ft-accent))' : 'rgb(var(--ft-card))',
          border: '1px solid rgb(var(--ft-accent))',
          color: pct === 1 ? (theme === 'arcade' ? '#000' : '#fff') : 'rgb(var(--ft-accent))',
          borderRadius: 'var(--ft-radius)',
          fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
          fontFamily: 'inherit', cursor: 'pointer',
        }}>FINISH</button>
      </div>
      {/* progress bar */}
      <div style={{
        height: 3, background: 'rgba(var(--ft-border),.4)', overflow: 'hidden',
        borderRadius: theme === 'lab' ? 2 : 0,
      }}>
        <div style={{
          height: '100%', width: `${pct * 100}%`,
          background: 'rgb(var(--ft-accent))',
          transition: 'width .3s',
        }} />
      </div>
    </div>
  );
}
function formatSec(s) {
  const m = Math.floor(s / 60); const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/* ────────────────────── tab nav (faded) ────────────────────── */

function TabNav({ theme }) {
  const tabs = [
    { id: 'home', icon: 'M3 8 L8 3 L13 8 V13 H3 Z', label: 'Home' },
    { id: 'log',  icon: 'M8 3 V13 M3 8 H13', label: 'Log', active: true },
    { id: 'prog', icon: 'M3 13 V5 M7 13 V3 M11 13 V9', label: 'Program' },
    { id: 'hist', icon: 'M3 4 H13 M3 8 H13 M3 12 H10', label: 'History' },
    { id: 'set',  icon: 'M8 5.5 A 2.5 2.5 0 1 0 8 10.5 A 2.5 2.5 0 1 0 8 5.5 Z', label: 'Settings' },
  ];
  return (
    <div className="ft-card" style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 78,
      background: 'rgb(var(--ft-surface))',
      borderTop: '1px solid rgba(var(--ft-border),.5)',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      opacity: .45,
      paddingBottom: 22,
      zIndex: 20,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3,
          color: t.active ? 'rgb(var(--ft-accent))' : 'rgb(var(--ft-muted))',
        }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.icon} />
          </svg>
          <div style={{ fontSize: 9, letterSpacing: '.1em', fontWeight: 600 }}>{t.label.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────── root ────────────────────── */

function LoggerScreen({ theme, session = window.SESSION, tweaks = {} }) {
  const {
    railStyle = 'rotated-52',
    lastWeekMode = 'ghost',    // 'ghost' | 'row' | 'none'
    showSheet = false,
  } = tweaks;

  const [weekIdx, setWeekIdx] = useState(session.currentWeekIdx);
  const [activeCell, setActiveCell] = useState(showSheet ? { laneId: 'l3', setIdx: 0 } : null);
  const [localSession, setLocalSession] = useState(session);

  const onTapSet = (laneId, setIdx) => setActiveCell({ laneId, setIdx });
  const onCommit = ({ w, r, rpe }) => {
    const next = { ...localSession, lanes: localSession.lanes.map(l => {
      if (l.id !== activeCell.laneId) return l;
      const sets = l.sets.map((ws, i) => i === weekIdx ? ws.map((s, j) => j === activeCell.setIdx ? { ...s, w, r, rpe, done: true } : s) : ws);
      return { ...l, sets };
    })};
    setLocalSession(next);
    setActiveCell(null);
  };

  return (
    <div className="ft" data-theme={theme} style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden',
    }}>
      {/* theme-specific page chrome (crt for arcade) */}
      {theme === 'arcade' && <div className="ft-crt" />}

      {/* scrollable content */}
      <div className="ft-on-bg" style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 78 + 52 + 1,
        overflowY: 'auto',
        paddingBottom: 16,
      }}>
        <ThemeHeader theme={theme} session={localSession} />
        <LoggerWeekStrip theme={theme} session={localSession} weekIdx={weekIdx} setWeekIdx={setWeekIdx} />
        <div style={{ padding: '0 14px' }}>
          {localSession.lanes.map(lane => (
            <Lane
              key={lane.id}
              theme={theme}
              lane={lane}
              weekIdx={weekIdx}
              railStyle={railStyle}
              lastWeekMode={lastWeekMode}
              onTapSet={onTapSet}
              activeCell={activeCell}
            />
          ))}
          <div style={{ height: 20 }} />
        </div>
      </div>

      <FinishBar theme={theme} session={localSession} weekIdx={weekIdx} />
      <TabNav theme={theme} />
      <SetSheet
        theme={theme}
        session={localSession}
        activeCell={activeCell}
        onCommit={onCommit}
        onClose={() => setActiveCell(null)}
        lastWeekMode={lastWeekMode}
      />
    </div>
  );
}

Object.assign(window, { LoggerScreen });
