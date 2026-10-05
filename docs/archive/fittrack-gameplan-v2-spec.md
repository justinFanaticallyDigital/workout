# FitTrack v2 — Gameplan Architecture Spec

**Status:** Planning · Source of truth for Claude Design and Claude Code
**Date:** April 25, 2026
**Replaces:** Phase 7 questionnaire/Game Plan engine work specced in early April (chat `c8411f65`); folds in Phases 1–7 of the existing app
**Does not replace:** The Program Engine (Phase 6, `src/lib/program-engine/`), the 7-theme system (Phases 5 + 7), the Prisma core schema, or the workout logger

---

## 0. Purpose

FitTrack v2 reorganizes the app around a single central object — the **Gameplan** — that wraps training, nutrition, and lifestyle into one coherent, adjustable, time-bound plan. The existing app has the data model, exercise library, workout logger, program engine, theme system, and most API routes already shipped. v2 is a *re-shelling and a goal/adjustment layer on top* — not a rewrite.

This doc covers:
1. Reuse inventory (what survives, extends, retires)
2. Core concepts and the 8 launch Gameplans
3. Data model deltas
4. App shell and screen-by-screen UX
5. Goal Engine (rate math, rolling averages, weekly check-ins)
6. Planning Mode (sandbox, projections, feasibility)
7. Lifestyle variable pool (15 variables)
8. Migration plan
9. Build order

---

## 1. Reuse Inventory

### Survives untouched
- **Prisma core schema:** User, Exercise, ExercisePr, Workout, WorkoutExercise, Set, BodyMetric, DailyMetric, ProgressPhoto, Injury, FoodItem, Meal, MealItem, ActivityLog, IntegrationData, StretchRoutine, ScheduleOverride
- **Program Engine** (`src/lib/program-engine/`): 4-stage pipeline, type system, 12 templates, 6 splits, all of `categories.ts`, `volume.ts`, `progression.ts`, `exercise-pools.ts`. Continues to back the "build a custom training plan" flow.
- **Workout logger** (`/log/[workoutId]`): template-based + blank, exercise picker, set logging, auto-save, draft store, offline queue
- **Exercise library**: 367 seeded exercises, search, filters, detail page, recent list, last-performance, estimated-1RM, progression-status, history
- **Body metrics, progress photos, injury tracker** — UIs and APIs
- **Nutrition food diary**: food search, barcode lookup, meal logging, custom foods, daily macro totals
- **Theme system**: all 7 themes, ThemeProvider, ThemedComponents (Button, Card, Divider, Nav, RestTimer, Icon, Overlays, Texture), data-theme attribute, scoped CSS, font stacks, contrast floor
- **Auth**: NextAuth + Google + Prisma adapter
- **Infra**: PWA, offline queue, draft store, CSV export

