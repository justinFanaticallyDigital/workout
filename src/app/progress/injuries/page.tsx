import { redirect } from "next/navigation";

/** /progress/injuries moved to /stats/injuries (v2). */
export default function ProgressRedirect(): never {
  redirect("/stats/injuries");
}
