// small-sheets.jsx
// Build-plan step 06 — Small sheets pass.
//   2.5  Save as Frame            (sheet on workout finish · Logger)
//   2.7a Manual Macro Target Editor (sheet from Nutrition)
//   3.1a Switch Active Program    (sheet from My Program)
//
// One shared chrome (SheetStage + Sheet) does the scrim, grabber, header,
// scrolling body, and footer. Each sheet renders over a dimmed home screen
// so the surface reads in context. Everything reads tokens from the bridge
// (useFitTrackTheme) so all 7 themes flow through one source of truth.
//
// Reuses from tier-homes-screens.jsx: Card, Button, Chip, Stamp,
// WorkoutsLibrary, MyProgram.

const { useState } = React;

// ────────────────────────────────────────────────────────────────────────
// Shared sheet chrome

function SheetClose({ T, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 999, flexShrink: 0,
      background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`,
      color: T.textSec, fontFamily: T.fontBody, fontSize: 14,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', lineHeight: 1,
    }}>✕</button>
  );
}

// The stage: dimmed context screen behind a scrim, sheet anchored to bottom.
function SheetStage({ T, behind, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {behind && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {behind}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }}/>
      {children}
    </div>
  );
}

function Sheet({ T, title, sub, children, footer }) {
  // Sharp themes (iron/arcade/blueprint/cyberpunk/graffiti) keep their corners;
  // soft themes get a rounded sheet lip.
  const lip = (T.radiusLg || 0) > 2 ? 18 : T.radiusLg || 0;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      maxHeight: '90%',
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      borderRadius: `${lip}px ${lip}px 0 0`,
      boxShadow: '0 -10px 40px rgba(0,0,0,.35)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* grabber */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '9px 0 2px' }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: T.textTer, opacity: .45 }}/>
      </div>
      {/* header */}
      <div style={{
        padding: '6px 18px 13px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        borderBottom: `1px solid ${T.borderFaint}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700,
            color: T.text, letterSpacing: '-.01em', lineHeight: 1.15,
          }}>{title}</div>
          {sub && (
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 3, lineHeight: 1.35 }}>
              {sub}
            </div>
          )}
        </div>
        <SheetClose T={T}/>
      </div>
      {/* body */}
      <div style={{ overflow: 'auto', padding: '14px 18px 4px', flex: 1 }}>
        {children}
      </div>
      {/* footer */}
      {footer && (
        <div style={{
          padding: '12px 18px 16px', borderTop: `1px solid ${T.borderFaint}`,
          background: T.surface, display: 'flex', flexDirection: 'column', gap: 8,
        }}>{footer}</div>
      )}
    </div>
  );
}

// Small reusable controls (token-driven)

function FieldLabel({ T, children, right, onBg }) {
  return (
    <div className={onBg ? 'ft-on-bg' : undefined} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: onBg ? (T.textOnBgSec || T.textSec) : T.textSec,
        letterSpacing: '.1em', textTransform: 'uppercase',
      }}>{children}</span>
      {right && <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBg ? (T.textOnBgTer || T.textTer) : T.textTer }}>{right}</span>}
    </div>
  );
}

function TextField({ T, value, onChange }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} style={{
      width: '100%', boxSizing: 'border-box',
      padding: '11px 13px',
      background: T.surfaceAlt, color: T.text,
      border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
      fontFamily: T.fontBody, fontSize: 14.5, fontWeight: 600,
      outline: 'none',
    }}/>
  );
}

