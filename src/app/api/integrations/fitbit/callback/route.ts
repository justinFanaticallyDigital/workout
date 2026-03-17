import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/integrations/fitbit/callback
 * Handle Fitbit OAuth2 callback — exchange code for tokens and store them.
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuthUserId();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings?fitbit=error&reason=no_code`
    );
  }

  const clientId = process.env.FITBIT_CLIENT_ID!;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/fitbit/callback`;

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
        `${process.env.NEXTAUTH_URL}/settings?fitbit=error&reason=token_exchange`
      );
    }

    const tokens = await tokenRes.json();

    // Store tokens in Account model (as a fitbit provider account)
    // First, remove any existing fitbit account for this user
    await prisma.account.deleteMany({
      where: { userId, provider: "fitbit" },
    });

    await prisma.account.create({
      data: {
        userId,
        type: "oauth",
        provider: "fitbit",
        providerAccountId: tokens.user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings?fitbit=connected`
    );
  } catch (error) {
    console.error("Fitbit callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings?fitbit=error&reason=unknown`
    );
  }
}
