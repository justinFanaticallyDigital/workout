"use client";

import { useState } from "react";
import { Btn, Card, ScreenHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtMonthDay } from "@/lib/dates";
import { fmtTarget, plural } from "@/lib/training";

export interface DayDetailExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  lastDate: string | null;
  lastLine: string | null;
  pr: boolean;
}

interface DayDetailProps {
  planId: string;
  planName: string;
  blockName: string | null;
  day: { id: string; name: string; index: number };
  exercises: DayDetailExercise[];
}

export default function DayDetail({ planId, planName, blockName, day, exercises }: DayDetailProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const totalSets = exercises.reduce((n, e) => n + (e.targetSets ?? 3), 0);
  const minutes = Math.max(15, Math.round((totalSets * 2.5 + 5) / 5) * 5);

  const saveAsFrame = async () => {
    if (saving || exercises.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${planName} — ${day.name}`,
          focus: blockName ?? planName,
          exercises: exercises.map((e) => ({ exerciseId: e.exerciseId, targetSets: e.targetSets, targetRepRange: e.targetRepRange, targetRpe: e.targetRpe })),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      toast.success("Saved as frame");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the frame.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8">
      <ScreenHeader
        title={`Day ${day.index} — ${day.name}`}
        back={{ href: "/training", label: "Training" }}
        sub={`${blockName ? `${planName} · ${blockName}` : planName} · ${plural(exercises.length, "exercise")} · ~${minutes} min`}
      />
      <div className="px-5 pb-4">
        <Btn fullWidth href={`/log/${day.id}`}>
          Start workout
        </Btn>
      </div>
      <div className="flex flex-col gap-2.5 px-5">
        {exercises.map((e) => (
          <Card key={e.id} band={false} className="flex items-center gap-3 px-4 py-[13px]">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate font-data text-[14.5px] font-bold text-ft-white">{e.name}</div>
                {e.pr && <Stamp tone="coral">PR</Stamp>}
              </div>
              <div className="mt-0.5 font-body text-[12.5px] text-ft-dim">{e.lastLine && e.lastDate ? `Last · ${fmtMonthDay(e.lastDate)} · ${e.lastLine}` : "No sessions yet"}</div>
            </div>
            <div className="whitespace-nowrap font-data text-[13px] font-bold text-ft-accent">{fmtTarget(e.targetSets, e.targetRepRange)}</div>
          </Card>
        ))}
        {exercises.length === 0 && <div className="font-body text-[13px] text-ft-dim">No exercises yet. Add some in the editor.</div>}
      </div>
      <div className="mt-5 flex gap-2.5 px-5">
        <Btn kind="ghost" small className="flex-1" onClick={saveAsFrame} disabled={saving || exercises.length === 0}>
          {saving ? "Saving…" : "Save as frame"}
        </Btn>
        <Btn kind="quiet" small className="flex-1" href={`/training/${planId}?day=${day.id}`}>
          Edit day
        </Btn>
      </div>
    </div>
  );
}
