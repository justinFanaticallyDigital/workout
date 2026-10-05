# FitTrack — Claude Reference Document

## Developer environment
- **Local OS:** Windows (PowerShell). Give CLI instructions in PowerShell syntax (`$env:VAR="value"`, not `VAR=value cmd`).
- **Production branch:** `claude/setup-nextjs-project-p4MRM` — Vercel deploys from it. Feature work happens on `claude/*` branches and lands by PR.
- **Verification before every commit:** `npx tsc --noEmit`, `npx next lint`, `npx next build` (a dummy `DATABASE_URL` is enough for the build).

## What FitTrack is
A personal training + nutrition tracker for one user. Next.js 14 (App Router) + TypeScript, Prisma 7 with `@prisma/adapter-pg` on PostgreSQL (Railway), NextAuth 4 (Google OAuth, database sessions), Tailwind 3 with `ft-*` tokens, `next-pwa`, deployed on Vercel.

**v2 (current rebuild)** collapsed three things: the Logger / Program / Gameplan *tier system* became one tier; seven runtime *themes* became one hardcoded theme (Atompunk); the five-tab shell became **four tabs — Training · Nutrition · Stats · Settings**. There is no gameplan concept, no adherence, no goal engine, no recommendations, no check-ins, no Planning Mode, no theme switcher. Do not bring any of them back (see "Do not reintroduce").

## Reference docs
- **`CLAUDE.md`** (this file) — architecture, rules, schema, design system, current state. Read first.
- **`docs/v2-rebuild-plan.md`** — the approved rebuild plan: decisions and their rationale, final route map, schema additions, API surface, seeds, build sequence, deletion list.
- **`docs/archive/`** — superseded docs (gameplan spec, tier reskin record, old plans). History only.
- The **design canvas** (Claude Design, "FitTrack v2 — Base Screens · Atompunk", 16 screens) is the authority on appearance. It is not in the repo; its resolved values are the `:root` tokens in `src/app/globals.css` and the primitives in `src/components/kit/`.

## Rules that must hold everywhere

### Model and navigation
1. **Plans are sequences, not calendars.** A plan is an ordered list of days — Day 1, Day 2, … — and nothing binds a day to a date. The date in a header is informational. This holds for training plans and nutrition plans alike.
2. Therefore: **no "today's workout", no adherence %, no streaks, no reminders, no schedule overrides, no "you missed a day".** Completed workouts keep real timestamps; Stats reconstructs history after the fact.
3. **Four tabs only.** Training · Nutrition · Stats · Settings. No FAB, no fifth tab, no top nav. One `BottomNav`, mounted once in the root layout, hidden on full-screen flows (logger, frame start, activity loggers, stretch timer, label scan, sign-in).
4. On a Training day card, **Start goes straight into the logger**. Tapping the card body opens day detail. No intermediate preview.
5. **Frames** = saved workout templates (Training) and slot templates (Meals). Never "ad hoc workouts". Blank/improv workouts start from the trailing `+` card, not from a stored frame.
6. The Training tab lists **active** plans only. Paused/completed plans are reached from "Show archived" at the bottom of the tab and from the Plans list.
7. Multiple plans can be active at once. Creating or activating a plan never pauses another.
8. Hand-built plans have exactly one Block (named "Days"), which the UI never shows. Pre-made plans may have several blocks; then the section stamp is a block switcher and Day N is numbered within the block. Never add block UI to single-block plans.
9. Training and Nutrition share one component tree: `ScreenHeader → SectionHeader → CardStrip → DayCard → detail → ItemStrip → ItemCard → AddCard`. Extend the shared component; do not fork it.
10. **Stats is descriptive only.** It reports what happened and makes no judgements against a plan.

### Copy
- No marketing prose ("we'll", "you can", "feel free to"). No instructional paragraphs. **Never add "swipe" helper text** — the peeking last card is the affordance.
- Headers are labels, not questions. Labels are nouns; buttons are verbs.
- Prefer data over prose: show the number, date, value. One idea per line.

