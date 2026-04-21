import { ThemeConfig } from './types';

export const arcade: ThemeConfig = {
  id: 'arcade',
  name: 'Retro Arcade',

  colors: {
    bg: '#0A0A14',
    bgCard: '#11111B',           // rgba(255,255,255,0.03) composited on bg
    bgElevated: '#161620',       // rgba(255,255,255,0.05) composited on bg

    // CRT phosphor white — slightly cool/blue-shifted (AA-tuned)
    textPrimary: '#E0E0F0',
    textSecondary: 'rgba(224,224,240,0.65)',
    textTertiary: 'rgba(224,224,240,0.55)',

    accent: '#FF50C8',          // hot pink / magenta — attract-mode neon
    accentSecondary: '#FFD700',  // gold — for scores, XP, achievements

    push: '#3B82F6',
    pull: '#22C55E',
    legs: '#EF4444',
    core: '#EAB308',

    success: '#22C55E',
    error: '#EF4444',
    warning: '#FFD700',

    border: '#1E1E27',           // rgba(255,255,255,0.08) composited on bg
    borderSubtle: '#14141D',     // rgba(255,255,255,0.04) composited on bg
  },

  fonts: {
    display: "'Press Start 2P', monospace",
    data: "'Courier New', monospace",      // dense data tables use mono for readability
    body: "'Barlow Condensed', sans-serif", // readable body text (Press Start 2P too small for labels)
  },

  borders: {
    card: '2px solid rgba(255,255,255,0.08)',   // pixel-style — always 2px
    divider: '2px solid rgba(255,255,255,0.06)',
    radius: '0',  // zero radius — pixels are square
  },

  texture: {
    type: 'css',
    // CRT scanlines — slightly more visible than cyberpunk
    value: `
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(255,255,255,0.018) 3px,
          rgba(255,255,255,0.018) 4px
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
