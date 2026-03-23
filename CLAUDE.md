# FitTrack - Claude Reference Document

## Developer Environment
- **Local OS:** Windows (PowerShell terminal)
- When giving CLI instructions, always use PowerShell syntax (e.g. `$env:VAR="value"` instead of `VAR=value command`)

## Overview
FitTrack is a personal workout tracking app built with Next.js 14, Prisma, PostgreSQL (Railway), and NextAuth (Google OAuth). Deployed on Vercel. The app uses a mobile-first 5-tab bottom navigation architecture with a 90s Street / Graffiti on Concrete design theme.

## Tech Stack
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL on Railway, via Prisma 7.5.0 with `@prisma/adapter-pg`
- **Auth:** NextAuth 4.24.13 with Google OAuth + Prisma adapter (database sessions)
- **Styling:** Tailwind CSS 3.4.1 with custom `ft-*` theme palette + Google Fonts
- **Fonts:** Permanent Marker (display), Caveat (handwritten), Barlow Condensed (body)
- **Charts:** Recharts 3.8.0
- **Hosting:** Vercel (auto-deploys on push to main)

## App Architecture — 5-Tab Bottom Navigation

The app is structured around a mobile-first bottom nav bar with five tabs:

| Position | Tab | Icon | Description |
|----------|-----|------|-------------|
| 1 | Home | House | Daily "Today" view — what to do right now |
| 2 | Program | Bar chart | Unified program hub — active dashboard + all programs list |
| 3 (center) | Log | Plus (raised FAB) | Start logging any activity type |
| 4 | Nutrition | Mug/cup | Daily food tracking, macro targets |
| 5 | Calendar | Calendar | Monthly overview of workouts + meals |

The center Log button is a raised floating action button with a gradient background. Active tab uses accent color; inactive tabs use muted tertiary text. The nav bar is fixed at the bottom with a gradient fade into content above.

## Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home / Today view (client component)
│   ├── layout.tsx                # Root layout (BottomNav + SessionProvider + ThemeInit)
│   ├── globals.css               # Global styles + Tailwind + Google Fonts + graffiti theme
│   ├── signin/page.tsx           # Google OAuth sign-in
│   ├── settings/page.tsx         # Settings (unit prefs, CSV export)
│   ├── program/page.tsx          # Program tab — unified dashboard + all programs list (client)
│   ├── calendar/page.tsx         # Calendar tab — monthly overview (client)
│   ├── stretch-timer/page.tsx    # Stretch timer flow — full-screen countdown (client)
│   ├── exercises/
│   │   ├── page.tsx              # Exercise library (client, pill filters)
│   │   ├── new/page.tsx          # Create exercise form (client)
│   │   └── [exerciseId]/page.tsx # Exercise detail + charts + progression (server)
│   ├── programs/
│   │   ├── page.tsx              # Programs list (server, legacy — kept for direct URL access)
│   │   ├── new/
│   │   │   ├── page.tsx          # Program creation hub (3 paths)
│   │   │   ├── goal/page.tsx     # Goal-first wizard (client)
│   │   │   ├── templates/page.tsx # Template picker (client)
│   │   │   └── builder/page.tsx  # Visual program builder (client)
│   │   └── [programId]/
│   │       ├── page.tsx          # Program detail with inline editing (server)
│   │       └── blocks/[blockId]/
│   │           ├── page.tsx      # Block detail (server)
│   │           └── days/[dayId]/page.tsx  # Day template (server)
│   ├── log/
│   │   ├── page.tsx              # Log tab — activity type picker (client)
│   │   └── [workoutId]/page.tsx  # Active workout logger (client)
│   ├── history/
│   │   ├── page.tsx              # Workout history list (client)
│   │   └── [workoutId]/page.tsx  # Workout session replay (client)
│   ├── progress/
│   │   ├── page.tsx              # Progress overview (server)
│   │   ├── body/page.tsx         # Body metrics with charts (client)
│   │   └── photos/page.tsx       # Progress photos gallery (client)
│   ├── nutrition/
│   │   ├── page.tsx              # Nutrition tab — daily food tracking (client)
│   │   └── plans/page.tsx        # Meal plans (client)
│   ├── injuries/page.tsx         # Injury tracker with CRUD (client)
│   └── api/                      # API routes (all wired to Prisma)
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── auth/debug/           # GET - auth debug info
│       ├── home/                 # GET - aggregated Today view data
│       ├── dashboard/            # GET - aggregated dashboard data (legacy)
│       ├── exercises/            # GET (list+filter), POST (create)
│       ├── exercises/[id]/       # GET exercise detail
│       ├── exercises/[id]/history/ # GET - exercise workout history
│       ├── exercises/[id]/estimated-1rm/ # GET - Epley formula 1RM estimate
│       ├── exercises/[id]/last-performance/ # GET - last logged sets
│       ├── exercises/[id]/progression-status/ # GET - stall detection
│       ├── exercises/recent/     # GET - recently used exercises
│       ├── goals/                # POST (create goal, optionally with program)
│       ├── programs/             # GET (list, ?status= filter), POST (create)
│       ├── programs/[id]/        # GET (detail with blocks)
│       ├── programs/[id]/blocks/ # POST (add block to program)
│       ├── programs/[id]/benchmarks/ # GET, POST (program benchmarks)
│       ├── programs/clone/       # POST (clone from template)
│       ├── blocks/[id]/          # GET (block with days+exercises)
│       ├── blocks/[id]/days/     # POST (create block day)
│       ├── blocks/day/[id]/      # GET (single block day template)
│       ├── blocks/day/[id]/exercises/ # POST (add exercise to day template)
│       ├── blocks/day/[id]/exercises/[exerciseId]/ # PATCH, DELETE
│       ├── blocks/day/[id]/exercises/reorder/ # PATCH (reorder exercises)
│       ├── workouts/             # GET (list, ?from/?to date filter), POST (create)
│       ├── workouts/[id]/        # GET, PATCH, DELETE
│       ├── workouts/[id]/exercises/ # POST (add exercise to workout)
│       ├── workouts/[id]/replay/ # POST (create workout from previous)
│       ├── workouts/last-by-day/ # GET (last workout per block day)
│       ├── sets/                 # POST (log set, auto-detects PR)
│       ├── activity-logs/        # GET (list, ?days= filter), POST (log non-lifting activity)
│       ├── metric-targets/       # GET (?programId= filter), POST/upsert (user metric targets)
│       ├── stretch-routines/     # GET (list with items), POST (create with items)
│       ├── schedule-overrides/   # GET (?programId/blockId/weekNumber), POST (create override)
│       ├── progress/weight/      # GET, POST (body metrics)
│       ├── progress/prs/         # GET (all personal records)
│       ├── progress/photos/      # GET, POST (progress photos)
│       ├── nutrition/foods/      # GET (search foods, ?search= or ?barcode=)
│       ├── nutrition/meals/      # GET (?date=), POST (create meal with items)
│       ├── nutrition/meals/[id]/ # PATCH (add/remove items), DELETE
│       ├── nutrition/targets/    # GET, POST (nutrition macro targets)
│       ├── nutrition/plans/      # GET, POST (meal plans)
│       ├── nutrition/plans/[id]/ # GET, PATCH, DELETE
│       ├── nutrition/plans/generate/ # POST (AI meal plan generation)
│       ├── injuries/             # GET, POST
│       ├── injuries/[id]/notes/  # POST (injury follow-up notes)
│       ├── integrations/         # Fitbit integration endpoints
│       └── migrate/              # POST (one-time schema migrations, dev only)
├── components/
│   ├── SessionProvider.tsx        # NextAuth SessionProvider wrapper
│   ├── OfflineSyncProvider.tsx    # Offline queue sync context
│   ├── ThemeInit.tsx              # Client-side theme initialization
│   └── ui/
│       ├── BottomNav.tsx          # 5-tab bottom navigation (client)
│       ├── Nav.tsx                # Legacy top nav bar (client, no longer in layout)
│       ├── Card.tsx               # Container with border/bg
│       ├── SectionHeader.tsx      # Section title + optional action
│       ├── Tag.tsx                # Badge (default/success/warn/danger)
│       ├── Stat.tsx               # Key-value metric display
│       ├── ProgressBar.tsx        # Visual progress bar
│       ├── DataTable.tsx          # Sortable table (client)
│       ├── EditableExerciseTable.tsx # Inline-editable exercise table (client)
│       ├── ExerciseBrowserPanel.tsx  # Slide-out exercise search panel (client)
│       ├── Skeleton.tsx           # Loading skeleton placeholder
│       ├── StatusIcon.tsx         # Status icons for programs/blocks/days
│       ├── SyncIndicator.tsx      # Online/offline sync status indicator
│       ├── Timeline.tsx           # Visual timeline/progress component
│       ├── Toast.tsx              # Toast notification system (provider + context)
│       ├── Tooltip.tsx            # Tooltip component
│       ├── EmptyState.tsx         # Empty state placeholder
│       ├── RecoveryCard.tsx       # Recovery/daily metrics card
│       ├── FitbitIcon.tsx         # Fitbit integration icon
│       └── index.ts              # Barrel exports
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient (PrismaPg adapter)
│   ├── auth.ts                   # NextAuth config (Google, Prisma adapter)
│   ├── auth-helpers.ts           # getAuthUserId(), requireAuth(), requireAuthUserId()
│   ├── demo-user.ts             # Demo user fallback for dev
│   ├── offline-queue.ts         # Offline workout queue (localStorage + sync)
│   ├── draft-store.ts           # Workout draft localStorage manager (24h TTL)
│   ├── progression.ts           # Progression logic (1RM calc, stall detection, suggestions)
│   └── theme.ts                 # Theme utilities (CSS variable helpers, chart theme)
├── types/
│   └── next-auth.d.ts            # Session type extension (adds user.id)
└── generated/prisma/             # Auto-generated Prisma client (gitignored)

