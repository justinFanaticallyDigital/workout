# Handoff: FitTrack v2 — UI Reskin & Wiring

## Overview

FitTrack v2 is a tiered fitness app (Logger → Program → Gameplan tiers, plus Settings and
Admin). This bundle is the **complete v2 design** — 7 clusters, ~68 themed screens — built as
high-fidelity, interactive HTML/React prototypes that render in **7 swappable visual themes**.

**The task:** the existing FitTrack app is functionally in place but visually primitive.
Recreate these designs in the existing codebase — **replace the current UI with this design
language and wire the new screens to the app's existing data and logic.** This is a *re-skin +
wiring* job, not a from-scratch product redesign. The product behavior, routes, and data model
shown here mirror what the app already does; the work is making the real app *look and behave*
like these prototypes.

---

## About the design files

The files in `prototypes/` are **design references created in HTML** — prototypes showing the
intended look and behavior. They are **not production code to copy directly.** They use React
via in-browser Babel and a CSS-custom-property theme system to demonstrate the design across
all themes in one file.

Recreate these designs in the **target codebase's existing environment** (its framework,
component library, routing, and state management), using its established patterns — not by
porting the Babel/JSX prototype wiring. Lift the **structure, tokens, layout, copy, and
interaction model**; implement them the app's way.

**Read `ARCHITECTURE.md` first.** It is the structural contract — the shell composition,
theme rules, and copy/flow rules that every screen depends on. Most past bugs came from
ignoring it. It is more important than any individual screen.

---

## Fidelity

**High-fidelity (hi-fi).** Final colors, typography, spacing, themed chrome, states, and
interactions are all specified in the prototypes. Recreate the UI **pixel-faithfully** using
the codebase's libraries — but honor the *architecture rules*, not just the rendered pixels
(e.g. one `PillarShell`, one `BottomNav` — see `ARCHITECTURE.md`).

---

## How to run the prototypes

Each `prototypes/Cluster N ….html` is self-contained and runnable in a browser — open it and
use the on-screen theme cycler to step through all 7 themes, and the Tweaks panel to toggle
states/variants. All cluster files share a flat folder of `.jsx` modules + `theme-tokens.css`;
keep them in the same directory.

---

## Cluster & screen inventory

Phone width **410px**. `(sheet)` = bottom sheet;

> **Route authority:** the route names in this section are the design team's working labels.
> Where they differ from `MIGRATION_MAP.md` (e.g. `/program` vs `/my-program`), **the
> migration map wins** — it's derived from the live repo + product spec. And where the map
> and the actual repo disagree about a *current* route, **the repo wins** (the map flags this
> rule itself). Treat the IDs/screens here as the inventory; treat the map as the routing +
> disposition authority.

`(middleware)` = no UI.

### Cluster 1 — Entry & Auth  (`Cluster 1 - Entry & Auth.html`)
Pre-tier-home screens, shared across tiers.

| ID | Screen | Route |
|----|--------|-------|
| 1.1 | App Open / Splash | (middleware) |
| 1.2 | Sign-in | `/signin` |
| 1.3 | Email Sign-up / Sign-in (magic-link, no password) | `/signin/email` |
| 1.4 | Theme Picker (first visit) | `/theme-picker` |
| 1.5 | Tier Landing | `/welcome` |
| 1.6 | Returning User Auto-Route | (middleware) |

### Cluster 2 — Logger Tier  (`Cluster 2 - Logger Tier.html`)
Free-tier surfaces.

| ID | Screen | Route |
|----|--------|-------|
| 2.1 | Workouts Library (Logger home) | `/library` |
| 2.2 | Training Tab (Logger) | `/training` |
| 2.3 | Exercise Detail | `/exercises/[id]` |
| 2.4 | Active Workout Logger | `/log/[workoutId]` |
| 2.5 | Save as Frame | (sheet on finish) |
| 2.6 | Workout History Detail | `/history/[id]` |
| 2.7 | Nutrition Tab (Logger) | `/nutrition` |
| 2.7a | Manual Macro Target Editor | (sheet) |
| 2.8 | Meal Logger | `/nutrition/log` |
| 2.9 | Lifestyle Tab (Logger preview) | `/lifestyle` |
| 2.10 | View-as-Gameplan Preview | `/library/preview-gameplan` |
| 2.11 | +Log Bottom Sheet | (sheet) |
| 2.12 | Stretch Timer | `/training/stretch` |
| 2.13 | HIIT / LISS / Class / Custom loggers | `/log/[type]` |
| 2.14 | Single Workout Library | `/log/library` |

### Cluster 3 — Program Tier  (`Cluster 3 - Program Tier.html`)
Unlocked at Program tier, on top of all Logger surfaces.

