// settings-screens.jsx
// Cluster 6 — Settings
//   6.1  Settings Home        — profile header + grouped routing list
//   6.3  Sync & Storage       — Logger differentiator; synced/paused/conflict/offline
//   6.4  Integrations         — wearable/health providers, connected vs disconnected
//   6.7  Billing              — subscription + owned programs + receipts
//   6.7a Cancel Subscription  — clickable 5-step flow (reason → pause → credit → confirm → done)
//   6.8  Cancellation Info    — static factual explainer
//
// Reuses shared primitives from tier-homes-screens.jsx (Header, Card, Button,
// Chip, Stamp, ErrorBanner) — already on window from the host load order.
// Tokens come from useFitTrackTheme(theme) via the T prop.

const { useState: useS6 } = React;

// ════════════════════════════════════════════════════════════════════════
// Local primitives

// Abstract glyph language matches the BottomNav set (◉ ◐ ◔ …) — restrained,
// not skeuomorphic. One square tile per row.
function Tile({ T, glyph, tone = 'neutral', size = 30 }) {
  const map = {
    neutral: { bg: T.surfaceAlt, fg: T.textSec, br: T.borderFaint },
    accent:  { bg: T.accentFaint, fg: T.accent, br: T.accentBorder },
    success: { bg: T.successBg, fg: T.success, br: T.successBorder },
    warn:    { bg: T.warnBg, fg: T.warn, br: T.warnBorder },
    danger:  { bg: T.dangerBg, fg: T.danger, br: T.dangerBorder },
  };
  const c = map[tone] || map.neutral;
  return (
    <span style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: T.radiusMd || 6,
      background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.fontDisplay, fontSize: size * 0.46, fontWeight: 700, lineHeight: 1,
    }}>{glyph}</span>
  );
}

// iOS-style switch — visual state only.
function Toggle({ T, on }) {
  return (
    <span style={{
      width: 42, height: 25, flexShrink: 0, borderRadius: 999,
      background: on ? T.accent : T.surfaceAlt,
      border: `1px solid ${on ? T.accent : T.border}`,
      position: 'relative', transition: 'background .15s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2,
        width: 19, height: 19, borderRadius: 999,
        background: on ? T.textOnAccent : T.surface,
        boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .15s',
      }}/>
    </span>
  );
}

function S6Label({ T, children, right }) {
  return (
    <div className="ft-on-bg" style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '18px 16px 7px',
    }}>
      <div style={{
        fontFamily: T.fontData, fontSize: 10, fontWeight: 700,
        color: T.textOnBg || T.text, letterSpacing: '.12em', textTransform: 'uppercase',
      }}>{children}</div>
      {right && (
        <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textOnBgTer || T.textTer, letterSpacing: '.04em' }}>{right}</span>
      )}
    </div>
  );
}

// A grouped card of rows with hairline dividers between them.
function Group({ T, children }) {
  const items = React.Children.toArray(children);
  return (
    <div style={{ padding: '0 16px' }}>
      <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
        {items.map((child, i) => (
          <div key={i} style={{ borderTop: i ? `1px solid ${T.borderFaint}` : 'none' }}>{child}</div>
        ))}
      </Card>
    </div>
  );
}

// One list row. right can be: a value string, a node, or omitted (→ chevron).
function Row({ T, glyph, tone, label, sub, value, right, chevron = true, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', cursor: onClick ? 'pointer' : 'default',
    }}>
      {glyph && <Tile T={T} glyph={glyph} tone={tone}/>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {value != null && (
        <span style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textSec, letterSpacing: '.02em', whiteSpace: 'nowrap', flexShrink: 0 }}>{value}</span>
      )}
      {right != null && right}
      {chevron && right == null && (
        <span style={{ fontFamily: T.fontBody, fontSize: 18, color: T.textTer, flexShrink: 0, lineHeight: 1 }}>›</span>
      )}
    </div>
  );
}

function S6Screen({ T, title, children, pad = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', paddingBottom: pad ? 28 : 0 }}>
      <Header T={T} kind="sub" title={title} right={null}/>
      {children}
    </div>
  );
}

// Horizontal usage meter built from weighted segments.
function Meter({ T, segments, height = 10 }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div style={{
      display: 'flex', height, width: '100%', borderRadius: 999, overflow: 'hidden',
      background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`,
    }}>
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${(s.value / total) * 100}%`, background: s.color }}/>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.1 — SETTINGS HOME

function SettingsHome({ T, tier = 'gameplan' }) {
  const tierMeta = {
    logger:   { name: 'Logger',   tone: 'neutral', sub: 'Free' },
    program:  { name: 'Program',  tone: 'accent',  sub: 'Owns 3 programs' },
    gameplan: { name: 'Gameplan', tone: 'accent',  sub: '$14/mo · renews Jun 12' },
  }[tier];

  return (
    <S6Screen T={T} title="Settings">
      {/* Profile card */}
      <div style={{ padding: '4px 16px 0' }}>
        <Card T={T} raised style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 52, height: 52, flexShrink: 0, borderRadius: 999,
            background: T.accent, color: T.textOnAccent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, letterSpacing: '-.02em',
          }}>AM</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1.15, letterSpacing: '-.01em' }}>Alex Mercer</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>alex.mercer@gmail.com</div>
            <div style={{ marginTop: 7 }}>
              <Chip T={T} tone={tierMeta.tone} size="sm">{tierMeta.name}</Chip>
            </div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 18, color: T.textTer, flexShrink: 0 }}>›</span>
        </Card>
      </div>

      <S6Label T={T}>Account</S6Label>
      <Group T={T}>
        <Row T={T} glyph="◍" label="Account" sub="Email · linked sign-ins" onClick={() => {}}/>
        <Row T={T} glyph="⟳" label="Sync & Storage" value="Synced" onClick={() => {}}/>
        <Row T={T} glyph="⧉" label="Integrations" value="2 connected" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Preferences</S6Label>
      <Group T={T}>
        <Row T={T} glyph="⊜" label="Units & Preferences" value="lb · mi" onClick={() => {}}/>
        <Row T={T} glyph="◐" label="Theme" value="Iron & Chalk" onClick={() => {}}/>
        <Row T={T} glyph="◔" label="Notifications" sub="Check-in reminder · Sun 6:00 PM" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Plan</S6Label>
      <Group T={T}>
        <Row T={T} glyph="◈" tone="accent" label="Billing" sub={tierMeta.sub} onClick={() => {}}/>
        {tier !== 'gameplan' && (
          <Row T={T} glyph="↗" tone="accent" label="Upgrade options" sub="Compare tiers" onClick={() => {}}/>
        )}
      </Group>

      <S6Label T={T}>Data</S6Label>
      <Group T={T}>
        <Row T={T} glyph="⤓" label="Data Export" sub="CSV · JSON" onClick={() => {}}/>
        <Row T={T} glyph="⚙" label="Advanced" sub="Custom builds · debug" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>About</S6Label>
      <Group T={T}>
        <Row T={T} glyph="ⓘ" label="About" value="v2.0.4" onClick={() => {}}/>
        <Row T={T} label="Help & feedback" onClick={() => {}}/>
        <Row T={T} label="Sign out" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.danger }}>Sign out</span>
        } onClick={() => {}}/>
      </Group>

      <div style={{ padding: '18px 16px 0', textAlign: 'center' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textOnBgTer || T.textTer, letterSpacing: '.08em' }}>FITTRACK 2.0.4 · BUILD 1182</div>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.3 — SYNC & STORAGE   (state: synced | paused | conflict | offline)

