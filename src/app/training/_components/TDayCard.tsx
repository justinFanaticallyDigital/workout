"use client";

import { useRouter } from "next/navigation";
import { Btn, Card, CheckIcon, DayHeader } from "@/components/kit";
import { fmtStamp } from "@/lib/dates";
import { exerciseLine, type PlanDay } from "@/lib/training";

interface TDayCardProps {
  planId: string;
  day: PlanDay;
  index: number;
  /** ISO date of a finished session for this day in the current week. */
  completedOn?: string;
}

/** Training day card — Start goes straight to the logger; the body opens day detail. */
export default function TDayCard({ planId, day, index, completedOn }: TDayCardProps) {
  const router = useRouter();
  const lines = day.exercises.slice(0, 3);
  const more = day.exercises.length - lines.length;
  const detail = `/training/${planId}/${day.id}`;
  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={() => router.push(detail)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(detail);
      }}
      className="flex w-[250px] flex-shrink-0 cursor-pointer flex-col gap-2.5 px-4 pb-3.5 pt-4"
    >
      <DayHeader
        day={index}
        name={day.name}
        right={
          completedOn ? (
            <span className="inline-flex flex-shrink-0 items-center gap-[5px] rounded-full border border-ft-success-border bg-ft-success-bg py-[2px] pl-1.5 pr-[9px]">
              <span className="inline-flex h-[13px] w-[13px] items-center justify-center rounded-full bg-ft-success text-ft-on-accent">
                <CheckIcon size={9} />
              </span>
              <span className="font-data text-[9px] font-bold tracking-[0.12em] text-ft-success-fg">{fmtStamp(completedOn)}</span>
            </span>
          ) : undefined
        }
      />
      <div className="flex min-h-[66px] flex-col gap-1">
        {lines.map((e) => (
          <div key={e.id} className="truncate font-body text-[13.5px] text-ft-light">
            {exerciseLine(e)}
          </div>
        ))}
        {more > 0 && <div className="font-data text-[11.5px] text-ft-dim">+ {more} more</div>}
        {day.exercises.length === 0 && <div className="font-body text-[13px] text-ft-dim">No exercises yet</div>}
      </div>
      <Btn small fullWidth href={`/log/${day.id}`} onClick={(e) => e.stopPropagation()}>
        Start
      </Btn>
    </Card>
  );
}
