import { CATEGORIES, FIELDS, LABELS, type Sample } from "@/lib/asa/schema";
import { sanitizeResearch, type Research } from "@/lib/asa/research";
import { useLibrary } from "@/lib/asa/store";
import { Button } from "./bits";

const inputClass =
  "mt-1 min-h-11 w-full rounded-md bg-raised px-3 py-2 text-base text-fg shadow-ring";
function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-muted">
      {label}
      <textarea
        rows={2}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Scope({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      评价范围 / Scope
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="whole">整体 / Whole image</option>
        {CATEGORIES.map((c) => (
          <optgroup key={c} label={c}>
            <option value={c}>{c} — entire category</option>
            {FIELDS.filter((f) => f.category === c).map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
export function ResearchEditor({ sample }: { sample: Sample }) {
  const samples = useLibrary((s) => s.samples);
  const setResearch = useLibrary((s) => s.setResearch);
  const r = sanitizeResearch(sample.research);
  const save = (patch: Partial<Research>) => setResearch(sample.id, { ...r, ...patch });
  return (
    <details className="my-4 rounded-lg border border-line p-3">
      <summary className="cursor-pointer py-2 text-base font-medium">
        证据与审美画像 / Research evidence
      </summary>
      <div className="mt-3 space-y-4">
        <p className="text-sm text-muted">
          原话与解释分开。局部排除优先于整图标签；待评价不等于中性。有限、无效或排除的样本保留记录，但不计入统计。
        </p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={r.included}
            onChange={(e) => save({ included: e.target.checked })}
          />
          纳入统计 / Include in statistics
        </label>
        <label className="block">
          证据有效性
          <select
            className={inputClass}
            value={r.validity}
            onChange={(e) => save({ validity: e.target.value as Research["validity"] })}
          >
            <option value="valid">有效 / Valid</option>
            <option value="limited">有限，仅供参考 / Limited</option>
            <option value="invalid">无效 / Invalid</option>
          </select>
        </label>
        <Text
          label="来源 / Source URL or reference"
          value={r.source}
          onChange={(source) => save({ source })}
        />
        <Text
          label="对象代号（手动，不做人脸识别）/ Subject alias"
          value={r.subject}
          onChange={(subject) => save({ subject })}
        />
        <Text
          label="状态：角度、表情、妆造、姿势 / State"
          value={r.state}
          onChange={(state) => save({ state })}
        />
        <Text
          label="证据组：同一次拍摄共用一个代号 / Evidence cluster"
          value={r.cluster}
          onChange={(cluster) => save({ cluster })}
        />
        <p className="text-sm text-muted">
          同组每个属性值最多计一次；无组但有对象代号时按对象合并。没有分组信息不代表独立证据。
        </p>
        <h3 className="text-lg">局部评价与原话</h3>
        {r.judgments.map((j, i) => {
          const update = (patch: Partial<typeof j>) =>
            save({ judgments: r.judgments.map((v, n) => (n === i ? { ...v, ...patch } : v)) });
          return (
            <fieldset key={i} className="space-y-3 rounded border border-line p-3">
              <legend>评价 {i + 1}</legend>
              <Scope value={j.scope} onChange={(scope) => update({ scope })} />
              <select
                aria-label="局部偏好"
                className={inputClass}
                value={j.label}
                onChange={(e) => update({ label: e.target.value as typeof j.label })}
              >
                {LABELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={j.excluded}
                  onChange={(e) => update({ excluded: e.target.checked })}
                />
                排除此范围 / Exclude scope
              </label>
              <Text
                label="用户原话（不改写）/ Verbatim quote"
                value={j.quote}
                onChange={(quote) => update({ quote })}
              />
              <Text
                label="解释或推断（非原话）/ Interpretation"
                value={j.interpretation}
                onChange={(interpretation) => update({ interpretation })}
              />
              <Text
                label="原话来源 / Quote source"
                value={j.source}
                onChange={(source) => update({ source })}
              />
              <Text label="记录时间 / Recorded at" value={j.at} onChange={(at) => update({ at })} />
              <Button onClick={() => save({ judgments: r.judgments.filter((_, n) => n !== i) })}>
                删除此评价
              </Button>
            </fieldset>
          );
        })}
        <Button
          onClick={() =>
            save({
              judgments: [
                ...r.judgments,
                {
                  scope: "whole",
                  label: "unrated",
                  excluded: false,
                  quote: "",
                  interpretation: "",
                  source: r.source,
                  at: new Date().toISOString(),
                },
              ],
            })
          }
        >
          添加局部评价
        </Button>
        <h3 className="text-lg">条件性偏好与边界</h3>
        {r.routes.map((j, i) => {
          const update = (patch: Partial<typeof j>) =>
            save({ routes: r.routes.map((v, n) => (n === i ? { ...v, ...patch } : v)) });
          return (
            <fieldset key={i} className="space-y-3 rounded border border-line p-3">
              <legend>路线 {i + 1}</legend>
              <Text
                label="什么条件下 / When"
                value={j.condition}
                onChange={(condition) => update({ condition })}
              />
              <Text
                label="喜欢的组合 / Preferred combination"
                value={j.preference}
                onChange={(preference) => update({ preference })}
              />
              <Text
                label="上下限、排除条件 / Boundary"
                value={j.boundary}
                onChange={(boundary) => update({ boundary })}
              />
              <Text
                label="反例及样本编号 / Counterexample"
                value={j.counterexample}
                onChange={(counterexample) => update({ counterexample })}
              />
              <select
                aria-label="假设状态"
                className={inputClass}
                value={j.status}
                onChange={(e) => update({ status: e.target.value as typeof j.status })}
              >
                <option value="hypothesis">待验证假设</option>
                <option value="supported">人工标记：有支持证据</option>
                <option value="rejected">已否定</option>
              </select>
              <Button onClick={() => save({ routes: r.routes.filter((_, n) => n !== i) })}>
                删除此路线
              </Button>
            </fieldset>
          );
        })}
        <Button
          onClick={() =>
            save({
              routes: [
                ...r.routes,
                {
                  condition: "",
                  preference: "",
                  boundary: "",
                  counterexample: "",
                  status: "hypothesis",
                },
              ],
            })
          }
        >
          添加条件路线
        </Button>
        <h3 className="text-lg">成对比较 / A–B comparison</h3>
        <p className="text-sm text-muted">A 是当前样本。比较结果单独保留，不自动改写整体标签。</p>
        {r.pairs.map((j, i) => {
          const update = (patch: Partial<typeof j>) =>
            save({ pairs: r.pairs.map((v, n) => (n === i ? { ...v, ...patch } : v)) });
          const b = samples.find((s) => s.id === j.otherId);
          return (
            <fieldset key={i} className="space-y-3 rounded border border-line p-3">
              <legend>比较 {i + 1}</legend>
              <select
                aria-label="样本 B"
                className={inputClass}
                value={j.otherId}
                onChange={(e) => update({ otherId: e.target.value })}
              >
                <option value="">选择 B</option>
                {!b && j.otherId ? <option value={j.otherId}>缺失样本：{j.otherId}</option> : null}
                {samples
                  .filter((s) => s.id !== sample.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fileName}
                    </option>
                  ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <img
                  className="h-48 w-full object-contain"
                  src={sample.url}
                  alt={`A: ${sample.fileName}`}
                />
                {b ? (
                  <img
                    className="h-48 w-full object-contain"
                    src={b.url}
                    alt={`B: ${b.fileName}`}
                  />
                ) : (
                  <p>请选择 B</p>
                )}
              </div>
              <Scope value={j.scope} onChange={(scope) => update({ scope })} />
              <select
                aria-label="比较结论"
                className={inputClass}
                value={j.choice}
                onChange={(e) => update({ choice: e.target.value as typeof j.choice })}
              >
                <option value="unrated">待评价</option>
                <option value="a">更喜欢 A</option>
                <option value="b">更喜欢 B</option>
                <option value="tie">相当</option>
                <option value="neither">都不喜欢</option>
              </select>
              <Text
                label="比较原话 / Quote"
                value={j.quote}
                onChange={(quote) => update({ quote })}
              />
              <p className="text-sm text-muted">{j.at}</p>
              <Button onClick={() => save({ pairs: r.pairs.filter((_, n) => n !== i) })}>
                删除此比较
              </Button>
            </fieldset>
          );
        })}
        <Button
          disabled={samples.length < 2}
          onClick={() =>
            save({
              pairs: [
                ...r.pairs,
                {
                  otherId: "",
                  scope: "whole",
                  choice: "unrated",
                  quote: "",
                  at: new Date().toISOString(),
                },
              ],
            })
          }
        >
          添加成对比较
        </Button>
      </div>
    </details>
  );
}
