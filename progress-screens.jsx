// progress-screens.jsx
// 3.6 — PROGRESS (Program) · /progress
// 4.6 — PROGRESS (Gameplan, full) reuses this same module via `tier`.
//
// Net-new surface. Shared base = metric trend chart + month adherence calendar
// + full workout history. The two tiers diverge in the middle band:
//   • Program  → two LOCKED preview cards (weekly check-in · recommendations) —
//                the Gameplan upsell, never a gate.
//   • Gameplan → the real superset: three this-week adherence RINGS, the weekly
//                check-in history, and the recommendation ledger.
// 4.6 is `<ProgressScreen tier="gameplan"/>`.
//
// States: default · empty (not enough logged yet) · error (load failed).
//
// Charts are drawn from the mock series with plain SVG (polyline + area + a
// labelled last point) — restrained, factual, no chart library.
//
// Reuses Header, Card, Button, Chip, Stamp, SectionLabel, ErrorBanner.
// Locals PG-prefixed.

const { useState: usePG } = React;

// ── metric series ───────────────────────────────────────────────────────────
const PG_METRICS = {
  e1rm:   { label: 'Bench e1RM', unit: 'lb', up: true,  series: [218, 222, 225, 224, 231, 236, 240, 245], delta: '+27 lb · 8 wk' },
  volume: { label: 'Weekly volume', unit: 'k lb', up: true, series: [38, 41, 39, 43, 42, 45, 44, 47], delta: '+9k · 8 wk' },
  weight: { label: 'Bodyweight', unit: 'lb', up: false, series: [182, 181.4, 181, 180.2, 179.6, 179.1, 178.7, 178.4], delta: '−3.6 lb · 8 wk' },
};

