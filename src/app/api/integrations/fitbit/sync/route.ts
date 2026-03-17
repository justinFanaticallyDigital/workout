import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * POST /api/integrations/fitbit/sync
 * Sync body weight and body fat data from Fitbit.
 * Pulls last 30 days of data.
 */
export async function POST() {
  const userId = await requireAuthUserId();

  // Get stored Fitbit tokens
  const fitbitAccount = await prisma.account.findFirst({
    where: { userId, provider: "fitbit" },
  });

  if (!fitbitAccount?.access_token) {
    return NextResponse.json(
      { error: "Fitbit not connected" },
      { status: 400 }
    );
  }

  let accessToken = fitbitAccount.access_token;

  // Check if token is expired and refresh if needed
  if (fitbitAccount.expires_at && fitbitAccount.expires_at < Math.floor(Date.now() / 1000)) {
    const refreshed = await refreshFitbitToken(
      fitbitAccount.refresh_token!,
      fitbitAccount.id
    );
    if (!refreshed) {
      return NextResponse.json(
        { error: "Failed to refresh Fitbit token. Please reconnect." },
        { status: 401 }
      );
    }
    accessToken = refreshed;
  }

  try {
    // Fetch body weight for last 30 days
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const weightRes = await fetch(
      `https://api.fitbit.com/1/user/-/body/log/weight/date/${startDate}/${endDate}.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const fatRes = await fetch(
      `https://api.fitbit.com/1/user/-/body/log/fat/date/${startDate}/${endDate}.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    let synced = 0;

    if (weightRes.ok) {
      const weightData = await weightRes.json();
      const fatData = fatRes.ok ? await fatRes.json() : { fat: [] };

      // Build a map of date → fat percentage
      const fatByDate: Record<string, number> = {};
      if (fatData.fat) {
        for (const entry of fatData.fat) {
          fatByDate[entry.date] = entry.fat;
        }
      }

      for (const entry of weightData.weight || []) {
        const date = new Date(entry.date);
        const weightLbs = entry.weight * 2.20462; // Fitbit returns kg, convert to lbs

        // Upsert: only create if no entry exists for this date+source
        const existing = await prisma.bodyMetric.findFirst({
          where: {
            userId,
            date,
            source: "fitbit",
          },
        });

        if (!existing) {
          await prisma.bodyMetric.create({
            data: {
              userId,
              date,
              weight: Math.round(weightLbs * 10) / 10,
              bodyFatPct: fatByDate[entry.date] ?? null,
              source: "fitbit",
              notes: "Synced from Fitbit",
            },
          });
          synced++;
        } else {
          // Update existing entry
          await prisma.bodyMetric.update({
            where: { id: existing.id },
            data: {
              weight: Math.round(weightLbs * 10) / 10,
              bodyFatPct: fatByDate[entry.date] ?? existing.bodyFatPct,
            },
          });
        }
      }
    }

    return NextResponse.json({ synced, message: `Synced ${synced} new entries from Fitbit` });
  } catch (error) {
    console.error("Fitbit sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Fitbit data" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/fitbit/sync
 * Check Fitbit connection status.
 */
export async function GET() {
  const userId = await requireAuthUserId();

  const fitbitAccount = await prisma.account.findFirst({
    where: { userId, provider: "fitbit" },
    select: { providerAccountId: true, expires_at: true },
  });

  return NextResponse.json({
    connected: !!fitbitAccount,
    userId: fitbitAccount?.providerAccountId ?? null,
    tokenExpired: fitbitAccount?.expires_at
      ? fitbitAccount.expires_at < Math.floor(Date.now() / 1000)
      : null,
  });
}

async function refreshFitbitToken(
  refreshToken: string,
  accountId: string
): Promise<string | null> {
  const clientId = process.env.FITBIT_CLIENT_ID!;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET!;

  try {
    const res = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;

    const tokens = await res.json();

    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      },
    });

    return tokens.access_token;
  } catch {
    return null;
  }
}
