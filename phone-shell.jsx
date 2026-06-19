// phone-shell.jsx
// Shared theme-aware phone shell + theme switcher tweak.
//
// Each FitTrack screen file (Weekly Check-In, Active Gameplan, Picker, Planning,
// Logger) renders inside one of these phones. The shell knows, for every theme,
// what colour the bezel should be, what colour the status-bar text should be,
// and what background the inner screen should sit on. That keeps the per-file
// code tiny — pass in a `theme` prop and the shell does the rest.
//
// Status-bar colour rule:
//   - Light-paper themes (lab, notebook, blueprint) → dark text/icons
//   - Dark themes (iron, arcade, cyberpunk, graffiti) → light text/icons
//
// Usage:
//   <ThemedPhone theme={theme} label="Main · Training tab" navSlot={<BottomNav/>}>
//     <ScreenMain/>
//   </ThemedPhone>
//
//   <ThemeSwitcher value={theme} onChange={setTheme}/>
//   (or use the full <ScreenWithThemeTweaks/> wrapper for canonical layout)

const THEMES = [
  { id: 'iron',      name: 'Iron & Chalk' },
  { id: 'lab',       name: 'Lab Report' },
  { id: 'notebook',  name: 'Notebook' },
  { id: 'arcade',    name: 'Arcade' },
  { id: 'blueprint', name: 'Blueprint' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'graffiti',  name: 'Graffiti' },
  { id: 'atompunk',  name: 'Atompunk' },
  { id: 'steampunk', name: 'Steampunk' },
  { id: 'artdeco',   name: 'Art Deco' },
];

// Per-theme presentation tokens for the phone chrome itself
// (these are NOT part of the in-app theme — they're hardware around it).
const PHONE_CHROME = {
  iron:      { bezel: '#1a1917', notch: '#1a1917', screenBg: '#161514', sbColor: '#f5f0e6' },
  lab:       { bezel: '#1a1d22', notch: '#1a1d22', screenBg: '#ECEDF0', sbColor: '#121823' },
  notebook:  { bezel: '#1a1612', notch: '#1a1612', screenBg: '#FAF6ED', sbColor: '#262119' },
  arcade:    { bezel: '#0a0a14', notch: '#0a0a14', screenBg: '#07070F', sbColor: '#ffffff' },
  blueprint: { bezel: '#1a2230', notch: '#1a2230', screenBg: '#DEE9F4', sbColor: '#132C52' },
  cyberpunk: { bezel: '#020611', notch: '#020611', screenBg: '#050A16', sbColor: '#EBFAFF' },
  graffiti:  { bezel: '#0d0d0e', notch: '#0d0d0e', screenBg: '#1C1C1E', sbColor: '#FAFAF8' },
  atompunk:  { bezel: '#1C2B27', notch: '#1C2B27', screenBg: '#DCE6E0', sbColor: '#1F2A28' },
  steampunk: { bezel: '#1A110B', notch: '#1A110B', screenBg: '#231711', sbColor: '#F0E2C8' },
  artdeco:   { bezel: '#0A0B0E', notch: '#0A0B0E', screenBg: '#111317', sbColor: '#F3EAD3' },
};

// SVG path for the wifi/bars icon — drawn with currentColor via fill prop
function StatusIcons({ color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color, letterSpacing: 1 }}>●●●●</span>
      <svg width="16" height="11" viewBox="0 0 16 11" fill={color}>
        <path d="M1 7 L3 7 L3 10 L1 10 Z M5 5 L7 5 L7 10 L5 10 Z M9 3 L11 3 L11 10 L9 10 Z M13 1 L15 1 L15 10 L13 10 Z"/>
      </svg>
      <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke={color} strokeWidth="1">
        <rect x=".5" y="1" width="18" height="9" rx="2"/>
        <rect x="2" y="2.5" width="13" height="6" fill={color}/>
        <rect x="19.5" y="4" width="2" height="3" fill={color}/>
      </svg>
    </span>
  );
}

function useNowClock() {
  const [time, setTime] = React.useState('9:41');
  React.useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 30000);
    return () => clearInterval(t);
  }, []);
  return time;
}

