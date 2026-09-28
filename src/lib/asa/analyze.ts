import { createServerFn } from "@tanstack/react-start";
import { analysisSystemPrompt, normalizeModelPayload, type RawAttribute } from "./schema";

export type AnalyzeResult =
  | { ok: true; model: string; observations: string; attributes: Record<string, RawAttribute> }
  | { ok: false; error: string };

const MODEL = "grok-4.5";

export const analyzeSampleImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Missing image.");
    const image = (input as { image?: unknown }).image;
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      throw new Error("Expected an image data URL.");
    }
    if (image.length > 1_800_000) throw new Error("Image is too large to analyze. Try a smaller file.");
    return { image };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Vision analysis is not available in this environment." };

    const prompt = analysisSystemPrompt();
    let response = await callModel(apiKey, data.image, prompt, true);
    if (response.status === 400) {
      response = await callModel(apiKey, data.image, prompt, false);
    } else if (response.status === 429 || response.status >= 500) {
      response = await callModel(apiKey, data.image, prompt, true);
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const brief = detail.replace(/\s+/g, " ").slice(0, 180);
      return { ok: false, error: `Vision analysis failed (${response.status}). ${brief}`.trim() };
    }

    const body = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const text = messageText(body.choices?.[0]?.message?.content);
    if (!text) return { ok: false, error: "The model returned an empty analysis." };
    try {
      const normalized = normalizeModelPayload(text);
      return { ok: true, model: MODEL, observations: normalized.observations, attributes: normalized.attributes };
    } catch {
      return { ok: false, error: "The model returned an unreadable analysis. Try again." };
    }
  });

async function callModel(apiKey: string, image: string, prompt: string, jsonMode: boolean): Promise<Response> {
  const body: Record<string, unknown> = {
    model: MODEL,
    temperature: 0.2,
    max_tokens: 8000,
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the schema for this image. JSON only." },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ],
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
}

function messageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return String((part as { text: unknown }).text ?? "");
      return "";
    })
    .join("");
}
