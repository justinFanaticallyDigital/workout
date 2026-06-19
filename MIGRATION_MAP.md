# FitTrack — Migration Map

**Current built app → Unified Tiered Redesign**

> Companion to the Claude Design handoff bundle. This is the one artifact the live repo
> *doesn't* make obvious: which existing screen/route/component becomes which new
> cluster, what's replaced, what's kept, and where the new screens get their data.

---

## How to read this

**Source of "from" state:** the live codebase + `CLAUDE.md` (4/30/2026 snapshot, Phases 1–8 / R0–R15).
**Source of "to" state:** `fittrack-unified-spec.md` (§1–11) + `fittrack-screen-inventory.md` + `fittrack-flowchart-v3.html`.

**Ground-truth rule:** the **live repo wins** on what currently exists. Where this map and the
code disagree about a current route or component, trust the code and flag the drift. Where this
map and the *spec* disagree about the target, the **screen inventory + unified spec win**.

**State tags** (carried over from the screen inventory):

| Tag | Meaning | Design/Code action |
|---|---|---|
| 🔒 **Locked** | Exists, works, design language stays | Reskin only to match new tokens; do not restructure |
| 🔧 **Refactor** | Exists, needs rework to fit the tiered/pillar model | Re-wire + restyle; preserve underlying logic/data |
| ✨ **New** | Doesn't exist | Build from the Claude Design mockups |

Counts from the inventory: **~12 Locked · ~14 Refactor · ~44 New.**

---

## Part 1 — Structural migrations (the load-bearing changes)

These four shifts touch every screen. Get them right first; everything else is downstream.

### 1.1 Bottom nav: current 5-tab → new 5-slot tiered

The nav keeps 5 slots and the raised center +Log FAB, but the *contents* change and become **tier-aware**.

| Slot | CURRENT (4/30) | NEW (all tiers) | Migration |
|---|---|---|---|
| 1 | **Gameplan** | **Tier home** — Logger→Workouts Library · Program→My Program · Gameplan→Gameplan dashboard | 🔧 Slot becomes tier-conditional. Gameplan dashboard demotes from "always slot 1" to "slot 1 *only on Gameplan tier*." |
| 2 | **Progress** | **Training** (pillar) | 🔧 Progress leaves the bar (→ §1.5). Training promoted from a Gameplan sub-tab to a universal pillar. |
| 3 (center) | **+Log** FAB | **+Log** FAB | 🔒 Keep. `LogActivitySheet` bottom sheet stays; refactor its tiles (§ Cluster 2). |
| 4 | **Nutrition** | **Nutrition** (pillar) | 🔧 Stays in place; gets the L1/L2/L3 pillar rework. |
| 5 | **Settings** | **Lifestyle** (pillar) | 🔧 Settings leaves the bar (→ §1.5). Lifestyle promoted from a Gameplan sub-tab to a universal pillar (preview-gated on Logger). |

`BottomNav.tsx` stays the single nav component (do **not** fork per tier) — it reads the active
tier + active theme and renders slot 1 + the Lifestyle preview-lock conditionally. Still hidden on
full-screen flows (active logger, stretch timer, customize wizard, planning mode).

### 1.2 The three pillars get promoted

Today, Training / Nutrition / Lifestyle exist as **sub-tabs inside the Gameplan dashboard**
(`/gameplan`). In the redesign they become **top-level, universal pillars** with their own routes
and a shared side rail (the L1 *Model* / L2 *This Week* / L3 *Today* / *Gameplan* slot pattern).

| Pillar | Current home | New home | State |
|---|---|---|---|
| Training | `/gameplan` → Training sub-tab | `/training` (pillar landing, L3 "Today" default) | 🔧 Refactor — lift content out of the dashboard sub-tab into a standalone pillar; reuse today-card + week-strip logic |
| Nutrition | `/nutrition` (food diary) + `/gameplan` Nutrition sub-tab | `/nutrition` (pillar landing, L1 Model Day / L2 Week / L3 Today) | 🔧 Refactor — food diary becomes the L3 layer *under* the new Model/Week layers (Build-a-Meal wizard, grocery list) |
| Lifestyle | `/gameplan` → Lifestyle sub-tab (Sleep/Stress/Protein cards) | `/lifestyle` (pillar landing) | 🔧/✨ Refactor the existing cards into the L3 layer; the full L1 routines / L2 week / cues+contingencies are **New** |

### 1.3 Tier model overlay (Logger / Program / Gameplan)

A new gating axis sits over everything. Rule from the spec: **gate on "does this need persistence
beyond a session, and does it need the cloud?"**

