export function cleanCollectedCompanyName(value: string): string {
  let cleaned = value.normalize('NFKC').replace(/^(?:南宁|广西南宁)[丨|·:\s]+/, '').trim();
  const catalogPrefix = /^.+?\s+收录\s+20\d{2}[.-]\d{2}[.-]\d{2}\s+/;
  const fromCatalog = catalogPrefix.test(cleaned);
  cleaned = cleaned.replace(catalogPrefix, '');
  if (fromCatalog) {
    const legalName = cleaned.match(/^(.+?(?:有限责任公司|股份有限公司|有限公司))(?:\s|$)/)?.[1];
    if (legalName) cleaned = legalName;
    else {
      const parts = cleaned.split(/\s+/).filter(Boolean);
      if (parts.length > 1) {
        const last = parts.at(-1)!;
        const lastBase = last.replace(/[（(].*$/, '');
        cleaned = lastBase === parts[0] ? parts[0] : last.startsWith(parts[0]) && last.length > parts[0].length ? last : parts[0];
      }
    }
  }
  cleaned = cleaned.replace(/启动$/, '');
  cleaned = cleaned.replace(/[,，]\s*[A-Za-z][A-Za-z\s.-]*$/, '').replace(/([\u4e00-\u9fff])\s+[A-Z][A-Z\s-]{2,}$/, '$1');
  if (/^(?:大有可为|聚猛士|奔赴|逐梦|智启|职等你)/.test(cleaned) && /[丨|]/.test(cleaned)) cleaned = cleaned.split(/[丨|]/).at(-1)?.trim() ?? cleaned;
  return cleaned.replace(/^[\s·—-]+|[\s·—-]+$/g, '').trim();
}

export function normalizeCompanyName(value: string): string {
  return cleanCollectedCompanyName(value)
    .normalize('NFKC')
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[\s·•—-]+/g, '')
    .replace(/有限责任公司$|股份有限公司$|有限公司$/g, '')
    .toLowerCase();
}

export function detectsCohort2027(value: string): boolean {
  return /2027\s*届|2027\s*年(?:度)?(?:秋季|校园|校招|应届)/i.test(value.normalize('NFKC'));
}

export function detectsNanning(value: string): boolean {
  return /广西(?:壮族自治区)?南宁市?|工作地点[：:]?\s*南宁|驻邕|南宁/.test(value.normalize('NFKC'));
}

