/**
 * 5.5 — Checkout (Option A · activate without payment) · /checkout?type=&slug=
 *
 * No billing backend, so "purchase" = activate: clone the chosen template to
 * the user (POST /api/programs/clone) and switch the UI-simulated tier. Per
 * flow-rule §7 customization is never a gate — this path activates with
 * template defaults + a start date; the optional Customize wizard is offered
 * as a secondary, post-decision link. Server renders the plan summary from the
 * live registry; the client ActivatePanel owns the clone + redirect.
 */
import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/program-templates";
import { Card, Chip, Stamp, SectionLabel } from "@/components/v2";
import CheckoutHeader from "./_header";
import ActivatePanel from "./_activate";

export const dynamic = "force-dynamic";

const EQUIP_LABEL: Record<string, string> = {
  full_gym: "Full gym",
  home_dumbbells: "Dumbbells",
  minimal: "Minimal",
};

export default function CheckoutPage({ searchParams }: { searchParams: { type?: string; slug?: string } }) {
  const slug = searchParams.slug ?? "";
  const t = getTemplateBySlug(slug);
  if (!t) notFound();
  const type = searchParams.type === "program" ? "program" : "gameplan";
  const isGameplan = type === "gameplan";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <CheckoutHeader />

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 24 }}>
        <SectionLabel>Plan</SectionLabel>
        <div className="px-4">
          <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
            <div className="flex items-center justify-between">
              <Stamp>{isGameplan ? "Gameplan · adaptive" : "Program · one-time"}</Stamp>
              <Chip tone={isGameplan ? "accent" : "neutral"} size="sm">
                {isGameplan ? "Subscription" : "One-time"}
              </Chip>
            </div>
            <div className="mt-1.5 font-display text-xl font-bold leading-tight tracking-[-0.01em] text-ft-white">{t.name}</div>
            <p className="mt-1 font-body text-[12.5px] leading-snug text-ft-light">{t.tagline}</p>
            <div className="mt-2.5 font-data text-[11px] uppercase tracking-[0.05em] text-ft-dim">
              {t.durationWeeks} wk · {t.daysPerWeekRange[0]}–{t.daysPerWeekRange[1]}×/wk · {t.experienceLevel} ·{" "}
              {EQUIP_LABEL[t.equipment] ?? t.equipment}
            </div>
          </Card>
        </div>

        <SectionLabel>What activating does</SectionLabel>
        <div className="px-4">
          <Card className="px-4 py-3.5">
            <div className="flex flex-col gap-2">
              {[
                "Builds your blocks, days + exercises from the template",
                isGameplan ? "Unlocks weekly check-ins + adaptive recommendations" : "Sets up your forward plan to run on your own",
                "Everything is editable in Planning Mode afterward",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
                  <span className="mt-px text-ft-accent">·</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 font-body text-[11px] leading-relaxed text-ft-dim">
              No payment in this build — activation is free while we run the flow end to end.
            </p>
          </Card>
        </div>

        <ActivatePanel slug={t.slug} type={type} customizeHref={`/gameplan/new/templates/${t.slug}/customize`} />
      </div>
    </div>
  );
}
