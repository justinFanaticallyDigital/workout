// tier-homes-screens.jsx
// Cluster B — Tier Homes
//   1.5 Tier Landing       — first impression for new users (onboarding)
//   2.1 Workouts Library   — Logger tier home
//   3.1 My Program         — Program tier home
//
// Each screen is rendered in three states: Default · Empty · Error.
// All chrome reads tokens from useFitTrackTheme(theme); the host swaps
// `theme` via the Tweaks panel so every variant flows through one source
// of truth. Default theme is Lab (cleanest base for the structural read).
//
// Sizing assumption: ThemedPhone interior is 410 × 870 at the artboard
// level; subtract status bar (44) and the optional BottomNav (76) for
// content height (~750).

const { useState, useMemo } = React;

// ────────────────────────────────────────────────────────────────────────
// Shared primitives — Header, BottomNav, atoms

function Header({ T, title, kind = 'home', right = 'gear', subtitle, collapsed = false }) {
  // kind: 'home' (logo left), 'sub' (back left), 'onb' (no chrome, centered)
  const onBg = T.textOnBg || T.text;
  const onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div style={{
      padding: collapsed ? '5px 18px 6px' : '10px 18px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
      transition: 'padding .18s ease',
    }} className="ft-on-bg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {kind === 'home' && !collapsed && <Logo T={T}/>}
        {kind === 'sub'  && <IconBtn T={T} glyph="‹" />}
        {kind === 'onb'  && null}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: collapsed ? 14 : 17, fontWeight: 600,
            color: onBg, letterSpacing: '-.01em', lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</div>
          {subtitle && !collapsed && (
            <div style={{
              fontFamily: T.fontBody, fontSize: 11, color: onBgTer,
              letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 1,
            }}>{subtitle}</div>
          )}
        </div>
      </div>
      {right === 'gear' && <IconBtn T={T} glyph="⚙" size={collapsed ? 26 : 34} />}
      {right === 'skip' && (
        <button style={{
          background: 'transparent', border: 'none',
          fontFamily: T.fontBody, fontSize: 13, color: onBgTer,
          cursor: 'pointer', padding: '6px 4px',
        }}>Skip</button>
      )}
      {right === null && null}
    </div>
  );
}

function Logo({ T }) {
  // Tiny app mark — square with diagonal — neutral enough to live under any theme
  return (
    <div style={{
      width: 28, height: 28, borderRadius: T.radiusMd || 6,
      background: T.text, color: T.bg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700,
      letterSpacing: '-.02em',
    }}>F</div>
  );
}

function IconBtn({ T, glyph, onClick, size = 34 }) {
  const onBg = T.textOnBg || T.text;
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 999,
      background: 'transparent', border: `1px solid ${T.borderFaint || T.border}`,
      color: onBg, fontFamily: T.fontBody, fontSize: size <= 28 ? 13 : 16,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
    }}>{glyph}</button>
  );
}

function BottomNav({ T, tier = 'logger', activeSlot = 1 }) {
  const slots = useMemo(() => ([
    { id: 1, label: tier === 'logger' ? 'Workouts' : tier === 'program' ? 'Program' : 'Gameplan', glyph: '◉' },
    { id: 2, label: 'Training', glyph: '◐' },
    { id: 3, label: '',          glyph: '+', center: true },
    { id: 4, label: 'Nutrition', glyph: '◔' },
    { id: 5, label: 'Lifestyle', glyph: tier === 'logger' ? '◌' : '◑', locked: tier === 'logger' },
  ]), [tier]);

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 76,
      background: T.surface, borderTop: `1px solid ${T.borderFaint || T.border}`,
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 14, // safe area
      zIndex: 50,
    }}>
      {slots.map((s) => (
        <button key={s.id} style={{
          flex: 1, background: 'transparent', border: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
          gap: 3, padding: '8px 0 0',
          color: activeSlot === s.id ? T.accent : (s.locked ? T.textTer : T.textSec),
          cursor: 'pointer', position: 'relative',
        }}>
          {s.center ? (
            <span style={{
              width: 44, height: 44, borderRadius: 999,
              background: T.accent, color: T.textOnAccent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 400, lineHeight: 1,
              marginTop: -16,
              boxShadow: T.shadowMd,
            }}>{s.glyph}</span>
          ) : (
            <span style={{ fontSize: 18, lineHeight: 1 }}>{s.glyph}</span>
          )}
          {!s.center && (
            <span style={{ fontFamily: T.fontBody, fontSize: 10, letterSpacing: '.01em' }}>{s.label}</span>
          )}
          {s.locked && (
            <span style={{
              position: 'absolute', top: 6, right: '34%', width: 6, height: 6,
              borderRadius: 999, background: T.warn,
            }}/>
          )}
        </button>
      ))}
    </div>
  );
}

