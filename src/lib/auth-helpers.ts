import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Get the authenticated user's ID from the session.
 * Returns null if not signed in.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/**
 * Get the authenticated user's ID, or return a 401 response.
 * Use in API route handlers: const [userId, errorRes] = await requireAuth();
 */
export async function requireAuth(): Promise<
  [string, null] | [null, NextResponse]
> {
  const userId = await getAuthUserId();
  if (!userId) {
    return [null, NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
  }
  return [userId, null];
}

/**
 * Get the authenticated user's ID or throw.
 * Use in API routes where you want to handle the error yourself.
 */
export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}
