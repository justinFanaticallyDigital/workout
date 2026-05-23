# FitTrack UX Overhaul — Implementation Plan

## Design Philosophy

The current app is built around **separate pages with deep nesting** (8 clicks to set up a program). The overhaul shifts to a **panel-based, contextual UI** — fewer page transitions, more inline editing, and visual context at every level. The goal: a user should be able to set up a full program, log a workout, and track progress without feeling like they're navigating a website.

---

## 1. Visual Status System (Icons + Indicators)

Add a consistent icon/badge language across all entity levels.

### Status Icons
| Entity | Status | Icon | Color |
|--------|--------|------|-------|
| Program | Active | ▶ (play) | ft-white |
| Program | Paused | ‖ (pause) | ft-warn |
| Program | Completed | ✓ (check) | ft-success |
| Block | Active | ● (filled dot) | ft-white |
| Block | Upcoming | ○ (hollow dot) | ft-dim |
| Block | Completed | ✓ | ft-success |
| Day | Lifting | ⬆ (barbell-like) | ft-light |
| Day | Cardio | ♥ | ft-warn |
| Day | Conditioning | ⚡ | ft-warn |
| Day | Mobility | ↻ | ft-dim |
| Day | Rest | — | ft-muted |

### Where Applied
- **Programs list** — Icon + colored left border per status
- **Block cards** on program detail — Icon in header, progress bar showing weeks completed
- **Day cards** on block detail — Type icon + exercise count badge
- **Nav breadcrumb** — Show active program/block context as a subtle line under the nav

### Files to Modify
- `src/app/programs/page.tsx` — Add status icons to program cards
- `src/app/programs/[programId]/page.tsx` — Add icons to block cards
- `src/app/programs/[programId]/blocks/[blockId]/page.tsx` — Add type icons to day cards
- New: `src/components/ui/StatusIcon.tsx` — Reusable status icon component

---

## 2. Timeline / Duration Visualization

A horizontal timeline strip showing where you are in a program's lifecycle.

### Program Timeline
- Horizontal bar spanning the program's `durationWeeks`
- Divided into blocks (proportional width based on each block's `durationWeeks`)
- Current week highlighted with a marker/line
- Each block segment colored by status (white=active, dim=upcoming, success=done)
- Hover/tap a block segment to see details

### Block Timeline
- Shows weeks within the block
- Days of the current week shown as cells (like the existing dashboard week view, but inside the block context)
- Completed workout days filled in

### Implementation
- New: `src/components/ui/Timeline.tsx` — Horizontal timeline bar component
  - Props: `segments: { label, width, status, current? }[]`
  - Renders as a flex row of colored segments with a position marker
- Add to `src/app/programs/[programId]/page.tsx` — Below header, above blocks list
- Add to `src/app/programs/[programId]/blocks/[blockId]/page.tsx` — Below header

---

## 3. Program Creation — Three Tiers

Replace the single `/programs/new` form with a tiered creation flow.

### Tier Selection Screen (`/programs/new`)
Three cards the user picks from:

**A) Use a Template (Simple)**
- Pick from pre-built templates (PPL, Upper/Lower, Full Body 3x, 5/3/1, etc.)
- Templates are seed data: a Program with Blocks, Days, and exercise slots
- User selects → clone into their account → start logging immediately
- New: `src/app/programs/new/templates/page.tsx`
- New: seed data for 4-6 common program templates
- New: `POST /api/programs/clone` — Clones a template program with all blocks/days/exercises

**B) Build As You Go (On the Fly)**
- Creates a minimal program (just a name + "active" status)
- Lands on the program detail page immediately
- User adds blocks/days/exercises over time as they train
- This is basically the current flow, but streamlined: program created in 1 click with just a name
- The program detail page becomes the workspace

**C) Goal-Driven (Plan Backward)**
- Starts with: "What's your goal?" — strength PR, body weight target, frequency target, or custom
- Uses the existing `Goal` model (currently unused)
- Steps:
  1. Pick goal type (strength / bodyweight / frequency / custom)
  2. Set target value + target date
  3. Set training frequency (days/week)
  4. Auto-suggests program duration and block structure
  5. Creates Program + Goal + skeleton Blocks
- New: `src/app/programs/new/goal/page.tsx` — Multi-step goal wizard
- New: `POST /api/goals` — Create goal + linked program

