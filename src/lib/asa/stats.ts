import {
  CATEGORIES,
  FIELD_BY_KEY,
  FIELDS,
  type FieldSpec,
  type LabelId,
  type Sample,
  labelName,
  statTokens,
} from "./schema.ts";
import { evidencePool, unitId } from "./research.ts";

export type Evidence = "insufficient" | "anecdotal" | "limited" | "usable";

export type FreqRow = {
  key: string;
  category: string;
  fieldLabel: string;
  value: string;
  count: number;
  covered: number;
  sampleIds: string[];
};

export type DistinctionRow = FreqRow & {
  otherCount: number;
  otherCovered: number;
  delta: number;
  favored: "like" | "dislike";
  evidence: Evidence;
};

export type ComboRow = {
  left: string;
  right: string;
  leftLabel: string;
  rightLabel: string;
  count: number;
  covered: number;
  sampleIds: string[];
  evidence: Evidence;
};

export type Contradiction = {
  kind: "shared" | "split";
  text: string;
  sampleIds: string[];
};

export type Outlier = {
  sampleId: string;
  fileName: string;
  label: LabelId;
  reason: string;
  mismatches: string[];
};

export type ProfileItem = {
  key: string;
  category: string;
  fieldLabel: string;
  value: string;
  preferredCount: number;
  preferredCovered: number;
  dislikeCount: number;
  dislikeCovered: number;
  coreCount: number;
  coreCovered: number;
  evidence: Evidence;
  statement: string;
};

export type Report = {
  research: {
    rawImages: number;
    evidenceUnits: number;
    ungrouped: number;
    unrated: number;
    excludedOrLimited: number;
    records: { sampleId: string; fileName: string; research: Sample["research"] }[];
  };
  counts: {
    total: number;
    analyzed: number;
    like: number;
    likeAnalyzed: number;
    dislike: number;
    dislikeAnalyzed: number;
    core: number;
    coreAnalyzed: number;
    neutral: number;
    neutralAnalyzed: number;
    preferredAnalyzed: number;
    edits: number;
  };
  caution: string | null;
  likeTop: FreqRow[];
  dislikeTop: FreqRow[];
  distinctions: DistinctionRow[];
  combinations: ComboRow[];
  rarePreferred: FreqRow[];
  contradictions: Contradiction[];
  outliers: Outlier[];
  insufficient: { key: string; category: string; fieldLabel: string; covered: number }[];
  profile: {
    strong: ProfileItem[];
    moderate: ProfileItem[];
    weak: ProfileItem[];
    dislikes: ProfileItem[];
    combinations: ComboRow[];
    note: string;
  };
};

export type GroupSpec =
  { kind: "label"; label: LabelId } | { kind: "tag"; tag: string } | { kind: "analyzed" };

export type CompareRow = {
  key: string;
  category: string;
  fieldLabel: string;
  value: string;
  aCount: number;
  aCovered: number;
  bCount: number;
  bCovered: number;
  delta: number | null;
  aSampleIds: string[];
  bSampleIds: string[];
};

export type CompareResult = {
  aLabel: string;
  bLabel: string;
  aTotal: number;
  bTotal: number;
  aAnalyzed: number;
  bAnalyzed: number;
  caution: string | null;
  rows: CompareRow[];
};

type ValueBag = Map<string, { value: string; count: number; sampleIds: string[] }>;

function evidenceFor(covered: number): Evidence {
  if (covered < 3) return "insufficient";
  if (covered < 5) return "anecdotal";
  if (covered < 8) return "limited";
  return "usable";
}

function pct(count: number, covered: number): number | null {
  if (covered <= 0) return null;
  return count / covered;
}

export function pctLabel(count: number, covered: number): string {
  const ratio = pct(count, covered);
  if (ratio == null) return "—";
  return `${count}/${covered} · ${Math.round(ratio * 100)}%`;
}

function traitLabel(key: string, value: string): string {
  const spec = FIELD_BY_KEY[key];
  return spec ? `${spec.category} · ${spec.label}: ${value}` : `${key}: ${value}`;
}

