'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function ThemedTexture() {
  const { theme } = useTheme();

  if (theme.texture.type === 'none') return null;

  // Inline SVG — render raw markup directly into the DOM
  if (theme.texture.type === 'svg-inline') {
    return (
      <div
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: theme.texture.value }}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      />
    );
  }

  // CSS background (may include multiple layers and background-size)
  if (theme.texture.type === 'css') {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          [data-themed-texture] {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            ${theme.texture.value}
          }
        `}} />
        <div data-themed-texture="" />
      </div>
    );
  }

  // URL-encoded SVG background
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.03,
        backgroundImage: theme.texture.value,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  );
}
