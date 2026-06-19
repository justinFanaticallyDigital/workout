"use client";

/**
 * Cluster 6 — Settings hub · /settings (the top-right gear destination across
 * every tier). v2 reskin: account + the UI-simulated tier switcher
 * (MIGRATION_MAP §1.3 — no billing yet) + unit prefs + grouped nav rows into
 * the existing sub-pages (theme / integrations / advanced) and the
 * consolidated surfaces (Progress / Library). Data export (CSV) is preserved
 * inline. Settings is NOT a pillar — it renders through HomeShell + the global
 * BottomNav.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { HomeShell, Header, Card, Button, Stamp, SectionLabel } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";
import { useTier } from "@/providers/TierProvider";
import { TIERS, TIER_LABEL, type Tier } from "@/lib/tier";

function getStoredUnit(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const { tier, setTier } = useTier();

  const [weightUnit, setWeightUnit] = useState(() => getStoredUnit("ft-weight-unit", "lbs"));
  const [distanceUnit, setDistanceUnit] = useState(() => getStoredUnit("ft-distance-unit", "miles"));
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem("ft-weight-unit", weightUnit);
  }, [weightUnit]);
  useEffect(() => {
    localStorage.setItem("ft-distance-unit", distanceUnit);
  }, [distanceUnit]);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const [workoutsRes, weightRes, prsRes] = await Promise.all([
        fetch("/api/workouts?limit=1000"),
        fetch("/api/progress/weight"),
        fetch("/api/progress/prs"),
      ]);
      const workoutsData = await workoutsRes.json();
      const weightData = await weightRes.json();
      const prsData = await prsRes.json();

      const lines: string[] = ["Date,Exercise,Set,Weight,Reps,RIR,RPE,Is PR"];
      for (const workout of workoutsData.workouts ?? []) {
        const date = workout.date?.split("T")[0] ?? "";
        for (const we of workout.exercises ?? []) {
          for (const set of we.sets ?? []) {
            lines.push(
              [date, `"${we.exercise?.name ?? ""}"`, set.setNumber, set.weight ?? "", set.reps ?? "", set.rir ?? "", set.rpe ?? "", set.isPr ? "Yes" : ""].join(","),
            );
          }
        }
      }
      const weightLines: string[] = ["Date,Weight,Body Fat %,Notes"];
      for (const entry of weightData.entries ?? []) {
        weightLines.push([entry.date, entry.weight ?? "", entry.bodyFatPct ?? "", `"${entry.notes ?? ""}"`].join(","));
      }
      const prLines: string[] = ["Exercise,PR Type,Weight,Reps,Date"];
      for (const pr of prsData.prs ?? []) {
        prLines.push([`"${pr.exercise ?? ""}"`, pr.prType ?? "", pr.weight ?? "", pr.reps ?? "", pr.date ?? ""].join(","));
      }

      downloadCSV("fittrack-workouts.csv", lines.join("\n"));
      setTimeout(() => downloadCSV("fittrack-body-metrics.csv", weightLines.join("\n")), 500);
      setTimeout(() => downloadCSV("fittrack-prs.csv", prLines.join("\n")), 1000);
      toast.success("Exporting 3 CSV files…");
    } catch {
      toast.error("Failed to export data.");
    }
    setExporting(false);
  };

  const email = session?.user?.email ?? null;

  return (
    <HomeShell header={<Header kind="home" title="Settings" right={null} />}>
      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <div className="px-4">
        <Card className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <div className="truncate font-body text-[14px] font-semibold text-ft-white">{email ?? "Not signed in"}</div>
              <div className="mt-0.5 font-data text-[10.5px] uppercase tracking-[0.06em] text-ft-dim">{TIER_LABEL[tier]} tier</div>
            </div>
            {email ? (
              <Button kind="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/signin" })}>
                Sign out
              </Button>
            ) : (
              <Button kind="primary" size="sm" onClick={() => router.push("/signin")}>
                Sign in
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Tier switcher (UI-simulated) */}
      <SectionLabel right="Simulated">Tier</SectionLabel>
      <div className="px-4">
        <Card className="px-4 py-3.5">
          <Stamp>Preview tier</Stamp>
          <p className="mt-1 font-body text-[11.5px] leading-snug text-ft-dim">
            No billing yet — switch to preview each tier&apos;s surfaces (locked slots, slot-1 home, pillar gameplan layer).
          </p>
          <div className="mt-2.5 flex gap-2">
            {TIERS.map((t) => {
              const sel = t === tier;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t as Tier)}
                  className={[
                    "flex-1 rounded-ft-md border px-2 py-2.5 font-body text-[12.5px] font-bold capitalize transition-colors",
                    sel ? "border-ft-accent bg-ft-accent-faint text-ft-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                  ].join(" ")}
                >
                  {TIER_LABEL[t]}
                </button>
              );
            })}
          </div>
          <Link href="/shelf" className="mt-2.5 block">
            <Button kind="ghost" size="sm">
              Browse the Shelf →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Units */}
      <SectionLabel>Units</SectionLabel>
      <div className="px-4">
        <Card className="flex flex-col gap-3 px-4 py-3.5">
          <UnitToggle label="Weight" value={weightUnit} options={["lbs", "kg"]} onChange={setWeightUnit} />
          <UnitToggle label="Distance" value={distanceUnit} options={["miles", "km"]} onChange={setDistanceUnit} />
        </Card>
      </div>

      {/* Nav rows */}
      <SectionLabel>More</SectionLabel>
      <div className="flex flex-col gap-2 px-4">
        <NavRow href="/settings/theme" label="Theme" sub="Switch visual theme" />
        <NavRow href="/settings/integrations" label="Integrations" sub="Fitbit · Apple Health · Garmin" />
        <NavRow href="/progress" label="Progress" sub="Charts · calendar · check-ins · photos" />
        <NavRow href="/library" label="Workouts library" sub="Saved frames + single workouts" />
        <NavRow href="/settings/advanced" label="Advanced" sub="Migrations · debug" />
      </div>

      {/* Data */}
      <SectionLabel>Data</SectionLabel>
      <div className="px-4 pb-2">
        <Button kind="secondary" size="lg" fullWidth disabled={exporting} onClick={handleExport}>
          {exporting ? "Exporting…" : "Export all data (CSV)"}
        </Button>
      </div>
    </HomeShell>
  );
}

function UnitToggle({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-[13px] font-semibold text-ft-white">{label}</span>
      <div className="flex gap-1 rounded-ft-md border border-ft-border-faint bg-ft-surface-alt p-1">
        {options.map((o) => {
          const sel = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={[
                "rounded-[6px] px-3 py-1.5 font-body text-[12px] font-semibold transition-colors",
                sel ? "bg-ft-surface text-ft-white shadow-ft-sm" : "text-ft-dim",
              ].join(" ")}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavRow({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href}>
      <Card className="flex items-center justify-between px-3.5 py-3">
        <div className="min-w-0">
          <div className="font-body text-[13.5px] font-semibold text-ft-white">{label}</div>
          <div className="mt-px font-body text-[11.5px] text-ft-dim">{sub}</div>
        </div>
        <span className="font-body text-base text-ft-dim">›</span>
      </Card>
    </Link>
  );
}
