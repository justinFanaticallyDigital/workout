/**
 * Shared seed helper: which user owns the seeded rows.
 *
 *   npx tsx scripts/<seed>.ts --user you@example.com
 *   SEED_USER_EMAIL=you@example.com npx tsx scripts/<seed>.ts
 *
 * With neither, the one non-system user in the database is used; if there are
 * several, the script lists them and exits. `--create` creates the user when
 * the email is unknown (handy on a fresh local database).
 */
import type { PrismaClient } from "../../src/generated/prisma/client";

export const TEMPLATE_USER_EMAIL = "templates@fittrack.system";

export function argValue(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

export async function resolveSeedUser(prisma: PrismaClient, argv: string[]): Promise<{ id: string; email: string }> {
  const email = argValue(argv, "--user") ?? process.env.SEED_USER_EMAIL;
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
    if (existing) return existing;
    if (argv.includes("--create")) {
      const created = await prisma.user.create({ data: { email, name: email.split("@")[0] }, select: { id: true, email: true } });
      console.log(`Created user ${created.email}`);
      return created;
    }
    throw new Error(`No user with email ${email}. Sign in once first, or pass --create.`);
  }
  const users = await prisma.user.findMany({
    where: { email: { not: TEMPLATE_USER_EMAIL } },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length === 1) return users[0];
  if (users.length === 0) throw new Error("No users in the database. Sign in once first, or pass --user <email> --create.");
  throw new Error(`Several users found — pass --user <email>:\n  ${users.map((u) => u.email).join("\n  ")}`);
}
