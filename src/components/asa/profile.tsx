import { zh } from "@/lib/asa/zh";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { originalTexts, readTranslationCache, type Translations } from "@/lib/asa/translation";
import { translateProfileText } from "@/lib/asa/translate";

export function ProfileView() {
  const samples = useLibrary((state) => state.samples);
  const exportLibrary = useLibrary((state) => state.exportLibrary);
  const importLibrary = useLibrary((state) => state.importLibrary);
  const setStatus = useLibrary.setState;
  const inputRef = useRef<HTMLInputElement>(null);
  const [exportLanguage, setExportLanguage] = useState<"zh" | "en">("zh");
  const [translations, setTranslations] = useState<Translations>({});
  const [translating, setTranslating] = useState(false);
  useEffect(() => {
    const reload = () => setTranslations(readTranslationCache());
    reload();
    window.addEventListener("asa-translations-updated", reload);
    return () => window.removeEventListener("asa-translations-updated", reload);
  }, []);
  const report = useMemo(() => buildReport(samples), [samples]);
  const pending = originalTexts(report).filter((text) => !Object.hasOwn(translations, text));
  const markdown = useMemo(
    () => toMarkdown(report, new Date(), exportLanguage, translations),
    [report, exportLanguage, translations],
  );
  const json = useMemo(
    () => JSON.stringify(toProfileJson(report, new Date(), exportLanguage, translations), null, 2),
    [report, exportLanguage, translations],
  );

  async function translate() {
    const texts: string[] = [];
    for (const text of pending) {
      if (texts.length === 30 || texts.join("").length + text.length > 12000) break;
      texts.push(text);
    }
    if (!texts.length) {
      setStatus({ status: "单段文字超过翻译上限，请先分段；原文仍可正常导出。" });
      return;
    }
    if (
      !window.confirm(
        `将发送 ${texts.length} 段备注、原话或研究文字给当前配置的 API 模型进行英文翻译，不发送图片。可能消耗 API 额度；不会自动重试。是否继续？`,
      )
    )
      return;
    setTranslating(true);
    try {
      const result = await translateProfileText({ data: { texts } });
      if (!result.ok) {
        setStatus({ status: result.error });
        return;
      }
      const next = { ...translations, ...result.translations };
      setTranslations(next);
      try {
        localStorage.setItem("asa-translations-en", JSON.stringify(next));
      } catch {
        setStatus({ status: "译文已生成，但本地缓存空间不足，请立即导出英文画像保存。" });
        return;
      }
      setStatus({
        status: `已补充 ${texts.length} 段英文参考译文；原文未改变。剩余部分可再次点击翻译。`,
      });
    } catch {
      setStatus({ status: "翻译连接失败，未自动重试，原文未改变。" });
    } finally {
      setTranslating(false);
    }
  }

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
        <label className="text-sm text-muted">
          画像导出语言
          <select
            aria-label="画像导出语言"
            value={exportLanguage}
            onChange={(e) => setExportLanguage(e.target.value as "zh" | "en")}
            className="ml-2 h-10 rounded-md bg-raised px-2 text-fg"
          >
            <option value="zh">中文文件</option>
            <option value="en">English file</option>
          </select>
        </label>
        <Button
          tone="primary"
          onClick={() =>
            downloadText(
              stampName(`aesthetic-profile-${exportLanguage}`, "md"),
              markdown,
              "text/markdown",
            )
          }
        >
          <Download className="size-4" aria-hidden="true" />
          {zh(" Markdown ")}
        </Button>
        <Button tone="line" onClick={() => void copy(markdown, "Markdown")}>
          <Copy className="size-4" aria-hidden="true" />
          {zh(" Copy Markdown ")}
        </Button>
        <Button
          tone="line"
          onClick={() =>
            downloadText(
              stampName(`aesthetic-profile-${exportLanguage}`, "json"),
              json,
              "application/json",
            )
          }
        >
          <Download className="size-4" aria-hidden="true" />
          {zh(" JSON ")}
        </Button>
        <Button tone="line" onClick={() => void copy(json, "JSON")}>
          <Copy className="size-4" aria-hidden="true" />
          {zh(" Copy JSON ")}
        </Button>
      </div>
      <p className="mb-3 text-sm text-muted">
        中文与英文文件分别导出。原文始终保留；英文文件附带参考译文，未翻译内容会明确标记。导出不调用
        API。
      </p>
      {exportLanguage === "en" && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Button
            tone="line"
            disabled={translating || pending.length === 0}
            onClick={() => void translate()}
          >
            {translating ? "正在翻译，请勿重复提交…" : "补充英文译文（API）"}
          </Button>
          <span className="text-sm text-muted">
            待翻译 {pending.length} 段 · 每次最多 30 段 · 译文仅供参考，以原文为准
          </span>
        </div>
      )}
      {report.caution ? <Caution>{zh(report.caution)}</Caution> : null}
      <p className="mt-3 text-sm text-muted">{zh(report.profile.note)}</p>
      <p className="mt-1 font-mono text-xs text-faint tabular-nums">
        {zh(" Preferred analyzed ")}
        {zh(report.counts.preferredAnalyzed)}
        {zh(" · Dislike analyzed")}
        {zh(" ")}
        {zh(report.counts.dislikeAnalyzed)}
        {zh(" · Corrections ")}
        {zh(report.counts.edits)}
      </p>
      <Panel title={zh("证据基础 / Evidence base")}>
        <p className="text-base">
          {zh(" 原始图片 ")}
          {zh(report.research.rawImages)}
          {zh(" · 统计证据组 ")}
          {zh(report.research.evidenceUnits)}
          {zh(" · 待评价")}
          {zh(" ")}
          {zh(report.research.unrated)}
          {zh(" · 排除或有限 ")}
          {zh(report.research.excludedOrLimited)}
        </p>
        <p className="mt-2 text-sm text-muted">
          {zh(" 未分组 ")}
          {zh(report.research.ungrouped)}
          {zh(
            " 。计数按已知证据组合并；未知分组不等于独立。局部评价覆盖整体标签，排除优先。下面是描述性倾向，不是已验证的审美定律。 ",
          )}
        </p>
      </Panel>
      <Panel title={zh("原话、条件路线与成对比较")}>
        {report.research.records.length === 0 ? (
          <EmptyNote>{zh("在样本分析页展开“证据与审美画像”填写。")}</EmptyNote>
        ) : (
          report.research.records.map((r) => (
            <details key={r.sampleId} className="mb-3 border-b border-line pb-3">
              <summary className="cursor-pointer text-base">{r.fileName}</summary>
              {r.research?.judgments.map((j, i) => (
                <div key={i} className="my-3 text-sm">
                  <p>
                    {zh(j.scope)}
                    {zh(" · ")}
                    {zh(j.excluded ? "EXCLUDED" : j.label)}
                  </p>
                  <blockquote className="my-1 border-l-2 border-brass pl-3">
                    {j.quote || "（未记录原话）"}
                  </blockquote>
                  <p>
                    {zh("解释：")}
                    {j.interpretation || "—"}
                  </p>
                  <p className="text-muted">
                    {zh(" 来源：")}
                    {j.source || "—"}
                    {zh(" · ")}
                    {j.at}
                  </p>
                </div>
              ))}
              {r.research?.routes.map((j, i) => (
                <p key={i} className="my-3 text-sm">
                  {zh(" [")}
                  {zh(j.status)}
                  {zh("] 当 ")}
                  {j.condition}
                  {zh("，偏好 ")}
                  {j.preference}
                  {zh("。边界：")}
                  {j.boundary}
                  {zh("；反例： ")}
                  {j.counterexample}
                </p>
              ))}
              {r.research?.pairs.map((j, i) => (
                <p key={i} className="my-3 text-sm">
                  {zh(" 与 ")}
                  {samples.find((s) => s.id === j.otherId)?.fileName ?? "缺失样本"}
                  {zh(" [")}
                  {zh(j.scope)}
                  {zh("]： ")}
                  {zh(j.choice)}
                  {zh(" · ")}
                  {j.quote}
                </p>
              ))}
            </details>
          ))
        )}
      </Panel>
      <ProfileBlock
        title={zh("1. Stronger descriptive tendencies")}
        items={report.profile.strong}
        empty={zh("Nothing clears the stronger descriptive bar yet.")}
      />
      <ProfileBlock
        title={zh("2. Moderate evidence")}
        items={report.profile.moderate}
        empty={zh("No moderate tendencies yet.")}
      />
      <ProfileBlock
        title={zh("3. Weak / uncertain tendencies")}
        items={report.profile.weak}
        empty={zh("No weak leans recorded.")}
      />
      <ProfileBlock
        title={zh("4. Inferred dislike associations — not direct statements")}
        items={report.profile.dislikes}
        empty={zh("No trait is both common in dislikes and scarce in the preferred pool.")}
      />
      <Panel title={zh("5. Important feature combinations")}>
        {report.profile.combinations.length === 0 ? (
          <EmptyNote>{zh("No pair repeats in at least two preferred samples.")}</EmptyNote>
        ) : (
          <ul className="space-y-1 text-sm text-fg">
            {report.profile.combinations.map((row) => (
              <li key={`${row.left}+${row.right}`}>
                {zh(row.leftLabel)}
                {zh(" + ")}
                {zh(row.rightLabel)}
                <span className="ml-2 font-mono text-xs text-faint tabular-nums">
                  {zh(pctLabel(row.count, row.covered))}
                  {zh(" · ")}
                  {zh(row.evidence)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title={zh("Library file")}>
        <p className="mb-2 text-sm text-muted">
          {zh(
            " The working library already stays in this browser. Export includes images, labels, corrections, and analyses. ",
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button tone="line" onClick={() => void exportLibrary()}>
            <Download className="size-4" aria-hidden="true" />
            {zh(" Export library ")}
          </Button>
          <Button tone="line" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" aria-hidden="true" />
            {zh(" Import library ")}
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
      <Panel title={zh("Markdown preview")}>
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
        <EmptyNote>{zh(empty)}</EmptyNote>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.key}-${item.value}`} className="text-sm text-fg">
              {zh(item.statement)}
              <span className="ml-2 font-mono text-xs text-faint">{zh(item.evidence)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
