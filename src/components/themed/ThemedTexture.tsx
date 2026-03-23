'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useEffect, useRef } from 'react';

export default function ThemedTexture() {
  const { theme } = useTheme();
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Clean up injected <style> tags when texture changes or component unmounts
  useEffect(() => {
    if (theme.texture.type === 'css') {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-theme-texture', theme.id);
      styleEl.textContent = `[data-themed-texture] { ${theme.texture.value} }`;
      document.head.appendChild(styleEl);
      styleRef.current = styleEl;
      return () => {
        styleEl.remove();
        styleRef.current = null;
      };
    }
    // Cleanup any leftover style from previous CSS texture theme
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [theme]);

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

  // CSS background — the <style> tag is injected via useEffect above
  if (theme.texture.type === 'css') {
    return (
      <div
        aria-hidden="true"
        data-themed-texture=""
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      />
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
