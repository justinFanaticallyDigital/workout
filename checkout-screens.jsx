// checkout-screens.jsx
// FitTrack · Cluster A — Commercial finish line
//   5.5  Checkout (Program + Gameplan)
//   5.5a Post-Purchase Welcome (Program + Gameplan + Loading)
//   5.4  Customize — POST-PURCHASE surface, reachable from tier home / planning
//
// Copy rules (see CLAUDE.md):
//   labels not questions · no marketing prose · trust the user to read controls.
//
// Flow:
//   Detail → Checkout (only choice: start date) → Welcome → Tier home
//   Tier home → Customize (anytime, reversible) → save

const { useMemo: useCoMemo, useState: useCoState } = React;

// ──────────────────────────────────────────────────────────────────────────
// Shared bits

function FieldRow({ T, label, value, action = 'EDIT' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px',
    }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 10, letterSpacing: '.12em',
        color: T.textTer, textTransform: 'uppercase',
        width: 92, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.text, flex: 1 }}>{value}</span>
      {action && (
        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '.04em' }}>{action}</span>
      )}
    </div>
  );
}

function FauxInput({ T, value, placeholder, suffix, style }) {
  return (
    <div style={{
      padding: '11px 13px',
      background: T.surfaceAlt,
      border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
      fontFamily: T.fontBody, fontSize: 14, color: value ? T.text : T.textTer,
      fontWeight: value ? 500 : 400,
      display: 'flex', alignItems: 'center', gap: 8,
      ...style,
    }}>
      <span style={{ flex: 1 }}>{value || placeholder}</span>
      {suffix && <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, letterSpacing: '.06em' }}>{suffix}</span>}
    </div>
  );
}

function SectionLabel({ T, children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '14px 16px 6px',
    }}>
      <span style={{
        fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em',
        color: T.textTer, textTransform: 'uppercase', fontWeight: 600,
      }}>{children}</span>
      {right && (
        <span style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer }}>{right}</span>
      )}
    </div>
  );
}

