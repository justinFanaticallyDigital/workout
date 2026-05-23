# FitTrack — Prototype → Production Implementation Plan

Everything in this folder mirrors the path it should end up at inside your `workout/` repo. Drop files in, run the migrations, deploy.

## What's delivered in this drop

**Phase A only — theme foundation.** Phase B (screen ports) is scoped below as a Claude Code hand-off task with specific file pointers, because each prototype is 1.5–2.2k lines and needs careful translation against the live API contracts.

### Phase A files (drop these in now)

| File here | Drop into |
|---|---|
| `src/app/globals.css` | `workout/src/app/globals.css` (REPLACE) |
| `tailwind.config.ts` | `workout/tailwind.config.ts` (REPLACE) |
| `src/lib/theme.ts` | `workout/src/lib/theme.ts` (REPLACE) |
| `src/components/ThemeInit.tsx` | `workout/src/components/ThemeInit.tsx` (REPLACE — unchanged shape) |
| `src/app/settings/page.tsx` | `workout/src/app/settings/page.tsx` (REPLACE — adds theme picker) |

### Phase B — Claude Code hand-off brief

Each screen is its own task. Do them in order. Source-of-truth prototype files are in the project root one folder up from this one.

**Routing correction from the original plan:**
- `Gameplan Picker - Iron & Chalk.html` (`picker-screens.jsx`) is a **5-step program-selection onboarding** → maps to **`/programs/new`**, NOT `/log`. Existing `/log` (workout day picker) stays as-is.
- `Active Gameplan - Graffiti.html` (`gameplan-active.jsx`) is the **active program dashboard / today's workout** → new route **`/gameplan`** (or replace `/` dashboard). NOT the workout logger.
- `Logger Exploration.html` (`logger-app.jsx`) is the workout logger → **`/log/[workoutId]`**.
- `Planning Mode - Blueprint.html` (`planning-screens.jsx`) is the program-builder editor → **`/programs/[programId]`** + sub-routes.
- `Weekly Check-In - Lab Report.html` (`checkin-screens.jsx`) → new **`/checkin`** + new `CheckIn` model.

#### B1 — Program picker onboarding → `/programs/new`
- Source prototype: `picker-screens.jsx` (1358 lines)
- 5 steps: Welcome → Filter → List → Preview → Setup. Each is a standalone screen (`Step1Welcome`..`Step5Setup`).
- Existing `/programs/new` is a placeholder; replace with this multi-step flow.
- API: POST `/api/programs` already exists (creates program). The picker generates blocks/days/exercises — wire that up to the existing `/api/blocks` + `/api/blocks/[id]/days` POST routes, OR add a `POST /api/programs/from-template` that takes a template id and generates the full structure server-side. The latter is cleaner — recommend adding it.
- Use `program-engine/templates.ts` (already in your repo) as the source of truth for the 8 templates (`first90`, `sizestrength`, etc).

#### B2 — Active gameplan dashboard → `/gameplan` (new route)
- Source: `gameplan-active.jsx` (2226 lines)
- Tabs: Training (today + this-week) / Nutrition / Lifestyle.
- Today card pulls from active program → active block → today's BlockDay. CTA → `/log/[workoutId]` (creates workout if needed via POST `/api/workouts`).
- This is a meaty port. Break into sub-components: `GameplanHeader`, `TodayCard`, `WeekStrip`, `BlockProgress`, `NutritionPanel`, `LifestylePanel`. Co-locate under `src/app/gameplan/`.

#### B3 — Workout logger → `/log/[workoutId]`
- Source: `logger-app.jsx` (paired with `logger-data.jsx` and `logger-skeletons.jsx`)
- Existing route already works end-to-end (auto-save + offline queue). The port is purely visual — keep all logic.
- The prototype's set-row, exercise card, finish modal, and rest timer should drop into the existing component shape.
- Single pitfall: graffiti theme tilts cards via `transform: rotate()`. The tilt is gated to `[data-theme="graffiti"]` in `globals.css` already — don't re-add it inline.

