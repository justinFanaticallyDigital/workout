import { redirect } from "next/navigation";

/** /progress/calendar moved to /stats/calendar (v2). */
export default function ProgressRedirect(): never {
  redirect("/stats/calendar");
}