// Mini calendar — picks a start date (skeleton: shows a representative month).
function MiniCalendar({ T, selectedDay = 4 }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <div style={{
      background: T.surfaceAlt,
      border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
      padding: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.text }}>May 2026</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <span style={{
            width: 22, height: 22, borderRadius: 999, border: `1px solid ${T.borderFaint}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: T.textSec,
          }}>‹</span>
          <span style={{
            width: 22, height: 22, borderRadius: 999, border: `1px solid ${T.borderFaint}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: T.textSec,
          }}>›</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{
            fontFamily: T.fontData, fontSize: 9, letterSpacing: '.12em',
            color: T.textTer, textAlign: 'center', padding: '2px 0',
          }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {days.map((n) => {
          const visible = n >= 1 && n <= 31;
          const isToday = n === 4;
          const isSelected = n === selectedDay;
          return (
            <div key={n} style={{
              aspectRatio: '1',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontData, fontSize: 12,
              borderRadius: T.radiusSm || 4,
              background: isSelected ? T.accent : 'transparent',
              border: isToday && !isSelected ? `1px solid ${T.accentBorder}` : '1px solid transparent',
              color: isSelected ? T.textOnAccent : visible ? T.text : 'transparent',
              fontWeight: isSelected ? 700 : 500,
            }}>{visible ? n : '·'}</div>
          );
        })}
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// 5.5 — Checkout (Program)
// Single decision: start date. Default = next Monday, inline row at top.
// Everything else moves to post-purchase Customize.

function PriceLine({ T, label, value, muted, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '8px 0',
      borderBottom: bold ? 'none' : `1px solid ${T.borderFaint}`,
    }}>
      <span style={{
        fontFamily: T.fontBody, fontSize: bold ? 14 : 13,
        fontWeight: bold ? 700 : 500,
        color: muted ? T.textTer : T.text,
      }}>{label}</span>
      <span style={{
        fontFamily: T.fontData, fontSize: bold ? 16 : 13,
        fontWeight: bold ? 700 : 500,
        color: muted ? T.textTer : T.text,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
    </div>
  );
}

function PaymentRow({ T, glyph, label, sub, selected }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: selected ? T.accentFaint : T.surface,
      border: `1px solid ${selected ? T.accentBorder : T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
      marginBottom: 8,
    }}>
      <span style={{
        width: 36, height: 28, borderRadius: 4,
        background: selected ? T.accent : T.surfaceAlt,
        color: selected ? T.textOnAccent : T.textSec,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontBody, fontSize: 11, fontWeight: 700, letterSpacing: '.02em',
      }}>{glyph}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{
        width: 18, height: 18, borderRadius: 999,
        border: `1.5px solid ${selected ? T.accent : T.borderFaint}`,
        background: selected ? T.accent : 'transparent',
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: T.textOnAccent, fontSize: 10, fontWeight: 700,
      }}>{selected ? '✓' : ''}</span>
    </div>
  );
}

function StartDateRow({ T, value = 'Mon · May 4 · 2026' }) {
  return (
    <div style={{
      margin: '0 16px 14px',
      padding: '12px 14px',
      background: T.surface,
      border: `1px solid ${T.borderFaint}`,
      borderRadius: T.radiusMd || 8,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: T.radiusSm || 4,
        background: T.accentFaint, color: T.accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>▦</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontData, fontSize: 10, letterSpacing: '.14em', color: T.textTer, textTransform: 'uppercase', fontWeight: 600 }}>Starts</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text, marginTop: 2 }}>{value}</div>
      </div>
      <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.accent, fontWeight: 600, letterSpacing: '.04em' }}>CHANGE</span>
    </div>
  );
}

function CheckoutProgram({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Checkout" right={null}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 110px' }}>
        <SectionLabel T={T}>Order</SectionLabel>
        <Card T={T} style={{ padding: '14px 16px', margin: '0 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: T.radiusMd || 8,
              background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentBorder} 100%)`,
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700,
              color: T.textOnAccent, letterSpacing: '.04em',
            }}>PPL</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.25 }}>
                PPL · Intermediate
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec, marginTop: 2 }}>
                12 weeks · 5 days/week
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Chip T={T} tone="accent" size="sm">Program</Chip>
                <Chip T={T} tone="neutral" size="sm">One-time</Chip>
              </div>
            </div>
          </div>
        </Card>

        <SectionLabel T={T}>Start date</SectionLabel>
        <StartDateRow T={T} value="Mon · May 4 · 2026"/>

        <SectionLabel T={T}>Total</SectionLabel>
        <Card T={T} style={{ padding: '6px 14px 12px', margin: '0 16px' }}>
          <PriceLine T={T} label="PPL · Intermediate" value="$79.00"/>
          <PriceLine T={T} label="Tax" value="$6.32" muted/>
          <PriceLine T={T} label="Total" value="$85.32" bold/>
        </Card>

        <SectionLabel T={T}>Payment</SectionLabel>
        <div style={{ margin: '0 16px' }}>
          <PaymentRow T={T} glyph="" label="Apple Pay" sub="Touch ID required" selected/>
          <PaymentRow T={T} glyph="VISA" label="Visa ending 4242"/>
          <PaymentRow T={T} glyph="+" label="Add payment method"/>
        </div>

        <div style={{
          margin: '6px 16px',
          padding: '10px 12px',
          background: T.surfaceAlt,
          borderRadius: T.radiusMd || 8,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            background: T.accent, color: T.textOnAccent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, marginTop: 1,
          }}>✓</span>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec, lineHeight: 1.45 }}>
            I agree to FitTrack's <u>Terms of Sale</u> and <u>Refund Policy</u>.
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1, fontWeight: 700, padding: '14px 16px', whiteSpace: 'nowrap' }}>
          Pay $85.32 · Apple Pay
        </Button>
      </div>
    </div>
  );
}

