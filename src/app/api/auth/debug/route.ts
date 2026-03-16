import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Diagnostic endpoint — tests each database operation the NextAuth
// Prisma adapter performs during Google sign-in.
// Hit GET /api/auth/debug to see which step fails.
export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Test basic database connectivity
  try {
    const count = await prisma.user.count();
    results.dbConnection = { ok: true, userCount: count };
  } catch (e: unknown) {
    const err = e as Error;
    results.dbConnection = { ok: false, error: err.message, name: err.name };
  }

  // 2. Test user.findUnique (getUserByEmail — first adapter call during sign-in)
  try {
    const user = await prisma.user.findUnique({
      where: { email: "test-nonexistent@example.com" },
    });
    results.findUserByEmail = { ok: true, found: !!user };
  } catch (e: unknown) {
    const err = e as Error;
    results.findUserByEmail = { ok: false, error: err.message, name: err.name };
  }

  // 3. Test account.findUnique with compound unique key
  //    (getUserByAccount — the adapter uses provider_providerAccountId)
  try {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: "test-nonexistent",
        },
      },
      select: { user: true },
    });
    results.findAccountByProvider = { ok: true, found: !!account };
  } catch (e: unknown) {
    const err = e as Error;
    results.findAccountByProvider = { ok: false, error: err.message, name: err.name };
  }

  // 4. Test session.findUnique (getSessionAndUser)
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: "test-nonexistent-token" },
      include: { user: true },
    });
    results.findSessionByToken = { ok: true, found: !!session };
  } catch (e: unknown) {
    const err = e as Error;
    results.findSessionByToken = { ok: false, error: err.message, name: err.name };
  }

  // 5. Test user.create + account.create + session.create (full sign-in flow)
  //    Uses a transaction so we can roll back
  try {
    const testResult = await prisma.$transaction(async (tx) => {
      // createUser
      const user = await tx.user.create({
        data: {
          email: `diag-${Date.now()}@test.local`,
          name: "Diagnostic Test",
          emailVerified: null,
          image: null,
        },
      });

      // linkAccount
      const account = await tx.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: `diag-${Date.now()}`,
          access_token: "fake",
          token_type: "Bearer",
          scope: "openid",
        },
      });

      // createSession
      const session = await tx.session.create({
        data: {
          sessionToken: `diag-${Date.now()}`,
          userId: user.id,
          expires: new Date(Date.now() + 86400000),
        },
      });

      // Clean up — delete in reverse order
      await tx.session.delete({ where: { id: session.id } });
      await tx.account.delete({ where: { id: account.id } });
      await tx.user.delete({ where: { id: user.id } });

      return {
        userCreated: !!user.id,
        accountCreated: !!account.id,
        sessionCreated: !!session.id,
        userFields: Object.keys(user),
      };
    });
    results.fullSignInFlow = { ok: true, ...testResult };
  } catch (e: unknown) {
    const err = e as Error;
    results.fullSignInFlow = {
      ok: false,
      error: err.message,
      name: err.name,
      stack: err.stack?.split("\n").slice(0, 5),
    };
  }

  // 6. Check what tables and columns actually exist in the database
  try {
    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    ) as Array<{ table_name: string }>;
    results.existingTables = tables.map((t) => t.table_name);
  } catch (e: unknown) {
    const err = e as Error;
    results.existingTables = { error: err.message };
  }

  // 7. Check columns on users table specifically
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' ORDER BY ordinal_position`
    ) as Array<{ column_name: string; data_type: string }>;
    results.usersTableColumns = cols.map((c) => `${c.column_name} (${c.data_type})`);
  } catch (e: unknown) {
    const err = e as Error;
    results.usersTableColumns = { error: err.message };
  }

  // 8. Show the database host being used (safe portion of connection string)
  try {
    const connInfo = await prisma.$queryRawUnsafe(
      `SELECT current_database() as db, inet_server_addr() as host, inet_server_port() as port`
    ) as Array<{ db: string; host: string; port: number }>;
    results.connectedTo = connInfo[0];
  } catch (e: unknown) {
    const err = e as Error;
    results.connectedTo = { error: err.message };
  }

  // 9a. Check columns on programs table
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'programs' ORDER BY ordinal_position`
    ) as Array<{ column_name: string; data_type: string }>;
    results.programsTableColumns = cols.map((c) => `${c.column_name} (${c.data_type})`);
  } catch (e: unknown) {
    const err = e as Error;
    results.programsTableColumns = { error: err.message };
  }

  // 9b. Check columns on goals table
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' ORDER BY ordinal_position`
    ) as Array<{ column_name: string; data_type: string }>;
    results.goalsTableColumns = cols.map((c) => `${c.column_name} (${c.data_type})`);
  } catch (e: unknown) {
    const err = e as Error;
    results.goalsTableColumns = { error: err.message };
  }

  // 9c. Check columns on blocks table
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blocks' ORDER BY ordinal_position`
    ) as Array<{ column_name: string; data_type: string }>;
    results.blocksTableColumns = cols.map((c) => `${c.column_name} (${c.data_type})`);
  } catch (e: unknown) {
    const err = e as Error;
    results.blocksTableColumns = { error: err.message };
  }

  // 9d. Check columns on program_benchmarks table
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'program_benchmarks' ORDER BY ordinal_position`
    ) as Array<{ column_name: string; data_type: string }>;
    results.programBenchmarksColumns = cols.map((c) => `${c.column_name} (${c.data_type})`);
  } catch (e: unknown) {
    const err = e as Error;
    results.programBenchmarksColumns = { error: err.message };
  }

  // 9e. Check enums in database
  try {
    const enums = await prisma.$queryRawUnsafe(
      `SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname ORDER BY t.typname`
    ) as Array<{ typname: string; values: string[] }>;
    results.databaseEnums = enums.reduce((acc: Record<string, string[]>, e) => {
      acc[e.typname] = e.values;
      return acc;
    }, {});
  } catch (e: unknown) {
    const err = e as Error;
    results.databaseEnums = { error: err.message };
  }

  // 9f. Try the exact query that /programs page runs
  try {
    const programs = await prisma.program.findMany({
      where: { userId: "00000000-0000-0000-0000-000000000000" },
      include: {
        blocks: {
          select: { id: true, name: true, blockNumber: true, durationWeeks: true, status: true },
          orderBy: { blockNumber: "asc" },
        },
        goal: { select: { id: true, title: true } },
        goals: { select: { id: true, title: true, priority: true } },
        _count: { select: { blocks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    results.programsQueryTest = { ok: true, count: programs.length };
  } catch (e: unknown) {
    const err = e as Error;
    results.programsQueryTest = { ok: false, error: err.message, name: err.name };
  }

  // 10. Environment check
  results.env = {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || "(not set)",
    nodeEnv: process.env.NODE_ENV,
    databaseUrlHost: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : "(not set)",
  };

  return NextResponse.json(results, { status: 200 });
}
