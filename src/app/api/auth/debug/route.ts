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

  // 6. Environment check
  results.env = {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || "(not set)",
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(results, { status: 200 });
}