function CheckoutGameplan({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Checkout" right={null}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 110px' }}>
        <SectionLabel T={T}>Order</SectionLabel>
        <Card T={T} style={{ padding: '14px 16px', margin: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: T.radiusMd || 8,
              background: `linear-gradient(135deg, ${T.successFg} 0%, ${T.successBorder} 100%)`,
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700,
              color: T.surface, letterSpacing: '.04em',
            }}>90D</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.25 }}>
                First 90 Days
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec, marginTop: 2 }}>
                Adaptive · weekly check-ins
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <Chip T={T} tone="success" size="sm">Gameplan</Chip>
                <Chip T={T} tone="neutral" size="sm">Subscription</Chip>
                <Chip T={T} tone="neutral" size="sm">Cancel anytime</Chip>
              </div>
            </div>
          </div>
        </Card>

        <SectionLabel T={T}>Start date</SectionLabel>
        <StartDateRow T={T} value="Mon · May 4 · 2026"/>

        <SectionLabel T={T}>Included</SectionLabel>
        <Card T={T} style={{ padding: '6px 14px', margin: '0 16px' }}>
          {[
            'Weekly check-in + adaptive recommendations',
            'Wearable sync · sleep + recovery',
            'Adaptive macros + meal plans',
            'Planning Mode with audit trail',
            'All 7 themes',
          ].map((line, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${T.borderFaint}` : 'none',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 999, flexShrink: 0,
                background: T.successBg, color: T.successFg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>✓</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.text }}>{line}</span>
            </div>
          ))}
        </Card>

        <SectionLabel T={T}>Total</SectionLabel>
        <Card T={T} style={{ padding: '6px 14px 12px', margin: '0 16px' }}>
          <PriceLine T={T} label="Monthly" value="$19.00"/>
          <PriceLine T={T} label="First 7 days" value="Free" muted/>
          <PriceLine T={T} label="Due today" value="$0.00" bold/>
        </Card>

        <div style={{
          margin: '0 16px 6px',
          padding: '10px 12px',
          background: T.accentFaint,
          borderRadius: T.radiusMd || 8,
          fontFamily: T.fontBody, fontSize: 11.5, color: T.accent, lineHeight: 1.4,
        }}>
          $20.52/mo starts May 11. Cancel or pause in Settings → Billing.
        </div>

        <SectionLabel T={T}>Payment</SectionLabel>
        <div style={{ margin: '0 16px' }}>
          <PaymentRow T={T} glyph="" label="Apple Pay" sub="Touch ID required" selected/>
          <PaymentRow T={T} glyph="+" label="Add payment method"/>
        </div>

        <div style={{
          margin: '6px 16px',
          padding: '10px 12px',
          background: T.surfaceAlt,
          borderRadius: T.radiusMd || 8,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            background: T.accent, color: T.textOnAccent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, marginTop: 1,
          }}>✓</span>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textSec, lineHeight: 1.45 }}>
            I agree to FitTrack's <u>Subscription Terms</u>.
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Button T={T} kind="primary" size="lg" style={{ flex: 1, fontWeight: 700, padding: '14px 16px', whiteSpace: 'nowrap' }}>
          Start 7-day free trial
        </Button>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// 5.5a — Post-Purchase Welcome

function NextStepRow({ T, n, label, sub, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '13px 14px',
      borderBottom: `1px solid ${T.borderFaint}`,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
        background: accent ? T.accent : T.surfaceAlt,
        color: accent ? T.textOnAccent : T.textSec,
        border: accent ? 'none' : `1px solid ${T.borderFaint}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontData, fontSize: 12, fontWeight: 700,
      }}>{n}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{label}</div>
        {sub && (
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function QuickTipCard({ T, glyph, label, sub, dismissable }) {
  return (
    <Card T={T} style={{ padding: '11px 12px', position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{
        width: 28, height: 28, borderRadius: T.radiusSm || 4,
        background: T.accentFaint, color: T.accent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{glyph}</span>
      <div style={{ flex: 1, minWidth: 0, paddingRight: dismissable ? 18 : 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {dismissable && (
        <span style={{
          position: 'absolute', top: 8, right: 10,
          fontFamily: T.fontBody, fontSize: 14, color: T.textTer, cursor: 'pointer',
        }}>×</span>
      )}
    </Card>
  );
}

function WelcomeProgram({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: T.successBg,
        borderBottom: `1px solid ${T.successBorder}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          background: T.successFg, color: T.surface,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontBody, fontSize: 13, fontWeight: 700,
        }}>✓</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.successFg }}>
          Purchase confirmed.
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 130px' }}>
        <div style={{
          height: 180,
          background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentBorder} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.08) 12px 13px)`,
          }}/>
          <div style={{
            position: 'absolute', bottom: 14, left: 16, right: 16,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em',
                color: T.textOnAccent, opacity: .8, textTransform: 'uppercase', marginBottom: 4,
              }}>Program · 12 weeks</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, color: T.textOnAccent,
                lineHeight: 1.05, letterSpacing: '-.01em',
              }}>PPL<br/>Intermediate</div>
            </div>
            <span style={{
              padding: '5px 9px', borderRadius: 4,
              background: 'rgba(255,255,255,.18)', color: T.textOnAccent,
              fontFamily: T.fontData, fontSize: 10, letterSpacing: '.12em', fontWeight: 700,
            }}>OWNED</span>
          </div>
        </div>

        <SectionLabel T={T}>Next up</SectionLabel>
        <Card T={T} style={{ margin: '0 16px', padding: 0, overflow: 'hidden' }}>
          <NextStepRow T={T} n="1" accent
            label="Push A · Mon, May 4"
            sub="Bench, OHP, incline DB, lateral raise, tricep pushdown."
          />
          <NextStepRow T={T} n="2"
            label="6 frames saved to your library"
            sub="Ready to log any session."
          />
          <NextStepRow T={T} n="3"
            label="Macro targets unlocked"
            sub="Set your own in Nutrition."
          />
        </Card>

        <SectionLabel T={T} right="2 of 3 done">Setup</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <QuickTipCard T={T} glyph="⌚" label="Wearable sync"
            sub="Apple Health, Fitbit, Whoop." dismissable/>
          <QuickTipCard T={T} glyph="🔔" label="Workout reminders"
            sub="Default: 6:00 AM on training days." dismissable/>
          <QuickTipCard T={T} glyph="✎" label="Customize"
            sub="Change start date, schedule, or inputs anytime." dismissable/>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <Button T={T} kind="primary" size="lg" style={{ width: '100%', fontWeight: 700, padding: '14px 18px', whiteSpace: 'nowrap' }}>
          Go to my Program  →
        </Button>
      </div>
    </div>
  );
}

function WelcomeGameplan({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: T.successBg,
        borderBottom: `1px solid ${T.successBorder}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          background: T.successFg, color: T.surface,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontBody, fontSize: 13, fontWeight: 700,
        }}>✓</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.successFg }}>
          Trial active.
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 130px' }}>
        <div style={{
          height: 180,
          background: `linear-gradient(135deg, ${T.successFg} 0%, ${T.successBorder} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,.15) 0%, transparent 50%)`,
          }}/>
          <div style={{
            position: 'absolute', bottom: 14, left: 16, right: 16,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: T.fontData, fontSize: 10, letterSpacing: '.16em',
                color: T.surface, opacity: .9, textTransform: 'uppercase', marginBottom: 4,
              }}>Gameplan · 90 days</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, color: T.surface,
                lineHeight: 1.05, letterSpacing: '-.01em',
              }}>First<br/>90 Days</div>
            </div>
            <span style={{
              padding: '5px 9px', borderRadius: 4,
              background: 'rgba(255,255,255,.18)', color: T.surface,
              fontFamily: T.fontData, fontSize: 10, letterSpacing: '.12em', fontWeight: 700,
            }}>TRIAL · DAY 1</span>
          </div>
        </div>

        <SectionLabel T={T}>Next up</SectionLabel>
        <Card T={T} style={{ margin: '0 16px', padding: 0, overflow: 'hidden' }}>
          <NextStepRow T={T} n="1" accent
            label="Upper A · Mon, May 4"
            sub="Bench, row, OHP, pulldowns."
          />
          <NextStepRow T={T} n="2"
            label="Check-in · Sunday 7 PM"
            sub="5 minutes."
          />
          <NextStepRow T={T} n="3"
            label="Recommendations after check-in"
            sub="Macros, volume, lifestyle."
          />
        </Card>

        <SectionLabel T={T}>Setup</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <QuickTipCard T={T} glyph="⌚" label="Wearable sync"
            sub="Required for sleep-aware recommendations." dismissable/>
          <QuickTipCard T={T} glyph="🔔" label="Check-in reminder"
            sub="Default: Sunday 7:00 PM." dismissable/>
          <QuickTipCard T={T} glyph="✎" label="Customize"
            sub="Change start date, schedule, or inputs anytime." dismissable/>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <Button T={T} kind="primary" size="lg" style={{ width: '100%', fontWeight: 700, padding: '14px 18px', whiteSpace: 'nowrap' }}>
          Go to my Gameplan  →
        </Button>
      </div>
    </div>
  );
}

function WelcomeLoading({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: T.accentFaint,
        borderBottom: `1px solid ${T.accentBorder}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          border: `2px solid ${T.accent}`,
          borderTopColor: 'transparent',
        }}/>
        <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.accent }}>
          Setting up your program…
        </span>
      </div>

      <div style={{ flex: 1, padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentBorder} 100%)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 800,
          color: T.textOnAccent, letterSpacing: '.04em', marginBottom: 18,
        }}>PPL</div>

        <div style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.text, textAlign: 'center', marginBottom: 6 }}>
          Cloning your program
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSec, textAlign: 'center', lineHeight: 1.5, maxWidth: 320 }}>
          About 10 seconds.
        </div>

        <div style={{
          width: '100%', maxWidth: 320, marginTop: 28,
          height: 6, borderRadius: 999,
          background: T.surfaceAlt, overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '62%',
            background: T.accent, borderRadius: 999,
          }}/>
        </div>

        <div style={{ width: '100%', maxWidth: 320, marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Program structure', state: 'done' },
            { label: 'Customizations', state: 'done' },
            { label: 'Templates', state: 'active' },
            { label: 'Dashboard', state: 'pending' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 16, height: 16, borderRadius: 999, flexShrink: 0,
                background: s.state === 'done' ? T.successFg : s.state === 'active' ? T.accent : T.surfaceAlt,
                border: s.state === 'pending' ? `1px solid ${T.borderFaint}` : 'none',
                color: T.surface,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontBody, fontSize: 9, fontWeight: 700,
              }}>{s.state === 'done' ? '✓' : ''}</span>
              <span style={{
                fontFamily: T.fontBody, fontSize: 12.5,
                color: s.state === 'pending' ? T.textTer : T.text,
                fontWeight: s.state === 'active' ? 600 : 500,
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// 5.4 — Customize (post-purchase)
// Single screen, scrollable sections. Reachable from Tier Home and Planning Mode.
// Save commits changes; nothing about this screen feels destructive or final.

function CustomizeProgram({ T }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Header T={T} kind="sub" title="Customize" subtitle="PPL · Intermediate" right={null}/>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 100px' }}>
        {/* Start date */}
        <SectionLabel T={T}>Start date</SectionLabel>
        <div style={{ margin: '0 16px 4px' }}>
          <MiniCalendar T={T} selectedDay={4}/>
        </div>
        <div style={{ padding: '8px 16px 4px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
            <span key={d} style={{
              padding: '7px 12px',
              background: d === 'Mon' ? T.accent : T.surfaceAlt,
              color: d === 'Mon' ? T.textOnAccent : T.textSec,
              border: `1px solid ${d === 'Mon' ? T.accent : T.borderFaint}`,
              borderRadius: T.radiusMd || 8,
              fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
            }}>{d}</span>
          ))}
        </div>

        {/* Schedule */}
        <SectionLabel T={T} right="5 days · 2 rest">Training days</SectionLabel>
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {[
            { d: 'M', on: true,  label: 'Push' },
            { d: 'T', on: true,  label: 'Pull' },
            { d: 'W', on: false },
            { d: 'T', on: true,  label: 'Legs' },
            { d: 'F', on: true,  label: 'Push' },
            { d: 'S', on: true,  label: 'Pull' },
            { d: 'S', on: false },
          ].map((d, i) => (
            <div key={i} style={{
              aspectRatio: '0.72',
              background: d.on ? T.accentFaint : T.surfaceAlt,
              border: `1px solid ${d.on ? T.accentBorder : T.borderFaint}`,
              borderRadius: T.radiusMd || 8,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0 7px',
            }}>
              <span style={{ fontFamily: T.fontData, fontSize: 9, letterSpacing: '.12em', color: T.textTer, textTransform: 'uppercase' }}>{d.d}</span>
              {d.on ? (
                <>
                  <span style={{
                    width: 22, height: 22, borderRadius: 999,
                    background: T.accent, color: T.textOnAccent,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.fontBody, fontSize: 10, fontWeight: 700,
                  }}>✓</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 9, fontWeight: 700, color: T.accent, letterSpacing: '.04em' }}>{d.label}</span>
                </>
              ) : (
                <>
                  <span style={{ width: 22, height: 22, borderRadius: 999, border: `1.5px dashed ${T.borderFaint}` }}/>
                  <span style={{ fontFamily: T.fontBody, fontSize: 9, fontWeight: 600, color: T.textTer, letterSpacing: '.04em' }}>Rest</span>
                </>
              )}
            </div>
          ))}
        </div>

        <SectionLabel T={T}>Session length</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6 }}>
          {[
            { v: '45', on: false },
            { v: '60', on: true },
            { v: '75', on: false },
            { v: '90+', on: false },
          ].map((s) => (
            <span key={s.v} style={{
              flex: 1,
              padding: '10px 0',
              background: s.on ? T.accent : T.surfaceAlt,
              color: s.on ? T.textOnAccent : T.textSec,
              border: `1px solid ${s.on ? T.accent : T.borderFaint}`,
              borderRadius: T.radiusMd || 8,
              fontFamily: T.fontBody, fontSize: 13, fontWeight: 600,
              textAlign: 'center',
            }}>{s.v} <span style={{ fontSize: 10, opacity: .8 }}>min</span></span>
          ))}
        </div>

        {/* Inputs */}
        <SectionLabel T={T}>Inputs</SectionLabel>
        <Card T={T} style={{ padding: 0, overflow: 'hidden', margin: '0 16px' }}>
          {[
            { label: 'Bodyweight', value: '187 lb' },
            { label: 'Squat 1RM', value: '315 lb' },
            { label: 'Bench 1RM', value: '245 lb' },
            { label: 'Deadlift 1RM', value: '405 lb' },
            { label: 'Injuries', value: 'Right shoulder' },
          ].map((r, i, arr) => (
            <div key={i} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.borderFaint}` : 'none' }}>
              <FieldRow T={T} {...r}/>
            </div>
          ))}
        </Card>

        {/* Reset */}
        <SectionLabel T={T}>Reset</SectionLabel>
        <Card T={T} style={{ margin: '0 16px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Restart program</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>Keep history. Replan from week 1.</div>
          </div>
          <Button T={T} kind="secondary" size="sm" style={{ whiteSpace: 'nowrap' }}>Restart</Button>
        </Card>
      </div>

      {/* Save footer */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 14px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Button T={T} kind="secondary" size="md" style={{ whiteSpace: 'nowrap' }}>Cancel</Button>
        <Button T={T} kind="primary" size="md" style={{ flex: 1, whiteSpace: 'nowrap' }}>Save</Button>
      </div>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────────────────
Object.assign(window, {
  CheckoutProgram,
  CheckoutGameplan,
  WelcomeProgram,
  WelcomeGameplan,
  WelcomeLoading,
  CustomizeProgram,
});