export function uniqueByNormalizedName<T extends { name: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = normalizeCompanyName(row.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type CollectableSource = {
  id: string;
  url: string;
  name?: string;
  role?: 'discovery' | 'verification';
  parser?: 'jobup-table' | 'jsonld-itemlist' | 'anchor-list';
  locationScope?: string[];
};

export type CandidateLead = {
  companyName: string;
  title: string;
  sourceId: string;
  sourceUrl: string;
  channelUrl?: string;
  publishedAt?: string;
  locations: string[];
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function cleanText(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\\[nrt]/g, ' ').replace(/\\"/g, '"'))
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(value: string | undefined, baseUrl: string): string | undefined {
  if (!value || /^(?:javascript:|#)/i.test(value)) return undefined;
  try {
    return new URL(decodeHtml(value.replace(/\\u0026/g, '&').replace(/\\\//g, '/')), baseUrl).toString();
  } catch {
    return undefined;
  }
}

function inferLocations(value: string, fallback: string[] = []): string[] {
  const locations = new Set(fallback);
  if (detectsNanning(value)) locations.add('广西南宁');
  if (/广西|桂林|柳州|北海|钦州|防城港|贵港|玉林|百色|河池|崇左|来宾|梧州|贺州/.test(value)) locations.add('广西全区');
  if (/全国|多地|各地/.test(value)) locations.add('全国');
  return [...locations];
}

function companyFromTitle(value: string): string {
  return cleanText(value)
    .replace(/^\d{1,2}月\s*\d{1,2}日\s*/, '')
    .replace(/[｜|].*$/, '')
    .replace(/(?:2027|27)\s*届?.*$/, '')
    .replace(/(?:秋季|春季)?校园招聘.*$/, '')
    .replace(/(?:秋招|春招|校招|实习生招聘|招聘简章|招聘公告).*$/, '')
    .replace(/[：:·—-]+$/, '')
    .trim();
}

export function extractJobupLeads(html: string, source: CollectableSource): CandidateLead[] {
  const matches = [
    ...html.matchAll(/<strong[^>]*class="company-name"[^>]*title="([^"]+)"[^>]*>/gi),
    ...html.matchAll(/className\\?":\\?"company-name\\?",\\?"title\\?":\\?"([^"\\]+)["\\]/gi),
  ];
  return matches.flatMap((match) => {
    const companyName = cleanCollectedCompanyName(cleanText(match[1]));
    if (!companyName || companyName.length > 80) return [];
    const start = match.index ?? 0;
    const context = html.slice(Math.max(0, start - 500), start + 3600);
    if (!/(?:2027\s*届|27\s*秋招|2027\s*校园)/i.test(cleanText(context))) return [];
    const titles = [...context.matchAll(/class="table-clamp[^"']*"[^>]*title="([^"]+)"/gi)].map((item) => cleanText(item[1]));
    const date = context.match(/(?:dateTime|title)="(20\d{2}-\d{2}-\d{2})"/i)?.[1]
      ?? context.match(/(?:dateTime|title)\\?":\\?"(20\d{2}-\d{2}-\d{2})/i)?.[1];
    return [{
      companyName,
      title: `${companyName}2027届校园招聘`,
      sourceId: source.id,
      sourceUrl: source.url,
      publishedAt: date,
      locations: inferLocations(titles.slice(0, 5).join(' '), source.locationScope),
    }];
  });
}

export function extractJsonLdLeads(html: string, source: CollectableSource): CandidateLead[] {
  const leads: CandidateLead[] = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const payload = JSON.parse(decodeHtml(match[1]));
      const graph = Array.isArray(payload?.['@graph']) ? payload['@graph'] : [payload];
      for (const list of graph.filter((item: { '@type'?: string }) => item?.['@type'] === 'ItemList')) {
        for (const entry of list.itemListElement ?? []) {
          const item = entry.item ?? entry;
          const title = cleanText(item.name ?? entry.name ?? '');
          const companyName = cleanCollectedCompanyName(companyFromTitle(title));
          if (!companyName || !detectsCohort2027(title)) continue;
          leads.push({ companyName, title, sourceId: source.id, sourceUrl: source.url, channelUrl: absoluteUrl(item.url ?? entry.url, source.url), locations: inferLocations(`${title} ${item.description ?? ''}`, source.locationScope) });
        }
      }
    } catch {
      // Invalid JSON-LD is ignored; the source health result still records the page.
    }
  }
  return leads;
}

export function extractAnchorLeads(html: string, source: CollectableSource): CandidateLead[] {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap((match) => {
    const title = cleanText(match[2]);
    const companyName = cleanCollectedCompanyName(companyFromTitle(title));
    const channelUrl = absoluteUrl(match[1], source.url);
    if (!channelUrl || !detectsCohort2027(title) || /双选会|招聘会|就业服务攻坚|招聘活动/.test(title) || companyName.length < 2 || companyName.length > 80) return [];
    return [{ companyName, title, sourceId: source.id, sourceUrl: source.url, channelUrl, locations: inferLocations(title, source.locationScope) }];
  });
}

export function extractRecruitmentLeads(html: string, source: CollectableSource): CandidateLead[] {
  if (source.parser === 'jobup-table') return extractJobupLeads(html, source);
  if (source.parser === 'jsonld-itemlist') return [...extractJsonLdLeads(html, source), ...extractAnchorLeads(html, source)];
  return extractAnchorLeads(html, source);
}

export function mergeCandidateLeads(rows: CandidateLead[]): Array<CandidateLead & { sourceIds: string[]; sourceUrls: string[] }> {
  const merged = new Map<string, CandidateLead & { sourceIds: string[]; sourceUrls: string[] }>();
  for (const row of rows) {
    const key = normalizeCompanyName(row.companyName);
    if (!key) continue;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...row, sourceIds: [row.sourceId], sourceUrls: [row.sourceUrl] });
      continue;
    }
    current.sourceIds = [...new Set([...current.sourceIds, row.sourceId])];
    current.sourceUrls = [...new Set([...current.sourceUrls, row.sourceUrl])];
    current.locations = [...new Set([...current.locations, ...row.locations])];
    current.channelUrl ??= row.channelUrl;
    current.publishedAt ??= row.publishedAt;
  }
  return [...merged.values()];
}

export type TreeLike = {
  id: string;
  name?: string;
  level?: number;
  entityKind?: string;
  coverageSetId?: string;
  verificationStatus?: string;
  verifiedAt?: string;
  recruitmentChannels?: OwnershipRecruitmentChannelLike[];
  unifiedSocialCreditCode?: string;
  registeredLocation?: string;
  sourceUrl?: string;
  children?: TreeLike[];
};

export type OwnershipRecruitmentChannelLike = {
  label?: string;
  type?: string;
  match?: string;
  status?: string;
  url?: string;
  appliesToCompanyName?: string;
  evidenceUrl?: string;
  verifiedAt?: string;
};

export type CoverageLike = {
  id: string;
  parentId: string;
  targetLevel: 2 | 3;
  officialDisclosedTotal: number | null;
  expectedNodeIds: string[];
  pendingNodeIds: string[];
  completenessStatus: string;
  sourceUrls: string[];
};

export type OwnershipEvidenceLike = { id: string; sourceType: string };
export type OwnershipEdgeLike = { parentId: string; childId: string; evidenceIds: string[]; verificationStatus: string };

export function validateOwnershipTree(root: TreeLike): string[] {
  const errors: string[] = [];
  const path = new Set<string>();
  const ids = new Set<string>();
  const visit = (node: TreeLike, parent?: TreeLike) => {
    if (!node.id) errors.push('存在缺少 id 的节点');
    if (!node.sourceUrl) errors.push(`${node.id || '未知节点'} 缺少来源`);
    if (ids.has(node.id)) errors.push(`${node.id} 重复出现`);
    ids.add(node.id);
    if (parent?.level !== undefined && node.level !== undefined && node.level !== parent.level + 1) errors.push(`${node.id} 层级与父节点不连续`);
    if (path.has(node.id)) {
      errors.push(`${node.id} 形成循环`);
      return;
    }
    path.add(node.id);
    node.children?.forEach((child) => visit(child, node));
    path.delete(node.id);
  };
  visit(root);
  return errors;
}

export function flattenOwnershipTrees(roots: TreeLike[]): TreeLike[] {
  return roots.flatMap((root) => [root, ...flattenOwnershipTrees(root.children ?? [])]);
}

export function validateOwnershipCoverage(roots: TreeLike[], sets: CoverageLike[], edges: OwnershipEdgeLike[] = [], evidence: OwnershipEvidenceLike[] = []): string[] {
  const errors: string[] = [];
  const nodes = flattenOwnershipTrees(roots);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const parentMap = new Map<string, TreeLike>();
  const indexParents = (parent: TreeLike) => parent.children?.forEach((child) => { parentMap.set(child.id, parent); indexParents(child); });
  roots.forEach(indexParents);
  const names = new Set<string>();
  for (const node of nodes) {
    const normalizedName = node.name ? normalizeCompanyName(node.name) : '';
    if (normalizedName && names.has(normalizedName)) errors.push(`${node.name} 名称重复`);
    if (normalizedName) names.add(normalizedName);
    if (node.entityKind === '分支机构') errors.push(`${node.id} 分支机构不能计入法律控制树`);
    if (node.level === 3 && node.verificationStatus === '已核验' && (!node.unifiedSocialCreditCode || !node.registeredLocation)) errors.push(`${node.id} 已核验三级法人缺少统一社会信用代码或注册地`);
    if ((node.level ?? 0) > 0 && !node.recruitmentChannels?.length) errors.push(`${node.id} 缺少招聘渠道状态`);
    for (const channel of node.recruitmentChannels ?? []) {
      if (!channel.label || !channel.type || !channel.match || !channel.status || !channel.verifiedAt) errors.push(`${node.id} 招聘渠道字段不完整`);
      if (channel.match === '暂无公开入口') {
        if (channel.url || channel.status !== '暂无公开入口' || channel.type !== '无公开渠道') errors.push(`${node.id} 暂无入口状态与链接不一致`);
        continue;
      }
      if (!channel.url || !channel.url.startsWith('https://')) errors.push(`${node.id} 招聘渠道不是有效 HTTPS 链接`);
      if ((channel.match === '公司专属' || channel.match === '单位已定位') && (!channel.evidenceUrl || channel.appliesToCompanyName !== node.name)) errors.push(`${node.id} 专属招聘渠道缺少公司归属证据`);
      if (channel.match === '集团兜底' && channel.type !== '集团通用入口') errors.push(`${node.id} 集团兜底渠道类型错误`);
      const parent = parentMap.get(node.id);
      const parentUrls = new Set(parent?.recruitmentChannels?.map((item) => item.url).filter(Boolean));
      if (channel.url && parentUrls.has(channel.url) && channel.match === '公司专属') errors.push(`${node.id} 公司专属招聘链接与母公司完全相同`);
    }
  }
  for (const set of sets) {
    const parent = nodeMap.get(set.parentId);
    if (!parent) {
      errors.push(`${set.id} 缺少父节点`);
      continue;
    }
    if (set.completenessStatus === '官方清单已闭合' && (set.officialDisclosedTotal !== set.expectedNodeIds.length || set.pendingNodeIds.length)) errors.push(`${set.id} 闭合状态与清单不一致`);
    if (!set.sourceUrls.length) errors.push(`${set.id} 缺少覆盖来源`);
    const actualIds = (parent.children ?? []).filter((node) => node.coverageSetId === set.id).map((node) => node.id).sort();
    const listedIds = [...set.expectedNodeIds, ...set.pendingNodeIds].sort();
    if (actualIds.join('|') !== listedIds.join('|')) errors.push(`${set.id} 节点与覆盖清单不一致`);
    for (const id of listedIds) {
      const node = nodeMap.get(id);
      if (!node) {
        errors.push(`${set.id} 缺少节点 ${id}`);
        continue;
      }
      if (node.level !== set.targetLevel) errors.push(`${id} 不是目标层级主体`);
      if (set.expectedNodeIds.includes(id) && node.verificationStatus !== '已核验') errors.push(`${id} 尚未核验`);
      if (set.pendingNodeIds.includes(id) && node.verificationStatus !== '待确认') errors.push(`${id} 应标记待确认`);
      if (!node.verifiedAt || !node.sourceUrl || !node.recruitmentChannels?.length) errors.push(`${id} 缺少核验日期、证据或招聘渠道状态`);
    }
  }
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));
  if (edges.length) {
    const incoming = new Map<string, number>();
    for (const edge of edges) {
      const parent = nodeMap.get(edge.parentId);
      const child = nodeMap.get(edge.childId);
      if (!parent || !child) { errors.push(`${edge.parentId}→${edge.childId} 缺少节点`); continue; }
      if ((parent.level ?? -1) + 1 !== child.level) errors.push(`${edge.childId} 所有权边层级不连续`);
      incoming.set(edge.childId, (incoming.get(edge.childId) ?? 0) + 1);
      if (!edge.evidenceIds.length || edge.evidenceIds.some((id) => !evidenceMap.has(id))) errors.push(`${edge.childId} 缺少有效关系证据`);
      if (edge.verificationStatus === '已核验' && edge.evidenceIds.every((id) => evidenceMap.get(id)?.sourceType === '招聘公告')) errors.push(`${edge.childId} 不能仅用招聘公告证明控制关系`);
    }
    for (const node of nodes.filter((item) => item.level !== 0)) if (incoming.get(node.id) !== 1) errors.push(`${node.id} 必须且只能有一条直接父边`);
    for (const node of nodes.filter((item) => item.level === 2)) if (!sets.some((set) => set.parentId === node.id && set.targetLevel === 3)) errors.push(`${node.id} 缺少三级覆盖清单`);
  }
  return errors;
}

export function treeDepth(root: TreeLike): number {
  return 1 + Math.max(0, ...(root.children ?? []).map(treeDepth));
}
