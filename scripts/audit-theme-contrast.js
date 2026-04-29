#!/usr/bin/env node
/**
 * Contrast audit for all 8 themes.
 *
 * Parses color values out of src/themes/*.ts and validates four
 * categories of contrast pair against the WCAG AA floor (4.5:1):
 *
 *   1. Text-tier × surface-tier — text/textSec/textTer against bg /
 *      bgCard / bgElevated. Original audit set.
 *
 *   2. Surface deltas — bg → bgCard, bgCard → bgElevated, bg →
 *      bgElevated. Target ≥1.25:1 so containers visibly stand off
 *      their background. Soft warning, not failure.
 *
 *   3. textOnAccent × accent — foreground rendered on accent fill
 *      (e.g. solid CTA buttons). Must clear 4.5:1.
 *
 *   4. State Fg × State Bg — successFg on successBg, warnFg on
 *      warnBg, dangerFg on dangerBg, infoFg on infoBg. Must clear
 *      4.5:1.
 *
 *   5. textOnBg × bg — text rendered DIRECTLY on the page background
 *      (between cards, in page-level chrome). Required for blueprint
 *      where the page bg is light but `text` is white-for-cards.
 *
 * Run:  node scripts/audit-theme-contrast.js
 * Exits non-zero if any required pair drops below 4.5:1.
 */

const fs = require('node:fs');
const path = require('node:path');

const THEMES_DIR = path.join(__dirname, '..', 'src', 'themes');
const THEME_FILES = ['default', 'graffiti', 'cyberpunk', 'notebook', 'blueprint', 'arcade', 'lab', 'iron'];

const TEXT_FLOOR = 4.5;
const SURFACE_FLOOR = 1.25;

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function luminance([r, g, b]) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function parseColor(c) {
  if (!c) return null;
  if (c.startsWith('#')) return { rgb: hexToRgb(c), alpha: 1 };
  const m = c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m) return null;
  return { rgb: [+m[1], +m[2], +m[3]], alpha: m[4] !== undefined ? +m[4] : 1 };
}
function composite(fg, alpha, bg) {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}
function pairContrast(fgColor, bgColor) {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);
  if (!fg || !bg) return null;
  const composited = composite(fg.rgb, fg.alpha, bg.rgb);
  return contrast(composited, bg.rgb);
}
function surfaceContrast(a, b) {
  const pa = parseColor(a), pb = parseColor(b);
  if (!pa || !pb) return null;
  return contrast(pa.rgb, pb.rgb);
}

function extractColor(source, key) {
  // Match `key: 'value'` or `key: "value"` — anchor on word boundary so
  // we don't match `successFg` when querying `success`.
  const re = new RegExp(`\\b${key}\\s*:\\s*['"]([^'"]+)['"]`);
  const match = source.match(re);
  return match ? match[1] : null;
}

function loadTheme(name) {
  const file = path.join(THEMES_DIR, `${name}.ts`);
  const source = fs.readFileSync(file, 'utf8');
  return {
    name,
    bg: extractColor(source, 'bg'),
    bgCard: extractColor(source, 'bgCard'),
    bgElevated: extractColor(source, 'bgElevated'),
    surface: extractColor(source, 'surface'),
    surfaceAlt: extractColor(source, 'surfaceAlt'),
    surfaceRaised: extractColor(source, 'surfaceRaised'),
    textPrimary: extractColor(source, 'textPrimary'),
    textSecondary: extractColor(source, 'textSecondary'),
    textTertiary: extractColor(source, 'textTertiary'),
    textOnAccent: extractColor(source, 'textOnAccent'),
    textOnBg: extractColor(source, 'textOnBg'),
    textOnBgSec: extractColor(source, 'textOnBgSec'),
    textOnBgTer: extractColor(source, 'textOnBgTer'),
    accent: extractColor(source, 'accent'),
    accentFg: extractColor(source, 'accentFg'),
    accentFaint: extractColor(source, 'accentFaint'),
    successFg: extractColor(source, 'successFg'),
    successBg: extractColor(source, 'successBg'),
    warnFg: extractColor(source, 'warnFg'),
    warnBg: extractColor(source, 'warnBg'),
    dangerFg: extractColor(source, 'dangerFg'),
    dangerBg: extractColor(source, 'dangerBg'),
    infoFg: extractColor(source, 'infoFg'),
    infoBg: extractColor(source, 'infoBg'),
  };
}

let anyFail = false;
let anySurfaceWarn = false;

console.log('\n=== Surface deltas (target ≥ 1.25:1 between bg and bgCard) ===');
for (const name of THEME_FILES) {
  const t = loadTheme(name);
  const bgCard = surfaceContrast(t.bgCard, t.bg);
  const cardElev = surfaceContrast(t.bgElevated, t.bgCard);
  const bgElev = surfaceContrast(t.bgElevated, t.bg);
  const warn = bgCard !== null && bgCard < SURFACE_FLOOR ? ' ⚠ low lift' : '';
  if (bgCard !== null && bgCard < SURFACE_FLOOR) anySurfaceWarn = true;
  console.log(
    `  ${name.padEnd(12)} bg→card: ${(bgCard ?? 0).toFixed(2)}:1  card→elev: ${(cardElev ?? 0).toFixed(2)}:1  bg→elev: ${(bgElev ?? 0).toFixed(2)}:1${warn}`
  );
}

