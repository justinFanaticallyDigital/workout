"use client";

/**
 * Integrations — Fitbit is wired end-to-end against the existing OAuth backend:
 *   status  GET  /api/integrations/fitbit/sync → { connected, scopes, lastSyncedAt, tokenExpired }
 *   connect GET  /api/integrations/fitbit      → { authUrl }
 *   sync    POST /api/integrations/fitbit/sync
 *   remove  DELETE /api/integrations/fitbit
 * Apple Health / Garmin have no backend yet and render as factual "soon" rows.
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Btn, Card, ScreenHeader, SectionHeader, Stamp } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

interface FitbitStatus {
  connected: boolean;
  userId: string | null;
  tokenExpired: boolean | null;
  scopes: string | null;
  lastSyncedAt: string | null;
}

const EMPTY: FitbitStatus = { connected: false, userId: null, tokenExpired: null, scopes: null, lastSyncedAt: null };

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function IntegrationsInner() {
  const toast = useToast();
  const params = useSearchParams();
  const [status, setStatus] = useState<FitbitStatus | null>(null);
  const [busy, setBusy] = useState<null | "connect" | "sync" | "disconnect">(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/fitbit/sync");
      setStatus(res.ok ? await res.json() : EMPTY);
    } catch {
      setStatus(EMPTY);
    }
  }, []);

  useEffect(() => {
    const flag = params.get("fitbit");
    if (flag === "connected") toast.success("Fitbit connected — syncing your data.");
    else if (flag === "error") toast.error("Couldn't connect Fitbit. Try again.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const connect = async () => {
    setBusy("connect");
    try {
      const res = await fetch("/api/integrations/fitbit");
      if (res.status === 503) {
        toast.error("Fitbit isn't configured on the server yet.");
        setBusy(null);
        return;
      }
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }
      toast.error("Couldn't start the Fitbit connection.");
    } catch {
      toast.error("Couldn't start the Fitbit connection.");
    }
    setBusy(null);
  };
  const sync = async () => {
    setBusy("sync");
    try {
      const res = await fetch("/api/integrations/fitbit/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message ?? `Synced ${data.synced ?? 0} entries.`);
        await loadStatus();
      } else toast.error(data.error ?? "Sync failed.");
    } catch {
      toast.error("Sync failed.");
    }
    setBusy(null);
  };
  const disconnect = async () => {
    setBusy("disconnect");
    try {
      const res = await fetch("/api/integrations/fitbit", { method: "DELETE" });
      if (res.ok) {
        toast.success("Fitbit disconnected.");
        await loadStatus();
      } else toast.error("Couldn't disconnect.");
    } catch {
      toast.error("Couldn't disconnect.");
    }
    setBusy(null);
  };

  const connected = !!status?.connected;
  const expired = !!status?.tokenExpired;

  return (
    <div className="pb-8">
      <ScreenHeader title="Integrations" back={{ href: "/settings", label: "Settings" }} sub="Connected sources" />
      <SectionHeader title="Wearables & health" />
      <div className="px-5">
        <Card className="px-4 py-4">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <div className="font-data text-[15px] font-bold text-ft-white">Fitbit</div>
              <div className="mt-0.5 font-body text-[12px] text-ft-dim">Body weight · sleep · steps · resting HR</div>
            </div>
            {status === null ? <Stamp tone="muted">Checking</Stamp> : expired ? <Stamp tone="gold">Expired</Stamp> : connected ? <Stamp tone="success">Connected</Stamp> : <Stamp tone="muted">Not connected</Stamp>}
          </div>
          {connected && (
            <div className="mt-3 flex flex-col gap-1 border-t border-ft-border-faint pt-3">
              <Row label="Last synced" value={relativeTime(status?.lastSyncedAt ?? null)} />
              {status?.scopes && <Row label="Scopes" value={status.scopes.split(" ").join(", ")} />}
            </div>
          )}
          <div className="mt-3.5 flex gap-2">
            {!connected && (
              <Btn fullWidth disabled={busy !== null || status === null} onClick={connect}>
                {busy === "connect" ? "Opening Fitbit…" : "Connect Fitbit"}
              </Btn>
            )}
            {connected && expired && (
              <Btn fullWidth disabled={busy !== null} onClick={connect}>
                {busy === "connect" ? "Reconnecting…" : "Reconnect"}
              </Btn>
            )}
            {connected && !expired && (
              <Btn fullWidth disabled={busy !== null} onClick={sync}>
                {busy === "sync" ? "Syncing…" : "Sync now"}
              </Btn>
            )}
            {connected && (
              <Btn kind="quiet" disabled={busy !== null} onClick={disconnect}>
                {busy === "disconnect" ? "…" : "Disconnect"}
              </Btn>
            )}
          </div>
        </Card>
      </div>

      <SectionHeader title="Coming soon" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <SoonRow name="Apple Health" detail="Activity · sleep · heart rate" />
        <SoonRow name="Garmin" detail="Activity · sleep · heart rate" />
      </div>
      <p className="px-5 pt-4 font-body text-[12px] leading-snug text-ft-dim">Synced weight lands in Body metrics and the Stats tab. Fitbit pulls the last 30 days on connect, then on each sync.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-body text-[12px] text-ft-dim">{label}</span>
      <span className="truncate font-data text-[12px] text-ft-light">{value}</span>
    </div>
  );
}

function SoonRow({ name, detail }: { name: string; detail: string }) {
  return (
    <Card band={false} className="flex items-center justify-between gap-3 px-4 py-3 opacity-80">
      <div className="min-w-0">
        <div className="font-data text-[13.5px] font-semibold text-ft-white">{name}</div>
        <div className="mt-px font-body text-[11.5px] text-ft-dim">{detail}</div>
      </div>
      <Stamp tone="muted">Soon</Stamp>
    </Card>
  );
}

export default function SettingsIntegrationsPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationsInner />
    </Suspense>
  );
}