### Theme
- **One theme, built into the code.** No theme provider, no `useTheme`, no theme prop, no `data-theme` / `data-button-style` attributes, no per-theme CSS blocks. Colours, fonts, radii and shadows are static `--ft-*` variables on `:root`.
- Do not introduce a new `ft-*` Tailwind utility without adding its `--ft-*` variable to `:root` **and** the entry in `tailwind.config.ts`.
- `--ft-muted` maps to **textTertiary**, never to a border colour (it was once mapped to `borderSubtle` and every placeholder went invisible).
- Macro colours are fixed everywhere: **fat = gold, carb = teal, protein = coral**. Category colours are fixed: push / pull / legs / core.

## Navigation shell and routes

| Tab | Route | Contents |
|---|---|---|
| Training | `/training` | one section per active plan (day-card strip, Start on the card) · Frames row · + New plan · Show archived |
| Nutrition | `/nutrition` | Targets card · library grid (My Days · My Meals · Diary · Foods) · plan sections as day accordions |
| Stats | `/stats` | Days trained · Body weight · Volume (+ split by group) · Recent PRs · Progress photos · external-tracker placeholder |
| Settings | `/settings` | Account · Units · Plans (archived) · Library · Data (export) · Integrations · Advanced |

```
/                              → redirect /training
/signin                        Google sign-in
/training                      Training tab
/training/plans                Plans list: New plan (blank / duplicate) · Pre-made (8) · Active / Paused / Completed
/training/[planId]             Plan editor: status segmented · day accordion · exercise rows (name picker + category picker) · + Add day · rename / delete
/training/[planId]/[dayId]     Day detail: Start workout · exercise rows with last performance · Save as frame · Edit day
/log/[workoutId]               Logger (workoutId = blockDayId | new-blank) — sets, PRs, rest timer, swap/remove, drafts, offline queue
/log/frame/[frameId]           Start a frame → pre-fills the new-blank draft → /log/new-blank
/log/activity/[type]           HIIT / LISS / class / custom loggers
/log/stretch-timer             Stretch timer
/history, /history/[id]        Workout history + session replay · Save as frame
/nutrition                     Nutrition home
/nutrition/targets             Edit default targets (NutritionTarget)
/nutrition/days, /days/[id]    My Days · Day Builder (Default / Override targets · meal slots · sticky totals)
/nutrition/meals, /meals/[id]  My Meals · Meal Builder (Frame / Ingredients · search · Scan · frame tiles · extras)
/nutrition/scan, /scan/review  Label scan (camera) · Label review → FoodItem
/nutrition/plans, /plans/[id]  Nutrition plans: create / archive · order days from My Days
/nutrition/diary, /nutrition/log, /nutrition/foods   Daily diary · add-food flow · food library
/stats                         Stats tab
/stats/exercise/[id]           Exercise history (est. 1RM trend · volume per session · history list)
/stats/prs · /stats/calendar · /stats/body · /stats/photos · /stats/injuries
/exercises, /exercises/new     Exercise library · create custom exercise (linked from Settings)
/settings, /settings/units, /settings/integrations, /settings/advanced
```
Redirect-only stubs (no UI): `/progress/*` → `/stats/*`, `/gameplan` → `/training`, `/calendar`, `/injuries`, `/log`, `/library`.

