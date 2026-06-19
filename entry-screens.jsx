// entry-screens.jsx
// Cluster 1 — Entry & Auth
//   1.2  Sign-in       — neutral, pre-theme. Generic skeleton served on first launch.
//   1.4  Theme picker  — 7 rows, each rendered in its own theme. Single screen, no scroll.
//
// Copy rules:
//   - Headers are labels, not questions ("Theme", not "Pick your theme")
//   - One idea per line; subtitles are noun phrases, not sentences

// ───────────────────────────────────────────────────────────────────────
// 1.2 — SIGN-IN  (neutral, pre-theme)
// Renders without any theme context. Charcoal page, system display type,
// three equal-weight auth buttons.

const NEUTRAL = {
  bg:         '#0E0E10',
  surface:    '#1A1A1D',
  surfaceAlt: '#222226',
  border:     'rgba(255,255,255,.10)',
  borderHi:   'rgba(255,255,255,.18)',
  text:       '#F4F4F2',
  textSec:    '#A8A8AC',
  textTer:    '#6C6C70',
  accent:     '#F4F4F2',
  fontBody:   "'IBM Plex Sans', system-ui, sans-serif",
  fontMono:   "'IBM Plex Mono', 'SF Mono', ui-monospace, monospace",
};

function NeutralAuthButton({ mark, label }) {
  return (
    <button style={{
      width: '100%',
      padding: '14px 14px',
      background: NEUTRAL.surface,
      color: NEUTRAL.text,
      border: `1px solid ${NEUTRAL.border}`,
      borderRadius: 8,
      fontFamily: NEUTRAL.fontBody, fontSize: 15, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', textAlign: 'left',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999,
        background: NEUTRAL.surfaceAlt,
        border: `1px solid ${NEUTRAL.borderHi}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: NEUTRAL.fontBody, fontSize: 13, fontWeight: 700,
        color: NEUTRAL.textSec, flexShrink: 0,
      }}>{mark}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontSize: 18, color: NEUTRAL.textTer, lineHeight: 1 }}>›</span>
    </button>
  );
}

function SignIn() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: NEUTRAL.bg, color: NEUTRAL.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: NEUTRAL.fontBody,
    }}>
      {/* Version label */}
      <div style={{
        padding: '16px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: NEUTRAL.fontMono, fontSize: 10, fontWeight: 600,
          letterSpacing: '.20em', textTransform: 'uppercase',
          color: NEUTRAL.textTer,
        }}>v2.0 · build 412</span>
      </div>

      {/* Wordmark stack — centred upper third */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        paddingBottom: 40,
      }}>
        {/* glyph mark — concentric squares */}
        <div style={{
          position: 'relative',
          width: 56, height: 56,
          marginBottom: 22,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: `1px solid ${NEUTRAL.borderHi}`, borderRadius: 4,
          }}/>
          <div style={{
            position: 'absolute', inset: 10,
            border: `1px solid ${NEUTRAL.borderHi}`, borderRadius: 2,
          }}/>
          <div style={{
            position: 'absolute', inset: 22,
            background: NEUTRAL.text, borderRadius: 1,
          }}/>
        </div>
        <div style={{
          fontFamily: NEUTRAL.fontBody, fontSize: 32, fontWeight: 700,
          letterSpacing: '-.02em', color: NEUTRAL.text,
        }}>FitTrack</div>
        <div style={{
          marginTop: 6,
          fontFamily: NEUTRAL.fontMono, fontSize: 11, fontWeight: 500,
          letterSpacing: '.20em', textTransform: 'uppercase',
          color: NEUTRAL.textTer,
        }}>Lift · log · adapt</div>
      </div>

      {/* Auth stack */}
      <div style={{
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <NeutralAuthButton mark="G" label="Continue with Google"/>
        <NeutralAuthButton mark="" label="Continue with Apple"/>
        <NeutralAuthButton mark="@" label="Continue with Email"/>
      </div>

      {/* Sign-in switch + terms */}
      <div style={{
        padding: '20px 36px 22px',
        textAlign: 'center',
        fontFamily: NEUTRAL.fontBody, fontSize: 12, lineHeight: 1.6,
        color: NEUTRAL.textTer,
      }}>
        <div style={{ color: NEUTRAL.textSec, marginBottom: 10 }}>
          Have an account?{' '}
          <a href="#" style={{ color: NEUTRAL.text, fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
        </div>
        <div>
          <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Terms</a>
          {'   ·   '}
          <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Privacy</a>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// 1.4 — THEME PICKER
// Seven rows. Each row renders in its own theme: bg, border, display font.
// One-line noun subtitle. Checkbox on the right.

const THEME_ROWS = [
  {
    id: 'iron',
    name: 'Iron',
    subtitle: 'Cold metal · brass · stencil',
    bg: '#161514', surfaceAlt: '#2E2D2B',
    border: 'rgba(200,169,110,.35)', borderHi: '#C8A96E',
    text: '#F0E8D8', textSec: '#A89C82',
    accent: '#C8A96E',
    fontDisplay: "'Stardos Stencil', serif",
    fontBody:    "'Teko', sans-serif",
    chrome: 'iron',
  },
  {
    id: 'lab',
    name: 'Lab Report',
    subtitle: 'Clinical grid · plex · barcode',
    bg: '#FFFFFF', surfaceAlt: '#ECEDF0',
    border: '#D8D9DD', borderHi: '#0A2E5A',
    text: '#0A2E5A', textSec: '#5A6878',
    accent: '#0A2E5A',
    fontDisplay: "'IBM Plex Sans', sans-serif",
    fontBody:    "'IBM Plex Mono', monospace",
    chrome: 'lab',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    subtitle: 'Cream paper · marker · spiral',
    bg: '#FFFCF4', surfaceAlt: '#FAF6ED',
    border: '#D2C6B2', borderHi: '#B5312A',
    text: '#262119', textSec: '#5A4F40',
    accent: '#B5312A',
    fontDisplay: "'Caveat', cursive",
    fontBody:    "'Patrick Hand', cursive",
    chrome: 'notebook',
  },
  {
    id: 'arcade',
    name: 'Arcade',
    subtitle: 'Pink and cyan · pixel · CRT',
    bg: '#0E0E1C', surfaceAlt: '#1A1A2E',
    border: 'rgba(255,80,200,.45)', borderHi: '#FF50C8',
    text: '#FFFFFF', textSec: '#A8A3D2',
    accent: '#FF50C8',
    fontDisplay: "'Press Start 2P', monospace",
    fontBody:    "'VT323', monospace",
    chrome: 'arcade',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    subtitle: 'Navy linework · mono · drafting',
    bg: '#132C52', surfaceAlt: '#1E3C6E',
    border: 'rgba(245,250,255,.30)', borderHi: '#FAFDFF',
    text: '#FAFDFF', textSec: '#A8C0D8',
    accent: '#FAFDFF',
    fontDisplay: "'Major Mono Display', monospace",
    fontBody:    "'Space Mono', monospace",
    chrome: 'blueprint',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    subtitle: 'Neon cyan · orbitron · scanlines',
    bg: '#050A16', surfaceAlt: '#0E1828',
    border: 'rgba(0,240,255,.35)', borderHi: '#00F0FF',
    text: '#EBFAFF', textSec: '#90B0C8',
    accent: '#00F0FF',
    fontDisplay: "'Orbitron', sans-serif",
    fontBody:    "'Share Tech Mono', monospace",
    chrome: 'cyberpunk',
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    subtitle: 'Concrete · marker · neon tape',
    bg: '#1C1C1E', surfaceAlt: '#2A2A2D',
    border: 'rgba(245,220,60,.35)', borderHi: '#F5DC3C',
    text: '#FAFAF8', textSec: '#969699',
    accent: '#F5DC3C',
    fontDisplay: "'Permanent Marker', cursive",
    fontBody:    "'Bungee', sans-serif",
    chrome: 'graffiti',
  },
];

function ThemeRow({ row, selected, onSelect }) {
  // Per-theme display tweaks to match the chrome character
  const titleSize    = row.chrome === 'arcade' ? 18
                     : row.chrome === 'notebook' ? 34
                     : row.chrome === 'blueprint' ? 22
                     : row.chrome === 'graffiti' ? 26
                     : 28;
  const titleWeight  = row.chrome === 'notebook' ? 700 : 600;
  const titleSpacing = row.chrome === 'arcade'    ? '.04em'
                     : row.chrome === 'blueprint' ? '.06em'
                     : row.chrome === 'cyberpunk' ? '.08em'
                     : row.chrome === 'iron'      ? '.05em'
                     : row.chrome === 'graffiti'  ? '.01em'
                     : '-.01em';
  const titleTransform = row.chrome === 'cyberpunk' || row.chrome === 'iron' || row.chrome === 'blueprint' ? 'uppercase' : 'none';
  const titleShadow  = row.chrome === 'arcade'    ? '2px 2px 0 rgba(0,240,255,.45)'
                     : row.chrome === 'cyberpunk' ? '0 0 6px rgba(0,240,255,.55)'
                     : 'none';

  const subSize    = row.chrome === 'notebook' ? 16
                   : row.chrome === 'arcade' ? 14
                   : 12;
  const subSpacing = row.chrome === 'notebook' || row.chrome === 'arcade' ? '.02em' : '.04em';
  const subTransform = row.chrome === 'notebook' || row.chrome === 'arcade' ? 'none' : 'uppercase';

  const radius = row.chrome === 'arcade' || row.chrome === 'blueprint' || row.chrome === 'cyberpunk' ? 0
               : row.chrome === 'notebook' ? 3
               : row.chrome === 'graffiti' ? 1
               : 6;

  const rotate = row.chrome === 'graffiti' ? '-.4deg'
               : row.chrome === 'notebook' ? '.2deg'
               : '0';

  return (
    <button
      onClick={onSelect}
      style={{
        position: 'relative',
        width: '100%', height: 100,
        background: row.bg,
        border: `1.5px solid ${selected ? row.borderHi : row.border}`,
        borderRadius: radius,
        padding: '0 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        transform: `rotate(${rotate})`,
        boxShadow: selected
          ? (row.chrome === 'arcade' ? `4px 4px 0 ${row.accent}`
             : row.chrome === 'cyberpunk' ? `0 0 18px rgba(0,240,255,.35)`
             : row.chrome === 'graffiti' ? `3px 3px 0 rgba(0,0,0,.5)`
             : `0 0 0 2px ${row.accent}`)
          : 'none',
      }}
    >
      {/* Decorative chrome per theme */}
      {row.chrome === 'iron' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(to bottom, rgba(200,169,110,.7), rgba(120,90,40,.4))',
        }}/>
      )}
      {row.chrome === 'lab' && (
        <div style={{
          position: 'absolute', top: 12, right: 50, width: 36, height: 14,
          background: 'repeating-linear-gradient(to right, #0A2E5A 0 1.5px, transparent 1.5px 3px, #0A2E5A 3px 4px, transparent 4px 6px)',
          opacity: .8,
        }}/>
      )}
      {row.chrome === 'notebook' && (
        <>
          <div style={{
            position: 'absolute', left: 28, top: 0, bottom: 0, width: 1,
            background: 'rgba(181,49,42,.45)',
          }}/>
          {[18, 36, 54, 72].map((y) => (
            <div key={y} style={{
              position: 'absolute', left: 8, top: y, width: 8, height: 8,
              borderRadius: 999, border: '1px solid rgba(140,125,105,.5)',
            }}/>
          ))}
        </>
      )}
      {row.chrome === 'arcade' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,.04) 0 1px, transparent 1px 3px)',
        }}/>
      )}
      {row.chrome === 'blueprint' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(250,253,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(250,253,255,.10) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}/>
      )}
      {row.chrome === 'cyberpunk' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(to bottom, rgba(0,240,255,.05) 0 1px, transparent 1px 4px)',
        }}/>
      )}
      {row.chrome === 'graffiti' && (
        <div style={{
          position: 'absolute', top: 10, right: 56, padding: '2px 8px',
          background: '#F5DC3C', color: '#1C1C1E',
          fontFamily: "'Bungee', sans-serif", fontSize: 8, fontWeight: 700,
          letterSpacing: '.16em', textTransform: 'uppercase',
          transform: 'rotate(2deg)',
        }}>Default</div>
      )}

      {/* Title + subtitle */}
      <div style={{
        position: 'relative', flex: 1, minWidth: 0,
        paddingLeft: row.chrome === 'notebook' ? 18 : 0,
      }}>
        <div style={{
          fontFamily: row.fontDisplay,
          fontSize: titleSize, fontWeight: titleWeight,
          letterSpacing: titleSpacing,
          textTransform: titleTransform,
          color: row.text,
          textShadow: titleShadow,
          lineHeight: 1.05,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{row.name}</div>
        <div style={{
          marginTop: 6,
          fontFamily: row.fontBody,
          fontSize: subSize,
          letterSpacing: subSpacing,
          textTransform: subTransform,
          color: row.textSec,
          lineHeight: 1.2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{row.subtitle}</div>
      </div>

      {/* Checkbox */}
      <div style={{
        position: 'relative',
        width: 26, height: 26,
        borderRadius: row.chrome === 'arcade' || row.chrome === 'blueprint' || row.chrome === 'cyberpunk' ? 0 : 5,
        border: `1.5px solid ${selected ? row.borderHi : row.border}`,
        background: selected ? row.accent : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && (
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
               stroke={row.chrome === 'arcade' || row.chrome === 'graffiti' ? '#1C1C1E' : (row.bg)}
               strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="3,8 7,12 13,4"/>
          </svg>
        )}
      </div>
    </button>
  );
}

function ThemePicker({ selectedId = 'graffiti', onChange = () => {} }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0E0E10',
      display: 'flex', flexDirection: 'column',
      fontFamily: NEUTRAL.fontBody,
      color: NEUTRAL.text,
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: 26, fontWeight: 700, letterSpacing: '-.02em',
            color: NEUTRAL.text, lineHeight: 1,
          }}>Theme</div>
          <div style={{
            marginTop: 6,
            fontFamily: NEUTRAL.fontMono, fontSize: 10, fontWeight: 500,
            letterSpacing: '.18em', textTransform: 'uppercase',
            color: NEUTRAL.textTer,
          }}>Change anytime</div>
        </div>
        <div style={{
          fontFamily: NEUTRAL.fontMono, fontSize: 10, fontWeight: 600,
          letterSpacing: '.18em', textTransform: 'uppercase',
          color: NEUTRAL.textTer,
        }}>Step 1 / 3</div>
      </div>

      {/* Rows */}
      <div style={{
        flex: 1,
        padding: '4px 14px 0',
        display: 'flex', flexDirection: 'column', gap: 8,
        overflow: 'hidden',
      }}>
        {THEME_ROWS.map((row) => (
          <ThemeRow
            key={row.id}
            row={row}
            selected={selectedId === row.id}
            onSelect={() => onChange(row.id)}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 20px 22px' }}>
        <button style={{
          width: '100%', height: 52,
          background: NEUTRAL.text, color: NEUTRAL.bg,
          border: 'none', borderRadius: 8,
          fontFamily: NEUTRAL.fontBody, fontSize: 15, fontWeight: 700,
          letterSpacing: '.01em',
          cursor: 'pointer',
        }}>Continue</button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────
// 1.3 — EMAIL  (neutral, pre-theme, magic-link)
// Reached from "Continue with Email" on 1.2. One screen, a Sign up / Sign in
// toggle, a single email field, and a one-time link. No password anywhere.
// States: default · invalid · loading · sent · conflict.
//
// Copy rules: labels are nouns, buttons are verbs, hints only when functional.

const NEUTRAL_DANGER = '#E0654F';

// Back / version top bar, shared with the sign-in surface.
function NeutralTopBar({ onBack }) {
  return (
    <div style={{
      padding: '16px 16px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button onClick={onBack} style={{
        width: 34, height: 34, borderRadius: 999,
        background: NEUTRAL.surface, border: `1px solid ${NEUTRAL.border}`,
        color: NEUTRAL.text, fontSize: 18, lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}>‹</button>
      <span style={{
        fontFamily: NEUTRAL.fontMono, fontSize: 10, fontWeight: 600,
        letterSpacing: '.20em', textTransform: 'uppercase',
        color: NEUTRAL.textTer,
      }}>v2.0 · build 412</span>
    </div>
  );
}

function NeutralWordmark({ size = 40 }) {
  const inner = size * 0.18;
  const mid = size * 0.39;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', inset: 0, border: `1px solid ${NEUTRAL.borderHi}`, borderRadius: 4 }}/>
      <div style={{ position: 'absolute', inset: mid * 0.45, border: `1px solid ${NEUTRAL.borderHi}`, borderRadius: 2 }}/>
      <div style={{ position: 'absolute', inset: mid, background: NEUTRAL.text, borderRadius: 1 }}/>
    </div>
  );
}

function SegToggle({ mode, onChange }) {
  const opts = [{ id: 'signup', label: 'Sign up' }, { id: 'signin', label: 'Sign in' }];
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: NEUTRAL.surfaceAlt,
      border: `1px solid ${NEUTRAL.border}`,
      borderRadius: 11,
    }}>
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <button key={o.id} onClick={() => onChange && onChange(o.id)} style={{
            flex: 1, padding: '9px 0', borderRadius: 7,
            background: active ? NEUTRAL.bg : 'transparent',
            border: `1px solid ${active ? NEUTRAL.borderHi : 'transparent'}`,
            color: active ? NEUTRAL.text : NEUTRAL.textTer,
            fontFamily: NEUTRAL.fontBody, fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function NeutralEmailField({ value, error, disabled }) {
  const empty = !value;
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 8,
        fontFamily: NEUTRAL.fontMono, fontSize: 10, fontWeight: 600,
        letterSpacing: '.16em', textTransform: 'uppercase',
        color: NEUTRAL.textTer,
      }}>Email</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 54,
        padding: '0 14px',
        background: NEUTRAL.surface,
        border: `1px solid ${error ? NEUTRAL_DANGER : NEUTRAL.border}`,
        borderRadius: 10,
        opacity: disabled ? 0.55 : 1,
      }}>
        <span style={{ fontFamily: NEUTRAL.fontMono, fontSize: 15, color: NEUTRAL.textTer }}>@</span>
        <span style={{
          flex: 1, fontFamily: NEUTRAL.fontBody, fontSize: 15,
          color: empty ? NEUTRAL.textTer : NEUTRAL.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{empty ? 'you@email.com' : value}</span>
        {!empty && !error && !disabled && (
          <span style={{ color: NEUTRAL.textSec, fontSize: 14 }}>✓</span>
        )}
      </div>
      {error && (
        <div style={{
          marginTop: 8, fontFamily: NEUTRAL.fontBody, fontSize: 12,
          color: NEUTRAL_DANGER, lineHeight: 1.4,
        }}>{error}</div>
      )}
    </div>
  );
}

// Inline notice strip (used for the account-exists conflict).
function NeutralNotice({ children, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '11px 12px',
      background: NEUTRAL.surfaceAlt,
      border: `1px solid ${NEUTRAL.borderHi}`,
      borderRadius: 10,
    }}>
      <span style={{
        flexShrink: 0, width: 18, height: 18, borderRadius: 999, marginTop: 1,
        background: NEUTRAL.text, color: NEUTRAL.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: NEUTRAL.fontBody, fontSize: 11, fontWeight: 700,
      }}>i</span>
      <div style={{ flex: 1, minWidth: 0, fontFamily: NEUTRAL.fontBody, fontSize: 12.5, color: NEUTRAL.textSec, lineHeight: 1.45 }}>
        {children}
        {action && (
          <>
            {' '}
            <a href="#" style={{ color: NEUTRAL.text, fontWeight: 600, textDecoration: 'underline' }}>{action}</a>
          </>
        )}
      </div>
    </div>
  );
}

function NeutralPrimary({ children, disabled, loading }) {
  return (
    <button disabled={disabled} style={{
      width: '100%', height: 54,
      background: NEUTRAL.text, color: NEUTRAL.bg,
      border: 'none', borderRadius: 10,
      fontFamily: NEUTRAL.fontBody, fontSize: 15, fontWeight: 700,
      letterSpacing: '.01em',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled && !loading ? 0.5 : 1,
    }}>
      {loading && (
        <span style={{
          width: 16, height: 16, borderRadius: 999,
          border: `2px solid rgba(14,14,16,.25)`, borderTopColor: NEUTRAL.bg,
          display: 'inline-block', animation: 'ftspin 0.7s linear infinite',
        }}/>
      )}
      {children}
    </button>
  );
}

// Magic-link sent confirmation — replaces the form body.
function LinkSent({ email }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 999, marginBottom: 22,
        background: NEUTRAL.surface, border: `1px solid ${NEUTRAL.borderHi}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 48 48" width="34" height="34" fill="none"
             stroke={NEUTRAL.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="12" width="34" height="24" rx="3"/>
          <path d="M8 14 L24 26 L40 14"/>
        </svg>
      </div>
      <div style={{ fontFamily: NEUTRAL.fontBody, fontSize: 23, fontWeight: 700, letterSpacing: '-.01em', color: NEUTRAL.text }}>
        Check your inbox
      </div>
      <div style={{ marginTop: 8, fontFamily: NEUTRAL.fontBody, fontSize: 14, color: NEUTRAL.textSec, lineHeight: 1.5 }}>
        Sign-in link sent to<br/>
        <span style={{ color: NEUTRAL.text, fontWeight: 600 }}>{email}</span>
      </div>
      <div style={{
        marginTop: 14, fontFamily: NEUTRAL.fontMono, fontSize: 11, fontWeight: 500,
        letterSpacing: '.12em', textTransform: 'uppercase', color: NEUTRAL.textTer,
      }}>Expires in 15 min</div>

      <div style={{ marginTop: 28, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <NeutralPrimary>Open mail app</NeutralPrimary>
        <button style={{
          width: '100%', height: 50,
          background: NEUTRAL.surface, color: NEUTRAL.text,
          border: `1px solid ${NEUTRAL.border}`, borderRadius: 10,
          fontFamily: NEUTRAL.fontBody, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Resend link</button>
      </div>
      <a href="#" style={{
        marginTop: 18, fontFamily: NEUTRAL.fontBody, fontSize: 13,
        color: NEUTRAL.textSec, textDecoration: 'none',
      }}>Use a different email</a>
    </div>
  );
}

function EmailAuth({ mode = 'signup', state = 'default', onBack = () => {}, onMode = () => {} }) {
  const sent = state === 'sent';
  const invalid = state === 'invalid';
  const loading = state === 'loading';
  const conflict = state === 'conflict';

  const email = state === 'default' ? ''
              : invalid ? 'sam@gmail'
              : 'sam.rivera@gmail.com';

  const cta = mode === 'signup' ? 'Send sign-up link' : 'Send sign-in link';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: NEUTRAL.bg, color: NEUTRAL.text,
      display: 'flex', flexDirection: 'column',
      fontFamily: NEUTRAL.fontBody,
    }}>
      <NeutralTopBar onBack={onBack}/>

      {/* Wordmark — compact, this is a step deeper than 1.2 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, paddingBottom: 34 }}>
        <NeutralWordmark size={40}/>
        <div style={{ marginTop: 14, fontFamily: NEUTRAL.fontBody, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: NEUTRAL.text }}>
          {sent ? '' : 'Continue with email'}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sent ? (
          <LinkSent email={email}/>
        ) : (
          <>
            <SegToggle mode={mode} onChange={onMode}/>
            <NeutralEmailField
              value={email}
              disabled={loading}
              error={invalid ? 'Enter a valid email address.' : null}
            />
            {conflict && (
              <NeutralNotice action="Sign in instead →">
                This email already has an account.
              </NeutralNotice>
            )}
            <NeutralPrimary disabled={loading} loading={loading}>
              {loading ? 'Sending…' : cta}
            </NeutralPrimary>
            <div style={{
              fontFamily: NEUTRAL.fontMono, fontSize: 10.5, fontWeight: 500,
              letterSpacing: '.10em', textTransform: 'uppercase',
              color: NEUTRAL.textTer, textAlign: 'center',
            }}>One-time link · no password</div>
          </>
        )}
      </div>

      {/* Terms — sign-up only, hidden on the sent screen */}
      {!sent && (
        <div style={{
          padding: '18px 36px 22px', textAlign: 'center',
          fontFamily: NEUTRAL.fontBody, fontSize: 12, lineHeight: 1.6,
          color: NEUTRAL.textTer,
        }}>
          {mode === 'signup' ? (
            <span>
              By continuing you agree to the{' '}
              <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Terms</a>
              {' '}and{' '}
              <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Privacy Policy</a>.
            </span>
          ) : (
            <span>
              <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Terms</a>
              {'   ·   '}
              <a href="#" style={{ color: NEUTRAL.textSec, textDecoration: 'none' }}>Privacy</a>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────

Object.assign(window, {
  SignIn,
  EmailAuth,
  ThemePicker,
  ThemeRow,
  THEME_ROWS,
});
