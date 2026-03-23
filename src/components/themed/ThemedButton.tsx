'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function ThemedButton({ children, className = '', style, ...props }: ThemedButtonProps) {
  const { theme } = useTheme();
  const btnStyle = theme.components.button.style;

  const baseStyles: Record<string, string> = {
    fontFamily: theme.fonts.display,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
  };

  switch (btnStyle) {
    case 'underline':
      Object.assign(baseStyles, {
        background: 'none',
        border: 'none',
        textDecoration: 'none',
        position: 'relative',
      });
      break;
    case 'outline':
      Object.assign(baseStyles, {
        background: 'transparent',
        border: `1px solid ${theme.colors.accent}`,
        borderRadius: theme.borders.radius,
      });
      break;
    case 'ghost':
      Object.assign(baseStyles, {
        background: 'transparent',
        border: 'none',
      });
      break;
    case 'pixel-border':
      Object.assign(baseStyles, {
        background: 'transparent',
        border: `2px solid ${theme.colors.accent}`,
        borderRadius: '0',
        boxShadow: `4px 4px 0 ${theme.colors.accent}`,
      });
      break;
    case 'fill':
      Object.assign(baseStyles, {
        background: theme.colors.accent,
        border: 'none',
        borderRadius: theme.borders.radius,
        color: '#ffffff',
      });
      break;
  }

  return (
    <button
      className={className}
      style={{ ...baseStyles, ...style }}
      {...props}
    >
      {children}
      {btnStyle === 'underline' && (
        <span
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            right: 0,
            height: '3px',
            background: theme.colors.accent,
            borderRadius: '2px',
            transform: 'skewX(-8deg)',
          }}
        />
      )}
    </button>
  );
}
