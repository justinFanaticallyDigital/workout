"use client";

import Link from "next/link";
import { AddCard, BarRow, Btn, Orbit, PhotoSlot, ScreenHeader, Stamp, StatCard, TrendLine } from "@/components/kit";
import { GROUP_BG, GROUP_LABEL, type CategoryGroup } from "@/lib/categories";
import { fmtLb, fmtNum } from "@/lib/stats";

export interface StatsData {
  monthLabel: string; // "Sep 2026"
  monthAbbr: string; // "SEP"
  bucketLabels: string[]; // W1 … W5
  trainedDays: number;
  dayBars: number[];
  weight: { latest: number; pts: number[]; delta: number | null; bf: number | null; entries: number; lastStamp: string } | null;
  volume: { total: number; bars: number[]; split: { g: CategoryGroup; pct: number }[] };
  prs: { id: string; exerciseId: string; name: string; value: string; stamp: string }[];
  photos: { id: string; stamp: string; src: string }[];
}

/** Stats tab — days trained · body weight · volume · recent PRs · photos. Descriptive only. */
export default function StatsView({ data }: { data: StatsData }) {
  const { weight, volume } = data;
  return (
    <div className="pb-8">
      <ScreenHeader title="Stats" right={<Stamp>{data.monthLabel}</Stamp>} />
      <div className="flex flex-col gap-3 px-5">
        <div className="flex gap-3">
          <StatCard label="Days trained" className="min-w-0 flex-1" right={<MiniLink href="/stats/calendar">Cal</MiniLink>}>
            <div className="flex items-baseline gap-1.5">
              <div className="font-data text-[30px] font-bold leading-none text-ft-white">{data.trainedDays}</div>
              <div className="font-data text-[11px] text-ft-dim">/ {data.monthAbbr}</div>
            </div>
            <BarRow bars={data.dayBars} h={40} labels={data.bucketLabels} fmt={(v) => `${v} ${v === 1 ? "day" : "days"}`} title="Days trained per week" className="mt-2" />
          </StatCard>
          <StatCard label="Body weight" className="min-w-0 flex-1" right={<MiniLink href="/stats/body">Log</MiniLink>}>
            {weight ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <div className="font-data text-[30px] font-bold leading-none text-ft-white">{fmtNum(weight.latest)}</div>
                  <div className="font-data text-[11px] text-ft-dim">LB</div>
                </div>
                <TrendLine pts={weight.pts} w={140} h={46} fmt={(v) => `${fmtNum(v)} lb`} title="Body weight, last 30 days" className="mt-1" />
                <div className="mt-0.5 font-data text-[11px] text-ft-light">
                  {weight.delta !== null ? `${weight.delta > 0 ? "+" : weight.delta < 0 ? "−" : ""}${fmtNum(Math.abs(weight.delta))} lb · 30 days` : weight.entries === 1 ? "1 entry · 30 days" : `Last ${weight.lastStamp}`}
                  {weight.bf !== null ? ` · BF ${fmtNum(weight.bf)}%` : ""}
                </div>
              </>
            ) : (
              <div className="font-body text-[13px] text-ft-light">
                No entries yet.{" "}
                <Link href="/stats/body" className="t-link">
                  Log weight ›
                </Link>
              </div>
            )}
          </StatCard>
        </div>

        <StatCard
          label="Volume"
          right={
            <span className="font-data text-[12px] font-bold text-ft-white">
              {fmtLb(volume.total)} <span className="font-medium text-ft-dim">LB / {data.monthAbbr}</span>
            </span>
          }
        >
          <BarRow bars={volume.bars} h={52} labels={data.bucketLabels} fmt={(v) => `${fmtLb(v)} lb`} title="Volume per week" />
          {volume.split.length > 0 && (
            <>
              <div className="mt-3 flex h-2.5 gap-[2px] overflow-hidden rounded-[5px]" role="img" aria-label={volume.split.map(({ g, pct }) => `${GROUP_LABEL[g]} ${pct}%`).join(", ")}>
                {volume.split.map(({ g, pct }) => (
                  <div key={g} className={`${GROUP_BG[g]} first:rounded-l-[5px] last:rounded-r-[5px]`} style={{ width: `${pct}%` }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {volume.split.map(({ g, pct }) => (
                  <span key={g} className="inline-flex items-center gap-[5px] font-data text-[10.5px] text-ft-light">
                    <span className={`h-[7px] w-[7px] rounded-full ${GROUP_BG[g]}`} />
                    {GROUP_LABEL[g]} {pct}%
                  </span>
                ))}
              </div>
            </>
          )}
          {volume.total === 0 && <div className="mt-2 font-body text-[12.5px] text-ft-dim">No lifting logged this month.</div>}
        </StatCard>

        <StatCard label="Recent PRs" right={<MiniLink href="/stats/prs">All</MiniLink>}>
          {data.prs.length === 0 && <div className="font-body text-[12.5px] text-ft-dim">PRs appear here as you log heavier or longer sets.</div>}
          <div className="-mt-1">
            {data.prs.map((pr, i) => (
              <div key={pr.id} className={["flex items-center gap-2.5 py-[9px]", i < data.prs.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                <Stamp tone="coral">PR</Stamp>
                <Link href={`/stats/exercise/${pr.exerciseId}`} className="min-w-0 flex-1 truncate font-data text-[13.5px] font-semibold text-ft-white">
                  {pr.name}
                </Link>
                <div className="font-data text-[13.5px] font-bold text-ft-white">{pr.value}</div>
                <div className="w-[52px] text-right font-data text-[11px] text-ft-dim">{pr.stamp}</div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard label="Progress photos" right={<MiniLink href="/stats/photos">All</MiniLink>}>
          <div className="flex gap-2">
            {data.photos.map((p) => (
              <PhotoSlot key={p.id} label={p.stamp} src={p.src} href="/stats/photos" />
            ))}
            <AddCard label="Add" w={72} h={104} href="/stats/photos" />
          </div>
        </StatCard>

        <div className="flex items-center gap-3 rounded-ft-lg border-[1.6px] border-dashed border-ft-border px-4 py-3">
          <Orbit size={20} className="text-ft-dim" />
          <div className="min-w-0 flex-1">
            <div className="font-data text-[12.5px] font-bold text-ft-light">External tracker</div>
            <div className="font-body text-[12px] text-ft-dim">Steps · sleep · HR — not connected</div>
          </div>
          <Btn kind="quiet" small href="/settings/integrations">
            Connect
          </Btn>
        </div>
      </div>
    </div>
  );
}

function MiniLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-ft-accent">
      {children} ›
    </Link>
  );
}