function coverage(samples: Sample[], spec: FieldSpec): { covered: Sample[]; bag: ValueBag } {
  const covered: Sample[] = [];
  const bag: ValueBag = new Map();
  const units = new Set<string>();
  const votes = new Set<string>();
  for (const sample of samples) {
    const tokens = statTokens(spec, sample.analysis?.fields[spec.key]);
    if (tokens.length === 0) continue;
    const unit = unitId(sample);
    if (!units.has(unit)) covered.push(sample);
    units.add(unit);
    for (const value of tokens) {
      const row = bag.get(value) ?? { value, count: 0, sampleIds: [] };
      const vote = JSON.stringify([unit, value]);
      if (!votes.has(vote)) row.count += 1;
      votes.add(vote);
      row.sampleIds.push(sample.id);
      bag.set(value, row);
    }
  }
  return { covered, bag };
}

function topRows(samples: Sample[], limit: number): FreqRow[] {
  const rows: FreqRow[] = [];
  for (const spec of FIELDS) {
    const { covered, bag } = coverage(samples, spec);
    if (covered.length === 0) continue;
    for (const row of bag.values()) {
      rows.push({
        key: spec.key,
        category: spec.category,
        fieldLabel: spec.label,
        value: row.value,
        count: row.count,
        covered: covered.length,
        sampleIds: row.sampleIds,
      });
    }
  }
  return rows
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.count / b.covered - a.count / a.covered ||
        a.fieldLabel.localeCompare(b.fieldLabel),
    )
    .slice(0, limit);
}

function analyzed(samples: Sample[]): Sample[] {
  return samples.filter((sample) => sample.analysis);
}

function byLabel(samples: Sample[], label: LabelId): Sample[] {
  return samples.filter((sample) => sample.label === label);
}

function featureSet(sample: Sample): Map<string, string> {
  const features = new Map<string, string>();
  if (!sample.analysis) return features;
  for (const spec of FIELDS) {
    if (spec.multi) continue;
    const tokens = statTokens(spec, sample.analysis.fields[spec.key]);
    if (tokens[0]) features.set(spec.key, tokens[0]);
  }
  return features;
}

