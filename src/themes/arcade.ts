import { ThemeConfig } from './types';

export const arcade: ThemeConfig = {
  id: 'arcade',
  name: 'Retro Arcade',

  colors: {
    // Deep arcade cabinet bg with lifted phosphor-tinted surfaces
    bg: '#07070F',
    bgCard: '#22223A',
    bgElevated: '#2E2E4A',

    // CRT phosphor white — slightly cool/blue-shifted (AA-tuned)
    textPrimary: '#E0E0F0',
    textSecondary: 'rgba(224,224,240,0.70)',
    textTertiary: 'rgba(224,224,240,0.60)',

    accent: '#FF50C8',          // hot pink / magenta — attract-mode neon
    accentSecondary: '#FFD700',  // gold — for scores, XP, achievements

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#22C55E',
    error: '#EF4444',
    warning: '#FFD700',

    border: '#3C3C5C',
    borderSubtle: '#2E2E4A',
  },

  fonts: {
    display: "'Press Start 2P', monospace",          // big 8-bit titles
    data: "'VT323', 'Courier New', monospace",       // 8-bit terminal digits, readable at any size
    body: "'Pixelify Sans', 'Silkscreen', sans-serif", // pixel body type — arcade through and through
  },

  borders: {
    card: '2px solid rgba(255,255,255,0.08)',   // pixel-style — always 2px
    divider: '2px solid rgba(255,255,255,0.06)',
    radius: '0',  // zero radius — pixels are square
  },

  texture: {
    type: 'css',
    // CRT scanlines (stronger) + subtle pink aperture-grille column tint
    value: `
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 2px,
          rgba(255,255,255,0.035) 2px,
          rgba(255,255,255,0.035) 3px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,80,200,0.025) 0,
          rgba(255,80,200,0.025) 1px,
          transparent 1px,
          transparent 3px
        );
    `,
  },

  components: {
    exerciseCard: {
      movementIndicator: 'left-bar',
      movementIndicatorWidth: '4px', // chunkier — pixel style
    },
    nav: {
      activeIndicator: 'underline',
      activeStyle: {
        borderColor: '#FF50C8',
        borderWidth: '2px',
      },
    },
    button: {
      style: 'pixel-border',
    },
    restTimer: {
      style: 'bar',
      glowEffect: false, // no glow — CRTs don't glow smooth
    },
  },
};
