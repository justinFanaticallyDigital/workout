import { redirect } from "next/navigation";

/**
 * Legacy /injuries. Per fittrack-v2-spec.md §10, the injury tracker
 * lives under Stats as /stats/injuries.
 */
export default function InjuriesRedirect(): never {
  redirect("/stats/injuries");
}