prisma/
├── schema.prisma                 # Full database schema
└── seed.ts                       # Seeds 367 exercises across 20+ categories
```

## Database Schema (Key Models)

### Core Models (Original)
- **User** → has Goals, Programs, Workouts, Exercises, ExercisePrs, BodyMetrics, DailyMetrics, ProgressPhotos, Injuries, FoodItems, Meals, NutritionTargets, MealPlans, ActivityLogs, IntegrationData, UserMetricTargets, ScheduleOverrides, StretchRoutines
- **Goal** (active/achieved/abandoned) → type (weight/bodyweight/strength/powerlifting/competition/frequency/bodycomp/custom), optional link to Program, priority, metric, startValue, targetValue
- **Program** (active/completed/paused) → has Blocks, Benchmarks, Goals, UserMetricTargets, ScheduleOverrides, optional goalId link
- **ProgramBenchmark** → label, targetValue/unit/date, actualValue, optional blockId scope
- **Block** (active/completed/upcoming) → has BlockDays, Workouts, Benchmarks, NutritionTargets, ScheduleOverrides, phase field
- **BlockDay** (lifting/cardio/conditioning/mobility/rest) → has BlockDayExercises
- **BlockDayExercise** → links to Exercise + optional altExercise, has targetSets, targetRepRange, targetRpe, progressionType (linear/double/wave/rpe_based/percentage_based/none), progressionIncrement, notes
- **Workout** → has WorkoutExercises (logged sessions linked to Block/BlockDay)
- **WorkoutExercise** → has Sets
- **Set** → weight, reps, rir, rpe, isWarmup, isPr
- **Exercise** → 367 seeded, supports custom per-user, has StretchRoutineItems relation
- **ExercisePr** → auto-created when PR detected in POST /api/sets (types: weight, reps, volume, e1rm)
- **BodyMetric** → date, weight, bodyFatPct, source (manual/fitbit/scale)
- **DailyMetric** → steps, activeMinutes, caloriesBurned, sleep data, restingHr, source (fitbit)
- **ProgressPhoto** → imageUrl, poseType, optional programId
- **Injury** → bodyPart, severity, status, has InjuryNotes

### Nutrition Models
- **FoodItem** → name, brand, barcode, macros (calories/protein/carbs/fat/fiber/sugar/sodium), servingSize/Unit, source (custom/usda/openfoodfacts)
- **Meal** → userId, date, mealType (breakfast/lunch/dinner/snack), has MealItems
- **MealItem** → links Meal to FoodItem with quantity
- **NutritionTarget** → calories, protein, carbs, fat targets, optional block/goal link
- **MealPlan** → name, days, macro percentages, mealsPerDay, preferences
- **MealPlanDay** → dayNumber within plan, has MealPlanMeals
- **MealPlanMeal** → mealType, sortOrder, has MealPlanItems
- **MealPlanItem** → links to FoodItem with quantity

### New Models (Architecture Redesign)
- **ActivityLog** → non-lifting activities (STRETCH/HIIT/LISS/CLASS/CUSTOM), durationMin, intensity (LIGHT/MODERATE/HARD), distanceKm, avgHeartRate, caloriesBurned, instructor, studio, notes
- **IntegrationData** → external data from FITBIT/APPLE_HEALTH/GARMIN/MANUAL, metricType, value, date, rawPayload
- **UserMetricTarget** → editable goal targets (metricKey like "body_weight"/"bench_1rm"/"avg_steps"), targetValue, unit, optional programId scope. Unique on [userId, metricKey, programId]
- **ScheduleOverride** → temporary schedule modifications (scope: TODAY_ONLY/THIS_WEEK/THIS_WEEK_FORWARD), action (SKIP/SWAP/REPLACE/REDUCE_DAYS), weekNumber, dayOfWeek, JSON payload
- **StretchRoutine** → configurable stretch sequences with name, description
- **StretchRoutineItem** → name, durationSeconds, bilateral flag, sortOrder, optional exerciseId link

## Design System — 90s Street / Graffiti on Concrete

### Colors
```
Background: #2a2d2f (dark charcoal with subtle concrete noise texture)
Surface:    #333639
Card:       #3c3f42
Border:     #555555
Accent:     #E8572A (structural only — borders, underlines, progress bars. Never as text color.)

