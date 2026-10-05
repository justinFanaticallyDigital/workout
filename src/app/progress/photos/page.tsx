import { redirect } from "next/navigation";

/** /progress/photos moved to /stats/photos (v2). */
export default function ProgressRedirect(): never {
  redirect("/stats/photos");
}
