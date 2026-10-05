# FitTrack v2 — Rebuild Implementation Plan

Branch: `claude/beautiful-brown-ne4dgl` → merges into `claude/setup-nextjs-project-p4MRM` (the production branch). Status: **complete** — P0–P10 shipped on the branch; `CLAUDE.md` describes the result.

Inputs: `FitTrack v2 — UI Rebuild Spec` (Sep 21), the Claude Design canvas (16 screens,
`atompunk-kit.jsx` + five `v2-*.jsx` files + handoff README), and `meal_construction_guide_4.pdf`.

The spec is the authority on structure and behaviour; the canvas is the authority on appearance.
Where this plan departs from the spec it is because the repo had already moved past the CLAUDE.md
the spec was written against. Each departure is called out in §1.

---

## 0. Where the repo actually is

- A "v2 reskin" (PRs 96–99, June) added a **three-tier model** (Logger / Program / Gameplan),
  a Shelf + checkout + welcome flow, `PillarShell`/`HomeShell`/`PillarRail`, a `TierProvider`,
  an 8th theme, and tier-branched `/training`, `/nutrition`, `/progress`, `/settings` pages.
  None of that is in the spec's deletion list; all of it conflicts with the four-tab model and
  goes.
- A **local-only Frames** concept already exists (`src/lib/logger-store.ts`, `/log/frame/[id]`):
  frames in localStorage, start-a-frame pre-fills the logger draft. The flow carries over; the
  storage moves to the database.
- `src/components/v2/` is a plain-token primitive set. It is the closest thing to the Atompunk
  kit but is tied to the rail/tier shells, so it is replaced by `src/components/kit/` rather than
  extended.
- The logger is ~3,400 lines in nine files; each reads one `useTheme().chrome` value plus one
  tier branch. Restyle, not rebuild.
- Program ↔ plan mapping: `Program → Block → BlockDay → BlockDayExercise`. Hand-built plans get one
  implicit Block. The 8 authored templates are multi-block (e.g. Size & Strength = 4 blocks × 4
  days).
- Exercise categories: `Exercise.movementPattern` is a clean 26-value column
  (Horizontal Push, Vertical Pull, Hip Hinge, Elbow Flexion, Core Rotation, …) plus `primaryMuscle`.
- Default branch on GitHub is `claude/setup-nextjs-project-p4MRM`, not `main`. Check Vercel's
  production branch before the final merge.

Verification environment: dependencies installed, Prisma client generates, Google Fonts reachable
at build time, and a **local PostgreSQL 16 runs in the container** — so every phase from the
schema onward is verified against a seeded database with the real app running, not just `tsc`.

---

## 1. Decisions

Confirmed earlier (you said "great"):

| Topic | Decision |
|---|---|
| Pre-made plans | Keep the 8 templates' content as seedable pre-made plans; delete the customization wizard, warnings and `applyCustomizations` |
| Meal slot roles | Canvas roles: `protein / carb / fat / filling / flavor` |
| Label scan | Build both screens; manual entry always works; the vision call runs only when `ANTHROPIC_API_KEY` is set |
| Exercise categories | Derive label from `movementPattern`, group colour from a code mapping; no new table |
| Schema | Additive only; nothing dropped in this pass |
| Engine folder | It is `src/lib/program-engine/`; deleted with the preview/generate routes |

New decisions made while reading the screens (each has a recommendation; say if you want the other):

1. **Delete early, not at the end.** The spec says build under `(v2)` and delete the old tree
   last. The old tree owns `/training`, `/nutrition`, `/settings`, `/log/[workoutId]` (Next.js
   forbids duplicate routes across groups) and 55 files depend on `ThemeProvider`/`TierProvider`.
   Shimming those for weeks costs more than deleting them in commit 2. Every commit still passes
   `tsc` + `lint` + `next build`; the old app stays on the default branch for comparison.
2. **Pre-made multi-block plans keep their blocks; hand-built plans never see one.** On the
   Training tab a plan with more than one block shows its current block's days and the section
   stamp becomes a block switcher ("Accumulation 1 ▾"). The plan editor shows a block selector in
   the same case. A plan with one block (every hand-built plan) is exactly the spec: Day 1…N.
   Alternative rejected: flattening 16 days with four repeats of "Day A — Upper".
