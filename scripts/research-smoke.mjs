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
  await page.getByRole("button", { name: "审美画像", exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('input[type="file"]')?.disabled);
  assert.ok((await page.locator("body").innerText()).includes("审美样本分析"));
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
  await page.getByText("2 张样本 · 0 已分析", { exact: true }).waitFor();
  await page.getByRole("button", { name: "属性分析", exact: true }).click();
  await page.getByLabel("分析提示词语言").selectOption("en");
  await page.getByRole("button", { name: "手动填写属性" }).click();
  await page.getByText("证据与审美画像", { exact: true }).click();
  await page.getByRole("button", { name: "添加局部评价", exact: true }).click();
  await page.getByLabel("评价范围").first().selectOption("Face");
  await page.getByLabel("局部偏好", { exact: true }).selectOption("like");
  await page.getByLabel("用户原话（不改写）").fill("QA: face only, no body judgment");
  await page.getByLabel("证据组：同一次拍摄共用一个代号").fill("qa-shoot");
  await page.getByRole("button", { name: "添加条件路线", exact: true }).click();
  await page.getByLabel("什么条件下").fill("QA: side view");
  await page.getByRole("button", { name: "添加成对比较", exact: true }).click();
  const options = await page
    .getByLabel("样本 B", { exact: true })
    .locator("option")
    .evaluateAll((options) => options.map((o) => o.value).filter(Boolean));
  await page.getByLabel("样本 B", { exact: true }).selectOption(options[0]);
  await page.getByLabel("比较结论", { exact: true }).selectOption("tie");
  await page.getByRole("button", { name: "审美画像", exact: true }).click();
  for (const language of ["zh", "en"]) {
    await page.getByLabel("画像导出语言").selectOption(language);
    const exporting = page.waitForEvent("download");
    await page.getByRole("button", { name: "JSON", exact: true }).click();
    const exported = await exporting;
    assert.ok(exported.suggestedFilename().includes(`-${language}-`));
    const profile = JSON.parse(await readFile(await exported.path(), "utf8"));
    assert.equal(profile.language, language === "zh" ? "zh-CN" : "en");
    assert.ok(
      profile.research.records.some(
        (r) => r.research?.judgments[0]?.quote === "QA: face only, no body judgment",
      ),
    );
    if (language === "en") {
      assert.equal(profile.textTranslations[0].status, "not-translated");
      let requests = 0;
      const onRequest = (req) => {
        if (req.method() === "POST") requests++;
      };
      page.on("request", onRequest);
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.getByRole("button", { name: "补充英文译文（API）", exact: true }).click();
      assert.equal(requests, 0, "declining translation must not make an API request");
      page.off("request", onRequest);
    }
    const mdDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Markdown", exact: true }).click();
    const markdown = await readFile(await (await mdDownload).path(), "utf8");
    assert.ok(markdown.startsWith(language === "zh" ? "# 审美画像" : "# Aesthetic profile"));
  }
  await page.getByLabel("画像导出语言").selectOption("zh");
  await page.evaluate(() =>
    localStorage.setItem(
      "asa-translations-en",
      JSON.stringify({
        "QA: face only, no body judgment": "QA: face only, no body judgment",
        "not in this library": "must not be exported",
      }),
    ),
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出样本库", exact: true }).click();
  const download = await downloadPromise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(payload.samples.length, 2);
  assert.equal(
    payload.englishTranslations["QA: face only, no body judgment"],
    "QA: face only, no body judgment",
  );
  assert.equal(payload.englishTranslations["not in this library"], undefined);
  const annotated = payload.samples.find((s) => s.research?.pairs.length);
  assert.equal(annotated.research.judgments[0].quote, "QA: face only, no body judgment");
  assert.equal(annotated.research.pairs[0].choice, "tie");
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('input[type="file"]')?.disabled);
  await page.getByRole("button", { name: "属性分析", exact: true }).click();
  assert.equal(await page.getByLabel("分析提示词语言").inputValue(), "en");
  await page.getByLabel("分析提示词语言").selectOption("zh");
  await page.getByRole("button", { name: "审美画像", exact: true }).click();
  const secondDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出样本库", exact: true }).click();
  const persisted = JSON.parse(await readFile(await (await secondDownloadPromise).path(), "utf8"));
  assert.deepEqual(
    persisted.samples.find((s) => s.id === annotated.id).research,
    annotated.research,
  );
  await page.evaluate(() => localStorage.removeItem("asa-translations-en"));
  await page.locator('input[type="file"]').setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload)),
  });
  await page.getByText("已导入 2 张样本。", { exact: true }).waitFor();
  const thirdDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出样本库", exact: true }).click();
  const imported = JSON.parse(await readFile(await (await thirdDownloadPromise).path(), "utf8"));
  assert.equal(imported.samples.length, 4);
  assert.equal(
    imported.englishTranslations["QA: face only, no body judgment"],
    "QA: face only, no body judgment",
  );
  const clone = imported.samples.find((s) => s.id !== annotated.id && s.research?.pairs.length);
  assert.notEqual(clone.research.pairs[0].otherId, annotated.research.pairs[0].otherId);
  assert.ok(imported.samples.some((s) => s.id === clone.research.pairs[0].otherId));
  assert.equal(
    await page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
    "26px",
  );
  await page.screenshot({ path: "screenshots/research-qa/profile-4k.png" });
  for (const name of ["样本库", "属性分析", "偏好规律", "分组比较", "审美画像"]) {
    await page.getByRole("button", { name, exact: true }).click();
    assert.equal(await page.locator("vite-error-overlay").count(), 0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "属性分析", exact: true }).click();
  await page.screenshot({ path: "screenshots/research-qa/analysis-mobile.png" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 4K/mobile, all views, prompt-language persistence, separate zh/en Markdown/JSON, translation consent cancellation, translation backup/restore, quotes/routes/pairs, IndexedDB reload, collision remap; no page errors. No live API calls.",
  );
} catch (error) {
  console.error((await page.locator("body").innerText()).slice(-5000));
  await page.screenshot({ path: "screenshots/research-qa/failure.png" });
  throw error;
} finally {
  await browser.close();
}
