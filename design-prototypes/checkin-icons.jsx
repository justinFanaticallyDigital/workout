// Lab Report icon system — monochrome, currentColor, ~16px native viewBox
// Used across snapshot tiles, recommendation pills, history strip, breakdown table.

// ─── Metric icons (one glyph per tracked metric) ──────────────
function IconWeight({ size = 16, color = 'currentColor', style }) {
  // Bathroom scale — rect platform + dial arc
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3.5" width="12" height="9" rx="1.2"/>
        <path d="M5 8.5 A 3 3 0 0 1 11 8.5"/>
        <line x1="8" y1="5.8" x2="8" y2="8.5"/>
        <circle cx="8" cy="8.5" r=".7" fill={color} stroke="none"/>
        <line x1="4.2" y1="11" x2="11.8" y2="11"/>
      </g>
    </svg>
  );
}

function IconBarbell({ size = 16, color = 'currentColor', style }) {
  // Two plates + bar
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round">
        <rect x="0.5" y="6" width="1.5" height="4" rx=".3"/>
        <rect x="2.5" y="4" width="2" height="8" rx=".4"/>
        <rect x="11.5" y="4" width="2" height="8" rx=".4"/>
        <rect x="14" y="6" width="1.5" height="4" rx=".3"/>
        <rect x="4.5" y="7.3" width="7" height="1.4" rx=".2"/>
      </g>
    </svg>
  );
}

function IconFlame({ size = 16, color = 'currentColor', style }) {
  // Calories — clean flame outline
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5 C 9 4 11 5 11 8 C 11 10.8 9.5 13 8 13 C 6.5 13 5 10.8 5 8.5 C 5 7 5.8 6.2 6.5 6 C 6.2 4.5 7.2 3 8 1.5 Z"/>
        <path d="M8 9 C 8.5 10 9 10.5 9 11.5 C 9 12.3 8.5 13 8 13" opacity=".55"/>
      </g>
    </svg>
  );
}

function IconMoon({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <path d="M11.5 9.5 A 5.2 5.2 0 1 1 6.5 3 A 4 4 0 0 0 11.5 9.5 Z"
            fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSteps({ size = 16, color = 'currentColor', style }) {
  // Footprint — two ovals offset
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill={color}>
        <ellipse cx="5.5" cy="4.5" rx="2" ry="2.5"/>
        <ellipse cx="4" cy="9" rx="1" ry="1.2" opacity=".7"/>
        <ellipse cx="6.2" cy="9.4" rx="1" ry="1.2" opacity=".7"/>
        <ellipse cx="10.5" cy="11.5" rx="2" ry="2.5"/>
        <ellipse cx="9" cy="7" rx="1" ry="1.2" opacity=".7"/>
        <ellipse cx="11.2" cy="7.4" rx="1" ry="1.2" opacity=".7"/>
      </g>
    </svg>
  );
}

function IconPulse({ size = 16, color = 'currentColor', style }) {
  // Heart rate / mood pulse line
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <path d="M1 8 L4 8 L5.5 4 L7.5 12 L9.5 6 L11 8 L15 8"
            fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCalendar({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round">
        <rect x="2" y="3.5" width="12" height="10.5" rx="1.2"/>
        <line x1="2" y1="6.5" x2="14" y2="6.5"/>
        <line x1="5" y1="2" x2="5" y2="5"/>
        <line x1="11" y1="2" x2="11" y2="5"/>
        <rect x="5.5" y="9" width="1.8" height="1.8" fill={color} stroke="none"/>
        <rect x="8.5" y="9" width="1.8" height="1.8" fill={color} stroke="none"/>
      </g>
    </svg>
  );
}

function IconGauge({ size = 16, color = 'currentColor', style }) {
  // Speed/rate adjustment — half-circle dial with needle
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11 A 6 6 0 0 1 14 11"/>
        <line x1="8" y1="11" x2="11.5" y2="6.5"/>
        <circle cx="8" cy="11" r=".9" fill={color} stroke="none"/>
        <line x1="3.5" y1="11" x2="3" y2="11"/>
        <line x1="12.5" y1="11" x2="13" y2="11"/>
      </g>
    </svg>
  );
}

function IconInfo({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <circle cx="8" cy="8" r="6.5" fill="none" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="5" r=".9" fill={color}/>
      <line x1="8" y1="7.5" x2="8" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconWarn({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <path d="M8 1.5 L14.5 13 L1.5 13 Z" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="8" y1="6" x2="8" y2="9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.9" fill={color}/>
    </svg>
  );
}

function IconCheckCircle({ size = 16, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', ...style }}>
      <circle cx="8" cy="8" r="6.5" fill={color}/>
      <path d="M5 8.2 L7 10.2 L11 6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Status shape (redundant w/ color for accessibility) ──────
function StatusGlyph({ tone = 'green', size = 10, style }) {
  // ▲ = ahead, ◆ = monitor, ▼ = behind, ◯ = neutral/scheduled
  const color = tone === 'green' ? '#15803D' : tone === 'yellow' ? '#C77405' : tone === 'red' ? '#B42318' : '#2563EB';
  if (tone === 'green') return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: 'block', ...style }}>
      <path d="M5 1.5 L9 8.5 L1 8.5 Z" fill={color}/>
    </svg>
  );
  if (tone === 'red') return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: 'block', ...style }}>
      <path d="M5 8.5 L9 1.5 L1 1.5 Z" fill={color}/>
    </svg>
  );
  if (tone === 'yellow') return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: 'block', ...style }}>
      <path d="M5 1 L9 5 L5 9 L1 5 Z" fill={color}/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: 'block', ...style }}>
      <circle cx="5" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

