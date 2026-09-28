import test from "node:test";
import assert from "node:assert/strict";
import { FIELDS, analysisSystemPrompt, blankAnalysis, type Sample } from "./schema.ts";
import { ZH, zh } from "./zh.ts";
import { buildReport, toMarkdown, toProfileJson } from "./stats.ts";
import { sanitizeResearch } from "./research.ts";
import { originalTexts, parseTranslations, validateTranslationInput } from "./translation.ts";
import { requestText, loadVisionConfig } from "./vision-server.ts";

test("all schema labels and nonnumeric options have Chinese display translations", () => {
  for (const field of FIELDS)
    for (const value of [field.category, field.label, ...field.options])
      assert.ok(ZH[value] || /^[\d-]+$/.test(value), value);
  assert.equal(zh("用户原话（不改写）/ Verbatim quote"), "用户原话（不改写）");
  assert.equal(
    zh("Vision request timed out or could not connect. No automatic retry was made."),
    "图片分析请求超时或无法连接，未进行自动重试。",
  );
  assert.equal(
    zh("Analysis stored for Like.png. Correct anything that is wrong — edits override the model."),
    "Like.png 的分析已保存。请修正不准确的属性，统计以你的修正为准。",
  );
});

test("both analysis prompt languages retain identical canonical schema", () => {
  const a = analysisSystemPrompt("zh"),
    b = analysisSystemPrompt("en");
  assert.notEqual(a, b);
  for (const f of FIELDS) {
    assert.ok(a.includes(f.key));
    assert.ok(b.includes(f.key));
  }
});

test("separate exports preserve originals, identifiers and counts without mutation", () => {
  const samples: Sample[] = [
    {
      id: "a",
      fileName: "Like.png",
      width: 1,
      height: 1,
      bytes: 1,
      createdAt: 1,
      label: "like",
      tags: [],
      notes: "只喜欢这张的脸",
      url: "",
      analysis: blankAnalysis(),
      research: sanitizeResearch({
        judgments: [{ quote: "不要据此推断身材偏好", scope: "Face", label: "like" }],
      }),
    },
  ];
  const before = JSON.stringify(samples);
  const report = buildReport(samples),
    date = new Date(0);
  const translations: Record<string, string> = {
    只喜欢这张的脸: "I only like the face in this image.",
  };
  const en = toProfileJson(report, date, "en", translations),
    cn = toProfileJson(report, date, "zh");
  assert.equal(en.language, "en");
  assert.equal(cn.language, "zh-CN");
  assert.deepEqual(en.counts, cn.counts);
  assert.deepEqual(en.research, cn.research);
  assert.equal(en.textTranslations[0].original, samples[0].notes);
  assert.equal(en.textTranslations[0].englishTranslation, translations[samples[0].notes]);
  assert.equal(en.textTranslations[1].status, "not-translated");
  assert.match(toMarkdown(report, date, "en", translations), /I only like the face/);
  assert.match(toMarkdown(report, date, "zh"), /只喜欢这张的脸/);
  assert.equal(JSON.stringify(samples), before);
  assert.equal(originalTexts(report).length, 2);
});

test("translation input/output are bounded and stale translations cannot replace new originals", () => {
  assert.throws(() => validateTranslationInput({ texts: Array(31).fill("x") }));
  assert.throws(() => validateTranslationInput({ texts: ["x".repeat(12001)] }));
  assert.throws(() => validateTranslationInput({ texts: [null] }));
  assert.deepEqual(parseTranslations('{"translations":["face only"]}', ["只看脸"]), {
    只看脸: "face only",
  });
  assert.throws(() => parseTranslations('{"translations":[]}', ["原文"]));
});

test("translation sends text only, never images or API keys in payload, with no retry", async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(init?.body as string);
    assert.equal(body.messages[1].content, "原文");
    assert.ok(!JSON.stringify(body).includes("image_url"));
    assert.ok(!JSON.stringify(body).includes("test-secret"));
    return new Response(JSON.stringify({ choices: [{ message: { content: "translated" } }] }));
  };
  try {
    const config = loadVisionConfig({ ASA_VISION_PROVIDER: "glm", GLM_API_KEY: "test-secret" });
    assert.equal((await requestText(config, "translate", "原文")).text, "translated");
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = previous;
  }
});
