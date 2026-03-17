import { NextResponse } from "next/server";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/integrations/fitbit
 * Start Fitbit OAuth2 authorization flow.
 * Redirects the user to Fitbit's authorization page.
 */
export async function GET() {
  await requireAuthUserId();

  const clientId = process.env.FITBIT_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Fitbit integration not configured" },
      { status: 503 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/fitbit/callback`;
  const scope = "weight profile";

  const authUrl = new URL("https://www.fitbit.com/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("expires_in", "604800"); // 1 week

  return NextResponse.json({ authUrl: authUrl.toString() });
}
