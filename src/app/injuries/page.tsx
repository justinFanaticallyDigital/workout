"use client";

import { useState, useEffect } from "react";
import { Card, SectionHeader, Tag, EmptyState } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

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

const SEVERITY_OPTIONS = ["tweak", "mild", "moderate", "severe"];
const BODY_PARTS = [
  "Shoulder", "Elbow", "Wrist", "Hand",
  "Upper Back", "Lower Back", "Neck",
  "Hip", "Knee", "Ankle", "Foot",
  "Chest", "Quad", "Hamstring", "Calf", "Glute",
  "Bicep", "Tricep", "Forearm", "Shin",
];

const severityConfig: Record<string, { classes: string; icon: string }> = {
  tweak: { classes: "bg-ft-dim/20 text-ft-dim", icon: "·" },
  mild: { classes: "bg-ft-warn/20 text-ft-warn", icon: "▴" },
  moderate: { classes: "bg-ft-warn/30 text-ft-warn", icon: "▴▴" },
  severe: { classes: "bg-ft-danger/20 text-ft-danger", icon: "▴▴▴" },
};

export default function InjuriesPage() {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [bodyPart, setBodyPart] = useState("Shoulder");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("tweak");
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  // Add note state
  const [noteInjuryId, setNoteInjuryId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteTreatment, setNoteTreatment] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const toast = useToast();

  const fetchInjuries = () => {
    fetch("/api/injuries")
      .then((res) => res.json())
      .then((data) => {
        setInjuries(data.injuries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInjuries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart,
          description: description.trim() || null,
          severity,
          onsetDate,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowForm(false);
      setDescription("");
      setSeverity("tweak");
      fetchInjuries();
    } catch {
      toast.error("Failed to log injury.");
    }
    setSaving(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInjuryId || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/injuries/${noteInjuryId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: noteText.trim(),
          treatment: noteTreatment.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setNoteInjuryId(null);
      setNoteText("");
      setNoteTreatment("");
      fetchInjuries();
    } catch {
      toast.error("Failed to add note.");
    }
    setSavingNote(false);
  };

  const activeInjuries = injuries.filter((i) => i.status !== "resolved");
  const resolvedInjuries = injuries.filter((i) => i.status === "resolved");

  if (loading) {
    return (
      <div className="min-h-screen bg-ft-bg flex items-center justify-center">
        <p className="text-ft-dim font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ft-bg p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-ft-white tracking-wide">
          Injury Tracker
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Log and monitor injuries, pain levels, and recovery
        </p>
      </div>

      {/* Active Injuries */}
      <Card>
        <SectionHeader
          title="Active Injuries"
          subtitle={activeInjuries.length > 0 ? `${activeInjuries.length} active` : undefined}
          action={
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
            >
              + Log Injury
            </button>
          }
        />

        {/* Add Injury Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-ft-bg rounded border border-ft-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Body Part *
                </label>
                <select
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {BODY_PARTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Onset Date
                </label>
                <input
                  type="date"
                  value={onsetDate}
                  onChange={(e) => setOnsetDate(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened?"
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-ft-dim text-xs font-mono hover:text-ft-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Log Injury"}
              </button>
            </div>
          </form>
        )}

        {activeInjuries.length === 0 && !showForm ? (
          <EmptyState
            title="No active injuries"
            description="Stay healthy — log any issues here to track recovery."
            actionLabel="+ Log Injury"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {activeInjuries.map((injury) => (
              <div key={injury.id} className="border border-ft-card rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-ft-white text-sm font-mono font-bold">
                      {injury.bodyPart}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${severityConfig[injury.severity]?.classes ?? "text-ft-dim"}`}
                      role="img"
                      aria-label={`Severity: ${injury.severity}`}
                    >
                      {severityConfig[injury.severity]?.icon ?? "·"} {injury.severity}
                    </span>
                    <Tag>{injury.status}</Tag>
                  </div>
                  <span className="text-ft-muted text-xs font-mono">
                    {injury.onsetDate}
                  </span>
                </div>
                {injury.description && (
                  <p className="text-ft-dim text-xs font-mono mb-2">
                    {injury.description}
                  </p>
                )}

                {/* Notes */}
                {injury.notes.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {injury.notes.map((n) => (
                      <div key={n.id} className="pl-3 border-l-2 border-ft-card">
                        <p className="text-ft-light text-xs font-mono">{n.note}</p>
                        {n.treatment && (
                          <p className="text-ft-muted text-[10px] font-mono">Tx: {n.treatment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Note */}
                {noteInjuryId === injury.id ? (
                  <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Update note..."
                      required
                      className="flex-1 bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                    />
                    <input
                      type="text"
                      value={noteTreatment}
                      onChange={(e) => setNoteTreatment(e.target.value)}
                      placeholder="Treatment"
                      className="w-28 bg-ft-bg border border-ft-card rounded px-2 py-1 text-xs font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim"
                    />
                    <button
                      type="submit"
                      disabled={savingNote}
                      className="text-ft-success text-xs font-mono font-bold px-2"
                    >
                      {savingNote ? "..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteInjuryId(null)}
                      className="text-ft-dim text-xs font-mono px-2"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setNoteInjuryId(injury.id)}
                    className="mt-2 text-ft-dim text-[10px] font-mono hover:text-ft-light transition-colors"
                  >
                    + Add Note
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolved Injuries */}
      {resolvedInjuries.length > 0 && (
        <Card>
          <SectionHeader title="Resolved" subtitle={`${resolvedInjuries.length} resolved`} />
          <div className="space-y-2">
            {resolvedInjuries.map((injury) => (
              <div key={injury.id} className="flex items-center justify-between py-2 border-b border-ft-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-ft-dim text-xs font-mono">{injury.bodyPart}</span>
                  <span className="text-ft-muted text-[10px] font-mono">{injury.severity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ft-muted text-[10px] font-mono">
                    {injury.onsetDate} — {injury.resolvedDate ?? "?"}
                  </span>
                  <Tag>Resolved</Tag>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
