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
│   ├── layout.tsx                # Root layout (Nav + SessionProvider)
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── signin/page.tsx           # Google OAuth sign-in
│   ├── settings/page.tsx         # Settings (placeholder)
│   ├── exercises/
│   │   ├── page.tsx              # Exercise library (client component)
│   │   ├── new/page.tsx          # Create exercise form (client)
│   │   └── [exerciseId]/page.tsx # Exercise detail (server)
│   ├── programs/
│   │   ├── page.tsx              # Programs list (server)
│   │   └── [programId]/
│   │       ├── page.tsx          # Program detail (server)
│   │       └── blocks/[blockId]/
│   │           ├── page.tsx      # Block detail (server)
│   │           └── days/[dayId]/page.tsx  # Day template (server)
│   ├── log/
│   │   ├── page.tsx              # Workout day picker (server)
│   │   └── [workoutId]/page.tsx  # Active workout logger (client)
│   ├── progress/
│   │   ├── page.tsx              # Progress overview (server)
│   │   ├── body/page.tsx         # Body metrics (placeholder)
│   │   └── photos/page.tsx       # Progress photos (placeholder)
│   ├── injuries/page.tsx         # Injury tracker (placeholder)
│   └── api/                      # API routes (all wired to Prisma)
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── dashboard/            # GET - aggregated dashboard data
│       ├── exercises/            # GET (list+filter), POST (create)
│       ├── exercises/[id]/history/ # GET - exercise workout history
│       ├── programs/             # GET (list), POST (create)
│       ├── programs/[id]/        # GET (detail with blocks)
│       ├── blocks/[id]/          # GET (block with days+exercises)
│       ├── blocks/[id]/days/     # POST (create block day)
│       ├── blocks/day/[id]/      # GET (single block day template)
│       ├── workouts/             # GET (list), POST (create)
│       ├── workouts/[id]/        # GET, PATCH, DELETE
│       ├── workouts/[id]/exercises/ # POST (add exercise to workout)
│       ├── sets/                 # POST (log set, auto-detects PR)
│       ├── progress/weight/      # GET, POST (body metrics)
│       ├── progress/prs/         # GET (all personal records)
│       ├── progress/photos/      # GET, POST (progress photos)
│       ├── injuries/             # GET, POST
│       └── injuries/[id]/notes/  # POST (injury follow-up notes)
├── components/
│   └── ui/
│       ├── Card.tsx              # Container with border/bg
│       ├── Nav.tsx               # Top nav bar (client)
│       ├── SectionHeader.tsx     # Section title + optional action
│       ├── Tag.tsx               # Badge (default/success/warn/danger)
│       ├── Stat.tsx              # Key-value metric display
│       ├── ProgressBar.tsx       # Visual progress bar
│       ├── DataTable.tsx         # Sortable table (client)
│       └── index.ts              # Barrel exports
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient (PrismaPg adapter)
│   ├── auth.ts                   # NextAuth config (Google, Prisma adapter)
│   ├── auth-helpers.ts           # getAuthUserId(), requireAuth(), requireAuthUserId()
│   └── demo-user.ts             # Demo user fallback for dev
├── types/
│   └── next-auth.d.ts            # Session type extension (adds user.id)
└── generated/prisma/             # Auto-generated Prisma client (gitignored)

prisma/
├── schema.prisma                 # Full database schema
└── seed.ts                       # Seeds 367 exercises across 20+ categories
```

## Database Schema (Key Models)
- **User** → has Programs, Workouts, Exercises, ExercisePrs, BodyMetrics, ProgressPhotos, Injuries
- **Program** (active/completed/paused) → has Blocks, Benchmarks
- **Block** (active/completed/upcoming) → has BlockDays, Workouts
- **BlockDay** (lifting/cardio/conditioning/mobility/rest) → has BlockDayExercises
- **BlockDayExercise** → links to Exercise, has targetSets, targetRepRange, progressionType (linear/double/wave/rpe_based/percentage_based/none)
- **Workout** → has WorkoutExercises (logged sessions linked to Block/BlockDay)
- **WorkoutExercise** → has Sets
- **Set** → weight, reps, rir, rpe, isWarmup, isPr
- **Exercise** → 367 seeded, supports custom per-user
- **ExercisePr** → auto-created when PR detected in POST /api/sets
- **BodyMetric** → date, weight, bodyFatPct, source
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
- **Dynamic routes** use `params: Promise<{ id: string }>` pattern (Next.js 14+)
- **All dynamic pages** export `const dynamic = "force-dynamic"` to prevent caching
- **Auth in API routes** uses `requireAuthUserId()` which throws on unauthenticated
- **PR detection** is automatic in POST /api/sets (compares weight to user's max)
- **Volume calculation** = weight x reps (excluding warmup sets)
- **Streak** = consecutive days with workouts, starting from today or yesterday

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

### Phase 2: Core Functionality (IN PROGRESS)
1. **Program/Block/Day creation UI** — API routes exist (POST) but no creation pages yet
2. **Wire up "Finish" button in workout logger** — needs to POST workout + sets to API
3. **Workout auto-save** — currently loses data on page close
4. **Exercise history charts** — placeholders on exercise detail page
5. **Body metrics page** (`/progress/body`) — placeholder, API ready
6. **Progress photos** (`/progress/photos`) — placeholder, upload not wired
7. **Injury tracker UI** (`/injuries`) — placeholder, API exists
8. **Settings page** — placeholder
9. **Data export** — xlsx dependency installed but not wired up

### Phase 3: Polish & Enhancements (FUTURE)
- Workout history / session replay
- Advanced progression tracking per exercise
- Notification / reminder system
- Mobile responsiveness pass
- PWA support for offline logging

## Current State
**Phase 1 is fully complete.** All infrastructure is built and deployed:
- 367 exercises seeded
- All 16 API routes connected to real Prisma queries
- All pages fetch from database (no hardcoded data)
- Google OAuth working
- Deployed on Vercel + Railway PostgreSQL

**Phase 2 priority:** Seed a real training program and wire up the Finish button so workouts can actually be logged end-to-end.
