// theme-bridge.jsx
// Bridge between the CSS token system (.ft[data-theme=…] in theme-tokens.css)
// and the inline-style screen libraries.
//
// The screen libraries (checkin-screens, gameplan-active, planning-screens,
// picker-screens) were each written against a private constant object —
// LAB, GRAFFITI, IRON, BP — accessed as e.g. LAB.text, GRAFFITI.accent.
// To make every screen render in any theme without rewriting their inline
// styles, we replace those private constants with a single shared bridge
// that returns a same-shaped object for whichever theme is active.
//
// Usage in a screen library:
//   const T = useFitTrackTheme(theme);   // theme = 'lab' | 'iron' | …
//   <span style={{ color: T.text, background: T.surface }}>…</span>
//
// Adapter contract (every theme returns these keys):
//   bg, bgAlt, surface, surfaceAlt, surfaceRaised
//   text, textSec, textTer, textOnAccent
//   border, borderFaint, borderStrong
//   accent, accentFg, accentFaint, accentBorder
//   success, successFg, successBg, successBorder
//   warn,    warnFg,    warnBg,    warnBorder
//   danger,  dangerFg,  dangerBg,  dangerBorder
//   info,    infoFg,    infoBg,    infoBorder
//   push, pull, legs, core           (muscle group tints)
//   fontBody, fontDisplay, fontData, fontNumber  (CSS font-family strings)
//   radiusSm, radiusMd, radiusLg
//   shadowSm, shadowMd
//   stampFg, stampBg, stampBorder    (for severity stamps and chips)
//   isDark                            (boolean — for tint decisions)
//
// Field naming aliases the keys the existing screen libraries use:
//   blue → accent
//   blueFaint → accentFaint
//   muscleGroup colors stay as push/pull/legs/core
//   warnBg/successBg/dangerBg → state-bg shortcuts

