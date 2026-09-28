import { zh } from "@/lib/asa/zh";
import { useMemo, useState } from "react";
import { Caution, EmptyNote, Thumb } from "@/components/asa/bits";
import { CATEGORIES, LABELS, type LabelId } from "@/lib/asa/schema";
import { compareGroups, pctLabel, sameGroup, type GroupSpec } from "@/lib/asa/stats";
import { collectTags, useLibrary } from "@/lib/asa/store";

type Preset = { name: string; a: GroupSpec; b: GroupSpec };

const PRESETS: Preset[] = [
  {
    name: "Like vs Dislike",
    a: { kind: "label", label: "like" },
    b: { kind: "label", label: "dislike" },
  },
  {
    name: "Core vs Like",
    a: { kind: "label", label: "core" },
    b: { kind: "label", label: "like" },
  },
  {
    name: "Core vs Dislike",
    a: { kind: "label", label: "core" },
    b: { kind: "label", label: "dislike" },
  },
];

function encode(spec: GroupSpec): string {
  if (spec.kind === "label") return `label:${spec.label}`;
  if (spec.kind === "tag") return `tag:${spec.tag}`;
  return "analyzed";
}

function decode(value: string): GroupSpec {
  if (value.startsWith("label:")) return { kind: "label", label: value.slice(6) as LabelId };
  if (value.startsWith("tag:")) return { kind: "tag", tag: value.slice(4) };
  return { kind: "analyzed" };
}

