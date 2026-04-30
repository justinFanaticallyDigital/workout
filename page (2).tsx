"use client";

import Link from "next/link";
import { programTemplates } from "@/lib/program-templates";
import type { ProgramTemplate } from "@/lib/program-templates/types";
import { Card, Tag } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function TemplatesListPage() {
  return (
    <main className="px-4 py-6 pb-24 max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/programs/new"
          className="text-sm text-ft-light hover:text-ft-white font-body"
        >
          ← Program creation
        </Link>
        <h1 className="font-display text-3xl text-ft-white mt-2">
          Pick a program
        </h1>
        <p className="font-body text-base text-ft-light mt-2 leading-relaxed">
          Battle-tested templates. Each one customizes around your bodyweight,
          schedule, and goals.
        </p>
      </div>

      <div className="space-y-4">
        {programTemplates.map((t) => (
          <TemplateCard key={t.slug} template={t} />
        ))}
      </div>
    </main>
  );
}

function TemplateCard({ template }: { template: ProgramTemplate }) {
  const { slug, name, tagline, experienceLevel } = template;
  return (
    <Link
      href={`/programs/new/templates/${slug}/customize`}
      className="block group"
    >
      <Card>
        {/* header: name + level chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl text-ft-white leading-tight">
              {name}
            </h2>
            <p className="font-handwritten text-lg text-ft-light mt-1">
              {tagline}
            </p>
          </div>
          <LevelChip level={experienceLevel} />
        </div>

        {/* meta row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Meta label="Duration" value={`${template.durationWeeks} wk`} />
          <Meta
            label="Days/wk"
            value={formatDaysRange(template.daysPerWeekRange)}
          />
          <Meta
            label="Session"
            value={`${template.sessionLengthMin}–${template.sessionLengthMax} min`}
          />
          <Meta label="Equipment" value={formatEquipment(template.equipment)} />
        </div>

        {/* periodization */}
        {template.periodization && (
          <div className="mt-3">
            <Tag>{template.periodization}</Tag>
          </div>
        )}

        {/* goal weighting bar */}
        {template.goalWeighting && (
          <GoalWeightingBar weights={template.goalWeighting} />
        )}

        {/* CTA */}
        <div className="mt-4">
          <span className="cta-underline font-display text-base text-ft-white inline-block">
            Use this program →
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-body text-xs text-ft-muted uppercase tracking-wide">
        {label}
      </div>
      <div className="font-handwritten text-lg text-ft-white mt-0.5">
        {value}
      </div>
    </div>
  );
}

function LevelChip({ level }: { level: string }) {
  const tone =
    level === "beginner"
      ? "border-ft-success text-ft-success"
      : level === "intermediate"
        ? "border-ft-warn text-ft-warn"
        : "border-ft-danger text-ft-danger";
  return (
    <span
      className={`text-xs font-body uppercase tracking-wider px-2 py-1 border ${tone} rounded-[var(--ft-border-radius,0)] shrink-0`}
    >
      {level}
    </span>
  );
}

function GoalWeightingBar({
  weights,
}: {
  weights: Record<string, number>;
}) {
  const entries = Object.entries(weights).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;

  // Movement-pattern color rotation by goal key — push/pull/legs/core
  // tokens reused so the bar inherits theme accents instead of needing
  // its own palette.
  const colorFor = (key: string): string => {
    const map: Record<string, string> = {
      strength: "bg-ft-push",
      muscle: "bg-ft-legs",
      muscle_preservation: "bg-ft-legs",
      fat_loss: "bg-ft-pull",
      aesthetic: "bg-ft-core",
      cardio: "bg-ft-pull",
      mobility: "bg-ft-core",
      health: "bg-ft-success",
      performance: "bg-ft-push",
    };
    return map[key] ?? "bg-ft-accent";
  };

  return (
    <div className="mt-4">
      <div className="font-body text-xs text-ft-muted uppercase tracking-wide mb-1.5">
        Focus
      </div>
      <div className="flex w-full h-3 overflow-hidden border border-ft-border rounded-[var(--ft-border-radius,0)]">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className={colorFor(key)}
            style={{ width: `${(val / total) * 100}%` }}
            aria-label={`${formatGoalKey(key)}: ${val}%`}
            title={`${formatGoalKey(key)}: ${val}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
        {entries.map(([key, val]) => (
          <span
            key={key}
            className="font-body text-xs text-ft-light flex items-center gap-1"
          >
            <span
              className={`inline-block w-2 h-2 ${colorFor(key)}`}
              aria-hidden
            />
            {formatGoalKey(key)} {val}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ----------------- formatters -----------------

function formatDaysRange(range?: [number, number]): string {
  if (!range) return "—";
  const [a, b] = range;
  return a === b ? `${a}` : `${a}–${b}`;
}

function formatEquipment(eq?: string): string {
  if (!eq) return "—";
  return eq.replace(/_/g, " ");
}

function formatGoalKey(key: string): string {
  return key.replace(/_/g, " ");
}
