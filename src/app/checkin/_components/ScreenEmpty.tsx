"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Plex, Mono, Pill, Card, SectionH, PrimaryBtn } from "./primitives";
import { EngineFlowDiagram } from "./charts";
import { IconInfo } from "./icons";

/**
 * First-ever empty state for /checkin. The prototype's hero bg
 * brightens on lab/notebook (paper-feel themes) — preserved here.
 */
export default function ScreenEmpty({ onStart }: { onStart: () => void }) {
  const { chrome } = useTheme();
  const isPaper = chrome === "lab" || chrome === "notebook";

  return (
    <div style={{ background: "rgb(var(--ft-bg))", minHeight: "100%", overflowY: "auto" }}>
      {/* Hero */}
      <div
        style={{
          background: isPaper ? "rgb(var(--ft-surface))" : "rgb(var(--ft-bg-alt))",
          borderBottom: "1px solid rgb(var(--ft-border))",
          padding: "20px 16px 24px",
        }}
      >
        <Pill tone="blue" icon={IconInfo} style={{ marginBottom: 10 }}>
          New here
        </Pill>
        <h1
          className="font-display"
          style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2, color: "rgb(var(--ft-text-on-bg))", margin: 0, marginBottom: 6 }}
        >
          Weekly check-in
        </h1>
        <Plex size={13} weight={400} color="rgb(var(--ft-text-on-bg-sec))" style={{ display: "block", lineHeight: 1.5 }}>
          A weekly self-report that captures energy, sleep, soreness, stress, and motivation
          along with adherence and free-text reflection. Used as raw input for the Goal Engine
          to generate adjustment recommendations once your Gameplan is set up.
        </Plex>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <SectionH kicker="0.1 / How it works" title="Self-report → Engine → Recommendations" />
        <Card padding={16}>
          <EngineFlowDiagram />
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgb(var(--ft-border-faint))" }}>
            <Mono size={10} weight={600} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              For now
            </Mono>
            <Plex size={12} weight={400} color="rgb(var(--ft-text-secondary))" style={{ display: "block", lineHeight: 1.5 }}>
              The check-in itself works today — your ratings, adherence, and reflections save and
              show up in history. Recommendation cards land once the Goal Engine ships (R8).
            </Plex>
          </div>
        </Card>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <PrimaryBtn variant="primary" onClick={onStart}>
          Start your first check-in
        </PrimaryBtn>
      </div>
    </div>
  );
}