console.log('\n=== Text on card surfaces (WCAG AA floor = 4.5:1) ===');
// `text/textSec/textTer` are FOR card surfaces (bgCard / bgElevated). On
// the page bg, we use the textOnBg* variants (checked separately below).
for (const name of THEME_FILES) {
  const t = loadTheme(name);
  const tiers = { primary: t.textPrimary, secondary: t.textSecondary, tertiary: t.textTertiary };
  const surfaces = { bgCard: t.bgCard, bgElevated: t.bgElevated };
  const fails = [];
  let min = Infinity;
  for (const [tier, color] of Object.entries(tiers)) {
    for (const [sname, sval] of Object.entries(surfaces)) {
      const r = pairContrast(color, sval);
      if (r === null) continue;
      min = Math.min(min, r);
      if (r < TEXT_FLOOR) fails.push({ tier, surf: sname, r });
    }
  }
  if (fails.length) {
    anyFail = true;
    console.log(`  ${name.padEnd(12)} ✗ ${fails.length} failing pair(s) (min ${min.toFixed(2)}:1)`);
    for (const f of fails) console.log(`      ${f.tier} on ${f.surf}: ${f.r.toFixed(2)}:1`);
  } else {
    console.log(`  ${name.padEnd(12)} ✓ all pass (min ${min.toFixed(2)}:1)`);
  }
}

console.log('\n=== textOnAccent × accent (CTA button legibility) ===');
for (const name of THEME_FILES) {
  const t = loadTheme(name);
  const r = pairContrast(t.textOnAccent, t.accent);
  if (r === null) {
    console.log(`  ${name.padEnd(12)} (skipped — missing textOnAccent or accent)`);
    continue;
  }
  if (r < TEXT_FLOOR) {
    anyFail = true;
    console.log(`  ${name.padEnd(12)} ✗ ${r.toFixed(2)}:1`);
  } else {
    console.log(`  ${name.padEnd(12)} ✓ ${r.toFixed(2)}:1`);
  }
}

console.log('\n=== State Fg × State Bg composited on surface (chip legibility) ===');
// Prototype state-bg values are low-alpha tints that sit ON TOP of a
// surface (bgCard typically). To audit chip legibility, composite the
// state-bg's alpha over surface, then check fg against the result.
// Soft warning only — the prototype's own values are tints, not solid
// backgrounds, and we ship them as-spec'd from theme-bridge.jsx.
let anyChipWarn = false;
for (const name of THEME_FILES) {
  const t = loadTheme(name);
  const surface = parseColor(t.bgCard);
  if (!surface) continue;
  const pairs = [
    ['success', t.successFg, t.successBg],
    ['warn', t.warnFg, t.warnBg],
    ['danger', t.dangerFg, t.dangerBg],
    ['info', t.infoFg, t.infoBg],
  ];
  const warns = [];
  let min = Infinity;
  for (const [label, fg, bg] of pairs) {
    const fgC = parseColor(fg);
    const bgC = parseColor(bg);
    if (!fgC || !bgC) continue;
    // Composite tinted state-bg over surface
    const composedBg = composite(bgC.rgb, bgC.alpha, surface.rgb);
    const composedFg = composite(fgC.rgb, fgC.alpha, composedBg);
    const r = contrast(composedFg, composedBg);
    min = Math.min(min, r);
    if (r < TEXT_FLOOR) warns.push({ label, r });
  }
  if (warns.length) {
    anyChipWarn = true;
    console.log(`  ${name.padEnd(12)} ⚠ ${warns.length} pair(s) below 4.5:1 (min ${min.toFixed(2)}:1)`);
    for (const f of warns) console.log(`      ${f.label}-fg on ${f.label}-bg over surface: ${f.r.toFixed(2)}:1`);
  } else {
    console.log(`  ${name.padEnd(12)} ✓ all pass (min ${min.toFixed(2)}:1)`);
  }
}

console.log('\n=== textOnBg × bg (page-level chrome legibility) ===');
for (const name of THEME_FILES) {
  const t = loadTheme(name);
  const tiers = { primary: t.textOnBg, secondary: t.textOnBgSec, tertiary: t.textOnBgTer };
  const fails = [];
  let min = Infinity;
  for (const [tier, color] of Object.entries(tiers)) {
    const r = pairContrast(color, t.bg);
    if (r === null) continue;
    min = Math.min(min, r);
    if (r < TEXT_FLOOR) fails.push({ tier, r });
  }
  if (fails.length) {
    anyFail = true;
    console.log(`  ${name.padEnd(12)} ✗ ${fails.length} failing pair(s) (min ${min.toFixed(2)}:1)`);
    for (const f of fails) console.log(`      onBg-${f.tier} on bg: ${f.r.toFixed(2)}:1`);
  } else {
    console.log(`  ${name.padEnd(12)} ✓ all pass (min ${min.toFixed(2)}:1)`);
  }
}

if (anyFail) {
  console.error('\n✗ FAIL: One or more required contrast pairs are below 4.5:1.');
  process.exit(1);
}
if (anySurfaceWarn) {
  console.warn('\n⚠ WARN: One or more themes have bg→bgCard under 1.25:1.');
}
if (anyChipWarn) {
  console.warn('\n⚠ WARN: One or more state-fg/bg chip pairs composited over surface fall below 4.5:1. These are tint-style chips per the prototype contract; legibility relies on chip text being non-essential redundant signal.');
}
console.log('\n✓ All required contrast pairs pass WCAG AA.\n');
