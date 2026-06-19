"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/v2";

/** Client back-header for the (server-rendered) checkout page. */
export default function CheckoutHeader() {
  const router = useRouter();
  return (
    <div className="flex-shrink-0">
      <Header kind="sub" title="Activate plan" subtitle="Checkout" right={null} onBack={() => router.back()} />
    </div>
  );
}