function combinations(samples: Sample[], limit: number): ComboRow[] {
  const pool = analyzed(samples);
  const votes = new Set<string>();
  const counts = new Map<
    string,
    { left: string; right: string; count: number; sampleIds: string[] }
  >();
  for (const sample of pool) {
    const features: string[] = [];
    for (const spec of FIELDS) {
      for (const token of statTokens(spec, sample.analysis?.fields[spec.key])) {
        features.push(`${spec.key}=${token}`);
      }
    }
    const unique = [...new Set(features)];
    for (let i = 0; i < unique.length; i += 1) {
      for (let j = i + 1; j < unique.length; j += 1) {
        const [left, right] = [unique[i], unique[j]].sort();
        if (left.split("=")[0] === right.split("=")[0]) continue;
        const id = `${left} + ${right}`;
        const row = counts.get(id) ?? { left, right, count: 0, sampleIds: [] };
        const vote = JSON.stringify([unitId(sample), id]);
        if (!votes.has(vote)) row.count += 1;
        votes.add(vote);
        row.sampleIds.push(sample.id);
        counts.set(id, row);
      }
    }
  }
  return [...counts.values()]
    .filter((row) => row.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((row) => ({
      left: row.left,
      right: row.right,
      leftLabel: prettyFeature(row.left),
      rightLabel: prettyFeature(row.right),
      count: row.count,
      covered: new Set(
        pool
          .filter(
            (s) =>
              statTokens(
                FIELD_BY_KEY[row.left.split("=")[0]],
                s.analysis?.fields[row.left.split("=")[0]],
              ).length &&
              statTokens(
                FIELD_BY_KEY[row.right.split("=")[0]],
                s.analysis?.fields[row.right.split("=")[0]],
              ).length,
          )
          .map(unitId),
      ).size,
      sampleIds: row.sampleIds,
      evidence: evidenceFor(row.count),
    }));
}

function prettyFeature(feature: string): string {
  const index = feature.indexOf("=");
  if (index < 0) return feature;
  return traitLabel(feature.slice(0, index), feature.slice(index + 1));
}

function editCount(samples: Sample[]): number {
  let edits = 0;
  for (const sample of samples) {
    if (!sample.analysis) continue;
    if (sample.analysis.observationsEdited) edits += 1;
    for (const field of Object.values(sample.analysis.fields)) if (field.edited) edits += 1;
  }
  return edits;
}

export function buildReport(samples: Sample[]): Report {
  const likes = byLabel(samples, "like");
  const dislikes = byLabel(samples, "dislike");
  const cores = byLabel(samples, "core");
  const neutrals = byLabel(samples, "neutral");
  const likeAnalyzed = evidencePool(samples, ["like"]);
  const dislikeAnalyzed = evidencePool(samples, ["dislike"]);
  const coreAnalyzed = evidencePool(samples, ["core"]);
  const preferred = evidencePool(samples, ["like", "core"]);
  const counts = {
    total: samples.length,
    analyzed: analyzed(samples).length,
    like: likes.length,
    likeAnalyzed: likeAnalyzed.length,
    dislike: dislikes.length,
    dislikeAnalyzed: dislikeAnalyzed.length,
    core: cores.length,
    coreAnalyzed: coreAnalyzed.length,
    neutral: neutrals.length,
    neutralAnalyzed: analyzed(neutrals).length,
    preferredAnalyzed: preferred.length,
    edits: editCount(samples),
  };

  let caution: string | null = null;
  if (counts.analyzed === 0) {
    caution =
      "No analyses yet. Patterns use your labels plus corrected attributes. Nothing here is a beauty score.";
  } else if (dislikeAnalyzed.length === 0 && preferred.length > 0) {
    caution =
      "Positive-only library: recurring traits describe your positive references, not what you dislike. Negative boundaries and Like–Dislike separation are untested; negative samples are optional.";
  } else if (likeAnalyzed.length < 8 || dislikeAnalyzed.length < 8) {
    caution = `Like has ${likeAnalyzed.length} analyzed sample${likeAnalyzed.length === 1 ? "" : "s"} and Dislike has ${dislikeAnalyzed.length}. Below 8 per group, treat every percentage as a hint, not a stable finding.`;
  }

  const distinctions = buildDistinctions(likeAnalyzed, dislikeAnalyzed);
  const contradictions = buildContradictions(likeAnalyzed, dislikeAnalyzed, distinctions);
  const outliers = buildOutliers(likeAnalyzed, dislikeAnalyzed);
  const insufficient = FIELDS.map((spec) => {
    const seen = coverage(evidencePool(samples), spec).covered.length;
    return { key: spec.key, category: spec.category, fieldLabel: spec.label, covered: seen };
  }).filter((row) => row.covered < 3);

  return {
    research: {
      rawImages: samples.length,
      evidenceUnits: new Set(evidencePool(samples).map(unitId)).size,
      ungrouped: samples.filter((s) => !s.research?.cluster && !s.research?.subject).length,
      unrated: samples.filter((s) => s.label === "unrated").length,
      excludedOrLimited: samples.filter(
        (s) => s.research && (!s.research.included || s.research.validity !== "valid"),
      ).length,
      records: samples
        .filter((s) => s.research)
        .map((s) => ({ sampleId: s.id, fileName: s.fileName, research: s.research })),
    },
    counts,
    caution,
    likeTop: topRows(likeAnalyzed, 12),
    dislikeTop: topRows(dislikeAnalyzed, 12),
    distinctions,
    combinations: combinations(likeAnalyzed, 8),
    rarePreferred: rarePreferred(likeAnalyzed, dislikeAnalyzed, evidencePool(samples)),
    contradictions,
    outliers,
    insufficient,
    profile: buildProfile(
      preferred,
      dislikeAnalyzed,
      coreAnalyzed,
      new Set(preferred.map(unitId)).size,
    ),
  };
}

function buildDistinctions(likes: Sample[], dislikes: Sample[]): DistinctionRow[] {
  const rows: DistinctionRow[] = [];
  for (const spec of FIELDS) {
    const left = coverage(likes, spec);
    const right = coverage(dislikes, spec);
    if (left.covered.length < 3 || right.covered.length < 3) continue;
    const values = new Set([...left.bag.keys(), ...right.bag.keys()]);
    for (const value of values) {
      const likeRow = left.bag.get(value);
      const dislikeRow = right.bag.get(value);
      const likeCount = likeRow?.count ?? 0;
      const dislikeCount = dislikeRow?.count ?? 0;
      if (Math.max(likeCount, dislikeCount) < 2) continue;
      const likePct = likeCount / left.covered.length;
      const dislikePct = dislikeCount / right.covered.length;
      const delta = likePct - dislikePct;
      if (Math.abs(delta) < 0.2) continue;
      rows.push({
        key: spec.key,
        category: spec.category,
        fieldLabel: spec.label,
        value,
        count: delta >= 0 ? likeCount : dislikeCount,
        covered: delta >= 0 ? left.covered.length : right.covered.length,
        sampleIds: delta >= 0 ? (likeRow?.sampleIds ?? []) : (dislikeRow?.sampleIds ?? []),
        otherCount: delta >= 0 ? dislikeCount : likeCount,
        otherCovered: delta >= 0 ? right.covered.length : left.covered.length,
        delta,
        favored: delta >= 0 ? "like" : "dislike",
        evidence: evidenceFor(Math.min(left.covered.length, right.covered.length)),
      });
    }
  }
  return rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 16);
}

