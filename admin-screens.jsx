// admin-screens.jsx
// Cluster 7 — Admin · screens (part 1 of 2)
//   7.1  Admin Dashboard       — card-grid entry + at-a-glance counts
//   7.2  Library Management    — Programs / Gameplans / Exercises tabs
//   7.2a Library Item Edit     — Metadata / Content / Versions tabs
//   7.5  Staging Library       — filtered 7.2 view (status = staging)
//
// Primitives from admin-kit.jsx + the shared kit (Card/Button/Chip/Stamp).

const { useState: useAdmin1 } = React;

// ════════════════════════════════════════════════════════════════════════
// 7.1 — ADMIN DASHBOARD

const ADMIN_ENTRIES = [
  { id: 'library',   glyph: '▤', title: 'Library',     sub: '342 items',   tone: 'accent' },
  { id: 'upload',    glyph: '⤒', title: 'Upload',      sub: 'Spreadsheet', tone: 'neutral' },
  { id: 'staging',   glyph: '◷', title: 'Staging',     sub: '7 pending',   tone: 'warn' },
  { id: 'assets',    glyph: '▦', title: 'Assets',      sub: '1.2k files',  tone: 'neutral' },
  { id: 'analytics', glyph: '◫', title: 'Analytics',   sub: 'Last 30 d',   tone: 'neutral' },
  { id: 'format',    glyph: '⌗', title: 'Format ref',  sub: 'Column spec', tone: 'neutral' },
];

