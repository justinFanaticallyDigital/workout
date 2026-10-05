"use client";

/** Progress photos — gallery by date, add by URL, pick two to compare. */
import { useEffect, useState } from "react";
import { Btn, Card, ScreenHeader, Sheet, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { authCheck } from "@/lib/fetch-helpers";
import { fmtMonthDay, fmtStamp } from "@/lib/dates";

interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
  poseType: string;
  notes: string | null;
}

const POSE_TYPES = ["front", "side", "back", "custom"];
const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";
const today = () => new Date().toISOString().slice(0, 10);

export default function ProgressPhotosPage() {
  const toast = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [imageUrl, setImageUrl] = useState("");
  const [poseType, setPoseType] = useState("front");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [compare, setCompare] = useState(false);
  const [picked, setPicked] = useState<ProgressPhoto[]>([]);

  const fetchPhotos = () =>
    fetch("/api/progress/photos")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  useEffect(() => {
    fetchPhotos();
  }, []);

  const save = async () => {
    if (!imageUrl.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress/photos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, imageUrl: imageUrl.trim(), poseType, notes: notes.trim() || null }) });
      if (!res.ok) throw new Error();
      setFormOpen(false);
      setImageUrl("");
      setNotes("");
      setPoseType("front");
      toast.success("Photo added");
      await fetchPhotos();
    } catch {
      toast.error("Couldn't save the photo.");
    }
    setSaving(false);
  };

  const togglePick = (p: ProgressPhoto) => {
    setPicked((cur) => (cur.some((x) => x.id === p.id) ? cur.filter((x) => x.id !== p.id) : cur.length >= 2 ? [cur[1], p] : [...cur, p]));
  };
  const [a, b] = picked;
  const daysApart = a && b ? Math.abs(Math.round((new Date(b.date).getTime() - new Date(a.date).getTime()) / 86_400_000)) : null;

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Photos"
        back={{ href: "/stats", label: "Stats" }}
        sub={loading ? undefined : `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
        right={
          <div className="flex gap-1.5">
            {photos.length >= 2 && (
              <Btn kind={compare ? "primary" : "ghost"} small onClick={() => { setCompare((c) => !c); setPicked([]); }}>
                {compare ? "Done" : "Compare"}
              </Btn>
            )}
            <Btn small onClick={() => setFormOpen(true)}>
              + Add
            </Btn>
          </div>
        }
      />
      <div className="flex flex-col gap-3 px-5">
        {compare && (
          <Card className="px-4 py-3.5">
            <div className="t-eyebrow mb-2">{picked.length < 2 ? `Pick ${picked.length === 0 ? "two photos" : "one more"}` : `${daysApart} days apart`}</div>
            <div className="grid grid-cols-2 gap-3">
              {[a, b].map((p, i) => (
                <div key={i} className="overflow-hidden rounded-ft-md border border-ft-border bg-ft-surface-alt">
                  {p ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={`${p.poseType} ${p.date}`} className="aspect-[3/4] w-full object-cover" />
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="font-data text-[10px] text-ft-dim">{fmtMonthDay(p.date)}</span>
                        <Stamp tone="muted">{p.poseType}</Stamp>
                      </div>
                    </>
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">{i === 0 ? "First" : "Second"}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {!loading && photos.length === 0 && (
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No photos yet</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Add a photo by URL — the same pose on the same day of the month makes the comparison honest.</p>
            <Btn small className="mt-3" onClick={() => setFormOpen(true)}>
              + Add photo
            </Btn>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => {
            const idx = picked.findIndex((x) => x.id === p.id);
            const selected = idx >= 0;
            const tile = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`${p.poseType} ${p.date}`} className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ft-cam-bg/70 to-transparent px-1.5 pb-1.5 pt-5 text-left font-data text-[9px] uppercase tracking-[0.1em] text-ft-cam-text">
                  {fmtStamp(p.date)} · {p.poseType}
                </span>
                {selected && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ft-accent font-data text-[10px] font-bold text-ft-on-accent">{idx + 1}</span>}
              </>
            );
            const cls = ["relative overflow-hidden rounded-ft-md border bg-ft-surface-alt", selected ? "border-ft-accent ring-1 ring-ft-accent" : "border-ft-border"].join(" ");
            return compare ? (
              <button key={p.id} type="button" onClick={() => togglePick(p)} className={cls} aria-pressed={selected}>
                {tile}
              </button>
            ) : (
              <div key={p.id} className={cls} title={p.notes ?? undefined}>
                {tile}
              </div>
            );
          })}
        </div>
      </div>

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add photo"
        footer={
          <Btn fullWidth onClick={save} disabled={!imageUrl.trim() || saving}>
            {saving ? "Saving…" : "Add photo"}
          </Btn>
        }
      >
        <div className="flex flex-col gap-2">
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Image URL</span>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" autoFocus className={inputCls} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="t-eyebrow mb-1 block !text-[9px]">Date</span>
              <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-eyebrow mb-1 block !text-[9px]">Pose</span>
              <select value={poseType} onChange={(e) => setPoseType(e.target.value)} className={inputCls}>
                {POSE_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="t-eyebrow mb-1 block !text-[9px]">Notes</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={inputCls} />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
