import { zh } from "@/lib/asa/zh";
import { useMemo } from "react";
import { Caution, EmptyNote, Panel, Thumb, labelClass } from "@/components/asa/bits";
import { labelName } from "@/lib/asa/schema";
import { buildReport, evidenceWord, pctLabel, type FreqRow } from "@/lib/asa/stats";
import { useLibrary } from "@/lib/asa/store";

export function PatternsView() {
  const samples = useLibrary((state) => state.samples);
  const open = useLibrary((state) => state.select);
  const setView = useLibrary((state) => state.setView);
  const report = useMemo(() => buildReport(samples), [samples]);
  const byId = useMemo(() => new Map(samples.map((sample) => [sample.id, sample])), [samples]);

  function focus(id: string) {
    open(id);
    setView("analysis");
  }

  return (
    <div className="h-full overflow-auto px-4 py-3">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-faint tabular-nums">
        <span>
          {zh("Samples ")}
          {zh(report.counts.total)}
        </span>
        <span>
          {zh("Analyzed ")}
          {zh(report.counts.analyzed)}
        </span>
        <span>
          {zh("Like: ")}
          {zh(report.counts.like)}
          {zh(" whole-image / ")}
          {zh(report.counts.likeAnalyzed)}
          {zh(" scoped analyses")}
        </span>
        <span>
          {zh("Dislike: ")}
          {zh(report.counts.dislike)}
          {zh(" whole-image / ")}
          {zh(report.counts.dislikeAnalyzed)}
          {zh(" scoped analyses")}
        </span>
        <span>
          {zh("Core: ")}
          {zh(report.counts.core)}
          {zh(" whole-image / ")}
          {zh(report.counts.coreAnalyzed)}
          {zh(" scoped analyses")}
        </span>
        <span>
          {zh("Neutral ")}
          {zh(report.counts.neutralAnalyzed)}
          {zh("/")}
          {zh(report.counts.neutral)}
        </span>
        <span>
          {zh("Corrections ")}
          {zh(report.counts.edits)}
        </span>
      </div>
      {report.caution ? <Caution>{zh(report.caution)}</Caution> : null}
      <p className="mt-3 text-xs text-faint">
        {zh(
          " Frequencies count evidence groups, not repeated photos. High and medium confidence only; scoped exclusions and limited/invalid evidence are omitted. Ungrouped images are not proven independent. These are descriptive counts, not significance tests. ",
        )}
      </p>
      <Panel title={zh("Most frequent in Like")} meta={`${report.counts.likeAnalyzed} analyzed`}>
        <FreqList rows={report.likeTop} empty={zh("No analyzed likes yet.")} />
      </Panel>
      <Panel
        title={zh("Most frequent in Dislike")}
        meta={`${report.counts.dislikeAnalyzed} analyzed`}
      >
        <FreqList rows={report.dislikeTop} empty={zh("No analyzed dislikes yet.")} />
      </Panel>
      <Panel title={zh("What separates Like from Dislike")} meta="needs 3+ analyzed on each side">
        {report.distinctions.length === 0 ? (
          <EmptyNote>
            {zh(
              "Not enough overlapping coverage to separate the labels yet. Add analyses, or the groups may share the same visible traits.",
            )}
          </EmptyNote>
        ) : (
          <ul className="space-y-2">
            {report.distinctions.map((row) => (
              <li key={`${row.key}-${row.value}`} className="text-sm text-fg">
                <span className={row.favored === "like" ? "text-like" : "text-dislike"}>
                  {zh(row.favored === "like" ? "Like" : "Dislike")}
                </span>
                {zh(" · ")}
                {zh(row.category)}
                {zh(" · ")}
                {zh(row.fieldLabel)}
                {zh(": ")}
                {zh(row.value)}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">
                  {zh(
                    row.favored === "like"
                      ? pctLabel(row.count, row.covered)
                      : pctLabel(row.otherCount, row.otherCovered),
                  )}
                  {zh(" like ")}
                  {zh(" · ")}
                  {zh(
                    row.favored === "dislike"
                      ? pctLabel(row.count, row.covered)
                      : pctLabel(row.otherCount, row.otherCovered),
                  )}
                  {zh(" dislike ")}
                  {zh(" · ")}
                  {zh(Math.round(row.delta * 100))}
                  {zh(" pp ")}
                  {zh(" · ")}
                  {zh(evidenceWord(row.evidence))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel
        title={zh("Co-occurring traits in Like")}
        meta={
          report.counts.likeAnalyzed < 4
            ? "anecdotal under 4"
            : `${report.counts.likeAnalyzed} analyzed`
        }
      >
        {report.combinations.length === 0 ? (
          <EmptyNote>{zh("No pair shows up in at least two analyzed likes.")}</EmptyNote>
        ) : (
          <ul className="space-y-1 text-sm text-fg">
            {report.combinations.map((row) => (
              <li key={`${row.left}+${row.right}`}>
                {zh(row.leftLabel)}
                {zh(" + ")}
                {zh(row.rightLabel)}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">
                  {zh(row.count)}
                  {zh("/")}
                  {zh(row.covered)}
                  {zh(" · ")}
                  {zh(evidenceWord(row.evidence))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel
        title={zh("Rare but strongly preferred")}
        meta="likes only, absent from most of the library"
      >
        {report.counts.likeAnalyzed < 4 ? (
          <EmptyNote>
            {zh("Needs at least 4 analyzed likes before a trait can be called rare-but-preferred.")}
          </EmptyNote>
        ) : report.rarePreferred.length === 0 ? (
          <EmptyNote>
            {zh(
              "Nothing meets that bar. Rare means under 30% of the analyzed library, in at least half of covered likes, and scarce in dislikes.",
            )}
          </EmptyNote>
        ) : (
          <FreqList rows={report.rarePreferred} empty={zh("")} />
        )}
      </Panel>
      <Panel title={zh("Contradictory preferences")}>
        {report.contradictions.length === 0 ? (
          <EmptyNote>
            {zh(
              "No split or shared trait is strong enough to call a contradiction. That can simply mean the sample is still small.",
            )}
          </EmptyNote>
        ) : (
          <ul className="space-y-2 text-sm text-fg">
            {report.contradictions.map((item) => (
              <li key={item.text}>{zh(item.text)}</li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title={zh("Outlier samples")}>
        {report.outliers.length === 0 ? (
          <EmptyNote>
            {zh(
              "Outliers need a stable like-mode across at least 5 traits and 4 analyzed likes. Until then this list stays empty.",
            )}
          </EmptyNote>
        ) : (
          <ul className="space-y-3">
            {report.outliers.map((outlier) => {
              const sample = byId.get(outlier.sampleId);
              if (!sample) return null;
              return (
                <li key={outlier.sampleId} className="flex gap-3">
                  <Thumb
                    sample={sample}
                    onClick={() => focus(sample.id)}
                    className="size-14 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-fg">{outlier.fileName}</p>
                    <p className={cnLabel(outlier.label)}>{zh(labelName(outlier.label))}</p>
                    <p className="text-sm text-muted">{zh(outlier.reason)}</p>
                    {outlier.mismatches.length > 0 ? (
                      <p className="text-xs text-faint">{zh(outlier.mismatches.join(" · "))}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <Panel
        title={zh("Insufficient evidence")}
        meta={`${report.insufficient.length} fields under 3 observations`}
      >
        {report.insufficient.length === 0 ? (
          <EmptyNote>
            {zh(
              "Every tracked field has been observed at medium or high confidence in at least 3 samples.",
            )}
          </EmptyNote>
        ) : (
          <p className="text-sm text-muted">
            {zh(
              report.insufficient
                .map((field) => `${field.category} · ${field.fieldLabel} (${field.covered})`)
                .join(" · "),
            )}
          </p>
        )}
      </Panel>
    </div>
  );
}

function cnLabel(label: import("@/lib/asa/schema").LabelId) {
  return `text-xs ${labelClass(label)}`;
}

function FreqList({ rows, empty }: { rows: FreqRow[]; empty: string }) {
  if (rows.length === 0) return <EmptyNote>{zh(empty)}</EmptyNote>;
  return (
    <ul className="space-y-1">
      {rows.map((row) => (
        <li
          key={`${row.key}-${row.value}`}
          className="flex items-baseline justify-between gap-3 text-sm"
        >
          <span className="min-w-0 truncate text-fg">
            {zh(row.category)}
            {zh(" · ")}
            {zh(row.fieldLabel)}
            {zh(": ")}
            {zh(row.value)}
          </span>
          <span className="shrink-0 font-mono text-xs text-faint tabular-nums">
            {zh(pctLabel(row.count, row.covered))}
          </span>
        </li>
      ))}
    </ul>
  );
}
