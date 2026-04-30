"use client";

/**
 * Schedule-override editor — NEW (not in prototype). The prototype's
 * BlockTimeline hints at "TAP BLOCK → +DELOAD / +REFEED / +TEST" but
 * doesn't ship a dedicated screen for ad-hoc per-week / per-day
 * overrides (skip / swap / reduce). R7 adds this thin form so the
 * file-layout requirement is met and per-spec §9.2 schedule handles
 * are addressable.
 *
 * Each submitted override appends to `draft.newOverrides`; Apply
 * orchestrator emits one POST /api/schedule-overrides per row.
 */

import { useState } from "react";
import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PillBtn } from "./PillBtn";
import type { DraftScheduleOverride } from "./types";

const SCOPES: DraftScheduleOverride["scope"][] = ["TODAY_ONLY", "THIS_WEEK", "THIS_WEEK_FORWARD"];
const ACTIONS: DraftScheduleOverride["action"][] = ["SKIP", "SWAP", "REPLACE", "REDUCE_DAYS"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function ScheduleEditor({
  programId,
  blockId,
  weekNumber,
  pendingOverrides,
  onAdd,
  onRemove,
}: {
  programId: string;
  blockId: string;
  weekNumber: number;
  pendingOverrides: DraftScheduleOverride[];
  onAdd: (override: DraftScheduleOverride) => void;
  onRemove: (localId: string) => void;
}) {
  const [scope, setScope] = useState<DraftScheduleOverride["scope"]>("TODAY_ONLY");
  const [action, setAction] = useState<DraftScheduleOverride["action"]>("SKIP");
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);

  function submit() {
    onAdd({
      localId: `local-${Date.now()}`,
      programId,
      blockId,
      scope,
      action,
      weekNumber,
      dayOfWeek,
      payload: {},
    });
    setDayOfWeek(null);
  }

  return (
    <PlanningCard style={{ margin: "10px 12px 0" }} label="SCHEDULE · OVERRIDES">
      <Marker style={{ fontSize: 11, marginBottom: 4 }}>add override</Marker>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginTop: 6,
        }}
      >
        <label style={{ display: "block" }}>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            SCOPE
          </Archivo>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as DraftScheduleOverride["scope"])}
            className="font-body"
            style={selectStyle}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block" }}>
          <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
            ACTION
          </Archivo>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as DraftScheduleOverride["action"])}
            className="font-body"
            style={selectStyle}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <Archivo
          size={7}
          color="rgb(var(--ft-text-tertiary))"
          style={{ letterSpacing: ".18em", display: "block", marginBottom: 4 }}
        >
          DAY (OPTIONAL)
        </Archivo>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setDayOfWeek(null)}
            className="font-body"
            style={dowBtn(dayOfWeek === null)}
          >
            ANY
          </button>
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setDayOfWeek(i)}
              className="font-body"
              style={dowBtn(dayOfWeek === i)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <PillBtn primary size="sm" onClick={submit}>
          + Queue override
        </PillBtn>
      </div>
      {pendingOverrides.length > 0 && (
        <>
          <Archivo
            size={7}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em", marginTop: 12, display: "block" }}
          >
            QUEUED · {pendingOverrides.length}
          </Archivo>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {pendingOverrides.map((o) => (
              <div
                key={o.localId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 8px",
                  border: "1px dashed rgb(var(--ft-accent-border))",
                  background: "rgb(var(--ft-accent-faint))",
                }}
              >
                <Archivo size={9} color="rgb(var(--ft-accent))">
                  {o.action} · WK{o.weekNumber}
                  {o.dayOfWeek != null ? ` · ${DAYS[o.dayOfWeek]}` : ""} · {o.scope.replace(/_/g, " ")}
                </Archivo>
                <button
                  onClick={() => onRemove(o.localId)}
                  className="font-body"
                  aria-label="Remove queued override"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgb(var(--ft-text-tertiary))",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </PlanningCard>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 11,
  background: "transparent",
  border: "1px dashed rgb(var(--ft-border))",
  color: "rgb(var(--ft-text-primary))",
  outline: "none",
  padding: "4px 6px",
  marginTop: 3,
};

function dowBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    fontSize: 9,
    padding: "4px 0",
    border: active
      ? "1.5px solid rgb(var(--ft-accent))"
      : "1px solid rgb(var(--ft-border))",
    background: active ? "rgb(var(--ft-accent-faint))" : "transparent",
    color: active ? "rgb(var(--ft-accent))" : "rgb(var(--ft-text-secondary))",
    cursor: "pointer",
    letterSpacing: ".06em",
  };
}
