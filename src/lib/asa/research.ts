import { FIELDS, isLabelId, type LabelId, type Sample } from "./schema.ts";

export type Judgment = {
  scope: string;
  label: LabelId;
  excluded: boolean;
  quote: string;
  interpretation: string;
  source: string;
  at: string;
};
export type Route = {
  condition: string;
  preference: string;
  boundary: string;
  counterexample: string;
  status: "hypothesis" | "supported" | "rejected";
};
export type Pair = {
  otherId: string;
  scope: string;
  choice: "a" | "b" | "tie" | "neither" | "unrated";
  quote: string;
  at: string;
};
export type Research = {
  subject: string;
  state: string;
  cluster: string;
  source: string;
  validity: "valid" | "limited" | "invalid";
  included: boolean;
  judgments: Judgment[];
  routes: Route[];
  pairs: Pair[];
};
const text = (v: unknown) => (typeof v === "string" ? v.slice(0, 4000) : "");
const records = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === "object").slice(0, 500) : [];
export function sanitizeResearch(input?: unknown): Research {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  return {
    subject: text(r.subject),
    state: text(r.state),
    cluster: text(r.cluster),
    source: text(r.source),
    validity: r.validity === "invalid" || r.validity === "limited" ? r.validity : "valid",
    included: r.included !== false,
    judgments: records(r.judgments).map((j) => ({
      scope: text(j.scope) || "whole",
      label: typeof j.label === "string" && isLabelId(j.label) ? j.label : "unrated",
      excluded: j.excluded === true,
      quote: text(j.quote),
      interpretation: text(j.interpretation),
      source: text(j.source),
      at: text(j.at),
    })),
    routes: records(r.routes).map((j) => ({
      condition: text(j.condition),
      preference: text(j.preference),
      boundary: text(j.boundary),
      counterexample: text(j.counterexample),
      status: j.status === "supported" || j.status === "rejected" ? j.status : "hypothesis",
    })),
    pairs: records(r.pairs).map((j) => ({
      otherId: text(j.otherId),
      scope: text(j.scope) || "whole",
      choice:
        j.choice === "a" || j.choice === "b" || j.choice === "tie" || j.choice === "neither"
          ? j.choice
          : "unrated",
      quote: text(j.quote),
      at: text(j.at),
    })),
  };
}
export function unitId(sample: Sample): string {
  const r = sample.research;
  return r?.cluster.trim()
    ? `cluster:${r.cluster.trim()}`
    : r?.subject.trim()
      ? `subject:${r.subject.trim()}`
      : `unknown:${sample.id}`;
}
export function effectiveLabel(sample: Sample, key: string): LabelId | null {
  const r = sample.research;
  if (r && (!r.included || r.validity !== "valid")) return null;
  const category = FIELDS.find((f) => f.key === key)?.category;
  const matches = (r?.judgments ?? []).filter(
    (j) => j.scope === "whole" || j.scope === category || j.scope === key,
  );
  if (matches.some((j) => j.excluded)) return null;
  const last = (scope: string | undefined) => matches.filter((j) => j.scope === scope).at(-1);
  return (last(key) ?? last(category) ?? last("whole"))?.label ?? sample.label;
}
/** Mask fields outside each preference pool; never mutate the stored analysis. */
export function evidencePool(samples: Sample[], labels?: LabelId[]): Sample[] {
  return samples.flatMap((s) => {
    if (!s.analysis) return [];
    const fields = Object.fromEntries(
      Object.entries(s.analysis.fields).filter(([key]) => {
        const label = effectiveLabel(s, key);
        return label !== null && (!labels || labels.includes(label));
      }),
    );
    return Object.keys(fields).length ? [{ ...s, analysis: { ...s.analysis, fields } }] : [];
  });
}
