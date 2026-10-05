import { redirect } from "next/navigation";

/** /progress moved to /stats (v2). Sub-pages move in P8. */
export default function ProgressRedirect(): never {
  redirect("/stats");
}
