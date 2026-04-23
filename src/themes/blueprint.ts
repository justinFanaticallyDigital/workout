import { ThemeConfig } from './types';

export const blueprint: ThemeConfig = {
  id: 'blueprint',
  name: 'Blueprint',

  colors: {
    // Blueprint paper — authentic cyanotype blue. Cards are darker "ink bleed" planes
    // so drawings/content stand off the paper like real technical blueprints.
    bg: '#3868A3',              // blueprint paper
    bgCard: '#2A5088',          // darker ink-wash area
    bgElevated: '#1C3E6E',      // deepest trace / title block

    // Text: near-white ink on blue paper (AA-tuned for lighter bg)
    textPrimary: 'rgba(255,255,255,0.96)',
    textSecondary: 'rgba(240,248,255,0.95)',
    textTertiary: 'rgba(230,245,255,0.92)',

    accent: '#4A9EFF',          // bright blueprint marker blue for active states
    accentSecondary: '#FF6B4A', // dimension-callout red

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#22C55E',
    error: '#FF6B4A',
    warning: '#EAB308',

    border: '#B8D0EC',          // pencil-on-paper blue-white border
    borderSubtle: '#5884B8',
  },

  fonts: {
    display: "'Major Mono Display', 'IBM Plex Mono', monospace",  // wide technical stencil
    data: "'IBM Plex Mono', monospace",                           // drafted numerics
    body: "'IBM Plex Mono', monospace",                           // everything on-grid
  },

  borders: {
    card: '1px solid rgba(255,255,255,0.25)',
    divider: '1px solid rgba(255,255,255,0.15)',
    radius: '0',
  },

  texture: {
    type: 'css',
    // Blueprint grid — visible white lines on the lighter paper bg
    value: `
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px);
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
