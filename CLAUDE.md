# FitTrack - Claude Reference Document

## Developer Environment
- **Local OS:** Windows (PowerShell terminal)
- When giving CLI instructions, always use PowerShell syntax (e.g. `$env:VAR="value"` instead of `VAR=value command`)

## Overview
FitTrack is a personal workout tracking app built with Next.js 14, Prisma, PostgreSQL (Railway), and NextAuth (Google OAuth). Deployed on Vercel.

## Tech Stack
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 5
- **Database:** PostgreSQL on Railway, via Prisma 7.5.0 with `@prisma/adapter-pg`
- **Auth:** NextAuth 4.24.13 with Google OAuth + Prisma adapter (database sessions)
- **Styling:** Tailwind CSS 3.4.1 with custom `ft-*` dark theme palette
- **Charts:** Recharts 3.8.0
- **Hosting:** Vercel (auto-deploys on push to main)

## Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard (server component)
│   ├── layout.tsx                # Root layout (Nav + SessionProvider + ThemeInit)
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── signin/page.tsx           # Google OAuth sign-in
│   ├── settings/page.tsx         # Settings (unit prefs, CSV export)
│   ├── exercises/
│   │   ├── page.tsx              # Exercise library (client, pill filters)
│   │   ├── new/page.tsx          # Create exercise form (client)
│   │   └── [exerciseId]/page.tsx # Exercise detail + charts + progression (server)
│   ├── programs/
│   │   ├── page.tsx              # Programs list (server)
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
│   │   ├── page.tsx              # Workout day picker (server)
│   │   └── [workoutId]/page.tsx  # Active workout logger (client)
│   ├── history/
│   │   ├── page.tsx              # Workout history list (client)
│   │   └── [workoutId]/page.tsx  # Workout session replay (client)
│   ├── progress/
│   │   ├── page.tsx              # Progress overview (server)
│   │   ├── body/page.tsx         # Body metrics with charts (client)
│   │   └── photos/page.tsx       # Progress photos gallery (client)
│   ├── injuries/page.tsx         # Injury tracker with CRUD (client)
│   └── api/                      # API routes (all wired to Prisma)
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── auth/debug/           # GET - auth debug info
│       ├── dashboard/            # GET - aggregated dashboard data
│       ├── exercises/            # GET (list+filter), POST (create)
│       ├── exercises/[id]/       # GET exercise detail
│       ├── exercises/[id]/history/ # GET - exercise workout history
│       ├── exercises/[id]/estimated-1rm/ # GET - Epley formula 1RM estimate
│       ├── exercises/[id]/last-performance/ # GET - last logged sets
│       ├── exercises/[id]/progression-status/ # GET - stall detection
│       ├── exercises/recent/     # GET - recently used exercises
│       ├── goals/                # POST (create goal, optionally with program)
│       ├── programs/             # GET (list), POST (create)
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
│       ├── workouts/             # GET (list), POST (create)
│       ├── workouts/[id]/        # GET, PATCH, DELETE
│       ├── workouts/[id]/exercises/ # POST (add exercise to workout)
│       ├── workouts/[id]/replay/ # POST (create workout from previous)
│       ├── workouts/last-by-day/ # GET (last workout per block day)
│       ├── sets/                 # POST (log set, auto-detects PR)
│       ├── progress/weight/      # GET, POST (body metrics)
│       ├── progress/prs/         # GET (all personal records)
│       ├── progress/photos/      # GET, POST (progress photos)
│       ├── injuries/             # GET, POST
│       ├── injuries/[id]/notes/  # POST (injury follow-up notes)
│       └── migrate/              # POST (one-time schema migrations, dev only)
├── components/
│   ├── ThemeInit.tsx              # Client-side theme initialization
│   └── ui/
│       ├── Card.tsx              # Container with border/bg
│       ├── Nav.tsx               # Top nav bar (client)
│       ├── SectionHeader.tsx     # Section title + optional action
│       ├── Tag.tsx               # Badge (default/success/warn/danger)
│       ├── Stat.tsx              # Key-value metric display
│       ├── ProgressBar.tsx       # Visual progress bar
│       ├── DataTable.tsx         # Sortable table (client)
│       ├── EditableExerciseTable.tsx # Inline-editable exercise table (client)
│       ├── ExerciseBrowserPanel.tsx  # Slide-out exercise search panel (client)
│       ├── Skeleton.tsx          # Loading skeleton placeholder
│       ├── StatusIcon.tsx        # Status icons for programs/blocks/days
│       ├── SyncIndicator.tsx     # Online/offline sync status indicator
│       ├── Timeline.tsx          # Visual timeline/progress component
│       ├── Toast.tsx             # Toast notification system (provider + context)
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
- **User** → has Goals, Programs, Workouts, Exercises, ExercisePrs, BodyMetrics, ProgressPhotos, Injuries
- **Goal** (active/achieved/abandoned) → type (weight/bodyweight/strength/powerlifting/competition/frequency/bodycomp/custom), optional link to Program, priority, metric, startValue, targetValue
- **Program** (active/completed/paused) → has Blocks, Benchmarks, Goals, optional goalId link
- **ProgramBenchmark** → label, targetValue/unit/date, actualValue, optional blockId scope
- **Block** (active/completed/upcoming) → has BlockDays, Workouts, Benchmarks, phase field
- **BlockDay** (lifting/cardio/conditioning/mobility/rest) → has BlockDayExercises
- **BlockDayExercise** → links to Exercise + optional altExercise, has targetSets, targetRepRange, targetRpe, progressionType (linear/double/wave/rpe_based/percentage_based/none), progressionIncrement, notes
- **Workout** → has WorkoutExercises (logged sessions linked to Block/BlockDay)
- **WorkoutExercise** → has Sets
- **Set** → weight, reps, rir, rpe, isWarmup, isPr
- **Exercise** → 367 seeded, supports custom per-user
- **ExercisePr** → auto-created when PR detected in POST /api/sets (types: weight, reps, volume, e1rm)
- **BodyMetric** → date, weight, bodyFatPct, source
- **ProgressPhoto** → imageUrl, poseType, optional programId
- **Injury** → bodyPart, severity, status, has InjuryNotes

