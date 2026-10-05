import { redirect } from "next/navigation";

/** Legacy /log picker. Workouts start from the Training tab (day cards, frames, blank). */
export default function LogIndexRedirect(): never {
  redirect("/training");
}
