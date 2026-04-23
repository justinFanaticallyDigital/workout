'use client';

import { useTheme } from '@/providers/ThemeProvider';

/**
 * Fixed-position decorative overlays activated per theme.
 * These hook into unused CSS classes pre-defined in globals.css plus a few
 * inline SVG/DOM elements that give each theme a unique ornamental layer
 * beyond just colors and fonts.
 */
export default function ThemedOverlays() {
  const { themeId } = useTheme();

  if (themeId === 'notebook') {
    return (
      <>
        {/* Spiral binding down the left edge */}
        <div className="notebook-binding" aria-hidden="true" />
        {/* Red vertical margin line */}
        <div className="notebook-margin-line" aria-hidden="true" />
        {/* Coffee-ring watermark */}
        <div className="notebook-coffee-stain" aria-hidden="true" />
      </>
    );
  }

  if (themeId === 'blueprint') {
    return (
      <>
        {/* Diagonal fold-line creases */}
        <div className="blueprint-fold-lines" aria-hidden="true" />
        {/* Title-block in the bottom-right corner — like a real technical drawing */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 96,
            zIndex: 2,
            pointerEvents: 'none',
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'rgba(28,62,110,0.45)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.78)',
            textTransform: 'uppercase',
            lineHeight: 1.6,
          }}
        >
          REV: A<br />
          SCALE 1:1<br />
          FIT-TRACK-001
        </div>
      </>
    );
  }

  if (themeId === 'arcade') {
    return (
      <>
        {/* CRT corner vignette */}
        <div className="arcade-vignette" aria-hidden="true" />
        {/* PLAYER 1 identifier in the top-left */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 8,
            left: 8,
            zIndex: 4,
            pointerEvents: 'none',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: '#FF50C8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
          }}
        >
          1P
        </div>
        {/* Attract-mode score in the top-right */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 8,
            right: 8,
            zIndex: 4,
            pointerEvents: 'none',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: '#FFD700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
          }}
        >
          HI 999999
        </div>
      </>
    );
  }

  if (themeId === 'cyberpunk') {
    return (
      <>
        {/* Top-edge cyan power-on glow line */}
        <div className="cyber-glow-line" aria-hidden="true" />
        {/* System ID watermark bottom-right */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            right: 12,
            bottom: 96,
            zIndex: 2,
            pointerEvents: 'none',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9,
            letterSpacing: '2px',
            color: 'rgba(0,240,255,0.28)',
            textTransform: 'uppercase',
          }}
        >
          SYS://FITTRACK.v2.4_ONLINE
        </div>
      </>
    );
  }

  if (themeId === 'iron') {
    return (
      <>
        {/* Brass plate stamp bottom-right */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 96,
            zIndex: 2,
            pointerEvents: 'none',
            padding: '4px 10px',
            border: '1px solid rgba(200,169,110,0.55)',
            background: 'rgba(30,28,26,0.65)',
            fontFamily: "'Stardos Stencil', sans-serif",
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'rgba(200,169,110,0.85)',
            textTransform: 'uppercase',
            boxShadow: 'inset 0 1px 0 rgba(255,252,245,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)',
          }}
        >
          IRON &bull; CHALK
        </div>
      </>
    );
  }

  if (themeId === 'graffiti') {
    return (
      <>
        {/* Tape/sticker tag in top-right corner */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 4,
            pointerEvents: 'none',
            padding: '3px 8px',
            background: 'rgba(253,202,64,0.85)',
            color: '#1A1A1A',
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 11,
            transform: 'rotate(8deg)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.35)',
          }}
        >
          FRESH
        </div>
      </>
    );
  }

  if (themeId === 'lab') {
    return (
      <>
        {/* Specimen barcode-style ID strip at top */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            pointerEvents: 'none',
            height: 3,
            background:
              'repeating-linear-gradient(90deg, #1A1A1A 0 2px, transparent 2px 4px, #1A1A1A 4px 5px, transparent 5px 9px)',
            opacity: 0.35,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            right: 10,
            bottom: 96,
            zIndex: 2,
            pointerEvents: 'none',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#9CA3AF',
            letterSpacing: '0.08em',
          }}
        >
          SPECIMEN #FT-{new Date().getFullYear()}-0001
        </div>
      </>
    );
  }

  return null;
}
