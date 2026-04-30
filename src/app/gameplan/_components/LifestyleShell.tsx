"use client";

/**
 * Shared chrome for SleepCard / StressCard / ProteinHitCard.
 * Verbatim port of gameplan-active.jsx#LifestyleShell (lines
 * 1489–1559): icon tile + name + status pill + hero value + chart +
 * footer + tap-to-open hint.
 */

import type { ReactNode } from "react";
import { Marker, Archivo } from "./typography";
import { GoalIcon, type GoalIconKind } from "./icons";
import { useTheme } from "@/providers/ThemeProvider";

type Tone = "green" | "yellow" | "red";

export function LifestyleShell({
  name,
  icon,
  tone,
  tilt = 0,
  statusLabel,
  kicker,
  hero,
  chart,
  inlineLog,
  footer,
}: {
  name: string;
  icon: GoalIconKind;
  tone: Tone;
  tilt?: number;
  statusLabel: string;
  kicker: string;
  hero: ReactNode;
  chart: ReactNode;
  /** R9 — optional quick-log row rendered between chart and footer. */
  inlineLog?: ReactNode;
  footer: ReactNode;
}) {
  const { chrome } = useTheme();
  const graffiti = chrome === "graffiti";
  const toneColor =
    tone === "green"
      ? "rgb(var(--ft-pull))"
      : tone === "yellow"
      ? "rgb(var(--ft-core))"
      : "rgb(var(--ft-legs))";

  return (
    <div
      className="ft-card"
      style={{
        width: "100%",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border-faint))",
        borderLeft: `4px solid ${toneColor}`,
        padding: "14px 14px 12px",
        transform: graffiti ? `rotate(${tilt}deg)` : "none",
        boxShadow: graffiti
          ? "0 2px 0 rgba(0,0,0,.30), 0 6px 14px rgba(0,0,0,.18)"
          : "0 1px 2px rgba(0,0,0,.08)",
        textAlign: "left",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: `1.5px solid ${toneColor}`,
            background: "transparent",
            display: "grid",
            placeItems: "center",
            transform: graffiti ? "rotate(-3deg)" : "none",
            flexShrink: 0,
            color: toneColor,
          }}
        >
          <GoalIcon kind={icon} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".20em", display: "block", textTransform: "uppercase" }}
          >
            {kicker}
          </Archivo>
          <Marker
            style={{
              fontSize: 18,
              color: "rgb(var(--ft-text-primary))",
              display: "block",
              lineHeight: 1.05,
              transform: "rotate(-.6deg)",
              transformOrigin: "left",
            }}
          >
            {name}
          </Marker>
        </div>
        <div
          style={{
            padding: "3px 7px",
            border: `1px solid ${toneColor}`,
            background: "transparent",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: toneColor,
              boxShadow: `0 0 6px ${toneColor}`,
              display: "inline-block",
            }}
          />
          <Archivo size={8} color={toneColor} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>
            {statusLabel}
          </Archivo>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>{hero}</div>

      <div style={{ marginTop: 8 }}>{chart}</div>

      {inlineLog && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px dashed rgb(var(--ft-border-faint))",
          }}
        >
          {inlineLog}
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px dashed rgb(var(--ft-border-faint))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {footer}
        <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".20em" }}>
          OPEN DETAIL →
        </Archivo>
      </div>
    </div>
  );
}
