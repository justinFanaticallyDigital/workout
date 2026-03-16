"use client";

import { useState, useEffect } from "react";
import { getQueue } from "@/lib/offline-queue";

type SyncStatus = "synced" | "pending" | "offline";

export default function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>("synced");
  const [pendingCount, setPendingCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const check = () => {
      const online = navigator.onLine;
      const queue = getQueue();
      setPendingCount(queue.length);

      if (!online) {
        setStatus("offline");
      } else if (queue.length > 0) {
        setStatus("pending");
      } else {
        setStatus("synced");
      }
    };

    check();
    const interval = setInterval(check, 5000);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, []);

  const colors: Record<SyncStatus, string> = {
    synced: "bg-ft-success",
    pending: "bg-ft-warn",
    offline: "bg-ft-danger",
  };

  const labels: Record<SyncStatus, string> = {
    synced: "Synced",
    pending: `${pendingCount} pending`,
    offline: "Offline",
  };

  // Don't show when everything is fine
  if (status === "synced") return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors hover:bg-ft-surface"
        title={labels[status]}
      >
        <span className={`w-2 h-2 rounded-full ${colors[status]} ${status === "pending" ? "animate-pulse" : ""}`} />
        <span className="text-ft-dim hidden sm:inline">{labels[status]}</span>
      </button>
      {showTooltip && (
        <div className="absolute right-0 top-full mt-1 bg-ft-card border border-ft-border rounded px-3 py-2 min-w-[160px] z-50 shadow-lg">
          <p className="text-ft-light text-xs font-mono mb-1">{labels[status]}</p>
          {status === "pending" && (
            <p className="text-ft-dim text-[10px] font-mono">
              {pendingCount} workout{pendingCount > 1 ? "s" : ""} waiting to sync
            </p>
          )}
          {status === "offline" && (
            <p className="text-ft-dim text-[10px] font-mono">
              Your data is saved locally and will sync when you reconnect
            </p>
          )}
        </div>
      )}
    </div>
  );
}
