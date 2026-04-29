import { redirect } from "next/navigation";

/**
 * Legacy /calendar. Per fittrack-v2-spec.md §10, the monthly grid
 * folds into the Progress tab as /progress/calendar.
 */
export default function CalendarRedirect(): never {
  redirect("/progress/calendar");
}
