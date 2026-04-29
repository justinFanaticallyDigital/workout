import { redirect } from "next/navigation";

/**
 * Legacy /programs/new/advanced hub. Per fittrack-v2-spec.md §1
 * (Retires), the advanced hub is replaced by /gameplan/build (the
 * "Build custom Gameplan" wrapper around the existing Program
 * Engine). Legacy entry-paths (builder/generate/goal/templates)
 * remain reachable directly until R12 retires them.
 */
export default function ProgramsNewAdvancedRedirect(): never {
  redirect("/gameplan/build");
}
