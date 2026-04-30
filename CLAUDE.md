# FitTrack - Claude Reference Document

## Developer Environment
- **Local OS:** Windows (PowerShell terminal)
- When giving CLI instructions, always use PowerShell syntax (e.g. `$env:VAR="value"` instead of `VAR=value command`)

## Overview
FitTrack is a personal workout tracking app built with Next.js 14, Prisma, PostgreSQL (Railway), and NextAuth (Google OAuth). Deployed on Vercel. The app uses a mobile-first 5-tab bottom navigation architecture with a multi-theme design system (7 themes).

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

Mobile-first bottom nav, post-R0–R15 layout per spec v2 §5 (was Home/Program/Log/Nutrition/Calendar in earlier phases):

| Position | Tab | Icon | Description |
|----------|-----|------|-------------|
| 1 | Gameplan | Bar chart | Active program dashboard — Today card, Week strip, sub-tabs Training / Nutrition / Lifestyle |
| 2 | Progress | Up-trend | Charts, calendar, check-ins, photos, injuries — historical view |
| 3 (center) | +Log | Plus (raised FAB) | Bottom sheet — Lifting / Stretch / HIIT / LISS / Class / Custom / Single workout from library |
| 4 | Nutrition | Mug/cup | Daily food tracking, macro targets, meal plans |
| 5 | Settings | Cog | Theme picker, units, integrations, account, advanced |

The center +Log button renders `LogActivitySheet` as a bottom sheet (not a route). Active tab uses accent color; inactive uses muted tertiary. Hidden during full-screen flows (workout logger, stretch timer, gameplan picker, planning mode).

Legacy `/`, `/calendar`, and `/injuries` stay reachable as routes; the latter two redirect to `/progress/calendar` and `/progress/injuries`.

## Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Legacy Home / Today view (route survives but not in BottomNav)
│   ├── layout.tsx                # Root layout (ThemeProvider + BottomNav + SessionProvider)
│   ├── globals.css               # Global styles + Tailwind + Google Fonts + theme-adaptive CTAs
│   ├── signin/page.tsx           # Google OAuth sign-in
│   ├── settings/page.tsx         # Settings (theme picker, unit prefs, CSV export)
│   ├── calendar/page.tsx         # Legacy /calendar — redirects to /progress/calendar (R15)
│   ├── injuries/page.tsx         # Legacy /injuries — redirects to /progress/injuries (R15)
│   ├── program/page.tsx          # Legacy Program tab metrics dashboard (still rendered if linked)
│   ├── stretch-timer/page.tsx    # Stretch timer flow — full-screen countdown (client)
│   ├── gameplan/                 # R4–R15 — gameplan tab + picker + planning mode
│   │   ├── page.tsx              # Active program dashboard (R5; sub-tabs Training/Nutrition/Lifestyle)
│   │   ├── new/page.tsx          # Picker entry — Step1Welcome → engine 5-step OR templates flow (R4/R14)
│   │   ├── new/templates/page.tsx              # 8-card gameplan template list (R14)
│   │   ├── new/templates/[slug]/customize/page.tsx  # Per-template wizard (R14)
│   │   └── [id]/planning/page.tsx              # Planning Mode sandbox (R7) with audit panel (R10)
│   ├── checkin/                  # R2 — weekly check-in
│   │   ├── page.tsx              # Pending / submitted / form views
│   │   └── [id]/page.tsx         # Per-week detail
│   ├── exercises/
│   │   ├── page.tsx              # Exercise library (client, pill filters)
│   │   ├── new/page.tsx          # Create exercise form (client)
│   │   └── [exerciseId]/page.tsx # Exercise detail + charts + progression (server)
│   ├── programs/
│   │   ├── page.tsx              # Programs list (server)
│   │   ├── new/
│   │   │   ├── page.tsx          # Legacy program creation hub (5 paths)
│   │   │   ├── goal/page.tsx     # Goal-first wizard (client)
│   │   │   ├── templates/page.tsx # Engine-template picker (legacy; gameplan templates live at /gameplan/new/templates)
│   │   │   ├── builder/page.tsx  # Visual program builder (client)
│   │   │   └── generate/page.tsx # Smart Generator questionnaire (client, Quick/Guided)
│   │   └── [programId]/
│   │       ├── page.tsx          # Program detail with inline editing (server)
│   │       └── blocks/[blockId]/
│   │           ├── page.tsx      # Block detail (server)
│   │           └── days/[dayId]/page.tsx  # Day template (server)
│   ├── log/
│   │   ├── page.tsx              # Redirects to /gameplan (FAB sheet replaces this)
│   │   ├── [workoutId]/page.tsx  # Active workout logger (client)
│   │   └── library/              # R15 — single-workout library
│   │       ├── page.tsx          # 8 curated one-offs as cards
│   │       └── [id]/page.tsx     # Detail + Start CTA → POST /api/workouts/from-library
│   ├── history/
│   │   ├── page.tsx              # Workout history list (client)
│   │   └── [workoutId]/page.tsx  # Workout session replay (client)
│   ├── progress/                 # R11–R15 — historical/progress consolidated under one parent
│   │   ├── page.tsx              # Progress overview (server)
│   │   ├── body/page.tsx         # Body metrics with charts (client)
│   │   ├── photos/page.tsx       # Progress photos gallery (client)
│   │   ├── calendar/page.tsx     # Monthly grid (moved from /calendar in R15)
│   │   ├── injuries/page.tsx     # Injury tracker (moved from /injuries in R15)
│   │   ├── check-ins/page.tsx    # Past check-in history with rec + change correlation (R11)
│   │   └── charts/page.tsx       # 4-chart aggregator: weight / volume / sleep / protein (R15)
│   ├── nutrition/
│   │   ├── page.tsx              # Nutrition tab — daily food tracking (client)
│   │   └── plans/page.tsx        # Meal plans (client)
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
│       ├── programs/generate/   # POST (run engine, create full program from ProgramConfig)
│       ├── programs/preview/    # POST (run engine, return blueprint preview without saving)
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
│       ├── migrate/              # POST (one-time schema migrations, dev only)
│       ├── checkins/             # GET (weeks=N), POST (upsert by date — runs goal engine inline)
│       ├── checkins/[id]/        # GET, PATCH (R2/R8)
│       ├── recommendations/      # GET (status filter), POST (R8 — engine output)
│       ├── recommendations/[id]/ # GET, PATCH (status transitions)
│       ├── recommendations/[id]/apply/   # POST — R10 dispatcher writes GameplanChange + flips status
│       ├── recommendations/refresh/      # POST — manual engine re-run, no CheckIn (R8)
│       ├── lifestyle-targets/    # GET (?programId=), POST/upsert per spec §7 (R6)
│       ├── lifestyle-logs/       # GET (from/to/keys), POST upsert by [userId, date, key] (R9)
│       ├── gameplan-changes/     # GET (audit list), POST (Planning Mode session log) (R10)
│       ├── gameplan-changes/[id]/undo/   # POST — re-runs dispatcher inverse + reverts rec status (R10)
│       └── workouts/from-library/        # POST — creates Workout source=SINGLE_LIBRARY from registry (R15)
├── components/
│   ├── SessionProvider.tsx        # NextAuth SessionProvider wrapper
│   ├── OfflineSyncProvider.tsx    # Offline queue sync context
│   ├── themed/                    # Theme-aware components (read theme config at runtime)
│   │   ├── ThemedButton.tsx       # Button adapting to theme's button.style
│   │   ├── ThemedCard.tsx         # Card using theme borders/radius/colors
│   │   ├── ThemedDivider.tsx      # Divider using theme borders.divider
│   │   ├── ThemedExerciseCard.tsx # Exercise card with movement indicator per theme
│   │   ├── ThemedIcon.tsx         # Icon set with per-theme variants (check/plus/x/star/arrow-right)
│   │   ├── ThemedNav.tsx          # Nav item with theme-aware active indicator
│   │   ├── ThemedOverlays.tsx     # Fixed decorative overlays rendered conditionally per theme
│   │   ├── ThemedRestTimer.tsx    # Timer (bar/radial/text) per theme config
│   │   ├── ThemedTexture.tsx      # Background texture overlay (svg-inline/css/none)
│   │   └── ThemePickerModal.tsx   # First-visit theme selection modal
│   ├── templates/                  # R13 — gameplan template wizard primitives
│   │   └── CustomizationInputRenderer.tsx  # select/multi/number/text/boolean/date dispatcher + validateAnswer
│   └── ui/
│       ├── BottomNav.tsx          # 5-tab bottom navigation with themed active indicators
│       ├── LogActivitySheet.tsx   # +Log FAB bottom sheet (Lifting/Stretch/HIIT/LISS/Class/Custom/Library)
│       ├── Nav.tsx                # Legacy top nav bar (client, no longer in layout)
│       ├── Card.tsx               # Container with theme-aware border-radius
│       ├── SectionHeader.tsx      # Section title + optional action
│       ├── Tag.tsx                # Badge (default/success/warn/danger)
│       ├── Stat.tsx               # Key-value metric display
│       ├── ProgressBar.tsx        # Visual progress bar
│       ├── DataTable.tsx          # Sortable table (client)
│       ├── EditableExerciseTable.tsx # Inline-editable exercise table (client)
│       ├── CategoryLaneView.tsx     # Movement-category grouped exercise view for generated programs (client)
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
│   ├── demo-user.ts              # Demo user fallback for dev
│   ├── offline-queue.ts          # Offline workout queue (localStorage + sync)
│   ├── draft-store.ts            # Workout draft localStorage manager (24h TTL)
│   ├── progression.ts            # Progression logic (1RM calc, stall detection, suggestions)
│   ├── theme.ts                  # Theme utilities (CSS variable helpers, chart theme)
│   ├── workout-library.ts        # R15 — 8-entry single-workout registry
│   ├── program-engine/           # Deterministic program generation engine (12 engine templates)
│   │   ├── index.ts              # Entry point: generate(), generateQuick()
│   │   ├── types.ts              # ProgramConfig, ProgramBlueprint, CategorySlot, etc.
│   │   ├── schedule-builder.ts   # Split suggestion + block periodization
│   │   ├── category-mapper.ts    # Slot trimming, injury/limitation adjustments
│   │   ├── exercise-selector.ts  # Fills slots from exercise library
│   │   ├── progression.ts        # Rep ranges, RPE, sets, progression type assignment
│   │   ├── templates.ts          # 12 preset ProgramConfig templates
│   │   ├── splits.ts             # 6 split definitions with category slots per day
│   │   ├── categories.ts         # Movement taxonomy, muscle mappings, injury rules
│   │   ├── volume.ts             # Weekly volume targets, phase modifiers
│   │   └── exercise-pools.ts     # DB exercise → engine MappedExercise enrichment
│   ├── goal-engine/              # R8–R11 — goal/recommendation engine
│   │   ├── index.ts              # runEngine() orchestrator + persistRecommendations / expirePriorPending
│   │   ├── types.ts              # EngineState, GoalSnapshot, LifestyleSnapshot, RecommendationDraft
│   │   ├── rate-math.ts          # Rolling avg, polyfit, weeklyRate, projectedHitDate, Epley 1RM
│   │   ├── feasibility.ts        # Per-goal-kind sustainable / aggressive / unrealistic bands (spec §8.3)
│   │   ├── series.ts             # buildDailySeries() + setsToE1RMSeries() (LOCF + rolling7 + expected)
│   │   ├── lifestyle-variables.ts # 15-variable registry per spec §7 (R9)
│   │   └── rules/                # 9 spec §8.4 rule modules (engine-complete after R11)
│   │       ├── index.ts          # RULE_REGISTRY + applyRules (severity-sorted cap of 3)
│   │       ├── behind-target.ts          # R8
│   │       ├── ahead-target.ts           # R8
│   │       ├── adherence-low.ts          # R8
│   │       ├── plateau-detected.ts       # R8
│   │       ├── lifestyle-streak-broken.ts # R9
│   │       ├── pain-flag.ts              # R9
│   │       ├── adherence-low-streak.ts   # R10 (cross-week)
│   │       ├── refeed-due.ts             # R11 (Lean Out)
│   │       └── deload-shift.ts           # R11
│   └── program-templates/        # R13 — 8 spec §3.1 gameplan templates
│       ├── index.ts              # programTemplates registry + getTemplateBySlug + R12 compat surface
│       ├── types.ts              # ProgramTemplate, BlockTemplate, DayTemplate, ExerciseSlot,
│       │                         #   SlotParameters, NutritionTarget, BenchmarkTarget,
│       │                         #   CustomizationInput, EngineWarning, GameplanLifestylePick
│       ├── resolver.ts           # ExerciseResolver + buildExerciseNotes (validates names → ids)
│       ├── apply-customizations.ts # 4-pass post-clone — start date / nutrition / 1RM scaling / injury subs
│       ├── evaluate-warnings.ts  # Per-template warning trigger branches
│       ├── first-90-days.ts      # 8 fully-authored templates: blocks, days, slots,
│       ├── size-and-strength.ts  #   per-block params, nutrition, benchmarks,
│       ├── lean-out.ts           #   customization inputs, engine warnings,
│       ├── powerbuilder.ts       #   default lifestyle picks (3 per spec §7),
│       ├── busy-parent.ts        #   defaultRefeedCadence (Lean Out only)
│       ├── athletic-foundations.ts
│       ├── comeback.ts
│       └── longevity.ts
├── providers/
│   └── ThemeProvider.tsx          # Theme context, CSS var application, first-visit picker
├── themes/
│   ├── index.ts                   # Theme registry (exports themes map + themeList)
│   ├── types.ts                   # ThemeConfig interface
│   ├── swatches.ts                # Derived theme swatches for pickers (auto-synced)
│   ├── graffiti.ts                # 90s Street — dark, spray-paint underlines, concrete texture
│   ├── cyberpunk.ts               # Dark Future — ultra-dark, cyan accent, glow-dot nav, scanlines
│   ├── notebook.ts                # Coach's Notebook — light cream, red accent, ruled lines
│   ├── blueprint.ts               # Blueprint — navy, blueprint grid, outline buttons
│   ├── arcade.ts                  # Retro Arcade — deep black, hot pink, pixel-border buttons
│   ├── lab.ts                     # Lab Report — clean white, clinical blue, fill buttons
│   └── iron.ts                    # Iron & Chalk — warm dark, brass accent, chalk texture
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
- **IntegrationData** → external data from FITBIT/APPLE_HEALTH/GARMIN/MANUAL/DERIVED (R9 added DERIVED), metricType, value, date, rawPayload
- **UserMetricTarget** → editable goal targets (metricKey like "body_weight"/"bench_1rm"/"avg_steps"), targetValue, unit, optional programId scope. Unique on [userId, metricKey, programId]
- **ScheduleOverride** → temporary schedule modifications (scope: TODAY_ONLY/THIS_WEEK/THIS_WEEK_FORWARD), action (SKIP/SWAP/REPLACE/REDUCE_DAYS), weekNumber, dayOfWeek, JSON payload
- **StretchRoutine** → configurable stretch sequences with name, description
- **StretchRoutineItem** → name, durationSeconds, bilateral flag, sortOrder, optional exerciseId link

