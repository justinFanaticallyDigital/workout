import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "./prisma";

// Wrap each adapter method with error logging so we can identify
// exactly which database operation fails during sign-in
function withLogging(adapter: Adapter): Adapter {
  const wrapped = { ...adapter };
  for (const [key, value] of Object.entries(adapter)) {
    if (typeof value === "function") {
      (wrapped as Record<string, unknown>)[key] = async (...args: unknown[]) => {
        try {
          console.log(`[next-auth][adapter] ${key} called`, JSON.stringify(args).slice(0, 200));
          const result = await (value as (...a: unknown[]) => unknown)(...args);
          console.log(`[next-auth][adapter] ${key} succeeded`);
          return result;
        } catch (error) {
          console.error(`[next-auth][adapter] ${key} FAILED`, error);
          throw error;
        }
      };
    }
  }
  return wrapped;
}

export const authOptions: NextAuthOptions = {
  adapter: withLogging(PrismaAdapter(prisma) as Adapter),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[next-auth][callback] signIn called", {
        userId: user?.id,
        provider: account?.provider,
        email: profile?.email,
      });
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, JSON.stringify(metadata, null, 2));
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[next-auth][debug]", code, JSON.stringify(metadata).slice(0, 300));
    },
  },
};
