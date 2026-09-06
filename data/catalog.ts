import type { AwardEntry, Company, OwnershipNode, RecruitmentRecord, SourceEvidence, SyncRun } from '@/lib/types';

export const companies: Company[] = [
  { id: 'cmcc-gx', name: '中国移动通信集团广西有限公司', shortName: '广西移动', nature: '央企子公司', locations: ['广西南宁', '广西全区'], channels: [{ id: 'cmcc-career', label: '中国移动招聘', type: '集团招聘平台', url: 'https://job.10086.cn/' }] },
  { id: 'caih', name: '中国—东盟信息港股份有限公司', shortName: '中国东信', nature: '国有控股', locations: ['广西南宁', '北京', '深圳'], channels: [{ id: 'caih-home', label: '企业官网', type: '企业官网', url: 'https://www.caih.com/' }] },
  { id: 'gig', name: '广西投资集团有限公司', shortName: '广投集团', nature: '广西区属国企', locations: ['广西南宁', '广西全区'], channels: [{ id: 'gig-career', label: '集团招聘入口', type: '企业官网', url: 'https://www.gig.cn/' }] },
  { id: 'cscec8', name: '中国建筑第八工程局有限公司', shortName: '中建八局', nature: '央企子公司', locations: ['全国', '广西南宁'], channels: [{ id: 'cscec8-career', label: '校园招聘官网', type: '企业官网', url: 'https://job.cscec8b.com.cn/' }] },
  { id: 'cam', name: '中国机械科学研究总院集团有限公司', shortName: '中国机械总院', nature: '中央企业', locations: ['全国', '广西南宁'], channels: [{ id: 'cam-guopin', label: '国聘校园招聘', type: '国聘', url: 'https://job.iguopin.com/jobList?channel=campus' }] },
  { id: 'chn-energy', name: '国家能源投资集团有限责任公司', shortName: '国家能源集团', nature: '中央企业', locations: ['全国', '广西南宁'], channels: [{ id: 'chn-energy-career', label: '集团招聘系统', type: '集团招聘平台', url: 'https://zhaopin.chnenergy.com.cn/' }] },
  { id: 'csg-gx', name: '广西电网有限责任公司', shortName: '广西电网', nature: '央企子公司', locations: ['广西南宁', '广西全区'], channels: [{ id: 'csg-career', label: '南方电网招聘', type: '集团招聘平台', url: 'https://zhaopin.csg.cn/' }] },
  { id: 'spic-gx', name: '国家电投集团广西电力有限公司', shortName: '国家电投广西公司', nature: '央企子公司', locations: ['广西南宁', '广西全区'], channels: [{ id: 'spic-career', label: '国家电投招聘', type: '集团招聘平台', url: 'https://jobs.spic.com.cn/' }] },
  { id: 'beibu-air', name: '广西北部湾航空有限责任公司', shortName: '北部湾航空', nature: '民营企业', locations: ['广西南宁'], channels: [{ id: 'hna-career', label: '海航人才招聘', type: '集团招聘平台', url: 'https://hr.hnagroup.com/' }] },
  { id: 'yili', name: '内蒙古伊利实业集团股份有限公司', shortName: '伊利集团', nature: '民营企业', locations: ['全国', '广西南宁'], channels: [{ id: 'yili-career', label: '伊利校园招聘', type: '企业官网', url: 'https://yili.zhiye.com/' }] },
  { id: 'xiaomi', name: '小米科技有限责任公司', shortName: '小米集团', nature: '民营企业', locations: ['全国', '广西南宁'], channels: [{ id: 'xiaomi-career', label: '小米招聘', type: '企业官网', url: 'https://hr.xiaomi.com/' }] },
];