const FT_THEMES_DATA = {
  lab: {
    isDark: false,
    bg: '#ECEDF0', bgAlt: '#F8F9FB',
    surface: '#FFFFFF', surfaceAlt: '#F8F9FB', surfaceRaised: '#FFFFFF',
    text: '#121823', textSec: '#3A4254', textTer: '#6B7280', textOnAccent: '#FFFFFF',
    border: '#D2D6DC', borderFaint: '#E5E7EB', borderStrong: '#9CA3AF',
    accent: '#2563EB', accentFg: '#2563EB', accentFaint: '#EFF4FE', accentBorder: '#C7D7FB',
    success: '#15803D', successFg: '#15803D', successBg: '#ECFDF3', successBorder: '#A7E0BC',
    warn:    '#C77405', warnFg:    '#C77405', warnBg:    '#FFF6E5', warnBorder:    '#F4D69A',
    danger:  '#B42318', dangerFg:  '#B42318', dangerBg:  '#FEF1F0', dangerBorder:  '#F5B5AE',
    info:    '#2563EB', infoFg:    '#2563EB', infoBg:    '#EFF4FE', infoBorder:    '#C7D7FB',
    push: '#4A90D9', pull: '#5CB85C', legs: '#D9534F', core: '#F0AD4E',
    fontBody:    "'IBM Plex Sans', sans-serif",
    fontDisplay: "'IBM Plex Sans', sans-serif",
    fontData:    "'JetBrains Mono', monospace",
    fontNumber:  "'JetBrains Mono', monospace",
    radiusSm: 4, radiusMd: 6, radiusLg: 10,
    shadowSm: '0 1px 2px rgba(0,0,0,.04)',
    shadowMd: '0 4px 12px rgba(0,0,0,.08)',
    stampFg: '#6B7280', stampBg: 'transparent', stampBorder: '#D2D6DC',
    chrome: 'lab',
  },

  iron: {
    isDark: true,
    bg: '#161514', bgAlt: '#1E1D1B',
    surface: '#2E2D2B', surfaceAlt: '#3a3835', surfaceRaised: '#3C3A37',
    text: '#F5F0E6', textSec: '#D7CDBE', textTer: '#A59B8C', textOnAccent: '#161514',
    border: 'rgba(200,169,110,.25)', borderFaint: 'rgba(200,169,110,.12)', borderStrong: 'rgba(200,169,110,.55)',
    accent: '#C8A96E', accentFg: '#C8A96E', accentFaint: 'rgba(200,169,110,.15)', accentBorder: 'rgba(200,169,110,.4)',
    success: '#6EC882', successFg: '#82D791', successBg: 'rgba(110,200,130,.10)', successBorder: 'rgba(110,200,130,.35)',
    warn:    '#F0BE5A', warnFg:    '#F0C86E', warnBg:    'rgba(240,190,90,.10)',  warnBorder:    'rgba(240,190,90,.35)',
    danger:  '#F05F55', dangerFg:  '#F58278', dangerBg:  'rgba(240,95,85,.10)',   dangerBorder:  'rgba(240,95,85,.40)',
    info:    '#C8A96E', infoFg:    '#C8A96E', infoBg:    'rgba(200,169,110,.10)', infoBorder:    'rgba(200,169,110,.4)',
    push: '#5BA0E0', pull: '#7AC97A', legs: '#E07268', core: '#E8B860',
    fontBody:    "'Oswald', sans-serif",
    fontDisplay: "'Stardos Stencil', serif",
    fontData:    "'Teko', sans-serif",
    fontNumber:  "'Teko', sans-serif",
    radiusSm: 0, radiusMd: 0, radiusLg: 2,
    shadowSm: '0 1px 0 rgba(0,0,0,.4)',
    shadowMd: '0 4px 12px rgba(0,0,0,.5)',
    stampFg: '#C8A96E', stampBg: 'transparent', stampBorder: 'rgba(200,169,110,.6)',
    chrome: 'iron',
  },

  notebook: {
    isDark: false,
    bg: '#FAF6ED', bgAlt: '#F0EBDD',
    surface: '#FFFCF4', surfaceAlt: '#FAF6ED', surfaceRaised: '#FFFFFF',
    text: '#262119', textSec: '#5A4F40', textTer: '#8C7D69', textOnAccent: '#FFFCF4',
    border: '#D2C6B2', borderFaint: '#E5DBCB', borderStrong: '#A89B85',
    accent: '#B5312A', accentFg: '#B5312A', accentFaint: 'rgba(181,49,42,.10)', accentBorder: 'rgba(181,49,42,.35)',
    success: '#407A3C', successFg: '#407A3C', successBg: '#E6F0D7', successBorder: '#B4CD91',
    warn:    '#AA5F14', warnFg:    '#AA5F14', warnBg:    '#F6E8C8', warnBorder:    '#D2AF6E',
    danger:  '#B5312A', dangerFg:  '#B5312A', dangerBg:  '#F5DCD5', dangerBorder:  '#D29182',
    info:    '#325582', infoFg:    '#325582', infoBg:    '#DCE6F0', infoBorder:    '#AABED2',
    push: '#5A85C7', pull: '#6BAA64', legs: '#C25A4F', core: '#D49A48',
    fontBody:    "'Patrick Hand', cursive",
    fontDisplay: "'Caveat', cursive",
    fontData:    "'Caveat', cursive",
    fontNumber:  "'Caveat', cursive",
    radiusSm: 2, radiusMd: 2, radiusLg: 3,
    shadowSm: '0 1px 2px rgba(0,0,0,.08)',
    shadowMd: '0 4px 10px rgba(0,0,0,.1)',
    stampFg: '#8C7D69', stampBg: 'transparent', stampBorder: '#D2C6B2',
    chrome: 'notebook',
  },

  arcade: {
    isDark: true,
    bg: '#07070F', bgAlt: '#0E0E1C',
    surface: '#22223A', surfaceAlt: '#1A1A2E', surfaceRaised: '#2A2A44',
    text: '#FFFFFF', textSec: '#DCD7F0', textTer: '#A8A3D2', textOnAccent: '#07070F',
    border: '#FF50C8', borderFaint: 'rgba(255,80,200,.30)', borderStrong: '#00F0FF',
    accent: '#FF50C8', accentFg: '#FF50C8', accentFaint: 'rgba(255,80,200,.15)', accentBorder: 'rgba(255,80,200,.55)',
    success: '#32F082', successFg: '#50FF8C', successBg: 'rgba(50,240,130,.10)', successBorder: '#32F082',
    warn:    '#FFDC3C', warnFg:    '#FFEB5A', warnBg:    'rgba(255,220,60,.10)', warnBorder:    '#FFDC3C',
    danger:  '#FF508C', dangerFg:  '#FF6EA0', dangerBg:  'rgba(255,80,140,.10)', dangerBorder:  '#FF508C',
    info:    '#00F0FF', infoFg:    '#00F0FF', infoBg:    'rgba(0,240,255,.10)',  infoBorder:    '#00F0FF',
    push: '#00F0FF', pull: '#50FF8C', legs: '#FF508C', core: '#FFDC3C',
    fontBody:    "'Pixelify Sans', sans-serif",
    fontDisplay: "'Press Start 2P', monospace",
    fontData:    "'VT323', monospace",
    fontNumber:  "'VT323', monospace",
    radiusSm: 0, radiusMd: 0, radiusLg: 0,
    shadowSm: '2px 2px 0 rgba(0,240,255,.5)',
    shadowMd: '4px 4px 0 rgba(255,80,200,.35)',
    stampFg: '#00F0FF', stampBg: 'transparent', stampBorder: '#00F0FF',
    chrome: 'arcade',
  },

  blueprint: {
    isDark: false,  // page is light; cards are dark navy
    bg: '#DEE9F4', bgAlt: '#CDD9E6',
    surface: '#132C52', surfaceAlt: '#1E3C6E', surfaceRaised: '#1E3C6E',
    text: '#FAFDFF', textSec: '#D2E1F0', textTer: '#90B0CC', textOnAccent: '#132C52',
    border: '#132C52', borderFaint: 'rgba(19,44,82,.35)', borderStrong: '#132C52',
    accent: '#FAFDFF', accentFg: '#FAFDFF', accentFaint: 'rgba(255,255,255,.10)', accentBorder: 'rgba(255,255,255,.45)',
    success: '#74D894', successFg: '#A0E5B0', successBg: 'rgba(116,216,148,.12)', successBorder: 'rgba(116,216,148,.4)',
    warn:    '#F0CD5A', warnFg:    '#F5DA7A', warnBg:    'rgba(240,205,90,.12)',  warnBorder:    'rgba(240,205,90,.4)',
    danger:  '#FF8B7E', dangerFg:  '#FFA89C', dangerBg:  'rgba(255,139,126,.12)', dangerBorder:  'rgba(255,139,126,.45)',
    info:    '#90C8FF', infoFg:    '#90C8FF', infoBg:    'rgba(144,200,255,.12)', infoBorder:    'rgba(144,200,255,.4)',
    push: '#90C8FF', pull: '#A0E5B0', legs: '#FFA89C', core: '#F5DA7A',
    fontBody:    "'Space Mono', monospace",
    fontDisplay: "'Major Mono Display', monospace",
    fontData:    "'Space Mono', monospace",
    fontNumber:  "'Space Mono', monospace",
    radiusSm: 0, radiusMd: 0, radiusLg: 2,
    shadowSm: '0 1px 0 rgba(19,44,82,.3)',
    shadowMd: '0 4px 16px rgba(19,44,82,.18)',
    stampFg: '#FAFDFF', stampBg: 'transparent', stampBorder: 'rgba(255,255,255,.5)',
    chrome: 'blueprint',
  },

  cyberpunk: {
    isDark: true,
    bg: '#050A16', bgAlt: '#0C1426',
    surface: '#121E34', surfaceAlt: '#0E1828', surfaceRaised: '#1A2A4A',
    text: '#EBFAFF', textSec: '#C8E6F5', textTer: '#90B0C8', textOnAccent: '#050A16',
    border: 'rgba(0,240,255,.35)', borderFaint: 'rgba(0,240,255,.15)', borderStrong: '#00F0FF',
    accent: '#00F0FF', accentFg: '#00F0FF', accentFaint: 'rgba(0,240,255,.12)', accentBorder: 'rgba(0,240,255,.5)',
    success: '#50F0A0', successFg: '#7DFFB8', successBg: 'rgba(80,240,160,.10)', successBorder: 'rgba(80,240,160,.4)',
    warn:    '#FFD050', warnFg:    '#FFE078', warnBg:    'rgba(255,208,80,.10)', warnBorder:    'rgba(255,208,80,.4)',
    danger:  '#FF5878', dangerFg:  '#FF8AA2', dangerBg:  'rgba(255,88,120,.10)', dangerBorder:  'rgba(255,88,120,.4)',
    info:    '#00F0FF', infoFg:    '#00F0FF', infoBg:    'rgba(0,240,255,.12)',  infoBorder:    'rgba(0,240,255,.5)',
    push: '#00F0FF', pull: '#7DFFB8', legs: '#FF8AA2', core: '#FFD050',
    fontBody:    "'Share Tech Mono', monospace",
    fontDisplay: "'Orbitron', sans-serif",
    fontData:    "'Share Tech Mono', monospace",
    fontNumber:  "'Share Tech Mono', monospace",
    radiusSm: 0, radiusMd: 0, radiusLg: 2,
    shadowSm: '0 0 6px rgba(0,240,255,.25)',
    shadowMd: '0 0 20px rgba(0,240,255,.18)',
    stampFg: '#00F0FF', stampBg: 'transparent', stampBorder: 'rgba(0,240,255,.5)',
    chrome: 'cyberpunk',
  },

  graffiti: {
    isDark: true,
    bg: '#1C1C1E', bgAlt: '#2A2A2D',
    surface: '#3A3A3E', surfaceAlt: '#2D2D30', surfaceRaised: '#48484C',
    text: '#FAFAF8', textSec: '#D7D7DC', textTer: '#969699', textOnAccent: '#1C1C1E',
    border: 'rgba(245,220,60,.35)', borderFaint: 'rgba(255,255,255,.10)', borderStrong: '#F5DC3C',
    accent: '#F5DC3C', accentFg: '#F5DC3C', accentFaint: 'rgba(245,220,60,.15)', accentBorder: 'rgba(245,220,60,.5)',
    success: '#5CB85C', successFg: '#7DD17D', successBg: 'rgba(92,184,92,.12)', successBorder: 'rgba(92,184,92,.4)',
    warn:    '#F0AD4E', warnFg:    '#F5C275', warnBg:    'rgba(240,173,78,.12)', warnBorder:    'rgba(240,173,78,.4)',
    danger:  '#FF508C', dangerFg:  '#FF7AA8', dangerBg:  'rgba(255,80,140,.12)', dangerBorder:  'rgba(255,80,140,.4)',
    info:    '#3B82F6', infoFg:    '#5C9CFA', infoBg:    'rgba(59,130,246,.12)', infoBorder:    'rgba(59,130,246,.4)',
    push: '#5C9CFA', pull: '#7DD17D', legs: '#FF7AA8', core: '#F5C275',
    fontBody:    "'Permanent Marker', cursive",
    fontDisplay: "'Permanent Marker', cursive",
    fontData:    "'Bungee', sans-serif",
    fontNumber:  "'Bungee', sans-serif",
    radiusSm: 0, radiusMd: 1, radiusLg: 2,
    shadowSm: '2px 2px 0 rgba(0,0,0,.3)',
    shadowMd: '0 6px 18px rgba(0,0,0,.4)',
    stampFg: '#1C1C1E', stampBg: '#F5DC3C', stampBorder: '#F5DC3C',
    chrome: 'graffiti',
  },
};

