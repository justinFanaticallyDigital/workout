# FitTrack — Comprehensive App Audit & Revision Plan

**Date:** 2026-03-23
**Scope:** Full codebase audit across routes, APIs, auth, data flow, and UX
**Total Pages:** 27 | **Total API Routes:** 49

---

## Step 1: Route & Navigation Audit

### All Page Routes (27 total)

| Route | Type | Reachable From |
|-------|------|----------------|
| `/` | Client | BottomNav tab 1 (Home) |
| `/program` | Client | BottomNav tab 2 (Program) |
| `/log` | Client | BottomNav tab 3 (Log FAB) |
| `/nutrition` | Client | BottomNav tab 4 (Nutrition) |
| `/calendar` | Client | BottomNav tab 5 (Calendar) |
| `/signin` | Client | Auth redirects |
| `/settings` | Client | Legacy Nav.tsx only |
| `/programs` | Server | Legacy Nav.tsx only |
| `/exercises` | Client | Legacy Nav.tsx only |
| `/history` | Client | Legacy Nav.tsx only |
| `/progress` | Server | Legacy Nav.tsx only |
| `/injuries` | Client | Legacy Nav.tsx only |
| `/programs/new` | Client | `/programs` page link |
| `/programs/new/goal` | Client | `/programs/new` option |
| `/programs/new/templates` | Client | `/programs/new` option |
| `/programs/new/builder` | Client | `/programs/new` option |
| `/programs/[programId]` | Client | Program list / creation flows |
| `/programs/[programId]/blocks/[blockId]` | Client | Program detail page |
| `/programs/[programId]/blocks/[blockId]/days/[dayId]` | Client | Block detail page |
| `/exercises/new` | Client | `/exercises` page link |
| `/exercises/[exerciseId]` | Client | Exercise list rows |
| `/log/[workoutId]` | Client | Scheduled workouts / blank start |
| `/history/[workoutId]` | Client | `/history` list |
| `/progress/body` | Client | `/progress` page link |
| `/progress/photos` | Client | `/progress` page link |
| `/nutrition/plans` | Client | `/nutrition` page link |
| `/stretch-timer` | Client | `/log` activity picker / home |

### Findings

#### P1 — Inaccessible Pages (Legacy Nav only)
Six pages are **only reachable via the legacy `Nav.tsx`** component, which is **no longer rendered in the root layout**. Users on the live app cannot navigate to:
- `/settings` — User preferences, CSV export
- `/programs` — Program list (parent of all program management)
- `/exercises` — Exercise library
- `/history` — Workout history
- `/progress` — Progress overview (parent of body metrics & photos)
- `/injuries` — Injury tracker

These pages still function but have **no navigation path** from the current 5-tab bottom nav UI.

#### P2 — Missing Deep Navigation
- `/progress/body` and `/progress/photos` have no back button to `/progress`
- `/settings` has no back button (acceptable if reachable from a menu)

#### OK — No Orphaned Routes
Every page.tsx has at least one code path that can reach it. No truly dead pages.

#### OK — No Dead Links
All `href` and `router.push()` targets resolve to existing page routes.

#### OK — Bottom Nav Mapping
The 5 tabs correctly map to `/`, `/program`, `/log`, `/nutrition`, `/calendar`.

---

## Step 2: Feature Completeness Audit

### API Routes Summary (49 total)

- **Routes with GET:** 35
- **Routes with POST:** 31
- **Routes with PATCH:** 4
- **Routes with DELETE:** 5
- **DELETE coverage:** Only 10% of API surface

### P0 — Broken / Non-functional

| Issue | Detail |
|-------|--------|
| Program deletion impossible | UI may reference delete but `/api/programs/[id]` has no DELETE handler |
| Injury management incomplete | `/api/injuries/[id]` — no PATCH (can't mark resolved) or DELETE (can't remove) |

### P1 — Missing CRUD Operations

| Resource | Has | Missing | Impact |
|----------|-----|---------|--------|
| `/api/programs/[id]` | GET, PATCH | **DELETE** | Can't delete programs |
| `/api/blocks/[id]` | GET | **PATCH, DELETE** | Can't edit/delete block templates |
| `/api/blocks/day/[id]` | GET | **PATCH, DELETE** | Can't edit/delete day templates |
| `/api/stretch-routines` | GET, POST | **DELETE** | Can't delete stretch routines |
| `/api/stretch-routines/[id]` | — | **Entire route missing** | No detail/edit/delete |
| `/api/injuries/[id]` | — | **PATCH, DELETE** | Can't update or remove injuries |
| `/api/nutrition/plans/[id]` | GET, DELETE | **PATCH** | Can't edit meal plan properties |
| `/api/nutrition/foods` | GET, POST | **DELETE** | Can't remove custom foods |
| `/api/workouts/[id]/exercises` | POST | **GET, PATCH, DELETE** | Can't manage individual exercises |

