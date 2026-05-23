# FitTrack Phase 4 — Development Plan

## Overview

Phase 4 builds on the complete Phase 1-3 foundation to add the remaining features from the original brainstorm. The focus areas are: **nutrition tracking**, **smart progression in the logger**, **visual goal/program progress**, **external integrations**, and **quality-of-life improvements** to existing features.

---

## Feature Audit: Brainstorm vs. Current State

| Brainstorm Feature | Current State | Phase 4 Work Needed |
|--------------------|---------------|---------------------|
| Injury tracking with follow-ups/treatment | **Done** — full CRUD, notes, severity, status | Enhance: injury-aware exercise flags |
| Progression per movement in programs | **Partial** — 6 types in DB, algorithms in `progression.ts` | Wire to workout logger UI, add selection UI in day templates |
| Progress photos | **Done** — URL-based gallery with pose types | Add file upload, side-by-side comparison |
| Weight tracking | **Done** — manual logging + trend chart | Add Fitbit integration, body circumferences |
| Food label scanning + nutrition info | **Not built** | New: full nutrition module |
| Meal plan generation | **Not built** | New: meal planning system |
| Goal types (frequency, strength, bodyweight, competition) | **Done** — 8 goal types in wizard | Enhance: non-linear paths, visual progress |
| Secondary goals | **Partial** — priority field exists | Add explicit secondary goal linking |
| Program benchmarks | **Done** — data model complete | Add benchmark UI to program detail page |
| Visual program/goal progress mapping | **Not built** | New: timeline/progress dashboard |
| Block calendars and scheduling | **Partial** — dates in model, no calendar UI | Add visual calendar view |
| Cardio/conditioning/mobility days | **Done** — 5 day types | Enhance: type-specific metrics (duration, distance, HR zones) |

---

## Development Phases

### Phase 4A: Smart Progression & Logger Enhancements
**Priority: HIGH — Directly improves daily workout experience**

#### 4A-1: Progression Type UI in Day Templates
- Add progression type selector dropdown to `EditableExerciseTable.tsx`
- Show progression increment field when type ≠ `none`
- Fields already exist in `BlockDayExercise` model — just need UI
- **Files:** `src/components/ui/EditableExerciseTable.tsx`, day template pages

#### 4A-2: Smart Suggestions in Workout Logger
- Surface progression suggestions during active logging in `/log/[workoutId]`
- Use existing `progression.ts` functions:
  - `estimateE1RM()` → show estimated 1RM
  - `suggestWaveProgression()` → wave cycle suggestions
  - `detectStall()` → stall warnings
- Add "Suggested: X lbs × Y reps" chip above set input
- Fetch last performance via existing `/api/exercises/[id]/last-performance`
- **Files:** `src/app/log/[workoutId]/page.tsx`, `src/lib/progression.ts`

#### 4A-3: Deload Suggestions
- When stall detected (3+ sessions same weight/reps), suggest deload
- Show banner: "Consider a deload — you've been at this weight for N sessions"
- Link to deload block creation
- **Files:** `src/lib/progression.ts`, workout logger

---

### Phase 4B: Visual Progress & Goal Dashboard
**Priority: HIGH — Core value proposition**

#### 4B-1: Goal Progress Dashboard
- New page or section on `/progress` showing all active goals
- Progress bar for each goal (startValue → currentValue → targetValue)
- For frequency goals: calculate from workout count data
- For strength goals: pull from latest 1RM/PR data
- For bodyweight goals: pull from latest BodyMetric
- **Files:** New component, `src/app/progress/page.tsx`

#### 4B-2: Program Benchmark UI
- Display benchmarks on `/programs/[programId]` detail page
- Add/edit benchmark form (target value, date, unit)
- Show actual vs target with visual progress indicators
- Auto-detect benchmark achievement from workout/body data
- **Files:** `src/app/programs/[programId]/page.tsx`, existing API at `/api/programs/[id]/benchmarks`

#### 4B-3: Program Timeline View
- Visual timeline showing blocks, benchmarks, and milestones
- Use existing `Timeline.tsx` component as foundation
- Show current position in program
- Display upcoming block transitions
- **Files:** `src/components/ui/Timeline.tsx`, program detail page

