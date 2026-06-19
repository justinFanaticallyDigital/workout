// logger-pillars.jsx
// The remaining Logger pillar surfaces — Nutrition + Lifestyle.
//   2.7 — Nutrition Tab (Logger)   ·  /nutrition       (slot 3)
//   2.8 — Meal Logger              ·  /nutrition/log
//   2.9 — Lifestyle Tab (preview)  ·  /lifestyle        (slot 4, tier-locked)
//
// 2.7 / 2.9 obey the pillar layout contract (CLAUDE.md): Header →
// [PillarRail | scroll] → BottomNav, with rail/chip modes. The Logger nutrition
// surface is the manual-target + daily-log view (no meal-plan engine — that's
// Program). Lifestyle is a tier-locked pillar: every rail slot dimmed + lock,
// body is a faded preview behind a factual Gameplan upsell (never a gate).
//
// 2.8 promotes the food-search → quantity → log flow out of the Nutrition v2
// exploration into the themed Card/Sheet vocabulary.
//
// Reuses Card / Button / Chip / Stamp / Header / BottomNav, Sheet / SheetStage
// / Stepper / FieldLabel / TextField, PillarRail / PillarRailChip /
// railItemsForTier / RailGlyph. Locals are NP-prefixed.

const { useState, useMemo } = React;

// ── shared little bits ────────────────────────────────────────────────────
function NPBar({ T, pct, color }) {
  return (
    <div style={{ height: 5, borderRadius: 999, background: T.surfaceAlt, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color }}/>
    </div>
  );
}

const NP_TARGET = { cals: 2400, p: 180, c: 250, f: 75 };
const NP_EATEN  = { cals: 1840, p: 142, c: 198, f: 54 };

// ════════════════════════════════════════════════════════════════════════
// 2.7 — NUTRITION TAB (Logger)

function NPMacroSummary({ T, empty }) {
  const macros = [
    { k: 'p', label: 'Protein', color: T.push, eaten: NP_EATEN.p, target: NP_TARGET.p },
    { k: 'c', label: 'Carbs',   color: T.core, eaten: NP_EATEN.c, target: NP_TARGET.c },
    { k: 'f', label: 'Fat',     color: T.legs, eaten: NP_EATEN.f, target: NP_TARGET.f },
  ];
  if (empty) {
    return (
      <Card T={T} raised style={{ padding: '16px', borderColor: T.accentBorder }}>
        <Stamp T={T}>Macro targets</Stamp>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text, marginTop: 5, letterSpacing: '-.01em' }}>No targets set</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, marginTop: 4, lineHeight: 1.45 }}>
          Set a calorie + macro split to track against. You can change it any time.
        </div>
        <div style={{ marginTop: 13 }}>
          <Button T={T} kind="primary" size="md" style={{ width: '100%' }}>Set macro targets →</Button>
        </div>
      </Card>
    );
  }
  const calPct = Math.round((NP_EATEN.cals / NP_TARGET.cals) * 100);
  return (
    <Card T={T} raised style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Stamp T={T}>Today · {calPct}% of target</Stamp>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 700, color: T.accent }}>Edit targets</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 7 }}>
        <span style={{ fontFamily: T.fontNumber, fontSize: 32, fontWeight: 700, color: T.text, letterSpacing: '.01em' }}>{NP_EATEN.cals.toLocaleString()}</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textTer }}>/ {NP_TARGET.cals.toLocaleString()} kcal</span>
        <span style={{ marginLeft: 'auto', fontFamily: T.fontNumber, fontSize: 13, color: T.textSec }}>{(NP_TARGET.cals - NP_EATEN.cals).toLocaleString()} left</span>
      </div>
      <div style={{ marginTop: 8 }}><NPBar T={T} pct={calPct} color={T.accent}/></div>
      <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
        {macros.map((m) => (
          <div key={m.k} style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }}/>
              <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.05em', textTransform: 'uppercase' }}>{m.label}</span>
            </div>
            <div style={{ fontFamily: T.fontNumber, fontSize: 14.5, fontWeight: 700, color: T.text, marginTop: 4 }}>
              {m.eaten}<span style={{ fontWeight: 400, fontSize: 11, color: T.textTer }}> / {m.target}g</span>
            </div>
            <div style={{ marginTop: 6 }}><NPBar T={T} pct={(m.eaten / m.target) * 100} color={m.color}/></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const NP_MEALS = [
  { name: 'Breakfast', kcal: 512, items: ['Oats + whey · 1 bowl', 'Banana · 1', 'Coffee · black'] },
  { name: 'Lunch',     kcal: 686, items: ['Chicken · 180 g', 'Brown rice · 1 cup', 'Broccoli · 1 cup'] },
  { name: 'Dinner',    kcal: 0,   items: [] },
  { name: 'Snacks',    kcal: 164, items: ['Almonds · 28 g'] },
];

function NPMealCard({ T, meal }) {
  const logged = meal.items.length > 0;
  return (
    <Card T={T} style={{ padding: '13px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 14.5, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>{meal.name}</span>
        {logged
          ? <span style={{ fontFamily: T.fontNumber, fontSize: 12.5, color: T.textSec }}>{meal.kcal} kcal</span>
          : <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent }}>+ Add food</span>}
      </div>
      {logged && (
        <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.borderFaint}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {meal.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec }}>{it}</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer, lineHeight: 1 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function NPSectionLabel({ T, children, right }) {
  const onBg = T.textOnBg || T.text, onBgTer = T.textOnBgTer || T.textTer;
  return (
    <div className="ft-on-bg" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '18px 16px 8px' }}>
      <div style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: onBg, letterSpacing: '.1em', textTransform: 'uppercase' }}>{children}</div>
      {right && <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBgTer }}>{right}</span>}
    </div>
  );
}

