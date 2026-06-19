/**
 * 5.2 — Card detail · /shelf/[type]/[slug] (Cluster 5).
 *
 * Conversion page for one catalog plan. `type` (program | gameplan) frames the
 * tier; the content comes from the live `programTemplates` registry. Shows the
 * hero + meta grid + goal weighting + block/day breakdown + what's included,
 * and a Customize CTA that hands off to the existing per-template wizard
 * (/gameplan/new/templates/[slug]/customize) — the Shelf reuses that flow
 * rather than forking a parallel one (MIGRATION_MAP §C5).
 *
 * Full-screen sub-flow: own fixed shell with a back Header; the global
 * BottomNav stays (Shelf is reached from a slot-1 home).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/program-templates";
import { Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import ShelfDetailHeader from "./_header";

export const dynamic = "force-dynamic";

const EQUIP_LABEL: Record<string, string> = {
  full_gym: "Full gym",
  home_dumbbells: "Dumbbells",
  minimal: "Minimal",
};
function goalLabel(g: string): string {
  return g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ShelfDetailPage({
  params,
}: {
  params: { type: string; slug: string };
}) {
  const { type, slug } = params;
  const t = getTemplateBySlug(slug);
  if (!t) notFound();

  const isGameplan = type !== "program";
  const goalEntries = Object.entries(t.goalWeighting).sort((a, b) => b[1] - a[1]);
  const meta: [string, string][] = [
    ["Length", `${t.durationWeeks} weeks`],
    ["Frequency", `${t.daysPerWeekRange[0]}–${t.daysPerWeekRange[1]} days/wk`],
    ["Session", `${t.sessionLengthMin}–${t.sessionLengthMax} min`],
    ["Level", t.experienceLevel],
    ["Equipment", EQUIP_LABEL[t.equipment] ?? t.equipment],
    ["Method", t.periodization],
  ];
  const included: [string, string | undefined][] = [
    ["Cardio", t.cardioGuidance],
    ["Conditioning", t.conditioningGuidance],
    ["Mobility", t.mobilityGuidance],
    ["Lifestyle", t.lifestyleGuidance],
  ];
  const includedRows = included.filter(([, v]) => !!v) as [string, string][];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <ShelfDetailHeader title={t.name} />

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 96 }}>
        {/* Hero */}
        <div className="px-4 pt-3">
          <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
            <div className="flex items-center justify-between">
              <Stamp>{isGameplan ? "Gameplan · adaptive" : "Program · one-time"}</Stamp>
              <Chip tone={isGameplan ? "accent" : "neutral"} size="sm">
                {isGameplan ? "Subscription" : "One-time"}
              </Chip>
            </div>
            <div className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.01em] text-ft-white">{t.name}</div>
            <p className="mt-1.5 font-body text-[13px] leading-snug text-ft-light">{t.tagline}</p>
            <p className="mt-2 font-body text-[12.5px] leading-relaxed text-ft-dim">{t.description}</p>
          </Card>
        </div>

        {/* Meta grid */}
        <SectionLabel>At a glance</SectionLabel>
        <div className="grid grid-cols-2 gap-2 px-4">
          {meta.map(([k, v]) => (
            <Card key={k} className="px-3.5 py-2.5">
              <div className="font-data text-[10px] uppercase tracking-[0.08em] text-ft-dim">{k}</div>
              <div className="mt-0.5 font-body text-[13px] font-semibold capitalize text-ft-white">{v}</div>
            </Card>
          ))}
        </div>

        {/* Goal weighting */}
        <SectionLabel>Focus</SectionLabel>
        <div className="px-4">
          <Card className="px-4 py-3.5">
            <div className="flex h-2 overflow-hidden rounded-full">
              {goalEntries.map(([g, w], i) => (
                <span
                  key={g}
                  className="h-full"
                  style={{ width: `${w}%`, background: i === 0 ? "rgb(var(--ft-accent))" : `rgb(var(--ft-accent) / ${0.6 - i * 0.18})` }}
                />
              ))}
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {goalEntries.map(([g, w]) => (
                <div key={g} className="flex items-center justify-between">
                  <span className="font-body text-[12.5px] text-ft-light">{goalLabel(g)}</span>
                  <span className="font-number text-[12px] font-bold text-ft-white">{w}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Block breakdown */}
        <SectionLabel right={`${t.blocks.length} blocks`}>Structure</SectionLabel>
        <div className="px-4">
          <Card className="overflow-hidden p-0">
            {t.blocks.map((b, i) => (
              <div key={i} className={["flex items-center gap-3 px-3.5 py-3", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}>
                <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ft-surface-alt font-number text-[12px] font-bold text-ft-dim">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-body text-[13px] font-semibold text-ft-white">{b.name}</div>
                  <div className="mt-px font-data text-[10.5px] tracking-[0.03em] text-ft-dim">
                    wk {b.weekStart}–{b.weekEnd} · {b.phase}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Training days */}
        <SectionLabel right={`${t.days.length} days`}>Training days</SectionLabel>
        <div className="px-4">
          <Card className="overflow-hidden p-0">
            {t.days.map((d, i) => (
              <div key={i} className={["flex items-center justify-between px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}>
                <span className="font-body text-[13px] font-semibold text-ft-white">{d.name}</span>
                <span className="font-data text-[10.5px] tracking-[0.03em] text-ft-dim">{d.slots.length} lifts</span>
              </div>
            ))}
          </Card>
        </div>

        {/* What's included */}
        {includedRows.length > 0 && (
          <>
            <SectionLabel>Also included</SectionLabel>
            <div className="flex flex-col gap-2 px-4">
              {includedRows.map(([k, v]) => (
                <Card key={k} className="px-3.5 py-3">
                  <Stamp>{k}</Stamp>
                  <div className="mt-1 font-body text-[12.5px] leading-relaxed text-ft-light">{v}</div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="flex items-center gap-2.5 border-t border-ft-border bg-ft-surface px-4 pb-4 pt-3">
        <Link href="/shelf/compare" className="flex-shrink-0">
          <Button kind="secondary" size="lg">
            Compare
          </Button>
        </Link>
        <Link href={`/checkout?type=${type}&slug=${t.slug}`} className="flex-1">
          <Button kind="primary" size="lg" fullWidth>
            Get this plan →
          </Button>
        </Link>
      </div>
    </div>
  );
}