#### B4 — Planning mode → `/programs/[programId]` + nested
- Source: `planning-screens.jsx` (uses `EditableExerciseTable` and `ExerciseBrowserPanel` — both already in `src/components/ui/`)
- Existing routes already exist; rebuild the visual layer.

#### B5 — Weekly check-in → `/checkin` (new) + new schema
- Source: `checkin-screens.jsx` + `checkin-icons.jsx`
- Append the model below to `prisma/schema.prisma`, then `npx prisma migrate dev --name add_checkin`.

```prisma
model CheckIn {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  date        DateTime @db.Date
  weekNumber  Int?     @map("week_number")
  blockId     String?  @map("block_id") @db.Uuid

  // Subjective ratings (1–5)
  energy      Int?
  sleepQuality Int?    @map("sleep_quality")
  soreness    Int?
  stress      Int?
  motivation  Int?

  // Adherence
  liftAdherence    Int? @map("lift_adherence")    // workouts completed / planned
  cardioAdherence  Int? @map("cardio_adherence")
  nutritionAdherence Int? @map("nutrition_adherence")

  // Free text
  wins        String?
  struggles   String?
  notes       String?

  createdAt   DateTime @default(now()) @map("created_at")

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  block Block? @relation(fields: [blockId], references: [id], onDelete: SetNull)

  @@unique([userId, date])
  @@index([userId])
  @@index([userId, date])
  @@map("check_ins")
}
```

Add to `User`: `checkIns CheckIn[]`. Add to `Block`: `checkIns CheckIn[]`.

API routes to add:
- `GET /api/checkins?weeks=8` → list
- `POST /api/checkins` → create/upsert by date
- `GET /api/checkins/[id]` / `PATCH /api/checkins/[id]`

## Phase order

### Phase A — theme foundation (deploy this alone first — files included in this drop)
1. Replace `globals.css`, `tailwind.config.ts`, `theme.ts`, `ThemeInit.tsx`, `settings/page.tsx`.
2. Run `npm run dev`, hit `/settings`, swap themes — every page should re-skin without breaking.
3. Push, verify on Vercel.

**Why first:** every other ported screen depends on these tokens. Locking them down now means no rework later. Also: this change is *additive* — your existing `bg-ft-*` classes keep working because the `:root` defaults are unchanged. Only when a `data-theme="..."` attr is set does anything visually change.

### Phase B — port screens one at a time (specs above; Claude Code to implement)
Order: B1 → B5 (program picker → active gameplan → logger → planning → check-in). Each ships independently.

## Conventions used in the ported pages

- **Tailwind tokens:** I kept `bg-ft-bg`, `text-ft-white` etc. — they already resolve through CSS vars, so themes "just work" without touching markup.
- **Theme-only chrome** (knurled brass strip on Iron, spiral binding on Notebook, scanlines on Arcade) is gated by `data-theme` selectors in `globals.css`. Pages add a class hook (e.g. `<div className="ft-card">`) and the chrome appears/disappears as the theme changes. No conditional React.
- **Display vs. body type:** use `font-display` for headings, `font-data` for numerals, default for body. These map to per-theme font stacks in CSS.
- **Mobile-first:** every page assumes ≤480px viewport, `min-h-screen`, `pb-safe` for the home indicator, 44px hit targets.

## What I did NOT touch

- API routes other than `/api/checkins` (new). Existing payload shapes are honored.
- Auth, Prisma adapter, offline queue, draft store — all kept as-is.
- The existing UI primitives in `src/components/ui/*` — they still work; ported pages use them where they fit and inline custom markup where the prototypes call for it.

## Open questions / follow-ups

- **Theme persistence cross-device** — currently `localStorage` only. If you want it to follow the user across devices, add `themePreference String?` to the `User` model and have `theme.ts` post to `/api/me/theme`. Easy to bolt on later.
- **Per-screen theme override** — the picker prototype let you tweak each screen's theme independently. We're going one-theme-app-wide; if you want to revisit, the architecture supports it (each page would just check a context instead of `data-theme`).
- **Graffiti tilt** — only graffiti uses `transform: rotate(-.2deg)` on cards. I gated this behind `[data-theme="graffiti"]` so other themes stay level.
