// admin-screens-2.jsx
// Cluster 7 — Admin · screens (part 2 of 2)
//   7.3   Upload Spreadsheet   — flow root (dropzone + recent + format link)
//   7.3a-f Upload sub-steps    — clickable 6-step flow
//   7.4   Format Reference     — column spec doc
//   7.6   Version History      — diff + rollback
//   7.7   Asset Uploads        — dropzone + asset grid
//   7.8   Analytics            — stat tiles + charts

const { useState: useAdmin2 } = React;

// ════════════════════════════════════════════════════════════════════════
// 7.3 — UPLOAD SPREADSHEET (root)

function UploadRoot({ T }) {
  return (
    <AdminScreen T={T} title="Upload" eyebrow="ADMIN · IMPORT">
      <Dropzone T={T} title="Drop a program spreadsheet"
        sub="Or choose a file to import. Each upload becomes a parse job."
        formats=".XLSX · .CSV · .GSHEET — MAX 5 MB"/>

      <div style={{ padding: '12px 16px 0' }}>
        <Card T={T} onClick={() => {}} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 17, color: T.accent }}>⌗</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Format reference</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>Required columns · example rows · download template</div>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>›</span>
        </Card>
      </div>

      <AdminLabel T={T} right="Last 3">Recent uploads</AdminLabel>
      <AdminGroup T={T}>
        <GRow T={T} glyph="✓" tone="success" label="Hypertrophy Block 4.xlsx" sub="84 rows · published to staging" value="2h"/>
        <GRow T={T} glyph="!" tone="warn" label="5×5 Strength.csv" sub="3 warnings · needs review" value="3d"/>
        <GRow T={T} glyph="⤬" tone="danger" label="cut-carve.xlsx" sub="Parse failed · bad header row" value="5d"/>
      </AdminGroup>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.3a–f — UPLOAD FLOW (clickable)
//   1 Parse · 2 Resolve · 3 New exercise · 4 Preview · 5 Warnings · 6 Publish

const UF_TITLES = {
  1: 'Parsing', 2: 'Resolve exercises', 3: 'New exercise',
  4: 'Preview', 5: 'Warnings', 6: 'Publish',
};

