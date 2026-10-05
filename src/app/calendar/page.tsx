import { redirect } from "next/navigation";

/**
 * Legacy /calendar. Per fittrack-v2-spec.md §10, the monthly grid
 * lives under Stats as /stats/calendar.
 */
export default function CalendarRedirect(): never {
  redirect("/stats/calendar");
}
