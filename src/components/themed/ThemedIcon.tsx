'use client';

import { useTheme } from '@/providers/ThemeProvider';

type IconName = 'check' | 'plus' | 'arrow-right' | 'star' | 'x';

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * ThemedIcon renders a theme-appropriate variant of a small core icon set.
 * Each theme has its own visual language:
 *   cyberpunk — thin neon line icons with glow
 *   arcade    — 8-bit pixel sprites
 *   notebook  — hand-drawn sketched
 *   iron      — stencil silhouettes with chalk edge
 *   graffiti  — spray-paint/marker strokes
 *   blueprint — drafted technical strokes with dashes
 *   lab       — clinical line icons
 */
export default function ThemedIcon({ name, size = 16, className = '', style, ...rest }: Props) {
  const { themeId } = useTheme();
  const s = size;

  const common = {
    width: s,
    height: s,
    viewBox: '0 0 16 16',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': rest['aria-label'] ? undefined : true,
    role: rest['aria-label'] ? 'img' : undefined,
    'aria-label': rest['aria-label'],
    className,
    style,
  };

  // ───────────── CYBERPUNK — neon line + glow ─────────────
  if (themeId === 'cyberpunk') {
    const filter = 'drop-shadow(0 0 2px rgba(0,240,255,0.9)) drop-shadow(0 0 4px rgba(0,240,255,0.5))';
    const stroke = { stroke: 'currentColor', fill: 'none', strokeWidth: 1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (name === 'check')
      return <svg {...common} style={{ filter, ...style }}><polyline points="3,9 7,13 13,4" {...stroke} /></svg>;
    if (name === 'plus')
      return <svg {...common} style={{ filter, ...style }}><line x1="8" y1="2" x2="8" y2="14" {...stroke} /><line x1="2" y1="8" x2="14" y2="8" {...stroke} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common} style={{ filter, ...style }}><line x1="2" y1="8" x2="14" y2="8" {...stroke} /><polyline points="9,3 14,8 9,13" {...stroke} /></svg>;
    if (name === 'star')
      return <svg {...common} style={{ filter, ...style }}><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" {...stroke} /></svg>;
    if (name === 'x')
      return <svg {...common} style={{ filter, ...style }}><line x1="3" y1="3" x2="13" y2="13" {...stroke} /><line x1="13" y1="3" x2="3" y2="13" {...stroke} /></svg>;
  }

  // ───────────── ARCADE — pixel sprite (3x3 grid feel) ─────────────
  if (themeId === 'arcade') {
    const px = { fill: 'currentColor', shapeRendering: 'crispEdges' as const };
    if (name === 'check')
      return (
        <svg {...common}>
          <rect x="2" y="8" width="2" height="2" {...px} />
          <rect x="4" y="10" width="2" height="2" {...px} />
          <rect x="6" y="12" width="2" height="2" {...px} />
          <rect x="8" y="10" width="2" height="2" {...px} />
          <rect x="10" y="8" width="2" height="2" {...px} />
          <rect x="12" y="6" width="2" height="2" {...px} />
        </svg>
      );
    if (name === 'plus')
      return (
        <svg {...common}>
          <rect x="6" y="2" width="4" height="12" {...px} />
          <rect x="2" y="6" width="12" height="4" {...px} />
        </svg>
      );
    if (name === 'arrow-right')
      return (
        <svg {...common}>
          <rect x="2" y="6" width="8" height="4" {...px} />
          <rect x="10" y="4" width="2" height="8" {...px} />
          <rect x="12" y="6" width="2" height="4" {...px} />
        </svg>
      );
    if (name === 'star')
      return (
        <svg {...common}>
          <rect x="7" y="1" width="2" height="2" {...px} />
          <rect x="6" y="3" width="4" height="2" {...px} />
          <rect x="1" y="5" width="14" height="2" {...px} />
          <rect x="4" y="7" width="8" height="2" {...px} />
          <rect x="3" y="9" width="10" height="2" {...px} />
          <rect x="3" y="11" width="2" height="2" {...px} />
          <rect x="7" y="11" width="2" height="2" {...px} />
          <rect x="11" y="11" width="2" height="2" {...px} />
        </svg>
      );
    if (name === 'x')
      return (
        <svg {...common}>
          <rect x="2" y="2" width="2" height="2" {...px} />
          <rect x="4" y="4" width="2" height="2" {...px} />
          <rect x="6" y="6" width="4" height="4" {...px} />
          <rect x="10" y="4" width="2" height="2" {...px} />
          <rect x="12" y="2" width="2" height="2" {...px} />
          <rect x="10" y="10" width="2" height="2" {...px} />
          <rect x="12" y="12" width="2" height="2" {...px} />
          <rect x="4" y="10" width="2" height="2" {...px} />
          <rect x="2" y="12" width="2" height="2" {...px} />
        </svg>
      );
  }

  // ───────────── NOTEBOOK — hand-drawn, wobbly strokes ─────────────
  if (themeId === 'notebook') {
    const stroke = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (name === 'check')
      return <svg {...common}><path d="M2.5,8.5 Q4,10 6.5,12.5 Q7,13 7.8,12 Q10,8 13.5,3.5" {...stroke} /></svg>;
    if (name === 'plus')
      return <svg {...common}><path d="M8,2 Q7.7,8 8.1,14" {...stroke} /><path d="M2,8 Q8,7.6 14,8.2" {...stroke} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common}><path d="M2,8 Q7,8 13.5,8" {...stroke} /><path d="M9.5,4.5 Q12,7 13.5,8 Q12,9.5 9.8,12" {...stroke} /></svg>;
    if (name === 'star')
      return <svg {...common}><path d="M8,2 Q9.5,6 10.5,6.3 Q13,7 14,7.2 Q12,9 11,10 Q12,13 12,14 Q9.5,12.5 8,12 Q6.5,12.5 4,14 Q4,13 5,10 Q4,9 2,7.2 Q3,7 5.5,6.3 Q6.5,6 8,2 Z" {...stroke} /></svg>;
    if (name === 'x')
      return <svg {...common}><path d="M3,3 Q8,8.5 13,13" {...stroke} /><path d="M13,3.2 Q8,7.5 3,13.2" {...stroke} /></svg>;
  }

  // ───────────── IRON — stencil silhouette, heavy ─────────────
  if (themeId === 'iron') {
    const stencil = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.5, strokeLinejoin: 'round' as const };
    if (name === 'check')
      return <svg {...common}><path d="M2,9 L6,13 L14,3 L11.5,3 L6,10 L4,8 Z" {...stencil} /></svg>;
    if (name === 'plus')
      return <svg {...common}><path d="M6,2 L10,2 L10,6 L14,6 L14,10 L10,10 L10,14 L6,14 L6,10 L2,10 L2,6 L6,6 Z" {...stencil} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common}><path d="M2,6 L9,6 L9,3 L14,8 L9,13 L9,10 L2,10 Z" {...stencil} /></svg>;
    if (name === 'star')
      return <svg {...common}><path d="M8,1 L10,6 L15,6.3 L11,9.7 L12.5,15 L8,12 L3.5,15 L5,9.7 L1,6.3 L6,6 Z" {...stencil} /></svg>;
    if (name === 'x')
      return <svg {...common}><path d="M3,4.5 L4.5,3 L8,6.5 L11.5,3 L13,4.5 L9.5,8 L13,11.5 L11.5,13 L8,9.5 L4.5,13 L3,11.5 L6.5,8 Z" {...stencil} /></svg>;
  }

  // ───────────── GRAFFITI — marker/spray strokes ─────────────
  if (themeId === 'graffiti') {
    const shadow = 'drop-shadow(1px 1px 0 rgba(0,0,0,0.55))';
    const marker = { stroke: 'currentColor', fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (name === 'check')
      return <svg {...common} style={{ filter: shadow, ...style }}><path d="M2.5,9 L6.5,13 L14,3" {...marker} /></svg>;
    if (name === 'plus')
      return <svg {...common} style={{ filter: shadow, ...style }}><line x1="8" y1="2" x2="8" y2="14" {...marker} /><line x1="2" y1="8" x2="14" y2="8" {...marker} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common} style={{ filter: shadow, ...style }}><line x1="2" y1="8" x2="13" y2="8" {...marker} /><polyline points="9,4 14,8 9,12" {...marker} /></svg>;
    if (name === 'star')
      return <svg {...common} style={{ filter: shadow, ...style }}><polygon points="8,2 10,6 14.5,6.3 11,9.5 12,14 8,11.6 4,14 5,9.5 1.5,6.3 6,6" {...marker} fill="currentColor" fillOpacity="0.2" /></svg>;
    if (name === 'x')
      return <svg {...common} style={{ filter: shadow, ...style }}><line x1="3" y1="3" x2="13" y2="13" {...marker} /><line x1="13" y1="3" x2="3" y2="13" {...marker} /></svg>;
  }

  // ───────────── BLUEPRINT — drafted + dashed ─────────────
  if (themeId === 'blueprint') {
    const draft = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.2, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const };
    if (name === 'check')
      return <svg {...common}><polyline points="3,8 6,12 13,4" {...draft} /><circle cx="3" cy="8" r="0.8" fill="currentColor" /><circle cx="13" cy="4" r="0.8" fill="currentColor" /></svg>;
    if (name === 'plus')
      return <svg {...common}><line x1="8" y1="2" x2="8" y2="14" {...draft} /><line x1="2" y1="8" x2="14" y2="8" {...draft} /><line x1="7" y1="2" x2="9" y2="2" {...draft} /><line x1="7" y1="14" x2="9" y2="14" {...draft} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common}><line x1="2" y1="8" x2="14" y2="8" {...draft} strokeDasharray="2,1.5" /><polyline points="10,4 14,8 10,12" {...draft} /></svg>;
    if (name === 'star')
      return <svg {...common}><polygon points="8,2 10,6 14,6.3 11,9.5 12,13.5 8,11.3 4,13.5 5,9.5 2,6.3 6,6" {...draft} /><circle cx="8" cy="8" r="0.6" fill="currentColor" /></svg>;
    if (name === 'x')
      return <svg {...common}><line x1="3" y1="3" x2="13" y2="13" {...draft} /><line x1="13" y1="3" x2="3" y2="13" {...draft} /></svg>;
  }

  // ───────────── LAB — clinical line icons ─────────────
  if (themeId === 'lab') {
    const clinical = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    if (name === 'check')
      return <svg {...common}><circle cx="8" cy="8" r="6.5" {...clinical} /><polyline points="5,8 7,10 11,6" {...clinical} /></svg>;
    if (name === 'plus')
      return <svg {...common}><line x1="8" y1="3" x2="8" y2="13" {...clinical} /><line x1="3" y1="8" x2="13" y2="8" {...clinical} /></svg>;
    if (name === 'arrow-right')
      return <svg {...common}><line x1="3" y1="8" x2="13" y2="8" {...clinical} /><polyline points="9,4 13,8 9,12" {...clinical} /></svg>;
    if (name === 'star')
      return <svg {...common}><polygon points="8,2.5 9.7,6.1 13.5,6.5 10.7,9.2 11.4,13 8,11.2 4.6,13 5.3,9.2 2.5,6.5 6.3,6.1" {...clinical} /></svg>;
    if (name === 'x')
      return <svg {...common}><line x1="4" y1="4" x2="12" y2="12" {...clinical} /><line x1="12" y1="4" x2="4" y2="12" {...clinical} /></svg>;
  }

  // Fallback — simple stroke icon (should never hit in practice)
  const stroke = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.5 };
  if (name === 'check') return <svg {...common}><polyline points="3,8 7,12 13,4" {...stroke} /></svg>;
  if (name === 'plus') return <svg {...common}><line x1="8" y1="2" x2="8" y2="14" {...stroke} /><line x1="2" y1="8" x2="14" y2="8" {...stroke} /></svg>;
  if (name === 'arrow-right') return <svg {...common}><line x1="2" y1="8" x2="14" y2="8" {...stroke} /><polyline points="10,4 14,8 10,12" {...stroke} /></svg>;
  if (name === 'star') return <svg {...common}><polygon points="8,2 10,6 14,6.3 11,9.5 12,14 8,11.6 4,14 5,9.5 2,6.3 6,6" {...stroke} /></svg>;
  return <svg {...common}><line x1="3" y1="3" x2="13" y2="13" {...stroke} /><line x1="13" y1="3" x2="3" y2="13" {...stroke} /></svg>;
}