### Gameplan v2 Models (R6–R15)
- **CheckIn** (R2/R6) → weekly self-report. Fields: energy / sleepQuality / soreness / stress / motivation (1–5), liftAdherence / cardioAdherence / nutritionAdherence (% 0–100), wins / struggles / notes, optional blockId. Unique on [userId, date]. Back-relation to `Recommendation`. POSTing one runs the goal engine inline and returns `{ checkIn, recommendations }`.
- **LifestyleTarget** (R6) → per-(user, programId, key) target row. Stable key like "sleep_hours_min" / "stress_max" / "protein_g". `value` + `unit` + `comparator` ("gte" | "lte" | "eq") drive in-band checks on dashboard cards.
- **LifestyleLog** (R9) → daily log per spec §4.5. `[userId, date, variableKey]` uniqueness, one of `numValue` or `textValue` set, source from `IntegrationSource`. Daily-cadence variables fill every day; weekly write to the week's last day; as-needed (pain_check) leave gaps.
- **Recommendation** (R8) → goal engine output. Kind enum (9 values: behind_target / ahead_target / adherence_low / plateau_detected / lifestyle_streak_broken / pain_flag / adherence_low_streak / refeed_due / deload_shift), status (pending/applied/dismissed/expired), severity (info/warning/urgent), title / body / suggestedField / suggestedValue / snapshotData (JSON). Indexed on [userId, status]. expirePriorPending() runs before each engine fire so only the latest run's pending rows surface.
- **GameplanChange** (R10) → audit row per spec §4.3. source (CHECK_IN_APPLY | PLANNING_MODE | MANUAL_EDIT), field (dotted path like "nutrition.calories"), oldValue / newValue (JSON), reason, optional recommendationId. Append-only — undoing an undo walks the chain rather than mutating history.

### Schema additions on existing models
- **Program** → `gameplanKind String?` (R11) — "lean-out" / "size-and-strength" / etc. mapping into the program-templates registry. Drives engine kind-gated rules (refeed_due) and the Header badge.
- **Program** → `maintenanceCalories Int?` (R6) — TDEE estimate driving picker NutritionCard math.
- **Block** → `weekStart Int?`, `weekEnd Int?` (R13) — program-week boundaries authored by templates; coexist with `blockNumber` + `durationWeeks`.
- **Block** → `refeedWeeks Int[]` (R6) — 1-indexed weeks within the block. Lean Out templates seed this with `[4, 8]` per block.
- **BlockDay** → `dayOfWeek Int?` (R13) — 1-indexed weekday slot used by templates; coexists with `dayNumber`.
- **BlockDayExercise** → `targetRir Int?` (R13), `variants String[]` (R6).
- **NutritionTarget** → `programId String?`, `notes String?` (R13) — program-scoped targets + qualitative calorie descriptors ("maintenance+200").
- **ProgramBenchmark** → `metric String?`, `notes String?` (R13).
- **Workout** → `source WorkoutSource?` (R15) — enum STANDALONE / GAMEPLAN / SINGLE_LIBRARY. Defaults to GAMEPLAN; `/log/library` workouts tag SINGLE_LIBRARY so they don't count toward adherence.

## Design System — Multi-Theme Architecture

### Theme System Overview
The app supports 7 visual themes, each defined as a `ThemeConfig` in `src/themes/`. Themes are switched at runtime via `ThemeProvider`, which converts theme configs to CSS custom properties consumed by Tailwind `ft-*` utilities AND sets a `data-theme="<id>"` attribute on `<html>` that scopes additional ornamental CSS in `globals.css`.

Each theme has its own **design language** — distinct fonts, container chrome, ornament, and motion — not just a different accent color. This is enforced by the rules below; when adding or editing a theme, preserve this distinctiveness.

| Theme | Style | BG | Card | Accent | Button | Nav | Signature Ornament |
|-------|-------|----|----|--------|--------|-----|--------------------|
| graffiti | 90s Street | #23272A | #3D4245 | Blue #3B82F6 | underline | underline | Alternating card rotation, yellow tape stamp, torn-edge h1 underline, FRESH sticker |
| cyberpunk | Dark Future | #05060C | #1C2232 | Cyan #00F0FF | ghost | glow-dot | Animated cyan border-breathe, HUD corner brackets, glowing h1/h2 underline, SYS:// watermark |
| notebook | Coach's Notebook | #E2D9C9 | #FAF6ED | Red #B5312A | underline | border-bottom | Spiral binding + red margin line, coffee-ring, no card borders |
| blueprint | Blueprint | #3868A3 | #2A5088 | Blue #4A9EFF | outline | underline | Cyanotype paper (inverted — cards DARKER than bg), crosshair corners, DWG title-block strip, grid texture |
| arcade | Retro Arcade | #07070F | #22223A | Pink #FF50C8 | pixel-border | underline | Pink/cyan triple-bezel, hard 4px pixel shadow, 1P + HI 999999 badges, CRT vignette |
| lab | Lab Report | #ECEDF0 | #FFFFFF | Blue #2563EB | fill | bg-fill | Barcode strip, SPECIMEN # watermark, alternating row shading, tabular-nums |
| iron | Iron & Chalk | #161514 | #2E2D2B | Brass #C8A96E | outline | border-bottom | Brass-knurled rib strip on every card top, brushed-plate gradient, chalk spray behind headings, IRON • CHALK stamp |

### ThemeConfig Structure (`src/themes/types.ts`)
Each theme defines:
- **Colors** — bg, bgCard, bgElevated, textPrimary/Secondary/Tertiary, accent, movement colors (push/pull/legs/core — constant), state colors, borders. All text tiers must clear **WCAG AA 4.5:1 on every surface** — see "Contrast floor" below.
- **Fonts** — display / data / body. Each theme uses its own 2-3 font family stack. **Every dark theme must pick a different font set** so swiping themes changes typography visibly. Current stacks:
  - graffiti — `Permanent Marker` / `Reenie Beanie` / `Archivo Black`
  - cyberpunk — `Orbitron` / `Share Tech Mono` / `Rajdhani`
  - notebook — `Caveat` / `Caveat` / `Patrick Hand`
  - blueprint — `Major Mono Display` / `IBM Plex Mono` / `IBM Plex Mono`
  - arcade — `Press Start 2P` / `VT323` / `Pixelify Sans`
  - lab — `IBM Plex Sans` / `JetBrains Mono` / `IBM Plex Sans`
  - iron — `Stardos Stencil` / `Teko` / `Oswald`
