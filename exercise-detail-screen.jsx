// exercise-detail-screen.jsx
// 2.3 — Exercise Detail  ·  /exercises/[id]
//
// The high-traffic surface tapped from any lane in the logger or the Library.
// Four things, in order of how often they're checked:
//   1. e1RM trend     — estimated 1-rep-max per week (Epley), as a mini chart
//   2. Progression     — one factual "next session" suggestion from the trend
//   3. Set history     — every week's sets, most recent first
//   4. Alternates      — the lane's variant list, tap to swap
// Tier-aware: a Logger sees all the data but the custom-exercise editor is
// LOCKED (dimmed + lock + factual line) — never a gate (CLAUDE.md).
//
// Reads the real mock exercise from logger-data.jsx (window.SESSION lane l1).
// Reuses Card / Button / Chip / Stamp / Header, RailGlyph. Locals ED-prefixed.

const { useState, useMemo } = React;

function edEpley(w, r) { return w > 0 ? Math.round(w * (1 + r / 30)) : 0; }

// Best (max) Epley 1RM across a week's set array.
function edWeekE1RM(sets) {
  return Math.max(0, ...sets.map((s) => (s.w != null && s.r != null ? edEpley(s.w, s.r) : 0)));
}

// ── e1RM mini trend chart ─────────────────────────────────────────────────
function EDTrendChart({ T, points, weeks }) {
  const W = 330, H = 132, padX = 8, padTop = 14, padBot = 22;
  const vals = points;
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max - min);
  const pad = span * 0.35;
  const lo = min - pad, hi = max + pad;
  const x = (i) => padX + (i / (vals.length - 1)) * (W - padX * 2);
  const y = (v) => padTop + (1 - (v - lo) / (hi - lo)) * (H - padTop - padBot);
  const line = vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(vals.length - 1).toFixed(1)} ${(H - padBot).toFixed(1)} L ${x(0).toFixed(1)} ${(H - padBot).toFixed(1)} Z`;
  const lastI = vals.length - 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="edFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.accent} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={T.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={padX} y1={H - padBot} x2={W - padX} y2={H - padBot} stroke={T.borderFaint || T.border} strokeWidth="1"/>
      <path d={area} fill="url(#edFill)"/>
      <path d={line} fill="none" stroke={T.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {vals.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={i === lastI ? 4.5 : 3} fill={i === lastI ? T.accent : T.surface} stroke={T.accent} strokeWidth="2"/>
          <text x={x(i)} y={H - 7} textAnchor="middle" fill={T.textTer} fontFamily={T.fontData} fontSize="9.5" letterSpacing=".06em">{weeks[i]}</text>
        </g>
      ))}
      <text x={x(lastI)} y={y(vals[lastI]) - 9} textAnchor="middle" fill={T.text} fontFamily={T.fontNumber} fontSize="12" fontWeight="700">{vals[lastI]}</text>
    </svg>
  );
}

function EDStat({ T, label, value, unit, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: '.01em' }}>{value}</span>
        {unit && <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>{sub}</div>}
    </div>
  );
}

function EDSetChip({ T, set, best }) {
  const bw = set.w === 0;
  // On the page bg (no Card), the chip carries its OWN opaque dark surface
  // (surfaceAlt is opaque in every theme), so white T.text reads everywhere —
  // incl. Blueprint's light page bg. "best" must NOT use the translucent
  // accentFaint wash here (it composites to near-white on Blueprint); it stays
  // on the opaque surface and is marked with an accent border + star instead.
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
      padding: '4px 8px', borderRadius: T.radiusSm || 4,
      background: T.surfaceAlt,
      border: `1px solid ${best ? (T.accentBorderOnBg || T.accentBorder) : (T.borderFaint || T.border)}`,
      fontFamily: T.fontNumber, fontSize: 12, fontWeight: 700, color: T.text,
    }}>
      {best && <span style={{ color: T.accent, fontSize: 10, marginRight: 1, alignSelf: 'center' }}>★</span>}
      <span>{bw ? 'BW' : set.w}</span>
      <span style={{ color: T.textTer }}>×</span>
      <span>{set.r}</span>
      <span style={{ fontWeight: 400, fontSize: 9, color: T.textTer, marginLeft: 1 }}>@{set.rpe}</span>
    </span>
  );
}

function EDWeekRow({ T, label, date, sets, e1rm, isCurrent }) {
  const best = Math.max(0, ...sets.map((s) => s.w || 0));
  return (
    <div className="ft-on-bg" style={{ padding: '12px 0', borderTop: `1px solid ${T.borderFaint}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: T.fontData, fontSize: 11.5, fontWeight: 700, color: isCurrent ? (T.accentOnBg || T.accent) : (T.textOnBgSec || T.textSec), letterSpacing: '.06em' }}>{label}</span>
          <span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textOnBgTer || T.textTer, letterSpacing: '.03em' }}>{date}</span>
          {isCurrent && <Chip T={T} tone="accent" size="sm" onBg>Latest</Chip>}
        </div>
        <span style={{ fontFamily: T.fontNumber, fontSize: 11.5, color: T.textOnBgTer || T.textTer }}>e1RM {e1rm}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {sets.map((s, i) => <EDSetChip key={i} T={T} set={s} best={(s.w || 0) === best && best > 0}/>)}
      </div>
    </div>
  );
}

