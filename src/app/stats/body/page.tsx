"use client";

/** Body metrics — weight and body-fat entries with a trend, logged by hand or synced from Fitbit. */
import { useEffect, useMemo, useState } from "react";
import { Btn, Card, ScreenHeader, Seg, Sheet, Stamp, StatCard, TrendLine } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { authCheck } from "@/lib/fetch-helpers";
import { fmtMonthDay } from "@/lib/dates";
import { fmtNum, monthLabels } from "@/lib/stats";

interface WeightEntry {
  id: string;
  date: string;
  weight: number | null;
  bodyFatPct: number | null;
  source: string;
  notes: string | null;
}

const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-data text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";
const today = () => new Date().toISOString().slice(0, 10);

export default function BodyMetricsPage() {
  const toast = useToast();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"weight" | "bodyfat">("weight");
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = () =>
    fetch("/api/progress/weight")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => setEntries((data.entries ?? []).map((e: WeightEntry) => ({ ...e, weight: e.weight == null ? null : Number(e.weight), bodyFatPct: e.bodyFatPct == null ? null : Number(e.bodyFatPct) }))))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  useEffect(() => {
    fetchEntries();
  }, []);

  const save = async () => {
    if (!weight || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress/weight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, weight: parseFloat(weight), bodyFatPct: bodyFat ? parseFloat(bodyFat) : null, notes: notes.trim() || null }) });
      if (!res.ok) throw new Error();
      setFormOpen(false);
      setWeight("");
      setBodyFat("");
      setNotes("");
      setDate(today());
      toast.success("Logged");
      await fetchEntries();
    } catch {
      toast.error("Couldn't log the entry.");
    }
    setSaving(false);
  };

  // Entries arrive oldest → newest.
  const series = useMemo(() => {
    const rows = entries.filter((e) => (mode === "weight" ? e.weight != null : e.bodyFatPct != null)).slice(-40);
    return { pts: rows.map((e) => (mode === "weight" ? Number(e.weight) : Number(e.bodyFatPct))), labels: monthLabels(rows.map((e) => new Date(e.date))), first: rows[0], last: rows[rows.length - 1] };
  }, [entries, mode]);
  const hasBodyFat = entries.some((e) => e.bodyFatPct != null);
  const latest = entries.length ? entries[entries.length - 1] : null;
  const change = series.pts.length > 1 ? series.pts[series.pts.length - 1] - series.pts[0] : null;
  const unit = mode === "weight" ? "lb" : "%";

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Body metrics"
        back={{ href: "/stats", label: "Stats" }}
        sub={loading ? undefined : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}${entries.some((e) => e.source === "fitbit") ? " · Fitbit synced" : ""}`}
        right={
          <Btn small onClick={() => setFormOpen(true)}>
            + Log
          </Btn>
        }
      />
      <div className="flex flex-col gap-3 px-5">
        <StatCard
          label="Trend"
          right={
            hasBodyFat ? (
              <Seg
                className="!w-[150px]"
                options={[
                  { value: "weight", label: "Weight" },
                  { value: "bodyfat", label: "BF %" },
                ]}
                value={mode}
                onChange={setMode}
              />
            ) : undefined
          }
        >
          {latest && (
            <div className="mb-2 flex items-baseline gap-1.5">
              <div className="font-data text-[30px] font-bold leading-none text-ft-white">{mode === "weight" ? (latest.weight != null ? fmtNum(latest.weight) : "—") : series.last?.bodyFatPct != null ? fmtNum(series.last.bodyFatPct) : "—"}</div>
              <div className="font-data text-[11px] uppercase text-ft-dim">{unit}</div>
            </div>
          )}
          {series.pts.length > 1 ? (
            <TrendLine pts={series.pts} w={330} h={80} labels={series.labels} fmt={(v) => `${fmtNum(v)} ${unit}`} title={mode === "weight" ? "Body weight" : "Body fat"} />
          ) : (
            <div className="font-body text-[12.5px] text-ft-dim">{entries.length === 0 ? "No entries yet — log your first weight." : "Log another entry to see the trend."}</div>
          )}
          {change !== null && series.first && (
            <div className="mt-1.5 font-data text-[11px] text-ft-light">
              {change > 0 ? "+" : change < 0 ? "−" : ""}
              {fmtNum(Math.abs(change))} {unit} since {fmtMonthDay(series.first.date)}
            </div>
          )}
        </StatCard>

        {entries.length > 0 && (
          <Card band={false} className="px-4 py-1">
            {[...entries].reverse().map((e, i, arr) => (
              <div key={e.id} className={["flex items-center gap-2.5 py-2.5", i < arr.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                <div className="w-[56px] font-data text-[11.5px] text-ft-dim">{fmtMonthDay(e.date)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-data text-[13.5px] font-bold text-ft-white">
                    {e.weight != null ? `${fmtNum(e.weight)} lb` : "—"}
                    {e.bodyFatPct != null && <span className="ml-2 font-medium text-ft-light">{fmtNum(e.bodyFatPct)}%</span>}
                  </div>
                  {e.notes && <div className="truncate font-body text-[11.5px] text-ft-dim">{e.notes}</div>}
                </div>
                {e.source !== "manual" && <Stamp tone="muted">{e.source}</Stamp>}
              </div>
            ))}
          </Card>
        )}
      </div>

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Log weight"
        footer={
          <Btn fullWidth onClick={save} disabled={!weight || saving}>
            {saving ? "Saving…" : "Log entry"}
          </Btn>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Date</span>
            <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Weight (lb)</span>
            <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ""))} placeholder="185.0" autoFocus className={inputCls} />
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Body fat %</span>
            <input inputMode="decimal" value={bodyFat} onChange={(e) => setBodyFat(e.target.value.replace(/[^\d.]/g, ""))} placeholder="Optional" className={inputCls} />
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Notes</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={inputCls} />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
