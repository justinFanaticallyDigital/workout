import { redirect } from "next/navigation";

/** /stats/history → the workout history list. */
export default function StatsHistoryRedirect(): never {
  redirect("/history");
}
