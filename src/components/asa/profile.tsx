import { useMemo, useRef } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { Button, Caution, EmptyNote, Panel } from "@/components/asa/bits";
import { copyText, downloadText, stampName } from "@/lib/asa/download";
import { buildReport, pctLabel, toMarkdown, toProfileJson, type ProfileItem } from "@/lib/asa/stats";
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
    setStatus({ status: ok ? `${name} copied.` : "Clipboard is blocked in this browser. Use download instead." });
  }

  return (
    <div className="h-full overflow-auto px-4 py-3">
      <div className="mb-3 flex flex-wrap gap-2">
        <Button tone="primary" onClick={() => downloadText(stampName("aesthetic-profile", "md"), markdown, "text/markdown")}>
          <Download className="size-4" aria-hidden="true" />
          Markdown
        </Button>
        <Button tone="line" onClick={() => void copy(markdown, "Markdown")}>
          <Copy className="size-4" aria-hidden="true" />
          Copy Markdown
        </Button>
        <Button tone="line" onClick={() => downloadText(stampName("aesthetic-profile", "json"), json, "application/json")}>
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
        Preferred analyzed {report.counts.preferredAnalyzed} · Dislike analyzed {report.counts.dislikeAnalyzed} · Corrections {report.counts.edits}
      </p>
      <ProfileBlock title="1. Strong evidence" items={report.profile.strong} empty="Nothing clears the strong bar yet. That is expected with a small library." />
      <ProfileBlock title="2. Moderate evidence" items={report.profile.moderate} empty="No moderate tendencies yet." />
      <ProfileBlock title="3. Weak / uncertain tendencies" items={report.profile.weak} empty="No weak leans recorded." />
      <ProfileBlock title="4. Explicit dislikes" items={report.profile.dislikes} empty="No trait is both common in dislikes and scarce in the preferred pool." />
      <Panel title="5. Important feature combinations">
        {report.profile.combinations.length === 0 ? (
          <EmptyNote>No pair repeats in at least two preferred samples.</EmptyNote>
        ) : (
          <ul className="space-y-1 text-sm text-fg">
            {report.profile.combinations.map((row) => (
              <li key={`${row.left}+${row.right}`}>
                {row.leftLabel} + {row.rightLabel}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">{pctLabel(row.count, row.covered)} · {row.evidence}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Library file">
        <p className="mb-2 text-sm text-muted">The working library already stays in this browser. Export includes images, labels, corrections, and analyses.</p>
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
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">{markdown}</pre>
      </Panel>
    </div>
  );
}

function ProfileBlock({ title, items, empty }: { title: string; items: ProfileItem[]; empty: string }) {
  return (
    <Panel title={title} meta={`${items.length}`}>
      {items.length === 0 ? <EmptyNote>{empty}</EmptyNote> : (
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