// ── ThemedPhone ─────────────────────────────────────────────────────────────
// Wraps a screen in a phone-shaped frame whose chrome (bezel colour, status
// bar text colour, base screen background) follows the supplied theme. The
// inner content is wrapped in `.ft[data-theme=…]` so the design tokens kick in.
//
// Props:
//   theme         — one of the 7 theme ids (default 'lab')
//   label         — data-screen-label for comments
//   width/height  — frame dimensions; defaults sized for 432×892 artboard
//   navSlot       — optional element rendered above status bar (e.g. BottomNav)
//   chromeOverlay — optional fn(theme) returning extra chrome (e.g. Notebook
//                   spiral, Arcade CRT) — rendered inside the screen, behind
//                   content if you need it.
//   children      — the screen content
function ThemedPhone({
  theme = 'lab',
  label,
  width = 410,
  height = 870,
  navSlot,
  chromeOverlay,
  fixedClock = '9:41',
  children,
}) {
  const time = fixedClock || useNowClock();
  const chrome = PHONE_CHROME[theme] || PHONE_CHROME.lab;

  return (
    <div
      data-screen-label={label}
      style={{
        width, height,
        borderRadius: 46,
        background: chrome.bezel,
        padding: 11,
        boxShadow: '0 20px 40px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.10)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%', height: '100%',
          borderRadius: 36,
          overflow: 'hidden',
          position: 'relative',
          background: chrome.screenBg,
        }}
      >
        <div
          className="ft"
          data-theme={theme}
          style={{ position: 'absolute', inset: 0, background: 'rgb(var(--ft-bg))' }}
        >
          {chromeOverlay && chromeOverlay(theme)}

          {/* Notch */}
          <div
            style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: 118, height: 28,
              background: chrome.notch,
              borderRadius: '0 0 18px 18px',
              zIndex: 100,
            }}
          />

          {/* Status bar */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 28px', zIndex: 99,
              color: chrome.sbColor,
              fontSize: 13, fontWeight: 600,
              pointerEvents: 'none',
              fontFamily: 'var(--ft-font-body, "IBM Plex Sans", sans-serif)',
              letterSpacing: '.01em',
            }}
          >
            <span>{time}</span>
            <StatusIcons color={chrome.sbColor} />
          </div>

          {/* Screen content */}
          <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0 }}>
            {children}
          </div>

          {navSlot}
        </div>
      </div>
    </div>
  );
}

// ── ThemeSwitcher ───────────────────────────────────────────────────────────
// Renders a TweakSelect of all 7 themes. Drop inside <TweaksPanel> alongside
// any per-screen knobs.
function ThemeSwitcher({ value, onChange, label = 'Theme' }) {
  return (
    <TweakSelect
      label={label}
      value={value}
      options={THEMES.map((t) => ({ value: t.id, label: t.name }))}
      onChange={onChange}
    />
  );
}

// ── ThemeCycler ─────────────────────────────────────────────────────────────
// Step through all 7 themes in order: ◀ / ▶ buttons (wrap around), a centre
// label that names the current theme + its position (click = advance), a
// swatch strip below for direct jump, and `[` / `]` keyboard shortcuts.
// Keys are intentionally NOT ←/→ — the DesignCanvas focus overlay owns those.
// Drop inside <TweaksPanel> in place of <ThemeSwitcher> for rapid canary.
function ThemeCycler({ value, onChange, label = 'Theme' }) {
  const idx = Math.max(0, THEMES.findIndex((t) => t.id === value));
  const go = React.useCallback((dir) => {
    const next = (idx + dir + THEMES.length) % THEMES.length;
    onChange(THEMES[next].id);
  }, [idx, onChange]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const tag = (t && t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
      if (e.key === '[') { e.preventDefault(); go(-1); }
      else if (e.key === ']') { e.preventDefault(); go(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const cur = THEMES[idx] || THEMES[0];
  const btn = {
    width: 36, flexShrink: 0, cursor: 'pointer',
    border: '1px solid rgba(60,50,40,.2)', borderRadius: 8,
    background: '#fff', color: 'rgba(40,32,24,.8)',
    fontSize: 13, lineHeight: 1, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'rgba(60,50,40,.6)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, height: 42 }}>
        <button type="button" style={btn} onClick={() => go(-1)} aria-label="Previous theme">◀</button>
        <div
          onClick={() => go(1)}
          title="Click to advance · press [ or ] to cycle"
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(60,50,40,.2)', borderRadius: 8, background: '#fff',
            padding: '4px 8px', cursor: 'pointer', userSelect: 'none',
          }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(28,22,16,.92)', lineHeight: 1.1 }}>{cur.name}</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', color: 'rgba(60,50,40,.5)', marginTop: 2 }}>{idx + 1} / {THEMES.length}&nbsp;&nbsp;·&nbsp;&nbsp;[ ]</span>
        </div>
        <button type="button" style={btn} onClick={() => go(1)} aria-label="Next theme">▶</button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {THEMES.map((t, i) => {
          const c = PHONE_CHROME[t.id] || {};
          const active = i === idx;
          return (
            <button key={t.id} type="button" onClick={() => onChange(t.id)} title={t.name} aria-label={t.name}
              style={{
                flex: 1, height: 16, padding: 0, cursor: 'pointer', borderRadius: 4,
                background: c.screenBg || '#ddd',
                border: active ? '2px solid rgba(28,22,16,.9)' : '1px solid rgba(60,50,40,.25)',
                boxShadow: active ? '0 0 0 2px rgba(255,255,255,.7)' : 'none',
              }}/>
          );
        })}
      </div>
    </div>
  );
}

// Helper — a 7-button compact grid for inline (non-tweak) theme picking.
// Used when the screen wants its own switcher above the artboard rather than
// a floating panel.
function ThemeChips({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6,
      padding: '8px 12px',
      background: 'rgba(0,0,0,.04)',
      border: '1px solid rgba(0,0,0,.08)',
      borderRadius: 10,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      fontSize: 11,
    }}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            appearance: 'none',
            border: '1px solid ' + (value === t.id ? '#111' : 'rgba(0,0,0,.15)'),
            background: value === t.id ? '#111' : '#fff',
            color: value === t.id ? '#fff' : '#333',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  THEMES, PHONE_CHROME,
  ThemedPhone, ThemeSwitcher, ThemeCycler, ThemeChips,
  StatusIcons, useNowClock,
});
