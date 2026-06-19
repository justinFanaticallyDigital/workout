// upsell-screens.jsx
// Cluster C — Upsell Surfaces
//   2.10  View-as-Gameplan      — Logger ≥5 workouts; their data, sales overlay
//   6.12a Tier Comparison       — feature matrix across Logger / Program / Gameplan
//
// Both screens reuse the shared primitives from tier-homes-screens.jsx
// (Header, Card, Button, Chip, Stamp, ErrorBanner, BottomNav) — they're already
// on window from the host load order.

const { useState, useMemo } = React;

// ════════════════════════════════════════════════════════════════════════
// 2.10 — VIEW-AS-GAMEPLAN PREVIEW
//
// The premise: it's a real Gameplan dashboard, populated with the user's
// real logger data, with controls inert and a sales overlay on top.
// "You're already doing this — just make it official."

// Adherence ring — small donut with a label below
function Ring({ T, pct, label, value, tone = 'accent' }) {
  const r = 22, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = tone === 'accent' ? T.accent : tone === 'success' ? T.success : T.warn;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke={T.surfaceAlt} strokeWidth="5"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 28 28)"/>
        <text x="28" y="32" textAnchor="middle"
          style={{ fontFamily: T.fontData, fontSize: 13, fontWeight: 700, fill: T.text }}>
          {value}
        </text>
      </svg>
      <div style={{
        fontFamily: T.fontData, fontSize: 9.5, color: T.textTer,
        letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center',
      }}>{label}</div>
    </div>
  );
}

