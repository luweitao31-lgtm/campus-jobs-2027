import { awards, companies, ownershipTrees, recruitmentRecords, sources } from '../data/catalog.ts';
import { treeDepth, validateOwnershipTree } from '../lib/collector.ts';

const errors: string[] = [];
const companyIds = new Set(companies.map((company) => company.id));
const sourceIds = new Set(sources.map((source) => source.id));

for (const company of companies) {
  if (!company.channels.length) errors.push(`${company.name} 缺少投递渠道`);
  for (const channel of company.channels) {
    try { new URL(channel.url); } catch { errors.push(`${company.name} 的投递链接无效`); }
  }
}
for (const record of recruitmentRecords) {
  if (!companyIds.has(record.companyId)) errors.push(`${record.id} 引用了未知企业`);
  if (!record.sourceIds.length || record.sourceIds.some((id) => !sourceIds.has(id))) errors.push(`${record.id} 缺少有效来源`);
}
for (const root of ownershipTrees) {
  errors.push(...validateOwnershipTree(root));
  if (treeDepth(root) < 4) errors.push(`${root.name} 未达到监管主体加三级企业的深度`);
}
for (const award of awards) {
  if (!companyIds.has(award.companyId)) errors.push(`${award.id} 引用了未知企业`);
  if (!award.nanningBasis || !award.sourceUrl) errors.push(`${award.id} 缺少南宁依据或榜单来源`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`数据校验通过：${companies.length} 家企业，${recruitmentRecords.length} 条秋招，${awards.length} 条榜单，${ownershipTrees.length} 条控股树。`);
