"use client";

/**
 * Per-block-day exercise editor — REPURPOSE NEW. The prototype
 * mutes this tab; R7 ships a wired card that lets the user adjust
 * `targetSets` / `targetRepRange` / `targetRpe` per exercise.
 *
 * Mutates `draft.blocks[].days[].exercises[]` in PlanningDraft.
 * Apply orchestrator coalesces same-exercise diffs into one
 * PATCH /api/blocks/day/[id]/exercises/[exerciseId].
 */

import { Archivo, Marker } from "@/app/gameplan/_components/typography";
import { PlanningCard } from "./PlanningCard";
import { PlanningDashed } from "./Ornaments";
import type { DraftBlock, DraftExercise } from "./types";

interface ChangeMap {
  targetSets?: number | null;
  targetRepRange?: string | null;
  targetRpe?: string | null;
}

export function TrainingEditor({
  blocks,
  onChangeExercise,
}: {
  blocks: DraftBlock[];
  onChangeExercise: (
    blockId: string,
    dayId: string,
    exerciseId: string,
    patch: ChangeMap,
  ) => void;
}) {
  if (blocks.length === 0) {
    return (
      <PlanningCard style={{ margin: "10px 12px 0" }}>
        <Archivo size={10} color="rgb(var(--ft-text-tertiary))">
          No blocks defined yet.
        </Archivo>
      </PlanningCard>
    );
  }
  return (
    <div>
      {blocks.map((b) => (
        <PlanningCard key={b.id} style={{ margin: "10px 12px 0" }} label={b.name.toUpperCase()}>
          {b.days.length === 0 ? (
            <Archivo size={10} color="rgb(var(--ft-text-tertiary))">
              No days in this block.
            </Archivo>
          ) : (
            b.days.map((d, i) => (
              <div key={d.id}>
                {i > 0 && <PlanningDashed style={{ margin: "10px 0" }} />}
                <Marker style={{ fontSize: 11 }}>{d.name.toLowerCase()}</Marker>
                <Archivo
                  size={8}
                  color="rgb(var(--ft-text-tertiary))"
                  style={{ letterSpacing: ".15em", display: "block", marginTop: 2 }}
                >
                  {d.dayType.toUpperCase()} · {d.exercises.length} exercise{d.exercises.length === 1 ? "" : "s"}
                </Archivo>
                {d.exercises.map((e) => (
                  <ExerciseRow
                    key={e.id}
                    exercise={e}
                    onChange={(patch) => onChangeExercise(b.id, d.id, e.id, patch)}
                  />
                ))}
              </div>
            ))
          )}
        </PlanningCard>
      ))}
    </div>
  );
}

function ExerciseRow({
  exercise,
  onChange,
}: {
  exercise: DraftExercise;
  onChange: (patch: ChangeMap) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 50px 70px 50px",
        alignItems: "baseline",
        gap: 6,
        marginTop: 8,
      }}
    >
      <Archivo size={10} color="rgb(var(--ft-text-primary))">
        {exercise.exerciseName}
      </Archivo>
      <input
        type="number"
        value={exercise.targetSets ?? ""}
        onChange={(e) =>
          onChange({ targetSets: e.target.value === "" ? null : Number(e.target.value) })
        }
        placeholder="sets"
        className="font-data tabular-nums"
        style={inputStyle}
        aria-label={`${exercise.exerciseName} target sets`}
      />
      <input
        type="text"
        value={exercise.targetRepRange ?? ""}
        onChange={(e) => onChange({ targetRepRange: e.target.value || null })}
        placeholder="reps"
        className="font-data"
        style={inputStyle}
        aria-label={`${exercise.exerciseName} target rep range`}
      />
      <input
        type="text"
        value={exercise.targetRpe ?? ""}
        onChange={(e) => onChange({ targetRpe: e.target.value || null })}
        placeholder="RPE"
        className="font-data"
        style={inputStyle}
        aria-label={`${exercise.exerciseName} target RPE`}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgb(var(--ft-text-primary))",
  background: "transparent",
  border: "1px dashed rgb(var(--ft-border))",
  outline: "none",
  padding: "2px 6px",
  textAlign: "center",
  width: "100%",
};
