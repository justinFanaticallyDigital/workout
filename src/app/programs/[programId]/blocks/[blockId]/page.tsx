"use client";

/**
 * 3.7 — Block overview (block-editor.jsx · BlockOverview). Full-screen editor
 * sub-flow: duration summary + the days in this block, each drilling into the
 * day editor. "Edit schedule" routes to Planning Mode (block duration / split
 * editing lives there). "Add day" stages through a small inline form → POST.
 * Data from /api/blocks/[id]; behavior preserved from the legacy page.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Stamp, SectionLabel, Segmented } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";
import { EditorShell } from "../_editor-shell";

interface BlockDayExercise {
  id: string;
  exercise: { name: string; movementPattern: string | null };
  targetSets: number | null;
  targetRepRange: string | null;
}
interface BlockDay {
  id: string;
  dayNumber: number;
  dayOfWeek: number | null;
  name: string;
  dayType: string;
  exercises: BlockDayExercise[];
}
interface Block {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number | null;
  scheduleDaysPerWeek: number | null;
  focus: string | null;
  status: string;
  program: { name: string };
  days: BlockDay[];
  _count: { workouts: number };
}

const DAY_TYPES = ["lifting", "cardio", "conditioning", "mobility", "rest"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayBadge(d: BlockDay) {
  if (d.dayOfWeek && d.dayOfWeek >= 1 && d.dayOfWeek <= 7) return WEEKDAYS[d.dayOfWeek - 1];
  return `D${d.dayNumber}`;
}

export default function BlockOverviewPage({
  params,
}: {
  params: { programId: string; blockId: string };
}) {
  const { programId, blockId } = params;
  const router = useRouter();
  const toast = useToast();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [dayName, setDayName] = useState("");
  const [dayType, setDayType] = useState("lifting");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/blocks/${blockId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setBlock(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [blockId]);

  const handleAddDay = async () => {
    if (!dayName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/blocks/${blockId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: dayName.trim(), dayType }),
      });
      if (!res.ok) throw new Error("Failed");
      const day = await res.json();
      setBlock((prev) => (prev ? { ...prev, days: [...prev.days, { ...day, exercises: [] }] } : prev));
      setAdding(false);
      setDayName("");
      setDayType("lifting");
    } catch {
      toast.error("Failed to create day.");
    }
    setSaving(false);
  };

  const back = () => router.push(`/programs/${programId}`);

  if (loading) {
    return (
      <EditorShell title="Block" onBack={back}>
        <p className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</p>
      </EditorShell>
    );
  }
  if (!block) {
    return (
      <EditorShell title="Block" onBack={back}>
        <p className="px-4 pt-6 font-body text-sm text-ft-light">Block not found.</p>
      </EditorShell>
    );
  }

  const liftingDays = block.days.filter((d) => d.dayType !== "rest").length;

  return (
    <EditorShell title={block.name} subtitle={block.description || block.focus || "Block editor"} onBack={back}>
      <div className="px-4 pt-3">
        <Card className="flex items-center justify-between gap-2.5 px-3.5 py-3">
          <div>
            <Stamp>Duration</Stamp>
            <div className="mt-0.5 font-display text-base font-bold text-ft-white">
              {block.durationWeeks ? `${block.durationWeeks} weeks` : "Active block"}
              {` · ${block.scheduleDaysPerWeek ?? liftingDays} days / wk`}
            </div>
          </div>
          <Link href={`/programs/${programId}/planning`}>
            <Button kind="secondary" size="sm">
              Edit schedule
            </Button>
          </Link>
        </Card>
      </div>

      <SectionLabel right="tap a day">Days in this block</SectionLabel>
      <div className="flex flex-col gap-2 px-4">
        {block.days.length === 0 && !adding && (
          <p className="rounded-ft-lg border border-dashed border-ft-border px-4 py-5 text-center font-body text-xs text-ft-dim">
            No training days yet.
          </p>
        )}
        {block.days.map((d) => {
          const rest = d.dayType === "rest";
          return (
            <Link
              key={d.id}
              href={rest ? "#" : `/programs/${programId}/blocks/${blockId}/days/${d.id}`}
              className={rest ? "pointer-events-none" : ""}
            >
              <Card className={["flex items-center gap-3 px-3.5 py-3", rest ? "opacity-60" : ""].join(" ")}>
                <span
                  className="inline-flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-ft-md font-data text-[11px] font-bold tracking-[0.03em]"
                  style={{
                    background: rest ? "rgb(var(--ft-surface-alt))" : "rgb(var(--ft-accent-faint))",
                    color: rest ? "rgb(var(--ft-dim))" : "rgb(var(--ft-accent))",
                  }}
                >
                  {dayBadge(d)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-body text-[13.5px] font-semibold text-ft-white">{d.name}</div>
                  <div className="mt-px font-data text-[11px] tracking-[0.03em] text-ft-dim">
                    {rest ? "No session" : `${d.exercises.length} exercises`}
                  </div>
                </div>
                {!rest && <span className="font-body text-xs font-bold text-ft-accent">Edit ›</span>}
              </Card>
            </Link>
          );
        })}

        {adding ? (
          <Card className="flex flex-col gap-2.5 px-3.5 py-3.5">
            <input
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder="Day name — e.g. Upper · Push"
              autoFocus
              className="w-full rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-2.5 font-body text-sm text-ft-white outline-none placeholder:text-ft-dim"
            />
            <Segmented
              value={dayType}
              onChange={setDayType}
              options={DAY_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))}
            />
            <div className="flex justify-end gap-2">
              <Button kind="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button kind="primary" size="sm" disabled={saving || !dayName.trim()} onClick={handleAddDay}>
                {saving ? "Saving…" : "Add day"}
              </Button>
            </div>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="ft-on-bg mt-0.5 w-full rounded-ft-lg border-[1.5px] border-dashed border-ft-border-strong py-3 font-body text-[13px] font-semibold text-ft-accent-on-bg"
          >
            + Add day
          </button>
        )}
      </div>
    </EditorShell>
  );
}
