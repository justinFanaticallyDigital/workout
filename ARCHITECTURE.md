# FitTrack v2 — Architecture Contract

**Read this before writing any code.** These are non-negotiable structural rules. Every
recurring bug in this project came from violating one of them. The HTML prototypes encode
these rules; recreate the *rules*, not just the pixels.

This doc is the single source of truth for layout, theming, and shell composition. It is
lifted from the design team's working `CLAUDE.md` and adapted for implementation.

---

## 1. Theme system (7 themes, one token set)

Every surface renders in **7 themes** off one CSS custom-property system (`theme-tokens.css`,
mirrored by `theme-bridge.jsx` → a `T` token object passed to components):

`iron` · `lab` · `notebook` · `arcade` · `blueprint` · `cyberpunk` · `graffiti`
(plus `atompunk`, `steampunk`, `artdeco` in the token file as additional themes).

- Markup is **theme-agnostic**. Components read tokens (`T.bg`, `T.surface`, `T.text`,
  `T.accent`, …); per-theme chrome (fonts, borders, textures) lives in `data-theme` blocks.
- Test in the `lab` theme first, then **verify in `blueprint` (mandatory canary) + one dark
  theme (`iron` or `graffiti`)** before considering any surface done.

### The Blueprint contrast rule (the recurring bug)

Blueprint is the **only inverted theme**: the page background is *light*, but Cards are
*dark navy*. So text color depends on **where the element sits**:

- **Inside a `<Card>`** → use `T.text` / `T.textSec` / `T.textTer` / `T.accent`
  (white-on-navy, correct).
- **Directly on the page background** (titles, subtitles, labels, footnotes, step text —
  anything NOT inside a Card) → **MUST** use `T.textOnBg` / `T.textOnBgSec` / `T.textOnBgTer`
  (they auto-flip to navy on Blueprint) and the element should carry `className="ft-on-bg"`.
- **Never** put bare `T.accent`-colored text/fills on the page bg — accent is *white* on
  Blueprint → invisible. Use the on-bg accent tokens `T.accentOnBg` / `T.accentFaintOnBg` /
  `T.accentBorderOnBg`, or pass the `onBg` prop to primitives that support it
  (`Chip onBg`, `Stepper onBg`).
- Prefer the `Header` / `SectionLabel` primitives for on-bg chrome — they already handle this.
  A raw `<div>` on the page bg with `color: T.text` is invisible on Blueprint and fine
  everywhere else, which is exactly why it slips through review. **When in doubt, put content
  on a `<Card>` surface.**

---

## 2. One pillar shell, mandatory: `PillarShell` (`pillar-rail.jsx`)

The three bottom-shell pillars — **Training / Nutrition / Lifestyle** — carry a themed,
collapsible in-pillar **side-rail**. Every pillar screen, across **every tier (logger,
program, gameplan)**, renders through:

```jsx
<PillarShell T pillar tier activeKey railMode onSetRailMode
             header={…} nav={…}>
  {content}
</PillarShell>
```

- **NEVER hand-roll** the `Header → [rail | scroll] → BottomNav` tree inside a screen, and
  never write a per-cluster copy of it. (The old `ProgramPillarShell` / inline-logger /
  gameplan-`ScreenShell` divergence is the exact bug this prevents — gameplan once shipped
  with no rail at all because there was no single shell to be out of compliance with.)
- `PillarShell` owns the layout, the Rail/Chip switch, and locked-slot rendering. `tier`
  drives the locks via `railItemsForTier(pillar, tier, activeKey)`.
- Rail slots are **positionally identical** across pillars: Today / This-{Block|Week} /
  {Program|Model|Routine} / Gameplan. Tier-locked slots render **dimmed + lock badge,
  never hidden.**
- **Two modes:**
  - **Rail** — a single labelled column (~76px), icon over an auto-fit label (`railLabelFont`
    steps the font down for slots longer than "Gameplan").
  - **Chip** — no side rail; a sticky `PillarRailChip` at the top of the scroll area names the
    active slot and opens the rail; content runs full-width.
  - The rail's bottom **Hide** button drops Rail→Chip; tapping the chip restores the rail.
    Binary, no cycling. Mirrored by a `railMode` tweak (`rail` / `chip`).
