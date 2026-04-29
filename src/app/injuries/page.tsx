import { redirect } from "next/navigation";

/**
 * Legacy /injuries. Per fittrack-v2-spec.md §10, the injury tracker
 * moves under the Progress tab as /progress/injuries.
 */
export default function InjuriesRedirect(): never {
  redirect("/progress/injuries");
}
