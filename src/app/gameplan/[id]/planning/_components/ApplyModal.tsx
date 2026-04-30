"use client";

/**
 * Apply confirmation modal — verbatim port of planning-screens.jsx
 * #ApplyModal (lines 1308–1413): diff list + optional note text +
 * Cancel/Confirm buttons + revision footer.
 *
 * Note text is collected in UI but **not persisted** — the
 * `GameplanChange` audit-log model with `commitId` doesn't exist in
 * the current schema (deferred). The note shows up in the post-Apply
 * toast as a transient acknowledgement.
 */

import { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import { PillBtn } from "./PillBtn";
import { PlanningModeStamp } from "./PlanningModeStamp";
import type { DiffEntry } from "./types";

export function ApplyModal({
  diff,
  onCancel,
  onConfirm,
}: {
  diff: DiffEntry[];
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const { chrome } = useTheme();
  const [note, setNote] = useState("");

  return (
    <div
      role="dialog"
      aria-label="Confirm planning changes"
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", padding: "60px 12px 12px", justifyContent: "center" }}
    >
      {/* Background — blueprint shows the drafting grid; others go flat. */}
      {chrome === "blueprint" ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgb(19 44 82 / 0.10) 1px, transparent 1px), linear-gradient(90deg, rgb(19 44 82 / 0.10) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "rgb(var(--ft-bg-alt))",
            opacity: 0.35,
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{ position: "absolute", inset: 0, background: "rgb(var(--ft-bg))" }}
        />
      )}
      <div
        aria-hidden
        onClick={onCancel}
        style={{ position: "absolute", inset: 0, background: "rgb(0 0 0 / 0.45)", cursor: "pointer" }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
        <PlanningCard style={{ padding: "16px 16px 14px" }}>
          <div style={{ position: "absolute", top: -10, right: 10 }}>
            <PlanningModeStamp small />
          </div>

          <Marker style={{ fontSize: 14, letterSpacing: ".08em" }}>
            apply {diff.length} change{diff.length === 1 ? "" : "s"}?
          </Marker>
          <Archivo
            size={9}
            color="rgb(var(--ft-text-secondary))"
            style={{ letterSpacing: ".1em", marginTop: 3, display: "block" }}
          >
            {"// "}
            commits draft to live gameplan · audit log + multi-field commit grouping land in a
            follow-on schema phase
          </Archivo>

          <PlanningDashed style={{ margin: "12px 0 10px" }} />

          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em", marginBottom: 6, display: "block" }}
          >
            DIFF · {diff.length} ITEM{diff.length === 1 ? "" : "S"}
          </Archivo>

          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {diff.map((d, i) => (
              <DiffRow key={i} entry={d} index={i + 1} last={i === diff.length - 1} />
            ))}
          </div>

          <PlanningDashed style={{ margin: "12px 0 8px" }} />

          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em", marginBottom: 4, display: "block" }}
          >
            NOTE · OPTIONAL
          </Archivo>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., wasn&apos;t losing — cutting 150 kcal"
            className="font-body"
            style={{
              border: "1px dashed rgb(var(--ft-border))",
              padding: "8px 10px",
              fontSize: 10,
              color: "rgb(var(--ft-text-primary))",
              fontStyle: "italic",
              width: "100%",
              minHeight: 50,
              resize: "vertical",
              background: "transparent",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <PillBtn
              ghost
              size="md"
              style={{ flex: 1 }}
              onClick={onCancel}
            >
              Cancel
            </PillBtn>
            <PillBtn primary size="md" style={{ flex: 2 }} onClick={() => onConfirm(note)}>
              Confirm ↗
            </PillBtn>
          </div>
        </PlanningCard>
      </div>
    </div>
  );
}

function DiffRow({ entry, index, last }: { entry: DiffEntry; index: number; last: boolean }) {
  const { label, oldText, newText } = formatDiffEntry(entry);
  return (
    <div
      className="font-body"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto auto",
        alignItems: "baseline",
        gap: 6,
        padding: "5px 0",
        borderBottom: last ? "none" : "1px dashed rgb(var(--ft-border))",
      }}
    >
      <span style={{ fontSize: 8, color: "rgb(var(--ft-text-tertiary))" }}>
        {String(index).padStart(2, "0")}
      </span>
      <span style={{ fontSize: 10 }}>{label}</span>
      <span
        style={{ fontSize: 10, color: "rgb(var(--ft-text-tertiary))", textDecoration: "line-through" }}
      >
        {oldText}
      </span>
      <span style={{ fontSize: 10, color: "rgb(var(--ft-text-tertiary))" }}>→</span>
      <span style={{ fontSize: 11, color: "rgb(var(--ft-accent))", fontWeight: 700 }}>{newText}</span>
    </div>
  );
}

function formatDiffEntry(entry: DiffEntry): { label: string; oldText: string; newText: string } {
  switch (entry.kind) {
    case "program":
      return {
        label: `Program ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "block":
      return {
        label: `${entry.blockName} · ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "day":
      return {
        label: `${entry.dayName} · ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "exercise":
      return {
        label: `${entry.exerciseName} · ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "goal":
      return {
        label: `${entry.goalTitle} · ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "nutrition":
      return {
        label: `Nutrition · ${entry.field}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "lifestyle":
      return {
        label: `Lifestyle · ${entry.key}`,
        oldText: fmt(entry.oldValue),
        newText: fmt(entry.newValue),
      };
    case "override-new":
      return {
        label: `Schedule override`,
        oldText: "—",
        newText: entry.summary,
      };
  }
}

function fmt(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.length === 0 ? "[]" : `[${v.join(",")}]`;
  return String(v);
}
