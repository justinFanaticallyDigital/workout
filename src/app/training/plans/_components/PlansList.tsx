"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card, CardStrip, Chev, DayHeader, ScreenHeader, SectionHeader, Seg, Sheet, Stamp, StatusStamp, type PlanStatus } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtMonthDay } from "@/lib/dates";
import { plural } from "@/lib/training";

export interface PlanRowData {
  id: string;
  name: string;
  status: string;
  days: number;
  startDate: string;
}

export interface PremadeData {
  slug: string;
  name: string;
  meta: string;
  description: string;
  days: { index: number; name: string; lines: string[] }[];
}

interface PlansListProps {
  plans: PlanRowData[];
  premade: PremadeData[];
}

export default function PlansList({ plans, premade }: PlansListProps) {
  const router = useRouter();
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  const active = plans.filter((p) => p.status === "active");
  const paused = plans.filter((p) => p.status === "paused");
  const completed = plans.filter((p) => p.status === "completed");

  const clonePremade = async (slug: string) => {
    setCloning(slug);
    try {
      const res = await fetch("/api/programs/clone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateSlug: slug }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      toast.success(`${data.name} added to Training`);
      router.push(`/training/${data.programId}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add that plan.");
      setCloning(null);
    }
  };

  return (
    <div className="pb-6">
      <ScreenHeader title="Plans" back={{ href: "/training", label: "Training" }} right={<Stamp>{active.length} active</Stamp>} />

      <div className="px-5 pb-[18px]">
        <div className="flex items-center gap-3 rounded-ft-lg border-[1.6px] border-dashed border-ft-accent/40 bg-ft-accent/[.12] px-4 py-3.5">
          <span className="font-data text-[22px] leading-none text-ft-accent">+</span>
          <div className="min-w-0 flex-1">
            <div className="font-data text-[14px] font-bold text-ft-accent">New plan</div>
            <div className="font-body text-[12.5px] text-ft-light">Blank, or duplicate an existing plan</div>
          </div>
          <Btn small onClick={() => setCreateOpen(true)}>
            Create
          </Btn>
        </div>
      </div>

      {premade.length > 0 ? (
        <>
          <SectionHeader title="Pre-made" stamp={plural(premade.length, "plan")} />
          <div className="flex flex-col gap-2.5 px-5">
            {premade.map((t) => (
              <PremadeCard key={t.slug} data={t} open={openSlug === t.slug} onToggle={() => setOpenSlug(openSlug === t.slug ? null : t.slug)} busy={cloning === t.slug} onUse={() => clonePremade(t.slug)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeader title="Pre-made" stamp="Not seeded" />
          <div className="px-5 font-body text-[13px] text-ft-dim">Run the template seed to add the pre-made plans.</div>
        </>
      )}

      {active.length > 0 && <StatusSection title="Active" rows={active} />}
      {paused.length > 0 && <StatusSection title="Paused" rows={paused} dimmed />}
      {completed.length > 0 && <StatusSection title="Completed" rows={completed} dimmed />}

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} plans={plans} />
    </div>
  );
}

function StatusSection({ title, rows, dimmed = false }: { title: string; rows: PlanRowData[]; dimmed?: boolean }) {
  return (
    <>
      <SectionHeader title={title} className="mt-[22px]" />
      <div className="flex flex-col gap-2.5 px-5">
        {rows.map((p) => (
          <Link key={p.id} href={`/training/${p.id}`}>
            <Card band={!dimmed} className={["flex items-center gap-3 px-4 py-3.5", dimmed ? "opacity-75" : ""].join(" ")}>
              <div className="min-w-0 flex-1">
                <div className="truncate font-data text-[15px] font-bold text-ft-white">{p.name}</div>
                <div className="mt-[3px] font-data text-[11.5px] uppercase tracking-[0.04em] text-ft-dim">
                  {plural(p.days, "day")} · {p.status === "active" ? "started" : p.status} {fmtMonthDay(p.startDate)}
                </div>
              </div>
              <StatusStamp status={p.status as PlanStatus} />
              <span className="font-data text-[14px] text-ft-dim">›</span>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

function PremadeCard({ data, open, onToggle, busy, onUse }: { data: PremadeData; open: boolean; onToggle: () => void; busy: boolean; onUse: () => void }) {
  return (
    <Card className="px-4 py-3.5">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-2.5 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="truncate font-data text-[15px] font-bold text-ft-white">{data.name}</div>
          <div className="mt-[3px] font-data text-[11.5px] uppercase tracking-[0.04em] text-ft-dim">{data.meta}</div>
        </div>
        <span className="t-link inline-flex items-center gap-1 !tracking-[0.12em]">
          More info <Chev open={open} className="!text-ft-accent" />
        </span>
      </button>
      {open && (
        <div className="mt-2.5">
          <p className="font-body text-[13px] leading-[1.45] text-ft-light">{data.description}</p>
          <CardStrip inset className="mt-2.5">
            {data.days.map((d) => (
              <div key={d.index} className="w-[150px] flex-shrink-0 rounded-ft-md border border-ft-border bg-ft-surface-raised px-[11px] py-2.5">
                <DayHeader day={d.index} name={d.name} size="mini" />
                <div className="mt-[5px] flex flex-col gap-[2px]">
                  {d.lines.map((l, i) => (
                    <div key={i} className="truncate font-body text-[11.5px] text-ft-light">
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardStrip>
          <div className="mt-3 flex justify-end">
            <Btn small onClick={onUse} disabled={busy}>
              {busy ? "Adding…" : "Use plan"}
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function CreateSheet({ open, onClose, plans }: { open: boolean; onClose: () => void; plans: PlanRowData[] }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"blank" | "duplicate">("blank");
  const [sourceId, setSourceId] = useState<string | null>(plans[0]?.id ?? null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const n = name.trim();
    if (!n || busy) return;
    if (mode === "duplicate" && !sourceId) return;
    setBusy(true);
    try {
      const res =
        mode === "blank"
          ? await fetch("/api/programs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n }) })
          : await fetch(`/api/programs/${sourceId}/duplicate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const id = data.programId ?? data.id;
      router.push(`/training/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the plan.");
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New plan"
      footer={
        <Btn fullWidth onClick={submit} disabled={!name.trim() || busy || (mode === "duplicate" && !sourceId)}>
          {busy ? "Creating…" : mode === "blank" ? "Create blank plan" : "Duplicate plan"}
        </Btn>
      }
    >
      <div className="t-eyebrow mb-1">Name</div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Upper / Lower"
        className="w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent"
      />
      <div className="t-eyebrow mt-4 mb-1.5">Start from</div>
      <Seg
        options={[
          { value: "blank", label: "Blank" },
          { value: "duplicate", label: "Duplicate" },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === "duplicate" && (
        <ul className="mt-3 divide-y divide-ft-border-faint">
          {plans.length === 0 && <li className="py-3 font-body text-[13px] text-ft-dim">No plans to duplicate yet.</li>}
          {plans.map((p) => {
            const on = p.id === sourceId;
            return (
              <li key={p.id}>
                <button type="button" onClick={() => setSourceId(p.id)} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <span className={["h-4 w-4 rounded-full border-[1.5px]", on ? "border-ft-accent bg-ft-accent" : "border-ft-border"].join(" ")} />
                  <span className="min-w-0 flex-1 truncate font-data text-[13.5px] font-semibold text-ft-white">{p.name}</span>
                  <span className="font-data text-[10.5px] uppercase tracking-[0.1em] text-ft-dim">{plural(p.days, "day")}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