// ─── Delta token (signed value with arrowhead) ─────────────────
function DeltaToken({ value, unit, tone = 'red', size = 11, style }) {
  // value: string like "+0.3" or "−1.1" (with sign)
  const color = tone === 'red' ? '#B42318' : tone === 'yellow' ? '#C77405' : tone === 'green' ? '#15803D' : '#3A4254';
  const sign = value.startsWith('+') ? 'up' : (value.startsWith('−') || value.startsWith('-')) ? 'down' : 'flat';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color, ...style }}>
      <svg width={size - 2} height={size - 2} viewBox="0 0 8 8" style={{ display: 'block' }}>
        {sign === 'up' && <path d="M4 1.5 L7 6 L1 6 Z" fill={color}/>}
        {sign === 'down' && <path d="M4 6.5 L7 2 L1 2 Z" fill={color}/>}
        {sign === 'flat' && <rect x="1" y="3.5" width="6" height="1.4" fill={color}/>}
      </svg>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: size,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '.01em',
      }}>{value}{unit ? ` ${unit}` : ''}</span>
    </span>
  );
}

// ─── Tiny projection chart (current line vs target) ──────────
// Used inside recommendation card body to make "X behind target" visible
function ProjectionMini({ width = 100, height = 38, currentSeries, targetSeries, color = '#B42318', targetColor = '#15803D' }) {
  const all = [...currentSeries, ...targetSeries];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = (max - min) || 1;
  const xAt = (i, n) => (i / (n - 1)) * (width - 2) + 1;
  const yAt = (v) => height - 2 - ((v - min) / span) * (height - 4);
  const cur = currentSeries.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, currentSeries.length).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const tgt = targetSeries.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, targetSeries.length).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={tgt} fill="none" stroke={targetColor} strokeWidth="1.2" strokeDasharray="2 2" opacity=".7"/>
      <path d={cur} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={xAt(currentSeries.length - 1, currentSeries.length)} cy={yAt(currentSeries[currentSeries.length - 1])} r="2.2" fill="#fff" stroke={color} strokeWidth="1.3"/>
      <circle cx={xAt(targetSeries.length - 1, targetSeries.length)} cy={yAt(targetSeries[targetSeries.length - 1])} r="1.8" fill={targetColor}/>
    </svg>
  );
}

