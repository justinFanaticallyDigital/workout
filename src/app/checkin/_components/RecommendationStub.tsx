"use client";

import { Plex, Mono, SectionH, Card } from "./primitives";
import { IconInfo } from "./icons";

/**
 * RecommendationCardA + B + OptionCard from the prototype, collapsed
 * into a single empty-state shell. The prototype's apply/dismiss/
 * open-in-planning UI requires `recommendations[]` from the Goal
 * Engine — both not on the live schema yet (R8 territory).
 *
 * We render the visual shell (card + section header + flow line)
 * with copy that explains what will land here once R8 ships.
 */
export default function RecommendationStub() {
  return (
    <div style={{ padding: "8px 16px 4px" }}>
      <SectionH
        kicker="2.2 / Recommendations"
        title="Engine output"
        right={
          <Mono size={9} weight={600} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
            R8 PENDING
          </Mono>
        }
      />
      <Card padding={16}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <IconInfo size={16} color="rgb(var(--ft-info-fg))" />
          <div style={{ flex: 1 }}>
            <Plex size={13} weight={600} style={{ display: "block", marginBottom: 4 }}>
              Goal Engine recommendations land here
            </Plex>
            <Plex size={12} weight={400} color="rgb(var(--ft-text-secondary))" style={{ display: "block", lineHeight: 1.5 }}>
              The Gameplan schema (R6) is in place; once the Goal Engine (R8) ships, this card will
              surface 0–3 weekly recommendations: behind-target adjustments, deload-shift suggestions,
              refeed timing, plateau detection, lifestyle-streak callouts. Each will have Apply /
              Dismiss / Open in Planning Mode actions per the v2 spec §8.
            </Plex>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px dashed rgb(var(--ft-border-faint))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Mono size={9} weight={600} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em", textTransform: "uppercase" }}>
            Until then
          </Mono>
          <Plex size={11} weight={500} color="rgb(var(--ft-text-secondary))">
            Use wins / struggles / notes below to capture context.
          </Plex>
        </div>
      </Card>
    </div>
  );
}