function NutritionLogger({ T, state = 'default', railMode = 'rail', onSetRailMode }) {
  const isEmpty = state === 'empty';
  const railShown = railMode !== 'chip';
  const setMode = onSetRailMode || (() => {});
  const meals = isEmpty ? NP_MEALS.map((m) => ({ ...m, kcal: 0, items: [] })) : NP_MEALS;

  const content = (
    <>
      {state === 'error' && (
        <ErrorBanner T={T} title="Drive sync paused" body="Last sync 2 hours ago. Entries still save locally." action="Retry"/>
      )}
      <div style={{ padding: '4px 16px 0' }}>
        <NPMacroSummary T={T} empty={isEmpty}/>
      </div>
      <NPSectionLabel T={T} right={isEmpty ? 'Nothing logged' : `${NP_EATEN.cals.toLocaleString()} kcal`}>Today's meals</NPSectionLabel>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {meals.map((m) => <NPMealCard key={m.name} T={T} meal={m}/>)}
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>+ Log meal</Button>
      </div>
    </>
  );

  return (
    <PillarShell
      T={T} pillar="nutrition" tier="logger" activeKey="today"
      railMode={railMode} onSetRailMode={onSetRailMode}
      header={<Header T={T} kind="home" title="Nutrition" subtitle="Logger"/>}>
      {content}
    </PillarShell>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2.8 — MEAL LOGGER  (food search → quantity → log)

const NP_FOODS = [
  { name: 'Greek Yogurt',  brand: 'Fage 0%',   serving: '170 g',   kcal: 90,  p: 17, c: 5,  f: 0  },
  { name: 'Chicken Breast', brand: 'Cooked',    serving: '100 g',   kcal: 165, p: 31, c: 0,  f: 4  },
  { name: 'Brown Rice',    brand: 'Cooked',     serving: '1 cup',   kcal: 215, p: 5,  c: 45, f: 2  },
  { name: 'Banana',        brand: 'Medium',     serving: '118 g',   kcal: 105, p: 1,  c: 27, f: 0  },
  { name: 'Almonds',       brand: 'Raw',        serving: '28 g',    kcal: 164, p: 6,  c: 6,  f: 14 },
  { name: 'Whey Protein',  brand: 'Vanilla',    serving: '1 scoop', kcal: 120, p: 25, c: 3,  f: 1  },
];

function NPFoodRow({ T, food, onAdd }) {
  return (
    <Card T={T} onClick={onAdd} style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{food.name}</div>
        <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.03em', marginTop: 2 }}>
          {food.brand} · {food.serving} · P{food.p} C{food.c} F{food.f}
        </div>
      </div>
      <span style={{ fontFamily: T.fontNumber, fontSize: 12.5, color: T.textSec, flexShrink: 0 }}>{food.kcal}</span>
      <span style={{
        width: 28, height: 28, borderRadius: 999, flexShrink: 0,
        background: T.accentFaint, color: T.accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontBody, fontSize: 18, lineHeight: 1,
      }}>+</span>
    </Card>
  );
}

function NPQuantitySheet({ T, food, meal }) {
  const [qty, setQty] = useState(1);
  const scaled = (n) => Math.round(n * qty);
  const macros = [
    { label: 'Protein', v: scaled(food.p), color: T.push },
    { label: 'Carbs',   v: scaled(food.c), color: T.core },
    { label: 'Fat',     v: scaled(food.f), color: T.legs },
  ];
  const footer = (
    <Button T={T} kind="primary" style={{ width: '100%' }}>Add to {meal} · {scaled(food.kcal)} kcal</Button>
  );
  return (
    <Sheet T={T} title={food.name} sub={`${food.brand} · ${food.serving} per serving`} footer={footer}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textSec, letterSpacing: '.1em', textTransform: 'uppercase' }}>Servings</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>{food.serving} each</div>
        </div>
        <Stepper T={T} value={qty} step={0.5} min={0.5} onChange={setQty} fmt={(v) => (v % 1 === 0 ? `${v}` : v.toFixed(1))}/>
      </div>
      <Card T={T} style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <Stamp T={T}>This entry</Stamp>
          <span style={{ fontFamily: T.fontNumber, fontSize: 20, fontWeight: 700, color: T.text }}>{scaled(food.kcal)} <span style={{ fontSize: 12, color: T.textTer, fontWeight: 400 }}>kcal</span></span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {macros.map((m) => (
            <div key={m.label} style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }}/>
                <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.05em', textTransform: 'uppercase' }}>{m.label}</span>
              </div>
              <div style={{ fontFamily: T.fontNumber, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 4 }}>{m.v}<span style={{ fontSize: 11, fontWeight: 400, color: T.textTer }}>g</span></div>
            </div>
          ))}
        </div>
      </Card>
    </Sheet>
  );
}

