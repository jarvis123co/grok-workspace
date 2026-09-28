import { isLabelId, sanitizeAnalysis, type Analysis, type LabelId } from "./schema";

const DB_NAME = "aesthetic-sample-analyzer";
const STORE = "samples";

export type PersistedSample = {
  id: string;
  fileName: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: number;
  label: LabelId;
  tags: string[];
  notes: string;
  analysis: Analysis | null;
  image: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open the local library."));
  });
}

function sanitizeRow(value: unknown): PersistedSample | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !(row.image instanceof Blob)) return null;
  const label = typeof row.label === "string" && isLabelId(row.label) ? row.label : "neutral";
  const tags = Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 24) : [];
  return {
    id: row.id,
    fileName: typeof row.fileName === "string" && row.fileName.trim() ? row.fileName.slice(0, 180) : "untitled",
    width: typeof row.width === "number" ? row.width : 0,
    height: typeof row.height === "number" ? row.height : 0,
    bytes: typeof row.bytes === "number" ? row.bytes : row.image.size,
    createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
    label,
    tags: tags.map((tag) => tag.trim()).filter(Boolean),
    notes: typeof row.notes === "string" ? row.notes.slice(0, 4000) : "",
    analysis: sanitizeAnalysis(row.analysis),
    image: row.image,
  };
}

export async function loadAll(): Promise<PersistedSample[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => {
      const rows = Array.isArray(request.result) ? request.result : [];
      resolve(rows.map(sanitizeRow).filter((row): row is PersistedSample => Boolean(row)));
    };
    request.onerror = () => reject(request.error ?? new Error("Could not read the library."));
  });
}

export async function putSample(sample: PersistedSample): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(sample);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not save this sample."));
  });
}

export async function deleteSample(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete this sample."));
  });
}