| ID | Screen | Route |
|----|--------|-------|
| 3.1 | My Program (Program home) | `/my-program` |
| 3.1a | Switch Active Program | (sheet) |
| 3.2 | Training Tab (Program) | `/training` |
| 3.3 | Nutrition Tab (Program) | `/nutrition` |
| 3.3a | Recipe Detail | `/nutrition/recipes/[id]` |
| 3.3b | Grocery List | `/nutrition/grocery` |
| 3.4 | Lifestyle Tab (Program) | `/lifestyle` |
| 3.5 | Planning Mode (Program) | `/program/[id]/planning` |
| 3.6 | Progress (Program) | `/progress` |
| 3.7 | Block / Day Detail Editor | `/blocks/[id]` |

### Cluster 4 — Gameplan Tier  (`Cluster 4 - Gameplan Tier.html`)
Unlocked at Gameplan tier, on top of Program surfaces.

| ID | Screen | Route |
|----|--------|-------|
| 4.1 | Gameplan Dashboard | `/gameplan` |
| 4.2 | Weekly Check-in | `/checkin` |
| 4.3 | Recommendations Feed | `/recommendations` |
| 4.4 | Planning Mode (Gameplan) | `/gameplan/[id]/planning` |
| 4.5 | Goals Editor | (in Planning Mode) |
| 4.6 | Progress (Gameplan, full) | `/progress` |
| 4.7 | Check-in Detail / History | `/progress/check-ins/[id]` |

### Cluster 5 — Universal Shelf  (`Cluster 5 - Universal Shelf.html`)
The marketing/purchase surface, reached from each tier's home.

| ID | Screen | Route |
|----|--------|-------|
| 5.1 | Shelf | `/shelf` |
| 5.2 | Card Detail Page | `/shelf/[type]/[slug]` |
| 5.3 | Side-by-side Compare | `/shelf/compare?ids=A,B` |
| 5.4 | Customize Wizard (6-step) | `/shelf/[type]/[slug]/customize` |
| 5.5 | Checkout | `/checkout` |
| 5.5a | Post-Purchase Welcome | `/welcome/[type]/[slug]` |
| 5.6 | Fallback Questionnaire (5-step) | (sheet from Shelf) |

### Cluster 6 — Settings  (`Cluster 6 - Settings.html`)
Universal top-right surface across all tiers. Home at `/settings` with grouped sub-routes
(`/settings/account`, `/settings/sync`, … ~14 screens) + folded-in Upgrade Options.

### Cluster 7 — Admin  (`Cluster 7 - Admin.html`)
Admin/back-office surfaces.

---

## Design tokens

The full token system is in `prototypes/theme-tokens.css`. **Do not invent colors** — derive
the app's theme tokens from this file.

**Token shape** (CSS custom properties, scoped via `data-theme`, exposed to components as a `T`
object by `theme-bridge.jsx`):

- Surfaces: `--ft-bg` (page), `--ft-surface` (card), `--ft-card` (elevated), `--ft-border`
- Text ramp: `--ft-muted` → `--ft-dim` → `--ft-light` → `--ft-pale` → `--ft-white` (foreground)
- Accent: `--ft-accent` (+ per-theme jewels: `--ft-cyan`, `--ft-coral`, `--ft-brass`, `--ft-jade`…)
- Muscle groups: `--ft-push / --ft-pull / --ft-legs / --ft-core`
- Semantic states: `--ft-success / --ft-warn / --ft-danger / --ft-info` (each with `-fg`, `-bg`, `-br`)
- Per-theme: `--ft-font-display / -data / -body`, `--ft-radius`, `--ft-card-border`

**Themes** (each defines the above): `iron` (warm dark / brass), `lab` (clean white / clinical
blue), `notebook` (cream / red margin), `arcade` (black / pink+cyan neon), `blueprint`
(**inverted** — light bg, dark navy cards), `cyberpunk` (navy / cyan glow), `graffiti`
(concrete / tape yellow), plus `atompunk`, `steampunk`, `artdeco`.

> ⚠️ **`blueprint` is inverted.** Foreground token usage depends on whether an element sits on
> a Card or on the page bg. See the Blueprint contrast rule in `ARCHITECTURE.md` — this is the
> single most common implementation bug.

Scale: phone width **410px**; status bar **44px**; min hit target **44px**.

---

## Recommended build sequence

Build **foundation first, then cluster by cluster.** Do not start at a screen — start at the
shell.

1. **Theme system** — port `theme-tokens.css` into the app's token system; build the `T`
   token bridge (`theme-bridge.jsx` is the reference). Get all themes switching on a throwaway
   page. **Stand up the Blueprint canary now** so the inversion rule is enforced from day one.
