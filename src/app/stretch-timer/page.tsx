import { redirect } from "next/navigation";

/**
 * Legacy /stretch-timer. Per fittrack-v2-spec.md §5, full-screen
 * stretch timer relocates to /log/stretch-timer.
 */
export default function StretchTimerRedirect(): never {
  redirect("/log/stretch-timer");
}