| Tier | Commercial | What populates the pillars | Persistence |
|---|---|---|---|
| **Logger** | Free | Manual, one session/meal/log at a time; no "tomorrow" | **Local only** (device / Google Drive file) — *not* the DB |
| **Program** | One-time purchase | A pre-built forward plan; connected, not adaptive | Cloud DB |
| **Gameplan** | Subscription | Goals + adaptive plan + check-ins + engine that mutates the plan | Cloud DB |

This is mostly **New** wiring. The biggest sleeper is the **Logger local-storage path** (§1.4).

### 1.4 Data layer split — the highest-risk new piece

The current logger is **DB-backed** (`Workout` / `WorkoutExercise` / `Set` via Prisma). The new
**Logger tier writes locally** (localStorage or a user-owned Google Drive file), never touching the
database. This is a genuinely new storage path, not a reskin.

- ✨ **New:** local/Drive persistence adapter; "frames" (named, re-selectable workout shells) stored locally.
- 🔧 **Refactor:** the logger's existing draft/offline-queue machinery (`2s debounced localStorage drafts`, offline sync) is the closest existing analog — extend it into the Logger-tier store rather than inventing from zero.
- ⚠️ **Verify in repo:** confirm whether any logger write path assumes a `userId`/session before assuming a clean local fork is cheap.

### 1.5 Settings & Progress leave the bottom nav

- **Settings** → top-right **⚙ gear**, present on every screen/tier. Opens full-page or sheet. 🔧
- **Progress** → no longer a nav slot. Consolidates into the existing `/progress/*` surfaces, reached from Settings/More and from in-pillar links. 🔧 (the inventory tags this "Progress — tier consolidation").
- **Shelf** → **not** a nav slot. Reached via in-screen affordance on each tier's slot-1 home (Logger's is the primary upsell channel). ✨

> Note: an earlier thread floated putting the Shelf in nav slot 1 on all tiers, and a separate
> "More hub" pattern. The **unified spec superseded both** — slot 1 is the tier home, Shelf is an
> affordance, Settings is the gear. Build to the unified spec.

---

## Part 2 — Screen-by-screen map, by cluster

Columns: **New screen** · **Route** (existing, or *proposed* where New) · **State** · **Maps from** (current) · **Notes**.

### Cluster 1 — Entry & Auth

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Sign-in | `/signin` (NextAuth) | 🔧 | Existing Google-only sign-in | Add Apple + Email/password methods; role-aware redirect (admin email → admin home) |
| Theme picker (first-visit) | modal | 🔒 | `ThemeProvider` first-visit modal | Keep; may polish to new tokens |
| Tier landing | *proposed* `/start` | ✨ | — | New: present Logger / Program / Gameplan choice on first run |
| Onboarding / consultation | `/consultation` (if retained) | 🔧 | Built questionnaire flow | Confirm whether it routes into Gameplan tier setup; full-screen takeover layout already exists |

### Cluster 2 — Logger tier (free, local-storage)

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Workouts Library (slot-1 home) | *proposed* `/library` | ✨ | Partial: `/log/library` single-workout list | New home surface listing saved **frames**; hosts the primary "Browse Programs & Gameplans" Shelf affordance |
| Save-as-frame | within logger | ✨ | — | Save current workout shell (exercises/sets/reps) as a named, re-runnable frame; **local storage** |
| Active workout logger | `/log/[workoutId]` | 🔒 | Spreadsheet-style logger | Locked design; only rewire its **write target** to local store on Logger tier (§1.4) |
| +Log activity sheet | `LogActivitySheet` | 🔧 | Existing +Log bottom sheet | Refactor tiles for the tier; "Single workout from library" stays |
| HIIT / LISS / Class / Custom loggers | under `/log/*` | 🔧 | Existing inline loggers | Restyle to new tokens; keep activity-type logic |
| Stretch timer | full-screen | 🔒 | `ThemedRestTimer` stretch timer | Locked |
| Lifestyle **preview** (Logger) | `/lifestyle` (locked state) | ✨ | — | Preview-locked pillar; **highest-impact in-app upsell** |
| View-as-Gameplan | *proposed* `/library/as-gameplan` | ✨ | — | Shows what the user's logging would look like under a Gameplan; **second-highest upsell** |

