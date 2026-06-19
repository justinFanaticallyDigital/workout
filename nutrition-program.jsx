// nutrition-program.jsx
// 3.3 — NUTRITION TAB (Program) · /nutrition (bottom-nav slot 3)
//
// Promotes the Nutrition v2 base layouts (Today / Week Plan / Model Day, built
// on NB tokens) into the THEMED tier-homes vocabulary, on the same pillar
// contract as 3.2: Header → [PillarRail | scroll] → BottomNav, Rail + Chip.
//
// Rail slots for a Program tier: Today / This Week / Model Day / Gameplan —
// first three unlocked, Gameplan dimmed + locked. Recipe Detail (3.3a) and
// Grocery List (3.3b) are the locked pieces of this surface and are reached
// from here (a planned meal → Recipe; the Week Plan → Grocery).
//
// Reuses ProgramPillarShell + TPShuffleLock/TPShuffleHeader (training-program.jsx),
// Card/Button/Chip/Stamp/SectionLabel. Locals are NQ-prefixed.

const { useState: useNQ } = React;

// ── shared macro bits ───────────────────────────────────────────────────────
function NQBar({ T, pct, color }) {
  return (
    <div style={{ height: 4, borderRadius: 999, background: T.surfaceAlt, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color }}/>
    </div>
  );
}

function NQMacroRollup({ T, eaten, target }) {
  // Macro role colours match the Recipe screen: Protein→legs, Carbs→core, Fat→push.
  const macros = [
    { k: 'p', label: 'Protein', color: T.legs, e: eaten.p, t: target.p },
    { k: 'c', label: 'Carbs',   color: T.core, e: eaten.c, t: target.c },
    { k: 'f', label: 'Fat',     color: T.push, e: eaten.f, t: target.f },
  ];
  const calPct = Math.round((eaten.cals / target.cals) * 100);
  return (
    <Card T={T} raised style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Stamp T={T}>Today · {calPct}% of target</Stamp>
        <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec }}>{(target.cals - eaten.cals).toLocaleString()} left</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 7 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 30, fontWeight: 700, color: T.text }}>{eaten.cals.toLocaleString()}</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textTer }}>/ {target.cals.toLocaleString()} kcal</span>
      </div>
      <div style={{ marginTop: 8 }}><NQBar T={T} pct={calPct} color={T.accent}/></div>
      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
        {macros.map((m) => (
          <div key={m.k} style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }}/>
              <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.05em', textTransform: 'uppercase' }}>{m.label}</span>
            </div>
            <div style={{ fontFamily: T.fontNumber, fontSize: 14.5, fontWeight: 700, color: T.text, marginTop: 4 }}>
              {m.e}<span style={{ fontWeight: 400, fontSize: 11, color: T.textTer }}> / {m.t}g</span>
            </div>
            <div style={{ marginTop: 6 }}><NQBar T={T} pct={(m.e / m.t) * 100} color={m.color}/></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · TODAY — planned meals from the week plan, eat / swap / log

const NQ_MEALS = [
  { time: '08:00', size: 'B', name: 'Berry Yogurt Bowl',    meta: '420 kcal · 28 P', logged: true },
  { time: '12:30', size: 'L', name: 'Lemon Chicken & Rice',  meta: '790 kcal · 54 P', logged: true },
  { time: '15:30', size: 'S', name: 'Cottage Cheese Bowl',   meta: '280 kcal · 26 P', logged: false },
  { time: '19:00', size: 'D', name: 'Sheet Pan Salmon',      meta: '910 kcal · 52 P', logged: false },
];

function NutritionTodayLayer({ T, empty }) {
  const eaten = empty ? { cals: 0, p: 0, c: 0, f: 0 } : { cals: 1210, p: 102, c: 132, f: 38 };
  const target = { cals: 2400, p: 180, c: 250, f: 75 };
  const meals = empty ? NQ_MEALS.map((m) => ({ ...m, logged: false })) : NQ_MEALS;
  return (
    <div style={{ padding: '8px 16px 0' }}>
      <NQMacroRollup T={T} eaten={eaten} target={target}/>

      {/* From this week's plan banner */}
      <div style={{ marginTop: 12 }}>
        <Card T={T} style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 4, alignSelf: 'stretch', background: T.accent, borderRadius: 2 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stamp T={T}>From this week's plan</Stamp>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, marginTop: 2 }}>4 meals planned · 2 left to log</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 700, color: T.accent, whiteSpace: 'nowrap' }}>View week →</span>
        </Card>
      </div>

      <SectionLabel T={T} right={empty ? 'Nothing logged' : '2 to go'}>Planned meals</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {meals.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
            opacity: m.logged ? .55 : 1,
          }}>
            <span style={{ width: 34, fontFamily: T.fontData, fontSize: 11, color: T.textTer, flexShrink: 0 }}>{m.time}</span>
            <span style={{
              width: 22, height: 22, borderRadius: T.radiusSm || 4, flexShrink: 0,
              background: m.logged ? T.accent : T.accentFaint, color: m.logged ? T.textOnAccent : T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontNumber, fontSize: 11, fontWeight: 700,
            }}>{m.size}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text, textDecoration: m.logged ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>{m.meta}</div>
            </div>
            {m.logged
              ? <span style={{ color: T.success, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
              : <Button T={T} kind="secondary" size="sm" style={{ flexShrink: 0 }}>Eat →</Button>}
          </div>
        ))}
      </Card>

      <SectionLabel T={T}>This week</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card T={T} style={{ padding: '12px 13px' }}>
          <Stamp T={T}>Macro hits</Stamp>
          <div style={{ fontFamily: T.fontNumber, fontSize: 22, fontWeight: 700, color: T.text, marginTop: 5 }}>5/7<span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, fontWeight: 400 }}> days</span></div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 4 }}>±5% target band</div>
        </Card>
        <Card T={T} style={{ padding: '12px 13px' }}>
          <Stamp T={T}>Weight</Stamp>
          <div style={{ fontFamily: T.fontNumber, fontSize: 22, fontWeight: 700, color: T.text, marginTop: 5 }}>178.4<span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, fontWeight: 400 }}> lb</span></div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 4 }}>−0.6 / 7d</div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · THIS WEEK — week plan, shuffle/lock, two-anchor prep

