'use client';

import { useTheme } from '@/providers/ThemeProvider';

interface ThemedDividerProps {
  className?: string;
}

export default function ThemedDivider({ className = '' }: ThemedDividerProps) {
  const { theme } = useTheme();

  return (
    <hr
      className={className}
      style={{
        border: 'none',
        borderTop: theme.borders.divider,
        margin: 0,
      }}
    />
  );
}
