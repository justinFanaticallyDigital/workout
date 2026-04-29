"use client";

import { useState } from "react";
import { Plex, Mono, SectionH, PrimaryBtn } from "./primitives";

/**
 * NEW component (not in prototype). Renders the form to fill out a
 * CheckIn — 5 ratings (1–5) + 3 adherence percentages + 3 free-text.
 * Submits via POST /api/checkins (upsert by date).
 */
export default function CheckInForm({
  onCancel,
  onSubmitted,
}: {
  onCancel: () => void;
  onSubmitted: () => void;
}) {
  const [energy, setEnergy] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [motivation, setMotivation] = useState<number | null>(null);
  const [liftAdherence, setLiftAdherence] = useState<string>("");
  const [cardioAdherence, setCardioAdherence] = useState<string>("");
  const [nutritionAdherence, setNutritionAdherence] = useState<string>("");
  const [wins, setWins] = useState<string>("");
  const [struggles, setStruggles] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          energy,
          sleepQuality,
          soreness,
          stress,
          motivation,
          liftAdherence: liftAdherence === "" ? null : Number(liftAdherence),
          cardioAdherence: cardioAdherence === "" ? null : Number(cardioAdherence),
          nutritionAdherence: nutritionAdherence === "" ? null : Number(nutritionAdherence),
          wins: wins.trim() || null,
          struggles: struggles.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save check-in");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionH kicker="1 / Subjective" title="How are you feeling?" />
      <RatingField label="Energy" value={energy} setValue={setEnergy} hint="Higher = better" />
      <RatingField label="Sleep quality" value={sleepQuality} setValue={setSleepQuality} hint="Higher = better" />
      <RatingField label="Soreness" value={soreness} setValue={setSoreness} hint="Lower = less sore" inverse />
      <RatingField label="Stress" value={stress} setValue={setStress} hint="Lower = less stressed" inverse />
      <RatingField label="Motivation" value={motivation} setValue={setMotivation} hint="Higher = better" />

      <SectionH kicker="2 / Adherence" title="How did the plan go?" style={{ marginTop: 4 }} />
      <PercentField label="Lift adherence" value={liftAdherence} setValue={setLiftAdherence} />
      <PercentField label="Cardio adherence" value={cardioAdherence} setValue={setCardioAdherence} />
      <PercentField label="Nutrition adherence" value={nutritionAdherence} setValue={setNutritionAdherence} />

      <SectionH kicker="3 / Reflection" title="Free text" style={{ marginTop: 4 }} />
      <TextField label="Wins" value={wins} setValue={setWins} placeholder="What went well?" rows={2} />
      <TextField label="Struggles" value={struggles} setValue={setStruggles} placeholder="What was hard?" rows={2} />
      <TextField label="Notes" value={notes} setValue={setNotes} placeholder="Anything else worth flagging?" rows={3} />

      {error && (
        <div
          style={{
            background: "rgb(var(--ft-danger-bg))",
            border: "1px solid rgb(var(--ft-danger-border))",
            color: "rgb(var(--ft-danger-fg))",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <PrimaryBtn variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </PrimaryBtn>
        <PrimaryBtn variant="primary" onClick={submit} disabled={submitting} style={{ flex: 2 }}>
          {submitting ? "Saving…" : "Save check-in"}
        </PrimaryBtn>
      </div>
    </div>
  );
}

function RatingField({
  label,
  hint,
  value,
  setValue,
  inverse,
}: {
  label: string;
  hint: string;
  value: number | null;
  setValue: (v: number | null) => void;
  inverse?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <Plex size={13} weight={600}>
          {label}
        </Plex>
        <Mono size={9} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em", textTransform: "uppercase" }}>
          {hint}
        </Mono>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const isOn = value === n;
          const tone = inverse
            ? n <= 2 ? "rgb(var(--ft-success-fg))" : n <= 3 ? "rgb(var(--ft-warn-fg))" : "rgb(var(--ft-danger-fg))"
            : n >= 4 ? "rgb(var(--ft-success-fg))" : n >= 3 ? "rgb(var(--ft-warn-fg))" : "rgb(var(--ft-danger-fg))";
          return (
            <button
              key={n}
              onClick={() => setValue(isOn ? null : n)}
              className="font-data"
              style={{
                padding: "10px 0",
                background: isOn ? `${tone.replace("rgb(", "rgba(").replace(")", " / 0.15)")}` : "rgb(var(--ft-bg-alt))",
                border: `1px solid ${isOn ? tone : "rgb(var(--ft-border-faint))"}`,
                color: isOn ? tone : "rgb(var(--ft-text-secondary))",
                borderRadius: 4,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PercentField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <Plex size={13} weight={600} style={{ display: "block", marginBottom: 6 }}>
        {label}
      </Plex>
      <div style={{ display: "flex", alignItems: "stretch", border: "1px solid rgb(var(--ft-border))", borderRadius: 4 }}>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={0}
          max={100}
          placeholder="0–100"
          className="font-data"
          style={{
            flex: 1,
            background: "rgb(var(--ft-bg-alt))",
            border: "none",
            padding: "10px 12px",
            color: "rgb(var(--ft-text-primary))",
            fontSize: 16,
            outline: "none",
          }}
        />
        <span
          className="font-data"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            background: "rgb(var(--ft-surface))",
            color: "rgb(var(--ft-text-tertiary))",
            fontSize: 12,
            borderLeft: "1px solid rgb(var(--ft-border))",
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  setValue,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <Plex size={13} weight={600} style={{ display: "block", marginBottom: 6 }}>
        {label}
      </Plex>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-body"
        style={{
          width: "100%",
          background: "rgb(var(--ft-bg-alt))",
          border: "1px solid rgb(var(--ft-border))",
          borderRadius: 4,
          padding: "10px 12px",
          color: "rgb(var(--ft-text-primary))",
          fontSize: 13,
          resize: "vertical",
          outline: "none",
        }}
      />
    </div>
  );
}