Movement Pattern Colors (constant):
  Push = #4A90D9    Pull = #5CB85C    Legs = #D9534F    Core = #F0AD4E

Text Hierarchy:
  Primary:   rgba(255,255,255, 0.92)
  Secondary: rgba(255,255,255, 0.62)
  Tertiary:  rgba(255,255,255, 0.40)
```

### Fonts (Google Fonts)
- **Display headers:** `Permanent Marker` (font-display class)
- **User-input data / handwritten values:** `Caveat` (font-handwritten class)
- **System labels / body text:** `Barlow Condensed` (font-body class)

### Design Patterns
- No solid buttons — use graffiti-style underlines for CTAs (`.cta-underline` class)
- Dashed border dividers between sections (`.section-divider` class)
- Accent colors are structural only — borders, background fills, bars, underlines
- Tab transitions with subtle fade-in animation (`.tab-enter` class)
- Concrete noise texture overlay on body via SVG filter

### Tailwind Extensions
- `ft-push`, `ft-pull`, `ft-legs`, `ft-core` — movement pattern color utilities
- `font-display`, `font-handwritten`, `font-body` — font family utilities
- All original `ft-*` color utilities still available

## Environment Variables
```
DATABASE_URL=postgresql://...          # Railway PostgreSQL
GOOGLE_CLIENT_ID=...                   # Google OAuth
GOOGLE_CLIENT_SECRET=...               # Google OAuth
NEXTAUTH_URL=https://app.vercel.app    # Production URL
NEXTAUTH_SECRET=...                    # Session encryption
```

## NPM Scripts
- `dev` / `build` / `start` / `lint` — standard Next.js
- `build` runs `prisma generate && next build`
- `postinstall` runs `prisma generate` (for Vercel)
- `db:seed` / `db:migrate` / `db:push` / `db:studio` — Prisma helpers

## Key Implementation Patterns
- **Navigation** — 5-tab bottom nav (`BottomNav.tsx`) fixed at bottom, replaces old top nav. Hidden on full-screen flows (workout logger, stretch timer). "More" menu contains: Exercises, History, Progress, Injuries, Settings. Program tab highlights for both `/program` and `/programs/*` paths. All internal navigation uses Next.js `Link` or `router.push()` (no raw `<a>` or `window.location.href`).
- **Home page** (`/`) — Client component fetching from `/api/home`. Distinguishes 401 (show sign-in) from other errors (show welcome/empty state). Priority Zone (Next Action card + Goal Pulse), three sub-tabs (Week Plan, Heatmap, Progress). Quick-links row at bottom (History, Progress, Exercises).
- **Server components** use direct Prisma queries with `getAuthUserId()` + `redirect("/signin")`
- **Client components** use `fetch("/api/...")` to API routes
- **Dynamic routes** use `params: Promise<{ id: string }>` pattern (Next.js 14+) in server components; plain `{ params: { id: string } }` in client components
- **All dynamic pages** export `const dynamic = "force-dynamic"` to prevent caching
- **Auth in API routes** — Two patterns: `requireAuthUserId()` throws on unauth (older routes); `requireAuth()` returns `[userId, errorRes]` tuple (newer routes, preferred)
- **API resilience** — `/api/home` wraps new-table queries in try/catch so endpoint works even before `db push` creates the new tables
- **PR detection** is automatic in POST /api/sets (compares weight to user's max)
- **Volume calculation** = weight x reps (excluding warmup sets)
- **Activity logging** — Non-lifting activities (stretch, HIIT, LISS, class, custom) logged via `/api/activity-logs` with ActivityType enum
- **Stretch timer** (`/stretch-timer`) — Full-screen countdown timer with circular progress, bilateral support (left/right auto-advance), auto-logs ActivityLog entry on completion
- **Workout logger** (`/log/[workoutId]`) supports both template-based (blockDayId) and blank (`new-blank`) workouts with exercise picker
- **Workout replay** (`/history/[workoutId]`) shows session details; POST `/api/workouts/[id]/replay` creates a new workout from a previous one
- **Exercise search** uses debounced fetch (300ms) with AbortController cleanup against GET `/api/exercises?search=`
- **Offline queue** (`/lib/offline-queue.ts`) queues failed workout saves and syncs on `online` event
- **Auto-save** uses debounced (2s) localStorage with `workout-draft-{id}` keys, 24h TTL, managed via `draft-store.ts`
- **Progression tracking** (`/lib/progression.ts`) — Epley 1RM estimation, stall detection over N sessions, wave/linear/double progression suggestions
- **Theme system** (`/lib/theme.ts`) — CSS variable-based theming with `ThemeInit` client component, chart color helpers. 4 named themes: default, midnight, iron, forest.
- **Program creation** — 3 paths: goal-first wizard (`/programs/new/goal`), template picker (`/programs/new/templates`), visual builder (`/programs/new/builder`)
- **Program cloning** — POST `/api/programs/clone` creates a full program from a template (blocks, days, matched exercises)
- **Program tab** (`/program`) — Unified client view: active program dashboard (timeline, progress bar, editable metric targets) + paused/completed programs list below. Fetches all programs via `/api/programs` (no status filter). Replaces the need to visit `/programs` separately.
- **Metric targets** — Editable per-user targets on Program tab, stored in `user_metric_targets`, displayed with progress bars and trend indicators
- **Schedule overrides** — Week plan editing via `/api/schedule-overrides` (Today Only / This Week / This Week Forward scopes)
- **Muscle heatmap** — Aggregates sets by exercise → muscle groups over past 7 days, displayed as body map with 4 heat tiers
- **Toast notifications** — `Toast.tsx` provides `useToast()` context with auto-dismiss (4s)
- **Exercise browser panel** — `ExerciseBrowserPanel.tsx` slide-out panel with search, used in day template editing
- **Editable exercise table** — `EditableExerciseTable.tsx` inline editing of sets/reps/RPE in day templates
- **PWA support** — `next-pwa` configured in `next.config.mjs`, offline fallback page at `/public/offline.html`
- **Nutrition tracking** — Full food diary with search (text + barcode), custom food entry, daily macro totals, nutrition targets, meal plans

## Build Plan

### Phase 1: Scaffold (COMPLETE)
1. Set up Next.js project with TypeScript, Tailwind, Prisma
2. Build all pages, components, and API route stubs with static/hardcoded data
3. Set up Railway PostgreSQL and connect DATABASE_URL
4. Seed exercise library (367 exercises across 20+ categories)
5. Wire up NextAuth with Google OAuth + Prisma adapter
6. Connect all 16 API routes to real Prisma queries
7. Deploy to Vercel with environment variables
8. Make all pages dynamic — replace hardcoded data with Prisma queries/API fetches

### Phase 2: Core Functionality (COMPLETE)
1. **Program/Block/Day creation UI** — `/programs/new` page, inline block/day forms on detail pages
2. **Finish button in workout logger** — creates workout, adds exercises, logs sets, finalizes with endTime
3. **Workout auto-save** — 2s debounced localStorage drafts, restored on reload (24h TTL)
4. **Exercise history charts** — Recharts volume-over-time chart + PR display on exercise detail page
5. **Body metrics page** (`/progress/body`) — weight logging form, trend chart, history table
6. **Progress photos** (`/progress/photos`) — photo gallery with pose types (front/side/back/custom)
7. **Injury tracker UI** (`/injuries`) — full CRUD with severity levels, notes, treatment tracking
8. **Settings page** — unit preferences (localStorage), data export
9. **Data export** — CSV export for workouts, body metrics, and PRs
10. **Exercise picker in workout logger** — search overlay for adding exercises to blank/template workouts
11. **Offline support** — queue system for offline workouts, auto-sync on reconnect

### Phase 3: Polish & Enhancements (COMPLETE)
1. **Workout history / session replay** — `/history` list + `/history/[workoutId]` detail view, replay API
2. **Advanced progression tracking** — 1RM estimation, stall detection, progression suggestions, per-exercise status API
3. **PWA support** — next-pwa integration, offline fallback page
4. **Visual program builder** — `/programs/new/builder` with drag-and-drop-style block/day creation
5. **Goal-first program creation** — `/programs/new/goal` wizard with auto-program scaffolding
6. **Template-based program creation** — `/programs/new/templates` with clone API
7. **Inline program editing** — editable exercise tables, exercise browser panel, reorder support
8. **UI components** — Skeleton loaders, StatusIcons, SyncIndicator, Timeline, Toast system
9. **Theme infrastructure** — CSS variable system, ThemeInit component, chart theme helpers
10. **Exercise filters** — pill-style multi-select filters on exercise library page

### Phase 4: Architecture Redesign (COMPLETE)
1. **Schema additions** — ActivityLog, IntegrationData, UserMetricTarget, ScheduleOverride, StretchRoutine, StretchRoutineItem
2. **Bottom nav shell** — 5-tab bottom navigation replacing top nav, raised center Log FAB
3. **Home tab** — Today view with Next Action card (contextual by time of day), Goal Pulse row, Week Plan / Heatmap / Progress sub-tabs
4. **Log tab** — Activity type picker grid (Lifting, Stretch, HIIT, LISS, Class, Custom) with scheduled workout banner and inline logging forms
5. **Program tab** — Unified hub: active program dashboard (timeline + metrics) + paused/completed programs list, replaces separate `/programs` page for primary navigation
6. **Calendar tab** — Monthly grid with workout/meal dots, legend, day detail cards
7. **Nutrition tab** — Restyled with macro target row, daily food tracking, action buttons
8. **Stretch timer** — Full-screen circular countdown timer with bilateral support, auto-advance, activity logging
9. **Design system** — Google Fonts (Permanent Marker, Caveat, Barlow Condensed), concrete noise texture, graffiti-style CTAs, movement pattern colors
10. **Schedule overrides API** — Week plan editing (Today Only / This Week / This Week Forward)

### Future Work
- Notification / reminder system
- Mobile responsiveness pass
- Fitbit OAuth integration completion
- AI meal plan generation (Anthropic API)
- Food label scanning (Claude Vision)
- Calendar meal logging overlay

## Current State
**Phase 1 through Phase 4 are complete.** The app is functional end-to-end with the new architecture:
- 5-tab bottom navigation with mobile-first layout
- 367 exercises seeded, 35+ API routes connected to real Prisma queries
- All pages fetch from database (no hardcoded data)
- Google OAuth working, deployed on Vercel + Railway PostgreSQL
- Full workout logging flow: pick template or start blank → search/add exercises → log sets → finish
- Non-lifting activity logging: stretch, HIIT, LISS, class, custom with duration/intensity
- Stretch timer flow with bilateral support and auto-logging
- Program creation via 3 paths: goal wizard, templates, visual builder
- Inline program/block/day editing with exercise browser
- Editable metric targets on unified Program dashboard (with all programs visible)
- Workout history and session replay
- Progression tracking with 1RM estimation and stall detection
- Body metrics (with "Log Weight" link from progress overview), progress photos, injury tracker all functional
- Muscle volume heatmap (7-day window)
- Monthly calendar with workout/meal overlays
- Nutrition: food diary, macro targets, meal plans
- Offline queue + auto-save + PWA support for data resilience
- CSV data export from settings page
- 90s Street / Graffiti on Concrete design theme with Google Fonts

**Important:** After schema changes, run `npx prisma db push` to create new tables in the database. The app is resilient to missing new tables (graceful degradation) but features like metric targets and stretch routines require the tables to exist.
