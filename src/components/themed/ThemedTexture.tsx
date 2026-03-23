'use client';

import { useTheme } from '@/providers/ThemeProvider';

export default function ThemedTexture() {
  const { theme } = useTheme();

  if (theme.texture.type === 'none') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.03,
        backgroundImage: theme.texture.type === 'svg' ? theme.texture.value : undefined,
        background: theme.texture.type === 'css' ? theme.texture.value : undefined,
        backgroundRepeat: 'repeat',
        backgroundSize: theme.texture.type === 'svg' ? '256px 256px' : undefined,
      }}
    />
  );
}