function Card({ T, children, style, raised = false, onClick }) {
  return (
    <div onClick={onClick} className="ft-card" style={{
      background: raised ? T.surfaceRaised : T.surface,
      border: T.chrome === 'iron' || T.chrome === 'graffiti' ? `1px solid ${T.border}` : `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusLg || 10,
      boxShadow: raised ? T.shadowMd : T.shadowSm,
      position: 'relative',
      ...style,
    }}>{children}</div>
  );
}

function Button({ T, children, kind = 'primary', size = 'md', glyph, style, onClick }) {
  const isPrimary = kind === 'primary';
  const isGhost = kind === 'ghost';
  const padding = size === 'sm' ? '8px 12px' : size === 'lg' ? '14px 18px' : '11px 14px';
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 14 : 13;
  return (
    <button onClick={onClick} style={{
      padding,
      borderRadius: T.radiusMd || 8,
      background: isPrimary ? T.accent : isGhost ? 'transparent' : T.surfaceAlt,
      color: isPrimary ? T.textOnAccent : isGhost ? T.accent : T.text,
      border: isGhost ? 'none' : `1px solid ${isPrimary ? T.accent : T.border}`,
      fontFamily: T.fontBody, fontSize, fontWeight: 600,
      letterSpacing: '.01em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      cursor: 'pointer',
      ...style,
    }}>
      {children}
      {glyph && <span style={{ fontSize: fontSize + 2, lineHeight: 1 }}>{glyph}</span>}
    </button>
  );
}

function Chip({ T, children, tone = 'neutral', size = 'md', onBg = false }) {
  const map = {
    neutral: { fg: T.textSec, bg: T.surfaceAlt, br: T.borderFaint },
    accent:  onBg
      ? { fg: T.accentOnBg, bg: T.accentFaintOnBg, br: T.accentBorderOnBg }
      : { fg: T.accent,  bg: T.accentFaint, br: T.accentBorder },
    success: { fg: T.successFg, bg: T.successBg, br: T.successBorder },
    warn:    { fg: T.warnFg, bg: T.warnBg, br: T.warnBorder },
    danger:  { fg: T.dangerFg, bg: T.dangerBg, br: T.dangerBorder },
  };
  const c = map[tone] || map.neutral;
  const padding = size === 'sm' ? '2px 7px' : '4px 9px';
  const fontSize = size === 'sm' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding, borderRadius: 999,
      background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
      fontFamily: T.fontBody, fontSize, fontWeight: 600,
      letterSpacing: '.04em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Stamp({ T, children }) {
  return (
    <span className="ft-stamp" style={{
      fontFamily: T.fontData, fontSize: 9, letterSpacing: '.18em',
      color: T.stampFg, textTransform: 'uppercase', fontWeight: 600,
    }}>{children}</span>
  );
}

function ErrorBanner({ T, title, body, action }) {
  // Always sits directly on the page bg → use the on-bg danger tokens so it
  // stays legible on inverted themes (Blueprint's light page + light salmon).
  const dFg = T.dangerFgOnBg || T.dangerFg;
  const dBg = T.dangerBgOnBg || T.dangerBg;
  const dBr = T.dangerBorderOnBg || T.dangerBorder;
  const dSolid = T.dangerOnBg || T.danger;
  return (
    <div className="ft-on-bg" style={{
      margin: '0 16px 12px',
      padding: '10px 12px',
      background: dBg,
      border: `1px solid ${dBr}`,
      borderRadius: T.radiusMd || 8,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{
        flexShrink: 0, width: 18, height: 18, borderRadius: 999,
        background: dSolid, color: '#FFFFFF',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, marginTop: 1,
      }}>!</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: dFg }}>{title}</div>
        {body && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: dFg, opacity: .82, marginTop: 2, lineHeight: 1.35 }}>{body}</div>}
      </div>
      {action && (
        <button style={{
          background: 'transparent', border: 'none', padding: '2px 4px',
          fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 700,
          color: dFg, textDecoration: 'underline', cursor: 'pointer', flexShrink: 0,
        }}>{action}</button>
      )}
    </div>
  );
}

// Tiny SVG sparkline placeholder used in tier-card thumbnails so the cards
// communicate the *shape* of each tier's home without recreating it.
function ThumbStripes({ T, kind }) {
  // kind: 'logger' (recent rows), 'program' (week strip), 'gameplan' (arc)
  if (kind === 'logger') {
    return (
      <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect x="0" y="0" width="200" height="80" fill={T.surfaceAlt}/>
        <rect x="10" y="10" width="180" height="14" rx="3" fill={T.borderFaint} opacity=".7"/>
        <rect x="10" y="30" width="120" height="10" rx="2" fill={T.borderFaint} opacity=".5"/>
        <rect x="135" y="30" width="55" height="10" rx="2" fill={T.borderFaint} opacity=".5"/>
        <rect x="10" y="46" width="140" height="10" rx="2" fill={T.borderFaint} opacity=".5"/>
        <rect x="10" y="62" width="90" height="10" rx="2" fill={T.borderFaint} opacity=".5"/>
        <rect x="105" y="62" width="85" height="10" rx="2" fill={T.borderFaint} opacity=".5"/>
        <rect x="172" y="6" width="20" height="20" rx="3" fill={T.accent} opacity=".7"/>
      </svg>
    );
  }
  if (kind === 'program') {
    return (
      <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect x="0" y="0" width="200" height="80" fill={T.surfaceAlt}/>
        {[...Array(7)].map((_, i) => (
          <rect key={i} x={10 + i*26} y={10} width="22" height="40"
            fill={i === 2 ? T.accent : i === 5 ? T.borderStrong : T.borderFaint}
            opacity={i === 2 ? 1 : .6}/>
        ))}
        <rect x="10" y="58" width="150" height="8" rx="2" fill={T.borderFaint} opacity=".7"/>
        <rect x="10" y="70" width="80" height="6" rx="2" fill={T.borderFaint} opacity=".5"/>
      </svg>
    );
  }
  // gameplan — arc curve
  return (
    <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect x="0" y="0" width="200" height="80" fill={T.surfaceAlt}/>
      <path d="M 12 60 Q 100 5 188 50" stroke={T.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="60" r="4" fill={T.borderStrong}/>
      <circle cx="75" cy="32" r="3" fill={T.accent} opacity=".5"/>
      <circle cx="135" cy="28" r="3" fill={T.accent} opacity=".7"/>
      <circle cx="188" cy="50" r="5" fill={T.accent}/>
      <rect x="10" y="68" width="100" height="6" rx="2" fill={T.borderFaint} opacity=".7"/>
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 1.5 — TIER LANDING

function TierCard({ T, kind, name, tag, price, blurb, features, cta, accent = false }) {
  return (
    <Card T={T} raised={accent} style={{ padding: 0, overflow: 'hidden' }}>
      {/* Thumbnail inset on all four sides so its edge never fights the card's
          top border (was flush — visible clash on Iron/Notebook borders). */}
      <div style={{ padding: '12px 12px 0' }}>
        <div style={{
          height: 76, borderRadius: T.radiusMd || 6, overflow: 'hidden',
          position: 'relative', border: `1px solid ${T.borderFaint}`,
        }}>
          <ThumbStripes T={T} kind={kind}/>
          <span style={{
            position: 'absolute', top: 8, right: 8,
            padding: '3px 9px', borderRadius: 999,
            background: T.surface, border: `1px solid ${T.border}`,
            fontFamily: T.fontData, fontSize: 10, fontWeight: 700,
            color: T.textSec, letterSpacing: '.06em',
          }}>{price}</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700,
            color: T.text, letterSpacing: '-.01em', lineHeight: 1.1,
          }}>{name}</div>
          {tag && <Chip T={T} tone="accent" size="sm">{tag}</Chip>}
        </div>
        <div style={{
          fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec,
          marginTop: 4, lineHeight: 1.4,
        }}>{blurb}</div>

        {/* Comparison rows — same three features, same order in every card,
            so the tiers read down the stack as a spec table. */}
        <div style={{ marginTop: 12, borderTop: `1px solid ${T.borderFaint}` }}>
          {features.map((f, i) => {
            const absent = f.value === '—';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
                padding: '7px 0',
                borderBottom: i < features.length - 1 ? `1px solid ${T.borderFaint}` : 'none',
              }}>
                <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textTer }}>{f.label}</span>
                <span style={{
                  fontFamily: T.fontData, fontSize: 11.5, fontWeight: 700,
                  letterSpacing: '.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  color: absent ? T.textTer : (f.strong ? T.accent : T.text),
                  opacity: absent ? 0.45 : 1,
                }}>{f.value}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <Button T={T} kind={accent ? 'primary' : 'secondary'} style={{ width: '100%' }}>
            {cta} <span style={{ marginLeft: 4 }}>→</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TierLanding({ T, state = 'default' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
      <Header T={T} kind="onb" title="Choose a tier" subtitle="Step 3 of 3"
        right="skip"/>
      {state === 'error' && (
        <ErrorBanner T={T}
          title="Couldn't reach the catalog"
          body="Programs and Gameplan pricing isn't loading. Logger still works."
          action="Retry"/>
      )}
      <div style={{ padding: '12px 16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TierCard T={T} kind="logger" name="Logger" tag="DIY"
            price="FREE"
            blurb="Log & save your own workouts."
            features={[
              { label: 'Logging', value: 'Full', strong: true },
              { label: 'Plans', value: '—' },
              { label: 'Adapts', value: '—' },
            ]}
            cta="Continue as Logger"/>
          <TierCard T={T} kind="program" name="Programs" tag="À la carte"
            price="$29+ ONCE"
            blurb="Pick & customize ready-made plans."
            features={[
              { label: 'Logging', value: 'Full' },
              { label: 'Plans', value: 'Ready-made', strong: true },
              { label: 'Adapts', value: 'Manual' },
            ]}
            cta="Browse Programs"
            accent/>
          <TierCard T={T} kind="gameplan" name="Gameplan" tag="Coached"
            price="$14/MO"
            blurb="Plans that retune every week."
            features={[
              { label: 'Logging', value: 'Full' },
              { label: 'Plans', value: 'Ready-made' },
              { label: 'Adapts', value: 'Weekly', strong: true },
            ]}
            cta="Browse Gameplans"/>
        </div>

        <div style={{
          marginTop: 18, textAlign: 'center',
          fontFamily: T.fontBody, fontSize: 12,
        }} className="ft-on-bg">
          <a href="#" style={{ color: T.accentOnBg || T.accent, fontWeight: 700, textDecoration: 'none' }}>
            Compare all tiers →
          </a>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 2.1 — WORKOUTS LIBRARY (Logger home)

function ShelfAffordance({ T, copy, sub, cta = 'Browse', kind = 'logger' }) {
  return (
    <Card T={T} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 72, height: 56, borderRadius: T.radiusSm || 4, overflow: 'hidden', flexShrink: 0 }}>
        <ThumbStripes T={T} kind={kind === 'logger' ? 'program' : kind}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>{copy}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>
      </div>
      <span style={{
        fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent,
        whiteSpace: 'nowrap',
      }}>{cta} →</span>
    </Card>
  );
}

function RecentWorkoutCard({ T, day, name, lifts, dur }) {
  return (
    <Card T={T} style={{
      flexShrink: 0, width: 168, padding: '12px 12px 13px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <Stamp T={T}>{day}</Stamp>
      <div style={{
        fontFamily: T.fontDisplay, fontSize: 14.5, fontWeight: 600, color: T.text,
        lineHeight: 1.2, letterSpacing: '-.01em',
      }}>{name}</div>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, lineHeight: 1.4 }}>
        {lifts}
      </div>
      <div style={{
        marginTop: 'auto', paddingTop: 6, borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.04em' }}>{dur}</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.accent, fontWeight: 600 }}>Repeat →</span>
      </div>
    </Card>
  );
}

function FrameTile({ T, label, sets, equip, count, pinned }) {
  return (
    <Card T={T} style={{ padding: '12px 13px 13px', position: 'relative' }}>
      {pinned && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 11, color: T.accent,
        }}>★</span>
      )}
      <div style={{
        fontFamily: T.fontDisplay, fontSize: 13.5, fontWeight: 700, color: T.text,
        lineHeight: 1.2, marginBottom: 4, paddingRight: pinned ? 16 : 0,
      }}>{label}</div>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, lineHeight: 1.4, marginBottom: 8 }}>
        {sets} · {equip}
      </div>
      <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.06em', textTransform: 'uppercase' }}>
        Used {count}×
      </div>
    </Card>
  );
}

function SectionLabel({ T, children, right }) {
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

function WorkoutsLibrary({ T, state = 'default' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 80 }}>
      <Header T={T} kind="home" title="Workouts" subtitle="Logger"/>

      {state === 'error' && (
        <ErrorBanner T={T}
          title="Drive sync paused"
          body="Last sync 2 hours ago. Your logs are still saving locally."
          action="Retry"/>
      )}

      {/* Shelf affordance card — present in both default and empty states */}
      <div style={{ padding: '4px 16px 0' }}>
        <ShelfAffordance T={T}
          copy="Browse Programs & Gameplans"
          sub="Pre-built blocks and coached plans"/>
      </div>

      {state === 'empty' ? (
        <EmptyLibrary T={T}/>
      ) : (
        <>
          {/* View-as-Gameplan card — surfaces at 5+ workouts */}
          <div style={{ padding: '12px 16px 0' }}>
            <Card T={T} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, borderColor: T.accentBorder }}>
              <div style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 999,
                background: T.accentFaint, color: T.accent,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700,
              }}>↗</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>
                  See your <em style={{ fontStyle: 'normal', color: T.accent }}>14 workouts</em> as a Gameplan
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 2, lineHeight: 1.4 }}>
                  Preview adherence, week strip, and recommendations.
                </div>
              </div>
              <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.accent }}>›</span>
            </Card>
          </div>

          {/* Recent — horizontal scroller */}
          <SectionLabel T={T} right="Last 14 days">Recent</SectionLabel>
          <div style={{
            display: 'flex', gap: 10,
            padding: '0 16px 4px',
            overflowX: 'auto',
          }}>
            <RecentWorkoutCard T={T} day="YESTERDAY"   name="Upper · Push"  lifts="Bench · OHP · Lat raise"  dur="52 MIN"/>
            <RecentWorkoutCard T={T} day="MON · 3 AGO" name="Lower · Heavy" lifts="Squat · RDL · Calf"        dur="61 MIN"/>
            <RecentWorkoutCard T={T} day="SAT · 5 AGO" name="Pull · Volume" lifts="Pulldown · Row · Curl"     dur="44 MIN"/>
            <RecentWorkoutCard T={T} day="THU · 7 AGO" name="Stretch"       lifts="Mobility · 9 movements"    dur="18 MIN"/>
          </div>

          {/* Saved frames — 2-col grid */}
          <SectionLabel T={T} right="6 frames">Saved frames</SectionLabel>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            padding: '0 16px',
          }}>
            <FrameTile T={T} label="Push Day A"    sets="5 lifts" equip="Barbell"     count={9} pinned/>
            <FrameTile T={T} label="Pull Day A"    sets="5 lifts" equip="Cable + DB"  count={7}/>
            <FrameTile T={T} label="Lower Heavy"   sets="4 lifts" equip="Barbell"     count={6}/>
            <FrameTile T={T} label="Quick HIIT"    sets="6 rounds" equip="Bodyweight" count={4}/>
            <FrameTile T={T} label="Mobility Flow" sets="9 moves" equip="None"        count={11}/>
            <FrameTile T={T} label="DB Only Full"  sets="6 lifts" equip="Dumbbells"   count={3}/>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyLibrary({ T }) {
  return (
    <div style={{
      padding: '40px 24px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: T.radiusLg || 8,
        background: T.surfaceAlt, border: `1px dashed ${T.border}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: T.textTer, fontFamily: T.fontDisplay, fontSize: 30,
      }}>+</div>
      <div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700,
          color: T.textOnBg || T.text, letterSpacing: '-.01em',
        }} className="ft-on-bg">No workouts yet</div>
        <div style={{
          fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgSec || T.textSec,
          marginTop: 4, lineHeight: 1.45, maxWidth: 280,
        }} className="ft-on-bg">
          Log one and the spreadsheet logger remembers it. Save it as a frame
          and you can repeat it in two taps.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 260 }}>
        <Button T={T} kind="primary" size="lg">Log your first workout</Button>
        <Button T={T} kind="ghost" size="md">Pick from the single-workout library</Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// 3.1 — MY PROGRAM (Program home)

