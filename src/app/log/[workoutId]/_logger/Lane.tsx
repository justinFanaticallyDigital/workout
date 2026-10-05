"use client";

import { Card, CategoryChip, TargetTag } from "@/components/kit";
import { fmtTarget } from "@/lib/training";
import SetCell, { AddSetCell } from "./SetCell";
import type { ExerciseData } from "./types";

const MAX_SETS = 12;

interface LaneProps {
  exercise: ExerciseData;
  activeSetIdx: number | null;
  onTapSet: (setIdx: number) => void;
  onAddSet: () => void;
  /** Name tap: swap / remove menu. */
  onMenu: () => void;
}

/** One exercise: category chip · name ▾ · target tag, then a row of set cells. Dims once every set is done. */
export default function Lane({ exercise, activeSetIdx, onTapSet, onAddSet, onMenu }: LaneProps) {
  const { sets } = exercise;
  const doneCount = sets.filter((s) => s.done).length;
  const allDone = sets.length > 0 && doneCount === sets.length;
  const cellCount = sets.length + (sets.length < MAX_SETS ? 1 : 0);
  // Five or more cells shrink the numerals; cells keep a minimum width and wrap rather than crush.
  const dense = cellCount >= 5;
  return (
    <Card className={["px-3.5 pb-2 pt-3", allDone ? "opacity-[.72]" : ""].join(" ")}>
      <div className="mb-2.5 flex items-center gap-2">
        <CategoryChip variant="solid" movementPattern={exercise.movementPattern} primaryMuscle={exercise.primaryMuscle} />
        <button type="button" onClick={onMenu} className="min-w-0 flex-1 truncate text-left font-data text-[14.5px] font-bold text-ft-white" aria-label={`${exercise.name}: swap or remove`}>
          {exercise.name} <span className="text-[11px] text-ft-dim">▾</span>
        </button>
        <TargetTag icon>{fmtTarget(exercise.targetSets, exercise.targetRepRange, true)}</TargetTag>
      </div>
      <div className={`flex flex-wrap ${dense ? "gap-1" : "gap-1.5"}`}>
        {sets.map((s, i) => (
          <SetCell key={i} setIdx={i} weight={s.weight} reps={s.reps} done={s.done} ghost={exercise.lastSets[i] ?? null} isActive={activeSetIdx === i} dense={dense} onTap={() => onTapSet(i)} />
        ))}
        {sets.length < MAX_SETS && <AddSetCell onTap={onAddSet} />}
      </div>
    </Card>
  );
}
