import { ThemeConfig } from './types';

export const cyberpunk: ThemeConfig = {
  id: 'cyberpunk',
  name: 'Dark Future',

  colors: {
    // Deep void bg with lifted cyan-tinted surfaces for clear container separation
    bg: '#05060C',
    bgCard: '#1C2232',
    bgElevated: '#2A3244',

    textPrimary: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.68)',
    textTertiary: 'rgba(255,255,255,0.54)',

    accent: '#00F0FF',           // cyan — the signature color
    accentSecondary: '#FF3068',  // alert red/pink

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#00F0FF',
    error: '#FF3068',
    warning: '#EAB308',

    border: '#3A4660',
    borderSubtle: '#2A3244',
  },

  fonts: {
    display: "'Space Mono', 'Courier New', monospace",
    data: "'Space Mono', 'Courier New', monospace",
    body: "'Barlow Condensed', sans-serif",
  },

  borders: {
    card: '1px solid rgba(0,240,255,0.12)',
    divider: '1px solid rgba(0,240,255,0.07)',
    radius: '0',
  },

  texture: {
    type: 'css',
    // Neon scanlines + cyan vignette glow + faint calibration grid
    value: `
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 2px,
          rgba(0,240,255,0.025) 2px,
          rgba(0,240,255,0.025) 3px
        ),
        radial-gradient(
          ellipse 80% 60% at 50% 50%,
          rgba(0,240,255,0.08) 0%,
          transparent 70%
        ),
        radial-gradient(
          circle,
          rgba(0,240,255,0.04) 1px,
          transparent 1px
        );
      background-size: auto, auto, 24px 24px;
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '3px',
    },
    nav: {
      activeIndicator: 'glow-dot',
      activeStyle: {
        dotSize: '3px',
        glowRadius: '4px',
        color: '#00F0FF',
      },
    },
    button: {
      style: 'ghost',
    },
    restTimer: {
      style: 'bar',
      glowEffect: true,
    },
  },
};