function Toggle({ T, on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 46, height: 27, borderRadius: 999, padding: 2, cursor: 'pointer', flexShrink: 0,
      background: on ? T.accent : T.surfaceAlt,
      border: `1px solid ${on ? T.accent : T.border}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'background .12s',
    }}>
      <span style={{
        width: 21, height: 21, borderRadius: 999,
        background: on ? T.textOnAccent : T.textTer,
        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
      }}/>
    </button>
  );
}

function OptionRow({ T, title, hint, control }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '11px 0',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{title}</div>
        {hint && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>{hint}</div>}
      </div>
      {control}
    </div>
  );
}

function Stepper({ T, value, onChange, step = 1, min = 0, fmt }) {
  const btn = {
    width: 34, height: 34, flexShrink: 0,
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: T.text, fontFamily: T.fontBody, fontSize: 18, lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 8,
      background: T.surfaceAlt, overflow: 'hidden',
    }}>
      <button style={btn} onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <span style={{
        minWidth: 70, textAlign: 'center',
        fontFamily: T.fontNumber, fontSize: 15, fontWeight: 700, color: T.text,
        letterSpacing: '.01em',
      }}>{fmt ? fmt(value) : value}</span>
      <button style={btn} onClick={() => onChange(value + step)}>+</button>
    </div>
  );
}

function Segmented({ T, options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
    }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            flex: 1, padding: '8px 6px', cursor: 'pointer',
            background: sel ? T.surface : 'transparent',
            border: sel ? `1px solid ${T.border}` : '1px solid transparent',
            borderRadius: (T.radiusMd || 8) - 2,
            color: sel ? T.text : T.textTer,
            fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600,
            boxShadow: sel ? T.shadowSm : 'none',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2.5 — SAVE AS FRAME

const FINISHED_EXERCISES = [
  { name: 'Bench Press',      sets: '4 × 5 · 185 lb' },
  { name: 'Overhead Press',   sets: '3 × 8 · 95 lb'  },
  { name: 'Incline DB Press', sets: '3 × 10 · 60 lb' },
  { name: 'Lateral Raise',    sets: '3 × 12 · 20 lb' },
  { name: 'Tricep Pushdown',  sets: '3 × 12 · 50 lb' },
];

function SaveAsFrame({ T, conflict: initialConflict = false }) {
  const [name, setName] = useState('Upper · Push');
  const [keepWeights, setKeepWeights] = useState(true);
  const [pin, setPin] = useState(false);
  // conflict appears when the typed name collides with an existing frame
  const exists = name.trim().toLowerCase() === 'upper · push' && initialConflict;

  const footer = exists ? (
    <>
      <Button T={T} kind="primary" style={{ width: '100%' }}>Replace existing frame</Button>
      <Button T={T} kind="secondary" style={{ width: '100%' }}>Save as copy</Button>
    </>
  ) : (
    <>
      <Button T={T} kind="primary" style={{ width: '100%' }}>Save frame</Button>
      <Button T={T} kind="ghost" style={{ width: '100%' }}>Skip</Button>
    </>
  );

  return (
    <Sheet T={T} title="Save as frame"
      sub="Reuse this session in two taps from your library."
      footer={footer}>

      {/* Just-finished summary */}
      <Card T={T} style={{ padding: '13px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <Stamp T={T}>Just finished</Stamp>
          <Chip T={T} tone="success" size="sm">Logged</Chip>
        </div>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text,
          marginTop: 5, letterSpacing: '-.01em',
        }}>Upper · Push</div>
        <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textTer, marginTop: 2, letterSpacing: '.03em' }}>
          5 exercises · 52 min · Today
        </div>
        <div style={{
          marginTop: 11, paddingTop: 11, borderTop: `1px solid ${T.borderFaint}`,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {FINISHED_EXERCISES.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{
                fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec,
                minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{e.name}</span>
              <span style={{ fontFamily: T.fontNumber, fontSize: 11.5, color: T.textTer, flexShrink: 0, letterSpacing: '.02em', whiteSpace: 'nowrap' }}>
                {e.sets}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Frame name */}
      <div style={{ marginBottom: 4 }}>
        <FieldLabel T={T}>Frame name</FieldLabel>
        <TextField T={T} value={name} onChange={setName}/>
        {exists && (
          <div style={{
            marginTop: 8, padding: '8px 11px',
            background: T.warnBg, border: `1px solid ${T.warnBorder}`, borderRadius: T.radiusMd || 8,
            fontFamily: T.fontBody, fontSize: 12, color: T.warnFg, lineHeight: 1.35,
          }}>
            A frame named “Upper · Push” already exists · used 9×
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ marginTop: 6, borderTop: `1px solid ${T.borderFaint}` }}>
        <OptionRow T={T}
          title="Keep target weights"
          hint="Saves loads — 185 lb bench, 95 lb OHP…"
          control={<Toggle T={T} on={keepWeights} onChange={setKeepWeights}/>}/>
        <div style={{ borderTop: `1px solid ${T.borderFaint}` }}/>
        <OptionRow T={T}
          title="Pin to top"
          hint="Shows first in Saved frames"
          control={<Toggle T={T} on={pin} onChange={setPin}/>}/>
      </div>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2.7a — MANUAL MACRO TARGET EDITOR

const KCAL = { p: 4, c: 4, f: 9 };

function macroKcal(g) { return g.p * KCAL.p + g.c * KCAL.c + g.f * KCAL.f; }

function MacroEditor({ T, over: initialOver = false }) {
  const [cals, setCals] = useState(2400);
  const [g, setG] = useState(initialOver ? { p: 180, c: 250, f: 95 } : { p: 180, c: 250, f: 75 });
  const [preset, setPreset] = useState(initialOver ? 'custom' : 'balanced');

  const set = (k, v) => { setG({ ...g, [k]: v }); setPreset('custom'); };

  const applyPreset = (id) => {
    const split = { balanced: [.30, .40, .30], protein: [.40, .35, .25], lowcarb: [.35, .20, .45] }[id];
    if (!split) return;
    setG({
      p: Math.round(cals * split[0] / KCAL.p),
      c: Math.round(cals * split[1] / KCAL.c),
      f: Math.round(cals * split[2] / KCAL.f),
    });
    setPreset(id);
  };

  const fromMacros = macroKcal(g);
  const diff = fromMacros - cals;
  const matched = Math.abs(diff) <= 50;

  const rows = [
    { k: 'p', label: 'Protein', color: T.push, kc: g.p * KCAL.p },
    { k: 'c', label: 'Carbs',   color: T.core, kc: g.c * KCAL.c },
    { k: 'f', label: 'Fat',     color: T.legs, kc: g.f * KCAL.f },
  ];

  const scaleToFit = () => {
    const f = cals / fromMacros;
    setG({ p: Math.round(g.p * f), c: Math.round(g.c * f), f: Math.round(g.f * f) });
    setPreset('custom');
  };

  const footer = (
    <>
      <Button T={T} kind="primary" style={{ width: '100%' }}>Save targets</Button>
      <Button T={T} kind="ghost" style={{ width: '100%' }}>Reset to calculated</Button>
    </>
  );

  return (
    <Sheet T={T} title="Macro targets"
      sub="Manual override — replaces the calculated split."
      footer={footer}>

      {/* Calories */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: T.fontData, fontSize: 10.5, fontWeight: 700, color: T.textSec, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Daily calories
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>Target before macros</div>
        </div>
        <Stepper T={T} value={cals} step={50} min={1000}
          onChange={setCals} fmt={(v) => v.toLocaleString()}/>
      </div>

      {/* Split bar */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: T.surfaceAlt }}>
          {rows.map((r) => (
            <div key={r.k} style={{ width: `${(r.kc / fromMacros) * 100}%`, background: r.color }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {rows.map((r) => (
            <span key={r.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, letterSpacing: '.04em' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color }}/>
              {Math.round((r.kc / fromMacros) * 100)}%
            </span>
          ))}
        </div>
      </div>

      {/* Macro rows */}
      <div style={{ margin: '14px 0 6px' }}>
        {rows.map((r, i) => (
          <div key={r.k} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.borderFaint}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }}/>
              <div>
                <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{r.label}</div>
                <div style={{ fontFamily: T.fontNumber, fontSize: 11, color: T.textTer, marginTop: 1, letterSpacing: '.03em' }}>
                  {r.kc.toLocaleString()} kcal
                </div>
              </div>
            </div>
            <Stepper T={T} value={g[r.k]} step={5} onChange={(v) => set(r.k, v)} fmt={(v) => `${v} g`}/>
          </div>
        ))}
      </div>

      {/* Reconcile */}
      <div style={{
        marginTop: 8, padding: '11px 13px',
        background: matched ? T.successBg : T.warnBg,
        border: `1px solid ${matched ? T.successBorder : T.warnBorder}`,
        borderRadius: T.radiusMd || 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: matched ? T.successFg : T.warnFg }}>
            {matched ? 'Matches target' : `${Math.abs(diff)} kcal ${diff > 0 ? 'over' : 'under'} target`}
          </div>
          <div style={{ fontFamily: T.fontNumber, fontSize: 11, color: matched ? T.successFg : T.warnFg, opacity: .8, marginTop: 1, letterSpacing: '.03em' }}>
            {fromMacros.toLocaleString()} from macros · {cals.toLocaleString()} target
          </div>
        </div>
        {!matched && (
          <button onClick={scaleToFit} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0,
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.warnFg, textDecoration: 'underline',
          }}>Scale to fit</button>
        )}
      </div>

      {/* Presets */}
      <div style={{ margin: '16px 0 6px' }}>
        <FieldLabel T={T}>Presets</FieldLabel>
        <Segmented T={T} value={preset} onChange={applyPreset}
          options={[
            { value: 'balanced', label: 'Balanced' },
            { value: 'protein',  label: 'High-protein' },
            { value: 'lowcarb',  label: 'Low-carb' },
          ]}/>
      </div>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3.1a — SWITCH ACTIVE PROGRAM

const OWNED_PROGRAMS = [
  { id: 'ppl',      name: 'PPL · Intermediate', meta: '12 wk · Hypertrophy', progress: 'Week 4 of 12', pct: 33, current: true },
  { id: 'fullbody', name: 'Full Body 3×',        meta: '8 wk · Strength',     progress: 'Last active 3 wk ago', pct: 0 },
  { id: 'power',    name: 'Powerbuilder',        meta: '16 wk · Recomp',      progress: 'Not started', pct: 0 },
];

function ProgramRow({ T, p, selected, onSelect }) {
  return (
    <Card T={T} onClick={onSelect} style={{
      padding: '12px 14px', cursor: 'pointer',
      borderColor: selected ? T.accent : undefined,
      boxShadow: selected ? `inset 0 0 0 1px ${T.accent}` : T.shadowSm,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* radio */}
      <span style={{
        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
        border: `2px solid ${selected ? T.accent : T.borderStrong}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <span style={{ width: 10, height: 10, borderRadius: 999, background: T.accent }}/>}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text,
            minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{p.name}</span>
          {p.current && <Chip T={T} tone="accent" size="sm">Active</Chip>}
        </div>
        <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 3, letterSpacing: '.03em' }}>
          {p.meta} · {p.progress}
        </div>
        {p.pct > 0 && (
          <div style={{ marginTop: 7, height: 4, borderRadius: 999, background: T.surfaceAlt, overflow: 'hidden' }}>
            <div style={{ width: `${p.pct}%`, height: '100%', background: T.accent }}/>
          </div>
        )}
      </div>
    </Card>
  );
}