function rarePreferred(likes: Sample[], dislikes: Sample[], all: Sample[]): FreqRow[] {
  if (likes.length < 4) return [];
  const rows: FreqRow[] = [];
  for (const spec of FIELDS) {
    const like = coverage(likes, spec);
    const dislike = coverage(dislikes, spec);
    const overall = coverage(all, spec);
    if (like.covered.length < 4 || overall.covered.length < 4) continue;
    for (const row of like.bag.values()) {
      const likeRate = row.count / like.covered.length;
      const overallRate = (overall.bag.get(row.value)?.count ?? 0) / overall.covered.length;
      const dislikeRate = dislike.covered.length
        ? (dislike.bag.get(row.value)?.count ?? 0) / dislike.covered.length
        : 0;
      if (row.count < 2 || likeRate < 0.5 || overallRate >= 0.3 || dislikeRate > 0.15) continue;
      rows.push({
        key: spec.key,
        category: spec.category,
        fieldLabel: spec.label,
        value: row.value,
        count: row.count,
        covered: like.covered.length,
        sampleIds: row.sampleIds,
      });
    }
  }
  return rows.sort((a, b) => b.count / b.covered - a.count / a.covered).slice(0, 8);
}

function buildContradictions(
  likes: Sample[],
  dislikes: Sample[],
  distinctions: DistinctionRow[],
): Contradiction[] {
  const items: Contradiction[] = [];
  if (likes.length < 3 || dislikes.length < 3) return items;
  for (const spec of FIELDS) {
    const like = coverage(likes, spec);
    const dislike = coverage(dislikes, spec);
    if (like.covered.length < 3 || dislike.covered.length < 3) continue;
    for (const [value, likeRow] of like.bag) {
      const dislikeRow = dislike.bag.get(value);
      if (!dislikeRow || likeRow.count < 2 || dislikeRow.count < 2) continue;
      const likeRate = likeRow.count / like.covered.length;
      const dislikeRate = dislikeRow.count / dislike.covered.length;
      if (likeRate < 0.34 || dislikeRate < 0.34) continue;
      items.push({
        kind: "shared",
        text: `${spec.label}: “${value}” is common in both likes (${pctLabel(likeRow.count, like.covered.length)}) and dislikes (${pctLabel(dislikeRow.count, dislike.covered.length)}). It does not separate the labels.`,
        sampleIds: [...likeRow.sampleIds, ...dislikeRow.sampleIds],
      });
    }
    const split = [...like.bag.values()].filter(
      (row) => row.count >= 2 && row.count / like.covered.length >= 0.3,
    );
    if (split.length >= 2) {
      const [first, second] = split.sort((a, b) => b.count - a.count);
      items.push({
        kind: "split",
        text: `Within likes, ${spec.label} splits between “${first.value}” (${first.count}) and “${second.value}” (${second.count}). That may be two contexts, not one preference.`,
        sampleIds: [...first.sampleIds, ...second.sampleIds],
      });
    }
  }
  if (items.length === 0 && distinctions.length === 0 && likes.length < 5) {
    return [];
  }
  return items.slice(0, 8);
}

