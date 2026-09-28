import test from "node:test";
import assert from "node:assert/strict";
import { loadVisionConfig, visionRequest, requestVision } from "./vision-server.ts";

test("GLM uses official vision endpoint and does not put key in body", () => {
  const config = loadVisionConfig({ ASA_VISION_PROVIDER: "glm", GLM_API_KEY: "test-secret" });
  assert.equal(config.endpoint, "https://open.bigmodel.cn/api/paas/v4/chat/completions");
  const body = visionRequest(config, "data:image/png;base64,abc", "schema");
  assert.equal(JSON.stringify(body).includes("test-secret"), false);
  assert.equal("thinking" in body && body.thinking.type, "disabled");
});
test("xAI remains selectable and invalid provider is rejected", () => {
  const config = loadVisionConfig({
    ASA_VISION_PROVIDER: "xai",
    ASA_VISION_MODEL: "grok-4.5",
    XAI_API_KEY: "test-secret",
  });
  assert.equal(config.endpoint, "https://api.x.ai/v1/chat/completions");
  const body = visionRequest(config, "image", "schema");
  assert.equal("response_format" in body && body.response_format.type, "json_object");
  assert.throws(() => loadVisionConfig({ ASA_VISION_PROVIDER: "other" }), /provider/);
});
test("HTTP errors are redacted and not retried", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("private-secret", { status: 401 });
  };
  try {
    const config = loadVisionConfig({ ASA_VISION_PROVIDER: "glm", GLM_API_KEY: "test-secret" });
    await assert.rejects(
      requestVision(config, "image", "schema"),
      (error) =>
        error instanceof Error &&
        error.message.includes("401") &&
        !error.message.includes("private-secret"),
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
