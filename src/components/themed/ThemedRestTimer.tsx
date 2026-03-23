'use client';

import { useTheme } from '@/providers/ThemeProvider';

interface ThemedRestTimerProps {
  progress: number; // 0 to 1
  remainingSeconds: number;
  totalSeconds: number;
  className?: string;
}

export default function ThemedRestTimer({ progress, remainingSeconds, totalSeconds, className = '' }: ThemedRestTimerProps) {
  const { theme } = useTheme();
  const { style, glowEffect } = theme.components.restTimer;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (style === 'bar') {
    return (
      <div className={className}>
        <div
          style={{
            height: '8px',
            background: theme.colors.bgElevated,
            borderRadius: theme.borders.radius,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: theme.colors.accent,
              transition: 'width 1s linear',
              boxShadow: glowEffect ? `0 0 10px ${theme.colors.accent}` : 'none',
            }}
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '4px', color: theme.colors.textSecondary, fontFamily: theme.fonts.data }}>
          {formatTime(remainingSeconds)}
        </div>
      </div>
    );
  }

  if (style === 'radial') {
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.colors.bgElevated}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.colors.accent}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s linear',
              filter: glowEffect ? `drop-shadow(0 0 6px ${theme.colors.accent})` : 'none',
            }}
          />
        </svg>
        <div style={{ marginTop: '-72px', fontFamily: theme.fonts.data, fontSize: '24px', color: theme.colors.textPrimary }}>
          {formatTime(remainingSeconds)}
        </div>
      </div>
    );
  }

  // text-countdown
  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: theme.fonts.data,
          fontSize: '48px',
          color: theme.colors.textPrimary,
          textShadow: glowEffect ? `0 0 20px ${theme.colors.accent}` : 'none',
        }}
      >
        {formatTime(remainingSeconds)}
      </div>
      <div style={{ color: theme.colors.textTertiary, fontFamily: theme.fonts.body, fontSize: '12px' }}>
        {formatTime(totalSeconds - remainingSeconds)} elapsed
      </div>
    </div>
  );
}