function UploadFlow({ T, initialStep = 1 }) {
  const [step, setStep] = useAdmin2(initialStep);
  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const onBgTer = T.textOnBgTer || T.textTer;

  const cta = {
    1: 'Continue', 2: 'Continue', 3: 'Add exercise & continue',
    4: 'Looks right', 5: 'Continue anyway', 6: 'Publish to staging',
  }[step];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingBottom: 92 }}>
      <AdminTopBar T={T} title={UF_TITLES[step]} eyebrow={`IMPORT · STEP ${step} OF 6`} onBack={back}/>
      <StepDots T={T} total={6} step={step}/>

      {/* file chip */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, borderRadius: T.radiusMd || 6 }}>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 14, color: T.textSec }}>▤</span>
          <span style={{ flex: 1, fontFamily: T.fontData, fontSize: 11.5, color: T.text }}>Hypertrophy-Block-4.xlsx</span>
          <span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer }}>84 rows</span>
        </div>
      </div>

      {/* STEP 1 — Parse summary */}
      {step === 1 && (
        <div style={{ padding: '14px 16px 0' }}>
          <Card T={T} raised style={{ padding: '18px 16px', textAlign: 'center' }}>
            <span style={{
              width: 48, height: 48, borderRadius: 999, margin: '0 auto',
              background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700,
            }}>✓</span>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.text, marginTop: 12, letterSpacing: '-.01em' }}>Parsed cleanly</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textSec, marginTop: 4 }}>84 rows read · header row detected</div>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
            <StatTile T={T} value="3" label="Weeks"/>
            <StatTile T={T} value="18" label="Sessions"/>
            <StatTile T={T} value="42" label="Exercises" tone="accent"/>
          </div>
        </div>
      )}

      {/* STEP 2 — Resolve exercises */}
      {step === 2 && (
        <>
          <AdminLabel T={T} right="42 referenced">Matched to library</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} glyph="✓" tone="success" label="39 matched exactly" sub="Linked to existing library entries"/>
            <GRow T={T} glyph="~" tone="warn" label="2 fuzzy matches" sub="“DB Bench” → Dumbbell Bench Press" value="Review" mono={false}/>
            <GRow T={T} glyph="?" tone="danger" label="1 not found" sub="“Spoto Press” has no entry" value="Resolve" mono={false}/>
          </AdminGroup>
          <AdminLabel T={T}>Needs a decision</AdminLabel>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Card T={T} style={{ padding: '12px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: T.fontData, fontSize: 12, color: T.text }}>“Spoto Press”</span>
                <Chip T={T} tone="danger" size="sm">No match</Chip>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button T={T} kind="secondary" size="sm" style={{ flex: 1 }}>Map to existing</Button>
                <Button T={T} kind="primary" size="sm" style={{ flex: 1 }}>Create new →</Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* STEP 3 — New exercise */}
      {step === 3 && (
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Field T={T} label="Name" value="Spoto Press"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field T={T} label="Group" value="Push" suffix="▾"/>
            <Field T={T} label="Primary" value="Chest" suffix="▾"/>
          </div>
          <Field T={T} label="Equipment" value="Barbell · Bench" suffix="▾"/>
          <Field T={T} label="Aliases" value="paused bench, spoto" hint="Comma-separated · used for future fuzzy matching"/>
          <div>
            <div style={{ fontFamily: T.fontData, fontSize: 10, fontWeight: 700, color: T.textTer, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7 }}>Demo asset</div>
            <div style={{ padding: '16px', border: `1.5px dashed ${T.border}`, borderRadius: T.radiusMd || 6, textAlign: 'center', background: T.surfaceAlt }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textTer }}>Optional · add later from Assets</div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — Preview structure */}
      {step === 4 && (
        <>
          <AdminLabel T={T} right="3 weeks">Program preview</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} glyph="W1" tone="accent" label="Week 1 · Accumulation" sub="6 sessions · 42 sets" chevron/>
            <GRow T={T} glyph="W2" label="Week 2 · Accumulation" sub="6 sessions · 44 sets" chevron/>
            <GRow T={T} glyph="W3" label="Week 3 · Deload" sub="6 sessions · 30 sets" chevron/>
          </AdminGroup>
          <AdminLabel T={T}>Week 1 · Day 1 · Push</AdminLabel>
          <AdminGroup T={T}>
            <GRow T={T} label="Barbell Bench Press" value="4 × 6 @ 80%" />
            <GRow T={T} label="Overhead Press" value="3 × 8 @ 70%" />
            <GRow T={T} label="Incline DB Press" value="3 × 10" />
            <GRow T={T} label="Spoto Press" value="3 × 8" right={<Chip T={T} tone="accent" size="sm">New</Chip>}/>
          </AdminGroup>
        </>
      )}

      {/* STEP 5 — Warnings (non-blocking) */}
      {step === 5 && (
        <>
          <div style={{ padding: '8px 16px 0' }}>
            <ErrorBanner T={T} title="3 warnings · none blocking"
              body="You can publish as-is or fix the source spreadsheet and re-upload."/>
          </div>
          <AdminGroup T={T} style={{ paddingTop: 4 }}>
            <GRow T={T} glyph="!" tone="warn" label="Week 3 missing %1RM" sub="Rows 61–66 · will fall back to RPE"/>
            <GRow T={T} glyph="!" tone="warn" label="Day 4 has no rest target" sub="Row 78 · defaults to 90s"/>
            <GRow T={T} glyph="!" tone="warn" label="Duplicate session name" sub="“Pull B” appears twice in week 2"/>
          </AdminGroup>
          <div style={{ padding: '12px 16px 0' }}>
            <Button T={T} kind="secondary" size="md" style={{ width: '100%' }}>Download warning report</Button>
          </div>
        </>
      )}

      {/* STEP 6 — Publish */}
      {step === 6 && (
        <div style={{ padding: '14px 16px 0' }}>
          <AdminLabel T={T}>Destination</AdminLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'staging', label: 'Staging', sub: 'Review before it goes live', on: true },
              { id: 'live', label: 'Publish live', sub: 'Visible in the shelf immediately', on: false },
            ].map((o) => (
              <button key={o.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '13px 14px', cursor: 'pointer',
                background: o.on ? T.accentFaint : T.surface,
                border: `1px solid ${o.on ? T.accent : T.border}`, borderRadius: T.radiusMd || 8,
              }}>
                <span style={{
                  width: 18, height: 18, flexShrink: 0, borderRadius: 999,
                  border: `2px solid ${o.on ? T.accent : T.border}`, background: o.on ? T.accent : 'transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{o.on && <span style={{ width: 7, height: 7, borderRadius: 999, background: T.textOnAccent }}/>}</span>
                <div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 13.5, fontWeight: 600, color: T.text }}>{o.label}</div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, marginTop: 1 }}>{o.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Field T={T} label="Saves as" value="Hypertrophy Block 4 · v1" suffix="program"/>
          </div>
        </div>
      )}

      {/* sticky bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 16px', background: T.surface,
        borderTop: `1px solid ${T.borderFaint}`, display: 'flex', gap: 10,
      }}>
        {step > 1 && <Button T={T} kind="secondary" size="lg" onClick={back} style={{ flexShrink: 0 }}>Back</Button>}
        <Button T={T} kind="primary" size="lg" onClick={next} style={{ flex: 1 }}>
          {step === 6 ? cta : <>{cta} →</>}
        </Button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.4 — FORMAT REFERENCE

const FORMAT_COLS = [
  { col: 'week', req: true, ex: '1', note: 'Integer · block grouping' },
  { col: 'day', req: true, ex: 'Push A', note: 'Session label' },
  { col: 'exercise', req: true, ex: 'Bench Press', note: 'Matched to library' },
  { col: 'sets', req: true, ex: '4', note: 'Integer' },
  { col: 'reps', req: true, ex: '6', note: 'Int or range 6-8' },
  { col: 'load', req: false, ex: '80%', note: '%1RM · kg · RPE' },
  { col: 'rest', req: false, ex: '120', note: 'Seconds · default 90' },
  { col: 'notes', req: false, ex: 'paused', note: 'Free text · optional' },
];

function FormatReference({ T }) {
  return (
    <AdminScreen T={T} title="Format reference" eyebrow="UPLOAD · DOC"
      footer={<Button T={T} kind="primary" size="lg" style={{ flex: 1 }}>⤓ Download .xlsx template</Button>}>
      <div style={{ padding: '6px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, color: T.textOnBgSec || T.textSec, lineHeight: 1.5 }}>
          One row per set-group. First row is the header. Column order is flexible; names must match.
        </div>
      </div>

      <AdminLabel T={T} right="5 required · 3 optional">Columns</AdminLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
          {FORMAT_COLS.map((c, i) => (
            <div key={c.col} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderTop: i ? `1px solid ${T.borderFaint}` : 'none' }}>
              <span style={{ fontFamily: T.fontData, fontSize: 12, fontWeight: 700, color: T.text, width: 74, flexShrink: 0 }}>{c.col}</span>
              <span style={{ flexShrink: 0 }}>
                <Chip T={T} tone={c.req ? 'accent' : 'neutral'} size="sm">{c.req ? 'req' : 'opt'}</Chip>
              </span>
              <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.textTer, flex: 1, lineHeight: 1.3 }}>{c.note}</span>
            </div>
          ))}
        </Card>
      </div>

      <AdminLabel T={T}>Example rows</AdminLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '12px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, fontFamily: T.fontData, fontSize: 11, color: T.textSec, lineHeight: 1.7, letterSpacing: '.01em' }}>
{`week  day      exercise        sets reps load
1     Push A   Bench Press     4    6    80%
1     Push A   Overhead Press  3    8    70%
1     Pull A   Pendlay Row     4    6    -
2     Push A   Bench Press     4    5    82%`}
          </pre>
        </Card>
      </div>

      <AdminLabel T={T}>Rules</AdminLabel>
      <AdminGroup T={T}>
        <GRow T={T} glyph="·" label="Blank load → falls back to RPE 8" chevron={false}/>
        <GRow T={T} glyph="·" label="Reps accept ranges (6-8) or AMRAP" chevron={false}/>
        <GRow T={T} glyph="·" label="Unknown exercises prompt create-new" chevron={false}/>
      </AdminGroup>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.6 — VERSION HISTORY (diff + rollback)

function DiffLine({ T, kind, label, from, to }) {
  const c = { add: T.success, del: T.danger, chg: T.warn }[kind];
  const sign = { add: '+', del: '−', chg: '~' }[kind];
  const bg = { add: T.successBg, del: T.dangerBg, chg: T.warnBg }[kind];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: bg }}>
      <span style={{ fontFamily: T.fontData, fontSize: 13, fontWeight: 700, color: c, width: 12, flexShrink: 0, textAlign: 'center' }}>{sign}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 12.5, fontWeight: 600, color: T.text }}>{label}</div>
        {(from || to) && (
          <div style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textTer, marginTop: 2 }}>
            {from && <span style={{ textDecoration: 'line-through' }}>{from}</span>}
            {from && to && <span> → </span>}
            {to && <span style={{ color: T.text }}>{to}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function VersionHistory({ T }) {
  return (
    <AdminScreen T={T} title="PPL · Intermediate" eyebrow="VERSIONS · DIFF"
      footer={
        <>
          <AdminGhostBtn T={T}>Export diff</AdminGhostBtn>
          <Button T={T} kind="secondary" size="lg" style={{ flex: 1, color: T.warn, borderColor: T.warnBorder }}>Restore v3</Button>
        </>
      }>
      {/* version selector */}
      <div style={{ padding: '4px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, padding: '9px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusMd || 6 }}>
          <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>Base</div>
          <div style={{ fontFamily: T.fontData, fontSize: 12.5, fontWeight: 700, color: T.text, marginTop: 2 }}>v3 · Jan 14</div>
        </div>
        <span style={{ fontFamily: T.fontBody, fontSize: 16, color: T.textTer }}>→</span>
        <div style={{ flex: 1, padding: '9px 12px', background: T.accentFaint, border: `1px solid ${T.accentBorder}`, borderRadius: T.radiusMd || 6 }}>
          <div style={{ fontFamily: T.fontData, fontSize: 9, color: T.accent, letterSpacing: '.1em', textTransform: 'uppercase' }}>Current</div>
          <div style={{ fontFamily: T.fontData, fontSize: 12.5, fontWeight: 700, color: T.text, marginTop: 2 }}>v4 · Mar 2</div>
        </div>
      </div>

      {/* change summary */}
      <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatTile T={T} value="+6" label="Added" tone="accent"/>
        <StatTile T={T} value="4" unit="chg" label="Changed"/>
        <StatTile T={T} value="−2" label="Removed"/>
      </div>

      <AdminLabel T={T} right="12 changes">Diff</AdminLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: 0, overflow: 'hidden' }}>
          {[
            ['add', 'Block 4 · Peak added', null, 'Weeks 10–12'],
            ['chg', 'Bench Press · Week 1', '4 × 5', '4 × 6'],
            ['chg', 'Overhead Press · load', '65%', '70%'],
            ['add', 'Spoto Press added', null, 'Day 1 · 3 × 8'],
            ['del', 'Smith Press removed', 'Day 1', null],
            ['chg', 'Program length', '9 wk', '12 wk'],
            ['del', 'Cardio finisher removed', 'Day 3', null],
          ].map((d, i) => (
            <div key={i} style={{ borderTop: i ? `1px solid ${T.borderFaint}` : 'none' }}>
              <DiffLine T={T} kind={d[0]} label={d[1]} from={d[2]} to={d[3]}/>
            </div>
          ))}
        </Card>
      </div>
      <div style={{ padding: '16px 16px 0' }} className="ft-on-bg">
        <div style={{ fontFamily: T.fontBody, fontSize: 11.5, color: T.textOnBgTer || T.textTer, lineHeight: 1.4 }}>
          Restore loads v3 as a draft. Live stays on v4 until you publish.
        </div>
      </div>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.7 — ASSET UPLOADS

