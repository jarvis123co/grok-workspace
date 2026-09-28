import assert from "node:assert/strict";
import test from "node:test";
import { blankAnalysis, normalizeModelPayload, type Sample } from "./schema.ts";
import { buildReport, compareGroups } from "./stats.ts";

function sample(id: string, label: Sample["label"], attrs: Record<string, string>): Sample {
  const analysis = blankAnalysis("test");
  analysis.analyzedAt = 1;
  for (const [key, value] of Object.entries(attrs)) {
    analysis.fields[key] = {
      value,
      confidence: "high",
      aiValue: value,
      aiConfidence: "high",
      edited: false,
    };
  }
  return {
    id,
    fileName: `${id}.jpg`,
    width: 10,
    height: 10,
    bytes: 10,
    createdAt: 1,
    label,
    tags: id === "c" ? ["night"] : [],
    notes: "",
    analysis,
    url: "",
  };
}

test("normalize keeps allowed values and drops identity-sized junk", () => {
  const parsed = normalizeModelPayload({
    observations: "A seated figure in a dim room.",
    attributes: {
      light_quality: { value: "Soft", confidence: "high" },
      subject_count: { value: "1", confidence: "high" },
      dominant_colors: { value: ["black", "gold", "not a real color name that is very long and should be custom"], confidence: "medium" },
      face_shape: { value: "not visible", confidence: "not_visible" },
    },
  });
  assert.equal(parsed.attributes.light_quality.value, "soft");
  assert.equal(parsed.attributes.subject_count.value, "1");
  assert.equal(parsed.attributes.face_shape.confidence, "not_visible");
  assert.equal(parsed.attributes.pose.value, "not visible");
  assert.ok(parsed.attributes.dominant_colors.value.includes("black"));
  assert.ok(parsed.attributes.dominant_colors.value.includes("gold"));
});

test("small libraries do not produce strong profile claims", () => {
  const report = buildReport([
    sample("a", "like", { light_quality: "soft", saturation: "muted" }),
    sample("b", "dislike", { light_quality: "hard", saturation: "vivid" }),
  ]);
  assert.equal(report.profile.strong.length, 0);
  assert.equal(report.profile.moderate.length, 0);
  assert.equal(report.distinctions.length, 0);
  assert.match(report.caution ?? "", /hint/i);
  assert.equal(report.likeTop[0]?.value, "muted");
});

test("liked soft light separates from disliked hard light once counts are enough", () => {
  const likes = ["a", "b", "c", "d", "e"].map((id) => sample(id, "like", { light_quality: "soft" }));
  const dislikes = ["f", "g", "h", "i"].map((id) => sample(id, "dislike", { light_quality: "hard" }));
  const report = buildReport([...likes, ...dislikes]);
  const row = report.distinctions.find((item) => item.key === "light_quality" && item.value === "soft");
  assert.ok(row);
  assert.equal(row?.favored, "like");
  assert.ok((row?.delta ?? 0) > 0.5);
  const compared = compareGroups([...likes, ...dislikes], { kind: "label", label: "like" }, { kind: "label", label: "dislike" });
  assert.equal(compared.aAnalyzed, 5);
  assert.equal(compared.bAnalyzed, 4);
  const soft = compared.rows.find((item) => item.key === "light_quality" && item.value === "soft");
  assert.equal(soft?.aCount, 5);
  assert.equal(soft?.bCount, 0);
});

test("user-corrected values are what the counts use", () => {
  const liked = sample("a", "like", { light_quality: "hard" });
  liked.analysis!.fields.light_quality = {
    value: "soft",
    confidence: "high",
    aiValue: "hard",
    aiConfidence: "high",
    edited: true,
  };
  const report = buildReport([liked]);
  assert.equal(report.likeTop.find((row) => row.key === "light_quality")?.value, "soft");
  assert.equal(report.counts.edits, 1);
});

test("markdown does not contain an image prompt section", () => {
  const markdown = buildReport([sample("a", "core", { mood_primary: "calm" })]);
  const text = JSON.stringify(markdown);
  assert.equal(text.includes("image prompt generation"), false);
  assert.equal(markdown.profile.strong.length, 0);
});
