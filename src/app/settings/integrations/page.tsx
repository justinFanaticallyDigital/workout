"use client";

/**
 * Cluster 6 — Integrations · /settings/integrations.
 *
 * Connect third-party data sources (Lifestyle data). Fitbit is wired end-to-end
 * against the existing OAuth backend:
 *   • status   GET  /api/integrations/fitbit/sync   → { connected, scopes, lastSyncedAt, tokenExpired }
 *   • connect  GET  /api/integrations/fitbit        → { authUrl } (redirect)
 *   • sync     POST /api/integrations/fitbit/sync
 *   • remove   DELETE /api/integrations/fitbit
 * The OAuth callback redirects back to /settings?fitbit=connected|error — and
 * we also surface ?fitbit= here if the user lands on this page. Apple Health /
 * Garmin have no backend yet, so they render as factual "not available" rows
 * (preview, never a dead button).
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeShell, Header, Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";

interface FitbitStatus {
  connected: boolean;
  userId: string | null;
  tokenExpired: boolean | null;
  scopes: string | null;
  lastSyncedAt: string | null;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function IntegrationsInner() {
  const toast = useToast();
  const params = useSearchParams();

  const [status, setStatus] = useState<FitbitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<null | "connect" | "sync" | "disconnect">(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/fitbit/sync");
      if (res.ok) {
        setStatus(await res.json());
      } else {
        setStatus({ connected: false, userId: null, tokenExpired: null, scopes: null, lastSyncedAt: null });
      }
    } catch {
      setStatus({ connected: false, userId: null, tokenExpired: null, scopes: null, lastSyncedAt: null });
    }
    setLoading(false);
  }, []);

  // Surface the OAuth callback result if the user is bounced here with ?fitbit=
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
        return; // navigating away
      }
      toast.error("Couldn't start Fitbit connection.");
    } catch {
      toast.error("Couldn't start Fitbit connection.");
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
      } else {
        toast.error(data.error ?? "Sync failed.");
      }
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
      } else {
        toast.error("Couldn't disconnect.");
      }
    } catch {
      toast.error("Couldn't disconnect.");
    }
    setBusy(null);
  };

  const connected = !!status?.connected;
  const expired = !!status?.tokenExpired;

  return (
    <HomeShell header={<Header kind="sub" title="Integrations" subtitle="Connected sources" right={null} />}>
      <SectionLabel>Wearables &amp; health</SectionLabel>

      {/* Fitbit — fully wired */}
      <div className="px-4">
        <Card className="px-4 py-4">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <div className="font-display text-[16px] font-bold tracking-[-0.01em] text-ft-white">Fitbit</div>
              <div className="mt-0.5 font-body text-[11.5px] text-ft-dim">
                Body weight, sleep, steps, resting HR
              </div>
            </div>
            {loading ? (
              <Chip tone="neutral" size="sm">…</Chip>
            ) : expired ? (
              <Chip tone="warn" size="sm">Expired</Chip>
            ) : connected ? (
              <Chip tone="success" size="sm">Connected</Chip>
            ) : (
              <Chip tone="neutral" size="sm">Not connected</Chip>
            )}
          </div>

          {connected && (
            <div className="mt-3 flex flex-col gap-1 border-t border-ft-border-faint pt-3">
              <Row label="Last synced" value={relativeTime(status?.lastSyncedAt ?? null)} />
              {status?.scopes && (
                <Row label="Scopes" value={status.scopes.split(" ").join(", ")} />
              )}
            </div>
          )}

          <div className="mt-3.5 flex gap-2">
            {!connected && (
              <Button kind="primary" size="md" fullWidth disabled={busy !== null} onClick={connect}>
                {busy === "connect" ? "Opening Fitbit…" : "Connect Fitbit"}
              </Button>
            )}
            {connected && expired && (
              <Button kind="primary" size="md" fullWidth disabled={busy !== null} onClick={connect}>
                {busy === "connect" ? "Reconnecting…" : "Reconnect"}
              </Button>
            )}
            {connected && !expired && (
              <Button kind="primary" size="md" fullWidth disabled={busy !== null} onClick={sync}>
                {busy === "sync" ? "Syncing…" : "Sync now"}
              </Button>
            )}
            {connected && (
              <Button kind="secondary" size="md" disabled={busy !== null} onClick={disconnect}>
                {busy === "disconnect" ? "…" : "Disconnect"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Not-yet-available sources — preview, never a dead button */}
      <SectionLabel>Coming soon</SectionLabel>
      <div className="flex flex-col gap-2 px-4">
        <SoonRow name="Apple Health" detail="Activity, sleep, heart rate" />
        <SoonRow name="Garmin" detail="Activity, sleep, heart rate" />
      </div>

      <div className="px-4 pt-4 pb-2">
        <p className="font-body text-[11.5px] leading-snug text-ft-on-bg-ter ft-on-bg">
          Synced data feeds the Lifestyle pillar and the weekly check-in engine.
          Fitbit pulls the last 30 days on connect, then on each sync.
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-block font-body text-[12px] font-semibold uppercase tracking-[0.08em] text-ft-accent-on-bg"
        >
          ‹ Back to Settings
        </Link>
      </div>
    </HomeShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-body text-[11.5px] text-ft-dim">{label}</span>
      <span className="truncate font-data text-[11.5px] text-ft-light">{value}</span>
    </div>
  );
}

function SoonRow({ name, detail }: { name: string; detail: string }) {
  return (
    <Card className="flex items-center justify-between px-3.5 py-3 opacity-70">
      <div className="min-w-0">
        <div className="font-body text-[13.5px] font-semibold text-ft-white">{name}</div>
        <div className="mt-px font-body text-[11.5px] text-ft-dim">{detail}</div>
      </div>
      <Stamp>Soon</Stamp>
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
