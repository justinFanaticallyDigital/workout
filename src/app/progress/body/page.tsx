import { redirect } from "next/navigation";

/** /progress/body moved to /stats/body (v2). */
export default function ProgressRedirect(): never {
  redirect("/stats/body");
}
