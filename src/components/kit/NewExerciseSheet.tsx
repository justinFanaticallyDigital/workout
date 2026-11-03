"use client";

import { useEffect, useState } from "react";
import Sheet from "./Sheet";
import Btn from "./Btn";
import ExerciseTemplateForm, { createExerciseFromTemplate, useExerciseTemplate } from "./ExerciseTemplateForm";
import type { PickedExercise } from "./ExercisePickerSheet";
import { useToast } from "@/components/ui/Toast";

interface NewExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  /** Seeds the movement field (the picker passes its search text). */
  initialMovement?: string;
  onCreated: (exercise: PickedExercise) => void;
}

/** Build a custom exercise from the template fields without leaving the logger or plan editor. */
export default function NewExerciseSheet({ open, onClose, initialMovement = "", onCreated }: NewExerciseSheetProps) {
  const toast = useToast();
  const state = useExerciseTemplate(initialMovement);
  const { reset } = state;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) reset(initialMovement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMovement]);

  const submit = async () => {
    if (!state.valid || busy) return;
    setBusy(true);
    try {
      const { exercise, existed } = await createExerciseFromTemplate(state.value);
      toast.success(existed ? `${exercise.name} is already in the library` : `${exercise.name} added`);
      onCreated(exercise);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the exercise.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New exercise"
      footer={
        <Btn fullWidth onClick={submit} disabled={!state.valid || busy}>
          {busy ? "Creating…" : "Create · add"}
        </Btn>
      }
    >
      <ExerciseTemplateForm state={state} autoFocus />
    </Sheet>
  );
}