// ─── Days-remaining progress bar ──────────────────────────────
function GameplanProgressBar({ daysIn = 52, totalDays = 112, currentMark = 52 }) {
  const pct = (daysIn / totalDays) * 100;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 600, color: '#6B7280', letterSpacing: '.10em' }}>
          W1
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 600, color: '#6B7280', letterSpacing: '.10em' }}>
          NOW · W{Math.ceil(daysIn / 7)}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, fontWeight: 600, color: '#6B7280', letterSpacing: '.10em' }}>
          W16
        </span>
      </div>
      <div style={{
        height: 6, background: '#EFF1F4',
        border: '1px solid #E5E7EB', borderRadius: 1, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: `${pct}%`, background: '#2563EB',
        }}/>
        <div style={{
          position: 'absolute', top: -2, bottom: -2, left: `${pct}%`,
          width: 1.5, background: '#121823',
        }}/>
      </div>
    </div>
  );
}

// ─── Engine flow diagram (for empty state) ────────────────────
function EngineFlowDiagram() {
  const inputs = [
    { Icon: IconWeight, label: 'Wt' },
    { Icon: IconBarbell, label: 'Sess' },
    { Icon: IconFlame, label: 'Cal' },
    { Icon: IconMoon, label: 'Slp' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {inputs.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 7px',
            background: '#F8F9FB',
            border: '1px solid #E5E7EB',
            borderRadius: 3,
          }}>
            <it.Icon size={11} color="#3A4254"/>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 600, color: '#3A4254' }}>
              {it.label}
            </span>
          </div>
        ))}
      </div>
      {/* arrows */}
      <svg width="20" height="80" viewBox="0 0 20 80" style={{ display: 'block', flexShrink: 0 }}>
        {[10, 27, 44, 61].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y + 6} x2="14" y2={y + 6} stroke="#6B7280" strokeWidth="1" strokeDasharray="2 2"/>
            <path d={`M11 ${y + 3.5} L15 ${y + 6} L11 ${y + 8.5}`} fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        ))}
      </svg>
      {/* Engine block */}
      <div style={{
        width: 70,
        padding: '12px 8px',
        background: '#fff',
        border: '1.5px solid #2563EB',
        borderRadius: 4,
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <g fill="none" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="3"/>
              <path d="M11 4.5 V 7 M11 15 V 17.5 M4.5 11 H 7 M15 11 H 17.5 M6.4 6.4 L 8 8 M14 14 L 15.6 15.6 M6.4 15.6 L 8 14 M14 8 L 15.6 6.4"/>
            </g>
          </svg>
        </div>
        <span style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 10, fontWeight: 600, color: '#121823',
          display: 'block', lineHeight: 1.1,
        }}>Goal Engine</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8, fontWeight: 500, color: '#6B7280',
          display: 'block', marginTop: 2, letterSpacing: '.05em',
        }}>v2.4</span>
      </div>
      <svg width="20" height="60" viewBox="0 0 20 60" style={{ display: 'block', flexShrink: 0 }}>
        {[14, 30, 46].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y} x2="14" y2={y} stroke="#6B7280" strokeWidth="1" strokeDasharray="2 2"/>
            <path d={`M11 ${y - 2.5} L15 ${y} L11 ${y + 2.5}`} fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        ))}
      </svg>
      {/* Output recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['REC 01', 'REC 02', 'REC 03'].map((r, i) => (
          <div key={r} style={{
            padding: '4px 8px',
            background: i === 0 ? '#FFF6E5' : '#FFFFFF',
            border: `1px solid ${i === 0 ? '#F4D69A' : '#E5E7EB'}`,
            borderRadius: 3,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <div style={{ width: 8, height: 8, background: i === 0 ? '#C77405' : '#D2D6DC', borderRadius: 1 }}/>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 600, color: i === 0 ? '#C77405' : '#6B7280' }}>
              {r}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6-week trajectory sparkline w/ check-in dots ─────────────
function HistoryTrajectory({ width = 360, height = 90 }) {
  // 42 daily points (6 weeks)
  const data = [
    184, 184, 183.5, 183.7, 183.4, 183.2, 183.0,  // W1
    183, 182.7, 182.5, 182.4, 182.3, 182.0, 181.8, // W2
    181.8, 181.5, 181.4, 181.3, 181.2, 181.0, 180.9, // W3
    180.8, 180.6, 180.5, 180.5, 180.4, 180.3, 180.2, // W4
    180.0, 179.8, 179.5, 179.2, 179.0, 178.8, 178.7, // W5
    178.6, 178.5, 178.5, 178.4, 178.4, 178.4, 178.4, // W6
  ];
  const checkIns = [
    { day: 6,  status: 'green',  wk: 1 },
    { day: 13, status: 'green',  wk: 2 },
    { day: 20, status: 'yellow', wk: 3 },
    { day: 27, status: 'green',  wk: 4 },
    { day: 34, status: 'yellow', wk: 5 },
    { day: 41, status: 'red',    wk: 6, current: true },
  ];
  const target = data.map((_, i) => 184 - (16 * (i / 41))); // -1 lb/wk to 168
  // Show only relevant range
  const padT = 10, padB = 20, padL = 4, padR = 4;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const all = [...data, ...target];
  const yMin = Math.min(...all) - 0.5;
  const yMax = Math.max(...all) + 0.5;
  const ySpan = yMax - yMin;
  const xAt = (d) => padL + (d / (data.length - 1)) * innerW;
  const yAt = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;
  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const tgtPath = target.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* week dividers */}
      {[7, 14, 21, 28, 35].map(d => (
        <line key={d} x1={xAt(d)} y1={padT} x2={xAt(d)} y2={height - padB} stroke="#E5E7EB" strokeWidth=".7" strokeDasharray="1 3"/>
      ))}
      {/* target dashed */}
      <path d={tgtPath} fill="none" stroke="#15803D" strokeWidth="1" strokeDasharray="3 3" opacity=".55"/>
      {/* actual */}
      <path d={path} fill="none" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* check-in dots */}
      {checkIns.map(c => {
        const color = c.status === 'green' ? '#15803D' : c.status === 'yellow' ? '#C77405' : '#B42318';
        return (
          <g key={c.wk}>
            <circle cx={xAt(c.day)} cy={yAt(data[c.day])} r={c.current ? 5 : 3.2}
                    fill="#fff" stroke={color} strokeWidth={c.current ? 2 : 1.4}/>
            {c.current && (
              <circle cx={xAt(c.day)} cy={yAt(data[c.day])} r="1.8" fill={color}/>
            )}
            <text x={xAt(c.day)} y={height - 5} textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="600"
                  fill={c.current ? color : '#6B7280'}>
              W{c.wk}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── 14-day timeline (mini "back on track in N days") ─────────
function TimelineMini({ days = 14, marker = 14, label = 'days', color = '#2563EB' }) {
  const cells = Array.from({ length: days });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ display: 'flex', gap: 1.5, flex: 1 }}>
        {cells.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 5,
            background: i < marker ? color : '#E5E7EB',
            borderRadius: 1,
          }}/>
        ))}
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 600, color, letterSpacing: '.05em' }}>
        {marker}{label[0]}
      </span>
    </div>
  );
}

// Expose to global scope
Object.assign(window, {
  IconWeight, IconBarbell, IconFlame, IconMoon, IconSteps, IconPulse,
  IconCalendar, IconGauge, IconInfo, IconWarn, IconCheckCircle,
  StatusGlyph, DeltaToken, ProjectionMini, GameplanProgressBar,
  EngineFlowDiagram, HistoryTrajectory, TimelineMini,
});