### Files
- Rewrite: `src/app/programs/new/page.tsx` — Tier selection cards
- New: `src/app/programs/new/templates/page.tsx` — Template browser
- New: `src/app/programs/new/goal/page.tsx` — Goal wizard
- New: `src/app/api/programs/clone/route.ts` — Clone template
- New: `src/app/api/goals/route.ts` — CRUD for goals

---

## 4. UX / Navigation Overhaul

### 4a. Consolidated Program Workspace

Replace the 3-level drill-down (Program → Block → Day) with a **single-page workspace**.

**Program Detail Page becomes the hub:**
- Left panel: Block list (vertical tabs/accordion)
- Right panel: Selected block's days + exercises
- Click a day → exercises expand inline (accordion), no page navigation
- All editing happens in-place

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [← Programs]  Strength Block Q1  ▶ Active       │
│ ┌──── Timeline ─────────────────────────────┐   │
│ │ [Block 1 ████|Block 2 ░░░░|Block 3 ░░░░] │   │
│ └───────────────────────────────────────────┘   │
│                                                   │
│ ┌─Blocks──┐  ┌─Day Details────────────────────┐ │
│ │ ● Hyper  │  │ Day 1 · Upper Push  [⬆ lifting]│ │
│ │ ○ Str    │  │                                 │ │
│ │ ○ Peak   │  │ 1. Bench Press BB    3×8-12     │ │
│ │          │  │ 2. OHP DB            3×8-12     │ │
│ │          │  │ 3. Lateral Raise DB  3×12-15    │ │
│ │          │  │ [+ Add Exercise]                │ │
│ │          │  │                                 │ │
│ │          │  │ Day 2 · Upper Pull  [⬆ lifting] │ │
│ │          │  │ 1. Barbell Row       4×6-8      │ │
│ │          │  │ ...                             │ │
│ └──────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

On mobile: blocks become a horizontal scroll row of pills at the top, days stack vertically below.

### 4b. Inline Spreadsheet-Style Exercise Editing

Replace the "one exercise at a time" add form with a spreadsheet grid.

**Day's exercise list becomes an editable table:**
```
│ #  │ Exercise              │ Sets │ Reps   │ RPE  │ Progression │ ⋮  │
│ 1  │ Bench Press - BB      │ 3    │ 8-12   │ 7-8  │ linear +5   │ ⋮  │
│ 2  │ OHP - DB              │ 3    │ 8-12   │ 7-8  │ double      │ ⋮  │
│ 3  │ [type to search...]   │      │        │      │             │    │
```

- Each cell is directly editable (click to edit, Tab to next field)
- Last row is always an empty "add" row with exercise search
- `⋮` menu: Delete, Move Up/Down, Set Alternative, Duplicate
- Drag handle on left for reorder (updates `sortOrder`)

**Implementation:**
- New: `src/components/ui/EditableExerciseTable.tsx` — Inline editable table
  - Handles Tab key navigation between cells
  - Exercise column: inline search with dropdown
  - Numeric columns: type-in-place
  - Calls API on blur/enter (debounced save)
- New: `PATCH /api/blocks/day/[id]/exercises/[exerciseId]` — Update exercise in template
- New: `DELETE /api/blocks/day/[id]/exercises/[exerciseId]` — Remove exercise
- New: `PATCH /api/blocks/day/[id]/exercises/reorder` — Bulk reorder

### 4c. Quick Edit Actions

- **Bulk day creation**: "Add days" button opens a quick-add where you type names comma-separated: "Upper Push, Upper Pull, Lower, Cardio" → creates 4 days at once
- **Exercise alternatives**: In the `⋮` menu, "Set Alternative" opens a search picker that sets `altExerciseId`
- **Clone day**: Duplicate a day template within the same block (for A/B split variants)

---

## 5. Smart Input / Auto-Fill

### 5a. Exercise Search with Recents

When adding exercises (in day template or workout logger):
- **Recents section** at top of search results: last 10 exercises the user has logged
- **Frequency badge**: show how often they use each exercise ("12 sessions")
- Current search already works; just prepend recents before search results

**Implementation:**
- New: `GET /api/exercises/recent` — Returns user's most-used exercises
- Modify: Exercise picker in `log/[workoutId]/page.tsx` and `EditableExerciseTable.tsx` to show recents

### 5b. Weight/Rep Carry-Forward

When logging sets:
- First set auto-fills with last session's weight for that exercise (already partially done via `suggestedWeight`)
- Subsequent sets copy weight from the previous set (user just enters reps)
- If user types in Set 1, Sets 2-3 auto-fill same weight

