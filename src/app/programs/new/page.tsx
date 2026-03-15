"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";

export default function NewProgramPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          durationWeeks: durationWeeks ? parseInt(durationWeeks) : null,
          startDate: startDate || null,
          status: "active",
        }),
      });
      if (!res.ok) throw new Error("Failed to create program");
      const program = await res.json();
      router.push(`/programs/${program.id}`);
    } catch {
      alert("Failed to create program. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-2xl mx-auto">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      <h1 className="font-mono text-2xl font-bold tracking-tight mb-6">
        New Program
      </h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <SectionHeader title="Details" />
          <div className="space-y-4">
            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                Program Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Strength Block Q1"
                required
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
              />
            </div>
            <div>
              <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Program goals and overview..."
                rows={3}
                className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-light placeholder:text-ft-muted focus:outline-none focus:border-ft-dim resize-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1.5">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                  placeholder="e.g. 12"
                  min="1"
                  className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link
            href="/programs"
            className="px-4 py-2 text-ft-dim text-sm font-mono hover:text-ft-light transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-ft-white text-ft-bg font-mono text-sm font-bold px-6 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Program"}
          </button>
        </div>
      </form>
    </div>
  );
}
