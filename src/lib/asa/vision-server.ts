import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export type VisionConfig = {
  provider: "glm" | "xai";
  model: string;
  apiKey: string;
  endpoint: string;
};
export function loadVisionConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): VisionConfig {
  let local: Record<string, unknown> = {};
  const configPath = resolve(cwd, ".asa-local.json");
  if (existsSync(configPath)) {
    try {
      local = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      throw new Error("Invalid local vision configuration (.asa-local.json).");
    }
    if (!local || typeof local !== "object" || Array.isArray(local))
      throw new Error("Invalid local vision configuration.");
  }
  const provider = env.ASA_VISION_PROVIDER ?? local.provider ?? (env.GLM_API_KEY ? "glm" : "xai");
  if (provider !== "glm" && provider !== "xai")
    throw new Error("Vision provider must be glm or xai.");
  const matchingLocal = !local.provider || local.provider === provider;
  const model =
    env.ASA_VISION_MODEL ??
    (matchingLocal ? local.model : undefined) ??
    (provider === "glm" ? "glm-4.6v-flash" : "grok-4.5");
  if (typeof model !== "string" || !/^[a-zA-Z0-9._-]+$/.test(model))
    throw new Error("Invalid vision model name.");
  let apiKey = env[provider === "glm" ? "GLM_API_KEY" : "XAI_API_KEY"]?.trim() ?? "";
  const keyFile = env.ASA_VISION_KEY_FILE ?? (matchingLocal ? local.keyFile : undefined);
  if (!apiKey && typeof keyFile === "string" && keyFile) {
    try {
      apiKey = readFileSync(resolve(cwd, keyFile), "utf8")
        .replace(/^\uFEFF/, "")
        .trim();
    } catch {
      throw new Error(
        "Cannot read the configured vision key file. Check its path and permissions.",
      );
    }
  }
  if (!apiKey)
    throw new Error(
      `Configure ${provider === "glm" ? "GLM_API_KEY" : "XAI_API_KEY"} or a local key file before analysis.`,
    );
  if (/\s/.test(apiKey) || apiKey.includes("="))
    throw new Error("The key file must contain only the API key, not a shell command.");
  return {
    provider,
    model,
    apiKey,
    endpoint:
      provider === "glm"
        ? "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        : "https://api.x.ai/v1/chat/completions",
  };
}

export function visionRequest(config: VisionConfig, image: string, prompt: string) {
  return {
    model: config.model,
    temperature: 0.2,
    max_tokens: 8000,
    ...(config.provider === "glm"
      ? { thinking: { type: "disabled" } }
      : { response_format: { type: "json_object" } }),
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the schema for this image. Return a single JSON object only.",
          },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ],
  };
}

export async function requestVision(config: VisionConfig, image: string, prompt: string) {
  return requestCompletion(config, visionRequest(config, image, prompt));
}

export async function requestText(config: VisionConfig, prompt: string, text: string) {
  const body = visionRequest(config, "", prompt);
  return requestCompletion(config, {
    ...body,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: text },
    ],
  });
}

async function requestCompletion(config: VisionConfig, body: unknown) {
  // No automatic retries of billable requests; never expose raw upstream errors.
  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error("Vision request timed out or could not connect. No automatic retry was made.");
  }
  if (!response.ok) {
    const hints: Record<number, string> = {
      400: "Check model/image support or content restrictions.",
      401: "Check the API key.",
      402: "Check available API balance.",
      403: "Check model permissions or content restrictions.",
      429: "Rate limit or quota reached; check your provider console.",
    };
    throw new Error(
      `${config.provider.toUpperCase()} analysis failed (${response.status}). ${hints[response.status] ?? "Please check the provider console."}`,
    );
  }
  const result = (await response.json()) as {
    choices?: { finish_reason?: string; message?: { content?: unknown } }[];
    usage?: unknown;
  };
  const choice = result.choices?.[0];
  if (choice?.finish_reason === "length")
    throw new Error("Analysis was truncated. No partial result was saved.");
  if (typeof choice?.message?.content !== "string" || !choice.message.content.trim())
    throw new Error("The model returned no analysis text.");
  return { text: choice.message.content, usage: result.usage };
}