**Implementation:**
- Modify: `src/app/log/[workoutId]/page.tsx` — When a set's weight is entered, auto-fill remaining empty sets with that weight
- This is a client-side change only, no new API needed

### 5c. Predictive Progression

Already partially built (Phase 3). Enhance:
- Show "+2.5" or "+5" badge next to suggested weight so user knows why
- For double progression: show "Same weight, try +1 rep" message
- For RPE-based: show "Target RPE 7, last was RPE 8 → try +5 lbs"

---

## 6. Logging Flow — Visual Movement Picker

Replace the current "list of day templates" picker with a visual card grid.

### New Log Landing Page (`/log`)

**Section 1: Continue / Quick Start**
- If there's a draft workout, show "Continue Workout" card prominently
- "Quick Start: Blank Workout" card

**Section 2: From Your Program** (if active program exists)
- Day template cards with visual indicators:
  ```
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  ⬆ UPPER     │  │  ⬆ UPPER     │  │  ⬆ LOWER     │
  │    PUSH      │  │    PULL      │  │              │
  │              │  │              │  │              │
  │  3 exercises │  │  4 exercises │  │  5 exercises │
  │  Last: 2d    │  │  Last: 4d    │  │  Last: 1d    │
  └──────────────┘  └──────────────┘  └──────────────┘
  ```
- Each card shows: day type icon, name, exercise count, days since last logged

**Section 3: By Movement Pattern** (for blank workouts)
- Category cards: Push, Pull, Legs, Upper, Lower, Full Body, Cardio
- Selecting one pre-filters the exercise picker in the logger

### Files
- Rewrite: `src/app/log/page.tsx` — Visual card grid layout
- New: `GET /api/workouts/last-by-day` — Returns last workout date per blockDayId

---

## 7. Offline / Local Storage Enhancements

### Current State
- Auto-save drafts to localStorage (workout logger only)
- Offline queue for failed workout saves
- Sync on `online` event

### Enhancements

**7a. Sync Status Indicator**
- Small icon in Nav showing sync state: ● green (synced), ● yellow (pending), ● red (offline)
- Click to see pending queue count
- New: `src/components/ui/SyncIndicator.tsx`

**7b. Broader Draft Support**
- Save program creation drafts (if user navigates away mid-creation)
- Save exercise form drafts
- All draft saves use a unified `src/lib/draft-store.ts` utility

**7c. Exercise Library Cache**
- Already cached via PWA `StaleWhileRevalidate` (from Phase 3)
- Add: cache the user's recent exercises in localStorage for instant search results offline

---

## Implementation Order

The dependencies flow naturally:

| Phase | What | Why First |
|-------|------|-----------|
| **A** | StatusIcon component + visual indicators | Foundation for everything else; quick win |
| **B** | Timeline component | Visual payoff, standalone |
| **C** | Program workspace (consolidated page) | Biggest UX improvement; reduces navigation depth from 5 to 1 |
| **D** | EditableExerciseTable (inline editing) | Requires workspace to host it; core editing improvement |
| **E** | Program creation tiers | Depends on workspace being ready for "Build As You Go" tier |
| **F** | Visual log picker + movement cards | Independent but benefits from status icons |
| **G** | Smart input / auto-fill | Enhances logging; depends on exercise table being ready |
| **H** | Sync indicator + offline improvements | Independent polish |

### Estimated Scope
- **New files**: ~12 (components, pages, API routes)
- **Modified files**: ~8 (programs, log, nav, exercise pages)
- **New API routes**: 5-6 (clone, goals, recent exercises, reorder, exercise CRUD on day)
- **Heaviest lift**: Phase C (program workspace) and Phase D (editable table) — these are the architectural changes

---

## Key Technical Decisions

1. **Workspace layout**: CSS Grid with `grid-template-columns: 200px 1fr` on desktop, stacked on mobile. No new layout library needed.

2. **Inline editing**: Build custom with controlled inputs + `onBlur` saves. No external table library — keeps bundle small and matches the ft-* design system.

3. **Drag-and-drop**: Use `@dnd-kit/core` (lightweight, accessible, React-native). Only for exercise reordering within a day — minimal scope.

4. **Tab navigation**: Standard `tabIndex` + `onKeyDown` handler for Tab/Shift+Tab between cells. No special library needed.

5. **Program templates**: Stored as regular Programs owned by a system user (or a `isTemplate: true` flag). Clone operation deep-copies program → blocks → days → exercises.

6. **Goal wizard**: Client-side multi-step form (no separate pages per step). Uses `useState` for step tracking, submits everything at the end.
