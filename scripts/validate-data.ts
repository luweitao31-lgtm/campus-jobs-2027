import { readFile } from 'node:fs/promises';
import { awards, companies, ownershipCoverageSets, ownershipEdges, ownershipEvidence, ownershipTrees, recruitmentRecords, sources } from '../data/catalog.ts';
import { treeDepth, validateOwnershipCoverage, validateOwnershipTree } from '../lib/collector.ts';
import type { OwnershipNode, RecruitmentAlert, RecruitmentMonitorEntry } from '../lib/types.ts';

const errors: string[] = [];
const registry = JSON.parse(await readFile('data/source-registry.json', 'utf8')) as {
  excludedSources: string[];
  sourcePolicy: { targetDailyQualifiedLeads: number; targetPrivateForeignShare: number };
  sources: Array<{ id: string; name: string; url: string; role: string; collect: boolean }>;
};
const leadReport = JSON.parse(await readFile('data/recruitment-leads.json', 'utf8')) as {
  target: number;
  targetMet: boolean;
  counters: { qualifiedLeads: number; privateForeignLeads: number; privateForeignShare: number; privateForeignTarget: number };
  leads: Array<{ companyName: string; cohort: number; nature: string; sourceIds: string[]; sourceUrls: string[]; fingerprint: string }>;
};
const directoryReport = JSON.parse(await readFile('data/recruitment-directory.json', 'utf8')) as {
  baselineCount: number;
  totalCount: number;
  netNewCount: number;
  entries: Array<{ name: string; normalizedCompanyName: string; status: string; confidence: string; channel: { url: string }; sourceIds: string[] }>;
};
const alertReport = JSON.parse(await readFile('data/recruitment-alerts.json', 'utf8')) as {
  baselineInitialized: boolean;
  activeAlertCount: number;
  alerts: RecruitmentAlert[];
};
const monitorReport = JSON.parse(await readFile('data/recruitment-monitor-state.json', 'utf8')) as { entries: RecruitmentMonitorEntry[] };
const companyIds = new Set(companies.map((company) => company.id));
const sourceIds = new Set(sources.map((source) => source.id));
const flattenOwnershipNodes = (nodes: OwnershipNode[]): OwnershipNode[] => nodes.flatMap((node) => [node, ...flattenOwnershipNodes(node.children ?? [])]);
const ownershipNodeById = new Map(flattenOwnershipNodes(ownershipTrees).map((node) => [node.id, node]));
const awardCompanyIds = new Set(awards.map((award) => award.companyId));

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
errors.push(...validateOwnershipCoverage(ownershipTrees, ownershipCoverageSets, ownershipEdges, ownershipEvidence));
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
if (leadReport.counters.privateForeignShare < registry.sourcePolicy.targetPrivateForeignShare || leadReport.counters.privateForeignLeads < leadReport.counters.privateForeignTarget) errors.push('本次民企与外企线索占比未达到每日50%目标');
for (const lead of leadReport.leads) {
  if (lead.cohort !== 2027) errors.push(`${lead.companyName} 不是 2027 届线索`);
  if (!lead.companyName || !lead.sourceIds.length || !lead.sourceUrls.length) errors.push(`${lead.companyName || '未知线索'} 缺少名称或来源`);
  if (lead.sourceIds.some((id) => !registryIds.has(id))) errors.push(`${lead.companyName} 引用了未登记来源`);
  if (leadFingerprints.has(lead.fingerprint)) errors.push(`${lead.companyName} 指纹重复`);
  leadFingerprints.add(lead.fingerprint);
  for (const url of lead.sourceUrls) try { new URL(url); } catch { errors.push(`${lead.companyName} 的线索链接无效`); }
}
const directoryNames = new Set<string>();
if (directoryReport.totalCount < 70) errors.push(`秋招企业总数仅 ${directoryReport.totalCount} 家，未达到70家`);
if (directoryReport.netNewCount < 50) errors.push(`首次净新增仅 ${directoryReport.netNewCount} 家，未达到50家`);
if (directoryReport.totalCount !== directoryReport.entries.length) errors.push('秋招目录统计与实际条目数不一致');
for (const entry of directoryReport.entries) {
  if (!entry.name || !entry.normalizedCompanyName || directoryNames.has(entry.normalizedCompanyName)) errors.push(`${entry.name || '未知企业'} 名称为空或重复`);
  directoryNames.add(entry.normalizedCompanyName);
  try { new URL(entry.channel.url); } catch { errors.push(`${entry.name} 缺少有效招聘渠道`); }
  if (entry.confidence === '待确认' && entry.status === '开放中') errors.push(`${entry.name} 待确认记录不能标记为开放中`);
  if (entry.confidence === '已核验' && !entry.sourceIds.length) errors.push(`${entry.name} 已核验记录缺少来源`);
}

if (!alertReport.baselineInitialized) errors.push('招聘提醒尚未完成首次基线初始化');
if (alertReport.activeAlertCount !== alertReport.alerts.length) errors.push('招聘提醒统计与实际条目数不一致');
const alertIds = new Set<string>();
for (const alert of alertReport.alerts) {
  if (alertIds.has(alert.id)) errors.push(`招聘提醒 ${alert.id} 重复`);
  alertIds.add(alert.id);
  if (!alert.companyName || !alert.fingerprint || !alert.detectedAt || !alert.sourceUrl) errors.push(`招聘提醒 ${alert.id} 缺少必要字段`);
  try { new URL(alert.channelUrl); new URL(alert.sourceUrl); } catch { errors.push(`招聘提醒 ${alert.id} 的链接无效`); }
  if (alert.module === 'ownership') {
    const node = ownershipNodeById.get(alert.entityId);
    if (!node) errors.push(`招聘提醒 ${alert.id} 指向未知资金链主体`);
    const eligible = node?.recruitmentChannels.some((channel) => channel.url === alert.channelUrl && channel.status !== '已截止' && (channel.match === '公司专属' || channel.match === '单位已定位'));
    if (!eligible) errors.push(`招聘提醒 ${alert.id} 使用了集团兜底、已截止或不匹配的资金链渠道`);
  } else if (alert.module === 'employers') {
    if (!awardCompanyIds.has(alert.entityId)) errors.push(`招聘提醒 ${alert.id} 指向未知最佳雇主企业`);
  } else errors.push(`招聘提醒 ${alert.id} 的模块无效`);
}
const monitorKeys = new Set<string>();
for (const entry of monitorReport.entries) {
  if (monitorKeys.has(entry.key)) errors.push(`招聘监控键 ${entry.key} 重复`);
  monitorKeys.add(entry.key);
  if (!entry.entityId || !entry.companyName || !entry.fingerprint || !entry.checkedAt) errors.push(`招聘监控 ${entry.key} 缺少必要字段`);
  try { new URL(entry.channelUrl); new URL(entry.sourceUrl); } catch { errors.push(`招聘监控 ${entry.key} 的链接无效`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`数据校验通过：秋招目录 ${directoryReport.totalCount} 家（净新增 ${directoryReport.netNewCount} 家），其中 ${recruitmentRecords.length} 条原正式秋招、${leadReport.leads.length} 条有效线索，${registry.sources.length} 个来源，${awards.length} 条榜单。`);
