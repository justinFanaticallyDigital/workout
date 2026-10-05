import Stamp from "./Stamp";

export type PlanStatus = "active" | "paused" | "completed";

/** Plan status pill — active teal, paused gold, completed muted. */
export default function StatusStamp({ status, className = "" }: { status: PlanStatus; className?: string }) {
  const tone = status === "active" ? "teal" : status === "paused" ? "gold" : "muted";
  return (
    <Stamp tone={tone} className={`!tracking-[0.16em] ${className}`}>
      {status}
    </Stamp>
  );
}