export const sources: SourceEvidence[] = [
  { id: 'src-cmcc-2027', title: '中国移动广西公司2027年暑期实习生培养项目', publisher: '高校就业网', url: 'https://career.hebut.edu.cn/home/correcruit/content/id/78734.html', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-caih-2027', title: '中国东信2027届校园招聘公告', publisher: '高校就业网', url: 'https://career.nankai.edu.cn/correcruit/content/id/117231.html', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-gig-2027', title: '广西投资集团2027届秋季校园招聘项目', publisher: '广西投资集团电子采购平台', url: 'https://www.gigeps.com/cms/channel/xmgg4fw/85392.htm', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-guopin', title: '国聘校园招聘', publisher: '国聘', url: 'https://job.iguopin.com/jobList?channel=campus', sourceType: '招聘平台', lastCheckedAt: '2026-09-07', health: '受限' },
  { id: 'src-csg', title: '中国南方电网员工招聘系统', publisher: '中国南方电网', url: 'https://zhaopin.csg.cn/', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '受限' },
  { id: 'src-chn', title: '国家能源集团人力资源招聘系统', publisher: '国家能源集团', url: 'https://zhaopin.chnenergy.com.cn/', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-public-jobs', title: '中国公共招聘网招聘会', publisher: '人力资源和社会保障部', url: 'https://job.mohrss.gov.cn/cjobs/jobfairinfo/listJobfairinfoschool', sourceType: '政府平台', lastCheckedAt: '2026-09-07', health: '正常' },
];

export const recruitmentRecords: RecruitmentRecord[] = [
  { id: 'rec-cmcc-gx', companyId: 'cmcc-gx', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西全区'], sourceIds: ['src-cmcc-2027'], firstSeenAt: '2026-06-01', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-caih', companyId: 'caih', cohort: 2027, status: '开放中', locations: ['广西南宁', '北京', '深圳'], sourceIds: ['src-caih-2027'], firstSeenAt: '2026-09-02', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-gig', companyId: 'gig', cohort: 2027, status: '待确认', locations: ['广西南宁', '广西全区'], sourceIds: ['src-gig-2027'], firstSeenAt: '2026-08-31', lastVerifiedAt: '2026-09-07', confidence: '待确认' },
  { id: 'rec-cscec8', companyId: 'cscec8', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-guopin'], firstSeenAt: '2026-08-20', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-cam', companyId: 'cam', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-guopin'], firstSeenAt: '2026-08-22', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-chn', companyId: 'chn-energy', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-chn'], firstSeenAt: '2026-08-18', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-csg', companyId: 'csg-gx', cohort: 2027, status: '待确认', locations: ['广西南宁', '广西全区'], sourceIds: ['src-csg'], firstSeenAt: '2026-07-01', lastVerifiedAt: '2026-09-07', confidence: '待确认' },
];

export const ownershipTrees: OwnershipNode[] = [
  { id: 'gx-sasac', name: '广西壮族自治区国资委', category: '履行出资人职责机构', sourceUrl: 'https://gzw.gxzf.gov.cn/', children: [{ id: 'gig-tree', name: '广西投资集团有限公司', category: '一级监管企业', relation: '自治区国资委履行出资人职责', sourceUrl: 'https://www.gig.cn/portal/secDetail?index=1&type=gt_detail', recruitmentUrl: 'https://www.gig.cn/', children: [{ id: 'gx-energy', name: '广西能源集团有限公司', category: '二级控股企业', relation: '广投集团能源产业平台', sourceUrl: 'https://www.gig.cn/portal/secDetail?index=0&type=business_detail', children: [{ id: 'gx-energy-listed', name: '广西能源股份有限公司', category: '三级控股企业', relation: '广西能源集团控股上市公司', sourceUrl: 'https://www.gig.cn/portal/secDetail?index=0&type=business_detail' }, { id: 'gx-gas-pipe', name: '广西广投天然气管网有限公司', category: '三级控股企业', relation: '广西能源集团子企业', sourceUrl: 'https://www.gig.cn/material/custom/journal.do?id=1053757' }] }] }] },
  { id: 'sasac-state', name: '国务院国资委', category: '履行出资人职责机构', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/', children: [{ id: 'chn-root', name: '国家能源投资集团有限责任公司', category: '一级中央企业', relation: '国务院国资委监管', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/', recruitmentUrl: 'https://zhaopin.chnenergy.com.cn/', children: [{ id: 'chn-gx', name: '国家能源集团广西电力有限公司', category: '二级驻邕企业', relation: '国家能源集团广西区域全资子公司', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', children: [{ id: 'chn-gx-new-energy', name: '广西国能能源发展有限公司', category: '三级所属企业', relation: '广西公司所属三级单位', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', recruitmentUrl: 'https://zhaopin.chnenergy.com.cn/' }, { id: 'chn-nanning', name: '国能南宁发电有限公司', category: '三级所属企业', relation: '广西区域发电企业', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=c12c46dc-ee7a-47f1-b247-219893fbff89&kinds=2', recruitmentUrl: 'https://zhaopin.chnenergy.com.cn/' }] }] }] },
];

export const awards: AwardEntry[] = [
  { id: 'award-beibu-2021', companyId: 'beibu-air', year: 2021, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主 TOP10', nanningBasis: '主运营基地位于南宁吴圩国际机场', sourceUrl: 'https://v.gxnews.com.cn/a/20617877' },
  { id: 'award-xiaomi-2022', companyId: 'xiaomi', year: 2022, listName: '福布斯中国最佳雇主', awardTier: '中国年度最佳雇主', nanningBasis: '全国招聘渠道覆盖南宁', sourceUrl: 'https://www.thepaper.cn/newsDetail_forward_18964233' },
  { id: 'award-caih-2023', companyId: 'caih', year: 2023, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主', nanningBasis: '总部及主要招聘地点位于南宁', sourceUrl: 'https://www.caih.com/newsView.html?id=6435' },
  { id: 'award-caih-2024', companyId: 'caih', year: 2024, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主', nanningBasis: '连续八年获南宁榜单荣誉', sourceUrl: 'https://www.caih.com/newsView.html?id=6435' },
  { id: 'award-spic-2024', companyId: 'spic-gx', year: 2024, listName: '中国年度最佳雇主', awardTier: '南宁城市最佳雇主 10 强', nanningBasis: '公司本部位于南宁', sourceUrl: 'https://gx.people.com.cn/n2/2025/0120/c347802-41114135.html' },
  { id: 'award-yili-2025', companyId: 'yili', year: 2025, listName: '福布斯中国最佳雇主', awardTier: '中国年度最受员工欢迎雇主', nanningBasis: '全国校园招聘渠道覆盖南宁', sourceUrl: 'https://www.forbeschina.com/business/70329' },
];

export const latestSync: SyncRun = { completedAt: '2026-09-07T08:00:00+08:00', sourceCount: sources.length, anomalyCount: sources.filter((source) => source.health !== '正常').length, changedRecords: 3, status: '部分成功' };