const NQ_DAYS = [
  { day: 'Mon', ok: true,  note: '4 meals · in band' },
  { day: 'Tue', ok: true,  note: '4 meals · in band' },
  { day: 'Wed', ok: true,  expanded: true, note: '4 meals · in band', meals: [
    { time: '08:00', size: 'B', name: 'Berry Yogurt Bowl',    chain: null, locked: false },
    { time: '12:30', size: 'L', name: 'Lemon Chicken & Rice',  chain: 'A',  locked: true  },
    { time: '15:30', size: 'S', name: 'Cottage Cheese Bowl',   chain: null, locked: false },
    { time: '19:00', size: 'D', name: 'Sheet Pan Salmon',      chain: 'B',  locked: false },
  ] },
  { day: 'Thu', ok: false, note: '−14% protein' },
  { day: 'Fri', ok: true,  note: '4 meals · in band' },
  { day: 'Sat', ok: true,  note: '3 meals · in band' },
  { day: 'Sun', ok: true,  note: 'Cook day · 4 meals' },
];

function NutritionWeekLayer({ T }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      {/* Prep style header */}
      <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <Stamp T={T}>Prep style</Stamp>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 3, letterSpacing: '-.01em' }}>Two-Anchor Split</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: T.fontNumber, fontSize: 13, color: T.textSec }}>2 cooks</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer }}>Sun + Wed</div>
        </div>
      </Card>

      <SectionLabel T={T} right="5 of 28 pinned">Shuffle &amp; lock</SectionLabel>
      <TPShuffleHeader T={T} locked={5} total={28}/>

      <SectionLabel T={T} right="7 days">Week plan</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {NQ_DAYS.map((d, i) => (
          <React.Fragment key={d.day}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
              borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
              background: d.expanded ? T.surfaceAlt : 'transparent',
            }}>
              <span style={{ width: 32, fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.textSec, flexShrink: 0 }}>{d.day}</span>
              <span style={{ width: 7, height: 7, borderRadius: 999, flexShrink: 0, background: d.ok ? T.success : T.warn }}/>
              <span style={{ flex: 1, fontFamily: T.fontData, fontSize: 11, color: T.textTer, letterSpacing: '.02em' }}>{d.note}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.textTer, transform: d.expanded ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>
            {d.expanded && d.meals.map((m, mi) => (
              <div key={mi} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px 9px 20px',
                borderTop: `1px solid ${T.borderFaint}`, position: 'relative',
              }}>
                {m.chain && <span style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 2, background: m.chain === 'A' ? T.accent : T.legs }}/>}
                <span style={{ width: 34, fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, flexShrink: 0 }}>{m.time}</span>
                <span style={{
                  width: 18, height: 18, borderRadius: T.radiusSm || 3, flexShrink: 0,
                  background: T.accentFaint, color: T.accent,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.fontNumber, fontSize: 9.5, fontWeight: 700,
                }}>{m.size}</span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                  {m.chain && <Chip T={T} tone="neutral" size="sm">chain {m.chain}</Chip>}
                </div>
                <TPShuffleLock T={T} locked={m.locked}/>
              </div>
            ))}
          </React.Fragment>
        ))}
      </Card>

      {/* Grocery entry (3.3b) */}
      <div style={{ marginTop: 16 }}>
        <Card T={T} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 34, height: 34, borderRadius: T.radiusMd || 8, flexShrink: 0,
            background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>▤</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Grocery list</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>32 items · 6 aisles · from this plan</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · MODEL DAY — the eating shape template (read-only, edit → Planning)

const NQ_SLOTS = [
  { time: '08:00', size: 'S', name: 'Smoothie',       prep: 'short cook', kcal: 380, p: 30 },
  { time: '12:30', size: 'B', name: 'Lunch out',      prep: 'bought',     kcal: 820, p: 48 },
  { time: '19:00', size: 'N', name: 'Dinner prepped', prep: 'prepped',    kcal: 820, p: 60 },
  { time: '21:30', size: 'S', name: 'Dessert',        prep: 'grab & go',  kcal: 380, p: 18 },
];

