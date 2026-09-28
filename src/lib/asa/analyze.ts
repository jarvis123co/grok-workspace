import { createServerFn } from "@tanstack/react-start";
import { analysisSystemPrompt, normalizeModelPayload, type RawAttribute } from "./schema";

export type AnalyzeResult =
  | { ok: true; model: string; observations: string; attributes: Record<string, RawAttribute> }
  | { ok: false; error: string };

export const analyzeSampleImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Missing image.");
    const image = (input as { image?: unknown }).image;
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      throw new Error("Expected an image data URL.");
    }
    if (image.length > 1_800_000)
      throw new Error("Image is too large to analyze. Try a smaller file.");
    const language: "zh" | "en" = (input as { language?: unknown }).language === "en" ? "en" : "zh";
    return { image, language };
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const { loadVisionConfig, requestVision } = await import("./vision-server");
    try {
      const config = loadVisionConfig();
      const result = await requestVision(config, data.image, analysisSystemPrompt(data.language));
      const normalized = normalizeModelPayload(result.text);
      return {
        ok: true,
        model: `${config.provider}/${config.model}`,
        observations: normalized.observations,
        attributes: normalized.attributes,
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof SyntaxError
            ? "The model returned an unreadable analysis. No result was saved."
            : error instanceof Error
              ? error.message
              : "Vision analysis failed.",
      };
    }
  });
