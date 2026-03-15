# Phase 2 Implementation Plan

All 16 API routes are already implemented and database-connected. Phase 2 is purely UI wiring and integration work.

---

## Step 1: Wire up the Workout Logger "Finish" Button
**Priority: Highest — this is the core user flow**

- **File:** `src/app/log/[workoutId]/page.tsx`
- Add `onClick` handler to the existing Finish button (line ~222)
- On click: `PATCH /api/workouts/[id]` with `endTime`, `notes`, and `rating`
- Show confirmation/success state, then redirect to dashboard or workout summary
- Add basic validation (at least one set logged)

## Step 2: Workout Auto-Save (localStorage)
**Priority: High — prevents data loss**

- **File:** `src/app/log/[workoutId]/page.tsx`
- Save workout state to `localStorage` on every set/exercise change (debounced ~2s)
- On page load, check for saved state and offer to restore
- Clear saved state after successful "Finish"
- Key format: `workout-draft-{workoutId}`

## Step 3: Program/Block/Day Creation UI
**Priority: High — needed to set up training programs**

### 3a: Create Program page
- **New file:** `src/app/programs/new/page.tsx` (client component)
- Form fields: name, description, status (default "active")
- Submit → `POST /api/programs`
- Wire the existing "+ New Program" button on `/programs` to link here

### 3b: Block Creation API + UI
- **New file:** `src/app/api/programs/[id]/blocks/route.ts` — POST endpoint to create a block within a program
- **Update:** `src/app/programs/[programId]/page.tsx` — add "+ Add Block" button
- Form (inline or modal): name, type, status, orderIndex

### 3c: Day Creation UI
- **Update:** `src/app/programs/[programId]/blocks/[blockId]/page.tsx` — add "+ Add Day" button
- Form (inline or modal): dayLabel, dayType (lifting/cardio/conditioning/mobility/rest), orderIndex
- Submit → `POST /api/blocks/[id]/days` (already exists)

### 3d: Day Exercise Assignment UI
- **Update:** `src/app/programs/[programId]/blocks/[blockId]/days/[dayId]/page.tsx`
- Add "+ Add Exercise" button
- Exercise picker (search existing exercises)
- Set target sets, rep range, rest period, progression type
- This requires a new API: `POST /api/blocks/day/[id]/exercises/route.ts`

## Step 4: Exercise History Charts
**Priority: Medium — enhances exercise detail pages**

- **File:** `src/app/exercises/[exerciseId]/page.tsx`
- Replace "Volume chart placeholder" with a Recharts `LineChart` (volume over time)
- Replace "Session history table placeholder" with a `DataTable` of past sessions
- Fetch data from `GET /api/exercises/[id]/history`
- Use the already-installed `recharts` package

## Step 5: Body Metrics Page
**Priority: Medium — API already exists**

- **File:** `src/app/progress/body/page.tsx`
- Wire "+ Log Weight" button to a form/modal (date, weight, bodyFatPct, source)
- Submit → `POST /api/progress/weight`
- Fetch entries from `GET /api/progress/weight`
- Display weight trend chart using Recharts
- Display entries in a DataTable

## Step 6: Injury Tracker UI
**Priority: Medium — API exists**

- **File:** `src/app/injuries/page.tsx`
- Wire "+ Log Injury" button to a form (bodyPart, severity, description, status, date)
- Submit → `POST /api/injuries`
- Fetch and display active/resolved injuries from `GET /api/injuries`
- Add ability to add follow-up notes via `POST /api/injuries/[id]/notes`

## Step 7: Progress Photos
**Priority: Lower — requires file upload handling**

- **File:** `src/app/progress/photos/page.tsx`
- Wire "+ Upload" button to a file input
- Handle image upload (base64 or external storage TBD)
- Submit → `POST /api/progress/photos`
- Display photo gallery grid from `GET /api/progress/photos`

## Step 8: Settings Page
**Priority: Lower**

- **File:** `src/app/settings/page.tsx`
- Implement unit toggle (lbs/kg, miles/km) — store in user preferences
- Wire data export button using the installed `xlsx` package
- Export workouts, exercises, body metrics as XLSX

## Step 9: Data Export
**Priority: Lower — depends on Settings**

- Create export utility in `src/lib/export.ts`
- Aggregate user data from Prisma (workouts, sets, body metrics, PRs)
- Generate XLSX using the `xlsx` package
- Trigger browser download from Settings page

---

## Implementation Order Summary

| Step | Feature | New Files | Estimated Scope |
|------|---------|-----------|-----------------|
| 1 | Finish button | 0 | Small — single handler |
| 2 | Auto-save | 0 | Small — localStorage logic |
| 3a | Create Program | 1 page | Medium — form + routing |
| 3b | Create Block | 1 API + UI update | Medium |
| 3c | Create Day | UI update | Small |
| 3d | Day exercises | 1 API + UI update | Medium |
| 4 | Exercise charts | 0 | Medium — Recharts integration |
| 5 | Body metrics | 0 | Medium — form + chart |
| 6 | Injury tracker | 0 | Medium — form + list |
| 7 | Progress photos | 0 | Medium — upload + gallery |
| 8 | Settings | 0 | Small-Medium |
| 9 | Data export | 1 utility | Small |

Steps 1-3 are the critical path — they enable the core workout logging flow end-to-end. Steps 4-6 add important tracking features. Steps 7-9 are nice-to-haves.