### Extends
- **`Program`** gets `gameplanId` FK (a Program belongs to a Gameplan; a Gameplan has one Program)
- **`Goal`** model becomes the contents of `GameplanGoal` (see §3) — the field set widens to support three goal types (body metric / lift PR / performance test) and rate-of-change descriptors
- **`NutritionTarget`** stays, but is now scoped to a Gameplan (or a Block within a Gameplan's Program) rather than free-floating
- **`UserMetricTarget`** is largely subsumed by `GameplanGoal`. Keep the table for now (non-Gameplan users still need it for the empty-state "skip" path), but new active-Gameplan goals route through `GameplanGoal`.
- **Bottom nav** restructures from 5 tabs (Home / Program / Log / Nutrition / Calendar) to 5 different tabs (Gameplan / Progress / +Log / Nutrition / Settings)
- **Program creation paths** drop from 5 to 2: **Pick a Gameplan** (curated library) and **Build custom** (the existing engine, accessible from Settings → Advanced or Gameplan tab → "Build my own"). Goal wizard, template picker, visual builder, and Smart Generator all collapse into one of these two.

### Net new
- **`Gameplan`** model — the wrapper
- **`GameplanGoal`** model — typed goals with rate-of-change
- **`GameplanChange`** model — linear edit history
- **`GameplanCheckIn`** model — weekly snapshots and recommendations
- **`LifestyleVariable`** registry (static config, not a DB table) and **`LifestyleLog`** model (per-day entries)
- **Gameplan picker / onboarding flow**
- **Goal Engine** library (`src/lib/gameplan-engine/`) — rate math, rolling averages, projection curves, feasibility checks, weekly check-in rule set
- **Planning Mode** — sandbox UI for adjustments
- **Single-workout library** view (derived from Gameplan day templates)
- **Gameplan tab** with Training / Nutrition / Lifestyle sub-tabs
- **Progress tab** (absorbs Calendar functionality plus all charting and check-in history)

### Retires
- **Home / "Today" page** — the function moves into the Gameplan tab's top-of-page "Next Action" card
- **Calendar tab** — folds into Progress tab as a sub-view
- **Goal-first wizard, template picker, visual builder, Smart Generator** as separate paths — all collapse into the new Gameplan picker or the existing Program Engine (one button: "Build custom")
- **`/programs/new/*` routes** — replaced by `/gameplans/new`
- **Phase 7 ConsultationResponse / GamePlan engine spec** (chat `c8411f65`) — superseded by this doc; if any code from that spec was scaffolded, deprecate it

---

## 2. Core Concepts

### Gameplan as the spine

A Gameplan is a coherent, time-bound plan that wraps three sub-components and a goal set:

```
Gameplan (e.g. "Size & Strength")
├── Goals[]                  — typed, with target dates and rates
├── Training Plan            — = a Program (existing model, blocks/days/exercises)
├── Nutrition Plan           — calorie/macro targets, optional MealPlan, refeed rules
├── Lifestyle Plan           — 3 tracked variables from the pool, with daily/weekly targets
├── Changes[]                — linear edit history
└── Check-Ins[]              — weekly engine snapshots + recommendation cards
```

Three entry states:
1. **Active Gameplan** — user picked one; everything in the app is contextualized by it
2. **No Gameplan** — user skipped; logger and tracking still work; Gameplan tab shows the picker
3. **Single workout from library** — user picked a one-off workout (sourced from Gameplan day templates); this does not start a Gameplan and is logged as `source: standalone`

### Goal types

Three primary types, each with its own rate math:

| Type | Examples | Rate unit | Trajectory math |
|------|----------|-----------|----------------|
| **Body metric** | body weight, body-fat %, waist circumference | lb/wk, %/mo, in/mo | linear projection vs rolling 7- or 10-day average |
| **Lift PR** | bench 1RM, squat 1RM, e1RM on any lift | lb/wk, lb/block | linear projection vs Epley-estimated 1RM from logged sets |
| **Performance test** | vertical jump, 40-yd sprint, 5K time, broad jump, plank hold | unit/mo | linear projection vs scheduled test sessions |

(Lifestyle adherence — e.g., hitting a step target — is tracked via Lifestyle, not a Goal. Don't conflate.)

### The adjustment loop (the differentiator)

This is what takes the app from tracker to coach. Mechanic:

1. **Targets are explicit** — every goal has a rate, a start, a target, and a target date. The Gameplan tab shows projected trajectory as a chart with a feasibility band.
2. **Actuals are tracked** — body weight via rolling average, training adherence via logged workouts vs scheduled, lifestyle via daily logs.
3. **Weekly check-in fires** — Sunday evening (configurable). Engine compares actual vs projected and produces 0–3 recommendation cards. Examples:
   - "You're 1.8 lb behind target → drop calories 100/day, OR extend by 2 weeks."
   - "You missed 3 sessions last week → push deload back 1 week."
   - "You've cut twice in 3 weeks → consider a refeed week before adjusting again."
4. **User decides** — recommendations land as cards on the Gameplan tab. They never auto-apply. Each card has Apply / Dismiss / Open in Planning Mode.
5. **Applied changes** create a `GameplanChange` row with field-level diff and an optional note. History is queryable from the Progress tab.

The engine is **rule-based, not LLM-driven**. Same philosophy as Program Engine — predictable, free, fast, debuggable.

---

## 3. The 8 Launch Gameplans

Each Gameplan is a *typed configuration* the rest of the app can reason about — not just a preset. Schema fields (defined in §4) capture all the structural variation. Content (block/day/exercise specifics, copy, defaults) lives in seed data.

### Launch set (Path 1: framework + 3 detailed Gameplans first)

**Already detailed in chat `a03ff5ce`** (no new content work required):
1. **First 90 Days** — beginner on-ramp, habit-first, 12wk linear, 3x/wk full body, lifestyle-heavy
2. **Size & Strength** — intermediate workhorse, 16wk block periodization, 4–6x/wk
3. **Lean Out** — fat-loss focus, 12wk linear with refeed weeks, deficit-driven, cardio prescribed

These three ship as the launch set. Framework supports the rest from day one; remaining 5 land as content updates.

### Roadmap (sketched, content TBD)
4. **Powerbuilder** — strength + aesthetics, 16wk block, 1RM test at end
5. **Busy Parent / Pro** — time-constrained, 30–45 min, full body 2–3x/wk, "missed-day" logic
6. **Athletic Foundations** — performance, conjugate-style, 12wk, sprint/jump/plyo testing
7. **Comeback** — return from injury/break, reverse-linear, daily readiness G/Y/R, pain check
8. **Longevity** — 40+, undulating, Z2 + VO2 max, balance/single-leg emphasis

### Per-Gameplan structural fields (set on the Gameplan record)
- `goalBlend` — weighted % across muscle / strength / fat-loss / performance / habit / health
- `periodization` — `LINEAR` | `BLOCK` | `WAVE` | `UNDULATING` | `CONJUGATE` | `REVERSE_LINEAR`
- `durationModel` — `FIXED` (exact weeks) | `RECURRING` (12-wk cycle, repeats)
- `defaultDaysPerWeek` and `allowedDaysRange` — e.g., default 4, range [3, 6]
- `lifestyleVariables` — array of 3 variable keys from the pool (§7)
- `weekAnnotations` — per-block array of week types: `REGULAR` | `DELOAD` | `REFEED` | `TEST` | `PEAK`
- `lifestyleEmphasis` — `LIGHT` | `MODERATE` | `HEAVY` (drives copy and check-in weighting)


---

## 4. Data Model Deltas

All additions go in `prisma/schema.prisma`. Run `npx prisma db push` after.

### 4.1 New: `Gameplan`

```prisma
model Gameplan {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identity
  templateKey     String?  // "first_90_days" | "size_strength" | ... | null for custom
  name            String
  description     String?
  status          GameplanStatus  @default(DRAFT)

  // Structure
  durationModel   DurationModel
  durationWeeks   Int?            // null when RECURRING
  startDate       DateTime
  endDate         DateTime?       // computed at apply for FIXED, null for RECURRING

  // Typed config (§3)
  goalBlend           Json    // { strength: 40, muscle: 40, aesthetic: 20 }
  periodization       PeriodizationStyle
  lifestyleVariables  Json    // ["sleep_duration", "steps", "stress"]
  lifestyleEmphasis   LifestyleEmphasis  @default(MODERATE)
  weekAnnotations     Json?   // [{ blockNumber: 1, weekType: "DELOAD", weekIndex: 4 }, ...]

  // Sub-component links
  trainingProgramId   String?  @unique
  trainingProgram     Program? @relation("GameplanTraining", fields: [trainingProgramId], references: [id])

  mealPlanId          String?
  mealPlan            MealPlan? @relation(fields: [mealPlanId], references: [id])

  // Relations
  goals       GameplanGoal[]
  changes     GameplanChange[]
  checkIns    GameplanCheckIn[]
  nutritionTargets NutritionTarget[]
  lifestyleLogs    LifestyleLog[]   // scoped via gameplanId

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, status])
}

enum GameplanStatus { DRAFT ACTIVE PAUSED COMPLETED ABANDONED }
enum DurationModel { FIXED RECURRING }
enum PeriodizationStyle { LINEAR BLOCK WAVE UNDULATING CONJUGATE REVERSE_LINEAR }
enum LifestyleEmphasis { LIGHT MODERATE HEAVY }
```

A user can have at most one ACTIVE Gameplan at a time (enforced in app logic, not DB). Multiple DRAFT or PAUSED is fine.

### 4.2 New: `GameplanGoal`

```prisma
model GameplanGoal {
  id          String   @id @default(cuid())
  gameplanId  String
  gameplan    Gameplan @relation(fields: [gameplanId], references: [id], onDelete: Cascade)

  type        GoalType
  metric      String   // "body_weight" | "bench_1rm" | "vertical_jump" | ...
  exerciseId  String?  // when type = LIFT_PR
  exercise    Exercise? @relation(fields: [exerciseId], references: [id])

  startValue  Float
  targetValue Float
  unit        String

  startDate   DateTime
  targetDate  DateTime

  // Cached descriptors from rate math
  rateValue   Float?   // -0.6
  rateUnit    String?  // "lb/wk"

  status      GoalStatus  @default(ACTIVE)
  priority    Int         @default(1)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([gameplanId, status])
}

enum GoalType { BODY_METRIC LIFT_PR PERFORMANCE_TEST }
enum GoalStatus { ACTIVE ACHIEVED MISSED ABANDONED PAUSED }
```

### 4.3 New: `GameplanChange`

```prisma
model GameplanChange {
  id          String   @id @default(cuid())
  gameplanId  String
  gameplan    Gameplan @relation(fields: [gameplanId], references: [id], onDelete: Cascade)

  occurredAt  DateTime @default(now())
  source      ChangeSource
  commitId    String?       // groups multi-field Planning Mode commits

  field       String        // "calories" | "training_days" | "duration_weeks" | "goal:body_weight:targetValue" | ...
  oldValue    Json
  newValue    Json
  note        String?       // user-supplied or system-generated reason

  @@index([gameplanId, occurredAt])
}

enum ChangeSource { USER PLANNING_MODE CHECK_IN_APPLY SYSTEM }
```

### 4.4 New: `GameplanCheckIn`

```prisma
model GameplanCheckIn {
  id          String   @id @default(cuid())
  gameplanId  String
  gameplan    Gameplan @relation(fields: [gameplanId], references: [id], onDelete: Cascade)

  weekStart       DateTime  @db.Date
  generatedAt     DateTime  @default(now())
  status          CheckInStatus @default(PENDING)
  reviewedAt      DateTime?

  snapshot        Json   // { rolling7BodyWeight, sessionsCompleted, sessionsScheduled, lifestyleAdherence: {...}, goalProjections: [...] }
  recommendations Json   // [{ id, kind, title, body, action: { ... } }, ...]

  @@unique([gameplanId, weekStart])
}

enum CheckInStatus { PENDING REVIEWED PARTIALLY_APPLIED FULLY_APPLIED DISMISSED }
```

### 4.5 New: `LifestyleLog`

```prisma
model LifestyleLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gameplanId  String?
  gameplan    Gameplan? @relation(fields: [gameplanId], references: [id], onDelete: SetNull)

  date        DateTime  @db.Date
  variableKey String    // "sleep_duration" | "steps" | "daily_readiness" | ...
  numValue    Float?    // for numeric (sleep hours, steps)
  textValue   String?   // for categorical ("GREEN" | "YELLOW" | "RED", or "1"-"5")
  unit        String?
  source      LogSource

  createdAt   DateTime @default(now())

  @@unique([userId, date, variableKey])
  @@index([userId, date])
}

enum LogSource { MANUAL FITBIT APPLE_HEALTH GARMIN DERIVED }
```

`LifestyleVariable` itself is **not** a DB table — it's a static registry in `src/lib/gameplan-engine/lifestyle-variables.ts`. See §7.

### 4.6 Modifications

```prisma
model Program {
  // ... existing fields ...
  gameplanId  String?    @unique
  gameplan    Gameplan?  @relation("GameplanTraining")
}

model NutritionTarget {
  // ... existing fields ...
  gameplanId  String?
  gameplan    Gameplan?  @relation(fields: [gameplanId], references: [id], onDelete: SetNull)
}

model Workout {
  // ... existing fields ...
  source      WorkoutSource  @default(STANDALONE)
  // already has blockDayId; add:
  // STANDALONE: standalone log, no Gameplan
  // GAMEPLAN: scheduled Gameplan workout
  // SINGLE_LIBRARY: one-off pulled from the library (counts toward neither)
}

enum WorkoutSource { STANDALONE GAMEPLAN SINGLE_LIBRARY }
```

---

## 5. App Shell & Navigation

### Bottom tabs (left to right)

| Position | Tab        | Icon    | Behavior |
|----------|-----------|---------|----------|
| 1        | Gameplan  | Compass / target | The active Gameplan; sub-tabs Training / Nutrition / Lifestyle. Empty state = picker. |
| 2        | Progress  | Bar chart | Charts, history, check-in log, calendar view |
| 3 (center) | +Log    | Plus (raised FAB) | Sheet: Lifting / Stretch / HIIT / LISS / Class / Custom / Single workout from library |
| 4        | Nutrition | Mug/cup | Daily food diary, macros, meals |
| 5        | Settings  | Cog     | Account, theme, units, integrations, advanced |

**Center +Log** stays as a raised floating action button per the existing pattern. It opens a bottom sheet (not a full page) — the activity-type picker. After selection, it routes to the relevant logger.

### Routing

```
/gameplan                       — Gameplan tab (active or empty)
/gameplan/new                   — Picker / onboarding flow
/gameplan/build                 — Custom build flow (wraps existing Program Engine)
/gameplan/[id]                  — Specific Gameplan (used for paused/historical)
/gameplan/[id]/planning         — Planning Mode sandbox

/progress                       — Progress tab
/progress/charts                — Body / training / lifestyle charts
/progress/calendar              — Monthly grid (formerly Calendar tab)
/progress/check-ins             — Check-in history
/progress/photos                — Progress photos
/progress/injuries              — Injury tracker

/log                            — Activity picker sheet (not a full page)
/log/[workoutId]                — Active workout logger (existing)
/log/library                    — Single-workout library
/log/stretch-timer              — Existing

/nutrition                      — Daily food diary (existing)
/nutrition/plans                — Meal plans

/settings                       — Settings index
/settings/theme                 — Theme picker
/settings/units                 — Units, time format
/settings/integrations          — Fitbit, Apple Health
/settings/advanced              — Custom program build, data export, debug
```

`/exercises/*`, `/history/*`, `/log/[workoutId]`, `/log/stretch-timer` keep their current routes.

### Hidden nav (full-screen flows)

Bottom nav hides during: `/log/[workoutId]`, `/log/stretch-timer`, `/gameplan/new`, `/gameplan/[id]/planning`.


---

## 6. Screen-by-Screen UX

### 6.1 Onboarding / Gameplan picker (`/gameplan/new`)

Triggered on first sign-in (no DRAFT or ACTIVE Gameplan exists) and from Gameplan tab empty state.

**Flow:**
1. **Welcome screen** — one sentence, two buttons: "Pick a Gameplan" and "Skip — just let me log."
2. **Filter screen (optional, can skip)** — 4 questions, single-select cards:
   - Primary goal (Build muscle / Get stronger / Lose fat / Move better / Stay healthy / Compete)
   - Experience (New / Returning / 1+ year / 3+ years)
   - Days per week available (2 / 3 / 4 / 5 / 6)
   - Equipment (Home / Limited gym / Full gym)
3. **Gameplan list** — 8 cards (or filtered subset), each showing name, tagline, duration, days/week range, key emphasis tags. Tapping a card → preview.
4. **Preview screen** — full Gameplan readout: identity, block timeline, sample week, nutrition approach, lifestyle picks, goals it'll generate. Two CTAs: "Customize and start" (opens light setup) and "Pick another."
5. **Setup** — 3-5 inputs depending on Gameplan: start date, days/week (within allowed range), goal target values (e.g., target body weight + date for Lean Out). Defaults filled from filter answers and reasonable assumptions.
6. **Confirm** — "Start Gameplan." Creates Gameplan record (status ACTIVE), runs Program Engine to instantiate the training Program, creates NutritionTargets, creates GameplanGoals, sets up LifestyleVariable defaults.

**Skip path:** lands on the empty Gameplan tab with logger and exercise library still fully available. CTA at top: "Pick a Gameplan."

### 6.2 Gameplan tab (`/gameplan`)

Three states:

#### State A: No active Gameplan
- Empty state with one sentence and "Pick a Gameplan" CTA
- Below: "Or skip and start logging" with link to `/log/library` (single-workout library)

#### State B: Active Gameplan — top section (sticky-ish, above sub-tabs)
- **Gameplan name + status strip** — name, week N of M (or "Cycle 2, Week 3" for recurring), days remaining, status pill
- **Next Action card** — contextual:
  - Pre-workout day: "Today: Day 3 — Pull. 6 exercises, ~55 min." → Start Workout
  - Rest day: "Rest day. Optional: stretch routine, easy walk." → Start Stretch
  - Workout already logged today: tomorrow's preview
- **Pending check-in card** (if a check-in is PENDING) — "Weekly check-in ready: 2 recommendations." → Open check-in
- **Goal Pulse strip** — one row per goal, with current value, target, projection arrow (on track / behind / ahead). Tap → detail with chart.

#### State B continued: sub-tabs

**Sub-tab: Training**
- Block timeline (color-coded by phase, current week highlighted)
- This week's schedule (7 cards, one per day, with completion dots)
- Tap a day → day detail (CategoryLaneView for generated programs, EditableExerciseTable for others)
- "Edit Plan" → opens Planning Mode with the training tab focused
- "Build custom" link in overflow (kept for power users)

**Sub-tab: Nutrition**
- Active calorie target + macro target (from current block's NutritionTarget)
- Meal plan link (if attached)
- Refeed schedule (if applicable, e.g., Lean Out)
- Recent week adherence: avg calories vs target, avg protein vs target
- "Edit Plan" → Planning Mode focused on nutrition

**Sub-tab: Lifestyle**
- 3 cards, one per tracked variable (the Gameplan's `lifestyleVariables` selection)
- Each card shows: target, today's value (or last logged), 7-day trend sparkline, streak count
- Tap a card → log entry sheet (numeric input or G/Y/R picker depending on variable type)
- "Edit Plan" → Planning Mode focused on lifestyle (swap which variables are tracked)

### 6.3 Progress tab (`/progress`)

Five sub-views, switcher at top (Charts / Calendar / Check-Ins / Photos / Injuries):

- **Charts** — body weight (with rolling avg overlay and goal trajectory line if applicable), training volume per muscle group (4-week and 12-week views), e1RM curves for top lifts, lifestyle variable graphs
- **Calendar** — monthly grid (existing Calendar tab content), workouts as colored dots, meals as smaller dots, lifestyle adherence as a faint band per row, change markers from `GameplanChange` shown as small flag icons
- **Check-Ins** — list of past `GameplanCheckIn` records, each expandable to show snapshot + recommendations + what was applied. This is also where users can manually trigger an off-cycle check-in.
- **Photos** — existing progress photos page
- **Injuries** — existing injury tracker

### 6.4 +Log (FAB sheet)

Tapping the center FAB opens a bottom sheet, not a route change:
- **Lifting** — if Gameplan active and today is a scheduled lifting day, deep-links to that day's logger; otherwise routes to `/log/new-blank`
- **Stretch** — `/log/stretch-timer`
- **HIIT / LISS / Class / Custom** — inline forms (existing ActivityLog flow)
- **Single workout from library** — `/log/library`

### 6.5 Single-workout library (`/log/library`)

Auto-derived list of every BlockDay across every shipped Gameplan (and the user's own custom Programs). Filters:
- Goal type (matches Gameplan goalBlend tags)
- Body part / movement focus (derived from category mix)
- Duration estimate
- Equipment
- Format (lifting / cardio / conditioning / mobility)

Tapping → preview (exercise list, est. duration, est. volume) → "Log this workout." Creates a Workout with `source = SINGLE_LIBRARY`. Does **not** count toward any Gameplan adherence.

### 6.6 Nutrition tab (`/nutrition`)

Existing daily food diary stays as-is. Adds a "Plan vs actual" strip at top showing today's totals against the active Gameplan's NutritionTarget (if any). If no active Gameplan, shows raw totals only.

### 6.7 Settings tab (`/settings`)

Index page with sections:
- Account (name, email, signout)
- Theme (links to existing picker)
- Units (lb/kg, in/cm, 12h/24h)
- Integrations (Fitbit, Apple Health)
- Notifications (check-in day/time, missed workout reminders)
- Advanced (build custom Gameplan, custom exercise creation, CSV export, debug tools)


---

## 7. Lifestyle Variable Pool

Static registry, defined in `src/lib/gameplan-engine/lifestyle-variables.ts`. Per-Gameplan picks 3.

### Pool (15 variables)

| Key | Display | Group | Type | Unit | Target Cadence | Source(s) |
|-----|---------|-------|------|------|---------------|-----------|
| `sleep_duration` | Sleep duration | Recovery | numeric | hours | daily | manual / Fitbit |
| `sleep_quality` | Sleep quality | Recovery | scale 1–5 | — | daily | manual |
| `resting_hr` | Resting HR | Recovery | numeric | bpm | daily | Fitbit / manual |
| `hrv` | HRV | Recovery | numeric | ms | daily | Fitbit |
| `daily_readiness` | Daily readiness | Recovery | enum G/Y/R | — | daily | manual |
| `pain_check` | Pain check | Recovery | numeric (0–10) + optional body part | — | daily or as-needed | manual |
| `steps` | Steps | Activity | numeric | steps | daily | Fitbit / manual |
| `active_minutes` | Active minutes | Activity | numeric | min | daily | Fitbit / manual |
| `z2_minutes` | Zone 2 cardio | Activity | numeric | min | weekly | derived from ActivityLog |
| `mobility_minutes` | Mobility minutes | Practices | numeric | min | daily | manual |
| `balance_minutes` | Balance practice | Practices | numeric | min | weekly | manual |
| `hydration` | Hydration | Nutrition habits | numeric | oz | daily | manual |
| `protein_hits` | Protein hits | Nutrition habits | numeric (count) | meals | daily | derived from Meal logs |
| `stress` | Stress | Mental | scale 1–5 | — | daily | manual |
| `sessions_completed` | Sessions completed | Adherence | numeric | sessions | weekly | derived from Workout logs |

### Per-Gameplan picks (defaults; user can swap)

| Gameplan | Lifestyle Picks |
|----|----|
| First 90 Days | `sleep_duration`, `steps`, `sessions_completed` |
| Size & Strength | `sleep_duration`, `stress`, `protein_hits` |
| Lean Out | `steps`, `sleep_duration`, `protein_hits` |
| Powerbuilder | `sleep_duration`, `stress`, `mobility_minutes` |
| Busy Parent / Pro | `steps`, `sleep_duration`, `sessions_completed` |
| Athletic Foundations | `sleep_duration`, `hrv`, `daily_readiness` |
| Comeback | `daily_readiness`, `pain_check`, `sleep_quality` |
| Longevity | `sleep_duration`, `z2_minutes`, `balance_minutes` |

### Targets

Each variable has a `targetCadence` (daily / weekly). Per-Gameplan default targets are seeded; user can edit. Targets adjust via Planning Mode like any other plan parameter.

---

## 8. Goal Engine Spec

Lives in `src/lib/gameplan-engine/`. Pure functions, no Prisma dependency at the math layer (engine takes data in, returns recommendations out — Prisma calls happen at the API route layer).

### 8.1 Modules

```
src/lib/gameplan-engine/
├── index.ts                — public API
├── types.ts                — GameplanConfig, Snapshot, Recommendation, ProjectionCurve
├── lifestyle-variables.ts  — registry (§7)
├── templates/              — the 8 Gameplan template definitions (seed data)
│   ├── first-90-days.ts
│   ├── size-strength.ts
│   ├── lean-out.ts
│   ├── ...
├── rate-math.ts            — rate calculations, rolling averages, projections
├── feasibility.ts          — feasibility bands per goal type
├── check-in.ts             — weekly snapshot → recommendations
├── recommendations/        — rule modules (one per kind)
│   ├── behind-target.ts
│   ├── ahead-target.ts
│   ├── adherence-low.ts
│   ├── refeed-due.ts
│   ├── deload-shift.ts
│   └── plateau-detected.ts
└── planning-mode.ts        — sandbox math (live projections under hypothetical changes)
```

### 8.2 Rate math

**Body metric goal:**
- Compute rolling 7-day average of body weight (or 10-day if user prefers — config). If <5 logs in window, status = `INSUFFICIENT_DATA`.
- Linear projected trajectory from `startValue` at `startDate` to `targetValue` at `targetDate`.
- Actual trajectory = polyfit deg-1 over rolling-avg points within the gameplan window.
- Variance band = ±0.5 × the prescribed weekly rate. Outside → "behind" or "ahead."

**Lift PR goal:**
- Compute Epley e1RM from each session's top set on that lift.
- Take best e1RM in the past 14 days (or last logged if older).
- Linear projection from start e1RM to target.
- Variance band = ±5 lb (configurable). If lift hasn't been trained in 14 days → status `STALE`.

**Performance test goal:**
- Test sessions are explicit log events (a special `PerformanceTestLog` could be added later, or we reuse Workout with a special activity type). For v1, log via custom activity type with a `metric` field; engine reads from there.
- Linear projection between scheduled tests.

### 8.3 Feasibility bands

Per goal type, the engine knows "reasonable" rates and flags aggressive or unrealistic targets.

**Body weight loss:**
- Sustainable: ≤0.7% bodyweight / wk
- Aggressive: 0.7–1.0% / wk
- Unrealistic: >1.0% / wk

**Body weight gain (lean):**
- Sustainable: 0.25–0.5 lb / wk for intermediates; 0.5–1.0 lb / wk for beginners
- Aggressive: 1.0–1.5 lb / wk
- Unrealistic: >1.5 lb / wk

**Strength gain (1RM):**
- Sustainable for novice: 5–10 lb / wk on big lifts (linear progression range)
- Sustainable for intermediate: 5–10 lb / month
- Sustainable for advanced: 5–15 lb / quarter

**Performance test:**
- Highly individual; engine uses 1% / week as a heuristic and flags >2% / week as aggressive.

Bands are hints in Planning Mode (yellow/red text), not hard blocks. User can override anything.

### 8.4 Weekly check-in rule set

Runs every Sunday at user-configured time (default 6pm local). Reads the last 7 days of logs, produces a `GameplanCheckIn` row with snapshot + recommendations.

**Recommendation rules (each is a small pure function returning `Recommendation | null`):**

| Rule | Trigger | Output |
|------|---------|--------|
| `behind-target` | Body-metric goal projection >0.5×rate behind | "Drop calories 100/day OR extend by 2 weeks" |
| `ahead-target` | Body-metric goal projection >0.5×rate ahead | "You're ahead — maintain or pull target in by N weeks?" |
| `adherence-low` | <70% of scheduled sessions completed in past 7d | "Push deload back / reduce volume / address barriers" |
| `adherence-low-streak` | adherence-low fires 2 weeks in a row | "Consider reducing days/wk to a sustainable rate" |
| `refeed-due` | Lean Out: 4+ weeks in deficit without refeed | "Schedule a refeed week" |
| `deload-shift` | adherence-low fires in week before scheduled deload | "Push deload earlier / use this week as deload" |
| `plateau-detected` | Lift PR goal: e1RM hasn't moved in N sessions | "Accumulate volume / change progression scheme / extend block" |
| `lifestyle-streak-broken` | Tracked lifestyle variable misses target 5/7 days | "Revisit target — too aggressive? Adjust or commit." |
| `pain-flag` | Pain check ≥6 logged 2+ days | (Comeback) "Reduce load by 20% / consult professional" |

Each Recommendation has: `id`, `kind`, `title`, `body`, `severity` (info / warning / urgent), `action` (one of: open Planning Mode with field pre-staged, apply directly with confirm, dismiss-only).

Cap: 3 recommendations per check-in. If more rules fire, prioritize by severity, then by recency of underlying issue.

### 8.5 Apply / dismiss

- **Apply directly** — engine writes the change as a `GameplanChange` (source = `CHECK_IN_APPLY`) and updates the Gameplan in one transaction. Check-in status moves to `PARTIALLY_APPLIED` or `FULLY_APPLIED`.
- **Open in Planning Mode** — pre-stages the suggested change in the sandbox; user can tweak before committing.
- **Dismiss** — records the dismissal on the check-in record so the engine knows not to surface the same rec next week unless conditions change.

---

## 9. Planning Mode

Sandbox UI accessed from any "Edit Plan" button on the Gameplan tab, or via a check-in recommendation's "Open in Planning Mode."

### 9.1 Mechanic

On open: deep-clone the active Gameplan (in memory; no DB writes) into a `draftGameplan`. All edits mutate the draft. Three buttons in header: **Apply Changes**, **Discard**, **Reset to Original**.

### 9.2 Adjustable handles

- Timeline endpoints (start date, end date / duration weeks)
- Per-goal: target value, target date, rate
- Calorie target (with macro split locked or unlocked)
- Macro split percentages
- Training days/week (within gameplan's `allowedDaysRange`)
- Block durations (extend / shorten any block)
- Insert / remove deload, refeed, test weeks
- Lifestyle variable swap (any 3 from pool)
- Lifestyle variable targets

### 9.3 Live projection panel

Right-side panel (or bottom sheet on narrow viewport) with three tabs:

- **Trajectory** — line chart per active body-metric goal showing prescribed line (current Gameplan), draft line (with proposed changes), feasibility band (green/yellow/red shading), and historical actuals.
- **Daily target** — calorie target with delta from current (`-150` shown in red); macro grams with deltas; protein g/lb of bodyweight.
- **Volume / structure** — total weeks, per-block weeks, total sessions, weekly volume per muscle group (using existing Program Engine `volume.ts` math).

All three tabs update in real time as handles change. Math runs in the browser (engine modules are isomorphic).

### 9.4 Feasibility warnings

Inline yellow/red text under affected handles when bands are exceeded. Examples:
- "Rate of 1.2 lb/wk loss is aggressive at 165 lb (>0.7% per week)"
- "Cutting calories below 1200 not recommended"
- "16 weeks of straight accumulation has no peaking phase"

Warnings never block. User can apply anything.

### 9.5 Apply

Tapping Apply → confirmation modal listing every changed field. Optional note text field ("cut 100 kcal — wasn't losing"). Confirms → writes a transaction:
1. One `GameplanChange` row per changed field, all with the same `commitId`
2. Updates the Gameplan record
3. If training plan structure changed, regenerates affected blocks (via Program Engine reuse)
4. If tracked goals changed, updates `GameplanGoal` records
5. Returns to Gameplan tab with a toast: "Plan updated. 4 changes recorded."


---

## 10. Migration Plan

### Existing data preserved
- All Workouts, Sets, ExercisePrs, BodyMetrics, ProgressPhotos, Injuries, FoodItems, Meals, ActivityLogs continue to live where they are. None of this is touched.
- Existing Programs continue to exist. They become "orphan Programs" (no `gameplanId`) and are still fully usable from the workout logger; users can browse and log against them.
- Existing Goals (the current `Goal` model) stay as-is. They are not auto-migrated to `GameplanGoal`. UI surfaces them under a "Legacy goals" disclosure on the Progress tab so users can manually port any they care about.
- ExerciseLibrary, themes, custom exercises — untouched.

### Soft retirements
- Routes `/programs/new/*`, `/`, `/calendar` redirect to their v2 equivalents. Don't delete the page files for one release in case of bookmarks.
- The `Home` route (`/`) redirects to `/gameplan`.
- The `Calendar` tab in BottomNav is removed; the route `/calendar` redirects to `/progress/calendar`.

### Dropped from UI (not from DB)
- Goal-first wizard, Smart Generator questionnaire, template picker, visual builder pages stay as files for one release behind a `?legacy=1` flag, then deleted. The Smart Generator's underlying Program Engine remains and is accessed through `/gameplan/build`.

### One-time migration tasks
1. Add new tables (`Gameplan`, `GameplanGoal`, `GameplanChange`, `GameplanCheckIn`, `LifestyleLog`) — `npx prisma db push`.
2. Add `gameplanId` to `Program` and `NutritionTarget`, `source` to `Workout`. `db push` handles this.
3. Seed the 8 Gameplan templates as TS files in `src/lib/gameplan-engine/templates/`. No DB seed needed — templates are code-defined; instantiation happens per-user when picked.
4. Backfill `Workout.source = STANDALONE` for all existing rows (one-line raw SQL or `prisma migrate` data migration).

### What does **not** auto-migrate
- Existing active Programs do not become Gameplans automatically. Users keep them, and on first v2 launch see a banner: "Your existing program is here, but for the full Gameplan experience including goals and check-ins, pick or build a new one." This is friendlier than forcing migration and avoids data shape mismatches.

---

## 11. Build Order

Each phase ships independently. Each is verifiable end-to-end before the next starts.

### Phase 8A — Schema + shell (1–2 days)
1. Add new Prisma models, enums, and relations from §4. `db push`.
2. Restructure bottom nav per §5 (Gameplan / Progress / +Log / Nutrition / Settings).
3. Set up new routes per §5 with placeholder pages.
4. Move Calendar content into `/progress/calendar`. Move existing Home page content into a `_legacy` folder and redirect `/` → `/gameplan`.
5. Verify: existing logger, exercise library, body metrics, nutrition diary, theme switcher all still work end-to-end.

### Phase 8B — Gameplan picker + 1 Gameplan (2–3 days)
1. Build `/gameplan/new` flow (welcome → filter → list → preview → setup → confirm).
2. Implement First 90 Days as the first template (`src/lib/gameplan-engine/templates/first-90-days.ts`) including:
   - Identity + structural fields
   - Block structure for the Program Engine to instantiate
   - NutritionTarget defaults
   - Lifestyle variable picks + targets
   - Default goals
3. Wire "Start Gameplan" → creates Gameplan + Program (via existing engine) + NutritionTargets + GameplanGoals + initial GameplanCheckIn (for week 1).
4. Build Gameplan tab (`/gameplan`) — empty state, active state, all three sub-tabs displaying live data (no editing yet).
5. Verify: pick First 90 Days, confirm, see Gameplan tab populated, log a workout, see it reflected.

### Phase 8C — Goal Engine + check-ins (3–4 days)
1. Implement `rate-math.ts`, `feasibility.ts` for body-metric and lift-PR goals.
2. Implement check-in scheduler (cron at user-configured time; for v1, run on first page load if a check-in is due).
3. Implement 4 launch recommendation rules: `behind-target`, `ahead-target`, `adherence-low`, `plateau-detected`.
4. Build "Pending check-in" card on Gameplan tab and Check-Ins sub-view in Progress tab.
5. Implement Apply / Dismiss / Open in Planning Mode actions (Planning Mode is stub for now — opens an alert).

### Phase 8D — Planning Mode (3–5 days)
1. Build the sandbox: clone-on-open, in-memory edit, Apply/Discard/Reset.
2. Implement all 9 handles from §9.2.
3. Implement live projection panel — Trajectory chart, Daily target, Volume/structure.
4. Implement feasibility warnings inline.
5. Wire the recommendation card "Open in Planning Mode" action to pre-stage changes.
6. Apply → write `GameplanChange` rows with shared `commitId`.

### Phase 8E — Gameplans 2 and 3 (2–3 days)
1. Implement Size & Strength template.
2. Implement Lean Out template (including refeed week support and `refeed-due` recommendation rule).
3. Verify the framework supports the periodization differences without code changes.
4. **Launch milestone** — three Gameplans live, full adjustment loop functional.

### Phase 8F — Progress tab fleshing (1–2 days)
1. Charts sub-view with body weight + rolling avg + goal trajectory overlay.
2. Per-lift e1RM curves (reuse existing exercise detail chart infra).
3. Lifestyle variable history graphs.
4. Calendar with `GameplanChange` markers.

### Phase 8G — Single-workout library + remaining polish (1–2 days)
1. `/log/library` — derived list, filters, preview, log.
2. `Workout.source` tagging through the logger.
3. Settings index and notification preferences.
4. Onboarding skip path UX polish.

### Phase 8H — Gameplans 4–8 (~1 day each as content)
- Powerbuilder, Busy Parent / Pro, Athletic Foundations, Comeback, Longevity. Mostly content work — block definitions, nutrition defaults, lifestyle picks, goal types, copy. Framework changes only if a Gameplan needs something new (e.g., Comeback may need a `pain_check`-driven recommendation rule that doesn't exist yet).

### Estimated total
Phases 8A–8G: 13–21 working days for the framework and 3 launch Gameplans. Phase 8H scales linearly with how detailed each Gameplan's content needs to be — figure 1–3 days per Gameplan.

---

## 12. Open Decisions

These don't block writing the spec but should be settled before Phase 8B:

1. **Check-in time of week** — fixed Sunday 6pm local, or user-configurable per Gameplan? Recommend: configurable per user, default Sunday 6pm.
2. **Body weight averaging window** — 7-day rolling vs 10-day rolling. Recommend: 7-day default, user can switch in Settings → Advanced.
3. **Lift PR goal source** — best e1RM in past 14 days vs single most recent top set. Recommend: best e1RM in past 14d for stability.
4. **Recurring Gameplan rollover** — at end of cycle, auto-roll to a new cycle vs prompt user. Recommend: prompt with "Continue / Adjust / Switch Gameplan / End."
5. **Mid-Gameplan switch** — can a user switch Gameplans without losing data? Recommend: yes; old Gameplan moves to `COMPLETED` or `ABANDONED`, history preserved, new one starts fresh.
6. **Shared FAB target on Gameplan rest day** — does +Log default to "Stretch" or open the picker? Recommend: open the picker; stretch is a tap away.
7. **Notification mechanism** — PWA push / email / in-app only? Recommend: in-app only for v1, layer push/email later.

---

## 13. Hand-off Notes

### To Claude Design
- Use this doc plus the existing 7 themes for visual language. Each theme's existing chrome and ornament continues to apply.
- Mocks needed in priority order: Gameplan picker (filter → list → preview → setup), Gameplan tab active state with sub-tabs, Planning Mode trajectory panel, weekly check-in card.
- Mobile-first; assume the existing 380px artboard standard.
- The Goal Pulse strip and Next Action card are both new visual elements — recommend designing those first, since they anchor the Gameplan tab.

### To Claude Code
- Start with Phase 8A. Don't begin 8B until existing functionality verifies clean on the new shell.
- Reuse Program Engine wholesale; do not modify `src/lib/program-engine/`. Wrap it from `gameplan-engine/templates/*.ts`.
- All new engine math (rate, feasibility, check-in rules, planning mode projections) lives in `src/lib/gameplan-engine/` and is pure-functional. API routes call it.
- Theme system is locked. Do not introduce new `ft-*` tokens without adding them to all 7 themes.
- WCAG AA contrast floor stays in force. Run `node scripts/audit-theme-contrast.js` after any color-related change.
- Past chats `c8411f65` (Phase 7 questionnaire spec) and `b38b02fe` (Program Engine spec) are reference material; this doc supersedes the former and reuses the latter.

---

*End of spec.*
