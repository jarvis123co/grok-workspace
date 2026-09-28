import type { Report, ProfileItem } from "./stats.ts";
import { zh } from "./zh.ts";

export function markdownZh(report: Report, date: Date): string {
  const section = (title: string, rows: string[]) =>
    `## ${title}\n\n${rows.length ? rows.map((x) => `- ${x}`).join("\n") : "当前证据量下暂无结论。"}\n`;
  const item = (r: ProfileItem) =>
    `${zh(r.category)} · ${zh(r.fieldLabel)}：${zh(r.value)}（标识：${r.key}=${r.value}）；偏好组 ${r.preferredCount}/${r.preferredCovered}，负面组 ${r.dislikeCount}/${r.dislikeCovered}，核心参考 ${r.coreCount}/${r.coreCovered}；证据：${zh(r.evidence)}。`;
  return [
    "# 审美画像",
    `生成时间：${date.toISOString()}`,
    "语言：简体中文（zh-CN）。英文属性标识保留以便机器对照。用户原话、解释、来源和假设保留原文，不自动翻译。",
    section("证据基础", [
      `图片 ${report.counts.total} 张；已分析 ${report.counts.analyzed} 张；人工修正 ${report.counts.edits} 项。`,
      `证据组 ${report.research.evidenceUnits} 个；未分组 ${report.research.ungrouped} 张；待评价 ${report.research.unrated} 张；排除或有限 ${report.research.excludedOrLimited} 张。未知分组不代表相互独立。`,
    ]),
    report.caution ? `> ${zh(report.caution)}` : "",
    section("1. 较强的描述性倾向（非已验证偏好）", report.profile.strong.map(item)),
    section("2. 中等证据", report.profile.moderate.map(item)),
    section("3. 较弱或不确定的倾向", report.profile.weak.map(item)),
    section("4. 推测的负面关联（非用户明确表态）", report.profile.dislikes.map(item)),
    section(
      "5. 重要特征组合",
      report.profile.combinations.map(
        (r) =>
          `${zh(r.leftLabel)} + ${zh(r.rightLabel)}；${r.count}/${r.covered}，${zh(r.evidence)}；标识：${r.left} + ${r.right}`,
      ),
    ),
    section(
      "研究记录（保留原文）",
      report.research.records.flatMap((r) => [
        `样本：${r.fileName}；编号：${r.sampleId}；备注原文：${r.notes ?? ""}；来源：${r.research?.source ?? ""}；状态：${r.research?.state ?? ""}`,
        ...(r.research?.judgments ?? []).map(
          (j) =>
            `范围：${zh(j.scope)} [${j.scope}]；${j.excluded ? "已排除" : zh(j.label)}；原话：${j.quote}；解释：${j.interpretation}；来源：${j.source}；时间：${j.at}`,
        ),
        ...(r.research?.routes ?? []).map(
          (j) =>
            `路线状态：${zh(j.status)}；条件：${j.condition}；偏好：${j.preference}；边界：${j.boundary}；反例：${j.counterexample}`,
        ),
        ...(r.research?.pairs ?? []).map(
          (j) =>
            `对照样本：${j.otherId}；范围：${zh(j.scope)} [${j.scope}]；结果：${zh(j.choice)}；原话：${j.quote}；时间：${j.at}`,
        ),
      ]),
    ),
    section("方法与限制", [
      zh(report.profile.note),
      "只统计中高置信度的可见属性，不可见特征不计入分母。多选属性百分比之和可以超过 100%。描述性关联不是因果或显著性检验，不输出生图提示词。",
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");
}
