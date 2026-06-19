// nutrition-detail-screens.jsx
// Cluster 3 — Nutrition expansion (build-plan step 05)
//   3.3a Recipe Detail   — /nutrition/recipes/[id]
//   3.3b Grocery List    — /nutrition/grocery
//
// Both screens read every colour, font, radius and shadow from
// useFitTrackTheme(theme) via the `T` prop, and reuse the shared primitives
// from tier-homes-screens.jsx (Header, Card, Button, Chip, Stamp, IconBtn,
// SectionLabel, BottomNav). That keeps them in lock-step with the rest of the
// product and lets the host swap all 7 themes through one source of truth.
//
// Primary/locked theme: Notebook (handwritten recipe-card). All artboards
// render in any theme via the Tweaks switcher.

const { useState: useND, useMemo: useNDMemo } = React;

// ── Macro role colours, derived from theme muscle-group tints ──
// Protein → legs(red), Carbs → core(amber), Fat → push(blue). Present on all 7.
function macroColors(T) {
  return { p: T.legs, c: T.core, f: T.push };
}

// Pretty-print a scaled quantity (drop trailing .0, keep halves readable).
function fmtQty(n) {
  if (n == null) return '';
  const r = Math.round(n * 100) / 100;
  if (Number.isInteger(r)) return String(r);
  // express common fractions
  const frac = r - Math.floor(r);
  const whole = Math.floor(r);
  const map = { 0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾' };
  const key = Object.keys(map).find(k => Math.abs(frac - parseFloat(k)) < 0.04);
  if (key) return (whole ? whole + ' ' : '') + map[key];
  return String(r);
}

// ════════════════════════════════════════════════════════════════════════
// Shared atoms

function MacroRollup({ T, kcal, p, c, f, compact }) {
  const M = macroColors(T);
  const total = p + c + f || 1;
  const segs = [
    { v: p, color: M.p, label: 'P', g: p },
    { v: c, color: M.c, label: 'C', g: c },
    { v: f, color: M.f, label: 'F', g: f },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: T.fontNumber, fontSize: compact ? 18 : 26, fontWeight: 700, color: T.text, lineHeight: 1 }}>{kcal}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer }}>kcal / serving</span>
        </div>
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: T.surfaceAlt, border: `1px solid ${T.borderFaint}` }}>
        {segs.map((s, i) => <div key={i} style={{ flex: s.v / total, background: s.color }}/>)}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
            <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec }}>
              {s.label === 'P' ? 'Protein' : s.label === 'C' ? 'Carbs' : 'Fat'}
            </span>
            <span style={{ fontFamily: T.fontNumber, fontSize: 13, fontWeight: 700, color: T.text }}>{s.g}g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Striped photo placeholder — communicates "food photo goes here" honestly.
