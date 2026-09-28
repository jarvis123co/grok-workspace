import type { Report } from "./stats.ts";

export type Translations = Record<string, string>;

export function readTranslationCache(): Translations {
  try {
    return sanitizeTranslations(JSON.parse(localStorage.getItem("asa-translations-en") ?? "{}"));
  } catch {
    return {};
  }
}

export function sanitizeTranslations(value: unknown): Translations {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, text]) =>
        key.length <= 12000 && typeof text === "string" && text.trim() && text.length <= 24000,
    ),
  );
}

/** Preserve original text; identifiers, filenames and dates are never translated. */
export function originalTexts(report: Report): string[] {
  return [
    ...new Set(
      report.research.records
        .flatMap(({ research: r, notes }) => [
          notes ?? "",
          r?.state ?? "",
          r?.source ?? "",
          ...(r?.judgments ?? []).flatMap((j) => [j.quote, j.interpretation, j.source]),
          ...(r?.routes ?? []).flatMap((j) => [
            j.condition,
            j.preference,
            j.boundary,
            j.counterexample,
          ]),
          ...(r?.pairs ?? []).map((j) => j.quote),
        ])
        .filter((text) => text.trim()),
    ),
  ];
}

export function translationRows(report: Report, translations: Translations) {
  return originalTexts(report).map((original) => ({
    original,
    englishTranslation: Object.hasOwn(translations, original) ? translations[original] : null,
    status: Object.hasOwn(translations, original)
      ? "machine-translated-unverified"
      : "not-translated",
  }));
}

export function validateTranslationInput(input: unknown): string[] {
  const texts = (input as { texts?: unknown } | null)?.texts;
  if (
    !Array.isArray(texts) ||
    !texts.length ||
    texts.length > 30 ||
    texts.some((t) => typeof t !== "string" || !t.trim()) ||
    texts.join("").length > 12000
  )
    throw new Error("每次翻译限 30 段、共 12000 字，请分批处理。");
  return texts;
}

export function parseTranslations(text: string, originals: string[]): Translations {
  const parsed = JSON.parse(text.replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, ""));
  if (
    !Array.isArray(parsed.translations) ||
    parsed.translations.length !== originals.length ||
    parsed.translations.some((v: unknown) => typeof v !== "string" || !v.trim())
  ) {
    throw new Error("译文格式不完整，未保存；可稍后手动重试。");
  }
  return Object.fromEntries(originals.map((original, i) => [original, parsed.translations[i]]));
}