// Mini week strip purpose-built for the preview — 7 dots with type colors
function PreviewWeekStrip({ T, days }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {days.map((d, i) => {
        const typeColor = d.type === 'rest' ? T.surfaceAlt
                         : d.type === 'lift' ? T.push
                         : d.type === 'pull' ? T.pull
                         : d.type === 'cardio' ? T.core
                         : T.accent;
        return (
          <div key={i} style={{
            flex: 1, height: 56, borderRadius: T.radiusSm || 4,
            background: d.logged ? typeColor : T.surfaceAlt,
            opacity: d.logged ? 1 : 1,
            border: d.logged ? 'none' : `1px dashed ${T.border}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0 7px',
          }}>
            <span style={{
              fontFamily: T.fontData, fontSize: 9, letterSpacing: '.08em',
              color: d.logged ? T.textOnAccent : T.textTer,
              fontWeight: 600,
            }}>{d.label}</span>
            {d.logged ? (
              <span style={{ fontSize: 11, color: T.textOnAccent }}>✓</span>
            ) : (
              <span style={{ fontSize: 10, color: T.textTer }}>·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreviewTodayCard({ T, lastWorkout }) {
  return (
    <Card T={T} style={{ padding: '14px 14px 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: T.radiusMd || 8,
          background: T.successBg, color: T.success,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, flexShrink: 0,
        }}>✓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stamp T={T}>{lastWorkout.day}</Stamp>
            <span className="ft-stamp" style={{
              fontFamily: T.fontData, fontSize: 9, letterSpacing: '.18em',
              color: T.success, textTransform: 'uppercase', fontWeight: 700,
            }}>· LOGGED</span>
          </div>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text,
            marginTop: 3, lineHeight: 1.15, letterSpacing: '-.01em',
          }}>{lastWorkout.name}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.4 }}>
            {lastWorkout.summary}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.borderFaint}`,
        fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: T.accent, fontSize: 14 }}>◇</span>
        <span>If a Gameplan were active, today's plan would auto-fill here.</span>
      </div>
    </Card>
  );
}

function GoalArcPlaceholder({ T }) {
  return (
    <Card T={T} style={{ padding: '14px 16px 18px' }}>
      <Stamp T={T}>Goal Arc</Stamp>
      <div style={{
        marginTop: 6, height: 100, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 280 100" width="100%" height="100" style={{ position: 'absolute', inset: 0 }}>
          <path d="M 20 90 Q 140 0 260 80" fill="none" stroke={T.accent}
            strokeWidth="2" strokeDasharray="3 5" opacity=".5"/>
          <circle cx="20" cy="90" r="3.5" fill={T.borderStrong}/>
          <circle cx="260" cy="80" r="5" fill={T.accent} opacity=".4"/>
        </svg>
        <div style={{
          position: 'relative', zIndex: 2, textAlign: 'center',
          background: T.surface, padding: '6px 12px', borderRadius: 999,
          border: `1px dashed ${T.border}`,
        }}>
          <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec, fontWeight: 600 }}>
            Set a goal to see this come alive
          </span>
        </div>
      </div>
    </Card>
  );
}

function MockRecCard({ T }) {
  return (
    <Card T={T} style={{ padding: '13px 14px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999,
          background: T.accentFaint, color: T.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700,
        }}>R</span>
        <Stamp T={T}>Engine recommendation</Stamp>
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, lineHeight: 1.4 }}>
        Your bench has plateaued at 185 × 5. <span style={{ color: T.accent, fontWeight: 600 }}>Drop to 175 × 8 for a hypertrophy block</span> — you'll hit 195 in ~5 weeks.
      </div>
      <div style={{
        marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer,
      }}>
        <span>Based on your last 6 sessions</span>
        <span style={{ color: T.textTer }}>Disabled in preview</span>
      </div>
    </Card>
  );
}

// Soft "PREVIEW" watermark — diagonal repeating pattern, very faint
function Watermark({ T }) {
  // Made of subtle dots only at corners + a small "PREVIEW" stamp top-right
  return (
    <div style={{
      position: 'absolute', top: 12, right: 14, zIndex: 4, pointerEvents: 'none',
      transform: 'rotate(3deg)',
      padding: '3px 8px',
      border: `1.5px solid ${T.accent}`,
      borderRadius: 3,
      fontFamily: T.fontData, fontSize: 9, letterSpacing: '.2em',
      fontWeight: 700, color: T.accent,
      background: T.surface, opacity: .85,
    }}>PREVIEW</div>
  );
}

function ViewAsGameplan({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable region — stops above sticky CTA */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
        <Header T={T} kind="sub" title="Your Gameplan preview" right={null}/>

        {/* Banner */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            padding: '12px 14px',
            background: T.accentFaint,
            border: `1px solid ${T.accentBorder}`,
            borderRadius: T.radiusMd || 8,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: T.fontBody, fontSize: 13.5, color: T.text, fontWeight: 600, lineHeight: 1.35,
            }}>
              Based on your <span style={{ color: T.accent }}>14 logged workouts</span>, here's what a Gameplan would look like.
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec, marginTop: 3, lineHeight: 1.4 }}>
              Real data. Inert controls. Tap CTA to make it real.
            </div>
          </div>
        </div>

        {/* The mock dashboard — wrapped so the watermark anchors over it */}
        <div style={{ position: 'relative', padding: '0 16px' }}>
          <Watermark T={T}/>

          {/* Stacked cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PreviewTodayCard T={T}
              lastWorkout={{
                day: 'Yesterday',
                name: 'Upper · Push',
                summary: 'Bench 185×5 · OHP 95×8 · Lat raise 20×12 · 52 min',
              }}/>

            <GoalArcPlaceholder T={T}/>

            {/* Week strip */}
            <Card T={T} style={{ padding: '12px 14px 14px' }}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8,
              }}>
                <Stamp T={T}>This week · logged</Stamp>
                <span style={{
                  fontFamily: T.fontData, fontSize: 10, color: T.textTer,
                  letterSpacing: '.06em',
                }}>4 / 7 days</span>
              </div>
              <PreviewWeekStrip T={T}
                days={[
                  { label: 'M', logged: true,  type: 'pull' },
                  { label: 'T', logged: false, type: 'rest' },
                  { label: 'W', logged: true,  type: 'lift' },
                  { label: 'T', logged: true,  type: 'lift' },
                  { label: 'F', logged: false, type: 'rest' },
                  { label: 'S', logged: true,  type: 'pull' },
                  { label: 'S', logged: false, type: 'cardio' },
                ]}/>
            </Card>

            {/* Adherence rings */}
            <Card T={T} style={{ padding: '12px 14px 14px' }}>
              <div style={{ marginBottom: 8 }}>
                <Stamp T={T}>Adherence · last 4 weeks</Stamp>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Ring T={T} pct={71} value="71%" label="Workouts"/>
                <Ring T={T} pct={83} value="83%" label="Volume"   tone="success"/>
                <Ring T={T} pct={42} value="3d"  label="Streak"   tone="accent"/>
              </div>
            </Card>

            <MockRecCard T={T}/>
          </div>

          {/* Spacer above sticky CTA */}
          <div style={{ height: 16 }}/>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{
        flexShrink: 0,
        padding: '12px 16px 16px',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        boxShadow: '0 -8px 24px rgba(0,0,0,.04)',
      }}>
        <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>
          Make this real — start a Gameplan →
        </Button>
        <div style={{
          marginTop: 6, textAlign: 'center',
          fontFamily: T.fontBody, fontSize: 11, color: T.textTer,
        }}>
          Subscription · $14/mo · cancel anytime
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.12a — TIER COMPARISON
//
// Mobile pattern: vertical feature rows with three small per-tier columns.
// The user's current tier gets a column accent border + "Current" badge.
// "Preview" cells are tappable (they route out to the feature's preview).

