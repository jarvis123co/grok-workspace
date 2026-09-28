import { zh } from "@/lib/asa/zh";
import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, ScanSearch, X } from "lucide-react";
import { Button, cn, labelClass } from "@/components/asa/bits";
import { LABELS, labelName, type LabelId } from "@/lib/asa/schema";
import {
  collectTags,
  useLibrary,
  visibleSamples,
  type AnalyzedFilter,
  type SortKey,
} from "@/lib/asa/store";

export function LibraryPane() {
  const ready = useLibrary((state) => state.ready);
  const samples = useLibrary((state) => state.samples);
  const query = useLibrary((state) => state.query);
  const labelFilter = useLibrary((state) => state.labelFilter);
  const analyzedFilter = useLibrary((state) => state.analyzedFilter);
  const tagFilter = useLibrary((state) => state.tagFilter);
  const sort = useLibrary((state) => state.sort);
  const selectedId = useLibrary((state) => state.selectedId);
  const select = useLibrary((state) => state.select);
  const setView = useLibrary((state) => state.setView);
  const setQuery = useLibrary((state) => state.setQuery);
  const setLabelFilter = useLibrary((state) => state.setLabelFilter);
  const setAnalyzedFilter = useLibrary((state) => state.setAnalyzedFilter);
  const setTagFilter = useLibrary((state) => state.setTagFilter);
  const setSort = useLibrary((state) => state.setSort);
  const addFiles = useLibrary((state) => state.addFiles);
  const analyzeUnanalyzed = useLibrary((state) => state.analyzeUnanalyzed);
  const cancelBatch = useLibrary((state) => state.cancelBatch);
  const batch = useLibrary((state) => state.batch);
  const analyzingId = useLibrary((state) => state.analyzingId);
  const tags = collectTags(samples);
  const shown = visibleSamples(samples, { query, labelFilter, analyzedFilter, tagFilter, sort });
  const pending = samples.filter((sample) => !sample.analysis).length;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function takeFiles(files: FileList | File[] | null) {
    if (!ready) return;
    if (!files) return;
    void addFiles([...files]);
  }

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col", dragOver && "bg-raised")}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        takeFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <Button tone="primary" disabled={!ready} onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" aria-hidden="true" />
          {zh(" Upload ")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          disabled={!ready}
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            takeFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={zh("Search names, tags, notes, traits")}
          aria-label={zh("Search samples")}
          className="h-10 min-w-40 flex-1 rounded-md bg-raised px-2 text-sm text-fg shadow-ring placeholder:text-faint"
        />
        <select
          aria-label={zh("Sort")}
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="h-10 rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
        >
          <option value="newest">{zh("Newest")}</option>
          <option value="oldest">{zh("Oldest")}</option>
          <option value="name">{zh("Name")}</option>
          <option value="label">{zh("Label")}</option>
        </select>
        <select
          aria-label={zh("Analysis filter")}
          value={analyzedFilter}
          onChange={(event) => setAnalyzedFilter(event.target.value as AnalyzedFilter)}
          className="h-10 rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
        >
          <option value="all">{zh("All states")}</option>
          <option value="analyzed">{zh("Analyzed")}</option>
          <option value="pending">{zh("Not analyzed")}</option>
        </select>
        <select
          aria-label={zh("Tag filter")}
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          className="h-10 max-w-40 rounded-md bg-raised px-2 text-sm text-fg shadow-ring"
        >
          <option value="">{zh("All tags")}</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {pending > 0 ? (
          <Button
            tone="line"
            disabled={batch.running || Boolean(analyzingId)}
            onClick={() => void analyzeUnanalyzed()}
          >
            <ScanSearch className="size-4" aria-hidden="true" />
            {zh(
              batch.running
                ? `${batch.done}/${batch.total}`
                : `Analyze ${Math.min(8, pending)} unanalyzed`,
            )}
          </Button>
        ) : null}
        {batch.running ? (
          <Button tone="ghost" onClick={cancelBatch}>
            <X className="size-4" aria-hidden="true" />
            {zh(" Stop ")}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2">
        <FilterChip active={labelFilter === "all"} onClick={() => setLabelFilter("all")}>
          {zh("All ")}
          {zh(samples.length)}
        </FilterChip>
        {LABELS.map((label) => {
          const count = samples.filter((sample) => sample.label === label.id).length;
          return (
            <FilterChip
              key={label.id}
              active={labelFilter === label.id}
              onClick={() => setLabelFilter(label.id)}
            >
              <span className={labelClass(label.id)}>{zh(label.short)}</span> {zh(count)}
            </FilterChip>
          );
        })}
        <span className="ml-auto self-center font-mono text-xs text-faint tabular-nums">
          {zh(shown.length)}
          {zh(" shown")}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {samples.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full min-h-64 w-full flex-col items-center justify-center border border-dashed border-line px-6 text-center hover:border-brass"
          >
            <ImagePlus className="mb-3 size-6 text-brass" aria-hidden="true" />
            <p className="text-base font-medium text-fg">{zh("Drop reference images")}</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              {zh(
                " Label each one Like, Neutral, Dislike, or Core Reference. Analysis only records visible traits — it does not score beauty. ",
              )}
            </p>
          </button>
        ) : shown.length === 0 ? (
          <p className="p-6 text-sm text-muted">{zh("No samples match these filters.")}</p>
        ) : (
          <div className="library-grid">
            {shown.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  select(sample.id);
                  if (window.innerWidth < 960) setView("analysis");
                }}
                onDoubleClick={() => {
                  select(sample.id);
                  setView("analysis");
                }}
                aria-pressed={sample.id === selectedId}
                className={cn(
                  "group relative aspect-square overflow-hidden bg-raised text-left",
                  sample.id === selectedId
                    ? "outline outline-2 -outline-offset-2 outline-brass"
                    : "hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-line",
                )}
              >
                <img src={sample.url} alt="" className="h-full w-full object-cover" />
                <span
                  className={cn(
                    "absolute bottom-1 left-1 rounded-sm bg-bg/85 px-1 py-0.5 text-xs",
                    labelClass(sample.label),
                  )}
                >
                  {zh(labelName(sample.label as LabelId))}
                </span>
                {sample.analysis ? (
                  <span
                    className="absolute top-1 right-1 size-2 rounded-full bg-brass"
                    title={zh("Analyzed")}
                  />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md px-2 text-xs",
        active ? "bg-raised text-fg shadow-ring" : "text-faint hover:bg-raised hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
