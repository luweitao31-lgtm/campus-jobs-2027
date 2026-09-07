import assert from 'node:assert/strict';
import test from 'node:test';
import { detectsCohort2027, detectsNanning, normalizeCompanyName, treeDepth, uniqueByNormalizedName, validateOwnershipCoverage, validateOwnershipTree } from './collector.ts';

test('企业名称归一并去重', () => {
  assert.equal(normalizeCompanyName('中国—东盟信息港股份有限公司'), '中国东盟信息港');
  assert.equal(uniqueByNormalizedName([{ name: '广西投资集团有限公司' }, { name: '广西投资集团' }]).length, 1);
});

test('识别 2027 届和南宁地点', () => {
  assert.equal(detectsCohort2027('面向2027届毕业生的秋季校园招聘'), true);
  assert.equal(detectsCohort2027('2026年社会招聘'), false);
  assert.equal(detectsNanning('工作地点：广西南宁市青秀区'), true);
});

test('校验三级控股树并识别循环', () => {
  const valid = { id: 'root', sourceUrl: 'https://example.com', children: [{ id: 'one', sourceUrl: 'https://example.com/1', children: [{ id: 'two', sourceUrl: 'https://example.com/2' }] }] };
  assert.equal(treeDepth(valid), 3);
  assert.deepEqual(validateOwnershipTree(valid), []);
  const cyclic: { id: string; sourceUrl: string; children?: unknown[] } = { id: 'root', sourceUrl: 'x' };
  cyclic.children = [cyclic];
  assert.match(validateOwnershipTree(cyclic as never).join(','), /形成循环/);
});

test('二级覆盖清单必须完整且分支机构不能冒充子公司', () => {
  const roots = [{ id: 'root', name: '监管机构', level: 0, sourceUrl: 'https://example.com', children: [{ id: 'group', name: '示例集团', level: 1, sourceUrl: 'https://example.com/group', children: [{ id: 'company-a', name: '示例公司甲', level: 2, entityKind: '控股企业', coverageSetId: 'coverage', verificationStatus: '已核验', verifiedAt: '2026-09-08', sourceUrl: 'https://example.com/a', recruitmentUrl: 'https://example.com/jobs' }] }] }];
  const coverage = [{ id: 'coverage', parentId: 'group', disclosedTotal: 1, expectedNodeIds: ['company-a'], sourceUrls: ['https://example.com/list'] }];
  assert.deepEqual(validateOwnershipCoverage(roots, coverage), []);
  coverage[0].expectedNodeIds.push('missing');
  assert.match(validateOwnershipCoverage(roots, coverage).join(','), /披露总数与清单不一致|缺少节点/);
});