function EDSwapRow({ T, name, onClick }) {
  return (
    <Card T={T} onClick={onClick} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <span style={{
        width: 30, height: 30, borderRadius: T.radiusSm || 4, flexShrink: 0,
        background: T.surfaceAlt, color: T.textSec,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <TLTypeGlyph kind="lift" size={16} color={T.textSec}/>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <span style={{ fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 700, color: T.accent, whiteSpace: 'nowrap' }}>Swap</span>
    </Card>
  );
}

function ExerciseDetail({ T, tier = 'logger' }) {
  const lane = window.SESSION.lanes[0]; // Bench Press — Incline Barbell
  const weeks = window.SESSION.weeks;
  const wi = window.SESSION.currentWeekIdx;
  const e1rms = lane.sets.map(edWeekE1RM);
  const cur = e1rms[wi], prev = e1rms[wi - 1];
  const delta = cur - prev;
  const pct = prev ? Math.round((delta / prev) * 100) : 0;

  // best ever single set (by e1RM)
  let bestSet = null, bestE = 0;
  lane.sets.forEach((wk) => wk.forEach((s) => {
    if (s.w != null) { const e = edEpley(s.w, s.r); if (e > bestE) { bestE = e; bestSet = s; } }
  }));

  // progression: latest top set RPE vs target
  const latest = lane.sets[wi];
  const topSet = latest.reduce((a, b) => ((b.w || 0) > (a.w || 0) ? b : a), latest[0]);
  const roomToGo = topSet.rpe < lane.rpeTarget;
  const suggestWeight = topSet.w + (roomToGo ? 5 : 0);

  const [variant, setVariant] = useState(lane.variant);
  const alternates = lane.variants.filter((v) => v !== variant);
  const short = variant.split(' — ')[0];
  const detail = variant.split(' — ')[1] || '';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title={short} subtitle={`${detail} · ${lane.category}`}/>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '4px 16px 92px' }}>

        {/* key stats */}
        <Card T={T} raised style={{ padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Stamp T={T}>Estimated 1RM</Stamp>
            <Chip T={T} tone={delta >= 0 ? 'success' : 'warn'} size="sm">{delta >= 0 ? '+' : ''}{delta} lb · {pct >= 0 ? '+' : ''}{pct}%</Chip>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <EDStat T={T} label="Current" value={cur} unit="lb" sub="this week"/>
            <EDStat T={T} label="Best set" value={`${bestSet.w}×${bestSet.r}`} sub={`e1RM ${bestE}`}/>
            <EDStat T={T} label="Target" value={`${lane.targetReps}`} sub={`@ RPE ${lane.rpeTarget}`}/>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderFaint}` }}>
            <EDTrendChart T={T} points={e1rms} weeks={weeks.map((w) => w.label)}/>
          </div>
        </Card>

        {/* progression suggestion */}
        <div style={{ marginTop: 12 }}>
          <Card T={T} style={{ padding: '14px 16px', borderColor: T.accentBorder }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{
                width: 38, height: 38, borderRadius: T.radiusMd || 8, flexShrink: 0,
                background: T.accentFaint, color: T.accent,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Stamp T={T}>Next session</Stamp>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text, marginTop: 3, letterSpacing: '-.01em' }}>
                  Try {suggestWeight} lb × {lane.targetReps.split('-')[0]}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec, marginTop: 4, lineHeight: 1.45 }}>
                  {roomToGo
                    ? `Last top set ${topSet.w}×${topSet.r} @ RPE ${topSet.rpe} — under your RPE ${lane.rpeTarget} target.`
                    : `Last top set hit RPE ${topSet.rpe}. Hold the load and add a rep.`}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* set history */}
        <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec || T.textSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '18px 2px 2px' }}>
          Set history
        </div>
        <div style={{ marginTop: 0 }}>
          {weeks.map((w, i) => i).reverse().map((i) => (
            <EDWeekRow key={i} T={T} label={weeks[i].label} date={weeks[i].date} sets={lane.sets[i]} e1rm={e1rms[i]} isCurrent={i === wi}/>
          ))}
        </div>

        {/* alternates */}
        <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec || T.textSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '20px 2px 9px' }}>
          Alternates · {alternates.length}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alternates.map((v) => (
            <EDSwapRow key={v} T={T} name={v} onClick={() => setVariant(v)}/>
          ))}
        </div>

        {/* custom editor — tier-locked for Logger */}
        <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec || T.textSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '20px 2px 9px' }}>
          Customize
        </div>
        <Card T={T} style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: tier === 'logger' ? 0.62 : 1 }}>
          <span style={{
            width: 34, height: 34, borderRadius: T.radiusMd || 8, flexShrink: 0,
            background: T.surfaceAlt, color: T.textTer,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            {tier === 'logger' && (
              <span style={{ position: 'absolute', right: -4, bottom: -4, width: 14, height: 14, borderRadius: 999, background: T.surface, color: T.textTer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <RailGlyph name="lock" size={9} color={T.textTer} strokeWidth={2.2}/>
              </span>
            )}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>Edit exercise</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>
              {tier === 'logger' ? 'Custom exercises unlock with Program' : 'Rename · tags · default loads · notes'}
            </div>
          </div>
          {tier === 'logger'
            ? <Chip T={T} tone="neutral" size="sm">Locked</Chip>
            : <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>}
        </Card>
      </div>

      {/* footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px 16px', background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`, display: 'flex', gap: 8,
      }}>
        <Button T={T} kind="secondary" size="lg" style={{ flexShrink: 0 }}>History</Button>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Add to workout →</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ExerciseDetail, edEpley });
