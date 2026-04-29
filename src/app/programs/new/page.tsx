import { redirect } from "next/navigation";

/**
 * Legacy /programs/new picker. Per fittrack-v2-spec.md §10, all
 * /programs/new/* routes are replaced by /gameplan/new (the picker
 * is the v2 onboarding flow).
 */
export default function ProgramsNewRedirect(): never {
  redirect("/gameplan/new");
}
