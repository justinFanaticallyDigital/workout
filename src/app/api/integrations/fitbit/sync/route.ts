import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * POST /api/integrations/fitbit/sync
 * Sync body weight, body fat, activity, sleep, and heart rate data from Fitbit.
 * Pulls last 30 days of data.
 */
export async function POST() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

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
    if (!fitbitAccount.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token available. Please reconnect Fitbit." },
        { status: 401 }
      );
    }
    const refreshed = await refreshFitbitToken(
      fitbitAccount.refresh_token,
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

  const headers = { Authorization: `Bearer ${accessToken}` };
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const scopes = fitbitAccount.scope ?? "";
  const results: Record<string, number> = {};

  try {
    // ─── Body Weight & Fat ───────────────────────────────
    if (scopes.includes("weight")) {
      const synced = await syncBodyMetrics(userId, accessToken, headers, startDate, endDate);
      results.bodyMetrics = synced;
    }

    // ─── Activity (steps, active minutes, calories) ──────
    if (scopes.includes("activity")) {
      const synced = await syncActivity(userId, headers, startDate, endDate);
      results.activity = synced;
    }

    // ─── Sleep ───────────────────────────────────────────
    if (scopes.includes("sleep")) {
      const synced = await syncSleep(userId, headers, startDate, endDate);
      results.sleep = synced;
    }

    // ─── Heart Rate ──────────────────────────────────────
    if (scopes.includes("heartrate")) {
      const synced = await syncHeartRate(userId, headers, startDate, endDate);
      results.heartRate = synced;
    }

    const totalSynced = Object.values(results).reduce((a, b) => a + b, 0);
    return NextResponse.json({
      synced: totalSynced,
      details: results,
      message: `Synced ${totalSynced} entries from Fitbit`,
    });
  } catch (error) {
    console.error("Fitbit sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Fitbit data" },
      { status: 500 }
    );
  }
}

