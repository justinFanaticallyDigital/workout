"use client";

/** Injury tracker — active issues with follow-up notes, resolved history below. */
import { useEffect, useState } from "react";
import { Btn, Card, ScreenHeader, SectionHeader, Sheet, Stamp, type StampTone } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { authCheck } from "@/lib/fetch-helpers";
import { fmtMonthDay } from "@/lib/dates";

interface InjuryNote {
  id: string;
  date: string;
  note: string;
  treatment: string | null;
}
interface Injury {
  id: string;
  bodyPart: string;
  description: string | null;
  severity: string;
  status: string;
  onsetDate: string;
  resolvedDate: string | null;
  notes: InjuryNote[];
}

const SEVERITIES = ["tweak", "mild", "moderate", "severe"];
const BODY_PARTS = ["Shoulder", "Elbow", "Wrist", "Hand", "Upper Back", "Lower Back", "Neck", "Hip", "Knee", "Ankle", "Foot", "Chest", "Quad", "Hamstring", "Calf", "Glute", "Bicep", "Tricep", "Forearm", "Shin"];
const SEVERITY_TONE: Record<string, StampTone> = { tweak: "muted", mild: "gold", moderate: "gold", severe: "coral" };
const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";
const today = () => new Date().toISOString().slice(0, 10);

export default function InjuriesPage() {
  const toast = useToast();
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [bodyPart, setBodyPart] = useState("Shoulder");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("tweak");
  const [onsetDate, setOnsetDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [noteFor, setNoteFor] = useState<Injury | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteTreatment, setNoteTreatment] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchInjuries = () =>
    fetch("/api/injuries")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => setInjuries(data.injuries ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  useEffect(() => {
    fetchInjuries();
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/injuries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bodyPart, description: description.trim() || null, severity, onsetDate }) });
      if (!res.ok) throw new Error();
      setFormOpen(false);
      setDescription("");
      setSeverity("tweak");
      toast.success("Logged");
      await fetchInjuries();
    } catch {
      toast.error("Couldn't log the injury.");
    }
    setSaving(false);
  };
  const saveNote = async () => {
    if (!noteFor || !noteText.trim() || savingNote) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/injuries/${noteFor.id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: noteText.trim(), treatment: noteTreatment.trim() || null }) });
      if (!res.ok) throw new Error();
      setNoteFor(null);
      setNoteText("");
      setNoteTreatment("");
      await fetchInjuries();
    } catch {
      toast.error("Couldn't add the note.");
    }
    setSavingNote(false);
  };

  const active = injuries.filter((i) => i.status !== "resolved");
  const resolved = injuries.filter((i) => i.status === "resolved");

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Injuries"
        back={{ href: "/stats", label: "Stats" }}
        sub={loading ? undefined : active.length ? `${active.length} active` : "Nothing active"}
        right={
          <Btn small onClick={() => setFormOpen(true)}>
            + Log
          </Btn>
        }
      />
      <div className="flex flex-col gap-2.5 px-5">
        {!loading && active.length === 0 && (
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No active injuries</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Log tweaks as they happen so you can see what recurs.</p>
          </Card>
        )}
        {active.map((inj) => (
          <Card key={inj.id} className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 font-data text-[14.5px] font-bold text-ft-white">{inj.bodyPart}</div>
              <Stamp tone={SEVERITY_TONE[inj.severity] ?? "muted"}>{inj.severity}</Stamp>
              {inj.status !== "active" && <Stamp tone="muted">{inj.status}</Stamp>}
            </div>
            <div className="mt-0.5 font-data text-[11px] text-ft-dim">Since {fmtMonthDay(inj.onsetDate)}</div>
            {inj.description && <p className="mt-1.5 font-body text-[13px] text-ft-light">{inj.description}</p>}
            {inj.notes.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1.5 border-t border-ft-border-faint pt-2.5">
                {inj.notes.map((n) => (
                  <div key={n.id} className="border-l-2 border-ft-border pl-2.5">
                    <div className="font-body text-[12.5px] text-ft-white">{n.note}</div>
                    <div className="font-data text-[10px] text-ft-dim">
                      {fmtMonthDay(n.date)}
                      {n.treatment ? ` · ${n.treatment}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2.5 flex justify-end">
              <button type="button" onClick={() => setNoteFor(inj)} className="t-link">
                + Add note
              </button>
            </div>
          </Card>
        ))}

        {resolved.length > 0 && (
          <>
            <SectionHeader title="Resolved" stamp={String(resolved.length)} className="mt-3 !px-0" />
            <Card band={false} className="px-4 py-1">
              {resolved.map((inj, i) => (
                <div key={inj.id} className={["flex items-center gap-2.5 py-2.5", i < resolved.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
                  <div className="min-w-0 flex-1">
                    <div className="font-data text-[13px] font-semibold text-ft-white">{inj.bodyPart}</div>
                    <div className="font-data text-[10.5px] text-ft-dim">
                      {fmtMonthDay(inj.onsetDate)} — {inj.resolvedDate ? fmtMonthDay(inj.resolvedDate) : "?"}
                    </div>
                  </div>
                  <Stamp tone="success">Resolved</Stamp>
                </div>
              ))}
            </Card>
          </>
        )}
      </div>

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Log injury"
        footer={
          <Btn fullWidth onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Log injury"}
          </Btn>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Body part</span>
            <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} className={inputCls}>
              {BODY_PARTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Severity</span>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputCls}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Onset</span>
            <input type="date" value={onsetDate} max={today()} onChange={(e) => setOnsetDate(e.target.value)} className={inputCls} />
          </label>
          <label className="col-span-2 block">
            <span className="t-eyebrow mb-1 block !text-[9px]">What happened</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={inputCls} />
          </label>
        </div>
      </Sheet>

      <Sheet
        open={noteFor !== null}
        onClose={() => setNoteFor(null)}
        title={noteFor ? `Note · ${noteFor.bodyPart}` : ""}
        footer={
          <Btn fullWidth onClick={saveNote} disabled={!noteText.trim() || savingNote}>
            {savingNote ? "Saving…" : "Add note"}
          </Btn>
        }
      >
        <div className="flex flex-col gap-2">
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Update</span>
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="How does it feel today?" autoFocus className={inputCls} />
          </label>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Treatment</span>
            <input value={noteTreatment} onChange={(e) => setNoteTreatment(e.target.value)} placeholder="Optional" className={inputCls} />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
