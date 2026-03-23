"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

const tiers = [
  {
    id: "builder",
    icon: "//",
    title: "Program Builder",
    subtitle: "Visual block-by-block design",
    desc: "Design your program with a visual timeline. Set goals, define block phases, configure training days — all in one view.",
    href: "/programs/new/builder",
  },
  {
    id: "template",
    icon: "[]",
    title: "Use a Template",
    subtitle: "Start from a proven program",
    desc: "Pick from pre-built templates like PPL, Upper/Lower, Full Body, or 5/3/1. Clone it and start training immediately.",
    href: "/programs/new/templates",
  },
  {
    id: "quick",
    icon: ">>",
    title: "Build As You Go",
    subtitle: "Start with just a name",
    desc: "Create a blank program and add blocks, days, and exercises as you train. Maximum flexibility.",
    href: null, // handled inline
  },
  {
    id: "goal",
    icon: "^^",
    title: "Goal-Driven",
    subtitle: "Plan backward from a goal",
    desc: "Set a strength, body weight, or frequency target. We'll suggest a program structure to get you there.",
    href: "/programs/new/goal",
  },
];

export default function NewProgramPage() {
  const router = useRouter();
  const toast = useToast();
  const [quickName, setQuickName] = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleQuickCreate = async () => {
    if (!quickName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickName.trim(),
          startDate: new Date().toISOString().split("T")[0],
          status: "active",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const program = await res.json();
      router.push(`/programs/${program.id}`);
    } catch {
      toast.error("Failed to create program.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ft-bg text-ft-white p-6 max-w-3xl mx-auto">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1.5 text-ft-dim text-sm font-body hover:text-ft-light transition-colors mb-6"
      >
        <span>&larr;</span>
        <span>Programs</span>
      </Link>

      <h1 className="font-body text-2xl font-bold tracking-tight mb-2">
        New Program
      </h1>
      <p className="text-ft-dim text-sm font-body mb-4">
        Choose how you want to set up your training
      </p>
      <div className="bg-ft-surface border border-ft-border rounded-md px-4 py-3 mb-6">
        <p className="text-ft-light text-xs font-body">
          <span className="text-ft-white font-bold">New to training?</span>{" "}
          Start with a <span className="text-ft-white font-bold">Template</span> — pick a proven program and customize it later.
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.id}>
            {tier.href ? (
              <Link href={tier.href}>
                <Card className="hover:border-ft-dim transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{tier.icon}</span>
                    <div>
                      <h2 className="font-body text-base font-bold mb-0.5">
                        {tier.title}
                      </h2>
                      <p className="text-ft-light text-xs font-body mb-2">
                        {tier.subtitle}
                      </p>
                      <p className="text-ft-dim text-xs font-body">
                        {tier.desc}
                      </p>
                    </div>
                    <span className="text-ft-muted ml-auto mt-2">&rarr;</span>
                  </div>
                </Card>
              </Link>
            ) : (
              <div>
                <button
                  onClick={() => setShowQuick(!showQuick)}
                  className="w-full text-left"
                >
                  <Card className="hover:border-ft-dim transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <h2 className="font-body text-base font-bold mb-0.5">
                          {tier.title}
                        </h2>
                        <p className="text-ft-light text-xs font-body mb-2">
                          {tier.subtitle}
                        </p>
                        <p className="text-ft-dim text-xs font-body">
                          {tier.desc}
                        </p>
                      </div>
                      <span className="text-ft-muted ml-auto mt-2">
                        {showQuick ? "▾" : "▸"}
                      </span>
                    </div>
                  </Card>
                </button>

                {showQuick && (
                  <Card className="mt-2 border-ft-white">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-ft-dim text-[10px] font-body uppercase tracking-wider mb-1">
                          Program Name
                        </label>
                        <input
                          type="text"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="e.g. My Training"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                          className="w-full bg-ft-bg border border-ft-card rounded px-3 py-2 text-sm font-body text-ft-white placeholder:text-ft-muted focus:outline-none focus:border-ft-dim transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleQuickCreate}
                        disabled={saving || !quickName.trim()}
                        className="bg-ft-white text-ft-bg font-body text-sm font-bold px-4 py-2 rounded hover:bg-ft-light transition-colors disabled:opacity-50"
                      >
                        {saving ? "..." : "Create & Start"}
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