// ─── Body Weight & Fat ───────────────────────────────────
async function syncBodyMetrics(
  userId: string,
  accessToken: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string
): Promise<number> {
  // Fetch user profile to determine weight unit
  const profileRes = await fetch(
    "https://api.fitbit.com/1/user/-/profile.json",
    { headers }
  );
  let fitbitWeightUnit = "en_US";
  if (profileRes.ok) {
    const profile = await profileRes.json();
    fitbitWeightUnit = profile.user?.weightUnit ?? "en_US";
  }

  const [weightRes, fatRes] = await Promise.all([
    fetch(
      `https://api.fitbit.com/1/user/-/body/log/weight/date/${startDate}/${endDate}.json`,
      { headers }
    ),
    fetch(
      `https://api.fitbit.com/1/user/-/body/log/fat/date/${startDate}/${endDate}.json`,
      { headers }
    ),
  ]);

  let synced = 0;

  if (weightRes.ok) {
    const weightData = await weightRes.json();
    const fatData = fatRes.ok ? await fatRes.json() : { fat: [] };

    const fatByDate: Record<string, number> = {};
    if (fatData.fat) {
      for (const entry of fatData.fat) {
        fatByDate[entry.date] = entry.fat;
      }
    }

    for (const entry of weightData.weight || []) {
      const date = new Date(entry.date);
      let weightLbs: number;
      if (fitbitWeightUnit === "METRIC") {
        weightLbs = entry.weight * 2.20462;
      } else if (fitbitWeightUnit === "en_GB") {
        weightLbs = entry.weight * 14;
      } else {
        weightLbs = entry.weight;
      }

      const existing = await prisma.bodyMetric.findFirst({
        where: { userId, date, source: "fitbit" },
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

  return synced;
}

// ─── Activity ────────────────────────────────────────────
async function syncActivity(
  userId: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string
): Promise<number> {
  // Fetch time series for steps, active minutes, and calories
  const [stepsRes, activeRes, caloriesRes] = await Promise.all([
    fetch(
      `https://api.fitbit.com/1/user/-/activities/steps/date/${startDate}/${endDate}.json`,
      { headers }
    ),
    fetch(
      `https://api.fitbit.com/1/user/-/activities/minutesVeryActive/date/${startDate}/${endDate}.json`,
      { headers }
    ),
    fetch(
      `https://api.fitbit.com/1/user/-/activities/activityCalories/date/${startDate}/${endDate}.json`,
      { headers }
    ),
  ]);

  // Build day maps
  const stepsByDate: Record<string, number> = {};
  const activeByDate: Record<string, number> = {};
  const caloriesByDate: Record<string, number> = {};

  if (stepsRes.ok) {
    const data = await stepsRes.json();
    for (const d of data["activities-steps"] ?? []) {
      stepsByDate[d.dateTime] = parseInt(d.value) || 0;
    }
  }

  if (activeRes.ok) {
    const data = await activeRes.json();
    for (const d of data["activities-minutesVeryActive"] ?? []) {
      activeByDate[d.dateTime] = parseInt(d.value) || 0;
    }
  }

  // Also fetch fairly active minutes and add them
  try {
    const fairlyRes = await fetch(
      `https://api.fitbit.com/1/user/-/activities/minutesFairlyActive/date/${startDate}/${endDate}.json`,
      { headers }
    );
    if (fairlyRes.ok) {
      const data = await fairlyRes.json();
      for (const d of data["activities-minutesFairlyActive"] ?? []) {
        const date = d.dateTime;
        activeByDate[date] = (activeByDate[date] ?? 0) + (parseInt(d.value) || 0);
      }
    }
  } catch { /* non-critical */ }

  if (caloriesRes.ok) {
    const data = await caloriesRes.json();
    for (const d of data["activities-activityCalories"] ?? []) {
      caloriesByDate[d.dateTime] = parseInt(d.value) || 0;
    }
  }

  // Upsert daily metrics
  const allDates = Array.from(new Set([
    ...Object.keys(stepsByDate),
    ...Object.keys(activeByDate),
    ...Object.keys(caloriesByDate),
  ]));

  let synced = 0;
  for (const dateStr of allDates) {
    const steps = stepsByDate[dateStr];
    const activeMinutes = activeByDate[dateStr];
    const calories = caloriesByDate[dateStr];

    // Skip days with no meaningful data
    if (!steps && !activeMinutes && !calories) continue;

    await upsertDailyMetric(userId, dateStr, {
      steps: steps ?? null,
      activeMinutes: activeMinutes ?? null,
      caloriesBurned: calories ?? null,
    });
    synced++;
  }

  return synced;
}

// ─── Sleep ───────────────────────────────────────────────
async function syncSleep(
  userId: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string
): Promise<number> {
  const res = await fetch(
    `https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`,
    { headers }
  );

  if (!res.ok) return 0;
  const data = await res.json();

  let synced = 0;
  for (const sleep of data.sleep ?? []) {
    // Use main sleep only (isMainSleep=true), skip naps
    if (!sleep.isMainSleep) continue;

    const dateStr = sleep.dateOfSleep;
    const totalMinutes = sleep.minutesAsleep ?? Math.floor((sleep.duration ?? 0) / 60000);

    // Extract stages if available (stages type vs classic type)
    let deep: number | null = null;
    let light: number | null = null;
    let rem: number | null = null;
    let wake: number | null = null;

    if (sleep.levels?.summary) {
      const s = sleep.levels.summary;
      deep = s.deep?.minutes ?? null;
      light = s.light?.minutes ?? null;
      rem = s.rem?.minutes ?? null;
      wake = s.wake?.minutes ?? null;
    }

    await upsertDailyMetric(userId, dateStr, {
      sleepMinutes: totalMinutes,
      sleepDeep: deep,
      sleepLight: light,
      sleepRem: rem,
      sleepWake: wake,
    });
    synced++;
  }

  return synced;
}

// ─── Heart Rate ──────────────────────────────────────────
async function syncHeartRate(
  userId: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string
): Promise<number> {
  const res = await fetch(
    `https://api.fitbit.com/1/user/-/activities/heart/date/${startDate}/${endDate}.json`,
    { headers }
  );

  if (!res.ok) return 0;
  const data = await res.json();

  let synced = 0;
  for (const entry of data["activities-heart"] ?? []) {
    const rhr = entry.value?.restingHeartRate;
    if (!rhr) continue; // Skip days without resting HR

    await upsertDailyMetric(userId, entry.dateTime, {
      restingHr: rhr,
    });
    synced++;
  }

  return synced;
}

// ─── Upsert Helper ───────────────────────────────────────
async function upsertDailyMetric(
  userId: string,
  dateStr: string,
  data: {
    steps?: number | null;
    activeMinutes?: number | null;
    caloriesBurned?: number | null;
    sleepMinutes?: number | null;
    sleepDeep?: number | null;
    sleepLight?: number | null;
    sleepRem?: number | null;
    sleepWake?: number | null;
    restingHr?: number | null;
  }
) {
  const date = new Date(dateStr);

  // Build update payload — only include non-undefined fields
  const updateData: Record<string, number | null> = {};
  if (data.steps !== undefined) updateData.steps = data.steps;
  if (data.activeMinutes !== undefined) updateData.activeMinutes = data.activeMinutes;
  if (data.caloriesBurned !== undefined) updateData.caloriesBurned = data.caloriesBurned;
  if (data.sleepMinutes !== undefined) updateData.sleepMinutes = data.sleepMinutes;
  if (data.sleepDeep !== undefined) updateData.sleepDeep = data.sleepDeep;
  if (data.sleepLight !== undefined) updateData.sleepLight = data.sleepLight;
  if (data.sleepRem !== undefined) updateData.sleepRem = data.sleepRem;
  if (data.sleepWake !== undefined) updateData.sleepWake = data.sleepWake;
  if (data.restingHr !== undefined) updateData.restingHr = data.restingHr;

  await prisma.dailyMetric.upsert({
    where: {
      userId_date_source: { userId, date, source: "fitbit" },
    },
    create: {
      userId,
      date,
      source: "fitbit",
      ...updateData,
    },
    update: updateData,
  });
}

/**
 * GET /api/integrations/fitbit/sync
 * Check Fitbit connection status.
 */
export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;

  const fitbitAccount = await prisma.account.findFirst({
    where: { userId, provider: "fitbit" },
    select: { providerAccountId: true, expires_at: true, scope: true },
  });

  // Get last synced time from either body metrics or daily metrics
  const [lastBodySync, lastDailySync] = await Promise.all([
    prisma.bodyMetric.findFirst({
      where: { userId, source: "fitbit" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.dailyMetric.findFirst({
      where: { userId, source: "fitbit" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }).catch(() => null), // Handle case where table doesn't exist yet
  ]);

  const lastSyncTimes = [lastBodySync?.createdAt, lastDailySync?.createdAt].filter(Boolean) as Date[];
  const lastSyncedAt = lastSyncTimes.length > 0
    ? new Date(Math.max(...lastSyncTimes.map((d) => d.getTime()))).toISOString()
    : null;

  return NextResponse.json({
    connected: !!fitbitAccount,
    userId: fitbitAccount?.providerAccountId ?? null,
    tokenExpired: fitbitAccount?.expires_at
      ? fitbitAccount.expires_at < Math.floor(Date.now() / 1000)
      : null,
    scopes: fitbitAccount?.scope ?? null,
    lastSyncedAt,
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
