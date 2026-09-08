import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { extractRecruitmentLeads, mergeCandidateLeads, normalizeCompanyName } from '../lib/collector.ts';
import type { RecruitmentLead, RecruitmentLeadStatus } from '../lib/types.ts';

type RegistrySource = {
  id: string;
  name: string;
  url: string;
  expected: string[];
  role: 'discovery' | 'verification';
  authorityTier: 1 | 2 | 3;
  parser: 'jobup-table' | 'jsonld-itemlist' | 'anchor-list';
  collect: boolean;
  priority: number;
  locationScope?: string[];
};

type Registry = {
  schemaVersion: number;
  sourcePolicy: { targetDailyQualifiedLeads: number; candidateWindowHours: number };
  excludedSources: string[];
  sources: RegistrySource[];
};

const write = process.argv.includes('--write');
const registryPath = path.resolve('data/source-registry.json');
const healthPath = path.resolve('data/source-health.json');
const leadsPath = path.resolve('data/recruitment-leads.json');
const syncPath = path.resolve('data/recruitment-sync.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8')) as Registry;
const completedAt = new Date().toISOString();

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

async function parallelMap<T, R>(rows: T[], limit: number, task: (row: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(rows.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, rows.length) }, async () => {
    while (cursor < rows.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(rows[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

const sourceResults = await parallelMap(registry.sources, 6, async (source) => {
  const started = Date.now();
  try {
    const response = await fetch(source.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
      headers: {
        'user-agent': 'NanningCampusInfoBot/2.0 (+public-source-check; no-login; contact=site-owner)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    const html = await response.text();
    const matched = source.expected.some((pattern) => new RegExp(pattern, 'i').test(html));
    const health = !response.ok ? '异常' : matched ? '正常' : '内容待确认';
    const candidates = source.collect && response.ok && matched ? extractRecruitmentLeads(html, source) : [];
    return {
      source,
      candidates,
      health: {
        id: source.id,
        name: source.name,
        checkedAt: completedAt,
        httpStatus: response.status,
        health,
        elapsedMs: Date.now() - started,
        extractedLeads: candidates.length,
      },
    };
  } catch (error) {
    return {
      source,
      candidates: [],
      health: {
        id: source.id,
        name: source.name,
        checkedAt: completedAt,
        httpStatus: null,
        health: '异常',
        elapsedMs: Date.now() - started,
        extractedLeads: 0,
        message: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
});

const sourceById = new Map(registry.sources.map((source) => [source.id, source]));
const rawCandidates = sourceResults.flatMap((result) => result.candidates);
const mergedCandidates = mergeCandidateLeads(rawCandidates);
let previousLeads: RecruitmentLead[] = [];
try {
  const previous = JSON.parse(await readFile(leadsPath, 'utf8')) as { leads?: RecruitmentLead[] };
  previousLeads = previous.leads ?? [];
} catch {
  // The first run starts without historical candidates.
}
const previousByName = new Map(previousLeads.map((lead) => [lead.normalizedCompanyName, lead]));

const leads: RecruitmentLead[] = mergedCandidates.flatMap((candidate) => {
  const normalizedCompanyName = normalizeCompanyName(candidate.companyName);
  if (normalizedCompanyName.length < 2 || candidate.sourceUrls.length === 0) return [];
  const sourceRoles = candidate.sourceIds.map((id) => sourceById.get(id)?.role);
  let status: RecruitmentLeadStatus = '待核验';
  if (sourceRoles.includes('verification')) status = '官方确认';
  else if (new Set(candidate.sourceIds).size >= 2) status = '双来源确认';
  const fingerprint = `2027-${hash(normalizedCompanyName)}`;
  const previous = previousByName.get(normalizedCompanyName);
  return [{
    id: previous?.id ?? `lead-${hash(normalizedCompanyName)}`,
    companyName: candidate.companyName,
    normalizedCompanyName,
    title: candidate.title,
    cohort: 2027,
    locations: candidate.locations,
    sourceIds: candidate.sourceIds,
    sourceUrls: candidate.sourceUrls,
    channelUrl: candidate.channelUrl,
    publishedAt: candidate.publishedAt,
    discoveredAt: previous?.discoveredAt ?? completedAt,
    lastSeenAt: completedAt,
    status,
    fingerprint,
  }];
}).sort((left, right) => (right.publishedAt ?? '').localeCompare(left.publishedAt ?? '') || left.companyName.localeCompare(right.companyName, 'zh-CN'));

const verifiedLeads = leads.filter((lead) => lead.status !== '待核验').length;
const nanningLeads = leads.filter((lead) => lead.locations.includes('广西南宁')).length;
const target = registry.sourcePolicy.targetDailyQualifiedLeads;
const anomalyCount = sourceResults.filter((result) => result.health.health === '异常').length;
const targetMet = leads.length >= target;
const report = {
  schemaVersion: 2,
  mode: write ? 'write' : 'dry-run',
  completedAt,
  target,
  targetMet,
  counters: {
    sourceCount: registry.sources.length,
    healthySourceCount: sourceResults.filter((result) => result.health.health === '正常').length,
    anomalyCount,
    rawLeads: rawCandidates.length,
    qualifiedLeads: leads.length,
    verifiedLeads,
    pendingLeads: leads.length - verifiedLeads,
    nanningLeads,
  },
  sources: sourceResults.map((result) => result.health),
  leads,
  warnings: targetMet ? [] : [`本次仅获得 ${leads.length} 条有效线索，低于每日 ${target} 条目标；保留上一版正式数据。`],
};

if (write) {
  await Promise.all([
    writeFile(healthPath, `${JSON.stringify({ schemaVersion: 2, completedAt, results: report.sources }, null, 2)}\n`, 'utf8'),
    writeFile(leadsPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    writeFile(syncPath, `${JSON.stringify({ schemaVersion: 1, completedAt, target, targetMet, counters: report.counters, warnings: report.warnings }, null, 2)}\n`, 'utf8'),
  ]);
}

console.log(JSON.stringify({ ...report, leads: report.leads.slice(0, 10), previewOnly: report.leads.length > 10 }, null, 2));
if (sourceResults.every((result) => result.health.health === '异常')) process.exitCode = 1;
else if (!targetMet) process.exitCode = 2;
