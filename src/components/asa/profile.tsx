import { useMemo, useRef } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { Button, Caution, EmptyNote, Panel } from "@/components/asa/bits";
import { copyText, downloadText, stampName } from "@/lib/asa/download";
import {
  buildReport,
  pctLabel,
  toMarkdown,
  toProfileJson,
  type ProfileItem,
} from "@/lib/asa/stats";
import { useLibrary } from "@/lib/asa/store";

export function ProfileView() {
  const samples = useLibrary((state) => state.samples);
  const exportLibrary = useLibrary((state) => state.exportLibrary);
  const importLibrary = useLibrary((state) => state.importLibrary);
  const setStatus = useLibrary.setState;
  const inputRef = useRef<HTMLInputElement>(null);
  const report = useMemo(() => buildReport(samples), [samples]);
  const markdown = useMemo(() => toMarkdown(report), [report]);
  const json = useMemo(() => JSON.stringify(toProfileJson(report), null, 2), [report]);

  async function copy(text: string, name: string) {
    const ok = await copyText(text);
    setStatus({
      status: ok
        ? `${name} copied.`
        : "Clipboard is blocked in this browser. Use download instead.",
    });
  }

  return (
    <div className="h-full overflow-auto px-4 py-3">
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          tone="primary"
          onClick={() =>
            downloadText(stampName("aesthetic-profile", "md"), markdown, "text/markdown")
          }
        >
          <Download className="size-4" aria-hidden="true" />
          Markdown
        </Button>
        <Button tone="line" onClick={() => void copy(markdown, "Markdown")}>
          <Copy className="size-4" aria-hidden="true" />
          Copy Markdown
        </Button>
        <Button
          tone="line"
          onClick={() =>
            downloadText(stampName("aesthetic-profile", "json"), json, "application/json")
          }
        >
          <Download className="size-4" aria-hidden="true" />
          JSON
        </Button>
        <Button tone="line" onClick={() => void copy(json, "JSON")}>
          <Copy className="size-4" aria-hidden="true" />
          Copy JSON
        </Button>
      </div>
      {report.caution ? <Caution>{report.caution}</Caution> : null}
      <p className="mt-3 text-sm text-muted">{report.profile.note}</p>
      <p className="mt-1 font-mono text-xs text-faint tabular-nums">
        Preferred analyzed {report.counts.preferredAnalyzed} · Dislike analyzed{" "}
        {report.counts.dislikeAnalyzed} · Corrections {report.counts.edits}
      </p>
      <Panel title="证据基础 / Evidence base">
        <p className="text-base">
          原始图片 {report.research.rawImages} · 统计证据组 {report.research.evidenceUnits} · 待评价{" "}
          {report.research.unrated} · 排除或有限 {report.research.excludedOrLimited}
        </p>
        <p className="mt-2 text-sm text-muted">
          未分组 {report.research.ungrouped}
          。计数按已知证据组合并；未知分组不等于独立。局部评价覆盖整体标签，排除优先。下面是描述性倾向，不是已验证的审美定律。
        </p>
      </Panel>
      <Panel title="原话、条件路线与成对比较">
        {report.research.records.length === 0 ? (
          <EmptyNote>在样本分析页展开“证据与审美画像”填写。</EmptyNote>
        ) : (
          report.research.records.map((r) => (
            <details key={r.sampleId} className="mb-3 border-b border-line pb-3">
              <summary className="cursor-pointer text-base">{r.fileName}</summary>
              {r.research?.judgments.map((j, i) => (
                <div key={i} className="my-3 text-sm">
                  <p>
                    {j.scope} · {j.excluded ? "EXCLUDED" : j.label}
                  </p>
                  <blockquote className="my-1 border-l-2 border-brass pl-3">
                    {j.quote || "（未记录原话）"}
                  </blockquote>
                  <p>解释：{j.interpretation || "—"}</p>
                  <p className="text-muted">
                    来源：{j.source || "—"} · {j.at}
                  </p>
                </div>
              ))}
              {r.research?.routes.map((j, i) => (
                <p key={i} className="my-3 text-sm">
                  [{j.status}] 当 {j.condition}，偏好 {j.preference}。边界：{j.boundary}；反例：
                  {j.counterexample}
                </p>
              ))}
              {r.research?.pairs.map((j, i) => (
                <p key={i} className="my-3 text-sm">
                  与 {samples.find((s) => s.id === j.otherId)?.fileName ?? "缺失样本"} [{j.scope}]：
                  {j.choice} · {j.quote}
                </p>
              ))}
            </details>
          ))
        )}
      </Panel>
      <ProfileBlock
        title="1. Stronger descriptive tendencies"
        items={report.profile.strong}
        empty="Nothing clears the stronger descriptive bar yet."
      />
      <ProfileBlock
        title="2. Moderate evidence"
        items={report.profile.moderate}
        empty="No moderate tendencies yet."
      />
      <ProfileBlock
        title="3. Weak / uncertain tendencies"
        items={report.profile.weak}
        empty="No weak leans recorded."
      />
      <ProfileBlock
        title="4. Inferred dislike associations — not direct statements"
        items={report.profile.dislikes}
        empty="No trait is both common in dislikes and scarce in the preferred pool."
      />
      <Panel title="5. Important feature combinations">
        {report.profile.combinations.length === 0 ? (
          <EmptyNote>No pair repeats in at least two preferred samples.</EmptyNote>
        ) : (
          <ul className="space-y-1 text-sm text-fg">
            {report.profile.combinations.map((row) => (
              <li key={`${row.left}+${row.right}`}>
                {row.leftLabel} + {row.rightLabel}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">
                  {pctLabel(row.count, row.covered)} · {row.evidence}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Library file">
        <p className="mb-2 text-sm text-muted">
          The working library already stays in this browser. Export includes images, labels,
          corrections, and analyses.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button tone="line" onClick={() => void exportLibrary()}>
            <Download className="size-4" aria-hidden="true" />
            Export library
          </Button>
          <Button tone="line" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            Import library
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void importLibrary(file);
            }}
          />
        </div>
      </Panel>
      <Panel title="Markdown preview">
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
          {markdown}
        </pre>
      </Panel>
    </div>
  );
}

function ProfileBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: ProfileItem[];
  empty: string;
}) {
  return (
    <Panel title={title} meta={`${items.length}`}>
      {items.length === 0 ? (
        <EmptyNote>{empty}</EmptyNote>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.key}-${item.value}`} className="text-sm text-fg">
              {item.statement}
              <span className="ml-2 font-mono text-xs text-faint">{item.evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
