import assert from 'node:assert/strict';
import test from 'node:test';
import { detectsCohort2027, detectsNanning, normalizeCompanyName, treeDepth, uniqueByNormalizedName, validateOwnershipTree } from './collector.ts';

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
