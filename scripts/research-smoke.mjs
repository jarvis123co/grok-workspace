import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 3840, height: 2160 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("screenshots/research-qa", { recursive: true });
try {
  await page.goto(process.env.QA_URL ?? "http://127.0.0.1:8087/");
  await page.getByRole("button", { name: "Profile", exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('input[type="file"]')?.disabled);
  assert.ok((await page.locator("body").innerText()).includes("Aesthetic Sample Analyzer"));
  assert.equal(await page.locator("vite-error-overlay").count(), 0);
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#334466";
    ctx.fillRect(0, 0, 120, 120);
    return canvas.toDataURL("image/png");
  });
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles([
      { name: "qa-a.png", mimeType: "image/png", buffer: png },
      { name: "qa-b.png", mimeType: "image/png", buffer: png },
    ]);
  await page.getByText("2 samples · 0 analyzed", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Analysis", exact: true }).click();
  await page.getByRole("button", { name: "手动填写属性 / Start manual analysis" }).click();
  await page.getByText("证据与审美画像 / Research evidence", { exact: true }).click();
  await page.getByRole("button", { name: "添加局部评价", exact: true }).click();
  await page.getByLabel("评价范围 / Scope").first().selectOption("Face");
  await page.getByLabel("局部偏好", { exact: true }).selectOption("like");
  await page
    .getByLabel("用户原话（不改写）/ Verbatim quote")
    .fill("QA: face only, no body judgment");
  await page.getByLabel("证据组：同一次拍摄共用一个代号 / Evidence cluster").fill("qa-shoot");
  await page.getByRole("button", { name: "添加条件路线", exact: true }).click();
  await page.getByLabel("什么条件下 / When").fill("QA: side view");
  await page.getByRole("button", { name: "添加成对比较", exact: true }).click();
  const options = await page
    .getByLabel("样本 B", { exact: true })
    .locator("option")
    .evaluateAll((options) => options.map((o) => o.value).filter(Boolean));
  await page.getByLabel("样本 B", { exact: true }).selectOption(options[0]);
  await page.getByLabel("比较结论", { exact: true }).selectOption("tie");
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export library", exact: true }).click();
  const download = await downloadPromise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(payload.samples.length, 2);
  const annotated = payload.samples.find((s) => s.research?.pairs.length);
  assert.equal(annotated.research.judgments[0].quote, "QA: face only, no body judgment");
  assert.equal(annotated.research.pairs[0].choice, "tie");
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('input[type="file"]')?.disabled);
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  const secondDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export library", exact: true }).click();
  const persisted = JSON.parse(await readFile(await (await secondDownloadPromise).path(), "utf8"));
  assert.deepEqual(
    persisted.samples.find((s) => s.id === annotated.id).research,
    annotated.research,
  );
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(payload)),
    });
  await page.getByText("Imported 2 samples.", { exact: true }).waitFor();
  const thirdDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export library", exact: true }).click();
  const imported = JSON.parse(await readFile(await (await thirdDownloadPromise).path(), "utf8"));
  assert.equal(imported.samples.length, 4);
  const clone = imported.samples.find((s) => s.id !== annotated.id && s.research?.pairs.length);
  assert.notEqual(clone.research.pairs[0].otherId, annotated.research.pairs[0].otherId);
  assert.ok(imported.samples.some((s) => s.id === clone.research.pairs[0].otherId));
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
    "26px",
  );
  await page.screenshot({ path: "screenshots/research-qa/profile-4k.png" });
  for (const name of ["Samples", "Analysis", "Patterns", "Compare", "Profile"]) {
    await page.getByRole("button", { name, exact: true }).click();
    assert.equal(await page.locator("vite-error-overlay").count(), 0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Analysis", exact: true }).click();
  await page.screenshot({ path: "screenshots/research-qa/analysis-mobile.png" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 4K/mobile, all views, manual annotation, quotes/routes/pairs, export, IndexedDB reload, collision remap; no page errors.",
  );
} catch (error) {
  console.error((await page.locator("body").innerText()).slice(-5000));
  await page.screenshot({ path: "screenshots/research-qa/failure.png" });
  throw error;
} finally {
  await browser.close();
}
