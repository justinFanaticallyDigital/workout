/**
 * 5.6 — Fallback questionnaire / plan matcher · /shelf/match (Cluster 5).
 *
 * The "Not sure? Answer questions" path off the Shelf. A short guided
 * questionnaire ranks the live `programTemplates` catalog client-side and
 * recommends the best fit. Server maps the registry to the lightweight
 * matcher catalog; ranking + UI live in the client.
 */
import { programTemplates } from "@/lib/program-templates";
import MatchClient, { type MatchItem } from "./_client";

export const dynamic = "force-dynamic";

export default function MatchPage() {
  const catalog: MatchItem[] = programTemplates.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    level: t.experienceLevel,
    equipment: t.equipment,
    daysMin: t.daysPerWeekRange[0],
    daysMax: t.daysPerWeekRange[1],
    goalWeighting: t.goalWeighting,
  }));
  return <MatchClient catalog={catalog} />;
}
