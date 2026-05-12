"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary for the past check-in detail route. Surfaces the
 * underlying message rather than the default Next.js crash screen so
 * we can debug client-side throws from this page in production.
 */
export default function CheckInDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/checkin/[id]] error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(var(--ft-bg))",
        padding: 24,
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <Link
        href="/checkin"
        className="font-body"
        style={{ color: "rgb(var(--ft-accent))", fontSize: 12 }}
      >
        ← Check-ins
      </Link>

      <div
        className="ft-card bg-ft-surface"
        style={{
          border: "1px solid rgb(var(--ft-border))",
          padding: 20,
          marginTop: 16,
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: 22,
            color: "rgb(var(--ft-danger-fg))",
            marginBottom: 8,
          }}
        >
          Couldn&apos;t load this check-in
        </h1>
        <p
          className="font-body"
          style={{
            fontSize: 13,
            color: "rgb(var(--ft-text-secondary))",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          {error.message || "An unexpected error occurred while rendering the past check-in detail."}
        </p>
        {error.digest && (
          <p
            className="font-body"
            style={{
              fontSize: 11,
              color: "rgb(var(--ft-text-tertiary))",
              fontFamily: "monospace",
              marginBottom: 16,
            }}
          >
            digest: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          className="cta-underline font-display"
          style={{
            fontSize: 14,
            color: "rgb(var(--ft-accent))",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Try again →
        </button>
      </div>
    </div>
  );
}
