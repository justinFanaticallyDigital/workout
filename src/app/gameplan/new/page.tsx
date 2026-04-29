"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import {
  PROGRAM_TEMPLATES,
  filterTemplates,
  getTemplateById,
  mergeTemplateConfig,
} from "@/lib/program-engine";
import type { ProgramConfig } from "@/lib/program-engine";
import { templateToPlan, type PickerPlan } from "./_picker/derive";
import {
  Step1Welcome,
  Step2Filter,
  Step3List,
  Step4Preview,
  Step5Setup,
  type Filters,
  type FilterKey,
  type PreviewBlueprint,
} from "./_picker/Steps";

type Step = 1 | 2 | 3 | 4 | 5;

/**
 * Multi-step program-picker onboarding.
 *
 * Flow: Welcome → Filter → List → Preview → Setup → POST to
 * /api/programs/generate → redirect to /programs/{id}.
 *
 * Each step is its own component in `_picker/Steps.tsx`; this file
 * owns state + side effects only.
 */
export default function NewProgramPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>(1);
  const [filters, setFilters] = useState<Filters>({});
  const [filtersBypassed, setFiltersBypassed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewBlueprint | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Derived plan list (for step 3) ─────────────────────────── */

  const plans: PickerPlan[] = useMemo(() => {
    const goalFilter = filters.goal;
    const dpwFilter = filters.daysPerWeek ? parseInt(filters.daysPerWeek, 10) : undefined;
    const expFilter = filters.experience;

    let templates = PROGRAM_TEMPLATES;
    if (!filtersBypassed) {
      templates = filterTemplates({
        goal: goalFilter,
        days: dpwFilter,
        experience: expFilter,
      });
      // If equipment filter set, narrow further
      if (filters.equipment) {
        templates = templates.filter((t) => {
          const eq = t.config.equipment;
          if (!eq) return true;
          // home -> only home/dumbbell-tagged templates pass
          if (filters.equipment === "home") return eq === "home_minimal" || t.tags.includes("home");
          if (filters.equipment === "limited_gym") return eq !== "full_gym";
          return true;
        });
      }
    }

    return templates.map(templateToPlan);
  }, [filters, filtersBypassed]);

  const selectedPlan = useMemo(() => {
    if (!selectedId) return null;
    const tmpl = getTemplateById(selectedId);
    return tmpl ? templateToPlan(tmpl) : null;
  }, [selectedId]);

  /* ─── Side effect: fetch preview when entering step 4 ────────── */

  useEffect(() => {
    if (step !== 4 || !selectedPlan) return;

    const tmpl = selectedPlan.raw;
    const config: ProgramConfig = mergeTemplateConfig(tmpl, {
      daysPerWeek: daysPerWeek as ProgramConfig["daysPerWeek"],
    }) as ProgramConfig;

    setPreviewLoading(true);
    setPreviewError(null);
    let cancelled = false;

    fetch("/api/programs/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`preview failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPreview(data as PreviewBlueprint);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setPreviewError(e instanceof Error ? e.message : "preview failed");
        setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, selectedPlan, daysPerWeek]);

  /* ─── Pre-populate dpw default from selected template ────────── */

  useEffect(() => {
    if (selectedPlan) setDaysPerWeek(selectedPlan.daysPerWeek);
  }, [selectedPlan]);

  /* ─── Handlers ───────────────────────────────────────────────── */

  const setFilter = (key: FilterKey, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const clearFilter = (key: FilterKey) => setFilter(key, undefined);

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const config = mergeTemplateConfig(selectedPlan.raw, {
        daysPerWeek: daysPerWeek as ProgramConfig["daysPerWeek"],
      }) as ProgramConfig;

      const res = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }
      const data = await res.json();
      // Update startDate on the program (engine defaults to today)
      if (startDate && startDate !== new Date().toISOString().slice(0, 10)) {
        await fetch(`/api/programs/${data.programId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate }),
        }).catch(() => undefined);
      }
      toast.success("Gameplan created");
      router.push(`/programs/${data.programId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create program";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  /* ─── Render the current step ────────────────────────────────── */

  return (
    <div className="bg-ft-bg text-ft-white -mx-4 -my-4 -mb-24 min-h-screen relative">
      {step === 1 && (
        <>
          <Step1Welcome
            onPick={() => setStep(2)}
            onSkip={() => router.push("/programs")}
          />
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <Link
              href="/programs/new/advanced"
              className="font-body text-[10px] uppercase tracking-[0.2em] text-ft-dim hover:text-ft-light"
            >
              Advanced setup →
            </Link>
          </div>
        </>
      )}

      {step === 2 && (
        <Step2Filter
          filters={filters}
          setFilter={setFilter}
          onContinue={() => {
            setFiltersBypassed(false);
            setStep(3);
          }}
          onSkip={() => {
            setFiltersBypassed(true);
            setFilters({});
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3List
          plans={plans}
          filters={filters}
          filtersBypassed={filtersBypassed}
          onPickPlan={(id) => {
            setSelectedId(id);
            setStep(4);
          }}
          onClearFilter={(k) => clearFilter(k)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && selectedPlan && (
        <Step4Preview
          plan={selectedPlan}
          blueprint={preview}
          loading={previewLoading}
          error={previewError}
          onConfirm={() => setStep(5)}
          onPickAnother={() => {
            setSelectedId(null);
            setPreview(null);
            setPreviewError(null);
            setStep(3);
          }}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && selectedPlan && (
        <Step5Setup
          plan={selectedPlan}
          startDate={startDate}
          setStartDate={setStartDate}
          daysPerWeek={daysPerWeek}
          setDaysPerWeek={setDaysPerWeek}
          submitting={submitting}
          onSubmit={handleSubmit}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  );
}
