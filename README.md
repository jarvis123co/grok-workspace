# Aesthetic Sample Analyzer

A desktop-first research tool for discovering recurring visual preferences from a user-labeled image library.

The application does **not** decide whether an image is beautiful. You label each sample; the analyzer extracts observable visual attributes, lets you correct them, and compares the resulting patterns across your preferred and disliked groups.

![Aesthetic Sample Analyzer overview](screenshots/analysis-wide.png)

## What it does

- Imports multiple reference images into a dense, filterable sample library.
- Starts samples as **Unrated**, then accepts **Like**, **Neutral**, **Dislike**, or **Core Reference**, with optional scoped judgments.
- Stores tags and notes alongside each image.
- Extracts visible traits for subject, face, hair, silhouette, clothing, composition, camera, lighting, color, rendering, environment, mood, and image quality.
- Records a confidence level for every extracted attribute.
- Keeps all model-generated attributes editable; user corrections take precedence and survive re-analysis when possible.
- Finds frequent traits, distinguishing attributes, co-occurring combinations, contradictions, rare preferences, outliers, and dimensions with insufficient evidence.
- Compares labels or custom tag groups with counts, percentages, percentage-point differences, and representative images.
- Builds an evidence-tiered aesthetic profile and exports it as Markdown or structured JSON.
- Exports and imports the complete working library, including images, labels, notes, corrections, and analyses.

## Product principles

1. **The user supplies preference labels.** The model observes; it does not assign taste or beauty scores.
2. **Corrections outrank automation.** Every generated value is editable and corrected data is used in later statistics.
3. **Small samples stay uncertain.** The UI displays sample counts and deliberately avoids strong claims when evidence is sparse.
4. **Only visible traits are analyzed.** The schema excludes identity, ethnicity, personality, profession, socioeconomic status, and other hidden personal characteristics.
5. **No prompt generation.** This is an analysis tool, not an image generator or prompt extractor.

## Main views

| View | Purpose |
| --- | --- |
| **Samples** | Upload, label, tag, annotate, filter, sort, and remove reference images. |
| **Analysis** | Edit attributes; record scoped judgments, quotes, provenance, conditional routes and image-pair comparisons. |
| **Patterns** | Explore recurring traits, distinctions, combinations, contradictions, outliers, and evidence gaps. |
| **Compare** | Compare any two preference or tag groups across visual dimensions. |
| **Profile** | Review descriptive tendencies, inferred dislike associations, direct research records, combinations and exports. |

## Getting started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- A GLM or xAI API key for live vision analysis

The library, labels, manual edits, statistics, comparison tools, and exports work without an API key. Only automated image analysis requires provider access.

### GLM vision analysis

Copy `.asa-local.example.json` to `.asa-local.json` and point `keyFile` at a plain-text file containing only your key (no extension is required). The default GLM model is `glm-4.6v-flash`, using the official `https://open.bigmodel.cn/api/paas/v4/chat/completions` endpoint. The key file stays outside the project and is read only on the server. `.asa-local.json` is Git-ignored; do not publish it or the key file.

Alternatively set `ASA_VISION_PROVIDER=glm`, `GLM_API_KEY`, and optionally `ASA_VISION_MODEL`. For xAI select `ASA_VISION_PROVIDER=xai` and set `XAI_API_KEY`. Provider switching never automatically falls back to another provider's key. Existing analyses retain their original model identifiers.

Analyze sends the selected image and the attribute schema to the configured provider. Notes and research quotes are not sent. Requests have a 120-second timeout and no automatic retries. Errors are sanitized; truncated responses are not stored. Model access, quota and billing depend on your provider account, not the local app.

For an explicit live test using a synthetic color tile, run `node --experimental-strip-types scripts/vision-live-check.mjs --confirm-api-call` (requires Microsoft Edge). This makes one real API request; ordinary unit tests do not.

### Install and run

Windows users with dependencies already installed can double-click `启动审美画像.cmd` in this folder. It starts a hidden, local-only server at `http://127.0.0.1:8087/` and opens the default browser. Repeat launches reuse the running app. The server does not start automatically with Windows; logs are under `.launcher/`. No API key or payment setup is performed. Always use the same browser and URL to access your existing image library, and export library backups separately from source-code backups.

```bash
npm ci
```

Alternatively, the included `pnpm-lock.yaml` records the dependency set used for the research-workflow checks: `pnpm install --frozen-lockfile`.

Set the API key in the server process environment. Do not commit it to the repository.

PowerShell:

```powershell
$env:XAI_API_KEY = "your-key"
npm run dev
```

Bash:

```bash
export XAI_API_KEY="your-key"
npm run dev
```

The development server listens on `0.0.0.0:8080`.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build and run the configured migration step. |
| `npm run preview` | Preview the production build. |
| `npm run typecheck` | Run TypeScript checks without emitting files. |
| `npm test` | Run the script, statistics, data, and authentication test suites. |
| `npm run lint` | Run ESLint. |
| `npm run format` | Format the repository with Prettier. |
| `npm run check:auth` | Validate the authentication configuration invariants. |

## Data and privacy

- Images and working data are stored locally in the browser with IndexedDB under `aesthetic-sample-analyzer`.
- Authentication and the shared database are disabled in the included application configuration.
- An image is sent to the selected GLM or xAI API only when an analysis action is triggered.
- Credentials are read only by the server-side analysis function, from the configured environment variable or external key file. They are not exposed through browser environment variables.
- Library export creates a local JSON backup containing the images and their associated metadata.
- The server rejects analysis payloads larger than 1.8 MB as encoded image data.