#### 4B-4: Non-Linear Goal Paths
- Support competition prep cycles (bulk → cut → peak → compete)
- Allow goals with multiple phases/targets (not just linear start→end)
- Schema addition: `GoalPhase` model with phase-specific targets
- Visual mapping of phase transitions on goal dashboard
- **Schema change:** New `GoalPhase` model

---

### Phase 4C: Nutrition Module
**Priority: MEDIUM — Large new feature, significant effort**

#### 4C-1: Database Schema for Nutrition
- New models: `Meal`, `MealItem`, `FoodItem`, `NutritionTarget`
- `FoodItem`: name, calories, protein, carbs, fat, serving size, barcode
- `Meal`: date, mealType (breakfast/lunch/dinner/snack), userId
- `MealItem`: links Meal → FoodItem with quantity
- `NutritionTarget`: daily calorie/macro targets, linked to Goal/Block
- **Files:** `prisma/schema.prisma`

#### 4C-2: Food Database & Search API
- Integrate with USDA FoodData Central API (free, comprehensive)
- Cache frequently-used foods in local `FoodItem` table
- Search endpoint: `GET /api/nutrition/foods?search=`
- Custom food creation for unlisted items
- **Files:** New API routes under `src/app/api/nutrition/`

#### 4C-3: Food Label Scanner
- Camera-based barcode scanning using `quagga2` or `html5-qrcode` library
- Barcode → USDA/Open Food Facts API lookup
- Alternatively: photo-based label OCR using a vision API (Claude vision or Tesseract.js)
- Auto-populate nutrition fields from scan
- **Files:** New component `src/components/ui/FoodScanner.tsx`, new API route

#### 4C-4: Daily Meal Logging UI
- New page: `/nutrition` — daily food log
- Quick-add meals with food search
- Daily totals: calories, protein, carbs, fat
- Visual macro breakdown (pie chart or progress bars)
- **Files:** `src/app/nutrition/page.tsx`

#### 4C-5: Meal Plan Generator
- Generate meal plans for N days based on macro targets
- Input: calorie target, macro split, number of meals/day, dietary preferences
- Could use Claude API for intelligent meal generation
- Or template-based approach with predefined meal combos
- Save generated plans, modify individual meals
- **Files:** `src/app/nutrition/plans/page.tsx`, new API route

#### 4C-6: Nutrition Targets Linked to Goals/Blocks
- Set macro targets per block (bulk = surplus, cut = deficit)
- Auto-calculate calorie targets based on body weight + goal
- Show nutrition adherence on program dashboard
- **Files:** Block detail pages, nutrition API

---

### Phase 4D: External Integrations
**Priority: MEDIUM — Nice-to-have, significant API work**

#### 4D-1: Fitbit Integration
- OAuth2 flow for Fitbit Web API
- Sync: body weight, body fat %, daily steps, heart rate
- Auto-populate BodyMetric entries from Fitbit
- `source` field already exists on BodyMetric model
- **Files:** New OAuth route, new sync API, settings page update
- **Note:** Requires Fitbit developer account + app registration

#### 4D-2: Apple Health / Google Fit (Future)
- Web-based approach limited — these are mobile-first APIs
- Consider a React Native wrapper or PWA Web Bluetooth approach
- Bluetooth scale protocol (e.g., Xiaomi Mi Scale) via Web Bluetooth API
- **Feasibility:** Low for web app, better suited for native mobile
- **Recommendation:** Defer unless going native; focus on Fitbit (has web API)

---

### Phase 4E: Quality-of-Life Enhancements
**Priority: MEDIUM-LOW — Polish items**

#### 4E-1: File-Based Photo Upload
- Replace URL-only photos with actual file upload
- Use Vercel Blob or Cloudinary for image storage
- Add camera capture for mobile (use `<input type="file" capture="environment">`)
- Thumbnail generation for gallery
- **Files:** `src/app/progress/photos/page.tsx`, new upload API

#### 4E-2: Photo Comparison Tool
- Side-by-side before/after viewer
- Select two photos by date/pose to compare
- Overlay or slider comparison mode
- **Files:** New component `src/components/ui/PhotoCompare.tsx`

#### 4E-3: Body Circumference Tracking
- Extend BodyMetric model: chest, waist, hips, arms, thighs, calves, neck
- Or new `BodyMeasurement` model for flexibility
- Add measurement form to `/progress/body`
- Trend charts per measurement site
- **Schema change:** Extend `BodyMetric` or new model

