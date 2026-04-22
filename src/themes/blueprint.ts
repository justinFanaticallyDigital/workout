import { ThemeConfig } from './types';

export const blueprint: ThemeConfig = {
  id: 'blueprint',
  name: 'Blueprint',

  colors: {
    // Blueprint blue — deeper shell with lifted card/elevated planes for visible separation
    bg: '#142038',
    bgCard: '#2D3C5C',
    bgElevated: '#384A70',

    // Text: white/light blue on dark blue (AA-tuned)
    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(210,225,250,0.82)',
    textTertiary: 'rgba(200,220,250,0.78)',

    accent: '#4A9EFF',          // bright blueprint blue for annotations
    accentSecondary: '#FF6B4A', // red for dimension callouts / alerts

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#22C55E',
    error: '#FF6B4A',
    warning: '#EAB308',

    border: '#4A5C82',
    borderSubtle: '#384A70',
  },

  fonts: {
    display: "'IBM Plex Mono', monospace",
    data: "'IBM Plex Mono', monospace",
    body: "'IBM Plex Mono', monospace",  // all mono — technical drawing feel
  },

  borders: {
    card: '1px solid rgba(255,255,255,0.12)',
    divider: '1px solid rgba(255,255,255,0.08)',
    radius: '0',
  },

  texture: {
    type: 'css',
    // Blueprint grid — fine lines every 20px, bold lines every 100px
    value: `
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
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
        borderColor: '#4A9EFF',
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
