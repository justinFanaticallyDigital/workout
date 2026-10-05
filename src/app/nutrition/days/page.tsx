import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-helpers";
import { SAVED_DAY_INCLUDE } from "@/lib/api/saved-days";
import { toDayView } from "@/lib/nutrition-view";
import MyDays from "./_components/MyDays";

export const dynamic = "force-dynamic";

/** My Days — saved days with their meals, each usable in a plan. */
export default async function MyDaysPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/signin");
  const days = await prisma.savedDay.findMany({ where: { userId }, include: SAVED_DAY_INCLUDE, orderBy: { updatedAt: "desc" } });
  return <MyDays days={days.map(toDayView)} />;
}
