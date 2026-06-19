"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/v2";

/** Client back-header for the (server-rendered) compare page. */
export default function CompareHeader() {
  const router = useRouter();
  return (
    <div className="flex-shrink-0">
      <Header kind="sub" title="Compare" subtitle="Shelf" right={null} onBack={() => router.push("/shelf")} />
    </div>
  );
}