- **Borders** — card (CSS shorthand), divider, radius (`0` for sharp themes, `0.5rem` for rounded)
- **Texture** — type (`svg-inline` | `css` | `none`) + value (SVG markup, CSS background rules, or empty)
- **Component overrides:**
  - `exerciseCard.movementIndicator` — `left-bar` | `top-bar` | `border`
  - `nav.activeIndicator` — `underline` | `glow-dot` | `bg-fill` | `border-bottom`
  - `button.style` — `underline` | `outline` | `ghost` | `pixel-border` | `fill`
  - `restTimer.style` — `bar` | `radial` | `text-countdown` (+ optional `glowEffect`)

### How Theming Works
1. **ThemeProvider** (`src/providers/ThemeProvider.tsx`) — React context that stores current theme, applies CSS vars to `document.documentElement`, sets `data-button-style` and `data-theme` attributes, and shows the theme picker modal on first visit.
2. **CSS Variables** — All theme colors are converted to RGB triplets and set as `--ft-*` CSS vars. Tailwind's `ft-*` utilities (e.g. `bg-ft-surface`, `text-ft-white`) consume these via `rgb(var(--ft-*) / <alpha-value>)`.
3. **Themed Components** (`src/components/themed/`) — Read `ThemeConfig` directly via `useTheme()` for component-level behavior (button style, nav indicators, timer style, textures, icons, overlays).
4. **Theme-scoped CSS** (`globals.css` → `[data-theme="X"]` blocks) — Each theme has a dedicated section in `globals.css` that adds aggressive ornamental chrome (glow effects, border decorations, pseudo-element stamps, ::before/::after corner marks). When adding a new visual treatment that should differ between themes, add it under the theme-scoped block rather than making it theme-conditional in React.
5. **Data attributes** — `.cta-underline` reads `data-button-style`; everything else can select via `data-theme="<id>"`.

### Color Token Mapping (Tailwind → Theme)
```
ft-bg       → colors.bg            ft-surface  → colors.bgCard
ft-card     → colors.bgElevated    ft-accent   → colors.accent
ft-white    → colors.textPrimary   ft-pale     → colors.textPrimary
ft-light    → colors.textSecondary ft-dim      → colors.textTertiary
ft-border   → colors.border        ft-muted    → colors.textTertiary (for legibility)
ft-push/pull/legs/core → movement colors (constant across themes)
ft-success/warn/danger → state colors
```
Note: `--ft-muted` is **intentionally** mapped to `textTertiary` (not `borderSubtle`) so the many `text-ft-muted` and `placeholder:text-ft-muted` usages stay legible. The handful of `bg-ft-muted` / `border-ft-muted` uses render as subtle-tertiary and that's acceptable.

### Contrast floor (WCAG AA — enforced)
Every text tier (primary / secondary / tertiary) must clear **4.5:1 contrast** on every surface (`bg` / `bgCard` / `bgElevated`). Surface-to-surface (`bg → bgCard`) should clear **≥1.25:1** so containers visibly stand off the background — dark themes in particular need intentional card lift.

Verification script (run after any color change):
```bash
node scripts/audit-theme-contrast.js
```
The script parses `src/themes/*.ts`, composites alpha over surfaces, and exits non-zero if any text-tier × surface combo drops under 4.5:1. It also warns on surface deltas below 1.25:1. If a change fails, either (a) bump the text alpha/hex brighter, or (b) adjust the surface luminance. Do NOT ship a theme with failing combos.

### Theme differentiation rules
When touching themes, keep the following contracts:
1. **Fonts must differ across themes.** Three font slots (display / data / body) per theme; no dark theme shares its full stack with another.
2. **At least one ornamental element per theme must be unique** — a texture, border treatment, pseudo-element stamp, or animation. Don't remove a theme's signature chrome without adding a replacement.
3. **Theme-scoped CSS lives in `globals.css` under `[data-theme="X"]`.** Keep each theme's block labeled with its signature (see headers in the file).
4. **Fixed-position decorative elements** (spiral binding, title-block watermark, arcade badges, etc.) belong in `ThemedOverlays.tsx`, gated on `themeId`. Not in individual pages.
5. **Hardcoded icon characters** (`✓`, `×`, `+`, `★`) that carry thematic weight (completion, add, close, PR) should use `<ThemedIcon name="...">` so each theme renders its own variant (neon-line, pixel, sketchy, stencil, marker, drafted, clinical).
6. **Don't introduce a new `ft-*` Tailwind token** without adding a matching line to `ThemeProvider.applyThemeCssVars` for every theme.

### Themed Components
- **`ThemedButton`, `ThemedCard`, `ThemedDivider`, `ThemedExerciseCard`, `ThemedNav`, `ThemedRestTimer`** — read `useTheme().theme.components.*` to adapt structure per theme.
- **`ThemedTexture`** — renders the fixed-position texture overlay from `theme.texture.{type,value}`.
- **`ThemedIcon`** — core-icon set (`check` / `plus` / `arrow-right` / `star` / `x`) with per-theme SVG variants. Use this for completion ticks, add/close buttons, and PR markers.
- **`ThemedOverlays`** — returns fixed-position decorative elements based on `themeId`: spiral binding + margin line + coffee stain (notebook); title-block watermark + fold lines (blueprint); CRT vignette + 1P/HI badges (arcade); SYS:// watermark + glow line (cyberpunk); IRON • CHALK stamp (iron); FRESH tape (graffiti); barcode strip + specimen ID (lab). Rendered once in `layout.tsx` alongside `ThemedTexture`.

### Fonts (Google Fonts — all loaded via one `@import` in globals.css)
When adding a font, append it to the `@import url(...)` line at the top of `globals.css` **and** reference it in the relevant theme's `fonts` slot. Currently loaded families:
Permanent Marker, Caveat, Barlow Condensed, Space Mono, Libre Baskerville, Press Start 2P, IBM Plex Mono, IBM Plex Sans, Anton, Inter, VT323, Silkscreen, Pixelify Sans, Orbitron, Rajdhani, Share Tech Mono, Stardos Stencil, Teko, Oswald, Archivo Black, Reenie Beanie, Patrick Hand, Major Mono Display, JetBrains Mono.