// Returns a flat object of resolved theme values. Stable identity per theme id.
function useFitTrackTheme(themeId) {
  return React.useMemo(() => withDerived(FT_THEMES_DATA[themeId] || FT_THEMES_DATA.lab), [themeId]);
}

// Non-hook lookup, for callers outside React render scope.
function getFitTrackTheme(themeId) {
  return withDerived(FT_THEMES_DATA[themeId] || FT_THEMES_DATA.lab);
}

// Derive on-bg foreground tokens for themes where the page bg is light but
// `text` is white (e.g. blueprint — cards are dark navy, page is light blue).
// Without this, any chrome rendered directly on the page bg is invisible.
const _derivedCache = new WeakMap();
function _luma(hex) {
  if (typeof hex !== 'string') return 0.5;
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function withDerived(t) {
  const hit = _derivedCache.get(t);
  if (hit) return hit;
  // Flip only when the page bg is light but `text` is also light (→ invisible).
  const bgLight   = _luma(t.bg)   > 0.5;
  const textLight = _luma(t.text) > 0.5;
  const flip = bgLight && textLight;
  const out = {
    ...t,
    textOnBg:    flip ? (t.surface || t.text)        : t.text,
    textOnBgSec: flip ? (t.surfaceAlt || t.textSec)  : t.textSec,
    textOnBgTer: flip ? (t.borderStrong || t.textTer): t.textTer,
  };
  _derivedCache.set(t, out);
  return out;
}

Object.assign(window, { FT_THEMES_DATA, useFitTrackTheme, getFitTrackTheme });