### P3 — Unused API Route

| Route | Status |
|-------|--------|
| `/api/dashboard` | Replaced by `/api/home` in Phase 4. No frontend consumer. Dead code. |

---

## Step 3: Data Flow & Auth Audit

### Server Components — OK
Both server component pages (`/programs`, `/progress`) correctly use `getAuthUserId()` + `redirect("/signin")`.

### P0 — Client Pages Missing 401 Handling

Only the home page (`/`) properly handles 401 responses. All other client pages either swallow 401s silently or crash on invalid JSON:

| Page | Fetch Target | 401 Handling |
|------|-------------|--------------|
| `/` (Home) | `/api/home` | **Proper** — shows sign-in prompt |
| `/program` | `/api/programs`, `/api/metric-targets`, `/api/home` | **Missing** — silent failure |
| `/exercises` | `/api/exercises` | **Missing** — renders empty |
| `/calendar` | `/api/workouts` | **Missing** — `.catch(() => {})` |
| `/history` | `/api/workouts` | **Missing** — `.catch(() => setLoading(false))` |
| `/log` | `/api/home` | **Missing** — no 401 check |
| `/nutrition` | `/api/nutrition/*` | **Missing** — silent failure |
| `/injuries` | `/api/injuries` | **Missing** — silent failure |
| `/settings` | N/A (localStorage only) | N/A |

**Risk:** Unauthenticated users who navigate to any tab except Home will see blank/loading screens with no sign-in prompt.

### P1 — Inconsistent Auth Patterns in API Routes

Two auth helper patterns coexist:
- `requireAuth()` (newer, returns tuple) — ~20 routes
- `requireAuthUserId()` (older, throws error) — ~25 routes

The throwing pattern (`requireAuthUserId()`) is **not wrapped in try-catch** in most API handlers. When auth fails, these routes return unhandled 500 errors instead of clean 401 responses.

**Affected routes:** `/api/programs`, `/api/exercises`, `/api/goals`, `/api/injuries`, `/api/workouts`, `/api/blocks/*`, `/api/sets`, `/api/progress/*`, and ~10 more.

### P1 — New Table Routes Missing try-catch

The `/api/home` route properly wraps new-table queries in try-catch for graceful degradation. However, dedicated routes for new tables do NOT:

| Route | Table | try-catch? |
|-------|-------|-----------|
| `/api/metric-targets` | UserMetricTarget | No |
| `/api/activity-logs` | ActivityLog | No |
| `/api/stretch-routines` | StretchRoutine | No |
| `/api/schedule-overrides` | ScheduleOverride | No |

**Risk:** App crashes on these endpoints if `npx prisma db push` hasn't been run for new tables.

### OK — Prisma Null Safety
All routes that include relationships properly check for null before accessing properties. No null dereference risks found.

---

## Step 4: UX Flow Audit

### User Journey: First-Time User
1. Lands on `/` (Home) — sees welcome/empty state. **OK**
2. Wants to create a program — **BLOCKED**: No way to reach `/programs` from bottom nav
3. Wants to browse exercises — **BLOCKED**: No way to reach `/exercises` from bottom nav
4. Can use Log tab to start a blank workout — **OK**
5. Can track nutrition — **OK** (Nutrition tab accessible)

### User Journey: Returning User with Active Program
1. Home tab shows Next Action card — **OK**
2. Program tab shows metrics dashboard — **OK**
3. Wants to edit program blocks/days — **BLOCKED**: No PATCH/DELETE API routes
4. Wants to view workout history — **BLOCKED**: No nav path to `/history`
5. Wants to check progress — **BLOCKED**: No nav path to `/progress`

### P0 — Design System Violations

| Issue | File | Detail |
|-------|------|--------|
| Accent color used as text | `programs/new/page.tsx` | `text-ft-accent` on "New to training?" — violates "Never as text color" rule |
| Accent color used as text | `progress/photos/page.tsx` | `text-ft-accent` on compare button |

### P2 — Missing Empty States

| Page | Current Behavior | Should Use |
|------|-----------------|------------|
| `/nutrition/plans` | Plain `<p>` text message | EmptyState component |
| `/exercises` (filtered) | Plain `<div>` "No exercises found" | EmptyState component |
| `/log/[workoutId]` | Plain "No exercises found" text | EmptyState component |