#### 4E-4: Injury-Aware Exercise Suggestions
- When logging a workout, check for active injuries
- Flag exercises that target injured body parts
- Suggest alternative exercises from the same movement pattern
- Use `altExerciseId` field already on `BlockDayExercise`
- **Files:** Workout logger, exercises API

#### 4E-5: Block Calendar View
- Visual weekly/monthly calendar for program blocks
- Show scheduled workout days, completed workouts, rest days
- Quick-navigate to specific workout day from calendar
- **Files:** New component, block detail page

#### 4E-6: Cardio/Conditioning-Specific Metrics
- For cardio days: log duration, distance, avg heart rate, pace
- For conditioning: log intervals, work/rest periods, rounds
- Extend `Set` model or add `CardioLog` model
- **Schema change:** New fields or model

---

## Recommended Implementation Order

```
Sprint 1 (4A): Smart Progression & Logger
├── 4A-1: Progression type UI in day templates
├── 4A-2: Smart suggestions in workout logger
└── 4A-3: Deload suggestions

Sprint 2 (4B): Visual Progress
├── 4B-1: Goal progress dashboard
├── 4B-2: Program benchmark UI
├── 4B-3: Program timeline view
└── 4B-4: Non-linear goal paths

Sprint 3 (4C-1 to 4C-4): Nutrition Foundation
├── 4C-1: Nutrition schema
├── 4C-2: Food database & search API
├── 4C-3: Food label scanner
└── 4C-4: Daily meal logging UI

Sprint 4 (4C-5, 4C-6, 4D): Nutrition Advanced + Integrations
├── 4C-5: Meal plan generator
├── 4C-6: Nutrition targets linked to goals
└── 4D-1: Fitbit integration

Sprint 5 (4E): Polish
├── 4E-1: File-based photo upload
├── 4E-2: Photo comparison tool
├── 4E-3: Body circumferences
├── 4E-4: Injury-aware suggestions
├── 4E-5: Block calendar view
└── 4E-6: Cardio-specific metrics
```

---

## Feasibility Notes

### Highly Feasible (use existing patterns)
- **4A (Progression UI)** — All data and algorithms exist, just needs UI wiring
- **4B-1/4B-2 (Goal/Benchmark dashboards)** — Data exists, need visualization
- **4E-3/4E-4/4E-5 (Body measurements, injury flags, calendar)** — Small schema + UI additions

### Feasible with External Dependencies
- **4C-2 (Food database)** — USDA FoodData Central API is free and well-documented
- **4C-3 (Barcode scanning)** — `html5-qrcode` is mature; OCR is harder but doable
- **4D-1 (Fitbit)** — Well-documented OAuth2 API, but requires developer account setup
- **4E-1 (Photo upload)** — Vercel Blob is simple but adds cost; Cloudinary has free tier

### Complex / Requires Careful Design
- **4C-5 (Meal plan generation)** — AI-powered generation is powerful but needs guardrails
- **4B-4 (Non-linear goal paths)** — Schema design is non-trivial; needs careful modeling
- **4D-2 (Apple Health/Google Fit)** — Not practical for web; defer to native

### Not Recommended for Web
- **Bluetooth scale sync** — Web Bluetooth API has very limited browser support
- **Phone health data** — Requires native app wrappers (React Native, Capacitor)

---

## Schema Changes Summary

New models needed:
- `FoodItem` — nutrition database entries
- `Meal` — daily meal log entries
- `MealItem` — individual items within a meal
- `NutritionTarget` — daily/block calorie+macro targets
- `GoalPhase` — non-linear goal phase tracking (optional)

Model extensions:
- `BodyMetric` — add circumference fields (chest, waist, hips, etc.)
- `Set` or new `CardioLog` — cardio-specific metrics (duration, distance, HR)

---

## Tech Additions

| Package | Purpose | Phase |
|---------|---------|-------|
| `html5-qrcode` | Barcode scanning for food labels | 4C-3 |
| `@vercel/blob` or `cloudinary` | Image upload storage | 4E-1 |
| `tesseract.js` (optional) | OCR for nutrition labels | 4C-3 |
| Fitbit Web API | Body metrics sync | 4D-1 |
| USDA FoodData Central API | Food/nutrition database | 4C-2 |
