import { prisma } from "./prisma";

// Temporary demo user for development before auth is wired up.
// Replace with real auth (NextAuth session) in step #3.
const DEMO_USER_EMAIL = "demo@fittrack.dev";

export async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });
}

export async function getDemoUserId(): Promise<string> {
  const user = await getDemoUser();
  return user.id;
}