function buildOutliers(likes: Sample[], dislikes: Sample[]): Outlier[] {
  const modal = new Map<string, { value: string; count: number; covered: number }>();
  for (const spec of FIELDS) {
    if (spec.multi) continue;
    const { covered, bag } = coverage(likes, spec);
    let best: { value: string; count: number } | null = null;
    for (const row of bag.values()) {
      if (!best || row.count > best.count) best = row;
    }
    if (!best || covered.length < 4 || best.count / covered.length < 0.5 || best.count < 2)
      continue;
    modal.set(spec.key, { value: best.value, count: best.count, covered: covered.length });
  }
  if (modal.size < 5) return [];
  const outliers: Outlier[] = [];
  for (const sample of likes) {
    const features = featureSet(sample);
    let comparable = 0;
    let mismatches = 0;
    const details: string[] = [];
    for (const [key, mode] of modal) {
      const actual = features.get(key);
      if (!actual) continue;
      comparable += 1;
      if (actual !== mode.value) {
        mismatches += 1;
        if (details.length < 4)
          details.push(
            `${FIELD_BY_KEY[key]?.label ?? key}: ${actual} (common like is ${mode.value})`,
          );
      }
    }
    if (comparable >= 8 && mismatches / comparable >= 0.5) {
      outliers.push({
        sampleId: sample.id,
        fileName: sample.fileName,
        label: sample.label,
        reason: `Differs on ${mismatches}/${comparable} traits that are otherwise common among likes.`,
        mismatches: details,
      });
    }
  }
  for (const sample of dislikes) {
    const features = featureSet(sample);
    let comparable = 0;
    let matches = 0;
    for (const [key, mode] of modal) {
      const actual = features.get(key);
      if (!actual) continue;
      comparable += 1;
      if (actual === mode.value) matches += 1;
    }
    if (comparable >= 8 && matches / comparable >= 0.7) {
      outliers.push({
        sampleId: sample.id,
        fileName: sample.fileName,
        label: sample.label,
        reason: `Labeled Dislike, but it matches ${matches}/${comparable} traits common among likes.`,
        mismatches: [],
      });
    }
  }
  return outliers.slice(0, 8);
}

