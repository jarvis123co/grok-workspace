import { create } from "zustand";
import { originalTexts, readTranslationCache, sanitizeTranslations } from "./translation";
import { buildReport } from "./stats";
import { sanitizeResearch, type Research } from "./research";
import { analyzeSampleImage } from "./analyze";
import { dataUrlToBlob, fileToStoredBlob, blobToAnalysisDataUrl, blobToDataUrl } from "./image";
import { downloadText, stampName } from "./download";
import {
  blankAnalysis,
  isLabelId,
  mergeModelAnalysis,
  sanitizeAnalysis,
  touchField,
  type Analysis,
  type Confidence,
  type LabelId,
  type Sample,
} from "./schema";
import { deleteSample as deleteStored, loadAll, putSample, type PersistedSample } from "./storage";

export type ViewId = "samples" | "analysis" | "patterns" | "compare" | "profile";
export type SortKey = "newest" | "oldest" | "name" | "label";
export type AnalyzedFilter = "all" | "analyzed" | "pending";

type Batch = { running: boolean; done: number; total: number };

type LibraryState = {
  promptLanguage: "zh" | "en";
  setPromptLanguage: (language: "zh" | "en") => void;
  setResearch: (id: string, research: Research) => void;
  startManual: (id: string) => void;
  ready: boolean;
  loadError: string | null;
  samples: Sample[];
  selectedId: string | null;
  view: ViewId;
  query: string;
  labelFilter: LabelId | "all";
  analyzedFilter: AnalyzedFilter;
  tagFilter: string;
  sort: SortKey;
  status: string | null;
  analyzingId: string | null;
  batch: Batch;
  batchCancel: boolean;
  load: () => Promise<void>;
  setView: (view: ViewId) => void;
  setQuery: (query: string) => void;
  setLabelFilter: (filter: LabelId | "all") => void;
  setAnalyzedFilter: (filter: AnalyzedFilter) => void;
  setTagFilter: (tag: string) => void;
  setSort: (sort: SortKey) => void;
  select: (id: string | null) => void;
  addFiles: (files: File[]) => Promise<void>;
  setLabel: (id: string, label: LabelId) => void;
  setNotes: (id: string, notes: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  setField: (id: string, key: string, patch: { value?: string; confidence?: Confidence }) => void;
  restoreField: (id: string, key: string) => void;
  setObservations: (id: string, observations: string) => void;
  restoreObservations: (id: string) => void;
  remove: (id: string) => Promise<void>;
  analyzeOne: (id: string) => Promise<void>;
  analyzeUnanalyzed: () => Promise<void>;
  cancelBatch: () => void;
  exportLibrary: () => Promise<void>;
  importLibrary: (file: File) => Promise<void>;
};

const blobs = new Map<string, Blob>();
const writeChain = new Map<string, Promise<void>>();
const labelRank: Record<LabelId, number> = { core: 0, like: 1, neutral: 2, dislike: 3, unrated: 4 };
const BATCH_CAP = 8;

function toSample(row: PersistedSample): Sample {
  blobs.set(row.id, row.image);
  const { image, ...rest } = row;
  return { ...rest, url: URL.createObjectURL(image) };
}

function persist(sample: Sample) {
  const blob = blobs.get(sample.id);
  if (!blob) return;
  const row: PersistedSample = {
    id: sample.id,
    fileName: sample.fileName,
    width: sample.width,
    height: sample.height,
    bytes: sample.bytes,
    createdAt: sample.createdAt,
    label: sample.label,
    tags: sample.tags,
    notes: sample.notes,
    analysis: sample.analysis,
    research: sample.research,
    image: blob,
  };
  const prev = writeChain.get(sample.id) ?? Promise.resolve();
  const next = prev
    .catch(() => undefined)
    .then(() => putSample(row))
    .catch((error: unknown) => {
      useLibrary.setState({ status: error instanceof Error ? error.message : "Could not save." });
    });
  writeChain.set(sample.id, next);
}

export function visibleSamples(
  samples: Sample[],
  ui: Pick<LibraryState, "query" | "labelFilter" | "analyzedFilter" | "tagFilter" | "sort">,
): Sample[] {
  const query = ui.query.trim().toLowerCase();
  const list = samples.filter((sample) => {
    if (ui.labelFilter !== "all" && sample.label !== ui.labelFilter) return false;
    if (ui.analyzedFilter === "analyzed" && !sample.analysis) return false;
    if (ui.analyzedFilter === "pending" && sample.analysis) return false;
    if (
      ui.tagFilter &&
      !sample.tags.some((tag) => tag.toLowerCase() === ui.tagFilter.toLowerCase())
    )
      return false;
    if (!query) return true;
    const fieldText = sample.analysis
      ? Object.values(sample.analysis.fields)
          .map((field) => field.value)
          .join(" ")
      : "";
    const haystack = [
      sample.fileName,
      sample.notes,
      sample.tags.join(" "),
      sample.analysis?.observations ?? "",
      fieldText,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
  return list.sort((a, b) => {
    if (ui.sort === "oldest") return a.createdAt - b.createdAt;
    if (ui.sort === "name") return a.fileName.localeCompare(b.fileName);
    if (ui.sort === "label")
      return labelRank[a.label] - labelRank[b.label] || b.createdAt - a.createdAt;
    return b.createdAt - a.createdAt;
  });
}

export function collectTags(samples: Sample[]): string[] {
  const seen = new Map<string, string>();
  for (const sample of samples) {
    for (const tag of sample.tags) {
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export const useLibrary = create<LibraryState>((set, get) => ({
  promptLanguage: "zh",
  setPromptLanguage: (promptLanguage) => {
    set({ promptLanguage });
    try {
      localStorage.setItem("asa-prompt-language", promptLanguage);
    } catch {
      /* Optional preference only. */
    }
  },
  setResearch: (id, research) =>
    patch(set, id, (sample) => ({ ...sample, research: sanitizeResearch(research) })),
  startManual: (id) =>
    patch(set, id, (sample) => ({
      ...sample,
      analysis: sample.analysis ?? { ...blankAnalysis("manual"), analyzedAt: Date.now() },
    })),
  ready: false,
  loadError: null,
  samples: [],
  selectedId: null,
  view: "samples",
  query: "",
  labelFilter: "all",
  analyzedFilter: "all",
  tagFilter: "",
  sort: "newest",
  status: null,
  analyzingId: null,
  batch: { running: false, done: 0, total: 0 },
  batchCancel: false,

  load: async () => {
    try {
      set({ promptLanguage: localStorage.getItem("asa-prompt-language") === "en" ? "en" : "zh" });
    } catch {
      /* Storage may be unavailable. */
    }
    try {
      const rows = await loadAll();
      const samples = rows.map(toSample).sort((a, b) => b.createdAt - a.createdAt);
      set({
        samples,
        ready: true,
        loadError: null,
        selectedId: get().selectedId ?? samples[0]?.id ?? null,
      });
    } catch (error) {
      set({
        ready: true,
        loadError: error instanceof Error ? error.message : "Could not open the library.",
      });
    }
  },

  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  setLabelFilter: (labelFilter) => set({ labelFilter }),
  setAnalyzedFilter: (analyzedFilter) => set({ analyzedFilter }),
  setTagFilter: (tagFilter) => set({ tagFilter }),
  setSort: (sort) => set({ sort }),
  select: (selectedId) => set({ selectedId }),

  addFiles: async (files) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      set({ status: "No images in that drop." });
      return;
    }
    const added: Sample[] = [];
    const failed: string[] = [];
    for (const file of images) {
      try {
        const stored = await fileToStoredBlob(file);
        const sample: Sample = {
          id: crypto.randomUUID(),
          fileName: file.name || "untitled",
          width: stored.width,
          height: stored.height,
          bytes: stored.blob.size,
          createdAt: Date.now(),
          label: "unrated",
          tags: [],
          notes: "",
          analysis: null,
          url: URL.createObjectURL(stored.blob),
        };
        blobs.set(sample.id, stored.blob);
        persist(sample);
        added.push(sample);
      } catch {
        failed.push(file.name || "untitled");
      }
    }
    if (added.length === 0) {
      set({ status: `Could not read ${failed[0] ?? "that image"}.` });
      return;
    }
    set((state) => ({
      samples: [...added, ...state.samples],
      selectedId: added[0]?.id ?? state.selectedId,
      status: failed.length
        ? `Added ${added.length}. Skipped ${failed.length} unreadable file${failed.length === 1 ? "" : "s"}.`
        : `Added ${added.length} image${added.length === 1 ? "" : "s"}. Label them before looking for a pattern.`,
    }));
  },

  setLabel: (id, label) => patch(set, id, (sample) => ({ ...sample, label })),
  setNotes: (id, notes) => patch(set, id, (sample) => ({ ...sample, notes: notes.slice(0, 4000) })),
  addTag: (id, tag) =>
    patch(set, id, (sample) => {
      const clean = tag.trim().replace(/,/g, "").slice(0, 32);
      if (!clean) return sample;
      if (sample.tags.some((item) => item.toLowerCase() === clean.toLowerCase())) return sample;
      if (sample.tags.length >= 24) return sample;
      return { ...sample, tags: [...sample.tags, clean] };
    }),
  removeTag: (id, tag) =>
    patch(set, id, (sample) => ({ ...sample, tags: sample.tags.filter((item) => item !== tag) })),

  setField: (id, key, fieldPatch) =>
    patch(set, id, (sample) => {
      if (!sample.analysis) return sample;
      const current = sample.analysis.fields[key];
      if (!current) return sample;
      return {
        ...sample,
        analysis: {
          ...sample.analysis,
          fields: { ...sample.analysis.fields, [key]: touchField(current, fieldPatch) },
        },
      };
    }),

  restoreField: (id, key) =>
    patch(set, id, (sample) => {
      if (!sample.analysis) return sample;
      const current = sample.analysis.fields[key];
      if (!current) return sample;
      return {
        ...sample,
        analysis: {
          ...sample.analysis,
          fields: {
            ...sample.analysis.fields,
            [key]: touchField(current, {
              value: current.aiValue,
              confidence: current.aiConfidence,
            }),
          },
        },
      };
    }),

  setObservations: (id, observations) =>
    patch(set, id, (sample) => {
      if (!sample.analysis) return sample;
      const text = observations.slice(0, 500);
      return {
        ...sample,
        analysis: {
          ...sample.analysis,
          observations: text,
          observationsEdited: text !== sample.analysis.aiObservations,
        },
      };
    }),

  restoreObservations: (id) =>
    patch(set, id, (sample) => {
      if (!sample.analysis) return sample;
      return {
        ...sample,
        analysis: {
          ...sample.analysis,
          observations: sample.analysis.aiObservations,
          observationsEdited: false,
        },
      };
    }),

  remove: async (id) => {
    await writeChain.get(id);
    const sample = get().samples.find((item) => item.id === id);
    if (sample) URL.revokeObjectURL(sample.url);
    blobs.delete(id);
    const remaining = get().samples.filter((item) => item.id !== id);
    set({
      samples: remaining,
      selectedId: get().selectedId === id ? (remaining[0]?.id ?? null) : get().selectedId,
      status: "Sample deleted.",
    });
    try {
      await deleteStored(id);
    } catch (error) {
      set({ status: error instanceof Error ? error.message : "Could not delete." });
    }
  },

  analyzeOne: async (id) => {
    if (get().analyzingId) return;
    set({ analyzingId: id, status: "Reading visible traits…" });
    try {
      await runAnalysis(set, get, id);
      const name = get().samples.find((sample) => sample.id === id)?.fileName ?? "sample";
      set({
        status: `Analysis stored for ${name}. Correct anything that is wrong — edits override the model.`,
      });
    } catch (error) {
      set({ status: error instanceof Error ? error.message : "Analysis failed." });
    } finally {
      set({ analyzingId: null });
    }
  },

  analyzeUnanalyzed: async () => {
    if (get().batch.running || get().analyzingId) return;
    const pending = get()
      .samples.filter((sample) => !sample.analysis)
      .slice(0, BATCH_CAP);
    if (pending.length === 0) {
      set({ status: "Every sample already has an analysis." });
      return;
    }
    set({
      batch: { running: true, done: 0, total: pending.length },
      batchCancel: false,
      status: null,
    });
    for (let index = 0; index < pending.length; index += 1) {
      if (get().batchCancel) {
        set({ status: `Stopped after ${index} sample${index === 1 ? "" : "s"}.` });
        break;
      }
      set({ analyzingId: pending[index].id });
      try {
        await runAnalysis(set, get, pending[index].id);
        set((state) => ({ batch: { ...state.batch, done: index + 1 } }));
      } catch (error) {
        set({ status: error instanceof Error ? error.message : "Analysis failed." });
        break;
      }
    }
    set((state) => ({
      analyzingId: null,
      batch: { ...state.batch, running: false },
      status: state.status ?? `Analyzed ${state.batch.done} of ${state.batch.total}.`,
    }));
  },

  cancelBatch: () => set({ batchCancel: true, status: "Stopping after the current image…" }),

  exportLibrary: async () => {
    const samples = get().samples;
    const cache = readTranslationCache();
    const payload = {
      format: "aesthetic-sample-analyzer.library",
      version: 2,
      exportedAt: new Date().toISOString(),
      englishTranslations: Object.fromEntries(
        originalTexts(buildReport(samples))
          .filter((text) => Object.hasOwn(cache, text))
          .map((text) => [text, cache[text]]),
      ),
      samples: await Promise.all(
        samples.map(async (sample) => {
          const blob = blobs.get(sample.id);
          const { url, ...rest } = sample;
          return { ...rest, imageDataUrl: blob ? await blobToDataUrl(blob) : null };
        }),
      ),
    };
    downloadText(
      stampName("aesthetic-library", "json"),
      JSON.stringify(payload),
      "application/json",
    );
    set({ status: `Exported ${samples.length} sample${samples.length === 1 ? "" : "s"}.` });
  },

  importLibrary: async (file) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      set({ status: "That file is not valid JSON." });
      return;
    }
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { samples?: unknown }).samples)
    ) {
      set({ status: "That file is not an analyzer library." });
      return;
    }
    const header = parsed as { format?: unknown; version?: unknown };
    if (
      (header.format !== undefined && header.format !== "aesthetic-sample-analyzer.library") ||
      (header.version !== undefined && header.version !== 1 && header.version !== 2)
    ) {
      set({ status: "Unsupported library format. Nothing imported." });
      return;
    }
    const existing = new Set(get().samples.map((sample) => sample.id));
    const remap = new Map<string, string>();
    const incoming: Sample[] = [];
    for (const item of (parsed as { samples: unknown[] }).samples) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      if (typeof row.imageDataUrl !== "string" || !row.imageDataUrl.startsWith("data:image/"))
        continue;
      const id = typeof row.id === "string" && !existing.has(row.id) ? row.id : crypto.randomUUID();
      if (existing.has(id)) continue;
      existing.add(id);
      try {
        const image = await dataUrlToBlob(row.imageDataUrl);
        const sample: Sample = {
          id,
          fileName: typeof row.fileName === "string" ? row.fileName.slice(0, 180) : "imported",
          width: typeof row.width === "number" ? row.width : 0,
          height: typeof row.height === "number" ? row.height : 0,
          bytes: image.size,
          createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
          label: typeof row.label === "string" && isLabelId(row.label) ? row.label : "neutral",
          tags: Array.isArray(row.tags)
            ? row.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 24)
            : [],
          notes: typeof row.notes === "string" ? row.notes.slice(0, 4000) : "",
          analysis: sanitizeAnalysis(row.analysis),
          research: sanitizeResearch(row.research),
          url: URL.createObjectURL(image),
        };
        blobs.set(id, image);
        persist(sample);
        incoming.push(sample);
        if (typeof row.id === "string") remap.set(row.id, id);
      } catch {
        continue;
      }
    }
    for (const sample of incoming) {
      if (sample.research)
        sample.research.pairs = sample.research.pairs.map((pair) => ({
          ...pair,
          otherId: remap.get(pair.otherId) ?? pair.otherId,
        }));
      persist(sample);
    }
    if (incoming.length === 0) {
      set({ status: "Nothing new to import." });
      return;
    }
    let translationWarning = "";
    try {
      const importedTranslations = sanitizeTranslations(
        (parsed as { englishTranslations?: unknown }).englishTranslations,
      );
      const allowed = new Set(originalTexts(buildReport(incoming)));
      const relevant = Object.fromEntries(
        Object.entries(importedTranslations).filter(([key]) => allowed.has(key)),
      );
      localStorage.setItem(
        "asa-translations-en",
        JSON.stringify({ ...relevant, ...readTranslationCache() }),
      );
      window.dispatchEvent(new Event("asa-translations-updated"));
    } catch {
      translationWarning = "（样本已导入，但译文缓存未能保存，请保留备份文件。）";
    }
    set((state) => ({
      samples: [...incoming, ...state.samples].sort((a, b) => b.createdAt - a.createdAt),
      selectedId: state.selectedId ?? incoming[0]?.id ?? null,
      status: translationWarning
        ? `已导入 ${incoming.length} 张样本。${translationWarning}`
        : `Imported ${incoming.length} sample${incoming.length === 1 ? "" : "s"}.`,
    }));
  },
}));