## Project structure (target shape)
```
src/
├── app/
│   ├── layout.tsx                 Root layout: next/font (Audiowide / Oxanium / Jost), SessionProvider, OfflineSyncProvider, ToastProvider, BottomNav
│   ├── globals.css                Tailwind + :root tokens + typography classes + ornament rules (one theme)
│   ├── page.tsx                   redirect → /training
│   ├── signin/
│   ├── training/                  page.tsx (tab) · plans/ · [planId]/ (editor) · [planId]/[dayId]/ (day detail) · _components/
│   ├── log/[workoutId]/           Logger page + _logger/ (Lane, SetCell, SetSheet, FinishBar, WorkoutHeader, TargetChip, …)
│   ├── log/frame/[frameId]/ · log/activity/[type]/ · log/stretch-timer/
│   ├── history/
│   ├── nutrition/                 page.tsx (home) · targets/ · days/ · meals/ · scan/ · plans/ · diary/ · log/ · foods/ · _components/
│   ├── stats/                     page.tsx (tab) · exercise/[id]/ · prs/ · calendar/ · body/ · photos/ · injuries/ · _components/
│   ├── exercises/
│   ├── settings/
│   └── api/                       see "API surface" in docs/v2-rebuild-plan.md §4
├── components/
│   ├── kit/                       The Atompunk primitives — the only UI vocabulary (see Design system)
│   ├── ui/                        Toast · EmptyState · Skeleton (survivors)
│   ├── SessionProvider.tsx · OfflineSyncProvider.tsx
├── lib/
│   ├── prisma.ts · auth.ts · auth-helpers.ts · fetch-helpers.ts
│   ├── draft-store.ts             Workout draft localStorage manager (24 h TTL)
│   ├── offline-queue.ts           Offline workout queue + sync
│   ├── progression.ts             Epley 1RM, stall detection
│   ├── categories.ts              movementPattern → { group: push|pull|legs|core|other, label }
│   ├── nutrition-math.ts          item → kcal/macros, meal/day totals
│   ├── workout-library.ts         18 curated workouts — seed source for frames only
│   └── program-templates/         8 authored plans (data + types + resolver) — seed source for pre-made plans only
prisma/schema.prisma · prisma/seed.ts (exercise library)
scripts/seed-frames.ts · scripts/seed-meal-guide.ts · scripts/seed-program-templates.ts · scripts/add-missing-template-exercises.ts
```

## Data model

### Core (unchanged)
- **User** → Programs, Workouts, Exercises, ExercisePrs, BodyMetrics, ProgressPhotos, Injuries, FoodItems, Meals, NutritionTargets, MealPlans, ActivityLogs, StretchRoutines, + v2: WorkoutFrames, SavedMeals, SavedDays.
- **Program** (status active / paused / completed) = a **plan**. → Blocks. `name`, `description`, `startDate`.
- **Block** → BlockDays. Hand-built plans: exactly one block ("Days"). Pre-made plans: one per phase.
- **BlockDay** = a **plan day**: `name`, `sortOrder` (Day N), `dayType`. → BlockDayExercises, Workouts.
- **BlockDayExercise** → Exercise (+ optional altExercise), `targetSets`, `targetRepRange`, `targetRpe`, `targetRir`, `sortOrder`, `notes`.
- **Workout** → WorkoutExercises → Sets. `blockDayId` links a session to its plan day; `frameId` (v2) links it to a frame; `date`/`startTime`/`endTime` are the record. "Completed this week" = a Workout with `endTime` for that blockDayId in the current ISO week.
- **Set** → weight, reps, rir, rpe, isWarmup, isPr. **ExercisePr** auto-created in `POST /api/sets`.
- **Exercise** → 367 seeded + custom. `movementPattern` (26 values, see `lib/categories.ts`) + `primaryMuscle` drive the category label and colour. Editable via `PATCH /api/exercises/[id]`.
- **BodyMetric**, **ProgressPhoto**, **Injury** (+ InjuryNote), **ActivityLog** (STRETCH / HIIT / LISS / CLASS / CUSTOM), **StretchRoutine**.
- **FoodItem** → name, brand, barcode, servingSize/Unit, calories, protein, carbs, fat, fiber, sugar, sodium, `saturatedFat` (v2), source (`custom` / `usda` / `openfoodfacts` / `guide` / `label-scan`). `userId null` = shared library row.
- **Meal → MealItem** = the daily diary. **NutritionTarget** (`isActive`, label "Default", no block/goal) = the default targets.

