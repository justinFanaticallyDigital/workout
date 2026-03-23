"use client";

import { useState, useEffect } from "react";
import { Card, SectionHeader, Tag, EmptyState } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { authCheck } from "@/lib/fetch-helpers";

interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
  poseType: string;
  notes: string | null;
}

const POSE_TYPES = ["front", "side", "back", "custom"];

export default function ProgressPhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [poseType, setPoseType] = useState("front");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState<ProgressPhoto | null>(null);
  const [compareRight, setCompareRight] = useState<ProgressPhoto | null>(null);

  const fetchPhotos = () => {
    fetch("/api/progress/photos")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          imageUrl: imageUrl.trim(),
          poseType,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setShowForm(false);
      setImageUrl("");
      setNotes("");
      setPoseType("front");
      fetchPhotos();
    } catch {
      toast.error("Failed to save photo.");
    }
    setSaving(false);
  };

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
          Progress Photos
        </h1>
        <p className="text-ft-dim text-sm font-mono mt-1">
          Visual progress over time
        </p>
      </div>

      {/* Comparison Panel */}
      {compareMode && (compareLeft || compareRight) && (
        <Card className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-sm font-bold text-ft-white">Side-by-Side Comparison</h3>
            <button
              onClick={() => { setCompareMode(false); setCompareLeft(null); setCompareRight(null); }}
              className="text-ft-dim text-xs font-mono hover:text-ft-light"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[compareLeft, compareRight].map((photo, i) => (
              <div key={i} className="border border-ft-card rounded overflow-hidden">
                {photo ? (
                  <>
                    <div className="aspect-[3/4] bg-ft-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt={`${photo.poseType} - ${photo.date}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-ft-dim text-[10px] font-mono">{photo.date}</span>
                      <Tag>{photo.poseType}</Tag>
                    </div>
                  </>
                ) : (
                  <div className="aspect-[3/4] bg-ft-surface flex items-center justify-center">
                    <span className="text-ft-muted text-xs font-mono">
                      Select {i === 0 ? "first" : "second"} photo
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {compareLeft && compareRight && (
            <p className="text-ft-dim text-[10px] font-mono text-center mt-2">
              {Math.round((new Date(compareRight.date).getTime() - new Date(compareLeft.date).getTime()) / (1000 * 60 * 60 * 24))} days apart
            </p>
          )}
        </Card>
      )}

      <Card>
        <SectionHeader
          title="Photo Gallery"
          subtitle={photos.length > 0 ? `${photos.length} photos` : undefined}
          action={
            <div className="flex items-center gap-2">
              {photos.length >= 2 && (
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) { setCompareLeft(null); setCompareRight(null); }
                  }}
                  className={`text-xs font-mono transition-colors border rounded px-3 py-1 ${
                    compareMode
                      ? "text-ft-white border-ft-accent bg-ft-accent/20"
                      : "text-ft-dim border-ft-border hover:text-ft-light"
                  }`}
                >
                  {compareMode ? "Cancel Compare" : "Compare"}
                </button>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-ft-dim text-xs font-mono hover:text-ft-light transition-colors border border-ft-border rounded px-3 py-1"
              >
                + Add Photo
              </button>
            </div>
          }
        />

        {/* Add Photo Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-3 bg-ft-bg rounded border border-ft-card">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                />
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Pose Type
                </label>
                <select
                  value={poseType}
                  onChange={(e) => setPoseType(e.target.value)}
                  className="w-full bg-ft-surface border border-ft-card rounded px-2 py-1.5 text-sm font-mono text-ft-white focus:outline-none focus:border-ft-dim transition-colors"
                >
                  {POSE_TYPES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ft-dim text-xs font-mono uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
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
                disabled={saving || !imageUrl.trim()}
                className="bg-ft-white text-ft-bg font-mono text-xs font-bold px-4 py-1.5 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Photo"}
              </button>
            </div>
          </form>
        )}

        {photos.length === 0 && !showForm ? (
          <EmptyState
            icon="&#x1F4F7;"
            title="No photos uploaded yet"
            description="Add your first progress photo to track visual changes over time."
            actionLabel="+ Add Photo"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => {
              const isSelected = compareLeft?.id === photo.id || compareRight?.id === photo.id;
              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (!compareMode) return;
                    if (isSelected) {
                      if (compareLeft?.id === photo.id) setCompareLeft(null);
                      else setCompareRight(null);
                      return;
                    }
                    if (!compareLeft) setCompareLeft(photo);
                    else if (!compareRight) setCompareRight(photo);
                    else setCompareRight(photo);
                  }}
                  className={`border rounded overflow-hidden transition-all ${
                    compareMode ? "cursor-pointer hover:border-ft-accent" : ""
                  } ${isSelected ? "border-ft-accent ring-1 ring-ft-accent" : "border-ft-card"}`}
                >
                  <div className="aspect-[3/4] bg-ft-surface flex items-center justify-center relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`${photo.poseType} - ${photo.date}`}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-ft-accent text-ft-bg w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold">
                        {compareLeft?.id === photo.id ? "1" : "2"}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-ft-dim text-[10px] font-mono">{photo.date}</span>
                      <Tag>{photo.poseType}</Tag>
                    </div>
                    {photo.notes && (
                      <p className="text-ft-muted text-[10px] font-mono mt-1 truncate">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
