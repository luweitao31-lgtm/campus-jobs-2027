import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanCollectedCompanyName, detectsCohort2027, detectsNanning, extractRecruitmentLeads, mergeCandidateLeads, normalizeCompanyName, treeDepth, uniqueByNormalizedName, validateOwnershipCoverage, validateOwnershipTree } from './collector.ts';

test('企业名称归一并去重', () => {
  assert.equal(normalizeCompanyName('中国—东盟信息港股份有限公司'), '中国东盟信息港');
  assert.equal(uniqueByNormalizedName([{ name: '广西投资集团有限公司' }, { name: '广西投资集团' }]).length, 1);
});

test('清理聚合平台企业名称中的标签、日期和英文别名', () => {
  assert.equal(cleanCollectedCompanyName('民企 通信 收录 2026.09.08 深圳智界探索科技有限公司'), '深圳智界探索科技有限公司');
  assert.equal(cleanCollectedCompanyName('南宁丨平安银行南宁分行'), '平安银行南宁分行');
  assert.equal(cleanCollectedCompanyName('九阳, Joyoung'), '九阳');
});

test('识别 2027 届和南宁地点', () => {
  assert.equal(detectsCohort2027('面向2027届毕业生的秋季校园招聘'), true);
  assert.equal(detectsCohort2027('2026年社会招聘'), false);
  assert.equal(detectsNanning('工作地点：广西南宁市青秀区'), true);
});

test('从聚合页提取、合并并保留明确的公告入口', () => {
  const source = { id: 'jobup', url: 'https://jobup.cn/', role: 'discovery' as const, parser: 'jobup-table' as const };
  const html = '<tr><time dateTime="2026-09-08">09-08</time><strong class="company-name" title="示例科技有限公司">示例科技有限公司</strong><div class="table-clamp" title="互联网"></div><div class="table-clamp job-list" title="管培生"></div><div class="table-clamp" title="广西南宁、深圳"></div><a href="https://example.com/jobs">投递官网</a><span>2027届</span></tr>';
  const leads = extractRecruitmentLeads(html, source);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].sourceUrl, 'https://jobup.cn/');
  assert.ok(leads[0].locations.includes('广西南宁'));
  const anchorLeads = extractRecruitmentLeads('<a href="https://example.com/jobs">示例科技2027届校园招聘</a>', { ...source, parser: 'anchor-list' });
  assert.equal(anchorLeads[0].channelUrl, 'https://example.com/jobs');
  const datedLead = extractRecruitmentLeads('<a href="/career/1">09月 10日 示例科技2027届校园招聘</a>', { ...source, parser: 'anchor-list' });
  assert.equal(datedLead[0].companyName, '示例科技');
  assert.equal(extractRecruitmentLeads('<a href="/fair/1">广西民族大学2027届毕业生秋季双选会</a>', { ...source, parser: 'anchor-list' }).length, 0);
  const merged = mergeCandidateLeads([...leads, { ...leads[0], sourceId: 'second', sourceUrl: 'https://second.example.com' }]);
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].sourceIds.sort(), ['jobup', 'second']);
});

test('校验三级控股树并识别循环', () => {
  const valid = { id: 'root', sourceUrl: 'https://example.com', children: [{ id: 'one', sourceUrl: 'https://example.com/1', children: [{ id: 'two', sourceUrl: 'https://example.com/2' }] }] };
  assert.equal(treeDepth(valid), 3);
  assert.deepEqual(validateOwnershipTree(valid), []);
  const cyclic: { id: string; sourceUrl: string; children?: unknown[] } = { id: 'root', sourceUrl: 'x' };
  cyclic.children = [cyclic];
  assert.match(validateOwnershipTree(cyclic as never).join(','), /形成循环/);
});

test('覆盖清单区分已核验与待确认，闭合状态必须可审计', () => {
  const roots = [{ id: 'root', name: '监管机构', level: 0, sourceUrl: 'https://example.com', children: [{ id: 'group', name: '示例集团', level: 1, sourceUrl: 'https://example.com/group', children: [{ id: 'company-a', name: '示例公司甲', level: 2, entityKind: '控股企业', coverageSetId: 'coverage', verificationStatus: '已核验', verifiedAt: '2026-09-08', sourceUrl: 'https://example.com/a', recruitmentUrl: 'https://example.com/jobs' }] }] }];
  const coverage = [{ id: 'coverage', parentId: 'group', targetLevel: 2 as const, officialDisclosedTotal: 1, expectedNodeIds: ['company-a'], pendingNodeIds: [], completenessStatus: '官方清单已闭合', sourceUrls: ['https://example.com/list'] }, { id: 'company-a-l3', parentId: 'company-a', targetLevel: 3 as const, officialDisclosedTotal: 0, expectedNodeIds: [], pendingNodeIds: [], completenessStatus: '官方清单已闭合', sourceUrls: ['https://example.com/a'] }];
  assert.deepEqual(validateOwnershipCoverage(roots, coverage), []);
  coverage[0].pendingNodeIds.push('missing');
  assert.match(validateOwnershipCoverage(roots, coverage).join(','), /闭合状态与清单不一致|缺少节点/);
});
