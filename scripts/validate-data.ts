import { readFile } from 'node:fs/promises';
import { awards, companies, ownershipCoverageSets, ownershipTrees, recruitmentRecords, sources } from '../data/catalog.ts';
import { treeDepth, validateOwnershipCoverage, validateOwnershipTree } from '../lib/collector.ts';

const errors: string[] = [];
const registry = JSON.parse(await readFile('data/source-registry.json', 'utf8')) as {
  excludedSources: string[];
  sourcePolicy: { targetDailyQualifiedLeads: number };
  sources: Array<{ id: string; name: string; url: string; role: string; collect: boolean }>;
};
const leadReport = JSON.parse(await readFile('data/recruitment-leads.json', 'utf8')) as {
  target: number;
  targetMet: boolean;
  counters: { qualifiedLeads: number };
  leads: Array<{ companyName: string; cohort: number; sourceIds: string[]; sourceUrls: string[]; fingerprint: string }>;
};
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
errors.push(...validateOwnershipCoverage(ownershipTrees, ownershipCoverageSets));
for (const award of awards) {
  if (!companyIds.has(award.companyId)) errors.push(`${award.id} 引用了未知企业`);
  if (!award.nanningBasis || !award.sourceUrl) errors.push(`${award.id} 缺少南宁依据或榜单来源`);
}

const registryIds = new Set<string>();
if (!registry.excludedSources.includes('Offer先生')) errors.push('来源排除清单缺少 Offer先生');
if (registry.sources.length < 20) errors.push('采集来源少于 20 个，无法支撑每日 50+ 目标');
if (registry.sources.filter((source) => source.collect).length < 10) errors.push('启用采集的来源少于 10 个');
for (const source of registry.sources) {
  if (registryIds.has(source.id)) errors.push(`采集来源 ${source.id} 重复`);
  registryIds.add(source.id);
  if (registry.excludedSources.some((name) => source.name.includes(name))) errors.push(`${source.name} 在排除清单中却仍被启用`);
  if (!['discovery', 'verification'].includes(source.role)) errors.push(`${source.id} 的来源角色无效`);
  try { new URL(source.url); } catch { errors.push(`${source.id} 的来源链接无效`); }
}
const leadFingerprints = new Set<string>();
if (!leadReport.targetMet || leadReport.counters.qualifiedLeads < registry.sourcePolicy.targetDailyQualifiedLeads) errors.push('本次有效线索未达到每日目标');
for (const lead of leadReport.leads) {
  if (lead.cohort !== 2027) errors.push(`${lead.companyName} 不是 2027 届线索`);
  if (!lead.companyName || !lead.sourceIds.length || !lead.sourceUrls.length) errors.push(`${lead.companyName || '未知线索'} 缺少名称或来源`);
  if (lead.sourceIds.some((id) => !registryIds.has(id))) errors.push(`${lead.companyName} 引用了未登记来源`);
  if (leadFingerprints.has(lead.fingerprint)) errors.push(`${lead.companyName} 指纹重复`);
  leadFingerprints.add(lead.fingerprint);
  for (const url of lead.sourceUrls) try { new URL(url); } catch { errors.push(`${lead.companyName} 的线索链接无效`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`数据校验通过：${companies.length} 家企业，${recruitmentRecords.length} 条正式秋招，${leadReport.leads.length} 条有效线索，${registry.sources.length} 个来源，${awards.length} 条榜单。`);
