import { NextResponse } from "next/server";
import { requireAuthUserId } from "@/lib/auth-helpers";
import crypto from "crypto";

/**
 * GET /api/integrations/fitbit
 * Start Fitbit OAuth2 authorization flow.
 * Returns the authorization URL for the client to redirect to.
 */
export async function GET() {
  await requireAuthUserId();

  const clientId = process.env.FITBIT_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!clientId || !baseUrl) {
    return NextResponse.json(
      { error: "Fitbit integration not configured" },
      { status: 503 }
    );
  }

  const redirectUri = `${baseUrl}/api/integrations/fitbit/callback`;
  const scope = "weight profile activity heartrate sleep";
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://www.fitbit.com/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("expires_in", "604800");

  return NextResponse.json({ authUrl: authUrl.toString(), state });
}
