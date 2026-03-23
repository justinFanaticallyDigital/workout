# Navigation Redesign Plan

## Current Problems

### 1. The Clunky Programs Flow (user-reported)
- **Program tab** (`/program`) shows only the active program's metrics dashboard
- Only exit: "View Full Program" → `/programs/{id}` (detail) → "← Programs" breadcrumb → `/programs` (list)
- That's **3 clicks** to reach the programs list from the main tab
- No direct link from `/program` → `/programs`
- No way back from `/programs` to `/program`

### 2. `/progress/body` is Orphaned
- The body metrics page (weight logging, Recharts chart, history table) has **zero inbound links**
- `/progress` shows a weight chart inline but never links to the sub-page
- Only reachable by typing the URL manually

### 3. Program Tab vs Programs List Confusion
- `/program` = metrics dashboard for active program (BottomNav tab 2)
- `/programs` = full program list (More menu)
- These are **two separate pages with confusing overlap** — the tab shows one program's metrics, the list shows all programs, and neither cross-links well

### 4. Home Page is a Dead End
- Home only links to `/log`, `/programs/new`, `/stretch-timer`
- No links to History, Progress, Exercises, or Settings

### 5. `<a>` Tags and `window.location.href` Instead of `Link`
- `nutrition/page.tsx` uses raw `<a>` for Meal Plans links (causes full reload)
- `log/page.tsx` uses `window.location.href` for Lifting and Stretch (full reload)

---

## Proposed Changes

### A. Merge Program Tab Content into Programs List

**Current:** Two confusing pages — `/program` (dashboard) and `/programs` (list)

**Proposed:** Make the **Program tab** (`/program`) a unified page that shows:
1. **Active program section at top** — same metrics dashboard + inline targets (current `/program` content)
2. **"All Programs" section below** — program cards for paused/completed + "New Program" button (current `/programs` content)
3. Remove `/programs` from the More menu (no longer needed as a separate page)

This eliminates the 3-click flow entirely. Users see their active program dashboard AND can manage all programs on one page.

**Files changed:**
- `src/app/program/page.tsx` — merge in programs list content
- `src/components/ui/BottomNav.tsx` — remove "Programs" from More menu

### B. Fix Progress Sub-Page Navigation

**Current:** `/progress` shows weight chart but no link to `/progress/body`. Body page is orphaned.

**Proposed:** On `/progress/page.tsx`, add a "Log Weight →" or "View Details →" link on the Body Weight chart section that goes to `/progress/body`.

**Files changed:**
- `src/app/progress/page.tsx` — add link to `/progress/body` in body weight section

### C. Add Quick Links to Home Page

**Current:** Home page is largely a dead end.

**Proposed:** Add a compact quick-links row below the main content (or within the existing sub-tabs) linking to commonly needed pages: History, Progress, Exercises.

**Files changed:**
- `src/app/page.tsx` — add quick links section

### D. Fix `<a>` → `Link` and `window.location.href` → `router.push`

Replace full-page-reload navigation with proper Next.js client-side navigation.

**Files changed:**
- `src/app/nutrition/page.tsx` — `<a>` → `Link` for Meal Plans links
- `src/app/log/page.tsx` — `window.location.href` → `router.push`

### E. Clean Up More Menu

After merging Program/Programs, the More menu should contain:
- Exercises
- History
- Progress
- Injuries
- Settings

(Remove "Programs" since it's now part of the Program tab)

---

## Implementation Priority

1. **A** (merge program pages) — highest impact, directly addresses user complaint
2. **B** (progress body link) — fixes orphaned page
3. **D** (Link fixes) — quick, improves performance
4. **C** (home quick links) — nice UX improvement
5. **E** (clean up More menu) — part of A