function MealLogger({ T, meal = 'Lunch', mode = 'search' }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => NP_FOODS.filter((f) => !q.trim() || f.name.toLowerCase().includes(q.trim().toLowerCase())), [q]);
  const recents = NP_FOODS.slice(0, 3);

  const search = (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title={`Add to ${meal}`} subtitle="Search foods"/>
      <div style={{ padding: '4px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textTer} strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods or scan a barcode" style={{ flex: 1, padding: '11px 0', background: 'transparent', border: 'none', outline: 'none', color: T.text, fontFamily: T.fontBody, fontSize: 14 }}/>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '0 16px 24px' }}>
        {!q.trim() && (
          <>
            <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 2px 9px' }}>Recent</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              {recents.map((f) => (
                <span key={f.name} style={{ padding: '7px 12px', borderRadius: 999, background: T.surface, border: `1px solid ${T.border}`, fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.textSec, cursor: 'pointer' }}>{f.name}</span>
              ))}
            </div>
          </>
        )}
        <div className="ft-on-bg" style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textOnBgSec, letterSpacing: '.1em', textTransform: 'uppercase', padding: '14px 2px 9px' }}>
          {q.trim() ? `${results.length} results` : 'Common foods'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((f) => <NPFoodRow key={f.name} T={T} food={f} onAdd={() => {}}/>)}
        </div>
      </div>
    </div>
  );

  if (mode === 'quantity') {
    return (
      <SheetStage T={T} behind={search}>
        <NPQuantitySheet T={T} food={NP_FOODS[1]} meal={meal}/>
      </SheetStage>
    );
  }
  return search;
}

// ════════════════════════════════════════════════════════════════════════
// 2.9 — LIFESTYLE TAB (Logger preview · tier-locked pillar)

const NP_LIFESTYLE_PREVIEW = [
  { label: 'Sleep',    value: '7h 20m', color: 'push' },
  { label: 'Energy',   value: 'Good',   color: 'core' },
  { label: 'Soreness', value: 'Low',    color: 'legs' },
  { label: 'Steps',    value: '8,240',  color: 'pull' },
];

function LifestylePreview({ T, railMode = 'rail', onSetRailMode }) {
  const railShown = railMode !== 'chip';
  const setMode = onSetRailMode || (() => {});
  // Whole pillar is Gameplan-tier — every rail slot locked for a Logger.
  const lockedItems = railItemsForTier('lifestyle', 'logger', null).map((i) => ({ ...i, locked: true, active: false }));

  const content = (
    <>
      {/* faded preview of the locked surface */}
      <div style={{ padding: '8px 16px 0', opacity: 0.5, pointerEvents: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {NP_LIFESTYLE_PREVIEW.map((m) => (
            <Card key={m.label} T={T} style={{ padding: '13px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: T[m.color] }}/>
                <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.05em', textTransform: 'uppercase' }}>{m.label}</span>
              </div>
              <div style={{ fontFamily: T.fontNumber, fontSize: 20, fontWeight: 700, color: T.text, marginTop: 6 }}>{m.value}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* factual upsell */}
      <div style={{ padding: '16px 16px 0' }}>
        <Card T={T} raised style={{ padding: '16px', borderColor: T.accentBorder }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stamp T={T}>Gameplan pillar</Stamp>
            <Chip T={T} tone="neutral" size="sm">Locked</Chip>
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 6, letterSpacing: '-.01em' }}>Lifestyle tracking</div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Sleep, energy, soreness, mood logs', 'Daily readiness from your data', 'Feeds the weekly check-in engine'].map((f) => (
              <div key={f} style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
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
    </>
  );

  return (
    <PillarShell
      T={T} pillar="lifestyle" tier="logger" activeKey="today" items={lockedItems}
      railMode={railMode} onSetRailMode={onSetRailMode}
      header={<Header T={T} kind="home" title="Lifestyle" subtitle="Logger · preview"/>}>
      {content}
    </PillarShell>
  );
}

Object.assign(window, { NutritionLogger, MealLogger, LifestylePreview });
