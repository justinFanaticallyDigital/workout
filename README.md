# FitTrack

Personal workout, nutrition, and lifestyle tracking app. Next.js 14 (App Router) + Prisma + PostgreSQL + NextAuth (Google OAuth), deployed on Vercel against Railway PostgreSQL.

Mobile-first 5-tab bottom navigation (Gameplan / Progress / +Log / Nutrition / Settings) with a 7-theme design system. Includes a deterministic program-builder engine, a goal/recommendation engine, weekly check-ins, lifestyle logging, and 8 authored gameplan templates with a clone-and-customize wizard.

## Quick start

```powershell
# 1. Install
npm install

# 2. Configure env (.env.local)
#    DATABASE_URL=postgresql://...
#    GOOGLE_CLIENT_ID=...
#    GOOGLE_CLIENT_SECRET=...
#    NEXTAUTH_URL=http://localhost:3000
#    NEXTAUTH_SECRET=...

# 3. Sync schema + seed
npx prisma db push
npm run db:seed                                      # 367 exercises
npx tsx scripts/add-missing-template-exercises.ts    # template-required exercises
npx tsx scripts/seed-program-templates.ts            # 8 gameplan templates

# 4. Dev
npm run dev
```

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Next dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Production server |
| `npm run lint` | Next lint |
| `npm run db:push` | Push schema to DB (no migration history) |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed exercise library |
| `npm run db:studio` | Prisma Studio GUI |
| `node scripts/audit-theme-contrast.js` | WCAG AA contrast audit across all 7 themes |

## Documentation

- **`CLAUDE.md`** — Primary reference doc (architecture, schema, conventions, current state). Read this first.
- **`docs/fittrack-v2-spec.md`** — Authoritative spec for the Phase 8 (R0–R15) gameplan v2 rework.
- **`docs/archive/`** — Historical plan docs from earlier phases. Superseded; kept for context only.
