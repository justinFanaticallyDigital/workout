/**
 * Custom NextAuth v4 Prisma adapter for Prisma 7 + PrismaPg.
 *
 * The official @next-auth/prisma-adapter v1.0.7 passes raw OAuth token data
 * directly to Prisma create calls. Prisma 7 performs strict argument validation
 * and rejects unknown fields (e.g. Google's `at_hash`, `sub`, `aud`, `iss`),
 * causing sign-in to fail. This adapter filters data to known schema fields.
 */
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters";
import type { PrismaClient } from "@/generated/prisma/client";

// Only the Account fields defined in our Prisma schema
const ACCOUNT_FIELDS = [
  "userId", "type", "provider", "providerAccountId",
  "refresh_token", "access_token", "expires_at",
  "token_type", "scope", "id_token", "session_state",
] as const;

function pick<T extends Record<string, unknown>>(obj: T, keys: readonly string[]): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result as Partial<T>;
}

export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: (data: Record<string, unknown>) =>
      p.user.create({ data: data as Parameters<typeof p.user.create>[0]["data"] }) as Promise<AdapterUser>,

    getUser: (id) =>
      p.user.findUnique({ where: { id } }) as Promise<AdapterUser | null>,

    getUserByEmail: (email) =>
      p.user.findUnique({ where: { email } }) as Promise<AdapterUser | null>,

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        select: { user: true },
      });
      return (account?.user as AdapterUser) ?? null;
    },

    updateUser: ({ id, ...data }) =>
      p.user.update({ where: { id }, data }) as Promise<AdapterUser>,

    deleteUser: (id) =>
      p.user.delete({ where: { id } }) as Promise<AdapterUser>,

    // Key fix: filter to known Account fields before creating.
    // Google OAuth returns extra fields (at_hash, sub, aud, iss, azp, etc.)
    // that Prisma 7 rejects as unknown arguments.
    linkAccount: (data: Record<string, unknown>) => {
      const filtered = pick(data, ACCOUNT_FIELDS);
      return p.account.create({
        data: filtered as Parameters<typeof p.account.create>[0]["data"],
      }) as unknown as Promise<AdapterAccount>;
    },

    unlinkAccount: ({ provider, providerAccountId }) =>
      p.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      }) as unknown as Promise<AdapterAccount>,

    async getSessionAndUser(sessionToken) {
      const result = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!result) return null;
      const { user, ...session } = result;
      return { user: user as AdapterUser, session: session as AdapterSession };
    },

    createSession: (data) =>
      p.session.create({ data }) as Promise<AdapterSession>,

    updateSession: (data) =>
      p.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      }) as Promise<AdapterSession>,

    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }) as Promise<AdapterSession>,

    async createVerificationToken(data) {
      const token = await p.verificationToken.create({ data });
      const { id: _id, ...rest } = token as typeof token & { id?: string }; // eslint-disable-line @typescript-eslint/no-unused-vars
      return rest;
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const result = await p.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        const { id: _id, ...rest } = result as typeof result & { id?: string }; // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      } catch (error: unknown) {
        if ((error as { code?: string }).code === "P2025") return null;
        throw error;
      }
    },
  };
}