function SyncStorage({ T, state = 'synced' }) {
  const status = {
    synced:   { tone: 'success', dot: T.success, label: 'Synced', detail: 'Last synced 2 min ago', glyph: '✓' },
    paused:   { tone: 'warn',    dot: T.warn,    label: 'Paused',  detail: 'Last synced 2 hours ago', glyph: '‖' },
    conflict: { tone: 'danger',  dot: T.danger,  label: 'Conflict', detail: '3 entries differ between devices', glyph: '!' },
    offline:  { tone: 'neutral', dot: T.textTer, label: 'Offline', detail: 'Saving locally · will sync on reconnect', glyph: '⤬' },
  }[state];

  return (
    <S6Screen T={T} title="Sync & Storage">
      {state === 'conflict' && (
        <ErrorBanner T={T}
          title="3 workouts differ between devices"
          body="Edited on two devices while offline. Pick which version to keep."
          action="Resolve"/>
      )}

      {/* Status card */}
      <div style={{ padding: '4px 16px 0' }}>
        <Card T={T} raised style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tile T={T} glyph={status.glyph} tone={status.tone} size={40}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: status.dot }}/>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>{status.label}</span>
              </div>
              <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 3, letterSpacing: '.02em' }}>{status.detail}</div>
            </div>
            {state !== 'synced' && (
              <Button T={T} kind="secondary" size="sm">{state === 'paused' ? 'Resume' : state === 'offline' ? 'Retry' : 'Resolve'}</Button>
            )}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderFaint}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: T.radiusSm || 4, background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, color: T.textSec }}>D</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>Google Drive</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>alex.mercer@gmail.com</div>
            </div>
            <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.accent, fontWeight: 700 }}>Switch</span>
          </div>
        </Card>
      </div>

      {state === 'conflict' && (
        <>
          <S6Label T={T} right="3 items">Conflicts</S6Label>
          <Group T={T}>
            {[['Upper · Push', 'This device · 52 min', 'iPad · 48 min'],
              ['Lower · Heavy', 'This device · 61 min', 'iPad · 60 min'],
              ['Pull · Volume', 'This device · 44 min', 'iPad · 41 min']].map((c, i) => (
              <div key={i} style={{ padding: '12px 14px' }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>{c[0]}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '8px 10px', textAlign: 'left', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 6, cursor: 'pointer' }}>
                    <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>Keep local</div>
                    <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.text, marginTop: 2 }}>{c[1].split(' · ')[1]}</div>
                  </button>
                  <button style={{ flex: 1, padding: '8px 10px', textAlign: 'left', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 6, cursor: 'pointer' }}>
                    <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>Keep Drive</div>
                    <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.text, marginTop: 2 }}>{c[2].split(' · ')[1]}</div>
                  </button>
                </div>
              </div>
            ))}
          </Group>
        </>
      )}

      <S6Label T={T}>Sync</S6Label>
      <Group T={T}>
        <Row T={T} label="Drive sync" sub="Back up logs to your Drive" chevron={false} right={<Toggle T={T} on={state !== 'paused'}/>}/>
        <Row T={T} label="Sync on cellular" sub="Off saves mobile data" chevron={false} right={<Toggle T={T} on={false}/>}/>
        <Row T={T} label="Auto-backup" sub="Daily snapshot · keep 30" chevron={false} right={<Toggle T={T} on={true}/>}/>
      </Group>

      <S6Label T={T} right="1.2 GB of 15 GB">Storage</S6Label>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '14px 16px' }}>
          <Meter T={T} segments={[
            { value: 620, color: T.accent },
            { value: 410, color: T.push },
            { value: 170, color: T.borderStrong },
          ]}/>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 12 }}>
            {[['Workouts', '620 MB', T.accent], ['Photos', '410 MB', T.push], ['Cache', '170 MB', T.borderStrong]].map((s) => (
              <div key={s[0]} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s[2] }}/>
                <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textSec }}>{s[0]}</span>
                <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer }}>{s[1]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ padding: '10px 16px 0' }}>
        <Button T={T} kind="secondary" size="md" style={{ width: '100%' }}>Clear cache · 170 MB</Button>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.4 — INTEGRATIONS

