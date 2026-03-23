'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { ReactNode } from 'react';

interface ThemedExerciseCardProps {
  children: ReactNode;
  movementType: 'push' | 'pull' | 'legs' | 'core';
  className?: string;
}

const MOVEMENT_COLORS: Record<string, string> = {
  push: '#3B82F6',
  pull: '#22C55E',
  legs: '#EF4444',
  core: '#EAB308',
};

export default function ThemedExerciseCard({ children, movementType, className = '' }: ThemedExerciseCardProps) {
  const { theme } = useTheme();
  const { movementIndicator, movementIndicatorWidth = '3px' } = theme.components.exerciseCard;
  const color = MOVEMENT_COLORS[movementType] || MOVEMENT_COLORS.push;

  const cardStyle: Record<string, string> = {
    background: theme.colors.bgCard,
    borderRadius: theme.borders.radius,
    position: 'relative',
    overflow: 'hidden',
  };

  switch (movementIndicator) {
    case 'left-bar':
      cardStyle.borderLeft = `${movementIndicatorWidth} solid ${color}`;
      cardStyle.border = theme.borders.card;
      cardStyle.borderLeft = `${movementIndicatorWidth} solid ${color}`;
      break;
    case 'top-bar':
      cardStyle.borderTop = `${movementIndicatorWidth} solid ${color}`;
      cardStyle.border = theme.borders.card;
      cardStyle.borderTop = `${movementIndicatorWidth} solid ${color}`;
      break;
    case 'border':
      cardStyle.border = `1px solid ${color}`;
      break;
  }

  return (
    <div className={className} style={cardStyle}>
      {children}
    </div>
  );
}