const TIERS = [
  { id: 'logger',   name: 'Logger',   price: 'Free',          priceSub: 'forever' },
  { id: 'program',  name: 'Program',  price: '$29+',          priceSub: 'one-time' },
  { id: 'gameplan', name: 'Gameplan', price: '$14',           priceSub: 'per month' },
];

const FEATURE_GROUPS = [
  {
    id: 'training', title: 'Training',
    rows: [
      ['Log workouts',           '✓', '✓', '✓'],
      ['Exercise library',       '✓', '✓', '✓'],
      ['Custom exercises',       '✓', '✓', '✓'],
      ['PR detection',           '✓', '✓', '✓'],
      ['Saved frames',           '✓', '✓', '✓'],
      ['Pre-built programs',     '–', '✓', '✓'],
      ['Block progression',      '–', '✓', '✓'],
      ['Planning Mode',          '–', '✓', '✓'],
      ['Adaptive deloads',       '–', '–', '✓'],
      ['Engine progression',     '–', '–', '✓'],
    ],
  },
  {
    id: 'nutrition', title: 'Nutrition',
    rows: [
      ['Log meals',              '✓', '✓', '✓'],
      ['Daily macros',           '✓', '✓', '✓'],
      ['Manual targets',         '✓', '✓', '✓'],
      ['Meal plans',             '–', '✓', '✓'],
      ['Model Day',              '–', '✓', '✓'],
      ['Week shuffle / lock',    '–', '✓', '✓'],
      ['Adaptive targets',       '–', '–', '✓'],
      ['AI meal generation',     '–', '–', '✓'],
    ],
  },
  {
    id: 'lifestyle', title: 'Lifestyle',
    rows: [
      ['Manual logging',         '✓', '✓', '✓'],
      ['Wearable sync',          'P', '✓', '✓'],
      ['Targets',                '–', '✓', '✓'],
      ['Routines',               '–', '✓', '✓'],
      ['Cues & contingencies',   '–', '–', '✓'],
      ['Streak detection',       '–', '–', '✓'],
      ['Engine intervention',    '–', '–', '✓'],
    ],
  },
  {
    id: 'crosscut', title: 'Cross-cutting',
    rows: [
      ['All 7 themes',           '✓', '✓', '✓'],
      ['Drive sync',             '✓', '✓', '✓'],
      ['Data export',            '✓', '✓', '✓'],
      ['Progress charts',        '✓', '✓', '✓'],
      ['Adherence rings',        '–', '✓', '✓'],
      ['Check-ins',              '–', '–', '✓'],
      ['Recommendations',        '–', '–', '✓'],
    ],
  },
];

function Cell({ T, kind, isCurrent }) {
  // kind: '✓' included, '–' not, 'P' preview link
  if (kind === '✓') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: 999,
        background: isCurrent ? T.accent : T.successBg,
        color: isCurrent ? T.textOnAccent : T.success,
        fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, lineHeight: 1,
      }}>✓</span>
    );
  }
  if (kind === 'P') {
    return (
      <span style={{
        fontFamily: T.fontData, fontSize: 9, fontWeight: 700,
        color: T.accent, letterSpacing: '.08em',
        padding: '2px 5px', borderRadius: 3,
        border: `1px solid ${T.accentBorder}`,
        background: T.accentFaint,
        whiteSpace: 'nowrap',
      }}>PREVIEW</span>
    );
  }
  // dash / not included
  return (
    <span style={{
      width: 12, height: 1.5, background: T.border, display: 'inline-block',
    }}/>
  );
}

function TierColHeader({ T, tier, isCurrent }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center',
      padding: '10px 4px 12px',
      background: isCurrent ? T.accentFaint : 'transparent',
      borderRadius: T.radiusSm || 4,
      border: isCurrent ? `1px solid ${T.accentBorder}` : '1px solid transparent',
      position: 'relative',
    }}>
      {isCurrent && (
        <span style={{
          position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
          padding: '1px 6px', borderRadius: 999,
          background: T.accent, color: T.textOnAccent,
          fontFamily: T.fontData, fontSize: 8.5, fontWeight: 700,
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>Current</span>
      )}
      <div style={{
        fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.text,
        letterSpacing: '-.01em', lineHeight: 1.1,
      }}>{tier.name}</div>
      <div style={{
        fontFamily: T.fontData, fontSize: 13, fontWeight: 700,
        color: isCurrent ? T.accent : T.textSec, marginTop: 4, letterSpacing: '-.01em',
      }}>{tier.price}</div>
      <div style={{
        fontFamily: T.fontBody, fontSize: 9.5, color: T.textTer,
        letterSpacing: '.04em', marginTop: 1, textTransform: 'uppercase',
      }}>{tier.priceSub}</div>
    </div>
  );
}

