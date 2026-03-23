'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { ReactNode } from 'react';

interface ThemedCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export default function ThemedCard({ children, className = '', elevated = false }: ThemedCardProps) {
  const { theme } = useTheme();
  const bg = elevated ? theme.colors.bgElevated : theme.colors.bgCard;

  return (
    <div
      className={className}
      style={{
        background: bg,
        border: theme.borders.card,
        borderRadius: theme.borders.radius,
      }}
    >
      {children}
    </div>
  );
}
