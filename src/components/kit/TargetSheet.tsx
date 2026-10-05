"use client";

import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import Btn from "./Btn";
import Stepper from "./Stepper";

interface TargetSheetProps {
  open: boolean;
  onClose: () => void;
  sets: number | null;
  reps: string | null;
  onSave: (next: { sets: number; reps: string }) => void | Promise<void>;
}

const QUICK_REPS = ["5", "6-8", "8", "8-12", "10", "10-12", "12-15", "AMRAP"];

/** Sets × reps editor for a plan exercise. */
export default function TargetSheet({ open, onClose, sets, reps, onSave }: TargetSheetProps) {
  const [s, setS] = useState(sets ?? 3);
  const [r, setR] = useState(reps ?? "8-12");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setS(sets ?? 3);
      setR(reps ?? "8-12");
    }
  }, [open, sets, reps]);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onSave({ sets: s, reps: r.trim() || "8-12" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Target"
      footer={
        <Btn fullWidth onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save target"}
        </Btn>
      }
    >
      <div className="flex items-center justify-between">
        <div className="t-eyebrow">Sets</div>
        <Stepper value={s} onChange={setS} min={1} max={12} />
      </div>
      <div className="t-eyebrow mt-4 mb-1">Reps</div>
      <input
        value={r}
        onChange={(e) => setR(e.target.value)}
        placeholder="8-12"
        className="w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-data text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_REPS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setR(q)}
            className={[
              "rounded-full border px-2.5 py-1 font-data text-[10.5px] font-bold uppercase tracking-[0.1em]",
              q === r ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
            ].join(" ")}
          >
            {q.replace("-", "–")}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
