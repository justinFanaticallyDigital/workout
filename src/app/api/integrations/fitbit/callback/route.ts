import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * GET /api/integrations/fitbit/callback
 * Handle Fitbit OAuth2 callback — exchange code for tokens and store them.
 */
export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const baseUrl = process.env.NEXTAUTH_URL ?? "";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/settings?fitbit=error&reason=no_code`
    );
  }

  const clientId = process.env.FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/settings?fitbit=error&reason=not_configured`
    );
  }

  const redirectUri = `${baseUrl}/api/integrations/fitbit/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Fitbit token exchange failed:", err);
      return NextResponse.redirect(
        `${baseUrl}/settings?fitbit=error&reason=token_exchange`
      );
    }

    const tokens = await tokenRes.json();

    // Store tokens in Account model (as a fitbit provider account)
    await prisma.account.deleteMany({
      where: { userId, provider: "fitbit" },
    });

    await prisma.account.create({
      data: {
        userId,
        type: "oauth",
        provider: "fitbit",
        providerAccountId: tokens.user_id ?? "unknown",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 3600),
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    });

    // Auto-trigger initial sync after connecting
    try {
      const syncUrl = `${baseUrl}/api/integrations/fitbit/sync`;
      await fetch(syncUrl, {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });
    } catch {
      // Non-blocking — sync failure doesn't break connection
    }

    return NextResponse.redirect(
      `${baseUrl}/settings?fitbit=connected`
    );
  } catch (error) {
    console.error("Fitbit callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/settings?fitbit=error&reason=unknown`
    );
  }
}
