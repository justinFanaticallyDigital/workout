# Phase 3 Implementation Plan — Polish & Enhancements

Phase 2 is complete. All core features work end-to-end. Phase 3 focuses on UX polish, mobile support, workout history, progression logic, and PWA.

---

## Step 1: Workout History Page + Session Detail View
**Priority: Highest — users need to browse and review past workouts**

### 1a: Workout History Page (`/history`)
- **New file:** `src/app/history/page.tsx` (client component)
- Fetch paginated workouts from `GET /api/workouts?limit=20&offset=0`
- Display as a chronological list: date, day name, exercise count, total volume, duration
- "Load More" button for pagination
- Add "History" nav item to Nav component

### 1b: Workout Detail/Replay Page (`/history/[workoutId]`)
- **New file:** `src/app/history/[workoutId]/page.tsx`
- Fetch from `GET /api/workouts/[id]`
- Show full workout: each exercise with all logged sets, notes, duration, PRs flagged
- "Repeat Workout" button → navigates to `/log` pre-loaded with same exercises

---

## Step 2: Mobile Responsiveness Pass
**Priority: High — app is currently desktop-only**

### 2a: Mobile Nav with Hamburger Menu
- **File:** `src/components/ui/Nav.tsx`
- Hide nav links on mobile, show hamburger icon
- Slide-out or dropdown mobile menu
- Keep logo and user avatar always visible

### 2b: Responsive Layout
- **File:** `src/app/layout.tsx`
- Change container padding: `px-4 sm:px-6`
- Adjust max-width for mobile

### 2c: Dashboard Responsive Grids
- **File:** `src/app/page.tsx`
- Top stats: `grid-cols-2 sm:grid-cols-4`
- Week view + quick log: `grid-cols-1 md:grid-cols-3`
- Week day grid: `grid-cols-7` (keep, but smaller padding)
- PRs section: `grid-cols-1 md:grid-cols-2`
- Muscle volume: `grid-cols-3 sm:grid-cols-6`

### 2d: Other Pages Responsive Fixes
- Programs list: already `grid-cols-1 md:grid-cols-2` (OK)
- Block detail day cards: already responsive (OK)
- Workout logger: set table `grid-cols-[40px_1fr_1fr_1fr_36px]` — fine on mobile, inputs are flex
- Body metrics: form grid `grid-cols-2 sm:grid-cols-4` (already done)
- Settings/Injuries/Photos: mostly single-column already (OK)

---

## Step 3: Progression Tracking Logic
**Priority: Medium — adds intelligence to workout logging**

### 3a: Last Performance Lookup
- **New API:** `GET /api/exercises/[id]/last-performance` — returns the user's most recent sets for an exercise
- Workout logger: when loading exercises, fetch last performance and display "Last: 185×8, 185×8, 185×7" above the set table

### 3b: Progression Suggestion Display
- In workout logger, below the "Target" section, show suggested weight based on `progressionType`:
  - `linear`: last weight + increment (e.g., "Suggested: 190 lbs (+5)")
  - `double`: if all reps hit top of range, increase weight; else increase reps
  - `rpe_based`: show target RPE
  - `none`: just show last performance
- Display as a subtle info row, not intrusive

---

## Step 4: PWA Support
**Priority: Medium — enables offline workout logging**

### 4a: Web App Manifest
- **New file:** `public/manifest.json`
- App name, icons, theme color (#1a1a1a), display: standalone
- Add manifest link to layout.tsx metadata

### 4b: Service Worker for Offline Caching
- Install `next-pwa` package
- Configure in `next.config.mjs`
- Cache app shell and static assets
- Cache API responses for offline reads (workouts, exercises)

### 4c: Offline Workout Logging
- Enhance localStorage auto-save to work as full offline queue
- When offline: save workout finish actions to an outbox queue
- When back online: replay queued API calls
- Show offline indicator in Nav

---

## Step 5: General Polish
**Priority: Lower — finishing touches**

### 5a: Progress Photos Link on Progress Overview
- **File:** `src/app/progress/page.tsx`
- Wire the "+ Upload" button to link to `/progress/photos`

### 5b: Nav Active State for Sub-routes
- Injuries, Settings, History should be accessible from nav or user menu
- Add Log, Injuries, Settings to user dropdown or as secondary nav items

### 5c: Dashboard Enhancements
- Recent workouts section below the week view (last 5 workouts, clickable to `/history/[id]`)
- Link "Block Benchmarks" to the active program

---

## Implementation Order

| Step | Feature | Scope | New Files |
|------|---------|-------|-----------|
| 1a | Workout history page | Medium | 1 page |
| 1b | Workout detail view | Medium | 1 page |
| 2a | Mobile nav hamburger | Medium | 0 (edit Nav.tsx) |
| 2b | Responsive layout | Small | 0 (edit layout.tsx) |
| 2c | Dashboard responsive | Small | 0 (edit page.tsx) |
| 2d | Other pages responsive | Small | 0 (various edits) |
| 3a | Last performance API | Small | 1 API route |
| 3b | Progression suggestions | Medium | 0 (edit workout logger) |
| 4a | PWA manifest | Small | 1 file |
| 4b | Service worker | Medium | config changes |
| 4c | Offline queue | Large | new utility |
| 5a-c | General polish | Small | various edits |

Steps 1-2 are the highest impact. Step 3 adds training intelligence. Step 4 is the most complex. Step 5 is incremental polish.