function FeatureGroupBlock({ T, group, currentTierIdx }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        padding: '14px 16px 6px',
        fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700,
        color: T.textOnBg || T.text,
        letterSpacing: '.12em', textTransform: 'uppercase',
      }} className="ft-on-bg">
        {group.title}
      </div>
      <div style={{
        margin: '0 12px',
        background: T.surface,
        border: `1px solid ${T.borderFaint}`,
        borderRadius: T.radiusMd || 8,
        overflow: 'hidden',
      }}>
        {group.rows.map(([label, l, p, g], i) => (
          <div key={label} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 44px 44px 60px',
            alignItems: 'center',
            padding: '10px 12px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
            background: 'transparent',
          }}>
            <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.text, lineHeight: 1.3 }}>
              {label}
            </span>
            <span style={{ textAlign: 'center', background: currentTierIdx === 0 ? T.accentFaint : 'transparent', margin: '-10px -4px', padding: '10px 4px', borderLeft: `1px solid ${T.borderFaint}` }}>
              <Cell T={T} kind={l} isCurrent={currentTierIdx === 0}/>
            </span>
            <span style={{ textAlign: 'center', background: currentTierIdx === 1 ? T.accentFaint : 'transparent', margin: '-10px -4px', padding: '10px 4px', borderLeft: `1px solid ${T.borderFaint}` }}>
              <Cell T={T} kind={p} isCurrent={currentTierIdx === 1}/>
            </span>
            <span style={{ textAlign: 'center', background: currentTierIdx === 2 ? T.accentFaint : 'transparent', margin: '-10px -4px', padding: '10px 4px', borderLeft: `1px solid ${T.borderFaint}` }}>
              <Cell T={T} kind={g} isCurrent={currentTierIdx === 2}/>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TierCTAStrip({ T, currentTierIdx }) {
  const labels = [
    currentTierIdx === 0 ? 'Current' : 'Switch to Logger',
    currentTierIdx === 1 ? 'Current' : 'Browse Programs',
    currentTierIdx === 2 ? 'Current' : 'Start a Gameplan',
  ];
  return (
    <div style={{
      flexShrink: 0,
      padding: '10px 12px 14px',
      background: T.surface,
      borderTop: `1px solid ${T.borderFaint}`,
      boxShadow: '0 -8px 24px rgba(0,0,0,.04)',
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
    }}>
      {labels.map((label, i) => {
        const isCurrent = i === currentTierIdx;
        return (
          <button key={i} disabled={isCurrent} style={{
            padding: '10px 6px',
            borderRadius: T.radiusMd || 8,
            background: isCurrent ? T.surfaceAlt : i === 2 ? T.accent : 'transparent',
            color: isCurrent ? T.textTer : i === 2 ? T.textOnAccent : T.accent,
            border: isCurrent ? `1px solid ${T.borderFaint}` : i === 2 ? `1px solid ${T.accent}` : `1px solid ${T.accentBorder}`,
            fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 700, letterSpacing: '.01em',
            cursor: isCurrent ? 'default' : 'pointer',
            lineHeight: 1.2,
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function TierComparison({ T, currentTier = 'logger' }) {
  const currentTierIdx = TIERS.findIndex(t => t.id === currentTier);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Compare tiers"/>

      {/* Sticky-ish tier column header */}
      <div style={{
        flexShrink: 0,
        padding: '6px 12px 10px',
        background: T.bg, // sits on the page bg
        borderBottom: `1px solid ${T.borderFaint}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 90, flexShrink: 0 }}/>
          {TIERS.map((t, i) => (
            <TierColHeader key={t.id} T={T} tier={t} isCurrent={i === currentTierIdx}/>
          ))}
        </div>
      </div>

      {/* Feature group scroll region */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
        {/* Column header above the matrix — labels for the three columns */}
        <div style={{
          padding: '10px 16px 8px',
          fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgSec || T.textSec, lineHeight: 1.4,
        }} className="ft-on-bg">
          Every feature, every tier. <span style={{ color: T.textOnBgTer || T.textTer }}>
            <span style={{ fontFamily: T.fontData, fontSize: 9, fontWeight: 700, color: T.accent, letterSpacing: '.08em' }}>PREVIEW</span> cells open the feature so you can try it before upgrading.
          </span>
        </div>
        {FEATURE_GROUPS.map((g) => (
          <FeatureGroupBlock key={g.id} T={T} group={g} currentTierIdx={currentTierIdx}/>
        ))}
        <div style={{ height: 4 }}/>
      </div>

      {/* Sticky CTAs */}
      <TierCTAStrip T={T} currentTierIdx={currentTierIdx}/>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Exports

Object.assign(window, {
  ViewAsGameplan,
  TierComparison,
  TIERS,
});