3. **Nutrition libraries are first-class models with reference semantics.** The canvas added My
   Days and My Meals, which the spec did not have. The README's own data sketch
   (`NutritionPlan.days: NutritionDayRef[]`, `NutritionDay.mealSlots[].mealId`) is a library
   model: a meal is one thing used by many days, a day is one thing used by a plan. The existing
   `MealPlanDay → MealPlanMeal → MealPlanItem` containment can't express that without turning
   every row into a copy. So: new `SavedMeal`/`SavedMealItem`, `SavedDay`/`SavedDaySlot`,
   `MealTemplate`/`MealTemplateSlot`; `MealPlanDay` gains a `savedDayId` reference and becomes
   the plan's ordering row. The old containment columns stay (unused), like `CheckIn`.
4. **Nutrition home gets a 2×2 library grid**: My Days, My Meals, **Diary**, **Foods**. The
   spec keeps the food diary; the canvas gave it no entry point. Same `LibTile`, no new component.
5. **Activity loggers (HIIT / LISS / class / stretch timer) survive** at `/log/activity/[type]`
   and `/log/stretch-timer`, reached from a quiet "Log other activity ›" link under the Frames
   row. "Days trained" counts a day with a finished workout **or** an activity log.
6. **Frames are seeded from all 18 library workouts** (the registry grew past the spec's 8).
   Trivial to trim to the original 8.
7. **The category picker edits `Exercise.movementPattern`** for that exercise (single-user app;
   you own the library). Isolation patterns display the muscle: Elbow Flexion → "Biceps".
8. **`Workout.frameId`** (nullable) is added so frame cards can show "used N×" and a finished
   frame workout links back. One column, additive.
9. **Local Logger-tier data is not migrated.** Frames/sessions in `fittrack-logger:*`
   localStorage came from the simulated tier and are dropped. Say so if you have real ones.
10. **Fonts via `next/font/google`** (Audiowide, Jost, Oxanium), self-hosted at build; the 24-font
    `@import` goes. Verified reachable from the build container.

---

## 2. Final route map

```
/                         → redirect /training
/signin                   Google sign-in (restyled)

/training                 Training tab: active plan sections · Frames row · + New plan · Show archived
/training/plans           Plans list: New plan (blank / duplicate) · Pre-made (8) · Active / Paused / Completed
/training/[planId]        Plan editor: status segmented · day accordion · exercise rows · + Add day · rename / delete
/training/[planId]/[dayId]  Day detail: Start workout · exercise rows with last performance · Save as frame · Edit day

/log/[workoutId]          Logger (blockDayId | new-blank) — behaviour kept, restyled, + Save as frame on finish
/log/frame/[frameId]      Start a frame → pre-fills draft → /log/new-blank
/log/activity/[type]      HIIT / LISS / class / custom loggers (kept)
/log/stretch-timer        Stretch timer (kept)
/history, /history/[id]   Workout history + replay (kept, restyled) · Save as frame on a session

/nutrition                Nutrition home: Targets card · 2×2 library grid · plan sections (day accordions)
/nutrition/targets        Edit default targets
/nutrition/days           My Days
/nutrition/days/[id]      Day Builder (targets Default/Override · meal slots · sticky totals)
/nutrition/meals          My Meals (filter chips · slot pills · expand)
/nutrition/meals/[id]     Meal Builder (Frame / Ingredients · search · Scan · frame tiles · extras)
/nutrition/scan           Label scan (camera, dark) ?mealId=&role=
/nutrition/scan/review    Label review → saves FoodItem, fills the slot that started the scan
/nutrition/plans          Nutrition plans: new / archive; /nutrition/plans/[id] orders days from My Days
/nutrition/diary          Daily diary (kept) · /nutrition/log add-food flow (kept)
/nutrition/foods          Food library list (kept logic from diary search; + add custom / scan)

/stats                    Stats tab: Days trained · Body weight · Volume · Recent PRs · Photos · External placeholder
/stats/exercise/[id]      Exercise history (est. 1RM trend · volume per session · history list)
/stats/prs                All PRs
/stats/calendar           Monthly grid (moved from /progress/calendar)
/stats/body               Body metrics (moved)
/stats/photos             Progress photos (moved)
/stats/injuries           Injury tracker (moved; linked from Settings)
/stats/history            → /history

/exercises, /exercises/new  Exercise library + create custom (kept, restyled; linked from Settings)
/settings                 Account · Units · Plans (archived) · Library · Data (export) · Integrations · Advanced
/settings/units · /settings/integrations · /settings/advanced   (kept, restyled; /settings/theme deleted)

Redirect stubs only: /progress/* → /stats/*, /gameplan → /training, /calendar, /injuries, /log, /library
```

Bottom nav hidden on: logger, frame start, activity loggers, stretch timer, label scan, sign-in.

---

## 3. Data model (Prisma, additive)

```prisma
enum MealSlotRole { protein carb fat filling flavor }

model WorkoutFrame {
  id, userId, name, focus?, description?, notes?, libraryId?   // libraryId = workout-library id when seeded
  createdAt, updatedAt
  exercises WorkoutFrameExercise[]   workouts Workout[]
}
model WorkoutFrameExercise {
  id, frameId, exerciseId, sortOrder, targetSets?, targetRepRange?, targetRpe?, notes?
}
Workout   += frameId String? (SetNull)
Exercise  += frameExercises WorkoutFrameExercise[]

model MealTemplate      { id, slug @unique, name, description?, sortOrder; slots MealTemplateSlot[] }
model MealTemplateSlot  { id, templateId, role MealSlotRole, required Boolean, sortOrder, hint? }

model SavedMeal     { id, userId, name, mealType MealType?, templateId?, notes?, createdAt, updatedAt
                      items SavedMealItem[]  daySlots SavedDaySlot[] }
model SavedMealItem { id, mealId, foodItemId, quantity Decimal, role MealSlotRole? (null = extra), sortOrder }

model SavedDay      { id, userId, name, calories? protein? carbs? fat?  // override; all null = default targets
                      slots SavedDaySlot[]  planDays MealPlanDay[] }
model SavedDaySlot  { id, dayId, sortOrder, label?, mealId? (SetNull) }

MealPlanDay += name String?, savedDayId String? (SetNull)      // plan = ordered refs to saved days
FoodItem    += saturatedFat Decimal?                            // label review field; source "label-scan" / "guide" are plain strings
User        += workoutFrames, savedMeals, savedDays
```

Not added: `MealPlanMeal.templateId` from the spec — with `SavedMeal.templateId` in place it would be
a dead column from day one.

Untouched but unused after cutover: `CheckIn`, `Recommendation`, `GameplanChange`, `LifestyleLog`,
`LifestyleTarget`, `ScheduleOverride`, `UserMetricTarget`, `Goal`, `ProgramBenchmark`,
`Program.gameplanKind` (still the lookup key for seeded templates), `Block.refeedWeeks`,
`Workout.source` (no longer branched on), `MealPlanMeal`/`MealPlanItem`.

---

## 4. API surface

**New**

| Route | Methods | Notes |
|---|---|---|
| `/api/frames` | GET, POST | POST body: name, focus?, exercises[] (exerciseId, targetSets, targetRepRange, targetRpe) |
| `/api/frames/[id]` | GET, PATCH, DELETE | PATCH replaces the exercise list atomically |
| `/api/programs/[id]/duplicate` | POST | deep copy blocks/days/exercises → new active plan |
| `/api/exercises/[id]` | + PATCH | `movementPattern`, `name` (category picker) |
| `/api/nutrition/meal-templates` | GET | archetypes with slots |
| `/api/nutrition/saved-meals`, `/[id]` | GET, POST / GET, PATCH, DELETE | PATCH replaces items; totals computed server-side |
| `/api/nutrition/saved-days`, `/[id]` | GET, POST / GET, PATCH, DELETE | PATCH: name, overrides, slots[] |
| `/api/nutrition/foods/scan` | POST | image (base64) → parsed label fields + per-field confidence; 501 without `ANTHROPIC_API_KEY` |

**Changed**

- `/api/programs` POST: no longer pauses other active plans; `createDefaultBlock: true` creates the single "Days" block.
- `/api/programs/[id]` PATCH: no auto-pause on `status: active`; `gameplanKind` handling removed.
- `/api/programs/clone`: slug path only; no `applyCustomizations`, no lifestyle targets, no auto-pause; legacy inline-template path deleted.
- `/api/workouts` POST: accepts `frameId`.
- `/api/nutrition/plans` POST / `[id]` PATCH: `savedDayIds[]` ordering; `isActive` is the archive flag.
- `/api/nutrition/foods` POST: accepts `saturatedFat`.

**Deleted**

`checkins/*`, `recommendations/*`, `lifestyle-targets`, `lifestyle-logs`, `gameplan-changes/*`,
`schedule-overrides`, `goals/*`, `metric-targets`, `home`, `dashboard`, `programs/generate`,
`programs/preview`, `programs/[id]/benchmarks`, `workouts/from-library`, `nutrition/plans/generate`.

Read-only screens (Training, Plans list, Stats, exercise history, Nutrition home) are server
components querying Prisma directly — no new GET routes for them.

---

## 5. Tokens and kit

### `:root` in `globals.css` (static; no runtime theme writes)

| Canvas | `--ft-*` | Value |
|---|---|---|
| bg / bgAlt | `bg`, `bg-alt` | `#DCE6E0`, `#CCD9D2` |
| surface / raised / surfaceAlt | `surface`, `surface-raised` (+`card` alias), `surface-alt` | `#FCFBF5`, `#FFFFFF`, `#F0EFE6` |
| text / sec / ter | `text-primary` (+`white`,`pale`), `text-secondary` (+`light`), `text-tertiary` (+`dim`, **`muted`**) | `#1F2A28`, `#46544F`, `#7A8782` |
| border / faint | `border`, `border-faint` | `#C9D2CC`, `#DBE2DC` |
| teal / tealDeep | `accent`, `accent-deep` | `#0E8C7C`, `#0B7263` — tealFaint/tealBorder are `accent/[.12]` and `accent/40` |
| coral / coralBg | `coral`, `coral-bg` (+`danger` aliases) | `#D6492E`, `#FAE6E0` |
| gold / goldText / goldBg / goldBorder | `gold`, `gold-fg`, `gold-bg`, `gold-border` (+`warn` aliases) | `#C9892A`, `#B0741C`, `#F7EBD6`, `#E0C58E` |
| success family | `success`, `success-fg`, `success-bg`, `success-border` | `#3F8F5C`, `#2F7A4A`, `#E1EEE4`, `#ADD1B7` |
| onAccent | `text-on-accent` | `#FCFBF5` |
| cat colours | `push`, `pull`, `legs`, `core` | `#2A9D8F`, `#5BA572`, `#D6492E`, `#C9892A` |
| camera | `cam-bg`, `cam-text`, `cam-muted` | `#141D1B`, `#E9EFEC`, `#9FB0AA` |
| fonts | `font-display`, `font-data`, `font-body` | Audiowide, Oxanium, Jost (via `next/font`) |
| radii | `radius-sm/md/lg` | 4 / 10 / 18 px |
| shadows | `shadow-sm/md` | per README |

Plus the starburst background on `body`, the chrome band as a `.ft-band::before` rule, and five
typography classes (`t-title`, `t-eyebrow`, `t-label`, `t-link`, `t-day`) so the type scale is a
token and not a hundred arbitrary values.

### `src/components/kit/` (plain components, no theme branching)

Card (band / raised) · Stamp (teal / coral / gold / muted / success) · Btn (primary / coral / ghost /
quiet · small · link-or-button) · Orbit · ScreenHeader · SectionHeader · CardStrip · AddCard ·
MacroTriple · Seg · Stepper · Chev · TargetTag · CategoryChip + `lib/categories.ts` · StatusStamp ·
DayHeader ("DAY N · name · right slot" — shared by day cards, accordions, editor rows, mini cards) ·
StickyBar · TrendLine · BarRow · PhotoSlot · ExercisePickerSheet (extracted from the logger) ·
BottomNav (4 tabs) · icons.

Domain components live beside their routes (`src/app/training/_components/` etc.). The existing
`ui/Toast`, `ui/EmptyState`, `ui/Skeleton` stay.

### `lib/categories.ts`

| Group | movementPattern values | Label shown |
|---|---|---|
| push | Horizontal Push, Vertical Push, Shoulder Isolation, Elbow Extension | pattern; isolation → "Shoulders" / "Triceps" |
| pull | Horizontal Pull, Vertical Pull, Elbow Flexion, Scapular Elevation | pattern; isolation → "Biceps" / "Traps" |
| legs | Squat, Lunge, Step, Hip Hinge, Hip Extension, Hip Abduction/Adduction, Knee Extension/Flexion, Plantar Flexion | pattern; isolation → "Quads" / "Hamstrings" / "Calves" / … |
| core | Core Stability / Flexion / Extension / Rotation, Carry | pattern |
| other | Power, Cardio, Stretch | pattern, neutral colour |

---

## 6. Seeds

- `scripts/seed-frames.ts --user <email>` — 18 frames from `src/lib/workout-library.ts`; each slot
  resolves its first exercise option that exists (case-insensitive), unresolved slots skipped;
  `focus` from the entry's tags. Idempotent on `(userId, libraryId)`.
- `scripts/seed-meal-guide.ts --user <email>` — from the construction guide:
  - **5 archetypes** (`MealTemplate`): Standard plate (protein, filling, carb*, fat*, flavor),
    Training-day plate (carb required), Low-carb plate (no carb slot), No-cook bowl (yogurt /
    cottage / eggs + fruit + oats + nut butter + flavor), Snack (protein + optional filling or
    carb). `*` = optional. The guide gives the formula, not named archetypes, so these five are
    authored from its rules and are listed in the script header for review.
  - **~53 library foods** (`FoodItem`, `source: "guide"`): 9 proteins (6 oz; calories and protein
    from the guide), 8 vegetables + 8 fruits (per cup / per piece), 12 add-ins (guide portions),
    16 flavor profiles as low-calorie items (5–25 kcal). Macros the guide omits are filled with
    standard values and are editable.
  - **24 sample meals** (`SavedMeal`) from the guide's table, frame slots filled from the foods
    above; the ~15 extra ingredients the samples use (asparagus, snow peas, tuna, …) are added
    to the foods list and marked as such.
  Idempotent on name.
- `scripts/seed-program-templates.ts` — unchanged (still keys templates by `gameplanKind` = slug).

---

## 7. Build sequence

Each commit is verified with `npx tsc --noEmit`, `npx next lint`, `npx next build`. From P3 on,
also: `prisma db push` + seeds against the local Postgres, `next dev`, Playwright screenshots of
every touched screen at 410 px (sent to you at the end of each phase).

| # | Commit | Contents |
|---|---|---|
| P0 | `docs(v2): rebuild plan + CLAUDE.md rewrite` | This file. New CLAUDE.md: single-theme contract (replaces the 7-theme section), plans-are-sequences rules, the README's global copy/model rules, route map, kit inventory, "do not reintroduce" list. Archive `RESKIN_PROGRESS.md`, the old gameplan spec, `nutrition-admin-data.md`. |
| P1 | `chore(v2): remove gameplan tier, tier model, shelf, engines` | Deletions in §8 (routes, libs, APIs, providers, shells). Temporary 4-tab nav + stub pages for `/training`, `/nutrition`, `/stats` so the build is green. `/` → `/training`. Kept pages that imported `useTier` lose the branch. |
| P2 | `feat(v2): Atompunk tokens, fonts, kit primitives` | `:root` tokens, `next/font`, Tailwind aliases, typography classes, flattened `globals.css` (all `[data-theme]` blocks gone), delete `src/themes`, `components/themed`, `ThemeProvider`, strip `useTheme` from the logger (behaviour-neutral), `src/components/kit/*`, real BottomNav, root layout, manifest colours. |
| P3 | `feat(v2): schema additions, seeds, APIs` | §3 models, `prisma generate`, `seed-frames`, `seed-meal-guide`, §4 new/changed routes, clone route simplified. Local DB pushed and seeded. |
| P4 | `feat(training): tab, day detail, plans list, plan editor` | Screens 01, 02, 09, 10. Completed-this-week badge, block switcher for multi-block plans, exercise + category pickers, drag reorder, archive controls. |
| P5 | `feat(logger): Atompunk restyle, frames` | Screen 03 restyle of the nine logger files; rest bar; Save as frame in the finish sheet and on `/history/[id]`; `/log/frame/[id]` against the DB; `Workout.frameId` written. |
| P6 | `feat(nutrition): home, targets, My Days, Day Builder, plans` | Screens 04, 04.1, 04.2 plus targets edit and plan ordering. |
| P7 | `feat(nutrition): My Meals, Meal Builder, label scan + review` | Screens 04.3–04.6. Scan: `getUserMedia` viewfinder with file-input fallback; review form; vision parse behind the key. |
| P8 | `feat(stats): tab, exercise history, PRs, moved pages` | Screens 07, 08; `/progress/*` moved to `/stats/*`; charts as inline SVG (TrendLine / BarRow). |
| P9 | `feat(settings): hub + restyle of kept pages` | Settings hub, sub-pages, sign-in, history, exercises library pages in the kit. |
| P10 | `chore(v2): cutover cleanup` | Remove redirect-only leftovers that nothing links to, unused `ui/` components, Recharts if unused, README refresh, final CLAUDE.md pass, screenshots folder. |

P4–P9 each end with a push so you can pull and run locally. I will not open a PR unless you ask.

---

## 8. Deletion list (P1 unless noted)

**Routes**: `src/app/{gameplan,checkin,recommendations,shelf,checkout,welcome,my-program,library,lifestyle,canary,program,programs}/**` (programs API stays), `progress/check-ins/**`, `progress/page.tsx` + `_view.tsx` (replaced by `/stats` in P8), `log/library/**`, `log/page.tsx`, `training/_program.tsx|_logger.tsx|_components.tsx`, `nutrition/_program.tsx|_logger-pillar.tsx|_legacy.tsx|plans/page.tsx`, `calendar`, `injuries`, `stretch-timer` (legacy redirects; rewritten as one-line redirects or removed), `settings/theme` (P2).

**Components**: `components/themed/**` (P2), `components/templates/**`, `components/v2/**` (P2, after kit lands), `PillarGameplanLayer.tsx`, `ui/{LogActivitySheet,Nav,CategoryLaneView,EditableExerciseTable,PlanningSection,RecoveryCard,Timeline,StatusIcon}`; remaining `ui/*` pruned by grep in P10.

**Libs / providers**: `providers/{ThemeProvider,TierProvider}.tsx`, `lib/{tier,logger-store,theme}.ts`, `src/themes/**` (P2), `lib/goal-engine/**`, `lib/program-engine/**`, `lib/program-templates/{apply-customizations,evaluate-warnings}.ts` + the R12 compat exports; the 8 template data files, `types.ts`, `resolver.ts` stay for the seeder. `lib/workout-library.ts` stays as the frames seed source.

**API**: listed in §4.

**Scripts / docs**: `scripts/audit-theme-contrast.js`; `docs/RESKIN_PROGRESS.md`, `docs/fittrack-v2-spec.md`, `docs/nutrition-admin-data.md` → `docs/archive/`.

**CSS**: every `[data-theme="…"]` block and per-theme utility section in `globals.css` (≈1,400 of 2,194 lines), the `@import` of 24 font families, `data-button-style` rules.

---

## 9. What you run after the branch lands

```powershell
$env:DATABASE_URL = "postgresql://..."          # Railway
npx prisma db push                               # new tables + columns, nothing dropped
npx tsx scripts/seed-frames.ts --user you@example.com
npx tsx scripts/seed-meal-guide.ts --user you@example.com
# only if the 8 pre-made plans were never seeded on this DB:
npx tsx scripts/add-missing-template-exercises.ts
npx tsx scripts/seed-program-templates.ts
```

Vercel: add `ANTHROPIC_API_KEY` when you want label scanning to parse automatically; everything else
works without it. Confirm the production branch (GitHub's default is `claude/setup-nextjs-project-p4MRM`).

---

## 10. Risks and open questions

- **Decisions 2 and 3 above** are the two with real design weight (block switcher; nutrition
  library models). The rest are small and reversible.
- **Camera on iOS**: a `getUserMedia` viewfinder works in Safari and installed PWAs on HTTPS; the
  file-input fallback covers anything else. Vision parsing is a server route so the key never
  reaches the client.
- **Pre-made plans need the templates seeded** — unchanged dependency; the Plans list shows an
  explicit "not seeded" state instead of an empty section.
- **Verification gap**: the local Postgres proves schema, seeds and screens; it does not prove
  Railway-specific behaviour. `db push` against Railway is yours to run.
- **Recharts** may become unused once Stats uses inline SVG; removed only if nothing imports it.