const S6_PROVIDERS = [
  { id: 'apple',  name: 'Apple Health', mark: '✚', syncs: 'Steps · Weight · Heart rate', connected: true, last: '8 min ago', metrics: ['Steps', 'Body weight', 'Heart rate', 'Sleep'] },
  { id: 'fitbit', name: 'Fitbit',       mark: '◆', syncs: 'Sleep · Resting HR', connected: true, last: '1 hr ago', metrics: ['Sleep', 'Resting HR'] },
  { id: 'whoop',  name: 'Whoop',        mark: '◐', syncs: 'Recovery · Strain · Sleep', connected: false },
  { id: 'garmin', name: 'Garmin',       mark: '▲', syncs: 'Workouts · VO₂ max · HRV', connected: false },
  { id: 'strava', name: 'Strava',       mark: '◣', syncs: 'Runs · Rides · Routes', connected: false },
];

function IntegrationRow({ T, p, expanded }) {
  return (
    <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <span style={{
          width: 40, height: 40, flexShrink: 0, borderRadius: T.radiusMd || 8,
          background: p.connected ? T.accentFaint : T.surfaceAlt,
          color: p.connected ? T.accent : T.textTer,
          border: `1px solid ${p.connected ? T.accentBorder : T.borderFaint}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700,
        }}>{p.mark}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{p.name}</span>
            {p.connected && <Chip T={T} tone="success" size="sm">Connected</Chip>}
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.35 }}>{p.syncs}</div>
          {p.connected && <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, marginTop: 3, letterSpacing: '.04em' }}>Synced {p.last}</div>}
        </div>
        {p.connected ? (
          <Button T={T} kind="ghost" size="sm" style={{ color: T.danger }}>Disconnect</Button>
        ) : (
          <Button T={T} kind="primary" size="sm">Connect</Button>
        )}
      </div>
      {expanded && p.connected && (
        <div style={{ borderTop: `1px solid ${T.borderFaint}`, background: T.surfaceAlt, padding: '6px 16px 10px' }}>
          {p.metrics.map((m, i) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i ? `1px solid ${T.borderFaint}` : 'none' }}>
              <span style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.text }}>{m}</span>
              <Toggle T={T} on={i < 3}/>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Integrations({ T }) {
  return (
    <S6Screen T={T} title="Integrations">
      <S6Label T={T} right="2 connected">Connected</S6Label>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <IntegrationRow T={T} p={S6_PROVIDERS[0]} expanded/>
        <IntegrationRow T={T} p={S6_PROVIDERS[1]}/>
      </div>
      <S6Label T={T}>Available</S6Label>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {S6_PROVIDERS.slice(2).map((p) => <IntegrationRow key={p.id} T={T} p={p}/>)}
      </div>
      <div style={{ padding: '16px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer, lineHeight: 1.4 }}>
          Wearable data feeds the weekly check-in. Gameplan only.
        </div>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.7 — BILLING   (state: active | owned)

function Billing({ T, state = 'active' }) {
  const owned = [
    { name: 'PPL · Intermediate', date: 'Mar 2, 2026', price: '$39' },
    { name: 'Powerbuilder',       date: 'Nov 18, 2025', price: '$49' },
    { name: 'Full Body 3×',       date: 'Aug 4, 2025',  price: '$29' },
  ];
  const receipts = [
    { label: 'Gameplan · Monthly', date: 'May 12, 2026', amt: '$14.00' },
    { label: 'Gameplan · Monthly', date: 'Apr 12, 2026', amt: '$14.00' },
    { label: 'PPL · Intermediate', date: 'Mar 2, 2026',  amt: '$39.00' },
  ];

  return (
    <S6Screen T={T} title="Billing">
      {/* Subscription */}
      {state === 'active' ? (
        <div style={{ padding: '4px 16px 0' }}>
          <Card T={T} raised style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Tile T={T} glyph="◈" tone="accent" size={40}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>Gameplan</span>
                  <Chip T={T} tone="success" size="sm">Active</Chip>
                </div>
                <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textTer, marginTop: 3 }}>$14.00 / month · renews Jun 12, 2026</div>
              </div>
            </div>
            <div style={{ display: 'flex', borderTop: `1px solid ${T.borderFaint}` }}>
              <button style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', borderRight: `1px solid ${T.borderFaint}`, fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.accent, cursor: 'pointer' }}>Change plan</button>
              <button style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.textSec, cursor: 'pointer' }}>Cancel</button>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ padding: '4px 16px 0' }}>
          <Card T={T} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tile T={T} glyph="◈" size={40}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>No active subscription</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>You own 3 programs outright</div>
            </div>
            <Button T={T} kind="primary" size="sm">Browse Gameplans</Button>
          </Card>
        </div>
      )}

      {/* Payment method */}
      <S6Label T={T}>Payment method</S6Label>
      <Group T={T}>
        <Row T={T} glyph="▭" label="Visa" value="•••• 4242" right={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textSec }}>•••• 4242</span>
            <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, color: T.accent }}>Update</span>
          </span>
        }/>
      </Group>

      {/* Owned programs */}
      <S6Label T={T} right="3 owned">Owned programs</S6Label>
      <Group T={T}>
        {owned.map((o) => (
          <Row key={o.name} T={T}
            glyph={o.name.charAt(0)}
            label={o.name}
            sub={`Purchased ${o.date}`}
            chevron={false}
            right={<span style={{ fontFamily: T.fontData, fontSize: 12, fontWeight: 700, color: T.textSec }}>{o.price}</span>}/>
        ))}
      </Group>
      <div style={{ padding: '8px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer }}>One-time purchases · yours permanently</div>
      </div>

      {/* Receipts */}
      <S6Label T={T}>Receipts</S6Label>
      <Group T={T}>
        {receipts.map((r, i) => (
          <Row key={i} T={T}
            label={r.label}
            sub={r.date}
            chevron={false}
            right={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: T.fontData, fontSize: 12, fontWeight: 700, color: T.text }}>{r.amt}</span>
                <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.accent }}>⤓</span>
              </span>
            }/>
        ))}
      </Group>

      {state === 'active' && (
        <div style={{ padding: '20px 16px 0', textAlign: 'center' }} className="ft-on-bg">
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.danger, cursor: 'pointer' }}>Cancel subscription</span>
        </div>
      )}
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.7a — CANCEL SUBSCRIPTION  (clickable 5-step flow)
//   1 Reason · 2 Pause offer · 3 Credit reveal · 4 Confirm · 5 Done

const S6_REASONS = [
  'Too expensive',
  'Not using it enough',
  'Missing a feature',
  'Taking a break',
  'Switching apps',
  'Something else',
];

function CancelProgress({ T, step }) {
  // 4 working steps (the Done screen has no bar)
  return (
    <div style={{ display: 'flex', gap: 5, padding: '0 16px 4px' }}>
      {[1, 2, 3, 4].map((s) => (
        <span key={s} style={{
          flex: 1, height: 3, borderRadius: 999,
          background: s <= step ? T.accent : T.surfaceAlt,
        }}/>
      ))}
    </div>
  );
}

function CancelFlow({ T, initialStep = 1 }) {
  const [step, setStep] = useS6(initialStep);
  const [reason, setReason] = useS6(null);
  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onBgTer = T.textOnBgTer || T.textTer;

  // STEP 5 — Done
  if (step === 5) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Header T={T} kind="onb" title="" right={null}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px 40px', gap: 16 }}>
          <Tile T={T} glyph="✓" tone="success" size={64}/>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.textOnBg || T.text, letterSpacing: '-.01em' }} className="ft-on-bg">Subscription canceled</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgSec || T.textSec, marginTop: 6, lineHeight: 1.45, maxWidth: 280 }} className="ft-on-bg">Gameplan access stays on through Jun 12, 2026. Your owned programs and logs are untouched.</div>
          </div>
          <div style={{ width: '100%', maxWidth: 260, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            <Button T={T} kind="primary" size="lg">Back to Settings</Button>
            <Button T={T} kind="ghost" size="md" onClick={() => setStep(1)}>Reactivate Gameplan</Button>
          </div>
        </div>
      </div>
    );
  }

  const titles = { 1: 'Cancel Gameplan', 2: 'Pause instead', 3: 'Before you go', 4: 'Confirm cancel' };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: 92 }}>
      <Header T={T} kind="sub" title={titles[step]} subtitle={`Step ${step} of 4`} right={null}/>
      <CancelProgress T={T} step={step}/>

      {/* STEP 1 — Reason */}
      {step === 1 && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: onBgTer, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }} className="ft-on-bg">Reason for leaving</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {S6_REASONS.map((r) => {
              const on = reason === r;
              return (
                <button key={r} onClick={() => setReason(r)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  padding: '13px 14px', cursor: 'pointer',
                  background: on ? T.accentFaint : T.surface,
                  border: `1px solid ${on ? T.accent : T.border}`,
                  borderRadius: T.radiusMd || 8,
                }}>
                  <span style={{
                    width: 18, height: 18, flexShrink: 0, borderRadius: 999,
                    border: `2px solid ${on ? T.accent : T.border}`,
                    background: on ? T.accent : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on && <span style={{ width: 7, height: 7, borderRadius: 999, background: T.textOnAccent }}/>}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{r}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2 — Pause offer */}
      {step === 2 && (
        <div style={{ padding: '14px 16px 0' }}>
          <Card T={T} raised style={{ padding: '18px 16px', textAlign: 'center' }}>
            <Tile T={T} glyph="‖" tone="accent" size={48} />
            <div style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700, color: T.text, marginTop: 12, letterSpacing: '-.01em' }}>Pause, don't cancel</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, marginTop: 6, lineHeight: 1.45 }}>Keep your history and plan. Billing stops while paused.</div>
          </Card>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {['1 month', '2 months', '3 months'].map((d, i) => (
              <button key={d} style={{
                flex: 1, padding: '14px 0', cursor: 'pointer',
                background: i === 0 ? T.accentFaint : T.surface,
                border: `1px solid ${i === 0 ? T.accent : T.border}`,
                borderRadius: T.radiusMd || 8,
                fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, color: i === 0 ? T.accent : T.text,
              }}>{d}</button>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>Pause 1 month</Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Credit / loyalty reveal */}
      {step === 3 && (
        <div style={{ padding: '14px 16px 0' }}>
          <Card T={T} raised style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', gap: 14, textAlign: 'center', marginBottom: 16 }}>
              {[['4', 'MONTHS IN'], ['89%', 'ADHERENCE'], ['52', 'WORKOUTS']].map((s) => (
                <div key={s[1]} style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.fontData, fontSize: 24, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{s[0]}</div>
                  <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.1em', marginTop: 4 }}>{s[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 14px', background: T.accentFaint, border: `1px solid ${T.accentBorder}`, borderRadius: T.radiusMd || 8, textAlign: 'center' }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>30% off · 3 months</div>
              <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textSec, marginTop: 4 }}>$9.80 / month, then $14.00</div>
            </div>
          </Card>
          <div style={{ marginTop: 10 }}>
            <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>Keep Gameplan · 30% off</Button>
          </div>
        </div>
      )}

      {/* STEP 4 — Confirm (factual, no guilt) */}
      {step === 4 && (
        <div style={{ padding: '14px 16px 0' }}>
          <S6Label T={T}>What changes</S6Label>
          <Group T={T}>
            <Row T={T} glyph="⤬" tone="danger" label="Weekly adaptation stops" sub="No new check-ins or auto-tuning" chevron={false}/>
            <Row T={T} glyph="⤬" tone="danger" label="Recommendation feed ends" chevron={false}/>
          </Group>
          <S6Label T={T}>What you keep</S6Label>
          <Group T={T}>
            <Row T={T} glyph="✓" tone="success" label="3 owned programs" sub="Permanent" chevron={false}/>
            <Row T={T} glyph="✓" tone="success" label="All logged workouts & data" chevron={false}/>
            <Row T={T} glyph="✓" tone="success" label="Access through Jun 12, 2026" chevron={false}/>
          </Group>
        </div>
      )}

      {/* Sticky action bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 16px', background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`,
        display: 'flex', gap: 10,
      }}>
        {step > 1 && <Button T={T} kind="secondary" size="lg" onClick={back} style={{ flexShrink: 0 }}>Back</Button>}
        <Button T={T}
          kind={step === 4 ? 'primary' : 'ghost'}
          size="lg"
          onClick={next}
          style={step === 4
            ? { flex: 1, background: T.danger, borderColor: T.danger, color: T.textOnAccent }
            : { flex: 1, border: `1px solid ${T.border}`, color: T.textSec }}>
          {step === 4 ? 'Cancel subscription' : 'Continue cancellation'}
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.8 — CANCELLATION INFO  (static explainer)

function CancellationInfo({ T }) {
  return (
    <S6Screen T={T} title="Cancellation Info">
      <div style={{ padding: '6px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgSec || T.textSec, lineHeight: 1.5 }}>
          How cancellation works for each plan type.
        </div>
      </div>

      <S6Label T={T}>Gameplan subscription</S6Label>
      <Group T={T}>
        <Row T={T} glyph="◷" label="Access until period end" value="Jun 12" chevron={false}/>
        <Row T={T} glyph="⊘" label="No partial refunds" sub="Current month is not prorated" chevron={false}/>
        <Row T={T} glyph="⟳" label="Reactivate anytime" sub="Plan resumes where it left off" chevron={false}/>
      </Group>

      <S6Label T={T}>One-time programs</S6Label>
      <Group T={T}>
        <Row T={T} glyph="✓" tone="success" label="Yours permanently" sub="Owned programs never expire" chevron={false}/>
        <Row T={T} glyph="⊘" label="Non-refundable" sub="14-day window from purchase" chevron={false}/>
      </Group>

      <S6Label T={T}>Your data</S6Label>
      <Group T={T}>
        <Row T={T} glyph="✓" tone="success" label="Logs & history retained" chevron={false}/>
        <Row T={T} glyph="⤓" label="Export anytime" sub="CSV or JSON from Data Export" chevron={false}/>
        <Row T={T} glyph="⤬" tone="danger" label="Delete account to erase" sub="Permanent · removes everything" chevron={false}/>
      </Group>

      <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button T={T} kind="secondary" size="lg" style={{ width: '100%' }}>Contact support</Button>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Local primitives for the sub-pages (Seg toggle + DangerRow)

// Inline segmented control for binary/short choices (units, formats). Lives on
// a Card surface, so it uses the card tokens — not the on-bg tokens.
function Seg({ T, options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', flexShrink: 0,
      background: T.surfaceAlt, border: `1px solid ${T.border}`,
      borderRadius: T.radiusMd || 6, padding: 2, gap: 2,
    }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange && onChange(o.value)} style={{
            padding: '5px 11px', cursor: 'pointer', border: 'none',
            borderRadius: (T.radiusSm != null ? T.radiusSm : 4),
            background: on ? T.accent : 'transparent',
            color: on ? T.textOnAccent : T.textSec,
            fontFamily: T.fontData, fontSize: 11.5, fontWeight: 700,
            letterSpacing: '.02em', whiteSpace: 'nowrap',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.2 — ACCOUNT   (state: default | delete)
//   Magic-link auth (no password — matches the 1.3 sign-in design); linked
//   providers, profile fields as data, reversible-framed delete.

const S6_SIGNINS = [
  { id: 'email',  mark: '✉', name: 'Email', detail: 'alex.mercer@gmail.com', primary: true,  linked: true },
  { id: 'apple',  mark: '✚', name: 'Apple', detail: 'Linked Mar 2, 2026',     primary: false, linked: true },
  { id: 'google', mark: '◆', name: 'Google', detail: 'Not linked',            primary: false, linked: false },
];

function Account({ T, state = 'default' }) {
  const onBgSec = T.textOnBgSec || T.textSec;
  const onBgTer = T.textOnBgTer || T.textTer;

  if (state === 'delete') {
    return (
      <S6Screen T={T} title="Delete account">
        <div style={{ padding: '6px 16px 0' }} className="ft-on-bg">
          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: onBgSec, lineHeight: 1.5 }}>
            Removes your profile, logs, and owned programs. Export first if you want a copy.
          </div>
        </div>

        <S6Label T={T}>What gets erased</S6Label>
        <Group T={T}>
          <Row T={T} glyph="⤬" tone="danger" label="412 logged workouts" chevron={false}/>
          <Row T={T} glyph="⤬" tone="danger" label="3 owned programs" sub="No refund — purchases are non-transferable" chevron={false}/>
          <Row T={T} glyph="⤬" tone="danger" label="Body metrics & nutrition history" chevron={false}/>
          <Row T={T} glyph="⤬" tone="danger" label="Gameplan subscription" sub="Canceled immediately" chevron={false}/>
        </Group>

        <S6Label T={T}>Confirm</S6Label>
        <div style={{ padding: '0 16px' }}>
          <Card T={T} style={{ padding: '14px 16px' }}>
            <div style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7 }}>Type DELETE</div>
            <div style={{
              padding: '11px 13px', background: T.surfaceAlt, border: `1px solid ${T.border}`,
              borderRadius: T.radiusMd || 6, fontFamily: T.fontData, fontSize: 14, color: T.textTer, letterSpacing: '.18em',
            }}>DELETE</div>
          </Card>
        </div>

        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button T={T} kind="primary" size="lg" style={{ width: '100%', background: T.danger, borderColor: T.danger, color: T.textOnAccent }}>Delete account permanently</Button>
          <Button T={T} kind="secondary" size="lg" style={{ width: '100%' }}>Keep my account</Button>
        </div>
      </S6Screen>
    );
  }

  return (
    <S6Screen T={T} title="Account">
      {/* Editable profile */}
      <S6Label T={T}>Profile</S6Label>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} raised style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 56, height: 56, flexShrink: 0, borderRadius: 999,
              background: T.accent, color: T.textOnAccent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em',
            }}>AM</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>Alex Mercer</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer, marginTop: 2 }}>Member since Jan 2026</div>
            </div>
            <Button T={T} kind="secondary" size="sm">Change photo</Button>
          </div>
        </Card>
      </div>
      <Group T={T}>
        <Row T={T} label="Name" value="Alex Mercer"/>
        <Row T={T} label="Display handle" value="@alexm"/>
        <Row T={T} label="Reminder email" sub="Used for check-in reminders" value="alex.mercer@gmail.com"/>
      </Group>

      {/* Sign-in methods — magic-link, no password */}
      <S6Label T={T} right="Magic link">Sign-in methods</S6Label>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {S6_SIGNINS.map((s) => (
          <Card key={s.id} T={T} style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 38, height: 38, flexShrink: 0, borderRadius: T.radiusMd || 8,
              background: s.linked ? T.accentFaint : T.surfaceAlt,
              color: s.linked ? T.accent : T.textTer,
              border: `1px solid ${s.linked ? T.accentBorder : T.borderFaint}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700,
            }}>{s.mark}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.text }}>{s.name}</span>
                {s.primary && <Chip T={T} tone="accent" size="sm">Primary</Chip>}
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>{s.detail}</div>
            </div>
            <Button T={T} kind={s.linked ? 'ghost' : 'primary'} size="sm" style={s.linked && !s.primary ? { color: T.danger } : undefined}>
              {s.primary ? 'Change' : s.linked ? 'Unlink' : 'Link'}
            </Button>
          </Card>
        ))}
      </div>
      <div style={{ padding: '8px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: onBgTer, lineHeight: 1.4 }}>No password — sign in with a link or a linked provider.</div>
      </div>

      {/* Danger zone */}
      <S6Label T={T}>Account actions</S6Label>
      <Group T={T}>
        <Row T={T} glyph="⇲" label="Sign out" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.text }}>Sign out</span>
        } onClick={() => {}}/>
        <Row T={T} glyph="⤬" tone="danger" label="Delete account" sub="Erases everything · export first" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.danger }}>Delete</span>
        } onClick={() => {}}/>
      </Group>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.5 — UNITS & PREFERENCES

// A row whose right edge is a Seg control (label-left / control-right).
function SegRow({ T, label, sub, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.25 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2 }}>{sub}</div>}
      </div>
      <Seg T={T} options={options} value={value} onChange={onChange}/>
    </div>
  );
}

function UnitsPreferences({ T }) {
  const [u, setU] = useS6({
    weight: 'lb', distance: 'mi', body: 'in', energy: 'kcal',
    week: 'mon', clock: '12h', effort: 'rpe', plate: 'on',
  });
  const set = (k) => (v) => setU((p) => ({ ...p, [k]: v }));

  return (
    <S6Screen T={T} title="Units & Preferences">
      <S6Label T={T}>Units</S6Label>
      <Group T={T}>
        <SegRow T={T} label="Weight" value={u.weight} onChange={set('weight')}
          options={[{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }]}/>
        <SegRow T={T} label="Distance" value={u.distance} onChange={set('distance')}
          options={[{ value: 'mi', label: 'mi' }, { value: 'km', label: 'km' }]}/>
        <SegRow T={T} label="Body measurements" value={u.body} onChange={set('body')}
          options={[{ value: 'in', label: 'in' }, { value: 'cm', label: 'cm' }]}/>
        <SegRow T={T} label="Energy" value={u.energy} onChange={set('energy')}
          options={[{ value: 'kcal', label: 'kcal' }, { value: 'kj', label: 'kJ' }]}/>
      </Group>

      <S6Label T={T}>Calendar</S6Label>
      <Group T={T}>
        <SegRow T={T} label="Week starts" value={u.week} onChange={set('week')}
          options={[{ value: 'sun', label: 'Sun' }, { value: 'mon', label: 'Mon' }]}/>
        <SegRow T={T} label="Time format" value={u.clock} onChange={set('clock')}
          options={[{ value: '12h', label: '12h' }, { value: '24h', label: '24h' }]}/>
      </Group>

      <S6Label T={T}>Training defaults</S6Label>
      <Group T={T}>
        <SegRow T={T} label="Effort scale" sub="How sets are rated when logging" value={u.effort} onChange={set('effort')}
          options={[{ value: 'rpe', label: 'RPE' }, { value: 'rir', label: 'RIR' }]}/>
        <Row T={T} label="Default rest timer" value="2:00" onClick={() => {}}/>
        <Row T={T} label="Plate math" sub="Show plate breakdown per side" chevron={false} right={<Toggle T={T} on={u.plate === 'on'}/>}/>
        <Row T={T} label="Bar weight" value="45 lb" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Display</S6Label>
      <Group T={T}>
        <Row T={T} label="First day view" value="Today" onClick={() => {}}/>
        <Row T={T} label="Round plotted weights" sub="Nearest 2.5 lb on charts" chevron={false} right={<Toggle T={T} on={true}/>}/>
      </Group>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.6 — DATA EXPORT   (state: default | ready)

const S6_EXPORT_SETS = [
  { id: 'workouts', label: 'Workouts', count: '412 sessions', on: true },
  { id: 'nutrition', label: 'Nutrition', count: '180 days', on: true },
  { id: 'lifestyle', label: 'Lifestyle', count: '54 entries', on: true },
  { id: 'body', label: 'Body metrics', count: '96 weigh-ins', on: false },
  { id: 'programs', label: 'Programs', count: '3 owned', on: false },
];

function DataExport({ T, state = 'default' }) {
  const [fmt, setFmt] = useS6('csv');
  const [range, setRange] = useS6('all');

  return (
    <S6Screen T={T} title="Data Export">
      <S6Label T={T}>Format</S6Label>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '14px 16px' }}>
          <Seg T={T} value={fmt} onChange={setFmt}
            options={[{ value: 'csv', label: 'CSV' }, { value: 'json', label: 'JSON' }]}/>
          <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 10, lineHeight: 1.4 }}>
            {fmt === 'csv' ? 'One file per data type · opens in any spreadsheet.' : 'Single structured file · full nesting preserved.'}
          </div>
        </Card>
      </div>

      <S6Label T={T} right="3 selected">Include</S6Label>
      <Group T={T}>
        {S6_EXPORT_SETS.map((s) => (
          <Row key={s.id} T={T} label={s.label} value={s.count} chevron={false} right={<Toggle T={T} on={s.on}/>}/>
        ))}
      </Group>

      <S6Label T={T}>Range</S6Label>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '14px 16px' }}>
          <Seg T={T} value={range} onChange={setRange}
            options={[{ value: 'all', label: 'All time' }, { value: '12w', label: '12 weeks' }, { value: 'custom', label: 'Custom' }]}/>
          {range === 'custom' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[['From', 'Jan 1, 2026'], ['To', 'Jun 1, 2026']].map((d) => (
                <div key={d[0]} style={{ flex: 1, padding: '9px 11px', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 6 }}>
                  <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>{d[0]}</div>
                  <div style={{ fontFamily: T.fontData, fontSize: 12.5, color: T.text, marginTop: 2 }}>{d[1]}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {state === 'ready' && (
        <>
          <S6Label T={T} right="Ready">Latest export</S6Label>
          <div style={{ padding: '0 16px' }}>
            <Card T={T} raised style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tile T={T} glyph="⤓" tone="success" size={40}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>fittrack-export-jun1.zip</div>
                <div style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, marginTop: 2 }}>CSV · 3 sets · 2.4 MB · expires in 24h</div>
              </div>
              <Button T={T} kind="primary" size="sm">Download</Button>
            </Card>
          </div>
        </>
      )}

      <div style={{ padding: '16px 16px 0' }}>
        <Button T={T} kind="primary" size="lg" style={{ width: '100%' }}>
          {state === 'ready' ? 'Generate again' : 'Generate export'}
        </Button>
      </div>

      <S6Label T={T}>Recent</S6Label>
      <Group T={T}>
        {[['fittrack-export-may18.zip', 'May 18 · CSV · 2.2 MB'], ['workouts.json', 'Apr 30 · JSON · 0.9 MB']].map((r) => (
          <Row key={r[0]} T={T} label={r[0]} sub={r[1]} chevron={false} right={
            <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>⤓</span>
          }/>
        ))}
      </Group>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.9 — THEME PICKER (anytime)
//   Large faithful previews — each card renders a mini-screen in its OWN
//   theme tokens (via getFitTrackTheme) so the swatch reads true regardless
//   of the active theme. Interactive: tapping applies via onPick.

const S6_THEME_BLURB = {
  iron:      'Stencil · chalk on steel',
  lab:       'Clean report · grid paper',
  notebook:  'Handwritten · margin notes',
  arcade:    'Pixel · neon cabinet',
  blueprint: 'Drafting · navy on cyan',
  cyberpunk: 'Wireframe · glow',
  graffiti:  'Marker · spray',
};

function ThemeSwatch({ id }) {
  const P = getFitTrackTheme(id);
  return (
    <div style={{
      width: 92, height: 60, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
      background: P.bg, border: `1px solid ${P.borderStrong || P.border}`,
      padding: 8, display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <span style={{ fontFamily: P.fontDisplay, fontSize: 16, fontWeight: 700, color: P.text, lineHeight: 1 }}>Aa</span>
      <div style={{
        flex: 1, background: P.surface, border: `1px solid ${P.borderFaint}`,
        borderRadius: P.radiusMd || 4, display: 'flex', alignItems: 'center', gap: 4, padding: '0 5px',
      }}>
        <span style={{ width: 14, height: 5, borderRadius: 999, background: P.accent }}/>
        <span style={{ width: 22, height: 5, borderRadius: 999, background: P.textTer }}/>
      </div>
    </div>
  );
}

function ThemePickerSettings({ T, value = 'iron', onPick }) {
  return (
    <S6Screen T={T} title="Theme">
      <div style={{ padding: '6px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textOnBgSec || T.textSec, lineHeight: 1.5 }}>
          Applies everywhere · change anytime.
        </div>
      </div>

      <S6Label T={T} right="7 themes">Appearance</S6Label>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {THEMES.map((th) => {
          const on = value === th.id;
          return (
            <Card key={th.id} T={T} raised={on} onClick={() => onPick && onPick(th.id)} style={{
              padding: '12px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              border: `${on ? 2 : 1}px solid ${on ? T.accent : (T.chrome === 'iron' || T.chrome === 'graffiti' ? T.border : T.borderFaint)}`,
            }}>
              <ThemeSwatch id={th.id}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 15.5, fontWeight: 700, color: T.text, letterSpacing: '-.01em', lineHeight: 1.15 }}>{th.name}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 3 }}>{S6_THEME_BLURB[th.id]}</div>
              </div>
              <span style={{
                width: 22, height: 22, flexShrink: 0, borderRadius: 999,
                border: `2px solid ${on ? T.accent : T.border}`,
                background: on ? T.accent : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: T.textOnAccent, fontSize: 12, fontWeight: 700,
              }}>{on ? '✓' : ''}</span>
            </Card>
          );
        })}
      </div>
      <div style={{ padding: '14px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer, lineHeight: 1.4 }}>
          Picked at sign-up · same set as the first-visit picker.
        </div>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.12 — UPGRADE OPTIONS   (funnel to the Shelf · tier-aware · never a gate)
// Reached from the Settings home "Upgrade options" row. A current-tier marker,
// the browse cards that route to the Shelf tabs, and a Compare-tiers handoff to
// 6.12a. Additive per tier: Logger sees both catalogs, Program leads with
// coaching (Gameplan) then more programs, Gameplan cross-sells other Gameplans.

const UO_BROWSE = {
  programs:  { label: 'Programs',  sub: 'One-time purchase · structured training blocks', glyph: '▤' },
  gameplans: { label: 'Gameplans', sub: 'Subscription · weekly check-ins + adaptive engine', glyph: '◆' },
};

function UOBrowseCard({ T, item, cta }) {
  return (
    <Card T={T} style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 13 }}>
      <Tile T={T} glyph={item.glyph} tone="accent" size={38}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>{item.label}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textTer, marginTop: 2, lineHeight: 1.35 }}>{item.sub}</div>
      </div>
      <Button T={T} kind="primary" size="sm" glyph="→">{cta}</Button>
    </Card>
  );
}

function UpgradeOptions({ T, tier = 'logger' }) {
  const meta = {
    logger:   { name: 'Logger',   sub: 'Free forever' },
    program:  { name: 'Program',  sub: '3 programs owned' },
    gameplan: { name: 'Gameplan', sub: '$14/mo · renews Jun 12' },
  }[tier];

  const browse =
    tier === 'logger'  ? ['programs', 'gameplans'] :
    tier === 'program' ? ['gameplans', 'programs'] :
                         ['gameplans'];

  return (
    <S6Screen T={T} title="Upgrade">
      {/* current tier marker */}
      <div style={{ padding: '4px 16px 0' }}>
        <Card T={T} raised style={{ padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stamp T={T}>Current tier</Stamp>
            <Chip T={T} tone="accent" size="sm">{meta.name}</Chip>
          </div>
          <div style={{ fontFamily: T.fontData, fontSize: 12.5, color: T.textSec, marginTop: 8, letterSpacing: '.02em' }}>{meta.sub}</div>
        </Card>
      </div>

      <S6Label T={T}>{tier === 'gameplan' ? 'Browse more' : 'Browse'}</S6Label>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {browse.map((k) => (
          <UOBrowseCard key={k} T={T} item={UO_BROWSE[k]}
            cta={tier === 'program' && k === 'gameplans' ? 'Add coaching' : 'Browse'}/>
        ))}
      </div>

      <S6Label T={T}>Compare</S6Label>
      <Group T={T}>
        <Row T={T} glyph="⊟" label="Compare tiers" sub="Feature-by-feature across all three" onClick={() => {}}/>
      </Group>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 6.10 — ADVANCED / DEBUG   ·   6.11 — ABOUT

function Advanced({ T }) {
  return (
    <S6Screen T={T} title="Advanced">
      <S6Label T={T}>Developer</S6Label>
      <Group T={T}>
        <Row T={T} label="Developer mode" sub="Show debug overlays" chevron={false} right={<Toggle T={T} on={false}/>}/>
        <Row T={T} label="Engine logs" sub="Verbose adaptation trace" chevron={false} right={<Toggle T={T} on={false}/>}/>
        <Row T={T} label="Beta features" value="2 on" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Diagnostics</S6Label>
      <Group T={T}>
        <Row T={T} label="Build" value="2.0.4 · 1182"/>
        <Row T={T} label="Device ID" value="A1F4-9C20"/>
        <Row T={T} label="Last sync token" value="·· e7b2"/>
        <Row T={T} glyph="⤓" label="Copy diagnostics" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.accent }}>Copy</span>
        } onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Reset</S6Label>
      <Group T={T}>
        <Row T={T} glyph="⟳" label="Rebuild local index" sub="Re-reads cached logs" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.text }}>Run</span>
        } onClick={() => {}}/>
        <Row T={T} glyph="⤬" tone="danger" label="Reset on-device data" sub="Re-downloads from Drive · logs kept" chevron={false} right={
          <span style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 700, color: T.danger }}>Reset</span>
        } onClick={() => {}}/>
      </Group>
    </S6Screen>
  );
}

function About({ T }) {
  return (
    <S6Screen T={T} title="About">
      <div style={{ padding: '14px 16px 4px', textAlign: 'center' }}>
        <span style={{
          width: 60, height: 60, borderRadius: T.radiusLg || 14, background: T.accent, color: T.textOnAccent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 700, letterSpacing: '-.02em',
        }}>F</span>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 19, fontWeight: 700, color: T.textOnBg || T.text, marginTop: 10, letterSpacing: '-.01em' }} className="ft-on-bg">FitTrack</div>
        <div style={{ fontFamily: T.fontData, fontSize: 11.5, color: T.textOnBgTer || T.textTer, marginTop: 3, letterSpacing: '.06em' }} className="ft-on-bg">VERSION 2.0.4 · BUILD 1182</div>
      </div>

      <S6Label T={T}>App</S6Label>
      <Group T={T}>
        <Row T={T} label="Version" value="2.0.4"/>
        <Row T={T} glyph="↑" tone="accent" label="Check for updates" sub="Up to date" chevron={false} right={
          <Chip T={T} tone="success" size="sm">Current</Chip>
        } onClick={() => {}}/>
        <Row T={T} label="What's new" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Legal</S6Label>
      <Group T={T}>
        <Row T={T} label="Terms of Service" onClick={() => {}}/>
        <Row T={T} label="Privacy Policy" onClick={() => {}}/>
        <Row T={T} label="Open-source licenses" onClick={() => {}}/>
        <Row T={T} label="Acknowledgements" onClick={() => {}}/>
      </Group>

      <S6Label T={T}>Support</S6Label>
      <Group T={T}>
        <Row T={T} glyph="✉" label="Contact support" value="help@fittrack.app" onClick={() => {}}/>
        <Row T={T} label="Rate FitTrack" onClick={() => {}}/>
      </Group>

      <div style={{ padding: '18px 16px 0', textAlign: 'center' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textOnBgTer || T.textTer, letterSpacing: '.08em' }}>© 2026 FITTRACK LABS</div>
      </div>
    </S6Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════

Object.assign(window, {
  SettingsHome, SyncStorage, Integrations, Billing, CancelFlow, CancellationInfo,
  Seg, Account, UnitsPreferences, DataExport, ThemePickerSettings, UpgradeOptions, Advanced, About,
});
