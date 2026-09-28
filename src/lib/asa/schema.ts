export const LABELS = [
  { id: "unrated", name: "Unrated", short: "Unrated" },
  { id: "like", name: "Like", short: "Like" },
  { id: "neutral", name: "Neutral", short: "Neutral" },
  { id: "dislike", name: "Dislike", short: "Dislike" },
  { id: "core", name: "Core Reference", short: "Core" },
] as const;

export type LabelId = (typeof LABELS)[number]["id"];

export const CONFIDENCE_LEVELS = ["high", "medium", "low", "not_visible"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const NOT_VISIBLE = "not visible";

export type FieldSpec = {
  key: string;
  category: string;
  label: string;
  options: readonly string[];
  multi?: boolean;
};

export const FIELDS: readonly FieldSpec[] = [
  {
    key: "feature_occupancy",
    category: "Face detail",
    label: "Feature occupancy",
    options: ["compact", "moderate", "expansive"],
  },
  {
    key: "cheek_whitespace",
    category: "Face detail",
    label: "Cheek visual space",
    options: ["narrow", "moderate", "broad"],
  },
  {
    key: "jaw_taper",
    category: "Face detail",
    label: "Jaw taper",
    options: ["gradual", "abrupt", "minimal"],
  },
  {
    key: "expression",
    category: "Face detail",
    label: "Expression",
    options: ["relaxed", "subtle smile", "broad smile", "serious", "animated", "tense"],
  },
  {
    key: "frame_width",
    category: "Body detail",
    label: "Visible frame width",
    options: ["narrow", "moderate", "broad", "obscured"],
  },
  {
    key: "soft_tissue_contour",
    category: "Body detail",
    label: "Visible soft contour",
    options: ["lean", "moderate", "full", "obscured"],
  },
  {
    key: "chest_contour",
    category: "Body detail",
    label: "Clothed chest contour",
    options: ["flat", "gentle", "rounded", "projected", "obscured"],
  },
  {
    key: "chest_position",
    category: "Body detail",
    label: "Apparent chest position",
    options: ["higher", "middle", "lower", "obscured"],
  },
  {
    key: "garment_support",
    category: "Body detail",
    label: "Visible garment support effect",
    options: ["minimal", "shaped", "lifted", "compressed", "uncertain"],
  },
  {
    key: "chest_volume",
    category: "Body detail",
    label: "Apparent chest volume",
    options: ["small", "moderate", "full", "obscured"],
  },
  {
    key: "hip_projection",
    category: "Body detail",
    label: "Hip projection in visible view",
    options: ["subtle", "moderate", "prominent", "obscured"],
  },
  {
    key: "hip_roundness",
    category: "Body detail",
    label: "Hip contour",
    options: ["straight", "gently rounded", "strongly rounded", "obscured"],
  },
  {
    key: "thigh_contour",
    category: "Legs and feet",
    label: "Thigh contour",
    options: ["slender", "moderate", "full", "obscured"],
  },
  {
    key: "calf_contour",
    category: "Legs and feet",
    label: "Calf contour",
    options: ["straight", "gently curved", "defined", "obscured"],
  },
  {
    key: "ankle_contour",
    category: "Legs and feet",
    label: "Ankle contour",
    options: ["tapered", "moderate", "straight", "obscured"],
  },
  {
    key: "foot_visibility",
    category: "Legs and feet",
    label: "Feet presentation",
    options: ["bare", "hosiery covered", "shoes", "cropped", "occluded"],
  },
  {
    key: "hosiery_type",
    category: "Hosiery",
    label: "Coverage",
    options: ["none", "socks", "knee-high", "thigh-high", "tights", "uncertain"],
  },
  {
    key: "hosiery_opacity",
    category: "Hosiery",
    label: "Opacity",
    options: ["sheer", "semi-opaque", "opaque", "uncertain"],
  },
  {
    key: "hosiery_finish",
    category: "Hosiery",
    label: "Finish",
    options: ["matte", "subtle sheen", "glossy", "textured", "uncertain"],
  },
  {
    key: "subject_count",
    category: "Subject",
    label: "Number of subjects",
    options: ["none", "1", "2", "3-5", "crowd", "not a person"],
  },
  {
    key: "framing",
    category: "Subject",
    label: "Framing",
    options: [
      "extreme close-up",
      "head and shoulders",
      "half body",
      "three-quarter",
      "full body",
      "environmental",
      "detail crop",
    ],
  },
  {
    key: "body_visibility",
    category: "Subject",
    label: "Body visibility",
    options: [
      "face only",
      "upper body",
      "torso to hips",
      "full body",
      "partial or occluded",
      "no body",
    ],
  },
  {
    key: "pose",
    category: "Subject",
    label: "Pose",
    options: [
      "standing",
      "seated",
      "reclining",
      "walking",
      "mid-action",
      "static portrait",
      "looking at camera",
      "looking away",
      "candid",
    ],
  },
  {
    key: "orientation",
    category: "Subject",
    label: "Orientation",
    options: ["frontal", "three-quarter", "profile", "back", "mixed"],
  },

  {
    key: "face_shape",
    category: "Face",
    label: "Face shape",
    options: ["oval", "round", "square", "heart", "long", "diamond"],
  },
  {
    key: "facial_proportions",
    category: "Face",
    label: "Facial proportions",
    options: [
      "balanced",
      "larger eyes",
      "smaller eyes",
      "longer midface",
      "shorter midface",
      "prominent nose",
      "small nose",
      "full lips",
      "thin lips",
    ],
  },
  {
    key: "cheek_fullness",
    category: "Face",
    label: "Cheek fullness",
    options: ["full", "moderate", "lean"],
  },
  {
    key: "jawline",
    category: "Face",
    label: "Jawline",
    options: ["soft", "defined", "square", "pointed", "rounded"],
  },
  {
    key: "visual_maturity",
    category: "Face",
    label: "Visual maturity",
    options: ["youthful appearance", "adult", "mature", "ambiguous"],
  },
  {
    key: "feature_prominence",
    category: "Face",
    label: "Feature prominence",
    options: ["eyes", "lips", "nose", "brows", "balanced"],
  },

  {
    key: "hair_length",
    category: "Hair",
    label: "Length",
    options: ["none or shaved", "very short", "short", "medium", "long", "very long"],
  },
  {
    key: "hair_shape",
    category: "Hair",
    label: "Shape",
    options: ["straight", "wavy", "curly", "coily", "slicked", "messy", "structured"],
  },
  {
    key: "bangs",
    category: "Hair",
    label: "Bangs",
    options: ["none", "full", "side-swept", "curtain", "wispy"],
  },
  {
    key: "hair_arrangement",
    category: "Hair",
    label: "Tied / loose",
    options: ["loose", "partially tied", "tied up", "braided", "covered"],
  },
  {
    key: "hair_volume",
    category: "Hair",
    label: "Volume",
    options: ["flat", "moderate", "voluminous"],
  },
  {
    key: "hair_texture",
    category: "Hair",
    label: "Texture",
    options: ["smooth", "textured", "glossy", "matte", "wet-look"],
  },

  {
    key: "head_body_proportion",
    category: "Body silhouette",
    label: "Head-to-body proportion",
    options: [
      "naturalistic",
      "slightly large head",
      "stylized large head",
      "elongated",
      "not enough visible",
    ],
  },
  {
    key: "torso_relationship",
    category: "Body silhouette",
    label: "Shoulder / waist / hip",
    options: [
      "straight",
      "defined waist",
      "broad shoulders",
      "narrow shoulders",
      "wider hips",
      "rectangular",
      "hourglass-like",
      "not enough visible",
    ],
  },
  {
    key: "limb_proportions",
    category: "Body silhouette",
    label: "Limb proportions",
    options: ["naturalistic", "elongated", "shortened"],
  },
  {
    key: "overall_silhouette",
    category: "Body silhouette",
    label: "Overall silhouette",
    options: ["slim", "athletic", "soft", "broad", "compact", "tall and elongated", "obscured"],
  },

  {
    key: "garment_category",
    category: "Clothing",
    label: "Garment categories",
    multi: true,
    options: [
      "none visible",
      "casual everyday",
      "formal",
      "costume or fantasy",
      "historical costume",
      "sportswear",
      "outerwear",
      "sleepwear",
      "uniform-like",
      "minimal coverage",
    ],
  },
  {
    key: "clothing_silhouette",
    category: "Clothing",
    label: "Silhouette",
    options: ["fitted", "loose", "oversized", "structured", "flowing", "mixed", "not applicable"],
  },
  {
    key: "materials",
    category: "Clothing",
    label: "Materials",
    options: [
      "matte fabric",
      "knit",
      "denim-like",
      "leather-like",
      "silk-like sheen",
      "synthetic shine",
      "wool-like",
      "mixed",
      "unclear",
    ],
  },
  {
    key: "layering",
    category: "Clothing",
    label: "Layering",
    options: ["single layer", "light layers", "heavy layers", "not applicable"],
  },
  {
    key: "ornament",
    category: "Clothing",
    label: "Ornament",
    options: ["minimal", "moderate", "ornate", "not applicable"],
  },

  {
    key: "shot_scale",
    category: "Composition",
    label: "Shot scale",
    options: [
      "extreme close-up",
      "close-up",
      "medium close",
      "medium",
      "full",
      "wide",
      "extreme wide",
    ],
  },
  {
    key: "subject_position",
    category: "Composition",
    label: "Subject position",
    options: [
      "centered",
      "left third",
      "right third",
      "lower frame",
      "upper frame",
      "edge",
      "off-center",
    ],
  },
  {
    key: "negative_space",
    category: "Composition",
    label: "Negative space",
    options: ["tight", "moderate", "generous", "dominant empty"],
  },
  {
    key: "symmetry",
    category: "Composition",
    label: "Symmetry",
    options: ["symmetric", "near-symmetric", "asymmetric", "strongly asymmetric"],
  },
  {
    key: "visual_balance",
    category: "Composition",
    label: "Visual balance",
    options: [
      "balanced",
      "left-weighted",
      "right-weighted",
      "top-heavy",
      "bottom-heavy",
      "unstable",
    ],
  },

  {
    key: "viewpoint",
    category: "Camera",
    label: "Viewpoint",
    options: ["eye level", "slight high", "high angle", "slight low", "low angle", "overhead"],
  },
  {
    key: "perspective_strength",
    category: "Camera",
    label: "Perspective strength",
    options: ["flat", "mild", "moderate", "strong", "extreme"],
  },
  {
    key: "focal_character",
    category: "Camera",
    label: "Focal-length character",
    options: [
      "wide-angle look",
      "normal look",
      "short-tele look",
      "long-tele compressed",
      "macro",
      "uncertain",
    ],
  },
  {
    key: "depth_of_field",
    category: "Camera",
    label: "Depth of field",
    options: ["deep", "moderate", "shallow", "very shallow", "uncertain"],
  },

  {
    key: "light_quality",
    category: "Lighting",
    label: "Soft / hard",
    options: ["soft", "mixed", "hard"],
  },
  {
    key: "light_direction",
    category: "Lighting",
    label: "Direction",
    options: ["frontal", "side", "rim", "back", "top", "under", "ambient diffuse", "multiple"],
  },
  {
    key: "light_contrast",
    category: "Lighting",
    label: "Contrast",
    options: ["low", "medium", "high", "extreme"],
  },
  {
    key: "exposure",
    category: "Lighting",
    label: "Exposure",
    options: ["underexposed", "balanced", "bright", "overexposed", "mixed"],
  },
  {
    key: "light_source_look",
    category: "Lighting",
    label: "Natural / artificial look",
    options: [
      "daylight",
      "window",
      "golden hour",
      "overcast",
      "warm artificial",
      "cool artificial",
      "studio",
      "neon",
      "mixed",
      "uncertain",
    ],
  },

  {
    key: "saturation",
    category: "Color",
    label: "Saturation",
    options: ["muted", "natural", "vivid", "hyper-saturated", "near-monochrome"],
  },
  {
    key: "temperature",
    category: "Color",
    label: "Temperature",
    options: ["cool", "neutral", "warm", "mixed"],
  },
  {
    key: "dominant_colors",
    category: "Color",
    label: "Dominant colors",
    multi: true,
    options: [
      "black",
      "white",
      "gray",
      "beige",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "purple",
      "pink",
      "gold",
    ],
  },
  {
    key: "color_contrast",
    category: "Color",
    label: "Color contrast",
    options: ["low", "medium", "high"],
  },
  {
    key: "tonal_range",
    category: "Color",
    label: "Tonal range",
    options: ["high-key", "mid-key", "low-key", "full range"],
  },

  {
    key: "render_medium",
    category: "Rendering",
    label: "Medium",
    options: [
      "photograph",
      "cinematic still",
      "film photograph",
      "digital render",
      "illustration",
      "anime",
      "painterly",
      "3d render",
      "mixed media",
    ],
  },
  {
    key: "stylization",
    category: "Rendering",
    label: "Realistic / stylized",
    options: ["realistic", "lightly stylized", "strongly stylized", "abstract"],
  },
  {
    key: "surface_texture",
    category: "Rendering",
    label: "Surface texture",
    options: ["fine grain", "smooth digital", "painterly", "glossy", "matte", "noisy", "clean"],
  },

  {
    key: "setting",
    category: "Environment",
    label: "Indoor / outdoor",
    options: ["indoor", "outdoor", "studio void", "ambiguous", "mixed"],
  },
  {
    key: "visual_complexity",
    category: "Environment",
    label: "Visual complexity",
    options: ["sparse", "moderate", "dense", "cluttered"],
  },
  {
    key: "context",
    category: "Environment",
    label: "Context",
    options: [
      "domestic interior",
      "urban",
      "nature",
      "architecture",
      "abstract backdrop",
      "night exterior",
      "coastal",
      "none visible",
    ],
  },
  {
    key: "period_cues",
    category: "Environment",
    label: "Period / retro cues",
    options: ["contemporary", "retro", "vintage", "futuristic", "timeless", "not evident"],
  },

  {
    key: "mood_primary",
    category: "Mood",
    label: "Primary mood",
    options: [
      "calm",
      "intimate",
      "distant",
      "dramatic",
      "playful",
      "melancholic",
      "everyday",
      "elegant",
      "tense",
      "cheerful",
      "somber",
      "neutral",
    ],
  },
  {
    key: "mood_secondary",
    category: "Mood",
    label: "Secondary mood",
    options: [
      "none",
      "calm",
      "intimate",
      "distant",
      "dramatic",
      "playful",
      "melancholic",
      "everyday",
      "elegant",
      "tense",
      "cheerful",
      "somber",
      "neutral",
    ],
  },

  {
    key: "over_smoothing",
    category: "Image quality",
    label: "Over-smoothing",
    options: ["none", "mild", "strong"],
  },
  {
    key: "excessive_gloss",
    category: "Image quality",
    label: "Excessive gloss",
    options: ["none", "mild", "strong"],
  },
  {
    key: "overexposure_issue",
    category: "Image quality",
    label: "Overexposure",
    options: ["none", "mild", "strong"],
  },
  {
    key: "artificial_skin",
    category: "Image quality",
    label: "Artificial skin texture",
    options: ["none", "mild", "strong", "not applicable"],
  },
  {
    key: "anatomical_issues",
    category: "Image quality",
    label: "Anatomical problems",
    options: ["none", "possible", "clear", "not applicable"],
  },
  {
    key: "visual_artifacts",
    category: "Image quality",
    label: "Visual artifacts",
    options: ["none", "mild", "strong"],
  },
];

export const FIELD_BY_KEY: Record<string, FieldSpec> = Object.fromEntries(
  FIELDS.map((field) => [field.key, field]),
);

export const CATEGORIES: string[] = [...new Set(FIELDS.map((field) => field.category))];

const NON_INFORMATIVE = new Set([
  "not visible",
  "not applicable",
  "uncertain",
  "unclear",
  "not enough visible",
  "none visible",
  "no body",
  "ambiguous",
  "not evident",
  "obscured",
  "cropped",
  "occluded",
]);

export type FieldValue = {
  value: string;
  confidence: Confidence;
  aiValue: string;
  aiConfidence: Confidence;
  edited: boolean;
};

export type Analysis = {
  analyzedAt: number;
  model: string;
  observations: string;
  aiObservations: string;
  observationsEdited: boolean;
  fields: Record<string, FieldValue>;
};

export type Sample = {
  research?: import("./research").Research;
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
  url: string;
};

export type RawAttribute = { value: string; confidence: Confidence };

export function isLabelId(value: string): value is LabelId {
  return LABELS.some((label) => label.id === value);
}

export function labelName(id: LabelId): string {
  return LABELS.find((label) => label.id === id)?.name ?? id;
}

export function splitMulti(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinMulti(values: string[]): string {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort().join(" | ");
}

export function blankField(): FieldValue {
  return {
    value: NOT_VISIBLE,
    confidence: "not_visible",
    aiValue: NOT_VISIBLE,
    aiConfidence: "not_visible",
    edited: false,
  };
}

export function blankAnalysis(model = "unset"): Analysis {
  const fields: Record<string, FieldValue> = {};
  for (const spec of FIELDS) fields[spec.key] = blankField();
  return {
    analyzedAt: 0,
    model,
    observations: "",
    aiObservations: "",
    observationsEdited: false,
    fields,
  };
}

export function statTokens(spec: FieldSpec, field: FieldValue | undefined): string[] {
  if (!field) return [];
  if (field.confidence !== "high" && field.confidence !== "medium") return [];
  const parts = spec.multi ? splitMulti(field.value) : [field.value.trim()];
  const tokens: string[] = [];
  for (const part of parts) {
    const token = part.trim();
    if (!token) continue;
    if (NON_INFORMATIVE.has(token.toLowerCase())) continue;
    if (spec.key === "mood_secondary" && token.toLowerCase() === "none") continue;
    tokens.push(token);
  }
  return tokens;
}

export function optionsFor(spec: FieldSpec, current: string): string[] {
  const options = [NOT_VISIBLE, ...spec.options.filter((option) => option !== NOT_VISIBLE)];
  const extras = spec.multi ? splitMulti(current) : [current];
  for (const extra of extras) {
    if (!extra) continue;
    if (!options.some((option) => option.toLowerCase() === extra.toLowerCase()))
      options.push(extra);
  }
  return options;
}

function normToken(value: string): string {
  return value.toLowerCase().replace(/[–—-]/g, "-").replace(/\s+/g, " ").trim();
}

const SYNONYMS: Record<string, string> = {
  one: "1",
  single: "1",
  two: "2",
  "black and white": "near-monochrome",
  monochrome: "near-monochrome",
  photo: "photograph",
  photography: "photograph",
  "3d": "3d render",
  cgi: "3d render",
};

function matchOption(spec: FieldSpec, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = normToken(trimmed);
  if (
    normalized === "not visible" ||
    normalized === "not_visible" ||
    normalized === "n/a" ||
    normalized === "unknown" ||
    normalized === "unseen" ||
    normalized === "cannot tell"
  ) {
    return NOT_VISIBLE;
  }
  const synonym = SYNONYMS[normalized];
  const candidates = synonym ? [synonym, trimmed] : [trimmed];
  for (const candidate of candidates) {
    const hit = spec.options.find((option) => normToken(option) === normToken(candidate));
    if (hit) return hit;
  }
  return null;
}

function parseConfidence(raw: unknown, value: string): Confidence {
  if (value === NOT_VISIBLE) return "not_visible";
  const text = String(raw ?? "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (text === "high" || text === "h") return "high";
  if (text === "medium" || text === "med" || text === "moderate") return "medium";
  if (text === "low") return "low";
  if (text === "not_visible" || text === "none" || text === "na") return "not_visible";
  return "low";
}

function valueToTokens(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => valueToTokens(item));
  if (typeof value === "number") return [String(value)];
  if (typeof value !== "string") return [];
  return value
    .split(/[|,;/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function coerceAttribute(spec: FieldSpec, value: unknown, confidence: unknown): RawAttribute {
  const tokens = valueToTokens(value);
  if (spec.multi) {
    const matched = tokens
      .map((token) => matchOption(spec, token))
      .filter((token): token is string => Boolean(token) && token !== NOT_VISIBLE);
    if (matched.length > 0) {
      const joined = joinMulti(matched.slice(0, 4));
      return { value: joined, confidence: parseConfidence(confidence, joined) };
    }
    if (tokens.length === 0 || tokens.every((token) => matchOption(spec, token) === NOT_VISIBLE)) {
      return { value: NOT_VISIBLE, confidence: "not_visible" };
    }
    const custom = tokens.filter((token) => token.length < 40).slice(0, 4);
    if (custom.length === 0) return { value: NOT_VISIBLE, confidence: "not_visible" };
    const joined = joinMulti(custom);
    return { value: joined, confidence: parseConfidence(confidence, joined) };
  }
  const first = tokens[0] ?? "";
  const matched = matchOption(spec, first);
  if (matched === NOT_VISIBLE || !first) return { value: NOT_VISIBLE, confidence: "not_visible" };
  if (matched) return { value: matched, confidence: parseConfidence(confidence, matched) };
  if (first.length < 48) return { value: first, confidence: parseConfidence(confidence, first) };
  return { value: NOT_VISIBLE, confidence: "not_visible" };
}

function isConfidence(value: unknown): value is Confidence {
  return typeof value === "string" && (CONFIDENCE_LEVELS as readonly string[]).includes(value);
}

function sanitizeField(input: unknown): FieldValue {
  if (!input || typeof input !== "object") return blankField();
  const rec = input as Record<string, unknown>;
  const value =
    typeof rec.value === "string" && rec.value.trim()
      ? rec.value.trim().slice(0, 180)
      : NOT_VISIBLE;
  const aiValue =
    typeof rec.aiValue === "string" && rec.aiValue.trim()
      ? rec.aiValue.trim().slice(0, 180)
      : value;
  const confidence = isConfidence(rec.confidence)
    ? rec.confidence
    : value === NOT_VISIBLE
      ? "not_visible"
      : "low";
  const aiConfidence = isConfidence(rec.aiConfidence) ? rec.aiConfidence : confidence;
  return {
    value,
    confidence,
    aiValue,
    aiConfidence,
    edited: value !== aiValue || confidence !== aiConfidence,
  };
}

export function sanitizeAnalysis(input: unknown): Analysis | null {
  if (!input || typeof input !== "object") return null;
  const rec = input as Record<string, unknown>;
  if (!rec.fields || typeof rec.fields !== "object") return null;
  const bag = rec.fields as Record<string, unknown>;
  const fields: Record<string, FieldValue> = {};
  for (const spec of FIELDS) fields[spec.key] = sanitizeField(bag[spec.key]);
  const observations =
    typeof rec.observations === "string" ? rec.observations.trim().slice(0, 500) : "";
  const aiObservations =
    typeof rec.aiObservations === "string" ? rec.aiObservations.trim().slice(0, 500) : observations;
  return {
    analyzedAt: typeof rec.analyzedAt === "number" ? rec.analyzedAt : Date.now(),
    model:
      typeof rec.model === "string" && rec.model.trim() ? rec.model.trim().slice(0, 80) : "unknown",
    observations,
    aiObservations,
    observationsEdited: observations !== aiObservations,
    fields,
  };
}

export function mergeModelAnalysis(
  previous: Analysis | null,
  model: string,
  observations: string,
  attributes: Record<string, RawAttribute>,
): Analysis {
  const base = previous ?? blankAnalysis(model);
  const fields: Record<string, FieldValue> = {};
  for (const spec of FIELDS) {
    const incoming = attributes[spec.key] ?? {
      value: NOT_VISIBLE,
      confidence: "not_visible" as const,
    };
    const prior = base.fields[spec.key] ?? blankField();
    if (prior.edited) {
      fields[spec.key] = {
        ...prior,
        aiValue: incoming.value,
        aiConfidence: incoming.confidence,
        edited: prior.value !== incoming.value || prior.confidence !== incoming.confidence,
      };
    } else {
      fields[spec.key] = {
        value: incoming.value,
        confidence: incoming.confidence,
        aiValue: incoming.value,
        aiConfidence: incoming.confidence,
        edited: false,
      };
    }
  }
  const aiObservations = observations.trim().slice(0, 500);
  const keepText = Boolean(previous?.observationsEdited);
  return {
    analyzedAt: Date.now(),
    model,
    observations: keepText ? base.observations : aiObservations,
    aiObservations,
    observationsEdited: keepText && base.observations !== aiObservations,
    fields,
  };
}

export function normalizeModelPayload(input: unknown): {
  observations: string;
  attributes: Record<string, RawAttribute>;
} {
  const parsed = typeof input === "string" ? JSON.parse(extractJson(input)) : input;
  if (!parsed || typeof parsed !== "object")
    throw new Error("The model returned an unreadable analysis.");
  const rec = parsed as Record<string, unknown>;
  const observations =
    typeof rec.observations === "string" ? rec.observations.trim().slice(0, 500) : "";
  const bag = rec.attributes ?? rec.fields ?? rec;
  const attributes: Record<string, RawAttribute> = {};
  if (Array.isArray(bag)) {
    for (const item of bag) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const key = String(row.key ?? row.id ?? "");
      const spec = FIELD_BY_KEY[key];
      if (!spec) continue;
      attributes[key] = coerceAttribute(spec, row.value ?? row.label, row.confidence);
    }
  } else if (bag && typeof bag === "object") {
    const record = bag as Record<string, unknown>;
    for (const spec of FIELDS) {
      const raw = record[spec.key];
      if (raw == null) continue;
      if (typeof raw === "string" || typeof raw === "number" || Array.isArray(raw)) {
        attributes[spec.key] = coerceAttribute(spec, raw, "medium");
      } else if (typeof raw === "object") {
        const row = raw as Record<string, unknown>;
        attributes[spec.key] = coerceAttribute(
          spec,
          row.value ?? row.label ?? row.values,
          row.confidence,
        );
      }
    }
  }
  for (const spec of FIELDS) {
    if (!attributes[spec.key])
      attributes[spec.key] = { value: NOT_VISIBLE, confidence: "not_visible" };
  }
  return { observations, attributes };
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() || trimmed;
}

export function analysisSystemPrompt(): string {
  const keys = FIELDS.map((field) => {
    const multi = field.multi ? " [multi]" : "";
    return `- ${field.key} (${field.category} / ${field.label})${multi}: ${field.options.join(" | ")}`;
  });
  return [
    "You extract observable visual attributes for a private research tool.",
    "You do not decide whether an image is beautiful, pleasing, attractive, or good.",
    "You do not infer identity, ethnicity, nationality, personality, profession, socioeconomic status, health, or any hidden personal trait.",
    "visual_maturity is only an apparent depicted age band, never a number and never a claim about a real person.",
    'anatomical_issues means visible image geometry only, such as extra digits, disconnected limbs, or melted features. If unsure, use "possible" with confidence "low".',
    "Return one JSON object and nothing else:",
    "{",
    '  "observations": "one or two factual sentences about visible content, with no praise or criticism",',
    '  "attributes": { "<key>": { "value": "<option>", "confidence": "high" | "medium" | "low" | "not_visible" } }',
    "}",
    "Rules:",
    "- Body detail fields describe only the depicted contour, not anatomical measurements. Clothing, lens, pose and perspective can change apparent shape; use low or not_visible when these prevent assessment.",
    "- Do not infer concealed anatomy or numeric body measurements. Do not populate chest, hip or hosiery detail for subjects that do not clearly appear adult.",
    "- Include every key.",
    "- Use high only when the trait is clearly visible, medium when reasonably visible, low when you are guessing, and not_visible when the region is absent or blocked.",
    '- If a trait cannot be seen, value must be "not visible" and confidence "not_visible". That value is allowed for every key.',
    "- Use only the listed option strings, matched exactly, except for the not-visible case.",
    "- For keys marked [multi], value must be an array of 1 to 4 listed options.",
    "- Do not add image-generation prompts, beauty scores, or identity guesses.",
    "",
    "Keys:",
    ...keys,
  ].join("\n");
}

export function touchField(
  field: FieldValue,
  patch: Partial<Pick<FieldValue, "value" | "confidence">>,
): FieldValue {
  const next = { ...field, ...patch };
  return { ...next, edited: next.value !== next.aiValue || next.confidence !== next.aiConfidence };
}
