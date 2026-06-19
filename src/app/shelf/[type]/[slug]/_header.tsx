"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/v2";

/** Client back-header for the (server-rendered) Shelf detail page. */
export default function ShelfDetailHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="flex-shrink-0">
      <Header kind="sub" title={title} subtitle="Shelf" right="gear" onBack={() => router.push("/shelf")} onGear={() => router.push("/settings")} />
    </div>
  );
}
