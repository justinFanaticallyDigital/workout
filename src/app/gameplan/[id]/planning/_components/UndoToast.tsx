"use client";

/**
 * Post-Apply undo toast — NEW (not in prototype). Per R7 sandbox-state
 * contract Step 3: 10s window after Apply during which the user can
 * tap Undo to fire reverse-API calls.
 *
 * If reverse semantics aren't trivial (override creates can't be
 * deleted via existing endpoints; lifestyle upserts of brand-new keys
 * can't be cleared), `partialReason` is surfaced in the toast text
 * rather than failing silently.
 */

import { useEffect, useState } from "react";
import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PillBtn } from "./PillBtn";

export function UndoToast({
  message,
  partialReason,
  durationMs = 10_000,
  onUndo,
  onDismiss,
}: {
  message: string;
  partialReason: string | null;
  durationMs?: number;
  onUndo: () => Promise<void>;
  onDismiss: () => void;
}) {
  const [remaining, setRemaining] = useState(durationMs);
  const [undoing, setUndoing] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, durationMs - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onDismiss();
      }
    }, 250);
    return () => clearInterval(id);
  }, [durationMs, onDismiss]);

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 96,
        left: 12,
        right: 12,
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-accent-border))",
        boxShadow: "0 6px 24px rgb(0 0 0 / 0.35)",
        padding: "10px 12px",
        zIndex: 200,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Marker style={{ fontSize: 12, letterSpacing: ".06em" }}>{message}</Marker>
          <Archivo
            size={9}
            color="rgb(var(--ft-text-secondary))"
            style={{ display: "block", marginTop: 2, letterSpacing: ".08em" }}
          >
            {undoing ? "REVERTING…" : `UNDO IN ${seconds}s`}
          </Archivo>
          {partialReason && (
            <Archivo
              size={9}
              color="rgb(var(--ft-warn-fg))"
              style={{ display: "block", marginTop: 4, lineHeight: 1.35 }}
            >
              {partialReason}
            </Archivo>
          )}
        </div>
        <PillBtn
          primary
          size="sm"
          disabled={undoing}
          onClick={async () => {
            setUndoing(true);
            try {
              await onUndo();
            } finally {
              setUndoing(false);
              onDismiss();
            }
          }}
        >
          Undo
        </PillBtn>
      </div>
    </div>
  );
}
