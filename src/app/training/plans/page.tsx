import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { getTemplateBySlug } from "@/lib/program-templates";
import { fmtTarget, premadeMeta, stripMeta } from "@/lib/training";
import PlansList, { type PlanRowData, type PremadeData } from "./_components/PlansList";

export const dynamic = "force-dynamic";

const TEMPLATE_USER_EMAIL = "templates@fittrack.system";

/** Plans list — create (blank or duplicate), the 8 pre-made plans, and every plan by status. */
export default async function PlansPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");

  const [mine, premade] = await Promise.all([
    prisma.program.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        createdAt: true,
        blocks: { orderBy: { blockNumber: "asc" }, select: { _count: { select: { days: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.program.findMany({
      where: { user: { email: TEMPLATE_USER_EMAIL }, gameplanKind: { not: null } },
      select: {
        id: true,
        name: true,
        description: true,
        gameplanKind: true,
        blocks: {
          orderBy: { blockNumber: "asc" },
          take: 1,
          select: {
            days: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                exercises: { orderBy: { sortOrder: "asc" }, take: 3, select: { targetSets: true, targetRepRange: true, exercise: { select: { name: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  const rows: PlanRowData[] = mine.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    days: p.blocks[0]?._count.days ?? 0,
    startDate: p.startDate ? p.startDate.toISOString() : p.createdAt.toISOString(),
  }));

  const templatesInOrder = premade
    .map((p) => {
      const t = p.gameplanKind ? getTemplateBySlug(p.gameplanKind) : undefined;
      if (!t) return null;
      const days = p.blocks[0]?.days ?? [];
      const data: PremadeData = {
        slug: t.slug,
        name: p.name,
        meta: premadeMeta(t, days.length),
        description: stripMeta(p.description) ?? t.description,
        days: days.map((d, i) => ({
          index: i + 1,
          name: d.name,
          lines: d.exercises.map((e) => `${e.exercise.name} · ${fmtTarget(e.targetSets, e.targetRepRange, true)}`),
        })),
      };
      return data;
    })
    .filter((x): x is PremadeData => x !== null);

  return <PlansList plans={rows} premade={templatesInOrder} />;
}
