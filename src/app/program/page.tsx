import { redirect } from "next/navigation";

/**
 * /program is the legacy metric-targets dashboard. The active-program
 * surface lives at /gameplan now (B2). Any deep links land softly here
 * and forward on so existing bookmarks keep working.
 */
export default function LegacyProgramRedirect(): never {
  redirect("/gameplan");
}
