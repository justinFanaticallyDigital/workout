"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTemplateBySlug } from "@/lib/program-templates";
import type {
  CustomizationInput,
  EngineWarning,
  ProgramTemplate,
} from "@/lib/program-templates/types";
import {
  evaluateWarnings,
  type CustomizationAnswers,
} from "@/lib/program-templates/evaluate-warnings";
import {
  CustomizationInputRenderer,
  validateAnswer,
} from "@/components/templates/CustomizationInputRenderer";
import { Card, SectionHeader, ProgressBar } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

// step indexes:
//   -1   = intro
//   0..n = customizationInputs[i]
//   n+1  = review
type StepIndex = number;

export default function CustomizeTemplatePage({ params }: PageProps) {
  const router = useRouter();
  const toast = useToast();
  const template = getTemplateBySlug(params.slug);

  // Resilience: if the slug is unknown, show a friendly error rather than crashing.
  if (!template) {
    return <UnknownTemplate slug={params.slug} />;
  }

  const inputs = template.customizationInputs ?? [];
  const totalSteps = inputs.length;
  const reviewIndex = totalSteps;

  const [stepIndex, setStepIndex] = useState<StepIndex>(-1);
  const [answers, setAnswers] = useState<CustomizationAnswers>(() =>
    initialAnswersFor(template),
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  // Warnings recompute whenever answers change — cheap pure function.
  const warnings = useMemo(
    () => evaluateWarnings(template, answers),
    [template, answers],
  );

  const blockingError = warnings.some((w) => w.severity === "error");

  // ---- handlers --------------------------------------------------
  const setAnswer = (key: string, value: CustomizationAnswers[string]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const goToStep = (idx: StepIndex) => {
    setStepIndex(idx);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (stepIndex === -1) {
      goToStep(0);
      return;
    }

    if (stepIndex >= 0 && stepIndex < totalSteps) {
      const input = inputs[stepIndex];
      const err = validateAnswer(input, answers[input.key]);
      if (err) {
        setErrors((prev) => ({ ...prev, [input.key]: err }));
        return;
      }
      goToStep(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex === -1) {
      router.back();
    } else {
      goToStep(stepIndex - 1);
    }
  };

  const handleConfirm = async () => {
    if (blockingError) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/programs/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: template.slug,
          customizationAnswers: answers,
          startDate:
            typeof answers.startDate === "string" ? answers.startDate : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // NOTE: useToast() signature is project-specific. Adjust this
        // call to match your existing Toast API (likely toast.show({ ... })
        // or toast.error(message)).
        toast?.show?.(body?.error ?? "Could not create program");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      toast?.show?.("Program created");
      router.push(`/programs/${data.programId}`);
    } catch (err) {
      console.error(err);
      toast?.show?.("Network error");
      setSubmitting(false);
    }
  };

  // ---- render ----------------------------------------------------
  return (
    <main className="px-4 py-6 pb-24 max-w-xl mx-auto">
      <TopBar
        templateName={template.name}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />

      <div className="tab-enter">
        {stepIndex === -1 && (
          <IntroView template={template} onStart={() => goToStep(0)} />
        )}

        {stepIndex >= 0 && stepIndex < totalSteps && (
          <StepView
            input={inputs[stepIndex]}
            value={answers[inputs[stepIndex].key]}
            onChange={(v) => setAnswer(inputs[stepIndex].key, v)}
            error={errors[inputs[stepIndex].key]}
          />
        )}

        {stepIndex === reviewIndex && (
          <ReviewView
            template={template}
            answers={answers}
            warnings={warnings}
            onEdit={(idx) => goToStep(idx)}
          />
        )}
      </div>

      <NavRow
        stepIndex={stepIndex}
        reviewIndex={reviewIndex}
        onBack={handleBack}
        onNext={handleNext}
        onConfirm={handleConfirm}
        confirmDisabled={blockingError || submitting}
        submitting={submitting}
      />
    </main>
  );
}

// ================================================================
// Sub-views
// ================================================================

function TopBar({
  templateName,
  stepIndex,
  totalSteps,
}: {
  templateName: string;
  stepIndex: number;
  totalSteps: number;
}) {
  // Progress: intro → 0/total, last step → total/total, review → total/total
  const shown = Math.max(0, Math.min(stepIndex, totalSteps));
  const pct = totalSteps === 0 ? 0 : (shown / totalSteps) * 100;

  return (
    <div className="mb-6">
      <Link
        href="/programs/new/templates"
        className="text-sm text-ft-light hover:text-ft-white font-body"
      >
        ← Templates
      </Link>
      <h1 className="font-display text-3xl text-ft-white mt-2 leading-tight">
        {templateName}
      </h1>
      {totalSteps > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-ft-muted font-body mb-1">
            <span>
              {stepIndex === -1
                ? "Get started"
                : stepIndex >= totalSteps
                  ? "Review"
                  : `Step ${stepIndex + 1} of ${totalSteps}`}
            </span>
            <span>{Math.round(pct)}%</span>
          </div>
          <ProgressBar value={pct} max={100} />
        </div>
      )}
    </div>
  );
}

function IntroView({
  template,
  onStart,
}: {
  template: ProgramTemplate;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <p className="font-handwritten text-xl text-ft-white">
          {template.tagline}
        </p>
        <p className="font-body text-base text-ft-light mt-3 leading-relaxed">
          {template.description}
        </p>
      </Card>

      <Card>
        <SectionHeader title="What we'll need" />
        <ul className="space-y-2 mt-3">
          {(template.customizationInputs ?? []).map((i) => (
            <li
              key={i.key}
              className="font-body text-sm text-ft-light flex gap-2"
            >
              <span className="text-ft-accent">•</span>
              <span>
                {i.label}
                {i.required ? "" : " (optional)"}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <button
        type="button"
        onClick={onStart}
        className="cta-underline w-full text-center py-4 font-display text-xl text-ft-white"
      >
        Start setup →
      </button>
    </div>
  );
}

function StepView({
  input,
  value,
  onChange,
  error,
}: {
  input: CustomizationInput;
  value: CustomizationAnswers[string];
  onChange: (v: CustomizationAnswers[string]) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-ft-white leading-tight">
          {input.label}
          {input.required && <span className="text-ft-accent ml-1">*</span>}
        </h2>
        {input.helpText && (
          <p className="font-body text-sm text-ft-light mt-2 leading-relaxed">
            {input.helpText}
          </p>
        )}
      </div>

      <div className="py-2">
        <CustomizationInputRenderer
          input={input}
          value={value}
          onChange={onChange}
        />
      </div>

      {error && (
        <p className="font-body text-sm text-ft-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewView({
  template,
  answers,
  warnings,
  onEdit,
}: {
  template: ProgramTemplate;
  answers: CustomizationAnswers;
  warnings: EngineWarning[];
  onEdit: (stepIndex: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-ft-white">Review</h2>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <WarningBanner key={i} warning={w} />
          ))}
        </div>
      )}

      <Card>
        <SectionHeader title="Your answers" />
        <dl className="mt-3 space-y-3">
          {(template.customizationInputs ?? []).map((input, idx) => (
            <div
              key={input.key}
              className="flex items-start justify-between gap-3 pb-3 section-divider last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <dt className="font-body text-xs text-ft-muted uppercase tracking-wide">
                  {input.label}
                </dt>
                <dd className="font-handwritten text-lg text-ft-white mt-0.5 break-words">
                  {formatAnswer(input, answers[input.key])}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => onEdit(idx)}
                className="font-body text-xs text-ft-accent hover:text-ft-white cta-underline shrink-0"
              >
                Edit
              </button>
            </div>
          ))}
        </dl>
      </Card>

      <div>
        <Link
          href="/programs/new/templates"
          className="cta-underline inline-block font-body text-sm text-ft-light"
        >
          ← Pick a different program
        </Link>
      </div>
    </div>
  );
}

function WarningBanner({ warning }: { warning: EngineWarning }) {
  const tone = {
    error: {
      border: "border-ft-danger",
      bg: "bg-ft-danger/10",
      text: "text-ft-danger",
      label: "Blocker",
    },
    warning: {
      border: "border-ft-warn",
      bg: "bg-ft-warn/10",
      text: "text-ft-warn",
      label: "Heads up",
    },
    info: {
      border: "border-ft-border",
      bg: "bg-ft-surface",
      text: "text-ft-light",
      label: "Note",
    },
  }[warning.severity];

  return (
    <div
      className={`border-2 ${tone.border} ${tone.bg} p-3 rounded-[var(--ft-border-radius,0)]`}
    >
      <div
        className={`font-body text-xs uppercase tracking-wide ${tone.text} mb-1`}
      >
        {tone.label}
      </div>
      <p className="font-body text-sm text-ft-white leading-relaxed">
        {warning.message}
      </p>
    </div>
  );
}

function NavRow({
  stepIndex,
  reviewIndex,
  onBack,
  onNext,
  onConfirm,
  confirmDisabled,
  submitting,
}: {
  stepIndex: number;
  reviewIndex: number;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
  confirmDisabled: boolean;
  submitting: boolean;
}) {
  const isReview = stepIndex === reviewIndex;
  const isIntro = stepIndex === -1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-xl px-4 pb-4 pt-6 bg-gradient-to-t from-ft-bg via-ft-bg/95 to-transparent pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="font-body text-sm text-ft-light cta-underline px-1 py-2"
          >
            ← Back
          </button>

          {isReview ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={[
                "cta-underline font-display text-lg px-2 py-2",
                confirmDisabled
                  ? "text-ft-muted cursor-not-allowed"
                  : "text-ft-white",
              ].join(" ")}
            >
              {submitting ? "Creating…" : "Create program →"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="cta-underline font-display text-lg text-ft-white px-2 py-2"
            >
              {isIntro ? "Start →" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UnknownTemplate({ slug }: { slug: string }) {
  return (
    <main className="px-4 py-6 max-w-xl mx-auto">
      <Card>
        <h1 className="font-display text-2xl text-ft-white">Template not found</h1>
        <p className="font-body text-sm text-ft-light mt-2">
          We couldn't find a template called <code>{slug}</code>.
        </p>
        <Link
          href="/programs/new/templates"
          className="cta-underline inline-block mt-4 font-body text-ft-accent"
        >
          ← Back to templates
        </Link>
      </Card>
    </main>
  );
}

// ================================================================
// Helpers
// ================================================================

function initialAnswersFor(template: ProgramTemplate): CustomizationAnswers {
  const out: CustomizationAnswers = {};
  for (const input of template.customizationInputs ?? []) {
    if (input.defaultValue !== undefined) {
      out[input.key] = input.defaultValue as CustomizationAnswers[string];
    } else {
      // Sensible empty for each type — never undefined, so React inputs stay controlled
      switch (input.type) {
        case "multi_select":
          out[input.key] = [];
          break;
        case "boolean":
          out[input.key] = null;
          break;
        case "number":
          out[input.key] = null;
          break;
        default:
          out[input.key] = "";
      }
    }
  }
  return out;
}

function formatAnswer(
  input: CustomizationInput,
  value: CustomizationAnswers[string],
): string {
  if (value === null || value === undefined || value === "") return "—";

  if (input.type === "multi_select" && Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value
      .map((v) => input.options?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
  }

  if (input.type === "select") {
    const opt = input.options?.find((o) => o.value === String(value));
    return opt?.label ?? String(value);
  }

  if (input.type === "boolean") {
    return value === true ? "Yes" : "No";
  }

  return String(value);
}
