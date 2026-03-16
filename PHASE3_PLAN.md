# FitTrack Phase 3: Polish & Enhancements — Implementation Plan

## Overview

Phase 3 focuses on five areas: **Workout History/Replay**, **Advanced Progression Tracking**, **Notifications/Reminders**, **Mobile Responsiveness**, and **PWA Improvements**. This plan is ordered by impact and dependency — later features build on earlier ones.

---

## 1. Mobile Responsiveness Pass (Foundation — Do First)

Everything else benefits from mobile-friendly UI, so this comes first.

### 1a. Touch Target Audit
- Audit all interactive elements (buttons, links, inputs) across all pages
- Ensure minimum 44x44px tap targets (many buttons are currently 32px or `p-1`)
- Key files: `Nav.tsx`, `log/[workoutId]/page.tsx` (set inputs), `exercises/page.tsx` (search/filter)

### 1b. Safe Area Insets
- Add `env(safe-area-inset-*)` padding in `layout.tsx` and `globals.css` for notched phones
- Add `viewport-fit=cover` to viewport meta tag

### 1c. Table/Grid Responsiveness
- Workout logger set input grid (`grid-cols-[40px_1fr_1fr_1fr_36px]`) — switch to stacked layout on small screens
- Exercise detail set table (`grid-cols-[40px_1fr_1fr_1fr_1fr]`) — add horizontal scroll or stack
- Progress page milestone tables — already has `overflow-x-auto`, verify on 375px

### 1d. Typography & Spacing
- Audit `text-xs` / `text-sm` usage on mobile — ensure readability
- Ensure form labels are properly associated with inputs (`htmlFor`)
- Add bottom padding on pages where content may be obscured by mobile browser chrome

**Estimated scope:** ~15 files modified, no new files

---

## 2. In-App Toast Notification System

Replace all `alert()` calls with a proper toast system. This is prerequisite for PR notifications, streak alerts, etc.

### 2a. Toast Infrastructure
- Create `src/components/ui/Toast.tsx` — animated toast component (success/warn/error/info variants)
- Create `src/lib/toast.ts` — toast context/provider with `useToast()` hook
- Add `<ToastProvider>` to root `layout.tsx`

### 2b. Replace Existing Alerts
- Find all `alert()` calls across client components and replace with `toast.success()` / `toast.error()`
- Key locations: workout logger (save/finish/error), exercise creation, body metrics, injury tracker, settings export

### 2c. PR Achievement Toasts
- In workout logger, when a set is saved and `isPr: true` is returned from `POST /api/sets`, show celebratory toast
- Include exercise name and new PR weight

### 2d. Streak Milestone Toasts
- On dashboard load, check streak value and show toast at milestones (7, 14, 30, 60, 90, 365 days)
- Store last shown milestone in localStorage to avoid repeat toasts

**Estimated scope:** 2 new files, ~10 files modified

---

## 3. Workout History & Replay

### 3a. "Repeat Workout" Button
- Add "Repeat Workout" button on `/history/[workoutId]/page.tsx`
- On click: call `POST /api/workouts` to create a new workout, then for each exercise in the original workout, call `POST /api/workouts/[id]/exercises` to add them
- Redirect to `/log/[newWorkoutId]` with exercises pre-populated
- Weight suggestions auto-populate via existing `last-performance` API

### 3b. Workout Comparison View
- Add `/history/compare` page — select two workouts side-by-side
- Show per-exercise deltas: weight change, rep change, volume change
- Highlight improvements in green, regressions in red
- Link from history list page ("Compare" checkbox mode)

### 3c. "Last Session" Sidebar in Logger
- In `/log/[workoutId]/page.tsx`, add collapsible panel showing last session's sets for the current exercise
- Fetch from `GET /api/exercises/[id]/history` (already exists)
- Show weight × reps for quick reference while logging

**Estimated scope:** 1-2 new files, ~4 files modified

---

## 4. Advanced Progression Tracking

### 4a. Estimated 1RM Calculation
- Create `src/lib/progression.ts` with 1RM formulas (Epley: `weight × (1 + reps/30)`)
- Add `GET /api/exercises/[id]/estimated-1rm` route
- Display estimated 1RM on exercise detail page (`/exercises/[exerciseId]/page.tsx`)
- Add 1RM trend chart alongside existing volume chart