function PhotoPlaceholder({ T, label = 'food photo', height = 168, style }) {
  const stripe = T.isDark
    ? 'rgba(255,255,255,.05)'
    : 'rgba(0,0,0,.045)';
  return (
    <div style={{
      height, width: '100%', position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${T.surfaceAlt} 0 14px, ${stripe} 14px 28px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 11, letterSpacing: '.16em',
        textTransform: 'uppercase', color: T.textTer,
        background: T.surface, padding: '4px 10px', borderRadius: T.radiusSm,
        border: `1px solid ${T.borderFaint}`,
      }}>{label}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3.3a — RECIPE DETAIL

const RECIPE = {
  name: 'Lemon Garlic Chicken & Rice',
  meal: 'Lunch · Dinner',
  cook: 'Skillet',
  time: 25,
  baseServings: 2,
  kcal: 580, p: 52, c: 60, f: 14,
  tags: ['High-protein', 'Meal-prep', 'Gluten-free'],
  chain: 'A',
  chainNote: 'Anchor cook — feeds 3 meals this week',
  ingredients: [
    { name: 'Chicken breast',      qty: 12,  unit: 'oz',    have: false, group: 'Protein', kcal: 540, p: 100, c: 0,  f: 12 },
    { name: 'Jasmine rice, dry',   qty: 1,   unit: 'cup',   have: false, group: 'Grain',   kcal: 400, p: 8,   c: 88, f: 1 },
    { name: 'Broccoli florets',    qty: 3,   unit: 'cups',  have: false, group: 'Produce', kcal: 90,  p: 7,   c: 18, f: 1 },
    { name: 'Lemon',               qty: 2,   unit: '',      have: false, group: 'Produce', kcal: 20,  p: 1,   c: 6,  f: 0 },
    { name: 'Garlic clove',        qty: 4,   unit: '',      have: true,  group: 'Produce', kcal: 18,  p: 1,   c: 4,  f: 0 },
    { name: 'Olive oil',           qty: 2,   unit: 'tbsp',  have: true,  group: 'Pantry',  kcal: 120, p: 0,   c: 0,  f: 14 },
    { name: 'Low-sodium stock',    qty: 1,   unit: 'cup',   have: false, group: 'Pantry',  kcal: 15,  p: 2,   c: 1,  f: 0 },
    { name: 'Salt & pepper',       qty: null, unit: 'to taste', have: true, group: 'Pantry', kcal: 0, p: 0, c: 0, f: 0 },
  ],
  steps: [
    'Rinse rice until the water runs clear. Simmer with stock and a pinch of salt, lid on, 15 min.',
    'Cube the chicken. Sear in 1 tbsp oil over medium-high, 4 min per side, until golden.',
    'Add minced garlic and the juice of one lemon. Toss 1 min until fragrant.',
    'Steam broccoli alongside, 4 min, until bright and just tender.',
    'Fold rice, chicken and broccoli together. Finish with remaining lemon and a drizzle of oil.',
  ],
};

function NDStepper({ T, value, onChange, min = 1, max = 8, onBg = false }) {
  const btn = (glyph, fn, disabled) => (
    <button onClick={disabled ? undefined : fn} style={{
      width: 30, height: 30, borderRadius: T.radiusSm,
      background: disabled ? T.surfaceAlt : T.surface,
      border: `1px solid ${T.border}`,
      color: disabled ? T.textTer : T.text,
      fontFamily: T.fontBody, fontSize: 17, lineHeight: 1,
      cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{glyph}</button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {btn('–', () => onChange(value - 1), value <= min)}
      <span style={{ fontFamily: T.fontNumber, fontSize: 17, fontWeight: 700, color: onBg ? T.textOnBg : T.text, minWidth: 18, textAlign: 'center' }}>{value}</span>
      {btn('+', () => onChange(value + 1), value >= max)}
    </div>
  );
}

function IngredientRow({ T, item, mult, expanded, onToggle }) {
  const scaled = item.qty != null ? fmtQty(item.qty * mult) : '';
  const qtyText = item.qty != null ? `${scaled}${item.unit ? ' ' + item.unit : ''}` : item.unit;
  const M = macroColors(T);
  const macros = [
    { label: 'P', color: M.p, g: Math.round(item.p * mult) },
    { label: 'C', color: M.c, g: Math.round(item.c * mult) },
    { label: 'F', color: M.f, g: Math.round(item.f * mult) },
  ];
  const hasMacros = (item.kcal || 0) > 0;
  return (
    <div style={{ borderBottom: `1px solid ${T.borderFaint}` }}>
      <button onClick={hasMacros ? onToggle : undefined} style={{
        width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
        cursor: hasMacros ? 'pointer' : 'default',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: 999, flexShrink: 0,
          background: item.have ? T.textTer : T.accent,
          opacity: item.have ? .5 : 1,
        }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text }}>{item.name}</span>
          {item.have && (
            <span style={{
              marginLeft: 7, fontFamily: T.fontBody, fontSize: 10, fontWeight: 600,
              color: T.textTer, border: `1px solid ${T.borderFaint}`, borderRadius: 999,
              padding: '1px 6px', letterSpacing: '.04em', textTransform: 'uppercase',
            }}>have</span>
          )}
        </div>
        {hasMacros && (
          <span style={{ fontFamily: T.fontNumber, fontSize: 12, color: T.textTer, whiteSpace: 'nowrap' }}>
            {Math.round(item.kcal * mult)} kcal
          </span>
        )}
        <span style={{ fontFamily: T.fontNumber, fontSize: 13, color: item.have ? T.textTer : T.textSec, whiteSpace: 'nowrap' }}>{qtyText}</span>
        {hasMacros && (
          <span style={{ fontSize: 13, color: T.textTer, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s', lineHeight: 1 }}>⌄</span>
        )}
      </button>

      {expanded && hasMacros && (
        <div style={{
          margin: '0 0 11px 17px', padding: '11px 13px',
          background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusMd,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
            <span style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              {fmtQty(item.qty * mult)}{item.unit ? ' ' + item.unit : ''}
            </span>
            <span style={{ fontFamily: T.fontNumber, fontSize: 16, fontWeight: 700, color: T.text }}>
              {Math.round(item.kcal * mult)} <span style={{ fontSize: 11, color: T.textTer, fontWeight: 400 }}>kcal</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {macros.map((m, i) => (
              <div key={i} style={{
                flex: 1, background: T.surface, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusSm,
                padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: m.color, flexShrink: 0 }}/>
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textSec }}>
                    {m.label === 'P' ? 'Protein' : m.label === 'C' ? 'Carbs' : 'Fat'}
                  </span>
                </div>
                <span style={{ fontFamily: T.fontNumber, fontSize: 15, fontWeight: 700, color: T.text }}>{m.g}g</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
            <Button T={T} kind="ghost" size="sm">Swap ingredient</Button>
            <Button T={T} kind="ghost" size="sm">Adjust amount</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SwapSheet({ T, onClose }) {
  const M = macroColors(T);
  const alts = [
    { name: 'Mediterranean Chicken Bowl', kcal: 560, dk: -20, time: 28, note: 'Same protein, more veg' },
    { name: 'Chicken & Broccoli Bowl',    kcal: 550, dk: -30, time: 22, note: 'Shares chain A' },
    { name: 'Turkey Taco Bowl',           kcal: 620, dk: +40, time: 20, note: 'Swaps to turkey' },
    { name: 'Sheet Pan Salmon',           kcal: 540, dk: -40, time: 30, note: 'Different protein' },
  ];
  return (
    <NDSheet T={T} title="Swap recipe" sub="Same meal slot · matched on macros" onClose={onClose}>
      {alts.map((a, i) => (
        <button key={i} style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusMd,
          padding: '11px 13px', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: T.radiusSm, overflow: 'hidden', flexShrink: 0 }}>
            <PhotoPlaceholder T={T} label="" height={44}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{a.name}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>{a.note} · {a.time} min</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: T.fontNumber, fontSize: 14, fontWeight: 700, color: T.text }}>{a.kcal}</div>
            <div style={{ fontFamily: T.fontNumber, fontSize: 11, color: a.dk < 0 ? T.successFg : T.warnFg }}>
              {a.dk > 0 ? '+' : ''}{a.dk}
            </div>
          </div>
        </button>
      ))}
      <Button T={T} kind="ghost" size="md" style={{ width: '100%', marginTop: 2 }} onClick={onClose}>Keep current recipe</Button>
    </NDSheet>
  );
}

// Generic bottom sheet used by swap + share.
function NDSheet({ T, title, sub, onClose, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: T.surface, borderTop: `1px solid ${T.border}`,
        borderRadius: `${(T.radiusLg || 10) + 6}px ${(T.radiusLg || 10) + 6}px 0 0`,
        padding: '10px 16px 20px', maxHeight: '82%', overflowY: 'auto',
        boxShadow: T.shadowMd,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: T.border }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>{title}</div>
            {sub && <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 2 }}>{sub}</div>}
          </div>
          <IconBtn T={T} glyph="✕" onClick={onClose}/>
        </div>
        {children}
      </div>
    </div>
  );
}

function RecipeDetail({ T, initialServings = 2, locked = false, openSwap = false, initialExpandedIng = null }) {
  const [servings, setServings] = useND(initialServings);
  const [swap, setSwap] = useND(openSwap);
  const [expandedIng, setExpandedIng] = useND(initialExpandedIng);
  const mult = servings / RECIPE.baseServings;
  const M = macroColors(T);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: 92 }}>
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <PhotoPlaceholder T={T} label="food photo" height={184}/>
        {/* back + save floating */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
          <IconBtn T={T} glyph="‹" style={{ background: T.surface }}/>
          <IconBtn T={T} glyph="♡" style={{ background: T.surface }}/>
        </div>
        {RECIPE.chain && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: T.accent }}/>
        )}
      </div>

      <div className="ft-on-bg" style={{ padding: '14px 16px 0' }}>
        {/* Title block */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <Chip T={T} tone="accent" size="sm" onBg>Chain {RECIPE.chain}</Chip>
          <Chip T={T} tone="neutral" size="sm">{RECIPE.cook}</Chip>
          <Chip T={T} tone="neutral" size="sm">{RECIPE.time} min</Chip>
        </div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700, color: T.textOnBg, lineHeight: 1.1, letterSpacing: '-.01em' }}>
          {RECIPE.name}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgTer, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{RECIPE.meal}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: T.textOnBgTer }}/>
          <span style={{ color: T.textOnBgSec, fontWeight: 600 }}>{RECIPE.chainNote}</span>
        </div>

        {/* Macro card */}
        <Card T={T} style={{ padding: '14px 16px', marginTop: 14 }}>
          <MacroRollup T={T} kcal={RECIPE.kcal} p={RECIPE.p} c={RECIPE.c} f={RECIPE.f}/>
        </Card>

        {/* Servings */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, padding: '4px 2px',
        }}>
          <div>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.textOnBg }}>Servings</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer, marginTop: 1 }}>
              {mult !== 1 ? `Scaled ${mult}× · grocery list updates` : 'Recipe default'}
            </div>
          </div>
          <NDStepper T={T} value={servings} onChange={setServings} onBg/>
        </div>
      </div>

      {/* Ingredients */}
      <SectionLabel T={T} right={`${RECIPE.ingredients.length} items · tap for macros`}>Ingredients</SectionLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '2px 14px 6px' }}>
          {RECIPE.ingredients.map((it, i) => (
            <IngredientRow key={i} T={T} item={it} mult={mult}
              expanded={expandedIng === i}
              onToggle={() => setExpandedIng(expandedIng === i ? null : i)}/>
          ))}
          <button style={{
            width: '100%', marginTop: 10, padding: '8px',
            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: T.radiusMd,
            color: T.accent, fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Add all to grocery list →</button>
        </Card>
      </div>

      {/* Instructions */}
      <SectionLabel T={T} right={`${RECIPE.steps.length} steps`}>Method</SectionLabel>
      <div style={{ padding: '0 16px', position: 'relative' }}>
        <Card T={T} style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECIPE.steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12,
              filter: locked && i >= 2 ? 'blur(4px)' : 'none',
              pointerEvents: locked && i >= 2 ? 'none' : 'auto',
              userSelect: locked && i >= 2 ? 'none' : 'auto',
            }}>
              <div style={{
                width: 26, height: 26, flexShrink: 0, borderRadius: 999,
                background: T.accentFaint, color: T.accent, border: `1px solid ${T.accentBorder}`,
                fontFamily: T.fontNumber, fontSize: 13, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 13.5, color: T.textSec, lineHeight: 1.5, paddingTop: 2 }}>{s}</div>
            </div>
          ))}
        </Card>

        {/* Locked overlay (Logger preview) */}
        {locked && (
          <div style={{
            position: 'absolute', left: 16, right: 16, bottom: 0, top: 56,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: `linear-gradient(to bottom, transparent, ${T.bg} 78%)`,
          }}>
            <Card T={T} raised style={{ padding: '16px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text }}>Recipes are a Program feature</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textTer, marginTop: 4, lineHeight: 1.4 }}>
                Full method, ingredient scaling and grocery sync unlock with any Program or Gameplan.
              </div>
              <Button T={T} kind="primary" size="lg" style={{ width: '100%', marginTop: 12 }}>Browse the shelf →</Button>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {!locked && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '12px 16px 16px', background: T.surface,
          borderTop: `1px solid ${T.borderFaint}`,
          display: 'flex', gap: 8, zIndex: 60,
        }}>
          <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Eat this today →</Button>
          <Button T={T} kind="secondary" size="lg" onClick={() => setSwap(true)}>Swap</Button>
        </div>
      )}

      {swap && <SwapSheet T={T} onClose={() => setSwap(false)}/>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3.3b — GROCERY LIST

const AISLES = [
  { name: 'Produce', items: [
    { name: 'Broccoli',      qty: '3 heads', meals: 4 },
    { name: 'Bell peppers',  qty: '6',       meals: 3 },
    { name: 'Lemons',        qty: '4',       meals: 5 },
    { name: 'Spinach',       qty: '1 bag',   meals: 3 },
    { name: 'Mixed berries', qty: '2 cups',  meals: 3 },
    { name: 'Apples',        qty: '6',       meals: 6, have: true },
  ]},
  { name: 'Meat & Seafood', items: [
    { name: 'Chicken breast', qty: '3 lb',   meals: 5, inMeals: ['Lemon Garlic Chicken & Rice', 'Chicken Caesar Wrap', 'Chicken & Broccoli Bowl', 'Mediterranean Chicken Bowl'] },
    { name: 'Ground turkey',  qty: '1.5 lb', meals: 2 },
    { name: 'Salmon fillets', qty: '4',      meals: 2 },
  ]},
  { name: 'Dairy', items: [
    { name: 'Greek yogurt',   qty: '1 tub',   meals: 3 },
    { name: 'Cottage cheese', qty: '1 tub',   meals: 1 },
    { name: 'Eggs',           qty: '1 dozen', meals: 4 },
  ]},
  { name: 'Pantry', items: [
    { name: 'Jasmine rice',  qty: '2 lb',     meals: 4 },
    { name: 'Oats',          qty: '1 bag',    meals: 3 },
    { name: 'Whole-grain bread', qty: '1 loaf', meals: 4 },
    { name: 'Olive oil',     qty: '1 bottle', meals: 7, have: true },
  ]},
  { name: 'Spices', hint: 'assumed in pantry', items: [], collapsedDefault: true },
];

function SumStat({ T, label, value }) {
  return (
    <div style={{ flex: 1, background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusMd, padding: '7px 10px' }}>
      <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: T.fontNumber, fontSize: 17, fontWeight: 700, color: T.text }}>{value}</div>
    </div>
  );
}

