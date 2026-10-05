import { redirect } from "next/navigation";

/** Root entry — the Training tab is home. */
export default function RootRedirect(): never {
  redirect("/training");
}
