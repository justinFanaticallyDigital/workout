"use client";

/** Settings hub — account · preferences · libraries · health · data. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Btn, Card, ScreenHeader, SectionHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";
import { fmtHeaderDate } from "@/lib/dates";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const [units, setUnits] = useState({ weight: "lbs", distance: "miles" });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    try {
      setUnits({ weight: localStorage.getItem("ft-weight-unit") ?? "lbs", distance: localStorage.getItem("ft-distance-unit") ?? "miles" });
    } catch {
      /* private mode */
    }
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [workoutsRes, weightRes, prsRes] = await Promise.all([fetch("/api/workouts?limit=1000"), fetch("/api/progress/weight"), fetch("/api/progress/prs")]);
      const workoutsData = await workoutsRes.json();
      const weightData = await weightRes.json();
      const prsData = await prsRes.json();

      const lines: string[] = ["Date,Exercise,Set,Weight,Reps,RIR,RPE,Is PR"];
      for (const workout of workoutsData.workouts ?? []) {
        const date = workout.date?.split("T")[0] ?? "";
        for (const we of workout.exercises ?? []) {
          for (const set of we.sets ?? []) {
            lines.push([date, `"${we.exercise?.name ?? ""}"`, set.setNumber, set.weight ?? "", set.reps ?? "", set.rir ?? "", set.rpe ?? "", set.isPr ? "Yes" : ""].join(","));
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
      toast.error("Couldn't export the data.");
    }
    setExporting(false);
  };

  const email = session?.user?.email ?? null;
  const name = session?.user?.name ?? null;
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="pb-8">
      <ScreenHeader title="Settings" right={<Stamp>{fmtHeaderDate()}</Stamp>} />

      <SectionHeader title="Account" />
      <div className="px-5">
        <Card className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ft-accent font-data text-[16px] font-bold text-ft-on-accent">{initial}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-data text-[14px] font-bold text-ft-white">{name ?? email ?? "Not signed in"}</div>
            <div className="truncate font-body text-[12px] text-ft-dim">{email ? `${name ? `${email} · ` : ""}Google account` : "Sign in to sync your data"}</div>
          </div>
          {email ? (
            <Btn kind="quiet" small onClick={() => signOut({ callbackUrl: "/signin" })}>
              Sign out
            </Btn>
          ) : (
            <Btn small onClick={() => router.push("/signin")}>
              Sign in
            </Btn>
          )}
        </Card>
      </div>

      <SectionHeader title="Preferences" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <Row href="/settings/units" label="Units" sub={`${units.weight === "kg" ? "Kilograms" : "Pounds"} · ${units.distance === "km" ? "Kilometres" : "Miles"}`} />
        <Row href="/settings/integrations" label="Integrations" sub="Fitbit · Apple Health · Garmin" />
      </div>

      <SectionHeader title="Library" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <Row href="/training/plans" label="Training plans" sub="Active · paused · completed · pre-made" />
        <Row href="/nutrition/plans" label="Nutrition plans" sub="Active · archived" />
        <Row href="/nutrition/meals" label="My Meals" sub="Saved meals and frames" />
        <Row href="/nutrition/foods" label="Foods" sub="Library · scanned labels · custom foods" />
        <Row href="/exercises" label="Exercises" sub="Library · custom exercises · categories" />
      </div>

      <SectionHeader title="Health" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <Row href="/stats/injuries" label="Injuries" sub="Tweaks, flare-ups and recovery notes" />
        <Row href="/stats/body" label="Body metrics" sub="Weight · body fat" />
        <Row href="/stats/photos" label="Progress photos" sub="Front · side · back" />
      </div>

      <SectionHeader title="Data" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <Btn kind="ghost" fullWidth disabled={exporting} onClick={handleExport}>
          {exporting ? "Exporting…" : "Export all data (CSV)"}
        </Btn>
        <Row href="/settings/advanced" label="Advanced" sub="Seeds · debug" />
      </div>
    </div>
  );
}

function Row({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} className="block">
      <Card band={false} className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-data text-[13.5px] font-semibold text-ft-white">{label}</div>
          <div className="mt-px font-body text-[11.5px] text-ft-dim">{sub}</div>
        </div>
        <span className="font-data text-[14px] text-ft-accent">›</span>
      </Card>
    </Link>
  );
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
