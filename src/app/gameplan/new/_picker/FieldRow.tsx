"use client";

/**
 * FieldRow + NumInput — Step5 form primitives.
 *
 * Verbatim port of picker-screens.jsx#FieldRow (lines 1128–1145) and
 * NumInput (lines 1164–1175). The kicker + icon + label header reads
 * uniformly across all 7 chromes; the icon picks up `currentColor` so
 * it tints to the chrome's accent automatically.
 */

import type { ReactNode } from "react";
import { FieldIcon, type FieldKind } from "./icons";

export function FieldRow({
  label,
  kicker,
  icon,
  children,
}: {
  label: string;
  kicker?: string;
  icon?: FieldKind;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {kicker && (
        <div
          className="ft-stamp font-body"
          style={{
            fontSize: 9,
            color: "rgb(var(--ft-text-tertiary))",
            letterSpacing: ".25em",
            marginBottom: 4,
            textTransform: "uppercase",
            display: "inline-block",
          }}
        >
          {kicker}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 6,
        }}
      >
        {icon && (
          <span style={{ color: "rgb(var(--ft-accent))", display: "inline-flex" }}>
            <FieldIcon kind={icon} size={14} />
          </span>
        )}
        <div
          className="font-body"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgb(var(--ft-text-primary))",
          }}
        >
          {label}
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Numeric readout/input box — tabular-nums, surface-on-bg-alt, with an
 * optional unit suffix. The prototype shows it as readonly display; we
 * make it a real text input so users can edit body-weight + 1RM
 * targets directly. The value formatter keeps the prototype look.
 */
export function NumInput({
  value,
  onChange,
  unit,
  width = "100%",
  inputMode = "decimal",
  placeholder,
  disabled,
}: {
  value: string | number;
  onChange?: (v: string) => void;
  unit?: string;
  width?: number | string;
  inputMode?: "numeric" | "decimal" | "text";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        border: "1px solid rgb(var(--ft-border))",
        padding: "8px 12px",
        width,
        background: "rgb(var(--ft-bg-alt))",
      }}
    >
      <input
        type={inputMode === "text" ? "text" : "number"}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="font-data tabular-nums"
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 20,
          color: "rgb(var(--ft-text-primary))",
          width: "100%",
          padding: 0,
          letterSpacing: ".02em",
        }}
      />
      {unit && (
        <span
          className="font-body"
          style={{
            fontSize: 11,
            color: "rgb(var(--ft-text-tertiary))",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}