function EntryCard({ T, e, onClick }) {
  const toneMap = {
    accent: { bg: T.accentFaint, fg: T.accent, br: T.accentBorder },
    warn: { bg: T.warnBg, fg: T.warn, br: T.warnBorder },
    neutral: { bg: T.surfaceAlt, fg: T.textSec, br: T.borderFaint },
  };
  const c = toneMap[e.tone] || toneMap.neutral;
  return (
    <Card T={T} onClick={onClick} style={{ padding: '14px 14px 15px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{
        width: 38, height: 38, borderRadius: T.radiusMd || 8,
        background: c.bg, color: c.fg, border: `1px solid ${c.br}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700,
      }}>{e.glyph}</span>
      <div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '-.01em', lineHeight: 1.15 }}>{e.title}</div>
        <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 3, letterSpacing: '.04em' }}>{e.sub}</div>
      </div>
    </Card>
  );
}

function AdminDashboard({ T }) {
  return (
    <AdminScreen T={T} title="Admin" eyebrow="ROLE · EDITOR" back={false}
      right={<span style={{
        width: 36, height: 36, borderRadius: 999, background: T.accent, color: T.textOnAccent,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700,
      }}>AM</span>}>

      {/* At-a-glance counts */}
      <div style={{ padding: '4px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatTile T={T} value="342" label="Live items" tone="accent"/>
        <StatTile T={T} value="7" label="In staging" delta={{ dir: 'up', text: '3 today' }}/>
        <StatTile T={T} value="2" label="Drafts"/>
      </div>

      <AdminLabel T={T}>Tools</AdminLabel>
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ADMIN_ENTRIES.map((e) => <EntryCard key={e.id} T={T} e={e}/>)}
      </div>

      {/* Recent activity */}
      <AdminLabel T={T} right="Last 7 days">Activity</AdminLabel>
      <AdminGroup T={T}>
        <GRow T={T} glyph="⤒" tone="accent" label="Hypertrophy Block 4 uploaded" sub="alex.m · parsed 84 rows" value="2h"/>
        <GRow T={T} glyph="✓" tone="success" label="Powerbuilder v3 published" sub="alex.m · live" value="1d"/>
        <GRow T={T} glyph="✎" label="Bench Press demo replaced" sub="jordan.k · asset" value="2d"/>
        <GRow T={T} glyph="◷" tone="warn" label="5×5 Strength sent to staging" sub="alex.m · review" value="3d"/>
      </AdminGroup>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.2 — LIBRARY MANAGEMENT   (tab: programs | gameplans | exercises)

const LIB_DATA = {
  programs: [
    { glyph: 'P', title: 'PPL · Intermediate', meta: '12 wk · Hypertrophy', version: 'v4', status: 'live' },
    { glyph: 'P', title: 'Powerbuilder',        meta: '16 wk · Recomp',     version: 'v3', status: 'live' },
    { glyph: 'F', title: 'Full Body 3×',        meta: '8 wk · Strength',    version: 'v2', status: 'live' },
    { glyph: 'H', title: '5×5 Strength',        meta: '12 wk · Strength',   version: 'v1', status: 'staging' },
    { glyph: 'B', title: 'Beginner Barbell',    meta: '6 wk · GPP',         version: 'v1', status: 'draft' },
    { glyph: 'D', title: 'DB Only Hypertrophy', meta: '10 wk · Home',       version: 'v2', status: 'archived' },
  ],
  gameplans: [
    { glyph: 'G', title: 'Lean Recomp',     meta: 'Adaptive · 12 wk', version: 'v5', status: 'live' },
    { glyph: 'G', title: 'Strength Engine', meta: 'Adaptive · 16 wk', version: 'v2', status: 'live' },
    { glyph: 'C', title: 'Cut & Carve',     meta: 'Adaptive · 8 wk',  version: 'v1', status: 'staging' },
    { glyph: 'M', title: 'Mass Builder',    meta: 'Adaptive · 14 wk', version: 'v3', status: 'live' },
  ],
  exercises: [
    { glyph: '↑', title: 'Barbell Bench Press', meta: 'Push · Chest', version: 'demo ✓', status: 'live' },
    { glyph: '↑', title: 'Back Squat',          meta: 'Legs · Quad',  version: 'demo ✓', status: 'live' },
    { glyph: '↑', title: 'Romanian Deadlift',   meta: 'Legs · Ham',   version: 'demo ✓', status: 'live' },
    { glyph: '↑', title: 'Cable Lateral Raise', meta: 'Push · Delt',  version: 'no demo', status: 'staging' },
    { glyph: '↑', title: 'Pendlay Row',         meta: 'Pull · Back',  version: 'demo ✓', status: 'live' },
  ],
};

function LibraryManagement({ T, initialTab = 'programs' }) {
  const [tab, setTab] = useAdmin1(initialTab);
  const rows = LIB_DATA[tab] || [];
  return (
    <AdminScreen T={T} title="Library"
      right={<AdminGhostBtn T={T} glyph="＋" tone="accent">New</AdminGhostBtn>}
      footer={
        <>
          <AdminGhostBtn T={T} glyph="⤒">Upload</AdminGhostBtn>
          <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>＋ New {tab === 'exercises' ? 'exercise' : tab.slice(0, -1)}</Button>
        </>
      }>
      <AdminTabs T={T} active={tab} onChange={setTab} items={[
        { id: 'programs',  label: 'Programs',  count: LIB_DATA.programs.length },
        { id: 'gameplans', label: 'Gameplans', count: LIB_DATA.gameplans.length },
        { id: 'exercises', label: 'Exercises', count: 367 },
      ]}/>

      <AdminSearch T={T} placeholder={`Search ${tab}…`}
        trailing={<span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.06em' }}>FILTER ▾</span>}/>

      <AdminLabel T={T} right={`${rows.length}${tab === 'exercises' ? ' of 367' : ''} shown`}>
        {tab === 'programs' ? 'All programs' : tab === 'gameplans' ? 'All gameplans' : 'Recent edits'}
      </AdminLabel>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <ItemRow key={i} T={T} glyph={r.glyph} title={r.title} meta={r.meta} version={r.version} status={r.status} onClick={() => {}}/>
        ))}
      </div>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.2a — LIBRARY ITEM EDIT   (tab: metadata | content | versions)

function ItemEditDetail({ T, initialTab = 'metadata' }) {
  const [tab, setTab] = useAdmin1(initialTab);
  return (
    <AdminScreen T={T} title="PPL · Intermediate" eyebrow="EDIT · PROGRAM"
      right={<StatusBadge T={T} status="live" size="sm"/>}
      footer={
        <>
          <AdminGhostBtn T={T}>Preview</AdminGhostBtn>
          <Button T={T} kind="secondary" size="lg" style={{ flex: 1 }}>Save draft</Button>
          <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Publish</Button>
        </>
      }>
      <AdminTabs T={T} active={tab} onChange={setTab} items={[
        { id: 'metadata', label: 'Metadata' },
        { id: 'content',  label: 'Content' },
        { id: 'versions', label: 'Versions' },
      ]}/>

      {tab === 'metadata' && (
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Field T={T} label="Title" value="PPL · Intermediate"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field T={T} label="Type" value="Program" suffix="▾"/>
            <Field T={T} label="Difficulty" value="Intermediate" suffix="▾"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field T={T} label="Length" value="12" suffix="weeks"/>
            <Field T={T} label="Price" value="39.00" suffix="USD"/>
          </div>
          <Field T={T} label="Summary" multiline
            value="Push / Pull / Legs split with linear progression across a 12-week hypertrophy block. Six sessions a week."/>
          <div>
            <div style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['hypertrophy', 'ppl', '6-day', 'barbell'].map((t) => <Chip key={t} T={T} tone="neutral" size="sm">{t}</Chip>)}
              <Chip T={T} tone="accent" size="sm">＋ add</Chip>
            </div>
          </div>
          <Field T={T} label="Cover asset" value="ppl-intermediate-cover.jpg" suffix="↻ replace" tone="accent"/>
        </div>
      )}

      {tab === 'content' && (
        <>
          <AdminLabel T={T} right="12 weeks · 4 blocks">Structure</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} glyph="1" tone="accent" label="Block 1 · Accumulation" sub="Weeks 1–3 · 6 sessions/wk" chevron/>
            <GRow T={T} glyph="2" tone="accent" label="Block 2 · Hypertrophy" sub="Weeks 4–6 · 6 sessions/wk" chevron/>
            <GRow T={T} glyph="3" label="Block 3 · Intensification" sub="Weeks 7–9 · 6 sessions/wk" chevron/>
            <GRow T={T} glyph="4" label="Block 4 · Peak" sub="Weeks 10–12 · 5 sessions/wk" chevron/>
          </AdminGroup>
          <AdminLabel T={T} right="84 total">Sessions</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} label="Day 1 · Push" sub="6 exercises · ~52 min" value="✎" mono={false}/>
            <GRow T={T} label="Day 2 · Pull" sub="6 exercises · ~48 min" value="✎" mono={false}/>
            <GRow T={T} label="Day 3 · Legs" sub="5 exercises · ~61 min" value="✎" mono={false}/>
          </AdminGroup>
          <div style={{ padding: '12px 16px 0' }}>
            <Button T={T} kind="secondary" size="md" style={{ width: '100%' }}>Re-upload from spreadsheet</Button>
          </div>
        </>
      )}

      {tab === 'versions' && (
        <>
          <AdminLabel T={T} right="4 versions">History</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} glyph="4" tone="accent" label="v4 · Current" sub="alex.m · Mar 2, 2026" right={<Chip T={T} tone="success" size="sm">Live</Chip>}/>
            <GRow T={T} glyph="3" label="v3" sub="alex.m · Jan 14, 2026" value="Restore" mono={false}/>
            <GRow T={T} glyph="2" label="v2" sub="jordan.k · Nov 3, 2025" value="Restore" mono={false}/>
            <GRow T={T} glyph="1" label="v1 · Initial" sub="alex.m · Aug 20, 2025" value="Restore" mono={false}/>
          </AdminGroup>
          <div style={{ padding: '12px 16px 0' }}>
            <Button T={T} kind="secondary" size="md" style={{ width: '100%' }}>Compare v4 → v3</Button>
          </div>
          <div style={{ padding: '16px 16px 0' }} className="ft-on-bg">
            <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer, lineHeight: 1.4 }}>
              Restoring loads the version as an editable draft. Live stays live until you publish.
            </div>
          </div>
        </>
      )}
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.5 — STAGING LIBRARY   (filtered 7.2 — status = staging)

const STAGING_ITEMS = [
  { glyph: 'H', title: '5×5 Strength',  meta: 'Program · 12 wk',   version: 'v1', status: 'staging', by: 'alex.m', when: '3d ago' },
  { glyph: 'C', title: 'Cut & Carve',   meta: 'Gameplan · 8 wk',   version: 'v1', status: 'staging', by: 'jordan.k', when: '1d ago' },
  { glyph: '↑', title: 'Cable Lateral Raise', meta: 'Exercise · Push', version: 'v1', status: 'staging', by: 'alex.m', when: '5h ago' },
  { glyph: 'Z', title: 'Zercher Complex', meta: 'Program · 4 wk',   version: 'v1', status: 'review', by: 'sam.t', when: '2d ago' },
];

function StagingLibrary({ T }) {
  return (
    <AdminScreen T={T} title="Staging" eyebrow="LIBRARY · FILTER"
      footer={
        <>
          <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textTer, flexShrink: 0 }}>2 selected</span>
          <Button T={T} kind="secondary" size="lg" style={{ flex: 1 }}>Reject</Button>
          <Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>Publish selected</Button>
        </>
      }>
      <div style={{ padding: '4px 16px 0' }}>
        <Card T={T} style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10, borderColor: T.warnBorder }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: T.warn, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>Not visible to users</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>Staged items go live only when published.</div>
          </div>
        </Card>
      </div>

      <AdminLabel T={T} right="4 pending">Awaiting publish</AdminLabel>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STAGING_ITEMS.map((r, i) => (
          <Card T={T} key={i} style={{ padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{
              width: 20, height: 20, flexShrink: 0, borderRadius: (T.radiusSm != null ? T.radiusSm : 4),
              border: `1.5px solid ${i < 2 ? T.accent : T.border}`,
              background: i < 2 ? T.accent : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: T.textOnAccent, fontSize: 12, fontWeight: 700,
            }}>{i < 2 ? '✓' : ''}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
              <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 3, letterSpacing: '.02em' }}>{r.meta} · {r.by} · {r.when}</div>
            </div>
            <StatusBadge T={T} status={r.status} size="sm"/>
          </Card>
        ))}
      </div>
    </AdminScreen>
  );
}

Object.assign(window, {
  AdminDashboard, LibraryManagement, ItemEditDetail, StagingLibrary,
});
