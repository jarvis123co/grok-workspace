import assert from "node:assert/strict";
import test from "node:test";
import { blankAnalysis, type Sample, mergeModelAnalysis } from "./schema.ts";
import { sanitizeResearch, effectiveLabel } from "./research.ts";
import { buildReport, toProfileJson, toMarkdown } from "./stats.ts";

function sample(id: string): Sample {
  const analysis = blankAnalysis();
  analysis.fields.face_shape = {
    value: "oval",
    aiValue: "oval",
    confidence: "high",
    aiConfidence: "high",
    edited: false,
  };
  analysis.fields.hair_length = {
    value: "long",
    aiValue: "long",
    confidence: "high",
    aiConfidence: "high",
    edited: false,
  };
  return {
    id,
    fileName: id,
    width: 10,
    height: 10,
    bytes: 1,
    createdAt: 1,
    label: "like",
    tags: [],
    notes: "",
    analysis,
    url: "",
  };
}
test("scope override and exclusion precede whole-image label", () => {
  const s = sample("a");
  s.research = sanitizeResearch({
    judgments: [{ scope: "Face", label: "dislike", quote: "face only" }],
  });
  assert.equal(effectiveLabel(s, "face_shape"), "dislike");
  assert.equal(effectiveLabel(s, "hair_length"), "like");
  assert.equal(buildReport([s]).dislikeTop.find((r) => r.key === "face_shape")?.count, 1);
  s.research.judgments.push({
    ...s.research.judgments[0],
    scope: "face_shape",
    label: "like",
    excluded: true,
  });
  assert.equal(effectiveLabel(s, "face_shape"), null);
  s.analysis = mergeModelAnalysis(s.analysis, "test", "", {});
  assert.equal(effectiveLabel(s, "face_shape"), null);
});
test("same-cluster images count once for attributes and combinations", () => {
  const list = Array.from({ length: 8 }, (_, i) => ({
    ...sample(String(i)),
    research: sanitizeResearch({ cluster: "shoot-1" }),
  }));
  const r = buildReport(list);
  assert.equal(r.research.rawImages, 8);
  assert.equal(r.research.evidenceUnits, 1);
  assert.equal(r.likeTop[0].count, 1);
  assert.equal(r.likeTop[0].covered, 1);
  assert.equal(r.combinations.length, 0);
  assert.equal(r.profile.strong.length, 0);
});
test("unrated, neutral, invalid and limited remain separate", () => {
  const s = sample("a");
  s.label = "unrated";
  assert.equal(buildReport([s]).likeTop.length, 0);
  assert.equal(buildReport([s]).counts.neutral, 0);
  s.label = "neutral";
  assert.equal(buildReport([s]).counts.neutral, 1);
  for (const validity of ["limited", "invalid"] as const) {
    s.label = "like";
    s.research = sanitizeResearch({ validity });
    assert.equal(buildReport([s]).likeTop.length, 0);
  }
});
test("positive-only references do not infer dislike or require negative samples", () => {
  const report = buildReport(Array.from({ length: 10 }, (_, i) => sample(String(i))));
  assert.match(report.caution ?? "", /Positive-only/);
  assert.equal(report.profile.dislikes.length, 0);
  assert.equal(report.distinctions.length, 0);
});
test("quotes, routes and pair outcomes survive serialization and exports", () => {
  const s = sample("a");
  s.research = sanitizeResearch({
    judgments: [{ quote: "只喜欢脸", interpretation: "scope", scope: "Face", label: "like" }],
    routes: [{ condition: "side view", preference: "curve", status: "hypothesis" }],
    pairs: [
      { otherId: "b", choice: "neither" },
      { otherId: "c", choice: "tie" },
    ],
  });
  assert.deepEqual(sanitizeResearch(JSON.parse(JSON.stringify(s.research))), s.research);
  const report = buildReport([s]);
  assert.ok(toMarkdown(report).includes("只喜欢脸"));
  assert.equal(toProfileJson(report).research.records[0].research?.pairs[1].choice, "tie");
  assert.equal("explicitDislikes" in toProfileJson(report), false);
});