function buildProfile(
  preferred: Sample[],
  dislikes: Sample[],
  cores: Sample[],
  preferredCount: number,
) {
  const strong: ProfileItem[] = [];
  const moderate: ProfileItem[] = [];
  const weak: ProfileItem[] = [];
  const explicit: ProfileItem[] = [];
  const early = preferredCount < 3;

  for (const spec of FIELDS) {
    const pref = coverage(preferred, spec);
    const dislike = coverage(dislikes, spec);
    const core = coverage(cores, spec);
    const values = new Set([...pref.bag.keys(), ...dislike.bag.keys()]);
    for (const value of values) {
      const preferredHits = pref.bag.get(value)?.count ?? 0;
      const dislikeHits = dislike.bag.get(value)?.count ?? 0;
      const coreHits = core.bag.get(value)?.count ?? 0;
      const pRate = pref.covered.length ? preferredHits / pref.covered.length : 0;
      const dRate = dislike.covered.length ? dislikeHits / dislike.covered.length : 0;
      const coreRate = core.covered.length ? coreHits / core.covered.length : 0;
      const separation = pRate - dRate;
      const item = (tierEvidence: Evidence): ProfileItem => ({
        key: spec.key,
        category: spec.category,
        fieldLabel: spec.label,
        value,
        preferredCount: preferredHits,
        preferredCovered: pref.covered.length,
        dislikeCount: dislikeHits,
        dislikeCovered: dislike.covered.length,
        coreCount: coreHits,
        coreCovered: core.covered.length,
        evidence: tierEvidence,
        statement: statementFor(
          spec,
          value,
          preferredHits,
          pref.covered.length,
          dislikeHits,
          dislike.covered.length,
          coreHits,
          core.covered.length,
        ),
      });

      const dislikeLean =
        dislike.covered.length >= 2 && dRate >= 0.5 && dislikeHits >= 2 && pRate <= 0.25;
      if (dislikeLean && !early) {
        explicit.push(item(evidenceFor(dislike.covered.length)));
      }

      const strongHit =
        !early &&
        ((pref.covered.length >= 6 &&
          pRate >= 0.65 &&
          preferredHits >= 4 &&
          (dislike.covered.length < 3 || dRate <= 0.3)) ||
          (pref.covered.length >= 5 &&
            dislike.covered.length >= 4 &&
            separation >= 0.4 &&
            preferredHits >= 3) ||
          (core.covered.length >= 2 &&
            coreRate >= 0.75 &&
            pref.covered.length >= 3 &&
            pRate >= 0.5 &&
            preferredHits >= 2));
      const moderateHit =
        !strongHit &&
        !early &&
        ((pref.covered.length >= 4 &&
          pRate >= 0.55 &&
          preferredHits >= 2 &&
          (dislike.covered.length < 2 || dRate <= 0.4)) ||
          (pref.covered.length >= 3 &&
            dislike.covered.length >= 3 &&
            separation >= 0.3 &&
            preferredHits >= 2));
      const weakHit =
        !strongHit &&
        !moderateHit &&
        ((pref.covered.length >= 2 && pRate >= 0.5 && preferredHits >= 2) ||
          (pref.covered.length >= 3 && separation >= 0.2 && preferredHits >= 2) ||
          (early && preferredHits >= 1 && pRate >= 0.5));

      if (strongHit)
        strong.push(
          item(
            evidenceFor(
              Math.min(pref.covered.length, Math.max(dislike.covered.length, pref.covered.length)),
            ),
          ),
        );
      else if (moderateHit) moderate.push(item(evidenceFor(pref.covered.length)));
      else if (weakHit) weak.push(item(early ? "insufficient" : evidenceFor(pref.covered.length)));
    }
  }

  const byRate = (a: ProfileItem, b: ProfileItem) =>
    b.preferredCount / Math.max(1, b.preferredCovered) -
    a.preferredCount / Math.max(1, a.preferredCovered);
  strong.sort(byRate);
  moderate.sort(byRate);
  weak.sort(byRate);
  explicit.sort(
    (a, b) =>
      b.dislikeCount / Math.max(1, b.dislikeCovered) -
      a.dislikeCount / Math.max(1, a.dislikeCovered),
  );

  const note =
    "Counts are evidence units: known clusters, otherwise subject aliases, otherwise ungrouped images (not proven independent). A unit can contain multiple states and values; percentages need not sum to 100%. Scoped labels override whole-image labels; any matching exclusion wins. Limited/invalid evidence is retained but excluded. " +
    (early
      ? "Fewer than 3 analyzed likes or core references. Strong and moderate sections stay empty on purpose."
      : "Preferred pool = Like + Core Reference. User corrections override the model. High and medium confidence only. Not-visible traits are left out of the denominator. These are descriptive tendencies, not significance tests or image prompts.");

  return {
    strong: strong.slice(0, 12),
    moderate: moderate.slice(0, 12),
    weak: weak.slice(0, 12),
    dislikes: explicit.slice(0, 12),
    combinations: combinations(preferred, 8),
    note,
  };
}

function statementFor(
  spec: FieldSpec,
  value: string,
  preferredHits: number,
  preferredCovered: number,
  dislikeHits: number,
  dislikeCovered: number,
  coreHits: number,
  coreCovered: number,
): string {
  const coreBit = coreCovered > 0 ? ` Core references: ${pctLabel(coreHits, coreCovered)}.` : "";
  return `${spec.category} · ${spec.label} “${value}” — preferred ${pctLabel(preferredHits, preferredCovered)}, dislike ${pctLabel(dislikeHits, dislikeCovered)}.${coreBit}`;
}

