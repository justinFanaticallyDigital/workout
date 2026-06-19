"use client";

/**
 * 4.3 — Recommendations feed · /recommendations.
 *
 * The Gameplan-tier surface for the Goal Engine's output. Non-pillar slot-1
 * surface (HomeShell + the single global BottomNav). Pending recs are
 * actionable — Apply (POST /api/recommendations/[id]/apply runs the
 * dispatcher + writes a GameplanChange + flips status; toast offers Undo via
 * /api/gameplan-changes/[id]/undo), Open in Planning (pre-stages the rec via
 * ?recommendationId=), or Dismiss (PATCH status). Resolved recs render
 * read-only below. All reads degrade gracefully before the table exists.
 *
 * Apply/dismiss/undo logic mirrors checkin/_components/RecommendationStub,
 * rendered here in the v2 primitive vocabulary.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeShell, Header, Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";

interface Rec {
  id: string;
  kind: string;
  status: "pending" | "applied" | "dismissed" | "expired";
  severity: "info" | "warning" | "urgent";
  title: string;
  body: string;
  suggestedField: string | null;
  suggestedValue: string | null;
  programId: string | null;
  createdAt: string;
}

function kindLabel(kind: string): string {
  return kind.replace(/_/g, " ");
}
function sevTone(s: string): "danger" | "warn" | "accent" {
  return s === "urgent" ? "danger" : s === "warning" ? "warn" : "accent";
}
function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(1);
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("value" in o) return formatValue(o.value);
  }
  return JSON.stringify(v);
}

export default function RecommendationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = async () => {
    try {
      const res = await fetch("/api/recommendations?status=any&limit=40");
      const data = res.ok ? await res.json() : null;
      setRecs(Array.isArray(data?.recommendations) ? data.recommendations : []);
    } catch {
      setRecs([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const openInPlanning = (rec: Rec) => {
    if (!rec.programId) return;
    router.push(`/gameplan/${rec.programId}/planning?recommendationId=${rec.id}`);
  };

  const dismiss = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed", dismissedReason: null }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const undoChange = async (changeId: string) => {
    try {
      const res = await fetch(`/api/gameplan-changes/${changeId}/undo`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      await reload();
      toast.info("Reverted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Undo failed");
    }
  };

  const apply = async (rec: Rec) => {
    setBusyId(rec.id);
    try {
      const res = await fetch(`/api/recommendations/${rec.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        // Field not in the dispatcher → hand off to Planning Mode.
        if (res.status === 400 && rec.programId) {
          toast.info("This recommendation needs Planning Mode to apply", 3000);
          openInPlanning(rec);
          return;
        }
        throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      }
      const { change } = (await res.json()) as {
        change: { id: string; field: string; oldValue: unknown; newValue: unknown };
      };
      await reload();
      toast.success(
        `Applied · ${change.field}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`,
        6000,
        { label: "Undo", onClick: () => void undoChange(change.id) },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setBusyId(null);
    }
  };

  const pending = recs.filter((r) => r.status === "pending");
  const resolved = recs.filter((r) => r.status === "applied" || r.status === "dismissed");

  return (
    <HomeShell
      header={
        <Header
          kind="home"
          title="Recommendations"
          subtitle="Gameplan"
          right="gear"
          onGear={() => router.push("/settings")}
        />
      }
    >
      <SectionLabel right={loaded ? `${pending.length} pending` : "Loading…"}>From your check-ins</SectionLabel>
      <div className="px-4">
        {pending.length === 0 ? (
          <Card className="px-4 py-5">
            <div className="font-body text-[13px] font-semibold text-ft-white">
              {loaded ? "No open recommendations" : "Loading…"}
            </div>
            <div className="mt-1 font-body text-[12px] leading-snug text-ft-dim">
              The Goal Engine runs on each weekly check-in. Cards land here when a rule fires — behind/ahead of
              target, adherence, plateaus, refeeds, deloads.
            </div>
            <Link href="/checkin" className="mt-3 block">
              <Button kind="primary" size="md" fullWidth>
                Start weekly check-in →
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {pending.map((rec) => {
              const busy = busyId === rec.id;
              return (
                <Card key={rec.id} className="px-3.5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Stamp>{kindLabel(rec.kind)}</Stamp>
                    <Chip tone={sevTone(rec.severity)} size="sm">
                      {rec.severity}
                    </Chip>
                  </div>
                  <div className="mt-1.5 font-display text-base font-bold leading-tight tracking-[-0.01em] text-ft-white">
                    {rec.title}
                  </div>
                  <div className="mt-1 font-body text-[12.5px] leading-snug text-ft-light">{rec.body}</div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-ft-border-faint pt-3">
                    {rec.suggestedField && rec.suggestedValue && (
                      <Button kind="primary" size="sm" disabled={busy} onClick={() => apply(rec)}>
                        Apply
                      </Button>
                    )}
                    {rec.programId && (
                      <Button kind="secondary" size="sm" disabled={busy} onClick={() => openInPlanning(rec)}>
                        Open in Planning
                      </Button>
                    )}
                    <Button kind="ghost" size="sm" disabled={busy} onClick={() => dismiss(rec.id)}>
                      Dismiss
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <>
          <SectionLabel right="Read-only">Resolved</SectionLabel>
          <div className="px-4">
            <Card className="overflow-hidden p-0">
              {resolved.map((r, i) => {
                const applied = r.status === "applied";
                return (
                  <div
                    key={r.id}
                    className={["flex items-center gap-3 px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={["font-body text-[13px] font-semibold", applied ? "text-ft-white" : "text-ft-light"].join(" ")}>
                        {r.title}
                      </div>
                      <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">
                        {kindLabel(r.kind)} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <Chip tone={applied ? "success" : "neutral"} size="sm">
                      {applied ? "Applied" : "Dismissed"}
                    </Chip>
                  </div>
                );
              })}
            </Card>
          </div>
        </>
      )}

      <div className="px-4 pt-4">
        <Link href="/progress/check-ins" className="ft-on-bg font-body text-[12px] font-semibold text-ft-accent-on-bg">
          View past check-ins →
        </Link>
      </div>
    </HomeShell>
  );
}
