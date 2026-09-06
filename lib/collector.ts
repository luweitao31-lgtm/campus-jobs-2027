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

export type TreeLike = { id: string; sourceUrl?: string; children?: TreeLike[] };

export function validateOwnershipTree(root: TreeLike): string[] {
  const errors: string[] = [];
  const path = new Set<string>();
  const visit = (node: TreeLike) => {
    if (!node.id) errors.push('存在缺少 id 的节点');
    if (!node.sourceUrl) errors.push(`${node.id || '未知节点'} 缺少来源`);
    if (path.has(node.id)) {
      errors.push(`${node.id} 形成循环`);
      return;
    }
    path.add(node.id);
    node.children?.forEach(visit);
    path.delete(node.id);
  };
  visit(root);
  return errors;
}

export function treeDepth(root: TreeLike): number {
  return 1 + Math.max(0, ...(root.children ?? []).map(treeDepth));
}
