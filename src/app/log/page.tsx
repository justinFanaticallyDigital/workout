import { redirect } from "next/navigation";

/**
 * Legacy /log activity-type picker. Per fittrack-v2-spec.md §6.4,
 * +Log is now an in-place bottom sheet triggered by the BottomNav
 * FAB (LogActivitySheet component). Direct visits to /log land on
 * the Gameplan tab where the FAB lives.
 */
export default function LogIndexRedirect(): never {
  redirect("/gameplan");
}