2. **Primitives** (`tier-homes-screens.jsx`) — `Header`, `Card`, `Button`, `Chip`, `Stamp`,
   `SectionLabel`, `Stepper`, and `BottomNav`. Verify each in lab + blueprint + iron.
3. **Shells** — `PillarShell` + `PillarRail` / `PillarRailChip` / `railItemsForTier`
   (`pillar-rail.jsx`), and the collapsing-header behavior. This is the spine of every pillar
   screen; get Rail↔Chip and locked-slot rendering right before building screens.
4. **Cluster 2 (Logger)** — the base tier; everything else is a superset. Build all pillar
   screens through `PillarShell`, all nav through `BottomNav`.
5. **Cluster 3 (Program)** then **Cluster 4 (Gameplan)** — additive tiers; reuse the same
   shells with `tier="program"` / `tier="gameplan"` to unlock rail slots.
6. **Cluster 5 (Shelf)**, **Cluster 1 (Entry/Auth)**, **Cluster 6 (Settings)**,
   **Cluster 7 (Admin)** — in whatever order fits the migration map.

**Acceptance for every screen:** renders correctly in `lab`, `blueprint` (canary), and one
dark theme; uses `PillarShell`/`BottomNav` (no hand-rolled shells); copy obeys the voice rules;
locked tiers preview rather than gate.

---

## Migration map

`MIGRATION_MAP.md` is the as-is → to-be mapping (existing screens/routes/components → the new
cluster that replaces them, what's kept/refactored/deprecated, and where each new screen gets
its data). It is the one thing the live repo doesn't make obvious — **read it alongside this
README and treat it as the authority on routing and disposition.** Its Part 5 is a live-repo
verification checklist to run before building.

### ⚠️ Highest-risk item: the Logger data-layer split

The map's biggest sleeper, called out here because it's *not* visible in the prototypes: the
current logger is **DB-backed**, but the new **Logger (free) tier writes locally** — localStorage
or a user-owned Google Drive file, never the database. Program/Gameplan tiers stay cloud-DB.
This is genuinely new storage wiring, not a reskin; the existing draft/offline-queue machinery
is the closest analog to extend. See `MIGRATION_MAP.md` §1.3–§1.4.

---

## Files in this bundle

```
design_handoff_fittrack_v2/
├── README.md                 ← this file
├── ARCHITECTURE.md           ← STRUCTURAL CONTRACT — read first
├── MIGRATION_MAP.md          ← as-is → to-be mapping (fill in)
├── prototypes/               ← runnable hi-fi design references
│   ├── Cluster 1–7 ….html    ← one file per cluster, all 7 themes + states
│   ├── theme-tokens.css      ← the theme token system (port this)
│   └── *.jsx                 ← shared kit + per-cluster screen modules
└── reference/
    ├── FitTrack v2 Build Plan.html   ← screen inventory + status, living doc
    └── FitTrack v2 Scope.html        ← design scope
```

**Shared kit** (used by every cluster): `theme-bridge.jsx`, `theme-typography.jsx`,
`tier-homes-screens.jsx` (primitives + `BottomNav`), `pillar-rail.jsx` (`PillarShell` + rail),
`phone-shell.jsx`, `tweaks-panel.jsx`, `cluster-scaffold.jsx`, `design-canvas.jsx`.

**Per-cluster screen modules:**
- C1: `entry-screens.jsx`
- C2: `training-logger-screen.jsx`, `logger-data.jsx`, `logger-app.jsx`, `small-sheets.jsx`,
  `upsell-screens.jsx`, `log-sheet.jsx`, `activity-logger-screen.jsx`,
  `history-detail-screen.jsx`, `exercise-detail-screen.jsx`, `logger-pillars.jsx`
- C3: `training-program.jsx`, `nutrition-program.jsx`, `nutrition-detail-screens.jsx`,
  `lifestyle-screens.jsx`, `planning-screens.jsx`, `progress-screens.jsx`, `block-editor.jsx`,
  `small-sheets.jsx`
- C4: `gameplan-active.jsx`, `checkin-screens.jsx`, `checkin-icons.jsx`, `planning-screens.jsx`,
  `progress-screens.jsx`, `small-sheets.jsx`
- C5: `shelf-bp-cards.jsx`, `shelf-bp-screens.jsx`, `shelf-bp-detail.jsx`, `shelf-detail-gp.jsx`,
  `shelf-compare.jsx`, `customize-wizard.jsx`, `checkout-screens.jsx`, `fallback-questionnaire.jsx`
- C6: `settings-screens.jsx`, `upsell-screens.jsx`
- C7: `admin-kit.jsx`, `admin-screens.jsx`, `admin-screens-2.jsx`

## Assets

The prototypes use striped SVG placeholders for imagery (program art, exercise media, hero
shots) — there are no final image assets in this bundle. Use the existing app's real media /
asset pipeline in their place.
