/**
 * 5.1 — Universal Shelf · /shelf. Server entry: maps the live
 * `programTemplates` registry into a lightweight, serializable catalog and
 * hands it to the client grid/filter (ShelfClient). The registry pulls
 * server-only deps, so the mapping stays on the server.
 */
import { programTemplates } from "@/lib/program-templates";
import ShelfClient, { type ShelfItem } from "./_client";

export const dynamic = "force-dynamic";

export default function ShelfPage() {
  const catalog: ShelfItem[] = programTemplates.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    weeks: t.durationWeeks,
    daysPerWeek: t.defaultDaysPerWeek,
    level: t.experienceLevel,
    equipment: t.equipment,
    periodization: t.periodization,
    goals: Object.keys(t.goalWeighting),
    goalWeighting: t.goalWeighting,
    sessionMin: t.sessionLengthMin,
    sessionMax: t.sessionLengthMax,
  }));

  return <ShelfClient catalog={catalog} />;
}
