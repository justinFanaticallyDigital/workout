import { ThemeConfig } from './types';

/**
 * Blueprint — values pulled from theme-bridge.jsx.
 *
 * MAJOR LAYOUT FLIP: prior live treated blueprint as dark-paper-with-
 * darker-cards (bg #3868A3, cards darker). theme-bridge.jsx treats
 * blueprint as light-paper-with-dark-navy-cards (bg #DEE9F4, cards
 * #132C52). This is the cyanotype paper effect the prototype's name
 * implies. Accent moves from blueprint-marker-blue → white.
 *
 * `textOnBg` is intentionally DIFFERENT from `text` here: the page bg
 * is light, so anything rendered directly on it (between cards, in
 * page-level chrome) needs dark navy text, not white.
 */
export const blueprint: ThemeConfig = {
  id: 'blueprint',
  name: 'Blueprint',
  chrome: 'blueprint',
  isDark: false,

  colors: {
    bg: '#DEE9F4',
    bgAlt: '#CDD9E6',
    bgCard: '#132C52',
    surface: '#132C52',
    surfaceAlt: '#1E3C6E',
    bgElevated: '#1E3C6E',
    surfaceRaised: '#1E3C6E',

    // text/textSec/textTer are the foregrounds INSIDE cards (white on navy)
    textPrimary: '#FAFDFF',
    text: '#FAFDFF',
    textSecondary: '#D2E1F0',
    textSec: '#D2E1F0',
    textTertiary: '#90B0CC',
    textTer: '#90B0CC',
    textOnAccent: '#132C52',
    // textOnBg/Sec/Ter are the foregrounds rendered DIRECTLY on the light page bg
    textOnBg: '#132C52',
    textOnBgSec: '#1E3C6E',
    textOnBgTer: '#3F5F8A',

    border: '#132C52',
    borderFaint: 'rgba(19,44,82,0.35)',
    borderSubtle: 'rgba(19,44,82,0.35)',
    borderStrong: '#132C52',

    accent: '#FAFDFF',
    accentSecondary: '#FF6B4A',
    accentFg: '#FAFDFF',
    accentFaint: 'rgba(255,255,255,0.10)',
    accentBorder: 'rgba(255,255,255,0.45)',

    push: '#90C8FF',
    pull: '#A0E5B0',
    legs: '#FFA89C',
    core: '#F5DA7A',

    success: '#74D894',
    successFg: '#A0E5B0',
    successBg: 'rgba(116,216,148,0.12)',
    successBorder: 'rgba(116,216,148,0.4)',

    error: '#FF8B7E',
    danger: '#FF8B7E',
    dangerFg: '#FFA89C',
    dangerBg: 'rgba(255,139,126,0.12)',
    dangerBorder: 'rgba(255,139,126,0.45)',

    warning: '#F0CD5A',
    warn: '#F0CD5A',
    warnFg: '#F5DA7A',
    warnBg: 'rgba(240,205,90,0.12)',
    warnBorder: 'rgba(240,205,90,0.4)',

    info: '#90C8FF',
    infoFg: '#90C8FF',
    infoBg: 'rgba(144,200,255,0.12)',
    infoBorder: 'rgba(144,200,255,0.4)',
  },

  fonts: {
    display: "'Major Mono Display', monospace",
    fontDisplay: "'Major Mono Display', monospace",
    data: "'Space Mono', monospace",
    fontData: "'Space Mono', monospace",
    body: "'Space Mono', monospace",
    fontBody: "'Space Mono', monospace",
    fontNumber: "'Space Mono', monospace",
  },

  borders: {
    card: '1px solid rgba(255,255,255,0.25)',
    divider: '1px solid rgba(255,255,255,0.15)',
    radius: '0',
  },

  radius: {
    sm: '0',
    md: '0',
    lg: '2px',
  },

  shadows: {
    sm: '0 1px 0 rgba(19,44,82,0.3)',
    md: '0 4px 16px rgba(19,44,82,0.18)',
  },

  stamp: {
    fg: '#FAFDFF',
    bg: 'transparent',
    border: 'rgba(255,255,255,0.5)',
  },

  texture: {
    type: 'css',
    value: `
      background-image:
        linear-gradient(rgba(19,44,82,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(19,44,82,0.06) 1px, transparent 1px),
        linear-gradient(rgba(19,44,82,0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(19,44,82,0.12) 1px, transparent 1px);
      background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '2px',
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        borderColor: '#FFFFFF',
        borderWidth: '1px',
      },
    },
    button: {
      style: 'outline',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false,
    },
  },
};
