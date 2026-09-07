export function normalizeCompanyName(value: string): string {
  return value
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

export type TreeLike = {
  id: string;
  name?: string;
  level?: number;
  entityKind?: string;
  coverageSetId?: string;
  verificationStatus?: string;
  verifiedAt?: string;
  recruitmentUrl?: string;
  sourceUrl?: string;
  children?: TreeLike[];
};

export type CoverageLike = {
  id: string;
  parentId: string;
  disclosedTotal: number;
  expectedNodeIds: string[];
  sourceUrls: string[];
};

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

export function validateOwnershipCoverage(roots: TreeLike[], sets: CoverageLike[]): string[] {
  const errors: string[] = [];
  const nodes = flattenOwnershipTrees(roots);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const names = new Set<string>();
  for (const node of nodes) {
    const normalizedName = node.name ? normalizeCompanyName(node.name) : '';
    if (normalizedName && names.has(normalizedName)) errors.push(`${node.name} 名称重复`);
    if (normalizedName) names.add(normalizedName);
    if (node.entityKind === '分支机构' && node.level !== 3) errors.push(`${node.id} 分支机构不能作为二级子公司`);
  }
  for (const set of sets) {
    const parent = nodeMap.get(set.parentId);
    if (!parent) {
      errors.push(`${set.id} 缺少父节点`);
      continue;
    }
    if (set.disclosedTotal !== set.expectedNodeIds.length) errors.push(`${set.id} 披露总数与清单不一致`);
    if (!set.sourceUrls.length) errors.push(`${set.id} 缺少覆盖来源`);
    const actualIds = (parent.children ?? []).filter((node) => node.coverageSetId === set.id).map((node) => node.id).sort();
    const expectedIds = [...set.expectedNodeIds].sort();
    if (actualIds.join('|') !== expectedIds.join('|')) errors.push(`${set.id} 二级节点与覆盖清单不一致`);
    for (const id of set.expectedNodeIds) {
      const node = nodeMap.get(id);
      if (!node) {
        errors.push(`${set.id} 缺少节点 ${id}`);
        continue;
      }
      if (node.level !== 2) errors.push(`${id} 不是二级主体`);
      if (node.verificationStatus !== '已核验') errors.push(`${id} 尚未核验`);
      if (!node.verifiedAt || !node.sourceUrl || !node.recruitmentUrl) errors.push(`${id} 缺少核验日期、证据或招聘渠道`);
    }
  }
  return errors;
}

export function treeDepth(root: TreeLike): number {
  return 1 + Math.max(0, ...(root.children ?? []).map(treeDepth));
}