function WeekStrip({ T, days, todayIdx = 2 }) {
  // days: [{ label, type: 'lift' | 'cardio' | 'rest' | 'class' | 'done' }]
  const colorFor = (type, isToday) => {
    const c = {
      lift:   T.push,
      cardio: T.core,
      rest:   T.surfaceAlt,
      class:  T.pull,
      done:   T.success,
    }[type] || T.surfaceAlt;
    return c;
  };
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {days.map((d, i) => {
        const isToday = i === todayIdx;
        const isRest = d.type === 'rest';
        const isDone = d.type === 'done' || (d.completed && !isToday);
        return (
          <div key={i} style={{
            flex: 1, height: 64, borderRadius: T.radiusSm || 4,
            background: isRest ? T.surfaceAlt : colorFor(d.type, isToday),
            opacity: isRest ? 1 : (isDone ? .55 : 1),
            border: isToday ? `2px solid ${T.accent}` : `1px solid ${isRest ? T.borderFaint : 'transparent'}`,
            color: isRest ? T.textTer : T.textOnAccent,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0 7px',
            position: 'relative',
          }}>
            <span style={{
              fontFamily: T.fontData, fontSize: 9.5, letterSpacing: '.08em',
              color: isRest ? T.textTer : isToday ? T.textOnAccent : 'rgba(255,255,255,.85)',
              fontWeight: 600,
            }}>{d.label}</span>
            <span style={{
              fontFamily: T.fontBody, fontSize: 11, fontWeight: 700,
              color: isRest ? T.textTer : isToday ? T.textOnAccent : 'rgba(255,255,255,.95)',
            }}>{d.short}</span>
            {isDone && !isToday && (
              <span style={{ position: 'absolute', bottom: 4, fontSize: 9, color: T.textOnAccent }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TodayCard({ T, name, exercises, dur, glyph = '◐' }) {
  return (
    <Card T={T} raised style={{ padding: '16px 16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: T.radiusMd || 8,
          background: T.accentFaint, color: T.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, flexShrink: 0,
        }}>{glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Stamp T={T}>Wednesday · Today</Stamp>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: T.text,
            marginTop: 3, lineHeight: 1.15, letterSpacing: '-.01em',
          }}>{name}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 3, lineHeight: 1.4 }}>
            {exercises.length} exercises · ~{dur} min
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14, padding: '10px 12px',
        background: T.surfaceAlt, borderRadius: T.radiusMd || 6,
        display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        {exercises.map((e, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.name}
            </span>
            <span style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textTer, letterSpacing: '.02em', flexShrink: 0 }}>
              {e.sets}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Start workout →</Button>
        <Button T={T} kind="secondary" size="lg" style={{ flexShrink: 0 }} glyph="⋯"/>
      </div>
    </Card>
  );
}

function MyProgram({ T, state = 'default' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 80 }}>
      <Header T={T} kind="home" title="My Program" subtitle="Program tier"/>

      {state === 'error' && (
        <ErrorBanner T={T}
          title="Program failed to load"
          body="We couldn't fetch this week's plan. Your saved progress is safe."
          action="Retry"/>
      )}

      {/* Shelf affordances — two side by side */}
      <div style={{ padding: '4px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card T={T} style={{ padding: '12px 12px 13px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Stamp T={T}>Shelf</Stamp>
          <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>
            Browse more programs
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.accent, fontWeight: 600, marginTop: 2 }}>Browse →</span>
        </Card>
        <Card T={T} style={{ padding: '12px 12px 13px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Stamp T={T}>Upgrade</Stamp>
          <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>
            Add coaching with Gameplan
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.accent, fontWeight: 600, marginTop: 2 }}>Browse →</span>
        </Card>
      </div>

      {state === 'empty' ? (
        <EmptyProgram T={T}/>
      ) : (
        <>
          {/* Active program header */}
          <div style={{ padding: '16px 16px 0' }}>
            <div className="ft-on-bg" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em' }}>
                  PPL · Intermediate
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textOnBgSec || T.textSec, marginTop: 2 }}>
                  Week 4 of 12 · Hypertrophy block
                </div>
              </div>
              <Chip T={T} tone="accent" size="sm">Block 2/4</Chip>
            </div>
          </div>

          {/* Today card */}
          <div style={{ padding: '4px 16px 0' }}>
            <TodayCard T={T}
              name="Upper · Push focus"
              dur={52}
              exercises={[
                { name: 'Bench Press',     sets: '4 × 5 · 185 lb' },
                { name: 'Overhead Press',  sets: '3 × 8 · 95 lb'  },
                { name: 'Incline DB Press',sets: '3 × 10 · 60 lb' },
                { name: 'Lateral Raise',   sets: '3 × 12 · 20 lb' },
                { name: 'Tricep Pushdown', sets: '3 × 12 · 50 lb' },
              ]}/>
          </div>

          {/* Week strip */}
          <SectionLabel T={T} right="Tap a day">This week</SectionLabel>
          <div style={{ padding: '0 16px' }}>
            <WeekStrip T={T} todayIdx={2}
              days={[
                { label: 'MON', short: 'Pull',  type: 'done', completed: true },
                { label: 'TUE', short: 'Rest',  type: 'rest' },
                { label: 'WED', short: 'Push',  type: 'lift' },
                { label: 'THU', short: 'Legs',  type: 'lift' },
                { label: 'FRI', short: 'Rest',  type: 'rest' },
                { label: 'SAT', short: 'Pull',  type: 'lift' },
                { label: 'SUN', short: 'Cardio', type: 'cardio' },
              ]}/>
          </div>

          {/* Planning entry */}
          <SectionLabel T={T}>Tools</SectionLabel>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 18, color: T.accent }}>◇</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Planning Mode</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>Edit your program · sandbox · diff · undo</div>
              </div>
              <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
            </Card>
            <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 18, color: T.textSec }}>⇄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Switch active program</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>You own 3 programs · current paused on switch</div>
              </div>
              <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyProgram({ T }) {
  return (
    <div style={{
      padding: '36px 24px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: T.radiusLg || 8,
        background: T.surfaceAlt, border: `1px dashed ${T.border}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: T.textTer, fontFamily: T.fontDisplay, fontSize: 26,
      }}>◇</div>
      <div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700,
          color: T.textOnBg || T.text, letterSpacing: '-.01em',
        }} className="ft-on-bg">No active program</div>
        <div style={{
          fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgSec || T.textSec,
          marginTop: 4, lineHeight: 1.45, maxWidth: 280,
        }} className="ft-on-bg">
          You own programs but haven't activated one. Pick from your library
          or browse the shelf for something new.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 260 }}>
        <Button T={T} kind="primary" size="lg">Activate a program</Button>
        <Button T={T} kind="ghost" size="md">Browse the shelf →</Button>
      </div>

      {/* Owned-programs preview list */}
      <div style={{ width: '100%', marginTop: 14, textAlign: 'left' }}>
        <SectionLabel T={T} right="3 owned">Your library</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['PPL · Intermediate', 'Full Body 3×', 'Powerbuilder'].map((n, i) => (
            <Card T={T} key={n} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 32, height: 32, borderRadius: T.radiusSm || 4,
                background: T.accentFaint, color: T.accent,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700,
              }}>{n.charAt(0)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>{n}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>
                  {i === 0 ? '12 wk · Hypertrophy' : i === 1 ? '8 wk · Strength' : '16 wk · Recomp'}
                </div>
              </div>
              <Button T={T} kind="ghost" size="sm">Activate</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Exports

Object.assign(window, {
  TierLanding,
  WorkoutsLibrary,
  MyProgram,
  Header, BottomNav, Card, Button, Chip, Stamp, ErrorBanner,
});