### Design Patterns
- **CTA buttons** — `.cta-underline` class adapts per theme via `data-button-style`: spray-paint underline (graffiti), outline pill (blueprint), ghost border (cyberpunk), pixel shadow (arcade), solid fill (lab)
- **Dividers** — `.section-divider` uses theme's `borders.divider` CSS var; several themes override it under `[data-theme="X"]` for a theme-specific style (e.g. dashed for graffiti, brass for iron, dashed-heavy for blueprint)
- **Cards** — `Card.tsx` uses `--ft-border-radius` CSS var (sharp corners for graffiti/arcade/cyberpunk/iron/blueprint, rounded for lab/notebook). Theme-scoped CSS then layers on chrome (glow, knurled strip, rotation, corner marks, etc.).
- **Nav indicators** — BottomNav reads theme's `nav.activeIndicator` config (underline, glow-dot, bg-fill, border-bottom)
- **Timer** — Stretch timer uses `ThemedRestTimer` which renders bar/radial/text-countdown per theme
- **Textures** — `ThemedTexture` renders theme-specific overlays (concrete noise, scanlines, ruled lines, grid, chalk dust, aperture grille)
- **Blueprint is inverted** — unlike other themes where `bgCard` is *lighter* than `bg`, blueprint's cards are *darker* ink-bleed planes on a lighter paper bg. Keep this contract or the theme stops reading as drafting paper.
- **Notebook has `main` padding-left: 40px** to make room for the spiral binding. Do not override.
- Movement pattern colors (push/pull/legs/core) are constant across all themes

