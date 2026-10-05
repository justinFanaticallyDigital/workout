"use client";

import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import Btn from "./Btn";

interface PromptSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  label?: string;
  initial?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void | Promise<void>;
}

/** One text field + a primary action. Used for renames and new-plan names. */
export default function PromptSheet({ open, onClose, title, label, initial = "", placeholder, submitLabel = "Save", onSubmit }: PromptSheetProps) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);
  const submit = async () => {
    const v = value.trim();
    if (!v || busy) return;
    setBusy(true);
    try {
      await onSubmit(v);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Btn fullWidth onClick={submit} disabled={!value.trim() || busy}>
          {busy ? "Saving…" : submitLabel}
        </Btn>
      }
    >
      {label && <div className="t-eyebrow mb-1">{label}</div>}
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void submit();
        }}
        placeholder={placeholder}
        className="w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent"
      />
    </Sheet>
  );
}
