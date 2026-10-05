import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
/** The vision call can take a while on a busy label photo. */
export const maxDuration = 60;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const NUMERIC_KEYS = ["servingSize", "calories", "fat", "saturatedFat", "carbs", "fiber", "sugar", "protein", "sodium"] as const;
const TEXT_KEYS = ["name", "brand", "servingUnit"] as const;
const ALL_KEYS = [...TEXT_KEYS, ...NUMERIC_KEYS] as const;
type Key = (typeof ALL_KEYS)[number];

/** Strict schema for the structured output. Missing values come back as 0 / "" with confidence 0, nulls are applied here. */
const LABEL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [...ALL_KEYS, "confidence"],
  properties: {
    ...Object.fromEntries(TEXT_KEYS.map((k) => [k, { type: "string" }])),
    ...Object.fromEntries(NUMERIC_KEYS.map((k) => [k, { type: "number" }])),
    confidence: {
      type: "object",
      additionalProperties: false,
      required: [...ALL_KEYS],
      properties: Object.fromEntries(ALL_KEYS.map((k) => [k, { type: "number" }])),
    },
  },
};

const SYSTEM = `You read photos of packaged-food nutrition labels and transcribe them.

Rules:
- Report values for ONE serving as printed on the label (not per container, and not per 100 g unless that is the serving).
- Units: calories in kcal; fat, saturatedFat, carbs, fiber, sugar and protein in grams; sodium in milligrams.
- servingSize is the metric amount in the serving line with servingUnit "g" or "ml" (for "2 tbsp (32g)" use 32 and "g"). When only a count is printed, use the count and the unit word (1 and "bar").
- name is the product name when visible, otherwise a short generic description. brand is the brand when visible, otherwise "".
- confidence is a number from 0 to 1 per field: 1 when printed and clearly legible, around 0.5 when partly obscured, cropped or inferred, 0 when the label does not show it (then give 0 or "" as the value).
- Transcribe; never estimate nutrition from the food's appearance.`;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/**
 * POST /api/nutrition/foods/scan — { image: data URL | base64, mediaType? }
 * → { fields, confidence, model }. 501 when ANTHROPIC_API_KEY isn't set so the
 * review screen falls back to manual entry. The key never reaches the client.
 */
export async function POST(request: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const anthropic = getClient();
  if (!anthropic) return NextResponse.json({ error: "Label reading is not configured on this server." }, { status: 501 });

  const body = await request.json().catch(() => null);
  const parsed = parseImage(body);
  if (!parsed) return NextResponse.json({ error: "image (base64 jpeg/png/webp/gif) is required" }, { status: 400 });
  if (parsed.bytes > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image is too large (5 MB max)." }, { status: 413 });

  try {
    const response = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2048,
      // A classifier false positive on a food photo re-runs on Anthropic's recommended fallback instead of failing the scan.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: LABEL_SCHEMA } },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: parsed.mediaType, data: parsed.data } },
            { type: "text", text: "Transcribe this nutrition label." },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") return NextResponse.json({ error: "The label couldn't be read from this photo." }, { status: 422 });
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "The label reader returned an unreadable result." }, { status: 502 });
    }
    return NextResponse.json({ ...normalize(raw), model: response.model });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "The label reader's API key was rejected." }, { status: 500 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "The label reader is busy — try again in a moment." }, { status: 429 });
    if (e instanceof Anthropic.BadRequestError) return NextResponse.json({ error: "That image couldn't be processed." }, { status: 400 });
    if (e instanceof Anthropic.APIConnectionError) return NextResponse.json({ error: "Couldn't reach the label reader." }, { status: 502 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: `Label reader error (${e.status ?? "?"}).` }, { status: 502 });
    throw e;
  }
}

function parseImage(body: unknown): { data: string; mediaType: MediaType; bytes: number } | null {
  if (!body || typeof body !== "object") return null;
  const { image, mediaType } = body as { image?: unknown; mediaType?: unknown };
  if (typeof image !== "string" || image.length < 64) return null;
  let data = image.trim();
  let type: string | null = typeof mediaType === "string" ? mediaType : null;
  const m = /^data:(image\/[a-z]+);base64,([\s\S]*)$/.exec(data);
  if (m) {
    type = m[1];
    data = m[2];
  }
  if (!type || !(MEDIA_TYPES as readonly string[]).includes(type)) return null;
  data = data.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]+=*$/.test(data)) return null;
  return { data, mediaType: type as MediaType, bytes: Math.floor((data.length * 3) / 4) };
}

/** Coerce the model's output into the review-form shape: unknown fields (confidence 0) become null. */
function normalize(raw: Record<string, unknown>) {
  const conf = (raw.confidence && typeof raw.confidence === "object" ? raw.confidence : {}) as Record<string, unknown>;
  const confidence: Partial<Record<Key, number>> = {};
  const fields: Partial<Record<Key, string | number | null>> = {};
  for (const k of ALL_KEYS) {
    const c = Number(conf[k]);
    confidence[k] = Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0;
  }
  for (const k of TEXT_KEYS) {
    const v = typeof raw[k] === "string" ? (raw[k] as string).trim() : "";
    fields[k] = v && confidence[k]! > 0 ? v : null;
  }
  for (const k of NUMERIC_KEYS) {
    const n = Number(raw[k]);
    fields[k] = Number.isFinite(n) && confidence[k]! > 0 ? Math.round(n * 100) / 100 : null;
  }
  if (!fields.servingUnit) fields.servingUnit = "g";
  return { fields, confidence };
}
