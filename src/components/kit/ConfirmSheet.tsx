"use client";

import { useState, type ReactNode } from "react";
import Sheet from "./Sheet";
import Btn from "./Btn";

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

/** Two-button confirmation. Destructive actions use the coral button. */
export default function ConfirmSheet({ open, onClose, title, body, confirmLabel = "Confirm", danger = false, onConfirm }: ConfirmSheetProps) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
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
        <div className="flex gap-2.5">
          <Btn kind="quiet" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Btn>
          <Btn kind={danger ? "coral" : "primary"} className="flex-1" onClick={confirm} disabled={busy}>
            {busy ? "…" : confirmLabel}
          </Btn>
        </div>
      }
    >
      {body && <div className="font-body text-[13.5px] text-ft-light">{body}</div>}
    </Sheet>
  );
}
