# FitTrack v2 Reskin — Working Record

> Living record of the v2 UI reskin + wiring effort. Branch:
> `claude/fittrack-v2-reskin-erpo5w`. Read this to resume with full context.
> Authority docs: `ARCHITECTURE.md` / `README.md` / `MIGRATION_MAP.md` on the
> `reskin-file-drop` branch; per-cluster prototype JSX lives at that branch root.

## What this is

Recreate the v2 design (7 clusters, tiered Logger → Program → Gameplan) in the
existing Next.js app, wiring screens to real data/logic. Theme-agnostic `ft-*`
tokens; on-bg chrome (`.ft-on-bg`, `*-on-bg`) so Blueprint (inverted theme)
stays legible. One `PillarShell`, one global `BottomNav`. Tier is UI-simulated
via `TierProvider` (no billing) — switchable in Settings.

## Status by cluster

| Cluster | State |
|---|---|
| Foundation (theme bridge, v2 primitives, PillarShell/HomeShell/BottomNav, TierProvider, logger-store) | ✅ done (earlier) |
| 2 — Logger | ✅ done (earlier) + deferred TODOs cleared (2.5 finish sheet, 2.7a macro targets) |
| 3 — Program | ✅ done — incl. 3.5 Planning (Program), 3.6 Progress, 3.7 Block/Day editor |
| 4 — Gameplan | ✅ done — pillar gameplan-slot unlock, dashboard refactor (TabBar removed), 4.3 Recommendations feed, 4.7 Check-in detail |
| 5 — Shelf | ✅ 5.1 landing · 5.2 detail · 5.3 compare · 5.6 matcher · 5.4 customize (existing wizard) · 5.5 checkout + 5.5a welcome (Option A — activate without payment) |
| 6 — Settings | ✅ hub + UI-simulated tier switcher |
| 1 — Entry/Auth | ✅ 1.2 sign-in, 1.5 tier landing (`/welcome`) |
| 7 — Admin | ⛔ deferred — needs an upload/parse/asset/analytics backend (would be a dead stub) |

## Routes added/reskinned (v2)

- `/progress` (+ `_view.tsx`) — tier-aware metric trends / adherence / history
- `/programs/[id]/blocks/[blockId]` + `/days/[dayId]` + `_editor-shell.tsx` — staged sandbox editor
- `/programs/[id]/planning` (+ shared `gameplan/[id]/planning/_components/PlanningExperience.tsx`)
- `/recommendations`, `/checkin/[id]` (reskin)
- `/gameplan` (dashboard summary; TabBar removed)
- `/shelf`, `/shelf/[type]/[slug]`, `/shelf/compare`, `/shelf/match`
- `/settings` (hub + tier switcher)
- `/signin` (reskin), `/welcome` (tier landing)
- `src/components/PillarGameplanLayer.tsx` — pillar gameplan-slot content at gameplan tier
- **Option A (this pass):** `/checkout`, `/welcome/[type]/[id]` (post-purchase)

## Tier model (how to test)

`TierProvider` default = `gameplan`. Switch tiers in **Settings → Tier**
(Logger / Program / Gameplan). Slot-1 home + locked rail slots + Lifestyle
preview-lock + pillar gameplan layer all branch on `useTier()`.

## Key decisions

- **Planning Mode** is one shared `PlanningExperience`, tier-branched: Program
  tier drops the audit (GameplanChange) write, recommendation banner,
  recent-changes panel, gameplan-kind editor, Lifestyle tab; routes home to
  `/my-program`. Gameplan tier keeps all of it.
- **Gameplan dashboard** dropped the in-content pillar TabBar (ARCHITECTURE §2)
  — pillars are universal via BottomNav; `/gameplan` is now a summary.
- **Shelf** is backed by the live `programTemplates` registry (8 plans). Same
  plan is offered at both Program/Gameplan tiers (tier = a gating axis, §1.3).
- **Option A (checkout):** no payment backend, so "purchase" = clone the
  template (`POST /api/programs/clone`, customizationAnswers optional) + set the
  simulated tier. Honors flow-rule §7 (customization is never a gate — activate
  with defaults + start date; customize is optional/post-purchase).

## Flow review — entry → selecting Gameplan / Program / Logger

Verified end-to-end; all hops resolve, no dangling static links (20 unique
targets checked), nav hidden on every full-screen step.

```
/signin (Google) ──callbackUrl "/"──▶ / ──redirect──▶ /gameplan
   fresh user (no active program):
   /gameplan empty ──"Choose how to start"──▶ /welcome (tier landing)
        ├─ Logger   → setTier(logger)  → /library
        └─ Program/Gameplan → setTier  → /shelf
   /shelf ─(tabs · filter rail · "Not sure?"→/shelf/match)─ card ─▶ /shelf/[type]/[slug]
        ├─ "Compare"        → /shelf/compare
        └─ "Get this plan"  → /checkout?type=&slug=
   /checkout ─ start date ─▶ Activate → POST /api/programs/clone → /welcome/[type]/[id]
        └─ "Customize first" → wizard → clone → /welcome/gameplan/[id]   (paths converge)
   /welcome/[type]/[id] ─ setTier(type) + first actions ─▶ tier home
        (/library · /my-program · /gameplan)  — BottomNav slot-1 follows tier
```

- Switch tiers anytime in **Settings → Tier** to re-preview locked/unlocked surfaces.
- Logger path needs no purchase (`/welcome` → `/library` directly).
- Customize and Activate paths now both land on the post-purchase welcome.

### Known flow gaps (not blockers)

- **Root `/` → `/gameplan` unconditionally** (server redirect can't read the
  client tier). Logger users land on the gameplan empty state, which
  course-corrects to `/welcome`. A true returning-user auto-route (1.6) needs a
  persisted onboarded/tier flag → backend, deferred.