### v2 additions (library + frames)
- **WorkoutFrame** → `name`, `focus`, `description`, `notes`, `libraryId` (set when seeded from `workout-library.ts`). → **WorkoutFrameExercise** (`exerciseId`, `sortOrder`, `targetSets`, `targetRepRange`, `targetRpe`, `notes`). A frame is a plan, not a record: no weights.
- **MealTemplate** (archetype: `slug`, `name`, `description`) → **MealTemplateSlot** (`role` ∈ protein / carb / fat / filling / flavor, `required`, `sortOrder`, `hint`).
- **SavedMeal** ("My Meals": `name`, `mealType` tag, `templateId`, `notes`) → **SavedMealItem** (`foodItemId`, `quantity` × servingSize, `role` = frame slot or `null` = extra, `sortOrder`).
- **SavedDay** ("My Days": `name`, optional `calories`/`protein`/`carbs`/`fat` override — all null = use default targets) → **SavedDaySlot** (`sortOrder`, `label`, `mealId?` → SavedMeal). A meal is one entity referenced by many days; editing it updates every day that uses it.
- **MealPlan** = a nutrition plan (`isActive` = not archived). **MealPlanDay** rows order the plan's days: `dayNumber` + `savedDayId` (+ optional `name` label). A day belongs to at most one plan; `savedDayId null` plan-days are legacy.

### Present but unused by any UI
`CheckIn`, `Recommendation`, `GameplanChange`, `LifestyleLog`, `LifestyleTarget`, `ScheduleOverride`, `UserMetricTarget`, `Goal`, `ProgramBenchmark`, `IntegrationData`, `DailyMetric`, `Program.gameplanKind` (still the lookup key the template seeder/clone use), `Block.refeedWeeks`, `Workout.source` (never branched on), `MealPlanMeal`/`MealPlanItem` (old containment), `MealPlan.proteinPct/carbsPct/fatPct/mealsPerDay`. Leave them; prune in a later pass once a month of use shows what is dead.

**After schema changes run `npx prisma db push`** (no migration history is kept) then `npx prisma generate`.

## Design system — Atompunk (single theme)

Light mint paper, porcelain cards, atomic teal accent, coral and gold secondaries, one ornament (the orbit glyph) plus a chrome band on cards and a faint starburst field on the background.

### Tokens (`:root` in `globals.css`; Tailwind `ft-*` utilities read them as RGB triplets)
| Role | Tailwind | Value |
|---|---|---|
| App background / alt | `bg-ft-bg`, `bg-ft-bg-alt` | `#DCE6E0`, `#CCD9D2` |
| Cards, nav, sticky bars | `bg-ft-surface` | `#FCFBF5` |
| Inputs, mini tiles in cards | `bg-ft-surface-raised` (alias `bg-ft-card`) | `#FFFFFF` |
| Segmented track, food tiles, quiet buttons | `bg-ft-surface-alt` | `#F0EFE6` |
| Text primary / secondary / tertiary | `text-ft-white` or `text-ft-pale` / `text-ft-light` / `text-ft-dim` (= `text-ft-muted`) | `#1F2A28` / `#46544F` / `#7A8782` |
| Card border / row divider | `border-ft-border` / `border-ft-border-faint` | `#C9D2CC` / `#DBE2DC` |
| Accent (teal) / deep | `ft-accent` / `ft-accent-deep` | `#0E8C7C` / `#0B7263` — faint fill = `bg-ft-accent/[.12]`, dashed border = `border-ft-accent/40` |
| Coral (calories, PR, Finish, protein) / bg | `ft-coral` / `ft-coral-bg` (aliases: `ft-danger*`) | `#D6492E` / `#FAE6E0` — border = `border-ft-coral/50` |
| Gold (rest, fat, warnings) / text / bg / border | `ft-gold` / `ft-gold-fg` / `ft-gold-bg` / `ft-gold-border` (aliases: `ft-warn*`) | `#C9892A` / `#B0741C` / `#F7EBD6` / `#E0C58E` |
| Success / text / bg / border | `ft-success` / `ft-success-fg` / `ft-success-bg` / `ft-success-border` | `#3F8F5C` / `#2F7A4A` / `#E1EEE4` / `#ADD1B7` |
| Text on teal / coral | `text-ft-on-accent` | `#FCFBF5` |
| Category groups push / pull / legs / core | `ft-push` / `ft-pull` / `ft-legs` / `ft-core` | `#2A9D8F` / `#5BA572` / `#D6492E` / `#C9892A` |
| Camera screen bg / text / muted | `ft-cam-bg` / `ft-cam-text` / `ft-cam-muted` | `#141D1B` / `#E9EFEC` / `#9FB0AA` |