function NutritionModelLayer({ T }) {
  return (
    <div style={{ padding: '8px 16px 0' }}>
      <Card T={T} raised style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: T.accent }}/>
        <div style={{ paddingLeft: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Stamp T={T}>Active template</Stamp>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 3, letterSpacing: '-.01em', lineHeight: 1.15 }}>Smoothie + Prep + Buy</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 3 }}>4 slots · 2,400 kcal target · 156 g protein</div>
          </div>
          <Chip T={T} tone="neutral" size="sm">4 slots</Chip>
        </div>
      </Card>

      <SectionLabel T={T} right="2,400 kcal">Slot shape</SectionLabel>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {NQ_SLOTS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
            borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <span style={{ width: 36, fontFamily: T.fontData, fontSize: 11, color: T.textTer, flexShrink: 0 }}>{s.time}</span>
            <span style={{
              width: 22, height: 22, borderRadius: T.radiusSm || 4, flexShrink: 0,
              background: T.accentFaint, color: T.accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontNumber, fontSize: 11, fontWeight: 700,
            }}>{s.size}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>{s.name}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>{s.prep}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: T.fontNumber, fontSize: 11.5, color: T.textSec }}>{s.kcal} kcal</div>
              <div style={{ fontFamily: T.fontNumber, fontSize: 10.5, color: T.textTer }}>{s.p} P</div>
            </div>
          </div>
        ))}
      </Card>

      <SectionLabel T={T}>Daily macro split</SectionLabel>
      <Card T={T} style={{ padding: 14 }}>
        <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: T.surfaceAlt }}>
          <div style={{ flex: 156, background: T.legs }}/>
          <div style={{ flex: 270, background: T.core }}/>
          <div style={{ flex: 70, background: T.push }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {[['P', '156 g', T.legs], ['C', '270 g', T.core], ['F', '70 g', T.push]].map(([k, v, c]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.fontData, fontSize: 11, color: T.textTer }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>{k} {v}
            </span>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: T.surface, border: `1px dashed ${T.borderStrong}`, borderRadius: T.radiusLg || 10,
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: T.radiusMd || 8, flexShrink: 0,
            background: T.accentFaint, color: T.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700,
          }}>◇</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Edit model day · Planning Mode</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>Sandbox · diff · confirm · undo</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </div>
        <Card T={T} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.textSec }}>Browse model-day templates</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LAYER · GAMEPLAN (locked)

function NQGameplanLocked({ T }) {
  return (
    <div>
      <div style={{ padding: '8px 16px 0', opacity: .45, pointerEvents: 'none' }}>
        <Card T={T} style={{ padding: '14px 16px' }}>
          <Stamp T={T}>Adaptive macros · projected</Stamp>
          <svg viewBox="0 0 280 84" style={{ width: '100%', height: 84, marginTop: 8, display: 'block' }}>
            <path d="M6 64 Q90 60 150 36 T274 24" stroke={T.accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M6 64 Q90 60 150 36 T274 24 L274 84 L6 84 Z" fill={T.accentFaint}/>
          </svg>
        </Card>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <Card T={T} raised style={{ padding: 16, borderColor: T.accentBorder }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stamp T={T}>Gameplan tier</Stamp>
            <Chip T={T} tone="neutral" size="sm">Locked</Chip>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 6, letterSpacing: '-.01em' }}>Adaptive nutrition</div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {['Macros retune each week from your results', 'Diet-phase trajectory vs goal weight', 'Auto-adjusts the week plan + grocery list'].map((f) => (
              <div key={f} style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, display: 'flex', gap: 8 }}>
                <span style={{ color: T.accent, marginTop: 1 }}>·</span><span>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Button T={T} kind="primary" size="md" style={{ flex: 1 }}>See Gameplan →</Button>
            <Button T={T} kind="secondary" size="md" style={{ flexShrink: 0 }}>Compare</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3.3 — assembled tab

function NutritionProgramTab({ T, activeKey = 'today', railMode = 'rail', onSetRailMode, state = 'default' }) {
  const error = state === 'error'
    ? { title: 'Drive sync paused', body: 'Last sync 2 hours ago. Entries still save locally.', action: 'Retry' }
    : null;
  const layer =
    activeKey === 'block'    ? <NutritionWeekLayer T={T}/>           :
    activeKey === 'model'    ? <NutritionModelLayer T={T}/>          :
    activeKey === 'gameplan' ? <NQGameplanLocked T={T}/>             :
                               <NutritionTodayLayer T={T} empty={state === 'empty'}/>;
  return (
    <ProgramPillarShell T={T} pillar="nutrition" activeKey={activeKey} railMode={railMode}
      onSetRailMode={onSetRailMode} title="Nutrition" subtitle="Program" error={error}>
      {layer}
    </ProgramPillarShell>
  );
}

Object.assign(window, {
  NQBar, NQMacroRollup,
  NutritionTodayLayer, NutritionWeekLayer, NutritionModelLayer, NQGameplanLocked,
  NutritionProgramTab,
});