function GRow({ T, item, idx, aisleIdx, checked, have, expanded, namesOnly, onToggle, onExpand, onHave }) {
  const dim = checked || have;
  return (
    <div style={{ borderBottom: `1px solid ${T.borderFaint}`, opacity: dim ? .5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px' }}>
        <button onClick={onToggle} style={{
          width: 20, height: 20, borderRadius: T.radiusSm, flexShrink: 0, cursor: 'pointer', padding: 0,
          border: `1.5px solid ${checked ? T.accent : T.borderStrong}`,
          background: checked ? T.accent : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={T.textOnAccent} strokeWidth="2.2"><path d="M2 6l3 3 5-6"/></svg>}
        </button>
        <div onClick={onExpand} style={{ flex: 1, minWidth: 0, cursor: item.inMeals ? 'pointer' : 'default' }}>
          <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.text, textDecoration: checked ? 'line-through' : 'none' }}>
            {item.name}
            {have && (
              <span style={{
                marginLeft: 7, fontFamily: T.fontBody, fontSize: 9.5, fontWeight: 600, color: T.textTer,
                border: `1px solid ${T.borderFaint}`, borderRadius: 999, padding: '1px 6px',
                letterSpacing: '.04em', textTransform: 'uppercase',
              }}>have</span>
            )}
          </div>
          {!namesOnly && (
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>
              used in {item.meals} {item.meals === 1 ? 'meal' : 'meals'}
              {item.inMeals && <span style={{ color: T.accent }}> · tap to see</span>}
            </div>
          )}
        </div>
        {!namesOnly && <span style={{ fontFamily: T.fontNumber, fontSize: 13, color: T.textSec, whiteSpace: 'nowrap' }}>{item.qty}</span>}
      </div>

      {expanded && item.inMeals && (
        <div style={{ margin: '0 14px 12px 45px', paddingTop: 2 }}>
          <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>In meals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 9 }}>
            {item.inMeals.map((m, j) => (
              <span key={j} style={{
                fontFamily: T.fontBody, fontSize: 11, color: T.textSec,
                background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: 999, padding: '3px 9px',
              }}>{m}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <Button T={T} kind="secondary" size="sm" onClick={onHave}>I have this</Button>
            <Button T={T} kind="ghost" size="sm">Edit amount</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AisleBlock({ T, aisle, aisleIdx, state, namesOnly, dispatch }) {
  const collapsed = state.collapsed[aisleIdx];
  const live = aisle.items.filter((_, i) => !state.checked[`${aisleIdx}-${i}`] && !state.have[`${aisleIdx}-${i}`]).length;
  return (
    <Card T={T} style={{ padding: 0, marginBottom: 8, overflow: 'hidden' }}>
      <button onClick={() => dispatch({ type: 'collapse', aisleIdx })} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: (!collapsed && aisle.items.length) ? `1px solid ${T.borderFaint}` : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.text }}>{aisle.name}</span>
          <span style={{ fontFamily: T.fontNumber, fontSize: 12, color: T.textTer }}>{aisle.items.length || 8}</span>
          {aisle.hint && <span style={{ fontFamily: T.fontBody, fontSize: 10.5, color: T.textTer, fontStyle: 'italic' }}>{aisle.hint}</span>}
        </div>
        <span style={{ fontSize: 14, color: T.textTer, transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .15s' }}>⌄</span>
      </button>
      {!collapsed && aisle.items.map((it, i) => (
        <GRow key={i} T={T} item={it} idx={i} aisleIdx={aisleIdx} namesOnly={namesOnly}
          checked={!!state.checked[`${aisleIdx}-${i}`]}
          have={!!state.have[`${aisleIdx}-${i}`]}
          expanded={state.expanded === `${aisleIdx}-${i}`}
          onToggle={() => dispatch({ type: 'check', key: `${aisleIdx}-${i}` })}
          onExpand={() => dispatch({ type: 'expand', key: `${aisleIdx}-${i}` })}
          onHave={() => dispatch({ type: 'have', key: `${aisleIdx}-${i}` })}
        />
      ))}
    </Card>
  );
}

function ShareSheet({ T, onClose }) {
  const rows = [
    { glyph: '✉', label: 'Copy as text', sub: 'Plain checklist, aisle order' },
    { glyph: '↗', label: 'Share to…', sub: 'Messages, Notes, anything' },
    { glyph: '⤓', label: 'Export PDF', sub: 'Printable, grouped by aisle' },
    { glyph: '◷', label: 'Send to Reminders', sub: 'One list item per row' },
  ];
  return (
    <NDSheet T={T} title="Share list" sub="32 items · week of May 23" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <button key={i} style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusMd,
            padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: T.radiusSm, flexShrink: 0,
              background: T.accentFaint, color: T.accent, border: `1px solid ${T.accentBorder}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
            }}>{r.glyph}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{r.label}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>{r.sub}</div>
            </div>
            <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
          </button>
        ))}
      </div>
    </NDSheet>
  );
}

function groceryReducer(state, action) {
  switch (action.type) {
    case 'check':   return { ...state, checked: { ...state.checked, [action.key]: !state.checked[action.key] } };
    case 'have':    return { ...state, have: { ...state.have, [action.key]: !state.have[action.key] }, expanded: null };
    case 'expand':  return { ...state, expanded: state.expanded === action.key ? null : action.key };
    case 'collapse':return { ...state, collapsed: { ...state.collapsed, [action.aisleIdx]: !state.collapsed[action.aisleIdx] } };
    default: return state;
  }
}

function GroceryList({ T, namesOnlyDefault = false, openShare = false }) {
  const initCollapsed = useNDMemo(() => {
    const c = {};
    AISLES.forEach((a, i) => { if (a.collapsedDefault) c[i] = true; });
    return c;
  }, []);
  const initHave = useNDMemo(() => {
    const h = {};
    AISLES.forEach((a, i) => a.items.forEach((it, j) => { if (it.have) h[`${i}-${j}`] = true; }));
    return h;
  }, []);

  const [state, dispatch] = React.useReducer(groceryReducer, {
    checked: {}, have: initHave, expanded: '1-0', collapsed: initCollapsed,
  });
  const [namesOnly, setNamesOnly] = useND(namesOnlyDefault);
  const [share, setShare] = useND(openShare);

  const totalItems = AISLES.reduce((n, a) => n + a.items.length, 0) + 8; // +spices
  const checkedCount = Object.values(state.checked).filter(Boolean).length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header (on bg) */}
      <div className="ft-on-bg" style={{ padding: '8px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <IconBtn T={T} glyph="‹"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textOnBgTer || T.textTer, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>Week of May 23</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 23, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em', lineHeight: 1.1 }}>Grocery list</div>
          </div>
          <IconBtn T={T} glyph="↗" onClick={() => setShare(true)}/>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <SumStat T={T} label="Items" value={totalItems}/>
          <SumStat T={T} label="Aisles" value={AISLES.length}/>
          <SumStat T={T} label="Checked" value={checkedCount}/>
          <SumStat T={T} label="Est." value="$118"/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', padding: 2, background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: 999 }}>
            {[['Full', false], ['Names only', true]].map(([lbl, v]) => (
              <button key={lbl} onClick={() => setNamesOnly(v)} style={{
                padding: '5px 13px', borderRadius: 999, cursor: 'pointer', border: 'none',
                fontFamily: T.fontBody, fontSize: 11.5, fontWeight: 600,
                background: namesOnly === v ? T.surface : 'transparent',
                color: namesOnly === v ? T.text : T.textTer,
                boxShadow: namesOnly === v ? T.shadowSm : 'none',
              }}>{lbl}</button>
            ))}
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer }}>Sort: aisle</span>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 16px 24px' }}>
        {AISLES.map((a, i) => (
          <AisleBlock key={i} T={T} aisle={a} aisleIdx={i} state={state} namesOnly={namesOnly} dispatch={dispatch}/>
        ))}
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer, textAlign: 'center', padding: '6px 0 2px' }}>
          Checked items move to the bottom of each aisle in-store.
        </div>
      </div>

      {share && <ShareSheet T={T} onClose={() => setShare(false)}/>}
    </div>
  );
}

Object.assign(window, { RecipeDetail, GroceryList, MacroRollup, PhotoPlaceholder });
