/**
 * 轻量 ATS 评分（前端可视化用）
 * 规则：关键词覆盖(40) + 量化要点比例(20) + 结构合规(15) + 技能交集(15) + 简洁度(10)
 */
export function atsScore(jdKeywords: string[], text: string, bullets: string[], skills: string[]): number {
  const safeText = (text || '').toLowerCase();
  const uniqueKeywords = Array.from(new Set(jdKeywords.map(k => k.toLowerCase()).filter(Boolean)));
  const keywordHits = uniqueKeywords.filter(k => safeText.includes(k)).length;
  const keywordScore = uniqueKeywords.length ? (keywordHits / uniqueKeywords.length) * 40 : 0;

  // 粗略判断“量化要点”：包含数字或%号的要点比例
  const quantified = bullets.filter(b => /\d|%/.test(b)).length;
  const quantifyScore = bullets.length ? (quantified / bullets.length) * 20 : 0;

  // 结构合规：出现教育/经验/项目/技能等关键段落
  const structureKeys = ['教育', 'experience', '项目', 'skills', '教育经历', '工作经历'];
  const structureHits = structureKeys.filter(k => safeText.includes(k.toLowerCase())).length;
  const structureScore = (structureHits / structureKeys.length) * 15;

  // 技能交集
  const skillHits = skills.filter(s => safeText.includes((s || '').toLowerCase())).length;
  const skillScore = skills.length ? (skillHits / skills.length) * 15 : 0;

  // 简洁度：文本长度在合理区间（1k-6k 字符）越接近越好
  const len = safeText.length;
  let concise = 10;
  if (len < 800) concise = Math.max(2, (len / 800) * 10);
  if (len > 6000) concise = Math.max(2, 10 - ((len - 6000) / 6000) * 8);

  const total = keywordScore + quantifyScore + structureScore + skillScore + concise;
  return Math.max(0, Math.min(100, Math.round(total)));
}