### Type
Loaded with `next/font/google` in `layout.tsx`, exposed as `--ft-font-display` / `--ft-font-data` / `--ft-font-body` and the `font-display` / `font-data` / `font-body` utilities.
- **Audiowide** (display): screen titles only. 21px uppercase, tracking .04em, line-height 1.1. Logger title 16px, camera title 15px.
- **Oxanium** (data): every number, label, stamp, button and tab label; tabular figures. Big stat 36/700 (targets kcal) and 30/700 (stat cards); card title 14.5–15/700; row title 13.5–14/600; eyebrow 9–10.5 uppercase tracking .14–.18em in textTertiary; link 11/600 uppercase .14em teal followed by " ›".
- **Jost** (body): descriptions and item names, 12.5–14px, textSecondary.
- Typography classes in `globals.css`: `.t-title`, `.t-eyebrow`, `.t-label`, `.t-link`, `.t-day` ("DAY N": Oxanium 11/700 teal .16em). Use them before reaching for arbitrary values.

### Radii, shadows, spacing, ornament
- Radii `rounded-ft-sm` 4 (chips, target tags, inputs) · `rounded-ft-md` 10 (buttons, tiles, set cells, inner panels) · `rounded-ft-lg` 18 (cards, add cards) · pills `rounded-full`.
- Shadows `shadow-ft-sm` `0 1px 2px rgba(31,42,40,.08)` (cards, buttons) · `shadow-ft-md` `0 6px 20px rgba(31,42,40,.14)`.
- Screen horizontal padding 20px (`px-5`). Card padding 14–16. Gaps: 6–8 tiles/chips, 10 stacked cards, 12 card strips/grids, 18–22 between sections. Horizontal strips let the last card peek 30–60px past the edge.
- **Starburst field** on `body`: three layered radial gradients (teal .07 at 16% 12%, coral .05 at 84% 82%, gold .035 centre). Light screens only.
- **Chrome band**: `Card band` renders a 3px bar at top, inset 16px each side, radius `0 0 3px 3px`, opacity .9, `linear-gradient(90deg, teal 0 62%, coral 62% 82%, gold 82% 100%)`. Rows and secondary cards turn it off.
- **Orbit glyph**: nucleus r2.4 teal, two ellipses rx10 ry4.2 stroke 1.3 (second rotated 60°), coral electron r1.5 at (21.2, 9.4). Before every screen title at 20px. The only ornament. Keep it.

### Kit (`src/components/kit/`) — the only UI vocabulary; do not invent parallel components
`Card` (band / raised) · `Stamp` (teal / coral / gold / muted / success) · `Btn` (primary / coral / ghost / quiet · small · renders `<a>` or `<button>`) · `Orbit` · `ScreenHeader` (back link · orbit + title · subtitle · right slot) · `SectionHeader` (title · stamp · "Edit ›") · `CardStrip` · `AddCard` · `MacroTriple` (fat · carb · protein) · `Seg` · `Stepper` · `Chev` (▾ / ▴) · `TargetTag` (dashed `⊙ 4×6–8`) · `CategoryChip` + `lib/categories.ts` · `StatusStamp` (active / paused / completed) · `DayHeader` ("DAY N · name · right") · `StickyBar` · `TrendLine` · `BarRow` · `PhotoSlot` · `ExercisePickerSheet` · `BottomNav` · `icons`. Recurring patterns: drag grip `⠿`, remove `✕`, expand chevron, sticky bottom bar with stats left and primary action right.