- The customize wizard hardcodes `type=gameplan` on its welcome redirect
  (templates are gameplan-grade). Fine today; thread `type` through if Programs
  ever diverge from Gameplans in content.

## Option A — issues & notes (activate without payment)

1. **Clone needs seeded templates.** `POST /api/programs/clone` deep-clones the
   seeded template Program (under `templates@fittrack.system`). On an unseeded
   DB it returns 503; checkout surfaces it as a toast. Pre-existing dependency
   (the wizard has it too) but now on the primary CTA. Seed with
   `npx tsx scripts/seed-program-templates.ts` (see CLAUDE.md).
2. **Activate-with-defaults skips `applyCustomizations`** (nutrition-from-
   bodyweight, 1RM scaling, injury subs) — by design (§7: customize is never a
   gate; do it post-purchase). The plan clones with template defaults + start date.
3. **Tier is client-only** (localStorage via TierProvider). Activation sets it
   but it is NOT persisted as a server entitlement — a different device/session
   won't see the "purchase." Expected with no billing; revisit when entitlements land.
4. **`/welcome` is overloaded** — index = tier landing (pre); `[type]/[id]` =
   post-purchase. Distinct routes, no collision.

## Root-cause fix: fixed nav broken across themes (NOT theme-specific)

Symptom: bottom nav (and bottom sheets) float mid-page / drop below the fold on
multiple themes. **Root cause:** theme chrome decorated the broad
`.bg-ft-surface` *color* utility — which the **fixed** `BottomNav`, bottom
sheets, and the pillar rail all use — with positioning/transform:
- `[data-theme="cyberpunk"] .bg-ft-surface { position: relative }` — specificity
  (0,0,2,0) out-ranks the `.fixed` utility (0,0,1,0), so the nav became
  `position: relative` and fell into normal flow.
- `[data-theme="graffiti"] .bg-ft-surface { transform: rotate() }` — a transform
  on a `position:fixed` element breaks fixed positioning on mobile Chrome.
- arcade/lab/notebook added bezel/shadow/brackets onto the nav/sheets too.

**Fix (systemic, not per-theme):**
1. Scoped ALL theme card-chrome from `[data-theme] .bg-ft-surface` →
   `[data-theme] .ft-card` (the semantic card hook). `.bg-ft-surface` is just a
   surface *color*; only real cards get card ornamentation. The nav/sheets/rail
   use the color but are not `.ft-card`, so they're cleanly excluded on every
   theme. (iron/blueprint already targeted `.ft-card`.)
2. Added `.ft-card` to the legacy `ui/Card` so legacy cards keep their chrome.
3. Belt-and-suspenders guard: `nav.fixed.bottom-0 { position: fixed !important;
   transform: none !important }` so no future rule can re-break it.

**Invariant:** theme decorations (transform/position/::before brackets/tilt)
MUST target `.ft-card`, never `.bg-ft-surface`. The bottom nav + any
`position:fixed` sheet must never carry a transform or a position override.

## Live-testing fixes

- **Bottom nav was breaking on the graffiti theme (root cause of "floating /
  no nav until end of page").** Graffiti's "poster tilt" decoration applied
  `transform: rotate()` to every `.bg-ft-surface` element — including the global
  `BottomNav` (and bottom sheets), which use `bg-ft-surface`. A `transform` on a
  `position: fixed` element re-bases it to a new containing block and outright
  **breaks fixed positioning on mobile Chrome**, dropping the nav out of the
  viewport-pinned layer (anchors under the header on PillarShell pages, at the
  end of content on the legacy dashboard). Fix: scoped graffiti's poster
  rotation / shadow / tape rules from `.bg-ft-surface` → `.ft-card` (the actual
  card hook, matching their intent), and added a safety net
  `nav.fixed.bottom-0 { transform: none !important }` so no theme decoration can
  ever break the fixed nav again. This also un-breaks bottom sheets + the rail
  on graffiti.
- **Dashboard content clearance.** The legacy `/gameplan` dashboard cancelled
  `<main>`'s `pb-24` with `-mb-24`; changed to `-mx-4 -mt-4` so its last content
  clears the nav.
- **Root `/` is tier-aware.** Client redirect to `tierHome(tier)` (read from
  localStorage to avoid racing TierProvider hydration) instead of hard-coded
  `/gameplan`.

> Lesson / invariant: **never put a `transform` on the fixed `BottomNav` or any
> `position: fixed` sheet.** Theme decorations that tilt/scale must target
> `.ft-card`, never the broad `.bg-ft-surface`.

## Full access + "no programs loaded" — how to handle

- **Tier:** Gameplan is the TierProvider default = full access. Confirm/switch
  in **Settings → Tier**.
- **Content:** programs/gameplans exist only after **activating** one
  (Shelf → Get this plan → Activate = clone a template). Activation needs the 8
  gameplan templates seeded in the DB. If activate errors *"Template … hasn't
  been seeded yet"*, run against your `DATABASE_URL` (per CLAUDE.md):
  ```
  npx prisma db push
  npx tsx scripts/add-missing-template-exercises.ts
  npx tsx scripts/seed-program-templates.ts
  ```
  (Requires DB access — cannot be run from this environment.)

## Deferred / backend-gated (NOT built — would be dead stubs)

- **5.5 real checkout (payment)** — needs billing/Stripe.
- **Cluster 7 Admin** — needs `.xlsx` upload + parse + asset storage + analytics.
- `/signin/email` (1.3) magic-link, Apple sign-in — NextAuth is Google-only.

## Verification

Every commit verified with `npx tsc --noEmit` + `next build` (dummy
`DATABASE_URL`). Run deps first: `npm install && npx prisma generate`.