const ASSET_KINDS = [
  { id: 'all', label: 'All', count: 1240 },
  { id: 'covers', label: 'Covers', count: 86 },
  { id: 'demos', label: 'Demos', count: 1102 },
  { id: 'icons', label: 'Icons', count: 52 },
];

function AssetTile({ T, label, kind, used }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{
        aspectRatio: '1 / 1', borderRadius: T.radiusMd || 6, overflow: 'hidden',
        background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* striped placeholder — real thumbnail dropped here at handoff */}
        <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <pattern id={`s-${label}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill={T.surfaceAlt}/>
              <rect width="4" height="8" fill={T.borderFaint}/>
            </pattern>
          </defs>
          <rect width="80" height="80" fill={`url(#s-${label})`}/>
        </svg>
        <span style={{ position: 'relative', fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: T.textTer }}>
          {kind === 'demo' ? '▷' : '▦'}
        </span>
        {!used && (
          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 999, background: T.warn }}/>
        )}
      </div>
      <div style={{ fontFamily: T.fontData, fontSize: 9.5, color: T.textTer, letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
    </div>
  );
}

function AssetUploads({ T }) {
  return (
    <AdminScreen T={T} title="Assets" eyebrow="ADMIN · MEDIA"
      right={<AdminGhostBtn T={T} glyph="⤒" tone="accent">Upload</AdminGhostBtn>}>
      <div style={{ padding: '4px 16px 0' }}>
        <div style={{ padding: '16px', borderRadius: T.radiusLg || 8, border: `1.5px dashed ${T.border}`, background: T.surfaceAlt, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 999, background: T.accentFaint, color: T.accent, border: `1px solid ${T.accentBorder}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700 }}>⤒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.text }}>Drop images or video</div>
            <div style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, marginTop: 2, letterSpacing: '.04em' }}>JPG · PNG · MP4 · MAX 20 MB</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {ASSET_KINDS.map((k, i) => (
          <span key={k.id} style={{
            flexShrink: 0, padding: '6px 11px', borderRadius: 999,
            background: i === 0 ? T.accent : T.surfaceAlt,
            border: `1px solid ${i === 0 ? T.accent : T.borderFaint}`,
            color: i === 0 ? T.textOnAccent : T.textSec,
            fontFamily: T.fontBody, fontSize: 12, fontWeight: 700,
          }}>{k.label} <span style={{ opacity: .7, fontFamily: T.fontData, fontSize: 10 }}>{k.count}</span></span>
        ))}
      </div>

      <AdminLabel T={T} right="1 unused">Recent</AdminLabel>
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <AssetTile T={T} label="ppl-cover.jpg" kind="cover" used/>
        <AssetTile T={T} label="bench.mp4" kind="demo" used/>
        <AssetTile T={T} label="squat.mp4" kind="demo" used/>
        <AssetTile T={T} label="rdl.mp4" kind="demo" used/>
        <AssetTile T={T} label="spoto.mp4" kind="demo"/>
        <AssetTile T={T} label="row.mp4" kind="demo" used/>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <Card T={T} style={{ padding: '13px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: T.fontData, fontSize: 10, color: T.textTer, letterSpacing: '.1em', textTransform: 'uppercase' }}>Storage</span>
            <span style={{ fontFamily: T.fontData, fontSize: 11, color: T.textSec }}>8.4 of 50 GB</span>
          </div>
          <div style={{ marginTop: 9, height: 8, borderRadius: 999, background: T.surfaceAlt, border: `1px solid ${T.borderFaint}`, overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', width: '17%', background: T.accent }}/>
          </div>
        </Card>
      </div>
    </AdminScreen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 7.8 — ANALYTICS

function AnalyticsScreen({ T }) {
  return (
    <AdminScreen T={T} title="Analytics" eyebrow="ADMIN · LAST 30 DAYS"
      right={<span style={{ fontFamily: T.fontData, fontSize: 10.5, color: T.textOnBgTer || T.textTer, letterSpacing: '.06em' }} className="ft-on-bg">30 D ▾</span>}>

      <div style={{ padding: '4px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile T={T} value="1,284" label="Active users" delta={{ dir: 'up', text: '12% vs prev' }} tone="accent"/>
        <StatTile T={T} value="312" label="Enrollments" delta={{ dir: 'up', text: '8%' }}/>
        <StatTile T={T} value="$18.2k" label="Revenue" delta={{ dir: 'up', text: '5%' }}/>
        <StatTile T={T} value="71" unit="%" label="Avg adherence" delta={{ dir: 'down', text: '2%' }}/>
      </div>

      <AdminLabel T={T} right="Enrollments / wk">Trend</AdminLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '16px 14px 12px' }}>
          <ColumnChart T={T} data={[
            { k: 'W1', v: 48 }, { k: 'W2', v: 62 }, { k: 'W3', v: 55 },
            { k: 'W4', v: 78 }, { k: 'W5', v: 71 }, { k: 'W6', v: 92, hi: true },
          ]}/>
        </Card>
      </div>

      <AdminLabel T={T} right="By enrollments">Top programs</AdminLabel>
      <div style={{ padding: '0 16px' }}>
        <Card T={T} style={{ padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          <BarRow T={T} label="PPL · Intermediate" value={92} max={92} sub="92" color={T.accent}/>
          <BarRow T={T} label="Lean Recomp" value={74} max={92} sub="74" color={T.push}/>
          <BarRow T={T} label="Powerbuilder" value={61} max={92} sub="61" color={T.pull}/>
          <BarRow T={T} label="Full Body 3×" value={38} max={92} sub="38" color={T.core}/>
          <BarRow T={T} label="Strength Engine" value={29} max={92} sub="29" color={T.legs}/>
        </Card>
      </div>

      <AdminLabel T={T}>Completion</AdminLabel>
      <AdminGroup T={T}>
        <GRow T={T} label="Started, still active" value="64%"/>
        <GRow T={T} label="Completed a full block" value="41%"/>
        <GRow T={T} label="Churned before week 2" value="11%"/>
      </AdminGroup>
    </AdminScreen>
  );
}

Object.assign(window, {
  UploadRoot, UploadFlow, FormatReference, VersionHistory, AssetUploads, AnalyticsScreen,
});
