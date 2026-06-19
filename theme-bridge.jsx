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

  // ATOMPUNK — Populuxe / Jet-Age retrofuture. Warm light register (the only
  // teal-led theme), mint-cream surfaces, atomic-coral + harvest-gold accents,
  // geometric space-age type (Audiowide display, Jost body, Oxanium data).
  // Deliberately distinct from Notebook (handdrawn aged cream) and Lab (cool
  // clinical white): crisp, rounded, optimistic 1958 dashboard.
  atompunk: {
    isDark: false,
    bg: '#DCE6E0', bgAlt: '#CCD9D2',
    surface: '#FCFBF5', surfaceAlt: '#F0EFE6', surfaceRaised: '#FFFFFF',
    text: '#1F2A28', textSec: '#46544F', textTer: '#7A8782', textOnAccent: '#FCFBF5',
    border: '#C9D2CC', borderFaint: '#DBE2DC', borderStrong: '#0E8C7C',
    accent: '#0E8C7C', accentFg: '#0E8C7C', accentFaint: 'rgba(14,140,124,.12)', accentBorder: 'rgba(14,140,124,.40)',
    success: '#3F8F5C', successFg: '#2F7A4A', successBg: '#E1EEE4', successBorder: '#ADD1B7',
    warn:    '#C9892A', warnFg:    '#B0741C', warnBg:    '#F7EBD6', warnBorder:    '#E0C58E',
    danger:  '#D6492E', dangerFg:  '#BE3A22', dangerBg:  '#FAE6E0', dangerBorder:  '#E6A998',
    info:    '#0E8C7C', infoFg:    '#0E8C7C', infoBg:    '#DBEEEA', infoBorder:    '#9ECEC5',
    push: '#2A9D8F', pull: '#5BA572', legs: '#D6492E', core: '#C9892A',
    fontBody:    "'Jost', sans-serif",
    fontDisplay: "'Audiowide', sans-serif",
    fontData:    "'Oxanium', sans-serif",
    fontNumber:  "'Oxanium', sans-serif",
    radiusSm: 4, radiusMd: 10, radiusLg: 18,
    shadowSm: '0 1px 2px rgba(31,42,40,.08)',
    shadowMd: '0 6px 20px rgba(31,42,40,.14)',
    stampFg: '#0E8C7C', stampBg: 'transparent', stampBorder: 'rgba(14,140,124,.55)',
    chrome: 'atompunk',
  },

  // STEAMPUNK — Victorian-industrial retrofuture. Warm walnut/leather ground,
  // saturated COPPER lead (warmer/oranger than Iron's flat brass), with
  // verdigris-teal + oxblood as a richer counter-palette. Engraved-serif type
  // (Cinzel nameplate · EB Garamond manual · Cutive Mono gauge ticket) and
  // riveted brass-plate cards — deliberately more ornate than austere Iron.
  steampunk: {
    isDark: true,
    bg: '#231711', bgAlt: '#2C1E14',
    surface: '#34251A', surfaceAlt: '#2A1D13', surfaceRaised: '#3F2D20',
    text: '#F0E2C8', textSec: '#CBB591', textTer: '#9C8568', textOnAccent: '#231711',
    border: 'rgba(200,122,65,.32)', borderFaint: 'rgba(200,122,65,.14)', borderStrong: 'rgba(200,122,65,.6)',
    accent: '#C87A41', accentFg: '#D9914F', accentFaint: 'rgba(200,122,65,.15)', accentBorder: 'rgba(200,122,65,.45)',
    success: '#5E9E6A', successFg: '#79B884', successBg: 'rgba(94,158,106,.12)', successBorder: 'rgba(94,158,106,.38)',
    warn:    '#D9A95C', warnFg:    '#E4BC75', warnBg:    'rgba(217,169,92,.12)',  warnBorder:    'rgba(217,169,92,.4)',
    danger:  '#B5462F', dangerFg:  '#D56C52', dangerBg:  'rgba(181,70,47,.14)',   dangerBorder:  'rgba(181,70,47,.42)',
    info:    '#4E9E8C', infoFg:    '#69B3A2', infoBg:    'rgba(78,158,140,.12)',  infoBorder:    'rgba(78,158,140,.4)',
    push: '#4E9E8C', pull: '#7BA46A', legs: '#C0573F', core: '#D9A95C',
    fontBody:    "'EB Garamond', serif",
    fontDisplay: "'Cinzel', serif",
    fontData:    "'Cutive Mono', monospace",
    fontNumber:  "'Cutive Mono', monospace",
    radiusSm: 2, radiusMd: 5, radiusLg: 8,
    shadowSm: '0 1px 0 rgba(0,0,0,.5)',
    shadowMd: '0 6px 20px rgba(0,0,0,.55)',
    stampFg: '#C87A41', stampBg: 'transparent', stampBorder: 'rgba(200,122,65,.6)',
    chrome: 'steampunk',
  },

  // ART DECO — 1920s Jazz-Age glamour. Cool ink-black ground (distinct from the
  // warm-dark themes), luxe GOLD hero, jade + peacock jewel accents, champagne
  // text. Sharp geometric radii, wide-tracked geometric-deco type (Poiret One ·
  // Josefin Sans · DM Mono), gold sunburst field + inline-frame/fan-tab cards.
  artdeco: {
    isDark: true,
    bg: '#111317', bgAlt: '#171A1F',
    surface: '#1B1F26', surfaceAlt: '#15181D', surfaceRaised: '#222732',
    text: '#F3EAD3', textSec: '#C8C2B2', textTer: '#8B8676', textOnAccent: '#111317',
    border: 'rgba(201,162,74,.32)', borderFaint: 'rgba(201,162,74,.14)', borderStrong: 'rgba(201,162,74,.6)',
    accent: '#C9A24A', accentFg: '#D8B45A', accentFaint: 'rgba(201,162,74,.14)', accentBorder: 'rgba(201,162,74,.5)',
    success: '#3DA589', successFg: '#5FC0A4', successBg: 'rgba(61,165,137,.12)', successBorder: 'rgba(61,165,137,.4)',
    warn:    '#D8B45A', warnFg:    '#E6C674', warnBg:    'rgba(216,180,90,.12)',  warnBorder:    'rgba(216,180,90,.4)',
    danger:  '#C75B4A', dangerFg:  '#DC7867', dangerBg:  'rgba(199,91,74,.14)',   dangerBorder:  'rgba(199,91,74,.42)',
    info:    '#2E8FA0', infoFg:    '#4FA9B9', infoBg:    'rgba(46,143,160,.12)',  infoBorder:    'rgba(46,143,160,.4)',
    push: '#2E8FA0', pull: '#3DA589', legs: '#C75B4A', core: '#D8B45A',
    fontBody:    "'Josefin Sans', sans-serif",
    fontDisplay: "'Poiret One', sans-serif",
    fontData:    "'DM Mono', monospace",
    fontNumber:  "'DM Mono', monospace",
    radiusSm: 0, radiusMd: 2, radiusLg: 3,
    shadowSm: '0 1px 0 rgba(0,0,0,.45)',
    shadowMd: '0 8px 28px rgba(0,0,0,.5)',
    stampFg: '#C9A24A', stampBg: 'transparent', stampBorder: 'rgba(201,162,74,.6)',
    chrome: 'artdeco',
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
// Make an rgba() string from a #rrggbb hex (used to derive faint/border fills).
function _rgba(hex, a) {
  const m = typeof hex === 'string' && hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
function withDerived(t) {
  const hit = _derivedCache.get(t);
  if (hit) return hit;
  // Flip only when the page bg is light but `text` is also light (→ invisible).
  const bgLight   = _luma(t.bg)   > 0.5;
  const textLight = _luma(t.text) > 0.5;
  const flip = bgLight && textLight;
  // On the flip case (Blueprint), accent is also light — designed for dark
  // cards — so anything accent-colored sitting on the LIGHT page bg goes
  // invisible. Provide on-bg accent tokens that fall back to a dark, visible
  // colour there. Everywhere else these are identical to the normal accent.
  const accentBg = flip ? (t.borderStrong || t.surface) : t.accent;
  const out = {
    ...t,
    textOnBg:    flip ? (t.surface || t.text)        : t.text,
    textOnBgSec: flip ? (t.surfaceAlt || t.textSec)  : t.textSec,
    textOnBgTer: flip ? (t.borderStrong || t.textTer): t.textTer,
    accentOnBg:       accentBg,
    accentFaintOnBg:  flip ? _rgba(accentBg, 0.12) : t.accentFaint,
    accentBorderOnBg: flip ? _rgba(accentBg, 0.40) : t.accentBorder,
    // Danger tokens for alerts that sit directly on the page bg. On the flip
    // case (Blueprint) the normal danger* values are LIGHT salmon — built for
    // dark cards — so they vanish on the light page. Fall back to a dark,
    // saturated red there; identical to the normal danger everywhere else.
    dangerOnBg:       flip ? '#B42318' : t.danger,
    dangerFgOnBg:     flip ? '#9A1C12' : t.dangerFg,
    dangerBgOnBg:     flip ? '#FBE7E4' : t.dangerBg,
    dangerBorderOnBg: flip ? '#E3A398' : t.dangerBorder,
  };
  _derivedCache.set(t, out);
  return out;
}

Object.assign(window, { FT_THEMES_DATA, useFitTrackTheme, getFitTrackTheme });