### P2 — EmptyState Component Uses Solid Buttons

The `EmptyState.tsx` component uses `bg-ft-accent text-ft-bg` (solid button style) instead of the graffiti-style `cta-underline` pattern specified by the design system. This affects empty states across programs, history, progress, and injuries pages.

### P2 — Excessive font-mono Usage

The design system specifies three fonts: Permanent Marker (display), Caveat (handwritten), Barlow Condensed (body). However, `font-mono` appears **560+ times** across the codebase where `font-body` should be used for system labels and body text.

### P3 — Section Divider Underutilization

The `.section-divider` class (dashed border dividers) is only used ~8 times despite the design system recommending them between sections.

### OK — Bottom Nav Padding
Layout properly applies `pb-24` and BottomNav adds `h-20` spacer. No content hidden behind nav.

### OK — Full-Screen Flows
BottomNav correctly hides on `/log/[workoutId]` and `/stretch-timer`.

---

## Step 5: Prioritized Revision Plan

### P0 — Broken (Must Fix)

| # | Issue | Fix |
|---|-------|-----|
| P0-1 | 6 pages unreachable (no nav path) | Add hamburger/overflow menu to BottomNav or integrate key pages into existing tabs |
| P0-2 | Client pages show blank screens when unauthenticated | Add 401 handling to all client page fetch calls — redirect to `/signin` or show auth prompt |
| P0-3 | `requireAuthUserId()` routes return 500 on unauth | Migrate all API routes to `requireAuth()` tuple pattern, or wrap in try-catch |
| P0-4 | Accent color used as text color | Remove `text-ft-accent` from `programs/new/page.tsx` and `progress/photos/page.tsx` |

### P1 — Inaccessible Features (Should Fix)

| # | Issue | Fix |
|---|-------|-----|
| P1-1 | No DELETE for programs | Add DELETE handler to `/api/programs/[id]/route.ts` |
| P1-2 | No PATCH/DELETE for injuries | Add handlers to new `/api/injuries/[id]/route.ts` |
| P1-3 | No PATCH/DELETE for blocks | Add handlers to `/api/blocks/[id]/route.ts` |
| P1-4 | No PATCH/DELETE for block days | Add handlers to `/api/blocks/day/[id]/route.ts` |
| P1-5 | No DELETE for stretch routines | Add DELETE to `/api/stretch-routines/route.ts` or create `[id]` route |
| P1-6 | New table routes crash without try-catch | Wrap `/api/metric-targets`, `/api/activity-logs`, `/api/stretch-routines`, `/api/schedule-overrides` in try-catch |
| P1-7 | `/progress/body` and `/progress/photos` missing back navigation | Add back button/breadcrumb to parent `/progress` |

### P2 — Incomplete (Nice to Fix)

| # | Issue | Fix |
|---|-------|-----|
| P2-1 | Missing EmptyState on 3 pages | Replace plain text with EmptyState component in nutrition plans, exercises (filtered), workout logger |
| P2-2 | EmptyState uses solid buttons | Change to `cta-underline` style per design system |
| P2-3 | No PATCH for meal plans | Add PATCH handler to `/api/nutrition/plans/[id]/route.ts` |
| P2-4 | No DELETE for custom foods | Add DELETE handler to `/api/nutrition/foods/route.ts` or `[id]` route |
| P2-5 | Workout exercise management incomplete | Add GET/PATCH/DELETE to `/api/workouts/[id]/exercises/route.ts` |
| P2-6 | Silent error suppression in client pages | Add user-facing error toasts for failed fetches |

### P3 — Polish

| # | Issue | Fix |
|---|-------|-----|
| P3-1 | 560+ `font-mono` usages should be `font-body` | Systematic find-and-replace across all components |
| P3-2 | Section dividers underutilized | Add `.section-divider` between content sections per design spec |
| P3-3 | `/api/dashboard` is dead code | Remove the route entirely |
| P3-4 | Mixed `requireAuth` / `requireAuthUserId` patterns | Standardize on `requireAuth()` tuple pattern across all routes |

---

## Implementation Order Recommendation

1. **P0-1 + P0-2** first — these are the highest-impact user-facing issues (unreachable pages + blank auth screens)
2. **P0-3 + P0-4** next — API stability and design compliance
3. **P1-1 through P1-7** — complete CRUD gaps and resilience
4. **P2/P3** — polish pass

Estimated scope: P0 fixes touch ~15 files. P1 fixes touch ~10 API route files. P2/P3 are incremental.
