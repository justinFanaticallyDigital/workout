'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { themeList } from '@/themes';
import { THEME_SWATCHES } from '@/themes/swatches';

interface ThemePickerModalProps {
  onClose: () => void;
}

export default function ThemePickerModal({ onClose }: ThemePickerModalProps) {
  const { themeId, setTheme } = useTheme();

  const handleSelect = (id: string) => {
    setTheme(id);
  };

  const handleConfirm = () => {
    localStorage.setItem('fittrack-theme-chosen', 'true');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: THEME_SWATCHES[themeId]?.bg || '#2A2D2F',
          border: `1px solid ${THEME_SWATCHES[themeId]?.accent || '#3B82F6'}`,
          padding: '24px',
          position: 'relative',
        }}
      >
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: THEME_SWATCHES[themeId]?.text || '#fff',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Choose Your Theme
        </h2>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '13px',
            color: THEME_SWATCHES[themeId]?.text || '#fff',
            opacity: 0.55,
            marginBottom: '20px',
          }}
        >
          Pick a visual style for FitTrack. You can change this anytime in Settings.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {themeList.map((t) => {
            const swatch = THEME_SWATCHES[t.id] || { bg: '#333', accent: '#fff', text: '#fff' };
            const isSelected = themeId === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: swatch.bg,
                  border: isSelected
                    ? `2px solid ${swatch.accent}`
                    : '2px solid rgba(128,128,128,0.2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                {/* Color swatch dot */}
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: swatch.accent,
                    flexShrink: 0,
                    boxShadow: isSelected ? `0 0 8px ${swatch.accent}` : 'none',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: swatch.text,
                      lineHeight: 1.2,
                    }}
                  >
                    {t.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: '10px 0',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            background: THEME_SWATCHES[themeId]?.accent || '#3B82F6',
            color: themeId === 'notebook' || themeId === 'lab' ? '#fff' : THEME_SWATCHES[themeId]?.bg || '#000',
            border: 'none',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
