# Clone API integration notes

## What to change in `src/app/api/programs/clone/route.ts`

The existing `POST /api/programs/clone` accepts something like
`{ templateProgramId }`. To support customization, accept either of:

```ts
{
  templateSlug?: string;           // new — preferred for template flow
  templateProgramId?: string;      // existing — keep for backward compat
  customizationAnswers?: CustomizationAnswers;
  startDate?: string;              // ISO yyyy-mm-dd
}
```

If `templateSlug` is supplied, look up the template program in the DB by
parsing the `---META---` JSON in `Program.description` and matching `slug`.
Then run the existing clone logic with that program's id.

After the clone returns the new `programId`, run the customization passes:

```ts
import { applyCustomizations } from "@/lib/program-templates/apply-customizations";
import { getTemplateBySlug } from "@/lib/program-templates";

const template = getTemplateBySlug(templateSlug); // or look up by id then map back to slug
const warnings: string[] = [];

if (template && customizationAnswers) {
  await applyCustomizations({
    prisma,
    programId: newProgramId,
    template,
    answers: customizationAnswers,
    warnings,
  });
}

return NextResponse.json({
  programId: newProgramId,
  warnings,
});
```

## Why a separate module instead of inlining?

1. The customization passes are independent of the clone itself — if a
   pass fails, the program still exists and the user gets a working
   (uncustomized) copy with warnings.
2. Each pass is testable in isolation.
3. Keeps the route handler thin.

## Schema assumptions

The `apply-customizations.ts` module assumes:

- `Program` has `startDate: DateTime?`
- `Block` has `startDate: DateTime?`, `endDate: DateTime?`,
  `weekStart: Int?`, `weekEnd: Int?`
- `BlockDayExercise` has `notes: String?` (already exists per CLAUDE.md)
- `NutritionTarget` has `programId`, `blockId`, `protein`, `fat`,
  `carbs`, `calories`, `notes` (CLAUDE.md confirms these exist)
- `Exercise.name` is searchable case-insensitively

If any of those don't exist on the schema yet, either add them or adjust
the passes to no-op gracefully (they already log warnings on failure).

## What `apply-customizations` does NOT do

- It does not create the program itself — that's the existing clone logic.
- It does not handle the meal-plan side of nutrition — only macro targets
  per block.
- It does not change progression types or rep schemes — the template
  already specifies those, and customization shouldn't override the coach's
  intent.
- It does not delete or add days/blocks based on `days_per_week`. That's
  a more invasive transform; the template's `variantNotes` describes the
  reduced-day layout but turning it on programmatically requires extra
  metadata (which days to drop). Punted for now.

## Reduced-day variants — open question

`powerbuilder` answers `days_per_week: "4"` should drop Day 5. `lean-out`
answers `days_per_week: "3"` should switch to a full-body layout. Neither
of these is a simple transform of the existing days array.

**Recommendation:** add an optional field to template metadata —
`variantOverrides: { [daysPerWeek: number]: { dropDayIndices?: number[];
... } }` — then add a fifth pass `applyDayCountVariant` that reads it.
Skip until the other passes ship.