### Cluster 3 — Program tier (one-time purchase)

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| My Program (slot-1 home) | *proposed* `/program` | ✨/🔧 | Current `/program` page (cruft, un-redirected) + program detail | Active block view; reuse block/day rendering. Hosts "Browse more / Add coaching" affordances |
| Block detail | existing block detail | 🔧 | `CategoryLaneView` / `EditableExerciseTable` | Restyle; keep role badges, alt-swap, phase badges |
| Switch program sheet | *proposed* sheet | ✨ | — | Swap active program |
| Planning Mode (Program tier) | `/program/[id]/planning` *(proposed)* | 🔧 | `/gameplan/[id]/planning` (Gameplan-only today) | **Extend** existing Planning Mode to support Program tier (no check-in audit layer at this tier) |
| Progress (Program view) | `/progress/*` | 🔧 | `/progress/charts|calendar|injuries|body|photos` | Tier-consolidated; reached from gear/More, not bottom nav |

### Cluster 4 — Gameplan tier (subscription)

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Gameplan dashboard (slot-1 home) | `/gameplan` | 🔒 | Existing dashboard (Today card, Week strip) | Locked; its Training/Nutrition/Lifestyle **sub-tabs** are what get promoted to pillars (§1.2) — confirm dashboard keeps a summary vs. full sub-tabs |
| Weekly check-in | `/checkin` | 🔒 | Existing check-in form | Locked |
| Recommendations feed | within `/gameplan` | 🔒 | Goal-engine recommendation surfaces | Locked |
| Planning Mode (Gameplan, w/ audit) | `/gameplan/[id]/planning` | 🔒 | Existing Planning Mode + `RecentChangesPanel` | Locked; the Program-tier version (Cluster 3) is the refactor branch |
| Goals editor | within planning / `GameplanKindEditor` | 🔧 | R15 gameplan-kind editor + goals tab | Restyle; widen to 3 goal types if not already |
| Gameplan setup (picker) | `/gameplan/new` + `/gameplan/new/templates` + `/[slug]/customize` | 🔧 | Existing picker + templates + customize wizard | Reconcile with the **Universal Shelf** customize wizard (§ Cluster 5) — likely the Shelf wizard subsumes this |

### Cluster 5 — Universal Shelf (the marketing/commerce surface)

All ✨ **New** unless noted. Reached as an in-screen affordance from every tier's slot-1 home.

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Shelf (Programs + Gameplans tabs) | *proposed* `/shelf` | ✨ | — | **Highest commercial priority.** Collapsible filter **rail** (persistent across tabs; one question expanded at a time); card grid. Card structure differs Program vs Gameplan |
| Card detail page | *proposed* `/shelf/[slug]` | ✨ | — | Conversion page; hero image (4:3 Gameplan / 3:4 Program), structure breakdown |
| Side-by-side compare | *proposed* `/shelf/compare` | ✨ | — | Compare 2+ cards |
| Customize wizard | *proposed* `/shelf/[slug]/customize` | 🔧/✨ | Existing gameplan customize wizard | Generalize the existing `customizationInputs` wizard to cover Programs too; posts to clone/purchase |
| Post-purchase welcome | *proposed* `/shelf/[slug]/welcome` | ✨ | — | First impression post-purchase; retention-critical |
| Tier comparison | *proposed* `/shelf/tiers` | ✨ | — | Supports indirect conversion |

### Cluster 6 — Settings (top-right gear)

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Settings home | `/settings` | 🔧 | Existing settings page | Becomes the gear destination + hub for sub-pages and the More-style links (Progress / Library / Integrations / Account) |
| Units & preferences | `/settings/units` *(or existing)* | 🔒 | Existing units/localStorage prefs | Locked |
| Account | `/settings/account` | 🔧 | — | Tier status, billing entry, sign-out |
| Billing → Cancellation Info | `/settings/billing/cancellation` | ✨ | — | The quiet credit-policy disclosure (credit is **not** promoted elsewhere) |
| Integrations | `/settings/integrations` | 🔧 | `IntegrationData` / Fitbit stub | Fitbit/Whoop/Apple Watch links (Lifestyle data) — most are New wiring |
| Data export | `/settings/export` *(or existing)* | 🔒 | Existing CSV export | Locked |
| Theme switcher | `/settings/theme` | 🔒 | Existing settings theme switcher | Locked |
| Admin access link | within Settings | ✨ | — | Visible only when `session.user.email === <you>` (or `role==='admin'`) |

### Cluster 7 — Admin / Authoring (role-gated, parallel structure)

All ✨ **New.** Runs as a parallel cluster; admins route here at sign-in.

