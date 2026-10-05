import Link from "next/link";
import { Card } from "@/components/kit";
import type { FrameSummary } from "./TrainingView";

/** Saved workout template. Tapping starts it (pre-fills the logger). */
export default function FrameCard({ frame }: { frame: FrameSummary }) {
  return (
    <Link href={`/log/frame/${frame.id}`} className="flex-shrink-0">
      <Card band={false} className="flex h-[120px] w-[128px] flex-col px-3 pb-2.5 pt-3">
        <div className="line-clamp-2 font-data text-[13px] font-bold leading-[1.25] text-ft-white">{frame.name}</div>
        {frame.focus && <div className="mt-[3px] truncate font-body text-[12px] text-ft-dim">{frame.focus}</div>}
        <div className="flex-1" />
        <div className="font-data text-[10.5px] uppercase tracking-[0.1em] text-ft-accent">{frame.exerciseCount} exercises</div>
      </Card>
    </Link>
  );
}
