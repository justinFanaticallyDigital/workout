#!/usr/bin/env node
/**
 * Contrast audit for all 8 themes.
 *
 * Parses color values out of src/themes/*.ts (bg, bgCard, bgElevated,
 * textPrimary, textSecondary, textTertiary) and reports:
 *   - Text × surface contrast ratios (WCAG AA floor = 4.5:1)
 *   - Surface deltas bg→card, card→elev, bg→elev (target ≥1.25:1)
 *
 * Run:  node scripts/audit-theme-contrast.js
 * Exits non-zero if any text×surface combo drops below 4.5:1.
 *
 * Use before committing any change to a theme's colors so we never ship
 * a theme that silently breaks WCAG AA or loses container lift.
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
  if (c.startsWith('#')) return { rgb: hexToRgb(c), alpha: 1 };
  const m = c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
  if (!m) throw new Error(`Cannot parse color: ${c}`);
  return { rgb: [+m[1], +m[2], +m[3]], alpha: m[4] !== undefined ? +m[4] : 1 };
}
function composite(fg, alpha, bg) {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}
function textContrast(textColor, surfaceColor) {
  const fg = parseColor(textColor);
  const bg = parseColor(surfaceColor);
  const composited = composite(fg.rgb, fg.alpha, bg.rgb);
  return contrast(composited, bg.rgb);
}
function surfaceContrast(a, b) {
  return contrast(parseColor(a).rgb, parseColor(b).rgb);
}

// Pulls a single-quoted or double-quoted color value for a named key from a theme file.
function extractColor(source, key) {
  const re = new RegExp(`${key}\\s*:\\s*['"]([^'"]+)['"]`);
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
    textPrimary: extractColor(source, 'textPrimary'),
    textSecondary: extractColor(source, 'textSecondary'),
    textTertiary: extractColor(source, 'textTertiary'),
  };
}

let anyTextFail = false;
let anySurfaceWarn = false;

console.log('\n=== Surface deltas (target ≥ 1.25:1 between bg and bgCard) ===');
for (const name of THEME_FILES) {
  const file = path.join(THEMES_DIR, `${name}.ts`);
  if (!fs.existsSync(file)) {
    console.log(`  ${name.padEnd(12)} (missing — skipped)`);
    continue;
  }
  const t = loadTheme(name);
  const bgCard = surfaceContrast(t.bgCard, t.bg);
  const cardElev = surfaceContrast(t.bgElevated, t.bgCard);
  const bgElev = surfaceContrast(t.bgElevated, t.bg);
  const warn = bgCard < SURFACE_FLOOR ? ' ⚠ low lift' : '';
  if (bgCard < SURFACE_FLOOR) anySurfaceWarn = true;
  console.log(
    `  ${name.padEnd(12)} bg→card: ${bgCard.toFixed(2)}:1  card→elev: ${cardElev.toFixed(2)}:1  bg→elev: ${bgElev.toFixed(2)}:1${warn}`
  );
}

console.log('\n=== Text on surfaces (WCAG AA floor = 4.5:1) ===');
for (const name of THEME_FILES) {
  const file = path.join(THEMES_DIR, `${name}.ts`);
  if (!fs.existsSync(file)) continue;
  const t = loadTheme(name);
  const tiers = { primary: t.textPrimary, secondary: t.textSecondary, tertiary: t.textTertiary };
  const surfaces = { bg: t.bg, bgCard: t.bgCard, bgElevated: t.bgElevated };
  const fails = [];
  let min = Infinity;
  for (const [tier, color] of Object.entries(tiers)) {
    for (const [sname, sval] of Object.entries(surfaces)) {
      const r = textContrast(color, sval);
      min = Math.min(min, r);
      if (r < TEXT_FLOOR) fails.push({ tier, surf: sname, r });
    }
  }
  if (fails.length) {
    anyTextFail = true;
    console.log(`  ${name.padEnd(12)} ✗ ${fails.length} failing pair(s) (min ${min.toFixed(2)}:1)`);
    for (const f of fails) console.log(`      ${f.tier} on ${f.surf}: ${f.r.toFixed(2)}:1`);
  } else {
    console.log(`  ${name.padEnd(12)} ✓ all pass (min ${min.toFixed(2)}:1)`);
  }
}

if (anyTextFail) {
  console.error('\n✗ FAIL: One or more themes have text × surface pairs under 4.5:1.');
  process.exit(1);
}
if (anySurfaceWarn) {
  console.warn('\n⚠ WARN: One or more themes have bg→card contrast under 1.25:1. Cards may not stand off the bg.');
}
console.log('\n✓ All themes pass WCAG AA text contrast.\n');