- The rail/chip is a **surface** (`T.surface`) → inside it use the normal card tokens, *not*
  the on-bg tokens. (The chip's sticky bar sits on the page bg, so its backdrop uses `T.bg`.)
- Pass cluster-specific chrome through props: `header` (a tier-homes `<Header/>`, or
  gameplan's `<StatusStrip/>`), optional `decoration` (a z-0 bg layer), `bg`, `contentPad`.
- **Pillar switching (Training/Nutrition/Lifestyle) belongs to the BottomNav.** The rail
  switches L2 slots *within* a pillar. **Never** duplicate the pillar switch as an in-content
  tab strip (gameplan's old `SubTabs` was that mistake).
- Adding a new pillar surface = write the **content** and hand it to `PillarShell`; the
  rail/chip, theming, and `railMode` tweak come for free.

---

## 3. One bottom shell, mandatory: `BottomNav` (`tier-homes-screens.jsx`)

There is exactly **ONE** bottom nav. It is the five-slot **pillar** shell:

```
[1] Gameplan/Program/Workouts (tier-labelled) · [2] Training · [3] +Log (FAB) · [4] Nutrition · [5] Lifestyle
```

- Slot 1's label and slot 5's lock follow `tier` (`BottomNav({ T, tier, activeSlot })`).
- **The bottom nav NEVER contains Progress or Settings.** Those are not pillars — they are
  reached from the Gameplan/home slot (slot 1) and from the gear icon, not the nav.
- The string `gameplan · progress · +log · nutrition · settings` is the **OLD WRONG shell**
  and must never reappear. (It was duplicated three times across now-deleted adapters.)
- **Inject the nav via the phone shell's `navSlot`** (a per-cluster `NavSlot`/`GPNav` helper).
  Screens do not render their own nav.
- A non-pillar surface (Progress, Check-in, Recommendations, History) sits on slot 1.

---

## 4. Collapsing header

`PillarShell` auto-collapses its header once content scrolls (clones the header with a
`collapsed` prop; hysteresis at 28/8px).

- Any header handed to `PillarShell` **MUST honour `collapsed`** by shrinking to a compact
  one-line bar. Tier-homes `<Header collapsed>` drops the logo + subtitle and shrinks the
  title; gameplan `<StatusStrip collapsed>` drops the spray underline / big day-count /
  week bar for a single `name · week · ACTIVE · days` row.
- Hosts can force the state for preview via the `headerMode` tweak (`auto` / `expanded` /
  `collapsed`) wired to `window.setPillarHeaderCollapse`. Default `auto`.
- **Never ship a tall sticky header with no collapse path.**

---

## 5. Shared primitives (`tier-homes-screens.jsx`)

All screens are built from a small primitive set — match this vocabulary, do not invent
parallel components:

`Header` · `Card` · `Button` · `Chip` · `Stamp` · `SectionLabel` · `Stepper` · `BottomNav`.

- Phone width **410px**; content uses absolute fill below the **44px** status bar.
- Buttons are verbs, labels are nouns (see copy rules below).

---

## 6. Copy rules (product voice)

- **No marketing prose.** No "we'll", "you can", "feel free to", "most people".
- **Headers are labels, not questions.** "Training days" — not "Which days will you train?"
- **Drop instructional paragraphs.** The UI explains itself.
- **Field hints only when functional** (e.g. "Optional — used for reminders"). Never
  persuasive or reassuring.
- **Labels are nouns. Buttons are verbs.**
- **Prefer data over prose** — show the number, the date, the value.
- **One idea per line.**

---

## 7. Flow rules

- **Customization is never a gate on purchase.** Anything beyond start-date can move to
  post-purchase.
- **Default to "start now"** (next Monday or today). Don't make the user pick if they don't care.
- **Everything is reversible post-purchase** — re-customize, restart, swap program. Surface
  these in Tier Home / Planning Mode, not behind warnings.
- **Don't dramatize commitment.** No "this is a serious edit" / "are you sure" framing on
  routine actions.
- **Locked tiers preview, never gate.** Locked slots/cards render dimmed with a lock badge and
  one factual upsell line — never a blocking modal.