## Analysis and evidence model

### Research workflow / 审美画像工作流

Open a sample's analysis panel and expand **证据与审美画像 / Research evidence**. No API key is needed for manual annotation.

- New samples start **Unrated**, distinct from Neutral. Older labels are preserved.
- Record whole-image, category or individual-field judgments. Specific judgments override broad labels; any matching exclusion wins. Only the latest judgment at the same scope is active; earlier records remain visible.
- Keep verbatim user quotes, interpretations, source references and dates separate. Inferred statistical associations are never called explicit dislikes.
- Track subject aliases, visible state and evidence clusters manually. A known cluster contributes at most one vote per attribute value; otherwise a subject alias is used. Ungrouped images are not proven independent. Multiple values/states may coexist within a cluster.
- Mark limited, invalid or excluded evidence without deleting it. These records are omitted from statistical pools. Missing/low-confidence traits do not enter a field's denominator.
- Add conditional preference routes, boundaries, counterexamples and a manually assigned hypothesis status. These records do not automatically become verified findings.
- Compare two actual samples with A/B/tie/neither/unrated outcomes and a scoped quote. Pair judgments stay separate from whole-image labels.
- Portrait fields cover visible facial spacing/expression, frame versus soft contour, apparent chest/hip shape, segmented legs/feet and hosiery. These are visual descriptions, not body measurements or identity inference.
- Profile Markdown/JSON includes research records; full library backup additionally includes images. Library import accepts older exports and remaps pair references when IDs collide. Missing comparison targets are visibly marked.
- Large-screen typography increases at 2560px and 3600px widths, including 3840×2160. Browser zoom remains available.

The private research archive is a design reference only: its personal images, quotes and source documents are **not bundled or published**. Exported research files may contain sensitive notes and images; review them before sharing.

Vision analysis supports GLM (`glm-4.6v-flash` by default) or xAI (`grok-4.5` by default), with a constrained attribute schema. Each field stores:

- the normalized value;
- confidence: `high`, `medium`, `low`, or `not_visible`;
- whether the user edited it; and
- the original model value when a correction exists.

Pattern statistics exclude low-confidence or non-visible observations where appropriate. The interface treats comparisons with fewer than eight analyzed samples per side as exploratory and keeps strong profile sections empty until minimum evidence thresholds are met.

## Project structure

```text
src/
  components/asa/       Application views and reusable UI pieces
  lib/asa/              Schema, storage, analysis, statistics, exports, and state
  routes/               TanStack Start routes
scripts/                Build, preview, migration, branding, and browser checks
server/                 Server middleware
migrations/             Optional authentication database migration
public/                  Static application and install assets
screenshots/             Desktop/mobile QA captures and verdicts
```

The UI is built with React 19, TanStack Start/Router, Tailwind CSS, Radix primitives, Zustand, and `react-resizable-panels`.

## 中文界面、双语分析与导出

- 界面默认中文；3840×2160 下保留 26px 根字号，手机布局可横向滚动功能导航。
- 在“属性分析”选择“分析提示词语言”：中文或 English。选择会保留；切换只影响后续分析，不重写已有结果。模型属性标识保持统一，统计兼容旧样本库。
- 在“审美画像”选择“中文文件”或“English file”，分别下载 Markdown／JSON。JSON 保留稳定的英文标识，中文文件另有中文显示字段，便于其他 AI 对照。
- 英文文件始终保留用户原话、备注及研究记录。可点击“补充英文译文（API）”，确认后仅发送相关文字给当前配置的模型，不发送图片；可能消耗 API 额度。每次最多 30 段／12000 字，不自动重试，也不会因普通导出而调用 API。
- 译文标记为未经核验的参考译文，以原文为准；没有译文的内容明确标记为未翻译。修改原文后旧译文不会自动套用。
- “导出样本库”保存图片、标签、分析、研究记录及相关英文译文，可导入恢复。项目源码备份不等于个人样本备份，请将样本库导出文件另存本地，不要上传到公开仓库。API key 和本地私有配置不进入 Git。

### 本轮验证

类型检查、自动化测试、生产构建及隔离浏览器回归均已验证。浏览器检查覆盖五个页面、4K／手机布局、语言选择持久化、中英文 Markdown／JSON 下载、翻译取消不发请求、样本与译文备份恢复。翻译网络逻辑使用模拟响应验证，未做真实付费翻译调用；实际可用性取决于账号额度、模型权限和网络。

## Current limitations

- The active library is local to one browser profile unless it is exported and imported elsewhere.
- There is no account sync or multi-user collaboration in the included configuration.
- Automated analysis depends on the selected provider's API availability and model permissions.
- Statistical output describes correlations in the current labeled library; it is not a universal statement about the user's taste.
- The application does not generate images or prompts.

## Additional screenshots

| Samples | Patterns | Compare | Profile |
| --- | --- | --- | --- |
| ![Samples](screenshots/desktop-with-sample.png) | ![Patterns](screenshots/patterns.png) | ![Compare](screenshots/compare.png) | ![Profile](screenshots/profile.png) |

Mobile layouts are also covered by the included browser QA captures in [`screenshots/`](screenshots/).
