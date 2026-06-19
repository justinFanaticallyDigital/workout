"use client";

/**
 * 4.7 — Check-in detail · /checkin/[id] (linked from /progress/check-ins).
 *
 * Read-only v2 reskin of one CheckIn: subjective ratings (1–5), adherence
 * (%), the engine recommendations that came out of this check-in, and the
 * free-text recap. Full-screen sub-flow (Header kind="sub"); the global
 * BottomNav stays (it's a detail, not a logger flow). Data from
 * GET /api/checkins/[id] + the recommendations filtered to this check-in.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Card, Chip, Stamp, SectionLabel } from "@/components/v2";
import type { CheckIn } from "../types";

export const dynamic = "force-dynamic";

interface Rec {
  id: string;
  kind: string;
  status: string;
  severity: string;
  title: string;
  body: string;
  checkInId: string | null;
}

const RATINGS: { key: keyof CheckIn; label: string; invert?: boolean }[] = [
  { key: "energy", label: "Energy" },
  { key: "sleepQuality", label: "Sleep" },
  { key: "motivation", label: "Motivation" },
  { key: "soreness", label: "Soreness", invert: true },
  { key: "stress", label: "Stress", invert: true },
];
const ADHERENCE: { key: keyof CheckIn; label: string }[] = [
  { key: "liftAdherence", label: "Lifting" },
  { key: "cardioAdherence", label: "Cardio" },
  { key: "nutritionAdherence", label: "Nutrition" },
];

function sevTone(s: string): "danger" | "warn" | "accent" {
  return s === "urgent" ? "danger" : s === "warning" ? "warn" : "accent";
}

export default function CheckInDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/checkins/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/recommendations?status=any&limit=50").then((r) => (r.ok ? r.json() : { recommendations: [] })),
    ])
      .then(([detail, recData]) => {
        if (cancelled) return;
        if (!detail?.checkIn) {
          setError("Check-in not found");
        } else {
          setCheckIn(detail.checkIn as CheckIn);
          const all: Rec[] = Array.isArray(recData?.recommendations) ? recData.recommendations : [];
          setRecs(all.filter((r) => r.checkInId === id));
        }
        setLoading(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const back = () => router.push("/progress/check-ins");

  const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <div className="flex-shrink-0">
        <Header kind="sub" title={title} subtitle="Check-in" right={null} onBack={back} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 88 }}>
        {children}
      </div>
    </div>
  );

  if (loading) return <Shell title="Check-in"><p className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</p></Shell>;
  if (error || !checkIn)
    return <Shell title="Check-in"><p className="px-4 pt-6 font-body text-sm text-ft-light">{error ?? "Not found."}</p></Shell>;

  const dateLabel = new Date(checkIn.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Shell title={`Week of ${new Date(checkIn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}>
      <div className="px-4 pt-3">
        <Card className="px-4 py-3">
          <Stamp>Submitted</Stamp>
          <div className="mt-1 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">{dateLabel}</div>
          {checkIn.weekNumber != null && (
            <div className="mt-0.5 font-data text-[11px] tracking-[0.03em] text-ft-dim">Week {checkIn.weekNumber}</div>
          )}
        </Card>
      </div>

      <SectionLabel right="1–5">Ratings</SectionLabel>
      <div className="px-4">
        <Card className="overflow-hidden p-0">
          {RATINGS.map((r, i) => {
            const v = checkIn[r.key] as number | null;
            return (
              <div
                key={r.key as string}
                className={["flex items-center justify-between px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
              >
                <span className="font-body text-[13px] font-semibold text-ft-white">{r.label}</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = v != null && n <= v;
                    return (
                      <span
                        key={n}
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: on
                            ? r.invert
                              ? "rgb(var(--ft-warn-fg))"
                              : "rgb(var(--ft-accent))"
                            : "rgb(var(--ft-surface-alt))",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <SectionLabel right="%">Adherence</SectionLabel>
      <div className="px-4">
        <Card className="flex flex-col gap-3 px-3.5 py-3.5">
          {ADHERENCE.map((a) => {
            const v = (checkIn[a.key] as number | null) ?? null;
            return (
              <div key={a.key as string}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-body text-[12.5px] font-semibold text-ft-light">{a.label}</span>
                  <span className="font-number text-[12px] font-bold text-ft-white">{v != null ? `${v}%` : "—"}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ft-surface-alt">
                  <div className="h-full rounded-full bg-ft-accent" style={{ width: `${Math.max(0, Math.min(100, v ?? 0))}%` }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {recs.length > 0 && (
        <>
          <SectionLabel right={`${recs.length}`}>Recommendations from this check-in</SectionLabel>
          <div className="flex flex-col gap-2 px-4">
            {recs.map((r) => (
              <Card key={r.id} className="px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-body text-[13px] font-bold text-ft-white">{r.title}</span>
                  <Chip tone={r.status === "applied" ? "success" : r.status === "dismissed" ? "neutral" : sevTone(r.severity)} size="sm">
                    {r.status === "pending" ? r.severity : r.status}
                  </Chip>
                </div>
                <div className="mt-1 font-body text-[12px] leading-snug text-ft-light">{r.body}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {(checkIn.wins || checkIn.struggles || checkIn.notes) && (
        <>
          <SectionLabel>Recap</SectionLabel>
          <div className="flex flex-col gap-2 px-4 pb-2">
            {checkIn.wins && <RecapCard label="Wins" text={checkIn.wins} />}
            {checkIn.struggles && <RecapCard label="Struggles" text={checkIn.struggles} />}
            {checkIn.notes && <RecapCard label="Notes" text={checkIn.notes} />}
          </div>
        </>
      )}
    </Shell>
  );
}

function RecapCard({ label, text }: { label: string; text: string }) {
  return (
    <Card className="px-3.5 py-3">
      <Stamp>{label}</Stamp>
      <div className="mt-1.5 font-body text-[13px] leading-relaxed text-ft-light">{text}</div>
    </Card>
  );
}
