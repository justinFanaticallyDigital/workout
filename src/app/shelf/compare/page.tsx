/**
 * 5.3 — Side-by-side compare · /shelf/compare?ids=a,b (Cluster 5).
 *
 * Compares 2–3 catalog plans across the metadata that drives a choice. `ids`
 * selects the plans (slugs); defaults to the first three templates. Backed by
 * the live `programTemplates` registry. Each column links to its card detail.
 */
import Link from "next/link";
import { programTemplates, getTemplateBySlug } from "@/lib/program-templates";
import type { ProgramTemplate } from "@/lib/program-templates/types";
import { Card, Button, Stamp, SectionLabel } from "@/components/v2";
import CompareHeader from "./_header";

export const dynamic = "force-dynamic";

const EQUIP_LABEL: Record<string, string> = {
  full_gym: "Full gym",
  home_dumbbells: "Dumbbells",
  minimal: "Minimal",
};
function goalLabel(g: string): string {
  return g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function topGoal(t: ProgramTemplate): string {
  const e = Object.entries(t.goalWeighting).sort((a, b) => b[1] - a[1])[0];
  return e ? `${goalLabel(e[0])} ${e[1]}%` : "—";
}

export default function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  let picks = ids.map((id) => getTemplateBySlug(id)).filter((t): t is ProgramTemplate => !!t);
  if (picks.length < 2) picks = programTemplates.slice(0, 3);
  picks = picks.slice(0, 3);

  const rows: { label: string; get: (t: ProgramTemplate) => string }[] = [
    { label: "Length", get: (t) => `${t.durationWeeks} wk` },
    { label: "Freq", get: (t) => `${t.daysPerWeekRange[0]}–${t.daysPerWeekRange[1]}/wk` },
    { label: "Session", get: (t) => `${t.sessionLengthMin}–${t.sessionLengthMax}m` },
    { label: "Level", get: (t) => t.experienceLevel },
    { label: "Equip", get: (t) => EQUIP_LABEL[t.equipment] ?? t.equipment },
    { label: "Method", get: (t) => t.periodization },
    { label: "Blocks", get: (t) => String(t.blocks.length) },
    { label: "Top goal", get: (t) => topGoal(t) },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <CompareHeader />
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 88 }}>
        <SectionLabel right={`${picks.length} plans`}>Compare</SectionLabel>

        {/* Name row */}
        <div className="px-4">
          <Card className="overflow-hidden p-0">
            <div className="grid" style={{ gridTemplateColumns: `92px repeat(${picks.length}, 1fr)` }}>
              <div className="border-b border-ft-border-faint px-2.5 py-3" />
              {picks.map((t) => (
                <div key={t.slug} className="border-b border-l border-ft-border-faint px-2.5 py-3">
                  <div className="font-display text-[13.5px] font-bold leading-tight tracking-[-0.01em] text-ft-white">{t.name}</div>
                </div>
              ))}
            </div>

            {rows.map((r, i) => (
              <div
                key={r.label}
                className="grid"
                style={{ gridTemplateColumns: `92px repeat(${picks.length}, 1fr)` }}
              >
                <div className={["px-2.5 py-2.5", i === rows.length - 1 ? "" : "border-b border-ft-border-faint"].join(" ")}>
                  <span className="font-data text-[10px] font-bold uppercase tracking-[0.06em] text-ft-dim">{r.label}</span>
                </div>
                {picks.map((t) => (
                  <div
                    key={t.slug}
                    className={["border-l border-ft-border-faint px-2.5 py-2.5", i === rows.length - 1 ? "" : "border-b"].join(" ")}
                  >
                    <span className="font-body text-[12px] capitalize text-ft-light">{r.get(t)}</span>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </div>

        {/* Per-plan CTAs */}
        <SectionLabel>Open a plan</SectionLabel>
        <div className="flex flex-col gap-2 px-4">
          {picks.map((t) => (
            <Link key={t.slug} href={`/shelf/gameplan/${t.slug}`}>
              <Card className="flex items-center justify-between px-3.5 py-3">
                <div className="min-w-0">
                  <Stamp>{topGoal(t)}</Stamp>
                  <div className="mt-1 font-body text-[13px] font-semibold text-ft-white">{t.name}</div>
                </div>
                <span className="font-body text-[12px] font-bold text-ft-accent">View →</span>
              </Card>
            </Link>
          ))}
        </div>

        <div className="px-4 pt-4">
          <Link href="/shelf" className="block">
            <Button kind="secondary" size="lg" fullWidth>
              Back to Shelf
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