function SwitchProgram({ T, initial = 'ppl' }) {
  const [sel, setSel] = useState(initial);
  const current = OWNED_PROGRAMS.find((p) => p.current);
  const target = OWNED_PROGRAMS.find((p) => p.id === sel);
  const changed = sel !== current.id;

  const footer = (
    <>
      {changed && (
        <div style={{
          fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer,
          textAlign: 'center', marginBottom: 2,
        }}>
          {current.name} pauses at {current.progress} · progress saved
        </div>
      )}
      <Button T={T} kind="primary" style={{ width: '100%', opacity: changed ? 1 : .4 }}>
        {changed ? `Switch to ${target.name}` : 'Switch program'}
      </Button>
      <Button T={T} kind="ghost" style={{ width: '100%' }}>Cancel</Button>
    </>
  );

  return (
    <Sheet T={T} title="Switch program"
      sub="Activate another program you own."
      footer={footer}>
      <FieldLabel T={T} right="3 owned">Your library</FieldLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {OWNED_PROGRAMS.map((p) => (
          <ProgramRow key={p.id} T={T} p={p} selected={sel === p.id} onSelect={() => setSel(p.id)}/>
        ))}
      </div>
    </Sheet>
  );
}

// ────────────────────────────────────────────────────────────────────────
// A light static nutrition backdrop for 2.7a context (no nutrition deps).

