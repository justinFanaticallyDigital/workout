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
| 5 — Shelf | ✅ 5.1 landing · 5.2 detail · 5.3 compare · 5.6 matcher; 5.4 customize = existing wizard reused; **5.5 checkout + 5.5a welcome = Option A (activate-without-payment), in progress** |
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

## Deferred / backend-gated (NOT built — would be dead stubs)

- **5.5 real checkout (payment)** — needs billing/Stripe.
- **Cluster 7 Admin** — needs `.xlsx` upload + parse + asset storage + analytics.
- `/signin/email` (1.3) magic-link, Apple sign-in — NextAuth is Google-only.

## Verification

Every commit verified with `npx tsc --noEmit` + `next build` (dummy
`DATABASE_URL`). Run deps first: `npm install && npx prisma generate`.
