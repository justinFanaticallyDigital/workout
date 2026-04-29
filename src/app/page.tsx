import { redirect } from "next/navigation";

/**
 * Legacy "Today" home. Per fittrack-v2-spec.md §10, `/` redirects to
 * the Gameplan tab — the active Gameplan's Next Action card subsumes
 * the Today view's purpose.
 */
export default function HomeRedirect(): never {
  redirect("/gameplan");
}
