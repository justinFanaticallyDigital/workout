"use client";

/**
 * R15 — Gameplan tag editor on Planning Mode's Goals tab.
 *
 * Dropdown of 9 options (the 8 program-templates slugs + "None").
 * Changes stage on PlanningDraft.program.gameplanKind, get picked up
 * by the diff system as a `program` entry, and PATCH through to
 * /api/programs/[id] on Apply. Header badge updates on next /gameplan
 * visit since /api/home includes gameplanKind.
 */

import { Archivo } from "@/app/gameplan/_components/typography";
import { programTemplates } from "@/lib/program-templates";

interface Props {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
}

export function GameplanKindEditor({ value, onChange }: Props) {
  const current = value ?? "";

  return (
    <div
      style={{
        padding: "12px 14px",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border-faint))",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <Archivo
          size={10}
          color="rgb(var(--ft-text-tertiary))"
          style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
        >
          Gameplan tag
        </Archivo>
        <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
          DRIVES REC RULES
        </Archivo>
      </div>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="font-body"
        style={{
          width: "100%",
          padding: "8px 10px",
          background: "rgb(var(--ft-bg))",
          color: "rgb(var(--ft-text-primary))",
          border: "1px solid rgb(var(--ft-border))",
          fontSize: 14,
        }}
      >
        <option value="">None — untagged program</option>
        {programTemplates.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      <Archivo
        size={9}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".05em", display: "block", marginTop: 6, lineHeight: 1.4 }}
      >
        Tagging this program lets the engine fire kind-specific recommendations (e.g. refeed-due
        for Lean Out). Changing the tag here applies on next save.
      </Archivo>
    </div>
  );
}