## Key implementation patterns
- **Server components** for read screens (Training, Plans, Stats, Nutrition home, exercise history): direct Prisma queries with `getAuthUserId()` + `redirect("/signin")`; data passed to a client view component. **Client components** mutate through `fetch("/api/...")`.
- **Auth in API routes:** `const [userId, errorRes] = await requireAuth()` (preferred) or `requireAuthUserId()` (throws).
- **Dynamic routes:** server components use `params: Promise<{ id: string }>`; client components use `{ params: { id: string } }`. Data pages export `const dynamic = "force-dynamic"`.
- **Logger** (`/log/[workoutId]`): template-based (`workoutId` = blockDayId) or blank (`new-blank`). 2s-debounced localStorage drafts via `draft-store.ts` (24 h TTL), offline queue, auto PR detection in `POST /api/sets`, volume = weight × reps excluding warm-ups. Finish writes the Workout and offers **Save as frame** (exercises + targets, never weights).
- **Starting a frame** (`/log/frame/[id]`): loads the frame, builds the logger's exercise shape, stores it under the `new-blank` draft key, routes to `/log/new-blank`. No Workout row until Finish, so backing out leaves no orphan.
- **Categories** (`lib/categories.ts`): group = push / pull / legs / core / other from `movementPattern`; label = the pattern, except isolation patterns show the muscle (Elbow Flexion → "Biceps"). The category picker PATCHes the exercise's `movementPattern`.
- **Nutrition math** (`lib/nutrition-math.ts`): item kcal/macros = food per-serving values × quantity; meal = Σ items; day = Σ slot meals; targets = day override ?? default NutritionTarget.
- **Label scan**: `POST /api/nutrition/foods/scan` takes a base64 image and returns label fields with per-field confidence. It calls Claude vision only when `ANTHROPIC_API_KEY` is set; otherwise it returns 501 and the review screen opens empty for manual entry. The key never reaches the client.
- **Toasts:** `useToast()` from `components/ui/Toast` (auto-dismiss 4s). **PWA:** `next-pwa`, offline fallback `/public/offline.html`.

## Scripts, seeds, environment
```powershell
npm run dev | build | start | lint
npx prisma db push                               # after any schema change (no migration history)
npm run db:seed                                  # 367 exercises
npx tsx scripts/seed-frames.ts --user you@x.com       # 18 starter frames from workout-library.ts
npx tsx scripts/seed-meal-guide.ts --user you@x.com   # 5 meal archetypes · ~53 guide foods · 24 sample meals
npx tsx scripts/add-missing-template-exercises.ts     # then:
npx tsx scripts/seed-program-templates.ts             # 8 pre-made plans under templates@fittrack.system
```
Env: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`; optional `ANTHROPIC_API_KEY` (label scanning).

## Do not reintroduce
Gameplan / Program / Logger tiers, `TierProvider`, Shelf / checkout / welcome flows · check-ins, recommendations, the goal engine, lifestyle logs/targets, Planning Mode, `GameplanChange` audit UI · adherence %, streaks, "today's workout", week strips bound to dates, schedule overrides · the program-builder engine, smart generator, visual builder, goal wizard, template customization wizard (one plain editor at `/training/[planId]` is the only creation path besides "Use plan" and duplicate) · theme switcher, `ThemeProvider`, `useTheme`, `data-theme` CSS, `components/themed`, multi-font `@import` · the `+Log` FAB and `LogActivitySheet` · a fifth tab.

## Rebuild status
Tracked per phase of `docs/v2-rebuild-plan.md` §7. Update this list when a phase lands.
- [x] P0 — CLAUDE.md rewrite, docs archived
- [x] P1 — gameplan tier / tier model / shelf / engines removed; temporary 4-tab nav
- [x] P2 — Atompunk tokens, fonts, kit primitives, real BottomNav
- [ ] P3 — schema additions, seeds, APIs
- [ ] P4 — Training tab, day detail, plans list, plan editor
- [ ] P5 — Logger restyle + frames
- [ ] P6 — Nutrition home, targets, My Days, Day Builder, plans
- [ ] P7 — My Meals, Meal Builder, label scan + review
- [ ] P8 — Stats tab, exercise history, PRs, moved pages
- [ ] P9 — Settings hub + restyle of kept pages
- [ ] P10 — cutover cleanup (this section is removed when it lands)

Until P10 lands, parts of the tree described above are still being built; the old gameplan-era code that remains is scheduled for deletion, not for extension.