export function groupSamples(samples: Sample[], spec: GroupSpec): Sample[] {
  if (spec.kind === "analyzed") return analyzed(samples);
  if (spec.kind === "label") return samples.filter((sample) => sample.label === spec.label);
  const tag = spec.tag.trim().toLowerCase();
  return samples.filter((sample) => sample.tags.some((item) => item.toLowerCase() === tag));
}

export function groupTitle(spec: GroupSpec): string {
  if (spec.kind === "analyzed") return "All analyzed";
  if (spec.kind === "label") return labelName(spec.label);
  return `Tag: ${spec.tag}`;
}

export function compareGroups(
  samples: Sample[],
  aSpec: GroupSpec,
  bSpec: GroupSpec,
): CompareResult {
  const aSamples = groupSamples(samples, aSpec);
  const bSamples = groupSamples(samples, bSpec);
  const aAnalyzed =
    aSpec.kind === "label" ? evidencePool(samples, [aSpec.label]) : evidencePool(aSamples);
  const bAnalyzed =
    bSpec.kind === "label" ? evidencePool(samples, [bSpec.label]) : evidencePool(bSamples);
  const rows: CompareRow[] = [];
  for (const spec of FIELDS) {
    const a = coverage(aAnalyzed, spec);
    const b = coverage(bAnalyzed, spec);
    const values = new Set([...a.bag.keys(), ...b.bag.keys()]);
    for (const value of values) {
      const aRow = a.bag.get(value);
      const bRow = b.bag.get(value);
      const aCount = aRow?.count ?? 0;
      const bCount = bRow?.count ?? 0;
      const aPct = pct(aCount, a.covered.length);
      const bPct = pct(bCount, b.covered.length);
      rows.push({
        key: spec.key,
        category: spec.category,
        fieldLabel: spec.label,
        value,
        aCount,
        aCovered: a.covered.length,
        bCount,
        bCovered: b.covered.length,
        delta: aPct == null || bPct == null ? null : aPct - bPct,
        aSampleIds: aRow?.sampleIds ?? [],
        bSampleIds: bRow?.sampleIds ?? [],
      });
    }
  }
  rows.sort((left, right) => {
    const ad = left.delta == null ? -1 : Math.abs(left.delta);
    const bd = right.delta == null ? -1 : Math.abs(right.delta);
    return bd - ad || right.aCount + right.bCount - (left.aCount + left.bCount);
  });
  const smallest = Math.min(aAnalyzed.length, bAnalyzed.length);
  let caution: string | null = null;
  if (aAnalyzed.length === 0 || bAnalyzed.length === 0) {
    caution = "One side has no analyzed samples, so frequencies cannot be compared.";
  } else if (smallest < 8) {
    caution = `Smaller side has ${smallest} analyzed sample${smallest === 1 ? "" : "s"}. Differences under 8 samples per side are exploratory.`;
  }
  return {
    aLabel: groupTitle(aSpec),
    bLabel: groupTitle(bSpec),
    aTotal: aSamples.length,
    bTotal: bSamples.length,
    aAnalyzed: aAnalyzed.length,
    bAnalyzed: bAnalyzed.length,
    caution,
    rows,
  };
}