| New screen | Route | State | Maps from | Notes |
|---|---|---|---|---|
| Admin dashboard | `/admin` | ✨ | — | Authoring home |
| Spreadsheet upload | `/admin/upload` | ✨ | — | Upload program/gameplan `.xlsx` (your `Program_Upload_Template.xlsx` / gameplan template conventions) |
| Exercise resolution / fuzzy-match | within upload flow | ✨ | — | On unresolved exercise name: pick a fuzzy suggestion **or** add as new custom exercise to the library, then resume |
| Card preview & publish | `/admin/[slug]/preview` | ✨ | — | Preview the Shelf card + detail, then publish |
| Asset uploads | `/admin/assets` | ✨ | — | Hero/detail imagery (same storage layer as progress photos) |
| Analytics | `/admin/analytics` | ✨ | — | Funnel: impression → detail → customize → checkout → active → completion |

---

## Part 3 — Deprecated / retired

| Item | Disposition | Why |
|---|---|---|
| **Two program-creation systems** — `/programs/new` (Phase 6 hub: goal/templates/builder/generate) vs `/gameplan/new` | **Consolidate.** Fold Phase 6 paths into the Shelf customize wizard / Gameplan setup, or formally retire `/programs/new`. | CLAUDE.md already labels `/programs/new/templates` "legacy." User-facing entry points overlap; the Shelf is the new single front door. |
| **Legacy `/` (home)** | Retire or redirect to tier home | Replaced by tier-specific slot-1 homes |
| **Legacy `/program` (un-redirected)** | Becomes / folds into **My Program** (Cluster 3) | Cruftiest current route; not in nav |
| `/calendar`, `/injuries` | Keep as redirects → `/progress/*` | Already redirects today |
| **Bottom-nav Settings + Progress slots** | Removed from nav (§1.5) | Settings→gear; Progress→consolidated |
| **Clone API legacy `template`-object path** | Retire after creation-flow consolidation | Keep `templateSlug` path |

**Not redundant — keep both** (despite similar names): the **Program Builder Engine**
(`src/lib/program-engine/`, builds a plan from scratch) and the **Goal Engine** (adjusts an existing
plan from check-ins). Different layers; both survive.

---

## Part 4 — Shared primitives (component-glossary seed)

The redesign leans on a small set of recurring primitives. Build these once, reuse across clusters
(this is also Claude Design's likely first deliverable — a styled component library):

- **PillarShell** — the single shell wrapping all three pillar landings (top bar w/ context crumb + ⚙, shared side rail with L1/L2/L3/Gameplan slots, <400px icon-only collapse). One component, not three.
- **BottomNav** — single 5-slot component, tier-aware slot 1 + Lifestyle preview-lock (§1.1).
- **Card** (Program vs Gameplan variants) — Shelf grid + detail.
- **Filter rail** — collapsible, accordion (one open at a time), persistent across Shelf tabs.
- **Shuffle / lock / re-roll / swap** — shared pillar primitives (Build-a-Meal, exercise alts, routines).
- **Themed primitives already built** — `ThemedButton/Card/Nav/RestTimer/Icon/Overlays/Texture`, `data-theme` scoped CSS. 🔒 reuse; don't re-implement.

> **Blueprint contrast trap (carry-over invariant):** the `blueprint` theme is **inverted** — cards
> are *darker* than the bg, not lighter. Any new card/shell primitive must honor this or the theme
> stops reading as drafting paper. Same for `notebook`'s 40px left padding (spiral binding).

---

## Part 5 — Verification checklist for Claude Code (live-repo pass)

Before building, confirm these against the actual code (this map is derived, not authoritative on current state):

1. Exact current `BottomNav.tsx` slot wiring and how `/gameplan` sub-tabs are structured (Training/Nutrition/Lifestyle).
2. Whether `/program` and `/` still render or are already redirected.
3. The logger's current write path & draft/offline-queue store (basis for the Logger-tier local fork, §1.4).
4. Existing `/progress/*` route set and what's already consolidated there.
5. Current customize-wizard implementation (`customizationInputs`) — how much the Shelf wizard can reuse vs. generalize.
6. Whether `Program` has a `programFamily`/`variantKey` grouping field yet (needed for Shelf variant selectors; flagged as a likely schema add).
7. Admin gating: confirm `role` vs hard-coded email approach.

---

*Build order suggestion (from the design brief, commercial-impact first):* Shelf → Card Detail →
Tier Landing → Workouts Library → My Program → Customize Wizard → Post-Purchase Welcome →
Logger Lifestyle Preview → View-as-Gameplan → Tier Comparison → remaining by cluster.
Foundation primitives (PillarShell, BottomNav, Card, filter rail, theme bridge) come **before** any cluster.
