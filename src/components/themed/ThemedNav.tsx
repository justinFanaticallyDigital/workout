'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { ReactNode } from 'react';

interface ThemedNavItemProps {
  children: ReactNode;
  active: boolean;
  className?: string;
}

export default function ThemedNavItem({ children, active, className = '' }: ThemedNavItemProps) {
  const { theme } = useTheme();
  const { activeIndicator, activeStyle = {} } = theme.components.nav;

  const itemStyle: Record<string, string> = {};

  if (active) {
    switch (activeIndicator) {
      case 'underline':
        itemStyle.borderBottom = `3px solid ${theme.colors.accent}`;
        break;
      case 'glow-dot':
        break;
      case 'bg-fill':
        itemStyle.background = activeStyle.background || `${theme.colors.accent}22`;
        if (activeStyle.borderRadius) itemStyle.borderRadius = activeStyle.borderRadius;
        break;
      case 'border-bottom':
        itemStyle.borderBottom = `${activeStyle.borderWidth || '2px'} solid ${activeStyle.borderColor || theme.colors.accent}`;
        break;
    }
  }

  return (
    <div className={className} style={itemStyle}>
      {children}
      {active && activeIndicator === 'glow-dot' && (
        <span
          style={{
            display: 'block',
            width: activeStyle.dotSize || '4px',
            height: activeStyle.dotSize || '4px',
            borderRadius: '50%',
            background: activeStyle.color || theme.colors.accent,
            margin: '2px auto 0',
            boxShadow: `0 0 ${activeStyle.glowRadius || '6px'} ${activeStyle.color || theme.colors.accent}`,
          }}
        />
      )}
    </div>
  );
}
