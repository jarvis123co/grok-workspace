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
        <span>Samples {report.counts.total}</span>
        <span>Analyzed {report.counts.analyzed}</span>
        <span>Like {report.counts.likeAnalyzed}/{report.counts.like}</span>
        <span>Dislike {report.counts.dislikeAnalyzed}/{report.counts.dislike}</span>
        <span>Core {report.counts.coreAnalyzed}/{report.counts.core}</span>
        <span>Neutral {report.counts.neutralAnalyzed}/{report.counts.neutral}</span>
        <span>Corrections {report.counts.edits}</span>
      </div>
      {report.caution ? <Caution>{report.caution}</Caution> : null}
      <p className="mt-3 text-xs text-faint">
        Frequencies use high and medium confidence only. Not-visible traits are excluded from the denominator. These are counts, not significance tests.
      </p>
      <Panel title="Most frequent in Like" meta={`${report.counts.likeAnalyzed} analyzed`}>
        <FreqList rows={report.likeTop} empty="No analyzed likes yet." />
      </Panel>
      <Panel title="Most frequent in Dislike" meta={`${report.counts.dislikeAnalyzed} analyzed`}>
        <FreqList rows={report.dislikeTop} empty="No analyzed dislikes yet." />
      </Panel>
      <Panel title="What separates Like from Dislike" meta="needs 3+ analyzed on each side">
        {report.distinctions.length === 0 ? (
          <EmptyNote>Not enough overlapping coverage to separate the labels yet. Add analyses, or the groups may share the same visible traits.</EmptyNote>
        ) : (
          <ul className="space-y-2">
            {report.distinctions.map((row) => (
              <li key={`${row.key}-${row.value}`} className="text-sm text-fg">
                <span className={row.favored === "like" ? "text-like" : "text-dislike"}>{row.favored === "like" ? "Like" : "Dislike"}</span>
                {" · "}
                {row.category} · {row.fieldLabel}: {row.value}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">
                  {row.favored === "like" ? pctLabel(row.count, row.covered) : pctLabel(row.otherCount, row.otherCovered)} like
                  {" · "}
                  {row.favored === "dislike" ? pctLabel(row.count, row.covered) : pctLabel(row.otherCount, row.otherCovered)} dislike
                  {" · "}
                  {Math.round(row.delta * 100)} pp
                  {" · "}
                  {evidenceWord(row.evidence)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Co-occurring traits in Like" meta={report.counts.likeAnalyzed < 4 ? "anecdotal under 4" : `${report.counts.likeAnalyzed} analyzed`}>
        {report.combinations.length === 0 ? (
          <EmptyNote>No pair shows up in at least two analyzed likes.</EmptyNote>
        ) : (
          <ul className="space-y-1 text-sm text-fg">
            {report.combinations.map((row) => (
              <li key={`${row.left}+${row.right}`}>
                {row.leftLabel} + {row.rightLabel}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">{row.count}/{row.covered} · {evidenceWord(row.evidence)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Rare but strongly preferred" meta="likes only, absent from most of the library">
        {report.counts.likeAnalyzed < 4 ? (
          <EmptyNote>Needs at least 4 analyzed likes before a trait can be called rare-but-preferred.</EmptyNote>
        ) : report.rarePreferred.length === 0 ? (
          <EmptyNote>Nothing meets that bar. Rare means under 30% of the analyzed library, in at least half of covered likes, and scarce in dislikes.</EmptyNote>
        ) : (
          <FreqList rows={report.rarePreferred} empty="" />
        )}
      </Panel>
      <Panel title="Contradictory preferences">
        {report.contradictions.length === 0 ? (
          <EmptyNote>No split or shared trait is strong enough to call a contradiction. That can simply mean the sample is still small.</EmptyNote>
        ) : (
          <ul className="space-y-2 text-sm text-fg">
            {report.contradictions.map((item) => (
              <li key={item.text}>{item.text}</li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Outlier samples">
        {report.outliers.length === 0 ? (
          <EmptyNote>Outliers need a stable like-mode across at least 5 traits and 4 analyzed likes. Until then this list stays empty.</EmptyNote>
        ) : (
          <ul className="space-y-3">
            {report.outliers.map((outlier) => {
              const sample = byId.get(outlier.sampleId);
              if (!sample) return null;
              return (
                <li key={outlier.sampleId} className="flex gap-3">
                  <Thumb sample={sample} onClick={() => focus(sample.id)} className="size-14 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-fg">{outlier.fileName}</p>
                    <p className={cnLabel(outlier.label)}>{labelName(outlier.label)}</p>
                    <p className="text-sm text-muted">{outlier.reason}</p>
                    {outlier.mismatches.length > 0 ? <p className="text-xs text-faint">{outlier.mismatches.join(" · ")}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <Panel title="Insufficient evidence" meta={`${report.insufficient.length} fields under 3 observations`}>
        {report.insufficient.length === 0 ? (
          <EmptyNote>Every tracked field has been observed at medium or high confidence in at least 3 samples.</EmptyNote>
        ) : (
          <p className="text-sm text-muted">
            {report.insufficient.map((field) => `${field.category} · ${field.fieldLabel} (${field.covered})`).join(" · ")}
          </p>
        )}
      </Panel>
    </div>
  );
}

function cnLabel(label: "like" | "neutral" | "dislike" | "core") {
  return `text-xs ${labelClass(label)}`;
}

function FreqList({ rows, empty }: { rows: FreqRow[]; empty: string }) {
  if (rows.length === 0) return <EmptyNote>{empty}</EmptyNote>;
  return (
    <ul className="space-y-1">
      {rows.map((row) => (
        <li key={`${row.key}-${row.value}`} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-fg">{row.category} · {row.fieldLabel}: {row.value}</span>
          <span className="shrink-0 font-mono text-xs text-faint tabular-nums">{pctLabel(row.count, row.covered)}</span>
        </li>
      ))}
    </ul>
  );
}
