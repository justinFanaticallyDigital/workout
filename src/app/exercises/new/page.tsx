"use client";

/** Create a custom exercise from the template — movement · position · grip · tempo · equipment · category. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, ExerciseTemplateForm, ScreenHeader, createExerciseFromTemplate, useExerciseTemplate } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

export default function NewExercisePage() {
  const router = useRouter();
  const toast = useToast();
  const state = useExerciseTemplate();
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!state.valid || saving) return;
    setSaving(true);
    try {
      const { exercise, existed } = await createExerciseFromTemplate(state.value);
      toast.success(existed ? `${exercise.name} is already in the library` : `${exercise.name} added`);
      router.push(`/exercises/${exercise.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the exercise.");
      setSaving(false);
    }
  };

  return (
    <div className="pb-10">
      <ScreenHeader title="New exercise" back={{ href: "/exercises", label: "Exercises" }} sub="Movement · position · grip · tempo · equipment" />
      <div className="flex flex-col gap-3 px-5">
        <ExerciseTemplateForm state={state} autoFocus />
        <div className="flex gap-2.5">
          <Btn kind="quiet" href="/exercises" className="flex-1">
            Cancel
          </Btn>
          <Btn className="flex-[2]" onClick={submit} disabled={!state.valid || saving}>
            {saving ? "Creating…" : "Create exercise"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
