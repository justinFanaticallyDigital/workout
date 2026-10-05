"use client";

import { useState } from "react";
import { Btn, Sheet } from "@/components/kit";
import { fmtVolume, formatSec } from "./util";

interface FinishSheetProps {
  open: boolean;
  stats: { sets: number; volume: number; seconds: number; prs: number };
  defaultFrameName: string;
  exerciseCount: number;
  /** Already saved from this frame — offer to update it instead of creating another. */
  canSaveFrame: boolean;
  onSaveFrame: (name: string) => Promise<boolean>;
  onDone: () => void;
}

/** After the session is written: the record, and an optional Save as frame. */
export default function FinishSheet({ open, stats, defaultFrameName, exerciseCount, canSaveFrame, onSaveFrame, onDone }: FinishSheetProps) {
  const [name, setName] = useState(defaultFrameName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (saving || saved || !name.trim()) return;
    setSaving(true);
    const ok = await onSaveFrame(name.trim());
    setSaving(false);
    if (ok) setSaved(true);
  };

  return (
    <Sheet
      open={open}
      onClose={onDone}
      title="Workout saved"
      footer={
        <Btn fullWidth onClick={onDone}>
          Done
        </Btn>
      }
    >
      <div className="flex gap-4">
        <Big value={String(stats.sets)} label="Sets" />
        <Big value={fmtVolume(stats.volume)} label="lb vol" />
        <Big value={formatSec(stats.seconds)} label="Time" />
        {stats.prs > 0 && <Big value={String(stats.prs)} label={stats.prs === 1 ? "PR" : "PRs"} coral />}
      </div>
      {canSaveFrame && (
        <div className="mt-4 rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-3">
          <div className="t-eyebrow">Save as frame · {exerciseCount} exercises, targets only</div>
          <div className="mt-2 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saved}
              className="min-w-0 flex-1 rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2 font-body text-[14px] text-ft-white outline-none focus:border-ft-accent disabled:opacity-60"
            />
            <Btn kind="ghost" small onClick={save} disabled={saving || saved || !name.trim()}>
              {saved ? "Saved" : saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Big({ value, label, coral = false }: { value: string; label: string; coral?: boolean }) {
  return (
    <div>
      <div className={`font-data text-[22px] font-bold leading-none tabular-nums ${coral ? "text-ft-coral" : "text-ft-white"}`}>{value}</div>
      <div className="mt-1 font-data text-[9px] uppercase tracking-[0.14em] text-ft-dim">{label}</div>
    </div>
  );
}