function NutritionBackdrop({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingBottom: 80 }}>
      <Header T={T} kind="home" title="Nutrition" subtitle="Program tier"/>
      <div style={{ padding: '8px 16px 0' }}>
        <Card T={T} raised style={{ padding: '16px' }}>
          <Stamp T={T}>Today · Macros</Stamp>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[['Protein', '142 / 180'], ['Carbs', '198 / 250'], ['Fat', '54 / 75']].map(([l, v], i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.06em', textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontFamily: T.fontNumber, fontSize: 16, fontWeight: 700, color: T.text, marginTop: 3 }}>{v}</div>
                <div style={{ marginTop: 6, height: 4, borderRadius: 999, background: T.surfaceAlt, overflow: 'hidden' }}>
                  <div style={{ width: ['79%', '79%', '72%'][i], height: '100%', background: [T.push, T.core, T.legs][i] }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {['Breakfast · 612 kcal', 'Lunch · 740 kcal', 'Dinner · 520 kcal'].map((m, i) => (
          <Card key={i} T={T} style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{m.split(' · ')[0]}</span>
            <span style={{ fontFamily: T.fontNumber, fontSize: 12, color: T.textTer }}>{m.split(' · ')[1]}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  Sheet, SheetStage, SheetClose,
  SaveAsFrame, MacroEditor, SwitchProgram,
  NutritionBackdrop,
  Toggle, Stepper, Segmented, TextField, FieldLabel, OptionRow,
});
