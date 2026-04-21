import { ThemeConfig } from './types';

export const iron: ThemeConfig = {
  id: 'iron',
  name: 'Iron & Chalk',

  colors: {
    // Dark gym wall — warm dark gray, not cool/blue
    bg: '#1C1B19',
    bgCard: '#252422',
    bgElevated: '#2E2C29',

    // Text: chalk white + warm grays (AA-tuned)
    textPrimary: 'rgba(255,252,245,0.92)',   // warm chalk white
    textSecondary: 'rgba(255,252,245,0.70)',
    textTertiary: 'rgba(255,252,245,0.58)',

    accent: '#C8A96E',          // brushed brass/gold — iron gym hardware
    accentSecondary: '#8B4513', // rust brown

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#22C55E',
    error: '#EF4444',
    warning: '#C8A96E',

    border: '#33322F',           // rgba(255,252,245,0.1) composited on bg
    borderSubtle: '#272624',     // rgba(255,252,245,0.05) composited on bg
  },

  fonts: {
    display: "'Anton', sans-serif",          // bold, condensed — iron plate stencil
    data: "'Barlow Condensed', sans-serif",  // clean data — chalked up numbers
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px solid rgba(255,252,245,0.08)',
    divider: '1px solid rgba(255,252,245,0.06)',
    radius: '0',
  },

  texture: {
    type: 'svg-inline',
    // Chalk dust / matte rubber floor texture — fine grain noise
    value: '<svg style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0"><defs><filter id="chalk-dust"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.06"/></feComponentTransfer></filter></defs><rect width="100%" height="100%" filter="url(#chalk-dust)" fill="white"/></svg>',
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px',
    },
    nav: {
      activeIndicator: 'border-bottom',
      activeStyle: {
        borderColor: '#C8A96E',
        borderWidth: '2px',
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
