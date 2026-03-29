/**
 * Custom NextAuth v4 Prisma adapter for Prisma 7 + PrismaPg.
 *
 * Prisma 7 performs strict argument validation and rejects unknown fields.
 * Every method that writes data filters to known schema fields first.
 */
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters";
import type { PrismaClient } from "@/generated/prisma/client";

const USER_FIELDS = ["email", "name", "emailVerified", "image"] as const;

const ACCOUNT_FIELDS = [
  "userId", "type", "provider", "providerAccountId",
  "refresh_token", "access_token", "expires_at",
  "token_type", "scope", "id_token", "session_state",
] as const;

const SESSION_FIELDS = ["sessionToken", "userId", "expires"] as const;

function pick<T extends Record<string, unknown>>(obj: T, keys: readonly string[]): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result as Partial<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: (data: Record<string, unknown>) => {
      const filtered = pick(data, USER_FIELDS);
      return p.user.create({ data: filtered as any }) as Promise<AdapterUser>;
    },

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

    updateUser: ({ id, ...data }: Record<string, unknown> & { id: string }) => {
      const filtered = pick(data, USER_FIELDS);
      return p.user.update({ where: { id }, data: filtered }) as Promise<AdapterUser>;
    },

    deleteUser: (id) =>
      p.user.delete({ where: { id } }) as Promise<AdapterUser>,

    linkAccount: (data: Record<string, unknown>) => {
      const filtered = pick(data, ACCOUNT_FIELDS);
      return p.account.create({
        data: filtered as any,
      }) as unknown as Promise<AdapterAccount>;
    },

    unlinkAccount: ({ provider, providerAccountId }: { provider: string; providerAccountId: string }) =>
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

    createSession: (data: Record<string, unknown>) => {
      const filtered = pick(data, SESSION_FIELDS);
      return p.session.create({ data: filtered as any }) as Promise<AdapterSession>;
    },

    updateSession: (data: Record<string, unknown> & { sessionToken: string }) => {
      const filtered = pick(data, SESSION_FIELDS);
      return p.session.update({
        where: { sessionToken: data.sessionToken },
        data: filtered,
      }) as Promise<AdapterSession>;
    },

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
