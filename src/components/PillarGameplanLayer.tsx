"use client";

/**
 * Cluster 4 — the pillar "Gameplan" rail-slot content, unlocked at gameplan
 * tier. At program/logger tier this slot shows the locked upsell
 * (each pillar's local GameplanLocked); at gameplan tier the slot delivers the
 * three things that upsell advertises, with real data:
 *
 *   • Weekly check-in — the entry point that tunes the plan (/checkin)
 *   • Recommendation feed — pending Goal-Engine recs for this pillar, each
 *     handing off to Planning Mode pre-staged (?recommendationId=&tab=)
 *   • Goal pulse — the active goals (training slot only, where it's most apt)
 *
 * Self-contained: fetches goals + pending recommendations + the latest
 * check-in + the active program id. All reads degrade gracefully (the
 * gameplan tables may be empty). v2 primitives only; theme-agnostic.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import type { Pillar } from "@/components/v2";

interface Rec {
  id: string;
  kind: string;
  severity: string;
  title: string;
  body: string;
}
interface Goal {
  id: string;
  title: string;
  targetValue: number | string | null;
  targetUnit: string | null;
  targetDate: string | null;
}

/** Which recommendation kinds surface in each pillar's gameplan slot. */
const PILLAR_KINDS: Record<Pillar, string[]> = {
  training: [
    "behind_target",
    "ahead_target",
    "plateau_detected",
    "deload_shift",
    "adherence_low",
    "adherence_low_streak",
  ],
  nutrition: ["refeed_due"],
  lifestyle: ["lifestyle_streak_broken", "pain_flag"],
};
const PILLAR_TAB: Record<Pillar, string> = {
  training: "training",
  nutrition: "nutrition",
  lifestyle: "lifestyle",
};
const PILLAR_TITLE: Record<Pillar, string> = {
  training: "Adaptive training",
  nutrition: "Adaptive nutrition",
  lifestyle: "Adaptive lifestyle",
};

function sevTone(s: string): "danger" | "warn" | "accent" {
  return s === "urgent" ? "danger" : s === "warning" ? "warn" : "accent";
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  return x;
}

export default function PillarGameplanLayer({ pillar }: { pillar: Pillar }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [checkedInThisWeek, setCheckedInThisWeek] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      const [home, recsRes, goalsRes, checkinsRes] = await Promise.all([
        fetch("/api/home").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/recommendations?status=pending&limit=20").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/goals").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/checkins?weeks=1").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (!live) return;
      setProgramId(home?.activeProgram?.id ?? null);
      setRecs(Array.isArray(recsRes?.recommendations) ? recsRes.recommendations : []);
      setGoals(Array.isArray(goalsRes?.goals) ? goalsRes.goals : []);
      const weekStart = startOfWeek(new Date()).getTime();
      const latest: { date?: string }[] = Array.isArray(checkinsRes?.checkIns) ? checkinsRes.checkIns : [];
      setCheckedInThisWeek(latest.some((c) => c.date && new Date(c.date).getTime() >= weekStart));
      setLoading(false);
    })().catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  if (loading) {
    return <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>;
  }

  const pillarRecs = recs.filter((r) => PILLAR_KINDS[pillar].includes(r.kind));
  const planning = programId ? `/gameplan/${programId}/planning` : "/gameplan";
  const recHref = (id: string) => `${planning}?recommendationId=${id}&tab=${PILLAR_TAB[pillar]}`;

  return (
    <div className="px-4 pt-2">
      <Card raised className="px-4 py-3.5" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
        <div className="flex items-center justify-between">
          <Stamp>Gameplan · adaptive</Stamp>
          <Chip tone="accent" size="sm">
            Active
          </Chip>
        </div>
        <div className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">{PILLAR_TITLE[pillar]}</div>
        <div className="mt-1 font-body text-[12.5px] text-ft-dim">
          {pillarRecs.length > 0
            ? `${pillarRecs.length} recommendation${pillarRecs.length === 1 ? "" : "s"} from your last check-in`
            : "Your plan adapts from each weekly check-in."}
        </div>
      </Card>

      {/* Weekly check-in */}
      <SectionLabel right="Weekly">Check-in</SectionLabel>
      <Card className="flex items-center justify-between gap-2.5 px-3.5 py-3">
        <div className="min-w-0">
          <div className="font-body text-[13px] font-semibold text-ft-white">
            {checkedInThisWeek ? "Checked in this week" : "Weekly check-in due"}
          </div>
          <div className="mt-px font-body text-[11.5px] text-ft-dim">
            {checkedInThisWeek ? "The engine tuned your plan." : "Tunes volume, loads + macros."}
          </div>
        </div>
        <Link href={checkedInThisWeek ? "/progress/check-ins" : "/checkin"}>
          <Button kind={checkedInThisWeek ? "secondary" : "primary"} size="sm">
            {checkedInThisWeek ? "History" : "Start →"}
          </Button>
        </Link>
      </Card>

      {/* Recommendations */}
      <SectionLabel right={pillarRecs.length > 0 ? "Apply in Planning" : undefined}>Recommendations</SectionLabel>
      {pillarRecs.length === 0 ? (
        <p className="rounded-ft-lg border border-dashed border-ft-border px-4 py-5 text-center font-body text-xs text-ft-dim">
          No open recommendations for this pillar.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {pillarRecs.map((r) => (
            <Link key={r.id} href={recHref(r.id)}>
              <Card className="px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-body text-[13px] font-bold text-ft-white">{r.title}</span>
                  <Chip tone={sevTone(r.severity)} size="sm">
                    {r.severity}
                  </Chip>
                </div>
                <div className="mt-1 font-body text-[12px] leading-snug text-ft-light">{r.body}</div>
                <div className="mt-2 font-body text-[11.5px] font-semibold text-ft-accent">Review · Apply ›</div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Goal pulse — training slot only */}
      {pillar === "training" && goals.length > 0 && (
        <>
          <SectionLabel right="Edit in Planning">Goal pulse</SectionLabel>
          <Card className="overflow-hidden p-0">
            {goals.map((g, i) => (
              <Link
                key={g.id}
                href={`${planning}?tab=goals`}
                className={["flex items-center justify-between px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
              >
                <span className="truncate font-body text-[13px] font-semibold text-ft-white">{g.title}</span>
                <span className="font-data text-[11px] tracking-[0.03em] text-ft-dim">
                  {g.targetValue != null ? `→ ${g.targetValue}${g.targetUnit ? ` ${g.targetUnit}` : ""}` : "—"}
                </span>
              </Link>
            ))}
          </Card>
        </>
      )}

      {programId && (
        <Link href={`${planning}?tab=${PILLAR_TAB[pillar]}`} className="mt-4 block">
          <Card className="flex items-center justify-between px-3.5 py-3">
            <span className="font-body text-[13px] font-semibold text-ft-light">Open Planning Mode</span>
            <span className="font-body text-base text-ft-dim">›</span>
          </Card>
        </Link>
      )}
    </div>
  );
}