export function CompareView() {
  const samples = useLibrary((state) => state.samples);
  const tags = collectTags(samples);
  const select = useLibrary((state) => state.select);
  const setView = useLibrary((state) => state.setView);
  const [a, setA] = useState<GroupSpec>({ kind: "label", label: "like" });
  const [b, setB] = useState<GroupSpec>({ kind: "label", label: "dislike" });
  const [category, setCategory] = useState("all");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const result = useMemo(() => compareGroups(samples, a, b), [samples, a, b]);
  const byId = useMemo(() => new Map(samples.map((sample) => [sample.id, sample])), [samples]);
  const rows = result.rows.filter((row) => category === "all" || row.category === category);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-end gap-2 border-b border-line px-4 py-3">
        <GroupSelect label={zh("Group A")} value={a} tags={tags} onChange={setA} />
        <GroupSelect label={zh("Group B")} value={b} tags={tags} onChange={setB} />
        <label className="text-xs text-faint">
          {zh(" Category ")}
          <select
            aria-label={zh("Category")}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 block h-10 rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
          >
            <option value="all">{zh("All dimensions")}</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {zh(item)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setA(preset.a);
                setB(preset.b);
              }}
              className="h-10 rounded-md px-2 text-xs text-muted hover:bg-raised hover:text-fg"
            >
              {zh(preset.name)}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <p className="mb-2 font-mono text-xs text-faint tabular-nums">
          {zh(result.aLabel)}
          {zh(": ")}
          {zh(result.aAnalyzed)}
          {zh(" analyzed / ")}
          {zh(result.aTotal)}
          {zh(" labeled ")}
          {zh(" · ")}
          {zh(result.bLabel)}
          {zh(": ")}
          {zh(result.bAnalyzed)}
          {zh(" analyzed / ")}
          {zh(result.bTotal)}
          {zh(" labeled ")}
        </p>
        {sameGroup(a, b) ? (
          <Caution>{zh("Both sides are the same group, so every difference is zero.")}</Caution>
        ) : null}
        {result.caution ? (
          <div className="mt-2">
            <Caution>{zh(result.caution)}</Caution>
          </div>
        ) : null}
        <div className="compare-head mt-3 border-b border-line pb-1 text-xs text-faint">
          <span>{zh("Attribute")}</span>
          <span>{zh(result.aLabel)}</span>
          <span>{zh(result.bLabel)}</span>
          <span>{zh("Difference")}</span>
        </div>
        {rows.length === 0 ? (
          <div className="mt-3">
            <EmptyNote>
              {zh("No medium or high confidence traits to compare in this slice.")}
            </EmptyNote>
          </div>
        ) : (
          rows.map((row) => {
            const id = `${row.key}:${row.value}`;
            const open = openKey === id;
            return (
              <div key={id}>
                <button
                  type="button"
                  className="compare-row w-full text-left"
                  onClick={() => setOpenKey(open ? null : id)}
                >
                  <span className="min-w-0 truncate text-sm text-fg">
                    {zh(row.category)}
                    {zh(" · ")}
                    {zh(row.fieldLabel)}
                    {zh(": ")}
                    {zh(row.value)}
                  </span>
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {zh(pctLabel(row.aCount, row.aCovered))}
                  </span>
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {zh(pctLabel(row.bCount, row.bCovered))}
                  </span>
                  <span>
                    <span className="font-mono text-xs text-fg tabular-nums">
                      {zh(
                        row.delta == null
                          ? "—"
                          : `${row.delta > 0 ? "+" : ""}${Math.round(row.delta * 100)} pp`,
                      )}
                    </span>
                    <DeltaBar delta={row.delta} />
                  </span>
                </button>
                {open ? (
                  <div className="grid gap-3 py-2 sm:grid-cols-2">
                    <Reps
                      title={result.aLabel}
                      ids={row.aSampleIds}
                      byId={byId}
                      onOpen={(sampleId) => {
                        select(sampleId);
                        setView("analysis");
                      }}
                    />
                    <Reps
                      title={result.bLabel}
                      ids={row.bSampleIds}
                      byId={byId}
                      onOpen={(sampleId) => {
                        select(sampleId);
                        setView("analysis");
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function DeltaBar({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  const magnitude = Math.min(1, Math.abs(delta));
  const positive = delta >= 0;
  return (
    <span className="delta-track mt-1 block">
      <span
        className="delta-fill"
        style={{
          left: positive ? "50%" : `${50 - magnitude * 50}%`,
          width: `${magnitude * 50}%`,
          background: positive ? "var(--color-like)" : "var(--color-dislike)",
        }}
      />
    </span>
  );
}

function Reps({
  title,
  ids,
  byId,
  onOpen,
}: {
  title: string;
  ids: string[];
  byId: Map<string, import("@/lib/asa/schema").Sample>;
  onOpen: (id: string) => void;
}) {
  const shown = ids
    .slice(0, 4)
    .map((id) => byId.get(id))
    .filter((sample): sample is NonNullable<typeof sample> => Boolean(sample));
  return (
    <div>
      <p className="mb-1 text-xs text-faint">
        {zh(title)}
        {zh(" · ")}
        {zh(ids.length)}
        {zh(" sample")}
        {zh(ids.length === 1 ? "" : "s")}
      </p>
      {shown.length === 0 ? (
        <p className="text-xs text-faint">{zh("No representative image.")}</p>
      ) : (
        <div className="flex gap-1">
          {shown.map((sample) => (
            <Thumb
              key={sample.id}
              sample={sample}
              onClick={() => onOpen(sample.id)}
              className="size-12"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupSelect({
  label,
  value,
  tags,
  onChange,
}: {
  label: string;
  value: GroupSpec;
  tags: string[];
  onChange: (spec: GroupSpec) => void;
}) {
  return (
    <label className="text-xs text-faint">
      {zh(label)}
      <select
        aria-label={label}
        value={encode(value)}
        onChange={(event) => onChange(decode(event.target.value))}
        className="mt-1 block h-10 min-w-36 rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
      >
        <optgroup label={zh("Preference")}>
          {LABELS.map((item) => (
            <option key={item.id} value={`label:${item.id}`}>
              {zh(item.name)}
            </option>
          ))}
        </optgroup>
        <optgroup label={zh("Tags")}>
          {tags.length === 0 ? (
            <option value="tag:" disabled>
              {zh("No tags yet")}
            </option>
          ) : (
            tags.map((tag) => (
              <option key={tag} value={`tag:${tag}`}>
                {tag}
              </option>
            ))
          )}
        </optgroup>
        <option value="analyzed">{zh("All analyzed")}</option>
      </select>
    </label>
  );
}
