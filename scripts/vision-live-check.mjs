// Explicit opt-in only: sends one synthetic color tile to the configured provider.
import { chromium } from "playwright";
import { loadVisionConfig, requestVision } from "../src/lib/asa/vision-server.ts";
import { analysisSystemPrompt, normalizeModelPayload } from "../src/lib/asa/schema.ts";
if (!process.argv.includes("--confirm-api-call"))
  throw new Error("Pass --confirm-api-call to send one API request.");
const config = loadVisionConfig();
const browser = await chromium.launch({ channel: "msedge", headless: true });
let image;
try {
  const page = await browser.newPage();
  image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#336699";
    ctx.fillRect(0, 0, 128, 128);
    return canvas.toDataURL("image/png");
  });
} finally {
  await browser.close();
}
try {
  const result = await requestVision(config, image, analysisSystemPrompt());
  const parsed = normalizeModelPayload(result.text);
  console.log(
    JSON.stringify({
      ok: true,
      provider: config.provider,
      model: config.model,
      fieldCount: Object.keys(parsed.attributes).length,
      observations: parsed.observations,
      usage: result.usage,
    }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      ok: false,
      error: error instanceof SyntaxError ? "Invalid JSON result" : error.message,
    }),
  );
  process.exitCode = 1;
}