### Tailwind Extensions
- `ft-*` — All theme color utilities (bg, surface, card, accent, white, pale, light, dim, border, etc.)
- `ft-push`, `ft-pull`, `ft-legs`, `ft-core` — movement pattern color utilities
- `font-display`, `font-handwritten`, `font-body` — font family utilities mapped to theme fonts
- `ft-data-1` through `ft-data-6` — chart data series colors

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
- **Navigation** — 5-tab bottom nav (`BottomNav.tsx`) fixed at bottom, replaces old top nav. Hidden on full-screen flows (workout logger, stretch timer).
- **Home page** (`/`) — Client component fetching from `/api/home`. Distinguishes 401 (show sign-in) from other errors (show welcome/empty state). Priority Zone (Next Action card + Goal Pulse), three sub-tabs (Week Plan, Heatmap, Progress).
- **Server components** use direct Prisma queries with `getAuthUserId()` + `redirect("/signin")`
- **Client components** use `fetch("/api/...")` to API routes
- **Dynamic routes** use `params: Promise<{ id: string }>` pattern (Next.js 14+) in server components; plain `{ params: { id: string } }` in client components
- **All dynamic pages** export `const dynamic = "force-dynamic"` to prevent caching
- **Auth in API routes** — Two patterns: `requireAuthUserId()` throws on unauth (older routes); `requireAuth()` returns `[userId, errorRes]` tuple (newer routes, preferred)
- **API resilience** — `/api/home` wraps new-table queries in try/catch so endpoint works even before `db push` creates the new tables
- **PR detection** is automatic in POST /api/sets (compares weight to user's max)
- **Volume calculation** = weight x reps (excluding warmup sets)
- **Activity logging** — Non-lifting activities (stretch, HIIT, LISS, class, custom) logged via `/api/activity-logs` with ActivityType enum
- **Stretch timer** (`/stretch-timer`) — Full-screen countdown with `ThemedRestTimer` (bar/radial/text per theme), bilateral support (left/right auto-advance), auto-logs ActivityLog entry on completion
- **Workout logger** (`/log/[workoutId]`) supports both template-based (blockDayId) and blank (`new-blank`) workouts with exercise picker
- **Workout replay** (`/history/[workoutId]`) shows session details; POST `/api/workouts/[id]/replay` creates a new workout from a previous one
- **Exercise search** uses debounced fetch (300ms) with AbortController cleanup against GET `/api/exercises?search=`
- **Offline queue** (`/lib/offline-queue.ts`) queues failed workout saves and syncs on `online` event
- **Auto-save** uses debounced (2s) localStorage with `workout-draft-{id}` keys, 24h TTL, managed via `draft-store.ts`
- **Progression tracking** (`/lib/progression.ts`) — Epley 1RM estimation, stall detection over N sessions, wave/linear/double progression suggestions
- **Theme system** — 7 themes defined in `src/themes/`, applied via `ThemeProvider` (CSS vars + React context). Theme configs drive colors, fonts, borders, textures, and component-level overrides (button style, nav indicator, timer style). Chart colors via `getCssColor()` in `lib/theme.ts`. First-visit picker modal. Settings page theme switcher. `data-button-style` attribute on `<html>` drives CSS-based `.cta-underline` adaptation.
- **Program creation** — 5 paths: smart generator (`/programs/new/generate`), visual builder (`/programs/new/builder`), template picker (`/programs/new/templates`), quick blank (`/programs/new` inline), goal wizard (`/programs/new/goal`)
- **Program cloning** — POST `/api/programs/clone` creates a full program from a template (blocks, days, matched exercises)
- **Metric targets** — Editable per-user targets on Program tab, stored in `user_metric_targets`, displayed with progress bars and trend indicators
- **Schedule overrides** — Week plan editing via `/api/schedule-overrides` (Today Only / This Week / This Week Forward scopes)
- **Muscle heatmap** — Aggregates sets by exercise → muscle groups over past 7 days, displayed as body map with 4 heat tiers
- **Toast notifications** — `Toast.tsx` provides `useToast()` context with auto-dismiss (4s)
- **Exercise browser panel** — `ExerciseBrowserPanel.tsx` slide-out panel with search, used in day template editing
- **Editable exercise table** — `EditableExerciseTable.tsx` inline editing of sets/reps/RPE/progression in day templates, with alt exercise picker and progression increment field
- **Program Builder Engine** — Deterministic 4-stage pipeline: ScheduleBuilder → CategoryMapper → ExerciseSelector → ProgressionAssigner. Takes `ProgramConfig` + exercise library, outputs `ProgramBlueprint` with blocks, days, category-grouped exercise slots. No API calls — all logic local. 12 preset templates. Supports injuries, movement limitations, physique division priorities, powerlifting sticking points, and recovery modifiers.
- **Smart Generator flow** — Questionnaire at `/programs/new/generate` with Quick Path (5 questions, ~30s) and Guided Path (9 steps, 3-5 min). Preview step calls `/api/programs/preview` to show full blueprint before committing. Confirm calls `/api/programs/generate` to persist all DB records.
- **Category Lane View** — `CategoryLaneView.tsx` groups exercises by movement category (horizontal push, squat, etc.) for generated programs. Parses `[category|role|altsJSON]` metadata from notes field. Shows role-colored badges (compound/isolation/accessory), collapsible alternatives with one-tap swap. Falls back to flat `EditableExerciseTable` for non-generated programs.
- **Block phase system** — Generated blocks have `phase` field (accumulation/intensification/peaking/deload/prep/peak_week). Timeline component color-codes segments by phase. Block buttons show phase badges. Phase determines volume/intensity modifiers.
- **Engine warnings** — Stored in program description with `---WARNINGS---` delimiter. Parsed and displayed as dismissible banner on program detail page. Covers split mismatches, injury substitutions, recovery concerns.
- **Exercise swap** — PATCH `/api/blocks/day/[id]/exercises/[exerciseId]` now supports changing `exerciseId` (primary exercise) in addition to `altExerciseId`. CategoryLaneView shows alternatives per lane with swap buttons.
- **PWA support** — `next-pwa` configured in `next.config.mjs`, offline fallback page at `/public/offline.html`
- **Nutrition tracking** — Full food diary with search (text + barcode), custom food entry, daily macro totals, nutrition targets, meal plans

### R0–R15 Patterns (Gameplan v2 + Goal Engine)
- **Gameplan dashboard** (`/gameplan`) — Active program canvas (R5). Header (with R12 gameplanKind badge) + Today card + Week strip + sub-tabs Training / Nutrition / Lifestyle. Lifestyle tab renders Sleep / Stress / Protein cards driven by `LifestyleTarget` rows + `LifestyleLog` entries (R9), each card has an inline 1-tap quick-log control (`LifestyleQuickLog`).
- **Gameplan picker** (`/gameplan/new`) — Step1Welcome's primary CTA routes to `/gameplan/new/templates` (R14); secondary "Or use the questionnaire" link re-enters the engine 5-step flow (R4) at step 2; "Advanced setup" footer link unchanged.
- **Templates flow** (`/gameplan/new/templates`) — Lists 8 spec §3.1 gameplan templates from `programTemplates` (R13). Card → `/gameplan/new/templates/[slug]/customize` (R14). Wizard walks `template.customizationInputs`, surfaces engine warnings on review, posts to `/api/programs/clone { templateSlug, customizationAnswers }`. Draft persists per slug (24h TTL).
- **Clone API** (`POST /api/programs/clone`) — Two paths (R13): `templateSlug` flow deep-clones the seeded template Program (under templates@fittrack.system user) onto the user, seeds 3 LifestyleTarget rows, runs `applyCustomizations` (start date / nutrition from bodyweight / 1RM scaling / injury subs). Legacy `template`-object path preserved.
- **Planning Mode** (`/gameplan/[id]/planning`) — Sandbox over Program / Blocks / Goals / NutritionTarget / LifestyleTargets (R7). Diff vs original snapshot drives `DiffSummaryStrip` + `ApplyModal` + sequential `applyDiff` PATCH orchestration. Apply writes one `GameplanChange` row per session (R10); UndoToast posts inverse PATCHes. R15 added the `GameplanKindEditor` to the Goals tab.
- **Recent changes panel** (`RecentChangesPanel`) — Read-only audit list above the ConfirmBar in Planning Mode (R10). Pulls last 10 `GameplanChange` rows for the program with field / delta / source / reason / timestamp.
- **Check-in flow** (`/checkin`) — Weekly self-report (R2). On POST `/api/checkins`, the goal engine runs synchronously via `runEngine` + `expirePriorPending` + `persistRecommendations`, returning `{ checkIn, recommendations }`. Engine errors are caught — the check-in still saves. Submitted view shows `LifestyleWeekRow` + `RecommendationStub` + free-text recap.
- **Recommendation feed** (`RecommendationStub`) — Renders pending Recommendation rows (R8/R10). Apply button hits `POST /api/recommendations/[id]/apply` (R10 dispatcher: `nutrition.calories` / `nutrition.protein` / `lifestyle.{key}.target` / `goal.targetDate`). Toast.success surfaces the field/oldValue/newValue + Undo affordance posting to `/api/gameplan-changes/[id]/undo`. Unknown fields fall back to "Open in Planning Mode."
- **Recommendation banner** — On Planning Mode, when `?recommendationId=` is in the URL, `RecommendationBanner` fetches and surfaces the rec inline so the dashboard → Planning hand-off shows what the user clicked.
- **Goal Engine** (`src/lib/goal-engine/`) — Pure-math modules (rate-math, feasibility, series, lifestyle-variables) are browser-safe; only `index.ts` touches Prisma. `runEngine` hydrates `EngineState` (goals + adherence + lifestyle + recentRecommendations + nextBlock + deficit + gameplanKind), runs `RULE_REGISTRY`, severity-sorts and caps at 3 drafts, returns `{ drafts, state }`. All 9 spec §8.4 rules ship.
- **Program templates module** (`src/lib/program-templates/`) — 8 fully-authored gameplan templates (R13). Each carries blocks × days × slots × per-block params + spec §7 default lifestyle picks + (Lean Out) refeed cadence + customization inputs + warnings. Resolved against the live Exercise library at seed time (`scripts/seed-program-templates.ts`).
- **Workout library** (`src/lib/workout-library.ts`) — 8 curated one-offs (R15). `POST /api/workouts/from-library` resolves slot names case-insensitively, creates Workout with `source=SINGLE_LIBRARY`. Skipped exercises (un-resolvable names) surface as info toasts. Reachable from `/log/library` and the `LogActivitySheet` "Single workout" tile.
- **Progress consolidation** — Charts page (`/progress/charts`, R15) aggregates body weight / weekly volume / sleep / protein in one view. `/progress/calendar` and `/progress/injuries` host content moved from legacy `/calendar` and `/injuries`. `/progress/check-ins` history list (R11) joins CheckIn × Recommendation × GameplanChange rows client-side for full audit display.
- **Audit trail discipline** — Every plan mutation (rec apply, Planning Mode commit, manual edit) writes a `GameplanChange` row. Recommendation apply transitions are append-only — undoing an apply writes a new `GameplanChange` of source MANUAL_EDIT and flips the original rec back to `pending`. The `/progress/check-ins` page reads this audit to show "applied 2 changes" pills per check-in.

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
5. **Program tab** — Metrics dashboard with editable targets and progress bars
6. **Calendar tab** — Monthly grid with workout/meal dots, legend, day detail cards
7. **Nutrition tab** — Restyled with macro target row, daily food tracking, action buttons
8. **Stretch timer** — Full-screen circular countdown timer with bilateral support, auto-advance, activity logging
9. **Design system** — Google Fonts (Permanent Marker, Caveat, Barlow Condensed), concrete noise texture, graffiti-style CTAs, movement pattern colors
10. **Schedule overrides API** — Week plan editing (Today Only / This Week / This Week Forward)

### Phase 5: Multi-Theme System (COMPLETE)
1. **Theme architecture** — `ThemeConfig` interface, `ThemeProvider` context, CSS variable application pipeline
2. **7 theme definitions** — graffiti, cyberpunk, notebook, blueprint, arcade, lab, iron (each with full color palette, fonts, borders, texture, component overrides)
3. **Texture system** — `ThemedTexture` component rendering SVG-inline/CSS/none overlays per theme
4. **Theme picker modal** — First-visit modal for theme selection, settings page switcher
5. **Themed components** — ThemedButton, ThemedCard, ThemedNav, ThemedRestTimer, ThemedExerciseCard, ThemedDivider
6. **Component wiring** — BottomNav uses theme nav indicators, stretch timer uses ThemedRestTimer, Card uses theme border-radius, `.cta-underline` adapts to 5 button styles via CSS, `.section-divider` uses theme divider
7. **Shared swatches** — `src/themes/swatches.ts` auto-derives picker colors from theme configs
8. **WCAG AA contrast** — All textTertiary values tuned to ≥3:1 on bgCard across all themes

### Phase 6: Program Builder Engine (COMPLETE)
1. **Engine core** — 4-stage deterministic pipeline (ScheduleBuilder, CategoryMapper, ExerciseSelector, ProgressionAssigner) in `src/lib/program-engine/`
2. **Type system** — `ProgramConfig` (questionnaire input), `ProgramBlueprint` (output), `CategorySlot` (movement pattern lanes), `MovementCategory` (20 categories), `ExerciseRole`, `ProgressionType`
3. **Split resolution** — 6 splits (full_body, upper_lower, PPL, push_pull, bro_split, powerlifting) with frequency-based ranking and goal biases
4. **Block periodization** — Phase-based blocks (accumulation, intensification, peaking, deload) with duration-dependent structure (4/8/12/16 weeks)
5. **Category mapping** — Time budget trimming (30-90 min), injury exclusions, movement limitation substitutions, physique weak-point boosts
6. **Exercise selection** — Equipment-filtered, ranked by preference/role/variety, cross-day deduplication, 1-3 alternatives per slot, fallback chain
7. **Progression assignment** — Goal×role×phase rep scheme matrix, recovery-modulated set calculation, experience-based progression type selection
8. **12 preset templates** — Beginner through advanced (Starting Strength, PPL, Upper/Lower, Minimalist, Cut, Meet Prep, Bodybuilding, Bikini Prep, Athletic, Home Dumbbell, Recomp)
9. **Smart Generator UI** — `/programs/new/generate` with Quick Path (5 questions) and Guided Path (9 steps, conditional physique/powerlifting sections)
10. **Preview flow** — `/api/programs/preview` returns full blueprint without saving; UI shows block timeline, day breakdowns, exercises with categories before committing
11. **Generate endpoint** — `/api/programs/generate` persists Program → Blocks → BlockDays → BlockDayExercises with category metadata in notes, phase on blocks, warnings in description
12. **Category Lane View** — `CategoryLaneView.tsx` groups exercises by movement category with role badges, inline editing, collapsible alternatives with swap
13. **Block phase badges** — Timeline and block buttons color-coded by phase (blue=accumulation, orange=intensification, red=peaking, green=deload)
14. **Engine warnings banner** — Dismissible warnings on program detail for split mismatches, injury subs, recovery concerns
15. **Generated program identity** — "Generated" badge, category lane display, alt swap UI, phase awareness throughout

### Phase 7: Theme Differentiation + Logger Polish (COMPLETE)
1. **Exercise swap/delete in workout logger** — Each active exercise has Swap and Remove buttons. Swap reuses `ExercisePicker` with a dynamic title; Remove prompts for confirmation if sets were logged. Works for both template and improv workouts.
2. **Workout selector on `/log`** — Scheduled banner now deep-links to `/log/{blockDayId}` (previously always started blank). Added a bottom-sheet picker listing every day in the active block + a "Start Blank / Improv" option, reachable via "Change workout" or the Lifting tile.
3. **WCAG AA contrast sweep** — Every text-tier × surface pair across all 7 themes clears 4.5:1 (min 4.64:1). Surface deltas (`bg → bgCard`) lifted to ≥1.25:1 so cards visibly stand off the background, especially on dark themes. Script pattern in `/tmp/verify.js` for future audits.
4. **`--ft-muted` remapped** — previously mapped to `borderSubtle` (~1:1 contrast, invisible for text). Now maps to `textTertiary` so the 189 uses of `text-ft-muted` and all input placeholders are legible.
5. **Distinct design languages per theme** — Each theme now has its own fonts, chrome, ornament, and motion (not just accent color):
   - **Dark Future** — Orbitron / Share Tech Mono / Rajdhani; animated cyan border-breathe on cards, HUD corner brackets, glowing h1/h2 underline, pulsing accent
   - **Retro Arcade** — Press Start 2P / VT323 / Pixelify Sans; pink/cyan triple-layer bezel, hard 4px pixel shadow, 1P + HI 999999 badges, CRT vignette
   - **Iron & Chalk** — Stardos Stencil / Teko / Oswald; brass-knurled rib strip on every card top, brushed-plate gradient, chalk spray behind headings
   - **90s Street** — Permanent Marker / Reenie Beanie / Archivo Black; alternating card rotation, yellow tape stamps, torn-edge h1 underline, FRESH sticker
   - **Coach's Notebook** — Caveat / Caveat / Patrick Hand; spiral binding + red margin line + coffee stain, borderless paper-shadow cards
   - **Blueprint** — Major Mono Display / IBM Plex Mono / IBM Plex Mono; cyanotype paper bg with *inverted* (darker) cards, `+` crosshair corner marks, DWG title-block strip
   - **Lab Report** — IBM Plex Sans / JetBrains Mono / IBM Plex Sans; barcode strip, SPECIMEN # watermark, alternating row shading, tabular-nums
6. **`ThemedIcon` component** — Per-theme SVG variants of `check` / `plus` / `arrow-right` / `star` / `x` (neon-line / pixel / sketchy / stencil / marker / drafted / clinical). Wired into workout logger for completion ticks, add/close buttons.
7. **`ThemedOverlays` component** — Fixed-position decorative overlays rendered conditionally per theme (spiral binding, title-block, HI score, SYS:// watermark, IRON • CHALK stamp, FRESH tape, specimen barcode). Rendered once in `layout.tsx`.
8. **`data-theme` attribute** — `ThemeProvider` sets `data-theme="<id>"` on `<html>`; ornamental chrome lives in `[data-theme="X"]` blocks in `globals.css` rather than being React-conditional.

### Phase 8 — Gameplan v2 Rework (R0–R15, COMPLETE)

A 16-round phased rework that closed every gap in `docs/fittrack-v2-spec.md`. Each round shipped on its own branch (`R<N>-<topic>`) with strict 3-stage scope discipline and explicit hot-question confirmation before code writes.

| Round | Branch | Scope |
|-------|--------|-------|
| R0 | `R0-theme-contract` | Theme tokens / CSS-var contract |
| R1 | `R1-routing` | Route stub layout |
| R2 | `R2-checkin-ui` | `/checkin` weekly self-report UI (visual stubs) |
| R3 | `R3-logger-ui` | Workout logger refresh at `/log/[workoutId]` |
| R4 | `R4-picker-ui` | Gameplan picker UI at `/gameplan/new` (engine-template 5-step) |
| R5 | `R5-gameplan-dashboard` | Active program dashboard at `/gameplan` |
| R6 | `R6-gameplan-v2-schema` | 4 schema additions + `LifestyleTarget` table + 3 endpoints, resolving R2–R5 stubs |
| R7 | `R7-planning-mode` | Planning Mode sandbox at `/gameplan/[id]/planning` |
| R8 | `R8-goal-engine` | Goal engine: 4 launch rules + Recommendation model + UI surfaces |
| R9 | `R9-lifestyle-logs` | `LifestyleLog` model + 15-variable registry + 2 new rules + inline log UI |
| R10 | `R10-apply-pipeline` | `GameplanChange` audit + Apply pipeline + `adherence_low_streak` rule |
| R11 | `R11-engine-complete` | Final 2 rules (`refeed_due` + `deload_shift`) + check-in history view |
| R12 | `R12-template-seeding` | Gameplan template tagging + lifestyle-pick seeding (thin registry) |
| R13 | `R13-templates-landing` | Full 8-template module + clone API extension + slug reconciliation |
| R14 | `R14-picker-rebuild` | `/gameplan/new/templates` + `[slug]/customize` wizard pages |
| R15 | `R15-backlog-cleanup` | `/log/library` + `/progress/charts` + gameplan-kind editor |

After R15, the spec v2 architecture loop is closed. Remaining work is content authorship (six template `*Fires()` warning branches, exercise library expansion, 5 roadmap gameplans).

### Future Work
- Populate `evaluate-warnings.ts` `*Fires()` branches for the 6 stubbed templates (content)
- Exercise library expansion from `ExercisesSorted_v3.xlsx` (content)
- 5 roadmap gameplans per spec §3.2 (content)
- Notification / reminder system
- Fitbit OAuth integration completion
- AI meal plan generation (Anthropic API)
- Food label scanning (Claude Vision)
- Save-as-library affordance (user-curated single-workout library entries)
- Edit-gameplanKind UI ships in R15 Planning Mode; a one-shot first-launch nudge for legacy untagged programs is a future polish

## Current State
**Phase 1 through Phase 8 (R0–R15) are complete.** The app is functional end-to-end with the multi-theme architecture, program builder engine, fully-shipped goal engine + recommendation pipeline, gameplan template system with clone-and-customize wizard, and a fully differentiated per-theme design language:
- 5-tab bottom navigation with mobile-first layout
- 367 exercises seeded, 37+ API routes connected to real Prisma queries
- All pages fetch from database (no hardcoded data)
- Google OAuth working, deployed on Vercel + Railway PostgreSQL
- Full workout logging flow: pick template or start blank → search/add exercises → log sets → finish
- Non-lifting activity logging: stretch, HIIT, LISS, class, custom with duration/intensity
- Stretch timer flow with theme-adaptive timer display and auto-logging
- Program creation via 5 paths: smart generator, visual builder, templates, quick blank, goal wizard
- Inline program/block/day editing with exercise browser
- Editable metric targets on Program dashboard
- Workout history and session replay
- Progression tracking with 1RM estimation and stall detection
- Body metrics, progress photos, injury tracker all functional
- Muscle volume heatmap (7-day window)
- Monthly calendar with workout/meal overlays
- Nutrition: food diary, macro targets, meal plans
- Offline queue + auto-save + PWA support for data resilience
- CSV data export from settings page
- **Program Builder Engine** — deterministic 4-stage pipeline generating full periodized programs from questionnaire input
- Smart Generator with Quick Path (5 questions) and Guided Path (9 steps) with preview-before-commit flow
- 12 preset program templates (beginner through advanced competition prep)
- Category Lane View groups exercises by movement pattern with role badges and one-tap alternative swapping
- Block phase system with color-coded timeline (accumulation/intensification/peaking/deload)
- Engine warnings banner for split mismatches, injury substitutions, and recovery concerns
- Supports injuries, movement limitations, physique division priorities, powerlifting sticking points, recovery modifiers
- **7 visual themes with fully distinct design languages** — not just different accents, but different fonts (24 Google Fonts across 7 3-font stacks), container chrome (knurled brass rib, pink/cyan bezel, HUD corner brackets, spiral binding, crosshair marks, torn edges, barcode strips), ornament (tape stamps, watermarks, fold lines, chalk spray, coffee rings), and motion (cyan border-breathe animation, attract-mode pulse on accents)
- Theme-scoped CSS in `[data-theme="X"]` blocks in `globals.css` — aggressive ornamental treatments without React branching
- `ThemedIcon` component — 5-icon core set (check/plus/arrow-right/star/x) with per-theme SVG variants (neon-line, pixel, sketchy, stencil, marker, drafted, clinical)
- `ThemedOverlays` component — fixed-position decorative elements rendered conditionally per theme (spiral binding, title-block, arcade badges, specimen barcode, etc.)
- Theme-adaptive BottomNav (underline/glow-dot/bg-fill/border-bottom indicators)
- Theme-adaptive CTA buttons (underline/outline/ghost/pixel-border/fill)
- Theme-adaptive stretch timer (bar/radial/text-countdown)
- Theme-adaptive Card border-radius and section dividers
- **WCAG AA (4.5:1) text contrast on every text × surface combination across all 7 themes** (min 4.64:1); surface deltas ≥1.25:1 so containers stand off the bg
- First-visit theme picker modal + settings page theme switcher

**Phase 8 (R0–R15) additions on top of the above:**
- 5-tab BottomNav reshuffled to spec v2 §5: Gameplan / Progress / +Log / Nutrition / Settings (was Home / Program / Log / Nutrition / Calendar)
- Active program dashboard at `/gameplan` with sub-tabs Training / Nutrition / Lifestyle; gameplan-kind badge in header
- Weekly check-in flow at `/checkin` — runs the goal engine inline on submit and returns recommendations
- Goal engine — 9 spec §8.4 rules shipped (`behind_target`, `ahead_target`, `adherence_low`, `plateau_detected`, `lifestyle_streak_broken`, `pain_flag`, `adherence_low_streak`, `refeed_due`, `deload_shift`); pure-math modules browser-safe; severity-sorted cap of 3 drafts per run
- Recommendation system — Recommendation table + status pipeline (pending → applied / dismissed / expired); Apply dispatcher writes through to nutrition / lifestyle / goal-date fields and flips status atomically; toast Undo posts inverse change
- Lifestyle logging — 15-variable registry (sleep, steps, HRV, stress, protein hits, etc.) + LifestyleLog table + per-variable inline 1-tap log control on `/gameplan` lifestyle cards
- Audit trail — GameplanChange table captures every plan mutation (CHECK_IN_APPLY / PLANNING_MODE / MANUAL_EDIT); Planning Mode renders last 10 in `RecentChangesPanel`
- Planning Mode (`/gameplan/[id]/planning`) — sandbox with diff vs original, sequential apply orchestration, undo toast, gameplan-kind editor (R15)
- 8 fully-authored gameplan templates in `src/lib/program-templates/` — first-90-days, size-and-strength, lean-out, powerbuilder, busy-parent, athletic-foundations, comeback, longevity. Each carries blocks × days × slots × per-block parameters + spec §7 lifestyle picks + customization inputs + engine warnings
- Template wizard at `/gameplan/new/templates` + `[slug]/customize` with draft persistence + 4-pass `applyCustomizations` (start date / nutrition from bodyweight / 1RM scaling / injury subs)
- Single-workout library at `/log/library` — 8 curated one-offs; tagged `Workout.source=SINGLE_LIBRARY` so they don't count toward Gameplan adherence
- Progress consolidation — `/progress/charts` (4-chart aggregator), `/progress/calendar`, `/progress/check-ins` (audit-aware history), `/progress/injuries` all under one parent
- Gameplan-kind editor in Planning Mode Goals tab — dropdown of 8 templates + None; PATCH `/api/programs/[id]` validates against the registry

**Important:** After schema changes, run `npx prisma db push` to create new tables in the database. The app is resilient to missing new tables (graceful degradation) but R6–R15 features (check-ins, recommendations, lifestyle logs, gameplan changes, gameplanKind tag) require the additions to exist. To seed the 8 gameplan templates against a fresh DB:

```powershell
$env:DATABASE_URL="postgresql://..."
npx prisma db push
npx tsx scripts/add-missing-template-exercises.ts
npx tsx scripts/seed-program-templates.ts
```

The seeder validates every exercise name against the live library and fails fast with a complete missing-name list if any don't resolve. No DB writes happen until validation passes.