export function sameGroup(a: GroupSpec, b: GroupSpec): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function toMarkdown(report: Report, generatedAt = new Date()): string {
  const c = report.counts;
  const section = (title: string, lines: string[]) =>
    `## ${title}\n\n${lines.length ? lines.map((line) => `- ${line}`).join("\n") : "_None at this sample size._"}\n`;
  const itemLine = (item: ProfileItem) => `${item.statement} Evidence: ${item.evidence}.`;
  const comboLine = (row: ComboRow) =>
    `${row.leftLabel} + ${row.rightLabel} (${row.count}/${row.covered}, ${row.evidence})`;
  return [
    "# Aesthetic profile",
    "",
    `Generated ${generatedAt.toISOString()}.`,
    "",
    "This profile is computed from your labels and corrected visual attributes. It is not a beauty judgment and it is not an image prompt.",
    "",
    "## Evidence base",
    "",
    `- Samples: ${c.total}`,
    `- Analyzed: ${c.analyzed}`,
    `- Like: ${c.likeAnalyzed} scoped analyses; ${c.like} whole-image labels`,
    `- Dislike: ${c.dislikeAnalyzed} scoped analyses; ${c.dislike} whole-image labels`,
    `- Core reference: ${c.coreAnalyzed} scoped analyses; ${c.core} whole-image labels`,
    `- Neutral: ${c.neutralAnalyzed} analyzed / ${c.neutral} labeled`,
    `- User corrections applied: ${c.edits}`,
    "",
    report.caution ? `> ${report.caution}\n` : "",
    section(
      "1. Stronger descriptive tendencies (not validated preferences)",
      report.profile.strong.map(itemLine),
    ),
    section("2. Moderate evidence", report.profile.moderate.map(itemLine)),
    section("3. Weak / uncertain tendencies", report.profile.weak.map(itemLine)),
    section(
      "4. Inferred dislike associations (not direct statements)",
      report.profile.dislikes.map(itemLine),
    ),
    section("5. Important feature combinations", report.profile.combinations.map(comboLine)),
    section("Research evidence", [
      `Raw images: ${report.research.rawImages}; evidence units: ${report.research.evidenceUnits}; ungrouped: ${report.research.ungrouped}; unrated: ${report.research.unrated}. Unknown groups are not proven independent.`,
      ...report.research.records.flatMap((r) => [
        ...(r.research?.judgments ?? []).map(
          (j) =>
            `${r.fileName} [${j.scope}] ${j.excluded ? "EXCLUDED" : j.label}; original quote: ${j.quote}; interpretation: ${j.interpretation}; source: ${j.source}; date: ${j.at}`,
        ),
        ...(r.research?.routes ?? []).map(
          (j) =>
            `${r.fileName} — ${j.status}: When ${j.condition}, prefer ${j.preference}; boundary ${j.boundary}; counterexample ${j.counterexample}`,
        ),
        ...(r.research?.pairs ?? []).map(
          (j) =>
            `${r.fileName} vs ${j.otherId} [${j.scope}]: ${j.choice}; quote: ${j.quote}; date: ${j.at}`,
        ),
      ]),
    ]),
    "## Method",
    "",
    report.profile.note,
    "",
    "Statistics ignore not-visible traits and low-confidence labels. Multi-value fields such as dominant colors can sum above 100%. No image prompts are included.",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function toProfileJson(report: Report, generatedAt = new Date()) {
  const pack = (items: ProfileItem[]) =>
    items.map((item) => ({
      category: item.category,
      field: item.fieldLabel,
      key: item.key,
      value: item.value,
      preferred: { count: item.preferredCount, covered: item.preferredCovered },
      dislike: { count: item.dislikeCount, covered: item.dislikeCovered },
      coreReference: { count: item.coreCount, covered: item.coreCovered },
      evidence: item.evidence,
      statement: item.statement,
    }));
  return {
    format: "aesthetic-sample-analyzer.profile",
    version: 2,
    generatedAt: generatedAt.toISOString(),
    imagePrompts: null,
    note: "No image prompts are generated. Counts are descriptive evidence units, not significance tests. Direct quotes and hypotheses are separate research records.",
    caution: report.caution,
    counts: report.counts,
    method: report.profile.note,
    strong: pack(report.profile.strong),
    moderate: pack(report.profile.moderate),
    weak: pack(report.profile.weak),
    inferredDislikes: pack(report.profile.dislikes),
    research: report.research,
    combinations: report.profile.combinations.map((row) => ({
      features: [row.leftLabel, row.rightLabel],
      count: row.count,
      covered: row.covered,
      evidence: row.evidence,
    })),
    categoriesTracked: CATEGORIES,
  };
}

export function evidenceWord(evidence: Evidence): string {
  if (evidence === "insufficient") return "insufficient";
  if (evidence === "anecdotal") return "anecdotal";
  if (evidence === "limited") return "limited samples";
  return "enough to compare";
}
