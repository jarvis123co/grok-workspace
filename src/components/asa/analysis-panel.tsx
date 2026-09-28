import { zh } from "@/lib/asa/zh";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { RotateCcw, ScanSearch, Trash2 } from "lucide-react";
import { Button, cn, labelClass } from "@/components/asa/bits";
import {
  CATEGORIES,
  FIELDS,
  LABELS,
  NOT_VISIBLE,
  CONFIDENCE_LEVELS,
  joinMulti,
  optionsFor,
  splitMulti,
  type Confidence,
  type Sample,
} from "@/lib/asa/schema";
import { collectTags, useLibrary } from "@/lib/asa/store";
import { ResearchEditor } from "./research-editor";

const CONFIDENCE_NAME: Record<Confidence, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
  not_visible: "Hidden",
};

function categoryId(category: string) {
  return `cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function AnalysisPanel({ variant }: { variant: "dock" | "page" }) {
  const samples = useLibrary((state) => state.samples);
  const selectedId = useLibrary((state) => state.selectedId);
  const analyzingId = useLibrary((state) => state.analyzingId);
  const sample = samples.find((item) => item.id === selectedId) ?? null;
  const tags = collectTags(samples);
  if (!sample) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="max-w-xs text-sm text-muted">
          {zh(
            "Select a sample. The model will describe what is visible. You decide whether it belongs.",
          )}
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "min-h-0 bg-surface",
        variant === "page" ? "analysis-layout h-full" : "flex h-full flex-col",
      )}
    >
      <SampleMeta
        sample={sample}
        tags={tags}
        variant={variant}
        busy={analyzingId === sample.id}
        locked={Boolean(analyzingId)}
      />
      <AttributeEditor sample={sample} />
    </div>
  );
}

function SampleMeta({
  sample,
  tags,
  variant,
  busy,
  locked,
}: {
  sample: Sample;
  tags: string[];
  variant: "dock" | "page";
  busy: boolean;
  locked: boolean;
}) {
  const setLabel = useLibrary((state) => state.setLabel);
  const promptLanguage = useLibrary((state) => state.promptLanguage);
  const setPromptLanguage = useLibrary((state) => state.setPromptLanguage);
  const setNotes = useLibrary((state) => state.setNotes);
  const addTag = useLibrary((state) => state.addTag);
  const removeTag = useLibrary((state) => state.removeTag);
  const analyzeOne = useLibrary((state) => state.analyzeOne);
  const remove = useLibrary((state) => state.remove);
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const suggestions = tags
    .filter((tag) => !sample.tags.some((item) => item.toLowerCase() === tag.toLowerCase()))
    .slice(0, 8);

  return (
    <div
      className={cn(
        "border-b border-line p-3",
        variant === "page" ? "min-h-0 overflow-auto lg:border-b-0 lg:border-r" : "shrink-0",
      )}
    >
      <div className={cn("mb-3 overflow-hidden bg-bg", variant === "dock" ? "h-40" : "h-56")}>
        <img
          src={sample.url}
          alt={sample.fileName}
          className="h-full w-full object-contain outline outline-1 -outline-offset-1 outline-white/10"
        />
      </div>
      <p className="truncate text-sm text-fg" title={sample.fileName}>
        {sample.fileName}
      </p>
      <p className="mt-0.5 font-mono text-xs text-faint tabular-nums">
        {zh(sample.width)}
        {zh("×")}
        {zh(sample.height)}
        {zh(sample.analysis ? ` · ${sample.analysis.model}` : " · not analyzed")}
        {sample.analysis
          ? ` · ${formatDistanceToNow(sample.analysis.analyzedAt, { addSuffix: true, locale: zhCN })}`
          : ""}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1" role="group" aria-label={zh("Preference label")}>
        {LABELS.map((label) => (
          <button
            key={label.id}
            type="button"
            aria-pressed={sample.label === label.id}
            onClick={() => setLabel(sample.id, label.id)}
            className={cn(
              "h-10 rounded-md text-xs font-medium",
              sample.label === label.id
                ? "bg-raised shadow-ring"
                : "text-faint hover:bg-raised hover:text-fg",
              sample.label === label.id && labelClass(label.id),
            )}
          >
            {zh(label.short)}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex flex-wrap gap-1">
          {sample.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(sample.id, tag)}
              className="h-7 rounded-md bg-raised px-2 text-xs text-fg hover:text-dislike"
            >
              {tag}
              {zh(" × ")}
            </button>
          ))}
        </div>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== ",") return;
            event.preventDefault();
            addTag(sample.id, draft);
            setDraft("");
          }}
          placeholder={zh("Add tag")}
          aria-label={zh("Add tag")}
          className="h-10 w-full rounded-md bg-raised px-2 text-sm text-fg shadow-ring placeholder:text-faint"
        />
        {suggestions.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(sample.id, tag)}
                className="h-7 rounded-md px-2 text-xs text-faint hover:bg-raised hover:text-fg"
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <textarea
        value={sample.notes}
        onChange={(event) => setNotes(sample.id, event.target.value)}
        rows={3}
        placeholder={zh("Notes stay local. They are not sent for analysis.")}
        aria-label={zh("Notes")}
        className="mt-3 w-full resize-y rounded-md bg-raised px-2 py-1.5 text-sm text-fg shadow-ring placeholder:text-faint"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="text-sm text-muted">
          分析提示词语言
          <select
            aria-label="分析提示词语言"
            className="ml-2 h-10 rounded-md bg-raised px-2 text-fg"
            value={promptLanguage}
            onChange={(e) => setPromptLanguage(e.target.value as "zh" | "en")}
            disabled={locked}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <Button tone="primary" disabled={locked} onClick={() => void analyzeOne(sample.id)}>
          <ScanSearch className="size-4" aria-hidden="true" />
          {zh(busy ? "Analyzing…" : sample.analysis ? "Re-analyze" : "Analyze")}
        </Button>
        {confirmDelete ? (
          <>
            <Button tone="danger" onClick={() => void remove(sample.id)}>
              {zh("Delete")}
            </Button>
            <Button tone="ghost" onClick={() => setConfirmDelete(false)}>
              {zh("Keep")}
            </Button>
          </>
        ) : (
          <Button tone="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden="true" />
            {zh(" Delete ")}
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-faint">
        {zh(
          " Observable traits only. Your edits replace the model in every later count. Re-analyze keeps those edits. ",
        )}
      </p>
    </div>
  );
}

function AttributeEditor({ sample }: { sample: Sample }) {
  const setField = useLibrary((state) => state.setField);
  const restoreField = useLibrary((state) => state.restoreField);
  const setObservations = useLibrary((state) => state.setObservations);
  const restoreObservations = useLibrary((state) => state.restoreObservations);
  const grouped = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        fields: FIELDS.filter((field) => field.category === category),
      })),
    [],
  );

  if (!sample.analysis) {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <ResearchEditor sample={sample} />
        <Button onClick={() => useLibrary.getState().startManual(sample.id)}>
          {zh("手动填写属性 / Start manual analysis")}
        </Button>
        <p className="text-sm text-muted">
          {zh(
            "Not analyzed yet. Run Analyze to fill the schema. You can still label, tag, and note this sample.",
          )}
        </p>
      </div>
    );
  }

  const analysis = sample.analysis;
  return (
    <div className="min-h-0 flex-1 overflow-auto px-3 pb-6">
      <ResearchEditor sample={sample} />
      <label className="mt-3 block text-xs text-faint" htmlFor="jump-category">
        {zh("Jump to category")}
      </label>
      <select
        id="jump-category"
        className="mt-1 h-10 w-full rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
        defaultValue=""
        onChange={(event) => {
          const node = document.getElementById(event.target.value);
          node?.scrollIntoView({ block: "start" });
        }}
      >
        <option value="" disabled>
          {zh("Category")}
        </option>
        {CATEGORIES.map((category) => (
          <option key={category} value={categoryId(category)}>
            {zh(category)}
          </option>
        ))}
      </select>
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs text-faint">{zh("Observations")}</p>
          {analysis.observationsEdited ? (
            <button
              type="button"
              onClick={() => restoreObservations(sample.id)}
              className="inline-flex items-center gap-1 text-xs text-brass"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              {zh(" Restore ")}
            </button>
          ) : null}
        </div>
        <textarea
          value={analysis.observations}
          onChange={(event) => setObservations(sample.id, event.target.value)}
          rows={3}
          aria-label={zh("Observations")}
          className="w-full resize-y rounded-md bg-raised px-2 py-1.5 text-sm text-fg shadow-ring"
        />
      </div>
      {grouped.map((group) => (
        <div key={group.category} id={categoryId(group.category)} className="mt-4">
          <h3 className="cat-head py-1 text-xs font-medium tracking-wide text-brass uppercase">
            {zh(group.category)}
          </h3>
          {group.fields.map((spec) => {
            const field = analysis.fields[spec.key];
            if (!field) return null;
            return (
              <div key={spec.key} className="field-row">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted">{zh(spec.label)}</p>
                  {field.edited ? (
                    <button
                      type="button"
                      onClick={() => restoreField(sample.id, spec.key)}
                      className="text-xs text-brass"
                    >
                      {zh(" Edited · restore ")}
                    </button>
                  ) : (
                    <p className="text-xs text-faint">{zh("Model")}</p>
                  )}
                </div>
                {spec.multi ? (
                  <div className="flex flex-wrap gap-1">
                    {optionsFor(spec, field.value)
                      .filter((option) => option !== NOT_VISIBLE)
                      .map((option) => {
                        const active = splitMulti(field.value).includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              const next = new Set(
                                splitMulti(field.value).filter((item) => item !== NOT_VISIBLE),
                              );
                              if (active) next.delete(option);
                              else next.add(option);
                              const value = next.size ? joinMulti([...next]) : NOT_VISIBLE;
                              setField(sample.id, spec.key, {
                                value,
                                confidence:
                                  value === NOT_VISIBLE
                                    ? "not_visible"
                                    : field.confidence === "not_visible"
                                      ? "medium"
                                      : field.confidence,
                              });
                            }}
                            className={cn(
                              "h-7 rounded-md px-2 text-xs",
                              active ? "bg-brass text-bg" : "bg-raised text-muted hover:text-fg",
                            )}
                          >
                            {zh(option)}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <select
                    aria-label={zh(spec.label)}
                    value={
                      optionsFor(spec, field.value).includes(field.value)
                        ? field.value
                        : NOT_VISIBLE
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setField(sample.id, spec.key, {
                        value,
                        confidence:
                          value === NOT_VISIBLE
                            ? "not_visible"
                            : field.confidence === "not_visible"
                              ? "medium"
                              : field.confidence,
                      });
                    }}
                    className="h-8 w-full rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
                  >
                    {optionsFor(spec, field.value).map((option) => (
                      <option key={option} value={option}>
                        {zh(option)}
                      </option>
                    ))}
                  </select>
                )}
                <select
                  aria-label={`${zh(spec.label)}置信度`}
                  value={field.confidence}
                  onChange={(event) =>
                    setField(sample.id, spec.key, { confidence: event.target.value as Confidence })
                  }
                  className="h-8 rounded-md bg-bg px-2 font-mono text-xs text-muted shadow-ring"
                >
                  {CONFIDENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {zh(CONFIDENCE_NAME[level])}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