## Tailwind Theme (ft-* colors)
```
bg: #1a1a1a  surface: #2e2e2e  card: #434343  border: #555555
muted: #666666  dim: #888888  light: #cccccc  white: #ffffff
success: #6fbf73  warn: #e6a23c  danger: #ef5350
```

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
- **Server components** use direct Prisma queries with `getAuthUserId()` + `redirect("/signin")`
- **Client components** use `fetch("/api/...")` to API routes
- **Dynamic routes** use `params: Promise<{ id: string }>` pattern (Next.js 14+) in server components; plain `{ params: { id: string } }` in client components
- **All dynamic pages** export `const dynamic = "force-dynamic"` to prevent caching
- **Auth in API routes** uses `requireAuthUserId()` which throws on unauthenticated
- **PR detection** is automatic in POST /api/sets (compares weight to user's max)
- **Volume calculation** = weight x reps (excluding warmup sets)
- **Streak** = consecutive days with workouts, starting from today or yesterday
- **Workout logger** (`/log/[workoutId]`) supports both template-based (blockDayId) and blank (`new-blank`) workouts with exercise picker
- **Workout replay** (`/history/[workoutId]`) shows session details; POST `/api/workouts/[id]/replay` creates a new workout from a previous one
- **Exercise search** uses debounced fetch (300ms) with AbortController cleanup against GET `/api/exercises?search=`
- **Offline queue** (`/lib/offline-queue.ts`) queues failed workout saves and syncs on `online` event
- **Auto-save** uses debounced (2s) localStorage with `workout-draft-{id}` keys, 24h TTL, managed via `draft-store.ts`
- **Progression tracking** (`/lib/progression.ts`) — Epley 1RM estimation, stall detection over N sessions, wave/linear/double progression suggestions
- **Theme system** (`/lib/theme.ts`) — CSS variable-based theming with `ThemeInit` client component, chart color helpers
- **Program creation** — 3 paths: goal-first wizard (`/programs/new/goal`), template picker (`/programs/new/templates`), visual builder (`/programs/new/builder`)
- **Program cloning** — POST `/api/programs/clone` creates a full program from a template (blocks, days, matched exercises)
- **Toast notifications** — `Toast.tsx` provides `useToast()` context with auto-dismiss (4s)
- **Exercise browser panel** — `ExerciseBrowserPanel.tsx` slide-out panel with search, used in day template editing
- **Editable exercise table** — `EditableExerciseTable.tsx` inline editing of sets/reps/RPE in day templates
- **PWA support** — `next-pwa` configured in `next.config.mjs`, offline fallback page at `/public/offline.html`

## Build Plan (Original Spec)

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

### Phase 3: Polish & Enhancements (IN PROGRESS)
1. **Workout history / session replay** (COMPLETE) — `/history` list + `/history/[workoutId]` detail view, replay API
2. **Advanced progression tracking** (COMPLETE) — 1RM estimation, stall detection, progression suggestions, per-exercise status API
3. **PWA support** (COMPLETE) — next-pwa integration, offline fallback page
4. **Visual program builder** (COMPLETE) — `/programs/new/builder` with drag-and-drop-style block/day creation
5. **Goal-first program creation** (COMPLETE) — `/programs/new/goal` wizard with auto-program scaffolding
6. **Template-based program creation** (COMPLETE) — `/programs/new/templates` with clone API
7. **Inline program editing** (COMPLETE) — editable exercise tables, exercise browser panel, reorder support
8. **UI components** (COMPLETE) — Skeleton loaders, StatusIcons, SyncIndicator, Timeline, Toast system
9. **Theme infrastructure** (COMPLETE) — CSS variable system, ThemeInit component, chart theme helpers
10. **Exercise filters** (COMPLETE) — pill-style multi-select filters on exercise library page
- Notification / reminder system (FUTURE)
- Mobile responsiveness pass (FUTURE)

## Current State
**Phase 1, Phase 2, and Phase 3 core features are complete.** The app is functional end-to-end:
- 367 exercises seeded
- 30+ API routes connected to real Prisma queries
- All pages fetch from database (no hardcoded data)
- Google OAuth working
- Deployed on Vercel + Railway PostgreSQL
- Full workout logging flow: pick template or start blank → search/add exercises → log sets → finish
- Program creation via 3 paths: goal wizard, templates, visual builder
- Inline program/block/day editing with exercise browser
- Workout history and session replay
- Progression tracking with 1RM estimation and stall detection
- Body metrics, progress photos, injury tracker all functional
- Offline queue + auto-save + PWA support for data resilience
- CSV data export from settings page
- Toast notifications, skeleton loaders, status icons

**Remaining Phase 3 items:** Notification/reminder system, mobile responsiveness pass.