### 4b. Wave Progression Logic
- Implement wave cycling in workout logger suggestions
- Track cycle position (week 1: 3×10, week 2: 4×8, week 3: 5×5, week 4: deload)
- Store cycle state per BlockDayExercise (may need schema addition or derive from workout count)

### 4c. RPE-Based & Percentage-Based Suggestions
- RPE-based: suggest weight based on target RPE and last session's RPE/weight
- Percentage-based: use estimated 1RM × target percentage
- Display suggestion source in logger ("Based on 80% of est. 1RM" or "Linear +2.5kg")

### 4d. Progression Stall Detection
- Create `GET /api/exercises/[id]/progression-status` route
- Detect: same weight used for 3+ consecutive sessions without rep increase
- Show warning badge on exercise in logger and on exercise detail page
- Suggest alternative exercise (use `altExerciseId` from schema if set)

### 4e. Deload Suggestions
- After 4-6 weeks of consistent training (or when progression stalls), suggest deload
- Deload = reduce volume by 40-50% for 1 week
- Show banner on workout logger when deload is recommended

**Estimated scope:** 1-2 new files, ~5 files modified, 1-2 new API routes

---

## 5. PWA & Offline Improvements

### 5a. Offline Fallback Page
- Create `public/offline.html` — branded page explaining offline status
- Configure `next-pwa` to serve this for navigation requests when offline
- Add `runtimeCaching` config for API routes and static assets

### 5b. Service Worker Update Prompt
- Add update detection in layout — listen for `controllerchange` event
- Show toast: "New version available — tap to refresh"
- Handle graceful reload

### 5c. Background Sync Enhancement
- Register `sync` event in service worker for offline workout queue
- When connectivity returns, service worker triggers queue flush
- Show sync status indicator in nav (syncing/synced/offline)

### 5d. Cache Strategy
- Cache exercise library (rarely changes) with stale-while-revalidate
- Cache user's recent workouts for quick offline access
- Cache all static assets (CSS, JS, images) with cache-first strategy

**Estimated scope:** 2-3 new files, ~3 files modified

---

## 6. Additional Polish (Lower Priority)

### 6a. Loading Skeletons
- Replace "Loading..." text with shimmer skeleton components
- Create `src/components/ui/Skeleton.tsx`
- Apply to dashboard, exercise list, history, progress pages

### 6b. Goal Management UI
- Goal model already exists in schema — build CRUD UI
- Add `/goals` page with create/edit/complete flows
- Show goal progress on dashboard

### 6c. Injury Follow-Up Reminders
- On `/injuries` page load, query injuries where `followUpDate <= today`
- Show banner/toast for due follow-ups
- Add date picker for `followUpDate` in injury edit form (field exists but UI doesn't set it)

### 6d. Error Handling Standardization
- Create standard API response envelope: `{ data, error, status }`
- Add input validation with `zod` on all POST/PATCH routes
- Consistent error messages returned to client

---

## Implementation Order (Recommended)

| Phase | Feature | Depends On |
|-------|---------|------------|
| 3.1 | Mobile Responsiveness Pass | — |
| 3.2 | Toast Notification System | — |
| 3.3 | Replace all `alert()` with toasts | 3.2 |
| 3.4 | Workout Replay ("Repeat Workout") | — |
| 3.5 | Last Session sidebar in logger | — |
| 3.6 | Estimated 1RM + display | — |
| 3.7 | Progression stall detection | 3.6 |
| 3.8 | PR / Streak toasts | 3.2 |
| 3.9 | Workout comparison view | 3.4 |
| 3.10 | Wave / RPE / % progression | 3.6 |
| 3.11 | PWA offline improvements | — |
| 3.12 | Loading skeletons | — |
| 3.13 | Goal management UI | — |
| 3.14 | Deload suggestions | 3.7 |
| 3.15 | Error handling standardization | — |

---

## Key Technical Decisions

1. **Toast library**: Build lightweight custom solution (no external dependency) — 3 components, 1 context
2. **1RM formula**: Epley formula (most widely used, simple)
3. **Progression stall threshold**: 3 consecutive sessions at same weight without rep increase
4. **Deload trigger**: After 5 weeks of training or on progression stall
5. **PWA caching**: Use `next-pwa` built-in `runtimeCaching` config (no custom service worker needed)
6. **Comparison view**: Client-side only — fetch both workouts, diff in browser

---

## Out of Scope (Phase 4+)

- Push notifications (requires backend service + browser permission flow)
- Email notifications
- Social/sharing features
- AI-powered programming suggestions
- Video exercise demos
- Full test suite