// ── line/area chart ──────────────────────────────────────────────────────────
function PGChart({ T, metric }) {
  const m = PG_METRICS[metric] || PG_METRICS.e1rm;
  const W = 288, H = 132, padL = 8, padR = 8, padT = 14, padB = 18;
  const vals = m.series;
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = (max - min) || 1;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const x = (i) => padL + (i / (vals.length - 1)) * innerW;
  const y = (v) => padT + innerH - ((v - min) / span) * innerH;
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${padL},${padT + innerH} ${pts} ${padL + innerW},${padT + innerH}`;
  const last = vals[vals.length - 1];
  return (
    <Card T={T} raised style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <Stamp T={T}>{m.label}</Stamp>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 5 }}>
            <span style={{ fontFamily: T.fontNumber, fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1 }}>{last}</span>
            <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textTer }}>{m.unit}</span>
          </div>
        </div>
        <Chip T={T} tone={m.up ? 'success' : 'accent'} size="sm">{m.delta}</Chip>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 132, marginTop: 8, display: 'block', overflow: 'visible' }}>
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={padL} x2={padL + innerW} y1={padT + g * innerH} y2={padT + g * innerH} stroke={T.borderFaint} strokeWidth="1"/>
        ))}
        <polygon points={area} fill={T.accentFaint}/>
        <polyline points={pts} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {vals.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === vals.length - 1 ? 4 : 2.4}
            fill={i === vals.length - 1 ? T.accent : T.surface} stroke={T.accent} strokeWidth="1.6"/>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        {['8 wk', '6', '4', '2', 'Now'].map((l) => (
          <span key={l} style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.04em' }}>{l}</span>
        ))}
      </div>
    </Card>
  );
}

// ── adherence calendar ────────────────────────────────────────────────────────
// status: full | partial | rest | none | future
const PG_CAL = [
  ['rest','full','full','rest','partial','full','rest'],
  ['rest','full','full','rest','full','full','rest'],
  ['rest','full','partial','rest','full','full','rest'],
  ['rest','full','full','rest','full','partial','rest'],
  ['rest','full','future','future','future','future','future'],
];
const PG_CAL_EMPTY = [
  ['none','none','none','none','none','full','rest'],
  ['rest','full','partial','future','future','future','future'],
  ...Array(3).fill(['future','future','future','future','future','future','future']),
];

function PGCalendar({ T, data }) {
  const color = (s) => ({
    full: T.accent, partial: T.accentFaint, rest: T.surfaceAlt, none: 'transparent', future: 'transparent',
  }[s]);
  const legend = [['Trained', T.accent], ['Partial', T.accentFaint], ['Rest', T.surfaceAlt]];
  return (
    <Card T={T} style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 700, color: T.text }}>May 2026</span>
        <div style={{ display: 'flex', gap: 12 }}>
          {legend.map(([l, c]) => (
            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.03em' }}>
              <span style={{ width: 9, height: 9, borderRadius: T.radiusSm || 2, background: c, border: c === 'transparent' ? `1px solid ${T.border}` : 'none' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 5 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: T.fontData, fontSize: 9, fontWeight: 700, color: T.textTer, letterSpacing: '.04em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {data.map((wk, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {wk.map((s, di) => (
              <div key={di} style={{
                aspectRatio: '1', borderRadius: T.radiusSm || 3,
                background: color(s),
                border: s === 'future' ? `1px dashed ${T.borderFaint}` : s === 'none' ? `1px solid ${T.borderFaint}` : 'none',
              }}/>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── history list ──────────────────────────────────────────────────────────────
const PG_HISTORY = [
  { date: 'Wed · May 27', name: 'Upper · Push',  stat: '52 min · 18.2k lb', pr: true },
  { date: 'Mon · May 25', name: 'Lower · Heavy', stat: '61 min · 24.1k lb', pr: false },
  { date: 'Sat · May 23', name: 'Pull · Volume', stat: '44 min · 14.8k lb', pr: true },
  { date: 'Thu · May 21', name: 'Upper · Push',  stat: '49 min · 17.6k lb', pr: false },
  { date: 'Tue · May 19', name: 'Lower · Heavy', stat: '58 min · 23.3k lb', pr: false },
];

function PGHistory({ T, rows }) {
  return (
    <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map((h, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
          borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: T.success, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
              {h.pr && <Chip T={T} tone="accent" size="sm">PR</Chip>}
            </div>
            <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>{h.date} · {h.stat}</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </div>
      ))}
    </Card>
  );
}

// ── preview cards — locked at Program, unlocked at Gameplan ────────────────────
function PGPreviewCard({ T, locked, stamp, title, lines, cta }) {
  return (
    <Card T={T} raised={locked} style={{ padding: 16, borderColor: locked ? T.accentBorder : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stamp T={T}>{stamp}</Stamp>
        {locked && <Chip T={T} tone="neutral" size="sm">Locked</Chip>}
      </div>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 6, letterSpacing: '-.01em' }}>{title}</div>
      <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lines.map((f) => (
          <div key={f} style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, display: 'flex', gap: 8 }}>
            <span style={{ color: T.accent, marginTop: 1 }}>·</span><span>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 13 }}>
        <Button T={T} kind={locked ? 'primary' : 'secondary'} size="md" style={{ width: '100%' }}>{cta}</Button>
      </div>
    </Card>
  );
}

// ── adherence rings — GAMEPLAN superset ───────────────────────────────────────
// Three this-week completion rings (the engine measures adherence to all three
// pillars, not just training). Locked behind Gameplan; never shown at Program.
const PG_RINGS = [
  { label: 'Training',  pct: 100, sub: '5 of 5' },
  { label: 'Nutrition', pct: 86,  sub: '6 of 7' },
  { label: 'Lifestyle', pct: 57,  sub: '4 of 7' },
];

function PGRing({ T, pct, label, sub }) {
  const R = 25, sw = 6, C = 2 * Math.PI * R;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * C;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 66, height: 66 }}>
        <svg viewBox="0 0 66 66" style={{ width: 66, height: 66, transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx="33" cy="33" r={R} fill="none" stroke={T.surfaceAlt} strokeWidth={sw}/>
          <circle cx="33" cy="33" r={R} fill="none" stroke={T.accent} strokeWidth={sw}
            strokeDasharray={`${dash} ${C}`} strokeLinecap="round"/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontNumber, fontSize: 18, fontWeight: 700, color: T.text, lineHeight: 1,
        }}>{pct}<span style={{ fontSize: 9, color: T.textTer, marginLeft: 1, alignSelf: 'flex-start', marginTop: 2 }}>%</span></div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.text }}>{label}</div>
        <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>{sub}</div>
      </div>
    </div>
  );
}

function PGRings({ T, rings }) {
  return (
    <Card T={T} style={{ padding: '16px 12px' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {rings.map((r) => <PGRing key={r.label} T={T} {...r}/>)}
      </div>
    </Card>
  );
}

// ── weekly check-in history — GAMEPLAN superset ───────────────────────────────
// Newest first; the top row is the pending check-in (actionable), the rest are
// the applied archive. Each row routes to its 4.7 Check-in Detail.
const PG_CHECKINS = [
  { week: 'Week of May 25', status: 'ready',   note: '6 metrics · due Sunday' },
  { week: 'Week of May 18', status: 'applied', note: '+5 lb bench · −150 kcal' },
  { week: 'Week of May 11', status: 'applied', note: 'Deload Thu · soreness high' },
  { week: 'Week of May 4',  status: 'applied', note: '+0.25 lb/wk target' },
];

function PGCheckins({ T, rows }) {
  return (
    <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map((c, i) => {
        const ready = c.status === 'ready';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: ready ? T.accent : T.success }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.week}</span>
                <Chip T={T} tone={ready ? 'accent' : 'success'} size="sm">{ready ? 'Ready' : 'Applied'}</Chip>
              </div>
              <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>{c.note}</div>
            </div>
            {ready
              ? <Button T={T} kind="primary" size="sm">Start</Button>
              : <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>}
          </div>
        );
      })}
    </Card>
  );
}

// ── recommendation history — GAMEPLAN superset ────────────────────────────────
// Engine recs as a resolved timeline (applied / dismissed). The live feed is 4.3;
// this is the read-only ledger inside Progress.
const PG_RECS = [
  { rec: 'Drop Thu volume 1 set', status: 'applied',   meta: 'soreness high · May 27' },
  { rec: 'Add 0.25 lb/wk',        status: 'applied',   meta: 'weight loss stalled · May 25' },
  { rec: 'Trap-bar deadlift',     status: 'dismissed', meta: 'kept conventional · May 22' },
  { rec: '+150 kcal on lift days',status: 'applied',   meta: 'recovery low · May 20' },
];

function PGRecs({ T, rows }) {
  return (
    <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map((r, i) => {
        const applied = r.status === 'applied';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: applied ? T.text : T.textSec }}>{r.rec}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>{r.meta}</div>
            </div>
            <Chip T={T} tone={applied ? 'success' : 'neutral'} size="sm">{applied ? 'Applied' : 'Dismissed'}</Chip>
          </div>
        );
      })}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════
// assembled screen

function ProgressScreen({ T, tier = 'program', state = 'default', metric = 'e1rm', onSetMetric }) {
  const setM = onSetMetric || (() => {});
  const gameplan = tier === 'gameplan';
  const empty = state === 'empty';
  const metricOpts = [
    { value: 'e1rm', label: 'e1RM' },
    { value: 'volume', label: 'Volume' },
    { value: 'weight', label: 'Weight' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 92 }}>
      <Header T={T} kind="home" title="Progress" subtitle={gameplan ? 'Gameplan' : 'Program'}/>

      {state === 'error' && (
        <div style={{ paddingTop: 4 }}>
          <ErrorBanner T={T} title="Progress failed to load" body="Charts couldn't fetch. Your logged sessions are safe." action="Retry"/>
        </div>
      )}

      {empty ? (
        <div style={{ padding: '12px 16px 0' }}>
          <Card T={T} style={{ padding: '28px 22px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: T.radiusLg || 8, margin: '0 auto 14px',
              background: T.surfaceAlt, border: `1px dashed ${T.border}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: T.textTer, fontSize: 26,
            }}>📈</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>Not enough data yet</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textTer, marginTop: 5, lineHeight: 1.45 }}>
              Trends unlock after 2 weeks of logged sessions. 3 of 6 logged.
            </div>
          </Card>
          <SectionLabel T={T} right="3 logged">Recent</SectionLabel>
          <PGHistory T={T} rows={PG_HISTORY.slice(0, 3)}/>
          <SectionLabel T={T}>Adherence</SectionLabel>
          <PGCalendar T={T} data={PG_CAL_EMPTY}/>
        </div>
      ) : (
        <div style={{ padding: '12px 16px 0' }}>
          {/* metric trend — shared base */}
          <Segmented T={T} value={metric} onChange={setM} options={metricOpts}/>
          <div style={{ marginTop: 12 }}>
            <PGChart T={T} metric={metric}/>
          </div>

          {gameplan ? (
            <>
              {/* adherence rings — the Gameplan superset opener */}
              <SectionLabel T={T} right="This week">Adherence</SectionLabel>
              <PGRings T={T} rings={PG_RINGS}/>
              <div style={{ marginTop: 10 }}>
                <PGCalendar T={T} data={PG_CAL}/>
              </div>

              {/* weekly check-in history */}
              <SectionLabel T={T} right="4 weeks →">Weekly check-ins</SectionLabel>
              <PGCheckins T={T} rows={PG_CHECKINS}/>

              {/* recommendation ledger */}
              <SectionLabel T={T} right="See feed →">Recommendations</SectionLabel>
              <PGRecs T={T} rows={PG_RECS}/>
            </>
          ) : (
            <>
              <SectionLabel T={T} right="18 sessions · 4 wk">Adherence</SectionLabel>
              <PGCalendar T={T} data={PG_CAL}/>

              {/* locked upsell — the Gameplan teaser, never a gate */}
              <SectionLabel T={T}>With Gameplan</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PGPreviewCard T={T} locked
                  stamp="Weekly check-in"
                  title="Weekly check-in"
                  lines={['Confirm weight, energy, soreness weekly', 'Engine tunes loads + macros from it']}
                  cta="See Gameplan →"/>
                <PGPreviewCard T={T} locked
                  stamp="Recommendations"
                  title="Recommendation feed"
                  lines={['Engine flags changes as you train', 'Accept or dismiss, one tap each']}
                  cta="Compare tiers →"/>
              </div>
            </>
          )}

          <SectionLabel T={T} right="Full history →">Workout history</SectionLabel>
          <PGHistory T={T} rows={PG_HISTORY}/>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  PG_METRICS, PGChart, PGCalendar, PGHistory, PGPreviewCard,
  PG_RINGS, PGRing, PGRings, PG_CHECKINS, PGCheckins, PG_RECS, PGRecs,
  ProgressScreen,
});
