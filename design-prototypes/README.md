# Design Prototypes — Reference Files

Source-of-truth design prototypes from Claude Design's drop. **Reference only — not part of the build.** `tsconfig.json` excludes this folder so TypeScript doesn't try to compile these files.

When porting to production, treat the JSX as the visual spec. Layout, copy, ordering, and theme-adaptive chrome behavior should match. Logic must be rewired to the live API contracts (existing routes in `src/app/api/`).

## Phase B mapping

Phase B order is **B5 → B1 → B2 → B4 → B3**. One feature branch and PR per task. See `docs/IMPLEMENTATION.md` for the full hand-off brief.

| Phase | Prototype | Target route | Notes |
|---|---|---|---|
| **B1** | `picker-screens.jsx` (1358 lines) | `/programs/new` | 5-step onboarding: Welcome → Filter → List → Preview → Setup. Replaces existing placeholder. Generates blocks/days/exercises via `program-engine/templates.ts` (8 templates already in repo). Recommend adding `POST /api/programs/from-template` for a clean server-side commit. |
| **B2** | `gameplan-active.jsx` (2226 lines) | `/gameplan` (new route) | Active program dashboard. Tabs: Training / Nutrition / Lifestyle. Today card pulls from active program → active block → today's BlockDay. CTA → `/log/[workoutId]`. Break into `GameplanHeader`, `TodayCard`, `WeekStrip`, `BlockProgress`, `NutritionPanel`, `LifestylePanel`. |
| **B3** | `logger-app.jsx` + `logger-data.jsx` + `logger-skeletons.jsx` | `/log/[workoutId]` | Visual port only — keep existing logic (auto-save, offline queue, draft store). Drop the prototype's set-row, exercise card, finish modal, rest timer into the existing component shape. Graffiti tilt is gated to `[data-theme="graffiti"]` in `globals.css` — don't re-add inline. |
| **B4** | `planning-screens.jsx` | `/programs/[programId]` + nested | Program-builder editor. Uses existing `EditableExerciseTable` and `ExerciseBrowserPanel` from `src/components/ui/`. Existing routes already work; rebuild the visual layer. |
| **B5** | `checkin-screens.jsx` + `checkin-icons.jsx` | `/checkin` (new) + new schema | Weekly check-in. Append `CheckIn` model to `prisma/schema.prisma` (schema in `docs/IMPLEMENTATION.md`), then `prisma migrate deploy` runs on Vercel. Add `GET/POST /api/checkins`, `GET/PATCH /api/checkins/[id]`. |

## Scaffolding (not directly ported)

Used by the prototype demos to render in isolation. The live app already provides equivalents:

| File | Purpose | Live equivalent |
|---|---|---|
| `phone-shell.jsx` | Mobile-frame wrapper for prototype demos | n/a — live app is the device |
| `theme-bridge.jsx` | Theme context for prototypes | `src/providers/ThemeProvider.tsx` |
| `theme-typography.jsx` | Typography helpers (`H1`, `Mono`, `Display`) | Tailwind utilities (`font-display`, `font-data`, `font-body`) + theme-scoped CSS in `globals.css` |
| `tweaks-panel.jsx` | Dev panel for tweaking prototype state | n/a — dev-only |

## Seed templates (`templates/`)

Reference `ProgramTemplate` definitions for additional preset programs. **Not yet wired up** — `src/lib/program-engine/templates.ts` carries the 12 currently-shipping templates. These two are candidates to merge into the live preset set during B1 if desired:

- `lean-out.ts` — 12 weeks, Upper/Lower ×4 + cardio, structured deficit
- `powerbuilder.ts` — strength + hypertrophy hybrid

To use one as a live template: copy its `ProgramConfig` shape into `src/lib/program-engine/templates.ts` (the `ProgramTemplate` import path differs — see live `templates.ts` for the correct import).

## Conventions used in the prototypes

- **Tailwind tokens** — `bg-ft-bg`, `text-ft-white`, etc. resolve through CSS variables, so themes "just work" without touching markup. No theme-aware React conditionals.
- **Theme-only chrome** (knurled brass strip on Iron, spiral binding on Notebook, scanlines on Arcade) is gated by `[data-theme]` selectors in `globals.css`. Pages add a class hook (e.g. `<div className="ft-card">`) and the chrome appears/disappears as the theme changes.
- **Display vs. body type** — `font-display` for headings, `font-data` for numerals, default for body. Per-theme font stacks live in `globals.css`.
- **Mobile-first** — every page assumes ≤480px viewport, `min-h-screen`, `pb-safe` for the home indicator, 44px hit targets.

## What the prototypes do NOT cover

- API routes other than `/api/checkins` (new). Existing payload shapes are honored.
- Auth, Prisma adapter, offline queue, draft store — kept as-is.
- The existing UI primitives in `src/components/ui/*` — they still work; ported pages use them where they fit and inline custom markup where the prototypes call for it.

## Open questions

- **Theme persistence cross-device** — currently `localStorage` only. To follow the user across devices: add `themePreference String?` to `User`, have `lib/theme.ts` POST to `/api/me/theme`. Bolt-on later.
- **Per-screen theme override** — the picker prototype lets you tweak each screen's theme independently; live app uses one theme app-wide. Architecture supports either.
