"use client";

/**
 * R11 — `/progress/check-ins` history page.
 *
 * Replaces the prior placeholder. Lists past CheckIn rows with the
 * Recommendation rows the engine produced for each, plus any
 * GameplanChange rows that came out of applying them. Joins are
 * resolved client-side from three parallel fetches:
 *
 *   - GET /api/checkins?weeks=24
 *   - GET /api/recommendations?status=any&limit=50
 *   - GET /api/gameplan-changes?limit=50
 *
 * Empty state preserves the "Coming soon" copy as a CTA into the
 * weekly check-in form so users with no history still see the path.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckInRow } from "./_components/CheckInRow";

export const dynamic = "force-dynamic";

interface CheckInLite {
  id: string;
  date: string;
  weekNumber: number | null;
  energy: number | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  motivation: number | null;
}

interface RecLite {
  id: string;
  kind: string;
  status: string;
  checkInId: string | null;
}

interface ChangeLite {
  id: string;
  recommendationId: string | null;
  field: string;
}

export default function ProgressCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckInLite[]>([]);
  const [recs, setRecs] = useState<RecLite[]>([]);
  const [changes, setChanges] = useState<ChangeLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cRes, rRes, gRes] = await Promise.all([
          fetch("/api/checkins?weeks=24"),
          fetch("/api/recommendations?status=any&limit=50"),
          fetch("/api/gameplan-changes?limit=50"),
        ]);
        if (cRes.status === 401) {
          if (!cancelled) {
            setError("auth");
            setLoading(false);
          }
          return;
        }
        const cData = cRes.ok ? await cRes.json() : { checkIns: [] };
        const rData = rRes.ok ? await rRes.json() : { recommendations: [] };
        const gData = gRes.ok ? await gRes.json() : { changes: [] };
        if (cancelled) return;
        setCheckIns(Array.isArray(cData?.checkIns) ? cData.checkIns : []);
        setRecs(Array.isArray(rData?.recommendations) ? rData.recommendations : []);
        setChanges(Array.isArray(gData?.changes) ? gData.changes : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <Header />
      {loading && (
        <div className="font-body text-sm text-ft-on-bg-ter mt-6 uppercase tracking-[0.14em]">
          Loading…
        </div>
      )}
      {error === "auth" && (
        <div className="ft-card bg-ft-surface border border-ft-border p-5 mt-6">
          <h2 className="font-display text-xl text-ft-on-bg mb-2">Sign in to view history</h2>
          <Link
            href="/signin"
            className="font-body text-sm text-ft-accent border-b border-ft-accent inline-block"
          >
            Sign in →
          </Link>
        </div>
      )}
      {error && error !== "auth" && (
        <div className="ft-card bg-ft-surface border border-ft-border p-5 mt-6">
          <p className="font-body text-sm text-ft-danger-fg">{error}</p>
        </div>
      )}
      {!loading && !error && checkIns.length === 0 && <EmptyState />}
      {!loading && !error && checkIns.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {checkIns.map((c) => (
            <CheckInRow key={c.id} checkIn={c} recs={recs} changes={changes} />
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
        Check-in history
      </h1>
      <p className="font-body text-sm text-ft-on-bg-sec mt-2 leading-relaxed">
        Past weekly check-ins with the recommendations the engine fired and the changes you
        applied as a result. Click a row to see the full detail.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="ft-card bg-ft-surface border border-ft-border p-5 mt-6">
      <h2 className="font-display text-xl text-ft-on-bg mb-2">No check-ins yet</h2>
      <p className="font-body text-sm text-ft-on-bg-sec mb-3 leading-relaxed">
        Weekly check-ins capture energy, sleep, soreness, stress, and adherence — the engine
        reads them and produces recommendations. Run your first one to start the trail.
      </p>
      <Link
        href="/checkin"
        className="font-body text-xs uppercase tracking-[0.16em] text-ft-accent border-b border-ft-accent inline-block"
      >
        Start a check-in →
      </Link>
    </div>
  );
}