function patch(
  set: (fn: (state: LibraryState) => Partial<LibraryState>) => void,
  id: string,
  recipe: (sample: Sample) => Sample,
) {
  let nextSample: Sample | null = null;
  set((state) => {
    const samples = state.samples.map((sample) => {
      if (sample.id !== id) return sample;
      nextSample = recipe(sample);
      return nextSample;
    });
    return { samples };
  });
  if (nextSample) persist(nextSample);
}

async function runAnalysis(
  set: (partial: Partial<LibraryState> | ((state: LibraryState) => Partial<LibraryState>)) => void,
  get: () => LibraryState,
  id: string,
) {
  const blob = blobs.get(id);
  if (!blob) throw new Error("This sample’s image is missing from local storage.");
  const dataUrl = await blobToAnalysisDataUrl(blob);
  const result = await analyzeSampleImage({
    data: { image: dataUrl, language: get().promptLanguage },
  });
  if (!result.ok) throw new Error(result.error);
  const current = get().samples.find((sample) => sample.id === id);
  if (!current) return;
  const analysis: Analysis = mergeModelAnalysis(
    current.analysis,
    result.model,
    result.observations,
    result.attributes,
  );
  const kept =
    Object.values(analysis.fields).filter((field) => field.edited).length +
    (analysis.observationsEdited ? 1 : 0);
  patch(set as (fn: (state: LibraryState) => Partial<LibraryState>) => void, id, (sample) => ({
    ...sample,
    analysis,
  }));
  if (kept > 0) {
    set({ status: `Re-analyzed. Kept ${kept} of your correction${kept === 1 ? "" : "s"}.` });
  }
}

export function emptyAnalysisForTests(): Analysis {
  return blankAnalysis("test");
}
