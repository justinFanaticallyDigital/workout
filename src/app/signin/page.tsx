"use client";

/**
 * 1.2 — Sign-in · /signin (Cluster 1). v2 reskin of the Google OAuth entry.
 * Full-screen, centered; the global BottomNav is hidden here. Apple +
 * email/password are roadmap (MIGRATION_MAP §C1) — only the wired Google
 * method is shown (no non-functional affordances).
 */
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, Button } from "@/components/v2";

const ERROR_MESSAGES: Record<string, string> = {
  Callback: "Sign-in failed. Try again.",
  OAuthSignin: "Could not start sign-in. Try again.",
  OAuthCallback: "OAuth callback error. Try again.",
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  Default: "An unexpected error occurred.",
};

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SignInContent() {
  const error = useSearchParams().get("error");
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ft-bg px-6">
      <div className="ft-on-bg mb-7 text-center">
        <div className="font-display text-4xl font-bold tracking-[-0.02em]">
          <span className="text-ft-on-bg">FIT</span>
          <span className="text-ft-on-bg-ter">TRACK</span>
        </div>
        <p className="mt-2 font-body text-[13px] text-ft-on-bg-sec">Track every session. Adapt every week.</p>
      </div>

      <Card className="w-full max-w-sm px-6 py-6">
        {error && (
          <div className="mb-4 rounded-ft-md border border-ft-danger-border bg-ft-danger-bg px-3.5 py-2.5">
            <p className="font-body text-[12.5px] text-ft-danger-fg">{ERROR_MESSAGES[error] || ERROR_MESSAGES.Default}</p>
          </div>
        )}
        <Button kind="secondary" size="lg" fullWidth onClick={() => signIn("google", { callbackUrl: "/" })}>
          <GoogleMark />
          Sign in with Google
        </Button>
        <p className="mt-4 text-center font-body text-[11px] leading-relaxed text-ft-dim">
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ft-bg">
          <p className="font-body text-sm text-ft-dim">Loading…</p>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
