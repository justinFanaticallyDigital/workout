"use client";

/**
 * Checkout activate panel (client). Start-date pick (Today / next Monday, per
 * flow-rule §7 "default to start now") + Activate → POST /api/programs/clone
 * with template defaults, then route to the post-purchase welcome. The tier is
 * set on the welcome screen so it reflects what was activated.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, SectionLabel } from "@/components/v2";
import { useToast } from "@/components/ui/Toast";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function nextMonday(): string {
  const d = new Date();
  const dow = d.getDay(); // 0=Sun
  const add = ((8 - dow) % 7) || 7; // days until next Monday (never today)
  d.setDate(d.getDate() + add);
  return iso(d);
}

export default function ActivatePanel({
  slug,
  type,
  customizeHref,
}: {
  slug: string;
  type: string;
  customizeHref: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const today = iso(new Date());
  const monday = nextMonday();
  const [start, setStart] = useState<string>(today);
  const [busy, setBusy] = useState(false);

  const activate = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/programs/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: slug, startDate: start }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? "Could not activate plan");
        setBusy(false);
        return;
      }
      const data = (await res.json()) as { programId: string; warnings?: string[] };
      if (Array.isArray(data.warnings)) for (const w of data.warnings) toast.info(w, 6000);
      router.push(`/welcome/${type}/${data.programId}`);
    } catch {
      toast.error("Could not activate plan");
      setBusy(false);
    }
  };

  const opts: { value: string; label: string }[] = [
    { value: today, label: "Today" },
    { value: monday, label: "Next Monday" },
  ];

  return (
    <>
      <SectionLabel>Start date</SectionLabel>
      <div className="px-4">
        <div className="flex gap-2">
          {opts.map((o) => {
            const sel = o.value === start;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setStart(o.value)}
                className={[
                  "flex-1 rounded-ft-md border px-3 py-3 text-center font-body text-[13px] font-semibold transition-colors",
                  sel ? "border-ft-accent bg-ft-accent-faint text-ft-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                ].join(" ")}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-5">
        <Button kind="primary" size="lg" fullWidth disabled={busy} onClick={activate}>
          {busy ? "Activating…" : "Activate plan →"}
        </Button>
        <Link href={customizeHref} className="mt-2 block">
          <Button kind="ghost" size="md" fullWidth>
            Customize options first
          </Button>
        </Link>
      </div>
    </>
  );
}
