"use client";

import { useEffect } from "react";
import { setupOfflineSync } from "@/lib/offline-queue";

export default function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupOfflineSync();
  }, []);

  return <>{children}</>;
}
