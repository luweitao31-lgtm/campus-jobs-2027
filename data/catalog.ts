import type { AwardEntry, Company, OwnershipCoverageSet, OwnershipEdge, OwnershipEvidence, OwnershipNode, OwnershipRecruitmentChannel, RecruitmentRecord, SourceEvidence, SyncRun } from '@/lib/types';

export const companies: Company[] = [
  { id: 'cmb-nanning', name: '招商银行股份有限公司南宁分行', shortName: '招商银行南宁分行', nature: '股份制银行', locations: ['广西南宁', '广西柳州'], channels: [{ id: 'cmb-career', label: '招商银行招聘', type: '企业官网', url: 'https://career.cmbchina.com/' }] },
  { id: 'chinatelecom-gx', name: '中国电信股份有限公司广西分公司', shortName: '广西电信', nature: '央企子公司', locations: ['广西南宁', '广西全区'], channels: [{ id: 'chinatelecom-career', label: '中国电信招聘', type: '集团招聘平台', url: 'https://job.chinatelecom.com.cn/wt/TELE/web/index?_refluxos=a10' }] },
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
  { id: 'ccb-gx', name: '中国建设银行股份有限公司广西壮族自治区分行', shortName: '建设银行广西区分行', nature: '国有控股', locations: ['广西南宁', '广西全区'], channels: [{ id: 'ccb-career', label: '建设银行校园招聘', type: '企业官网', url: 'https://member1.ccb.com/cn/job/plan_index.html?planType=XY' }] },
  { id: 'unicom-gx', name: '中国联合网络通信有限公司广西壮族自治区分公司', shortName: '广西联通', nature: '央企子公司', locations: ['广西南宁', '广西全区'], channels: [{ id: 'unicom-career', label: '中国联通校园招聘', type: '集团招聘平台', url: 'https://zglt.zhaopin.com/home/index.html' }] },
  { id: 'ceec-gxed', name: '中国能源建设集团广西电力设计研究院有限公司', shortName: '中国能建广西院', nature: '央企子公司', locations: ['广西南宁'], channels: [{ id: 'ceec-gxed-guopin', label: '国聘投递页面', type: '国聘', url: 'https://www.iguopin.com/company?id=10685374849647460' }] },
];

export const sources: SourceEvidence[] = [
  { id: 'src-cmb-nanning-2027', title: '招商银行南宁分行2027秋季校园招聘公告', publisher: '对外经济贸易大学招生就业处', url: 'https://career.uibe.edu.cn/front/zpxx.jspa?tid=2095787535300083713', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-cmb-nanning-2027-second', title: '招商银行南宁分行2027秋季校园招聘公告', publisher: '高校就业服务平台', url: 'https://jvcit.bysjy.com.cn/detail/online?id=3594908', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-chinatelecom-2027', title: '中国电信2027校园招聘', publisher: '中国电信', url: 'https://job.chinatelecom.com.cn/wt/TELE/web/index?_refluxos=a10', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-cmcc-2027', title: '中国移动广西公司2027年暑期实习生培养项目', publisher: '高校就业网', url: 'https://career.hebut.edu.cn/home/correcruit/content/id/78734.html', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-caih-2027', title: '中国东信2027届校园招聘公告', publisher: '高校就业网', url: 'https://career.nankai.edu.cn/correcruit/content/id/117231.html', sourceType: '高校就业网', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-gig-2027', title: '广西投资集团2027届秋季校园招聘项目', publisher: '广西投资集团电子采购平台', url: 'https://www.gigeps.com/cms/channel/xmgg4fw/85392.htm', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-guopin', title: '国聘校园招聘', publisher: '国聘', url: 'https://job.iguopin.com/jobList?channel=campus', sourceType: '招聘平台', lastCheckedAt: '2026-09-07', health: '受限' },
  { id: 'src-csg', title: '中国南方电网员工招聘系统', publisher: '中国南方电网', url: 'https://zhaopin.csg.cn/', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '受限' },
  { id: 'src-chn', title: '国家能源集团人力资源招聘系统', publisher: '国家能源集团', url: 'https://zhaopin.chnenergy.com.cn/', sourceType: '企业官方', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-public-jobs', title: '中国公共招聘网招聘会', publisher: '人力资源和社会保障部', url: 'https://job.mohrss.gov.cn/cjobs/jobfairinfo/listJobfairinfoschool', sourceType: '政府平台', lastCheckedAt: '2026-09-08', health: '异常' },
  { id: 'src-niuqizp-nanning', title: '南宁2027届校园招聘汇总', publisher: '牛企直聘', url: 'https://campus.niuqizp.com/deadline-nanning-1/', sourceType: '聚合平台', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-nowcoder-schedule', title: '2027届校招日程', publisher: '牛客', url: 'https://mnowpick.nowcoder.com/m/school/schedule', sourceType: '聚合平台', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-goclub-daily', title: '校招每日更新', publisher: 'GoClub', url: 'https://goclub.space/docs/jobs/daily-updates/', sourceType: '聚合平台', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-jobup', title: '2027届秋招信息汇总', publisher: 'JOBUP', url: 'https://jobup.cn/', sourceType: '聚合平台', lastCheckedAt: '2026-09-07', health: '正常' },
  { id: 'src-ccb-career', title: '中国建设银行校园招聘', publisher: '中国建设银行', url: 'https://member1.ccb.com/cn/job/plan_index.html?planType=XY', sourceType: '企业官方', lastCheckedAt: '2026-09-08', health: '受限' },
  { id: 'src-ccb-gx-2027', title: '中国建设银行广西区分行2027年度校园招聘公告', publisher: '南京公务员考试网', url: 'https://www.njgwy.cn/index.php/Home/Index/recruitShow/e_id/11071/e_type/14.html', sourceType: '招聘平台', lastCheckedAt: '2026-09-08', health: '正常' },
  { id: 'src-unicom-2027-official', title: '中国联通2027校园招聘', publisher: '中国联通招聘平台', url: 'https://zglt.zhaopin.com/home/index.html', sourceType: '企业官方', lastCheckedAt: '2026-09-08', health: '正常' },
  { id: 'src-unicom-gx-2027', title: '中国联通广西分公司2027秋季校园招聘公告', publisher: '粉笔资讯', url: 'https://www.fenbi.com/page/fenxiaozhaokaodetail/29/683/468933078177792', sourceType: '招聘平台', lastCheckedAt: '2026-09-08', health: '正常' },
  { id: 'src-ceec-gxed-official', title: '中国能建广西院诚聘英才', publisher: '中国能建广西院', url: 'https://www.gxed.ceec.net.cn/col/col17152/index.html', sourceType: '企业官方', lastCheckedAt: '2026-09-08', health: '受限' },
  { id: 'src-ceec-gxed-2027', title: '中国能建广西院2027届毕业生校园招聘简章', publisher: '粉笔资讯', url: 'https://www.fenbi.com/page/exam-information-detail/468931910064130', sourceType: '招聘平台', lastCheckedAt: '2026-09-08', health: '正常' },
];

export const recruitmentRecords: RecruitmentRecord[] = [
  { id: 'rec-cmb-nanning', companyId: 'cmb-nanning', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西柳州'], sourceIds: ['src-cmb-nanning-2027', 'src-cmb-nanning-2027-second'], firstSeenAt: '2026-09-03', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-chinatelecom-gx', companyId: 'chinatelecom-gx', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西全区'], sourceIds: ['src-chinatelecom-2027'], firstSeenAt: '2026-09-02', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-cmcc-gx', companyId: 'cmcc-gx', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西全区'], sourceIds: ['src-cmcc-2027'], firstSeenAt: '2026-06-01', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-caih', companyId: 'caih', cohort: 2027, status: '开放中', locations: ['广西南宁', '北京', '深圳'], sourceIds: ['src-caih-2027'], firstSeenAt: '2026-09-02', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-gig', companyId: 'gig', cohort: 2027, status: '待确认', locations: ['广西南宁', '广西全区'], sourceIds: ['src-gig-2027'], firstSeenAt: '2026-08-31', lastVerifiedAt: '2026-09-07', confidence: '待确认' },
  { id: 'rec-cscec8', companyId: 'cscec8', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-guopin'], firstSeenAt: '2026-08-20', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-cam', companyId: 'cam', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-guopin'], firstSeenAt: '2026-08-22', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-chn', companyId: 'chn-energy', cohort: 2027, status: '开放中', locations: ['全国', '广西南宁'], sourceIds: ['src-chn'], firstSeenAt: '2026-08-18', lastVerifiedAt: '2026-09-07', confidence: '已核验' },
  { id: 'rec-csg', companyId: 'csg-gx', cohort: 2027, status: '待确认', locations: ['广西南宁', '广西全区'], sourceIds: ['src-csg'], firstSeenAt: '2026-07-01', lastVerifiedAt: '2026-09-07', confidence: '待确认' },
  { id: 'rec-ccb-gx', companyId: 'ccb-gx', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西全区'], sourceIds: ['src-ccb-career', 'src-ccb-gx-2027'], firstSeenAt: '2026-09-08', lastVerifiedAt: '2026-09-08', confidence: '已核验' },
  { id: 'rec-unicom-gx', companyId: 'unicom-gx', cohort: 2027, status: '开放中', locations: ['广西南宁', '广西全区'], sourceIds: ['src-unicom-2027-official', 'src-unicom-gx-2027'], firstSeenAt: '2026-09-08', lastVerifiedAt: '2026-09-08', confidence: '已核验' },
  { id: 'rec-ceec-gxed', companyId: 'ceec-gxed', cohort: 2027, status: '开放中', locations: ['广西南宁'], sourceIds: ['src-ceec-gxed-official', 'src-ceec-gxed-2027'], firstSeenAt: '2026-09-08', lastVerifiedAt: '2026-09-08', confidence: '已核验' },
];

const gigBusinessSource = 'https://www.gig.cn/portal/secDetail?index=0&type=business_detail';
const gigRecruitment = 'https://www.gigeps.com/cms/channel/xmgg4fw/85392.htm';
const chnRecruitment = 'https://zhaopin.chnenergy.com.cn/';
const chnGuangxiSource = 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=c12c46dc-ee7a-47f1-b247-219893fbff89&kinds=2';
const gigAnnualReport = 'https://static.sse.com.cn/disclosure/bond/announcement/company/c/new/2026-04-29/244906_20260429_XJB6.pdf';
const gxEnergyAnnualReport = 'https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12024032&stockid=600310';
const guohaiControlReport = 'https://static.cninfo.com.cn/finalpage/2025-04-25/1223300236.PDF';
const longyuanReports = 'https://lydl.chnenergy.com.cn/lydlww/newtzzgx0201/newtzzgx01.shtml';

type OwnershipNodeSeed = Omit<OwnershipNode, 'recruitmentChannels' | 'children'> & {
  recruitmentUrl?: string;
  children?: OwnershipNodeSeed[];
};

const channelVerifiedAt = '2026-09-09';
const chnGroupFallback: OwnershipRecruitmentChannel = {
  label: '国家能源集团招聘系统', type: '集团通用入口', match: '集团兜底', status: '状态待确认',
  url: chnRecruitment, evidenceUrl: chnRecruitment, verifiedAt: channelVerifiedAt,
};
const noPublicRecruitment = (): OwnershipRecruitmentChannel => ({
  label: '暂无独立公开招聘入口', type: '无公开渠道', match: '暂无公开入口', status: '暂无公开入口', verifiedAt: channelVerifiedAt,
});
const locatedAnnouncement = (name: string, url: string): OwnershipRecruitmentChannel => ({
  label: `${name}招聘公告`, type: '官方招聘公告', match: '单位已定位', status: '已截止',
  url, appliesToCompanyName: name, evidenceUrl: url, verifiedAt: channelVerifiedAt,
});

const ownershipRecruitmentOverrides: Record<string, OwnershipRecruitmentChannel[]> = {
  'chn-root': [{
    label: '国家能源集团招聘系统', type: '公司招聘官网', match: '公司专属', status: '可投递',
    url: chnRecruitment, appliesToCompanyName: '国家能源投资集团有限责任公司', evidenceUrl: chnRecruitment, verifiedAt: channelVerifiedAt,
  }],
  'guohai-securities': [{
    label: '国海证券招聘官网', type: '公司招聘官网', match: '公司专属', status: '状态待确认',
    url: 'https://ghzq.hotjob.cn/', appliesToCompanyName: '国海证券股份有限公司', evidenceUrl: 'https://ghzq.hotjob.cn/', verifiedAt: channelVerifiedAt,
  }],
  'beibu-bank': [{
    label: '广西北部湾银行招聘', type: '公司招聘官网', match: '公司专属', status: '状态待确认',
    url: 'https://zhaopin.bankofbbg.com/', appliesToCompanyName: '广西北部湾银行股份有限公司', evidenceUrl: 'https://zhaopin.bankofbbg.com/', verifiedAt: channelVerifiedAt,
  }],
  'chn-gx': [locatedAnnouncement('国家能源集团广西电力有限公司', 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2'), chnGroupFallback],
  'chn-gx-new-energy': [locatedAnnouncement('广西国能能源发展有限公司', 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=51304904-d664-5296-e063-98b4d40a30d4'), chnGroupFallback],
  'chn-nanning': [locatedAnnouncement('国能南宁发电有限公司', chnGuangxiSource), chnGroupFallback],
  'chn-beihai': [locatedAnnouncement('国能广投北海发电有限公司', chnGuangxiSource), chnGroupFallback],
  'chn-liuzhou': [locatedAnnouncement('国能广投柳州发电有限公司', chnGuangxiSource), chnGroupFallback],
  'chn-yongfu': [locatedAnnouncement('国能永福发电有限公司', chnGuangxiSource), chnGroupFallback],
  'chn-hydropower': [locatedAnnouncement('广西国能水电开发有限公司', chnGuangxiSource), chnGroupFallback],
  'chn-integrated-service': [locatedAnnouncement('广西国能综合能源服务有限公司', 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=5a798bfe-ab9c-0be4-e063-98b4d40a088a'), chnGroupFallback],
  'chn-guohua-gx': [locatedAnnouncement('国能国华（广西）新能源有限公司', 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=355843b2-5349-b937-e063-98b4d40acab4'), chnGroupFallback],
  'chn-longyuan-gx': [locatedAnnouncement('广西龙源新能源有限公司', 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=51304904-d5ae-5296-e063-98b4d40a30d4'), chnGroupFallback],
};

function materializeOwnershipNode(seed: OwnershipNodeSeed): OwnershipNode {
  const { recruitmentUrl: _legacyRecruitmentUrl, children, ...node } = seed;
  const recruitmentChannels = ownershipRecruitmentOverrides[seed.id]
    ?? (seed.id.startsWith('chn-') ? [chnGroupFallback] : seed.level === 0 ? [] : [noPublicRecruitment()]);
  return { ...node, recruitmentChannels, children: children?.map(materializeOwnershipNode) };
}

export const ownershipEvidence: OwnershipEvidence[] = [
  { id: 'ev-gx-sasac', title: '监管企业公开信息', publisher: '广西壮族自治区国资委', url: 'https://gzw.gxzf.gov.cn/', sourceType: '监管披露', verifiedAt: '2026-09-08' },
  { id: 'ev-state-sasac', title: '中央企业产权信息查询', publisher: '国务院国资委', url: 'https://opweb.sasac.gov.cn/gzwQ/', sourceType: '监管披露', verifiedAt: '2026-09-08' },
  { id: 'ev-gig-annual', title: '广西投资集团2025年度报告', publisher: '上海证券交易所', url: gigAnnualReport, sourceType: '交易所公告', verifiedAt: '2026-09-08' },
  { id: 'ev-gig-business', title: '广投集团主营业务板块', publisher: '广西投资集团', url: gigBusinessSource, sourceType: '企业官网', verifiedAt: '2026-09-08' },
  { id: 'ev-guohai-control', title: '国海证券股权及实际控制关系说明', publisher: '国海证券', url: guohaiControlReport, sourceType: '企业年报', verifiedAt: '2026-09-08' },
  { id: 'ev-gx-energy-annual', title: '广西能源2025年年度报告', publisher: '广西能源股份有限公司', url: gxEnergyAnnualReport, sourceType: '企业年报', verifiedAt: '2026-09-08' },
  { id: 'ev-gig-energy-members', title: '广西能源集团所属企业采购公告', publisher: '广西投资集团电子采购平台', url: 'https://new.gigeps.com/cms/default/webfile/cggg/20260727/1266409630838292480.html?categoryId=1166346928443621376', sourceType: '企业官网', verifiedAt: '2026-09-08' },
  { id: 'ev-chn-gx', title: '国家能源集团广西公司公开公告', publisher: '国家能源集团', url: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', sourceType: '招聘公告', verifiedAt: '2026-09-08' },
  { id: 'ev-chn-gx-members', title: '国家能源集团广西公司所属单位公告', publisher: '国家能源集团', url: chnGuangxiSource, sourceType: '招聘公告', verifiedAt: '2026-09-08' },
  { id: 'ev-longyuan-report', title: '龙源电力定期报告目录', publisher: '龙源电力', url: longyuanReports, sourceType: '企业年报', verifiedAt: '2026-09-08' },
  { id: 'ev-sales-branch', title: '销售集团广西营销中心公开公告', publisher: '国家能源集团', url: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=b50bb8bc-d189-4eb3-a60c-d01f6f1ea8af&kinds=2', sourceType: '招聘公告', verifiedAt: '2026-09-08' },
];

export const ownershipCoverageSets: OwnershipCoverageSet[] = [
  { id: 'coverage-gig-l2', parentId: 'gig-tree', label: '广投集团广西二级法律主体', scope: '广西法人、直接持股或直接实际控制', targetLevel: 2, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: ['gx-energy', 'gx-aluminum', 'gx-financial-investment', 'gx-financial-holding', 'guohai-securities', 'beibu-bank'], pendingNodeIds: ['gx-new-material', 'gx-pharma', 'digital-gx', 'gx-salt', 'gx-water-design', 'gx-supply-chain', 'gx-invest-consulting', 'gx-smart-services', 'wuzhou-zhongheng'], completenessStatus: '官方未披露总数', sourceUrls: [gigAnnualReport, gigBusinessSource] },
  { id: 'coverage-chn-l2', parentId: 'chn-root', label: '国家能源集团广西落地二级法律主体', scope: '直接控制广西三级法人的二级公司', targetLevel: 2, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: ['chn-longyuan'], pendingNodeIds: ['chn-gx'], completenessStatus: '官方未披露总数', excludedBranchCount: 1, sourceUrls: ['https://www.chnenergy.com.cn/', longyuanReports] },
  { id: 'coverage-gx-energy-l3', parentId: 'gx-energy', label: '广西能源集团广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: ['gx-zhengrun'], pendingNodeIds: ['gx-guangtou-petro', 'gx-yongsheng-petro', 'gx-guixuan-energy', 'gx-guisheng-energy'], completenessStatus: '官方未披露总数', sourceUrls: [gxEnergyAnnualReport, 'https://new.gigeps.com/cms/default/webfile/cggg/20260727/1266409630838292480.html?categoryId=1166346928443621376'] },
  { id: 'coverage-gx-aluminum-l3', parentId: 'gx-aluminum', label: '广西铝业集团广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: ['gx-baise-aluminum', 'gx-laibin-aluminum', 'gx-liuzhou-aluminum'], completenessStatus: '官方未披露总数', sourceUrls: [gigBusinessSource] },
  { id: 'coverage-gx-financial-l3', parentId: 'gx-financial-investment', label: '广西金融投资集团广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: ['gx-capital-management'], pendingNodeIds: [], completenessStatus: '已核验并持续补充', sourceUrls: [gigAnnualReport] },
  { id: 'coverage-gx-financial-holding-l3', parentId: 'gx-financial-holding', label: '广投金融控股广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: [], completenessStatus: '官方未披露总数', sourceUrls: [gigAnnualReport] },
  { id: 'coverage-guohai-l3', parentId: 'guohai-securities', label: '国海证券广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: [], completenessStatus: '官方未披露总数', sourceUrls: [guohaiControlReport] },
  { id: 'coverage-beibu-bank-l3', parentId: 'beibu-bank', label: '北部湾银行广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: ['tiandong-village-bank', 'cenxi-village-bank'], completenessStatus: '官方未披露总数', sourceUrls: [gigAnnualReport] },
  ...['gx-new-material','gx-pharma','digital-gx','gx-salt','gx-water-design','gx-supply-chain','gx-invest-consulting','gx-smart-services','wuzhou-zhongheng'].map((parentId) => ({ id: `coverage-${parentId}-l3`, parentId, label: `${parentId}三级法人`, scope: '直接控制的广西法人', targetLevel: 3 as const, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: [], completenessStatus: '官方未披露总数' as const, sourceUrls: [gigAnnualReport] })),
  { id: 'coverage-chn-gx-l3', parentId: 'chn-gx', label: '国家能源集团广西公司三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: [], pendingNodeIds: ['chn-gx-new-energy','chn-nanning','chn-beihai','chn-liuzhou','chn-yongfu','chn-hydropower','chn-integrated-service','chn-guohua-gx'], completenessStatus: '官方未披露总数', sourceUrls: [chnGuangxiSource] },
  { id: 'coverage-chn-longyuan-l3', parentId: 'chn-longyuan', label: '龙源电力广西三级法人', scope: '直接控制的广西法人', targetLevel: 3, asOf: '2026-09-08', officialDisclosedTotal: null, expectedNodeIds: ['chn-longyuan-gx'], pendingNodeIds: [], completenessStatus: '已核验并持续补充', sourceUrls: [longyuanReports] },
];

/* Historical pre-audit snapshot retained only for migration reference.
  {
    id: 'gx-sasac', name: '广西壮族自治区国资委', category: '履行出资人职责机构', level: 0, entityKind: '监管机构', locationTags: ['广西全区'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', sourceUrl: 'https://gzw.gxzf.gov.cn/',
    children: [{
      id: 'gig-tree', name: '广西投资集团有限公司', category: '一级监管企业', level: 1, entityKind: '集团', locationTags: ['广西南宁', '广西全区'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '自治区国资委履行出资人职责', sourceUrl: 'https://www.gig.cn/portal/secDetail?index=0&type=gt_detail', recruitmentUrl: gigRecruitment,
      children: [
        { id: 'gx-energy', name: '广西能源集团有限公司', category: '能源产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团能源产业管理平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment, children: [
          { id: 'gx-energy-listed', name: '广西能源股份有限公司', category: '三级控股上市公司', level: 3, entityKind: '控股企业', locationTags: ['广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西能源集团控股上市公司', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
          { id: 'gx-gas-pipe', name: '广西广投天然气管网有限公司', category: '三级控股企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁', '广西全区'], controlType: '控股', ownershipPercent: 75.5, verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广投集团持股75.5%，由能源产业平台管理', sourceUrl: 'https://www.gig.cn/material/custom/journal.do?id=1053757', recruitmentUrl: gigRecruitment },
        ] },
        { id: 'gx-aluminum', name: '广西铝业集团有限公司', category: '铝业产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团铝产业专业化管理平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-new-material', name: '广西广投新材料集团有限公司', category: '新材料产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团新材料业务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-pharma', name: '广西广投医药健康产业集团有限公司', category: '医药健康产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团医药健康产业平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'digital-gx', name: '数字广西集团有限公司', category: '数字经济产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团数字经济产业平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-salt', name: '广西盐业集团有限公司', category: '食盐保供平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团食盐保供业务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-water-design', name: '广西壮族自治区水利电力勘测设计研究院有限责任公司', category: '水利电力勘测设计平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团工程咨询业务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-financial-investment', name: '广西金融投资集团有限公司', category: '综合金融服务平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团综合金融业务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-capital-management', name: '广西广投资本管理集团有限公司', category: '资本投资平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团资本管理平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-supply-chain', name: '广西广投产业链服务集团有限公司', category: '产业链服务平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团产业链服务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-invest-consulting', name: '广西投资集团咨询有限公司', category: '工程咨询平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团工程咨询业务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
        { id: 'gx-smart-services', name: '广西广投智慧服务集团有限公司', category: '智慧运营平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁', '广西全区'], controlType: '产业管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-guangxi-l2', relation: '广投集团智慧运营服务平台', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment },
      ],
    }],
  },
  {
    id: 'sasac-state', name: '国务院国资委', category: '履行出资人职责机构', level: 0, entityKind: '监管机构', locationTags: ['全国'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/',
    children: [{
      id: 'chn-root', name: '国家能源投资集团有限责任公司', category: '一级中央企业', level: 1, entityKind: '集团', locationTags: ['全国', '广西全区'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '国务院国资委监管', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/', recruitmentUrl: chnRecruitment,
      children: [
        { id: 'chn-gx', name: '国家能源集团广西电力有限公司', category: '广西区域公司', level: 2, entityKind: '控股企业', locationTags: ['广西南宁', '广西全区'], controlType: '全资', ownershipPercent: 100, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-chn-guangxi-l2', relation: '国家能源集团广西区域全资子公司', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', recruitmentUrl: chnRecruitment, children: [
          { id: 'chn-gx-new-energy', name: '广西国能能源发展有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁', '广西全区'], controlType: '全资', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属三级单位', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', recruitmentUrl: chnRecruitment },
          { id: 'chn-nanning', name: '国能南宁发电有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属南宁发电企业', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment },
          { id: 'chn-beihai', name: '国能广投北海发电有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西北海'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属北海发电企业', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment },
          { id: 'chn-liuzhou', name: '国能广投柳州发电有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西柳州'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属柳州发电企业', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment },
          { id: 'chn-yongfu', name: '国能永福发电有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西桂林'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属桂林发电企业', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment },
          { id: 'chn-hydropower', name: '广西国能水电开发有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '广西公司所属水电企业', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment },
          { id: 'chn-integrated-service', name: '广西国能综合能源服务有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '招聘系统列为广西公司所属单位', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=5a798bfe-ab9c-0be4-e063-98b4d40a088a', recruitmentUrl: chnRecruitment },
          { id: 'chn-guohua-gx', name: '国能国华（广西）新能源有限公司', category: '三级所属企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁', '广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '最新公开招聘记录列为广西公司所属单位', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=355843b2-5349-b937-e063-98b4d40acab4', recruitmentUrl: chnRecruitment },
        ] },
        { id: 'chn-longyuan', name: '龙源电力集团股份有限公司', category: '新能源产业平台', level: 2, entityKind: '产业平台', locationTags: ['全国', '广西南宁', '广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-chn-guangxi-l2', relation: '国家能源集团新能源产业平台，在广西设有控股主体', sourceUrl: 'https://lydl.chnenergy.com.cn/lydlww/dqbg2023A/202403/8fc47b670bf24c6aa172a3c60253cae7/files/ada1331993fc4728be3f537cbc1e9e20.pdf', recruitmentUrl: chnRecruitment, children: [
          { id: 'chn-longyuan-gx', name: '广西龙源新能源有限公司', category: '广西三级控股企业', level: 3, entityKind: '控股企业', locationTags: ['广西南宁', '广西全区'], controlType: '全资', ownershipPercent: 100, verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '招聘系统所属单位为龙源电力', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showgw?id=51304904-d45a-5296-e063-98b4d40a30d4', recruitmentUrl: chnRecruitment },
        ] },
        { id: 'chn-sales', name: '国能销售集团有限公司', category: '煤炭销售产业平台', level: 2, entityKind: '产业平台', locationTags: ['全国', '广西全区'], controlType: '全资', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-chn-guangxi-l2', relation: '国家能源集团煤炭销售平台，在广西设运营机构', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=b50bb8bc-d189-4eb3-a60c-d01f6f1ea8af&kinds=2', recruitmentUrl: chnRecruitment, children: [
          { id: 'chn-sales-gx-center', name: '国能销售集团广州有限公司广西营销中心', category: '广西运营机构', level: 3, entityKind: '分支机构', locationTags: ['广西全区'], controlType: '分支管理', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '公开招聘所列广西营销中心，不作为子公司统计', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=b50bb8bc-d189-4eb3-a60c-d01f6f1ea8af&kinds=2', recruitmentUrl: chnRecruitment },
        ] },
      ],
    }],
  },
*/

const gigPendingL2: OwnershipNodeSeed[] = [
  ['gx-new-material','广西广投新材料集团有限公司','新材料平台'], ['gx-pharma','广西广投医药健康产业集团有限公司','医药健康平台'], ['digital-gx','数字广西集团有限公司','数字经济平台'], ['gx-salt','广西盐业集团有限公司','食盐保供平台'], ['gx-water-design','广西壮族自治区水利电力勘测设计研究院有限责任公司','勘测设计平台'], ['gx-supply-chain','广西广投产业链服务集团有限公司','产业链服务平台'], ['gx-invest-consulting','广西投资集团咨询有限公司','咨询服务平台'], ['gx-smart-services','广西广投智慧服务集团有限公司','智慧服务平台'], ['wuzhou-zhongheng','广西梧州中恒集团股份有限公司','医药上市公司']
].map(([id,name,category]) => ({ id, name, category, level: 2, entityKind: '产业平台', locationTags: ['广西南宁','广西全区'], controlType: '待核验', verifiedAt: '2026-09-08', verificationStatus: '待确认', coverageSetId: 'coverage-gig-l2', relation: '官网披露业务归属，直接法律控制关系待交易所或产权资料确认', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment }));

const chnPendingL3: OwnershipNodeSeed[] = [
  ['chn-gx-new-energy','广西国能能源发展有限公司','广西南宁'], ['chn-nanning','国能南宁发电有限公司','广西南宁'], ['chn-beihai','国能广投北海发电有限公司','广西北海'], ['chn-liuzhou','国能广投柳州发电有限公司','广西柳州'], ['chn-yongfu','国能永福发电有限公司','广西桂林'], ['chn-hydropower','广西国能水电开发有限公司','广西全区'], ['chn-integrated-service','广西国能综合能源服务有限公司','广西南宁'], ['chn-guohua-gx','国能国华（广西）新能源有限公司','广西南宁']
].map(([id,name,location]) => ({ id, name, category: '广西公司所属法人候选', level: 3, entityKind: '控股企业', locationTags: [location], registeredLocation: location, controlType: '待核验', verifiedAt: '2026-09-08', verificationStatus: '待确认', coverageSetId: 'coverage-chn-gx-l3', relation: '官方招聘公告可证所属单位，但不能单独证明直接股权', sourceUrl: chnGuangxiSource, recruitmentUrl: chnRecruitment }));

const ownershipTreeSeeds: OwnershipNodeSeed[] = [
  { id: 'gx-sasac', name: '广西壮族自治区国资委', category: '履行出资人职责机构', level: 0, entityKind: '监管机构', locationTags: ['广西全区'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', sourceUrl: 'https://gzw.gxzf.gov.cn/', children: [
    { id: 'gig-tree', name: '广西投资集团有限公司', category: '一级监管企业', level: 1, entityKind: '集团', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '自治区国资委履行出资人职责', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment, children: [
      { id: 'gx-energy', name: '广西能源集团有限公司', category: '能源产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '年度报告确认广投集团控制', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment, children: [
        { id: 'gx-zhengrun', name: '广西广投正润发展集团有限公司', category: '能源投资控股平台', level: 3, entityKind: '控股企业', locationTags: ['广西贺州','广西全区'], registeredLocation: '广西贺州', unifiedSocialCreditCode: '91451100200340229B', controlType: '全资', ownershipPercent: 100, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gx-energy-l3', relation: '广西能源集团全资子公司，保持真实层级', sourceUrl: gxEnergyAnnualReport, recruitmentUrl: gigRecruitment, children: [
          { id: 'gx-energy-listed', name: '广西能源股份有限公司', category: '上市公司', level: 4, entityKind: '控股企业', locationTags: ['广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '控股股东为广投正润，不再压缩挂接', sourceUrl: gxEnergyAnnualReport, recruitmentUrl: gigRecruitment }
        ] },
        ...[['gx-guangtou-petro','广西广投石化有限公司'],['gx-yongsheng-petro','广西永盛石油化工有限公司'],['gx-guixuan-energy','广西桂轩能源有限公司'],['gx-guisheng-energy','广西桂盛能源有限公司']].map(([id,name]) => ({ id, name, category: '能源集团所属法人候选', level: 3 as const, entityKind: '控股企业' as const, locationTags: ['广西全区'], controlType: '待核验' as const, verifiedAt: '2026-09-08', verificationStatus: '待确认' as const, coverageSetId: 'coverage-gx-energy-l3', relation: '采购公告可证所属关系，直接持股仍待确认', sourceUrl: 'https://new.gigeps.com/cms/default/webfile/cggg/20260727/1266409630838292480.html?categoryId=1166346928443621376', recruitmentUrl: gigRecruitment }))
      ] },
      { id: 'gx-aluminum', name: '广西铝业集团有限公司', category: '铝业产业平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '控股', ownershipPercent: 86.73, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '公开报告披露广投集团持股86.73%', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment, children: [['gx-baise-aluminum','广西百色广投银海铝业有限责任公司','广西百色'],['gx-laibin-aluminum','广西来宾银海铝业有限责任公司','广西来宾'],['gx-liuzhou-aluminum','广西广投柳州铝业股份有限公司','广西柳州']].map(([id,name,location]) => ({ id, name, category: '铝业集团所属法人候选', level: 3 as const, entityKind: '控股企业' as const, locationTags: [location], registeredLocation: location, controlType: '待核验' as const, verifiedAt: '2026-09-08', verificationStatus: '待确认' as const, coverageSetId: 'coverage-gx-aluminum-l3', relation: '业务归属已发现，直接控制证据待补', sourceUrl: gigBusinessSource, recruitmentUrl: gigRecruitment })) },
      { id: 'gx-financial-investment', name: '广西金融投资集团有限公司', category: '综合金融平台', level: 2, entityKind: '产业平台', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '广投集团年度报告纳入受控主体', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment, children: [
        { id: 'gx-capital-management', name: '广投资本管理集团有限公司', category: '资本投资平台', level: 3, entityKind: '产业平台', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', unifiedSocialCreditCode: '91450000MA5MTY2XXG', controlType: '控股', ownershipPercent: 90, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gx-financial-l3', relation: '广西金融投资集团直接持股90%', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment }
      ] },
      { id: 'gx-financial-holding', name: '广西投资集团金融控股有限公司', category: '金融控股平台', level: 2, entityKind: '控股企业', locationTags: ['广西南宁'], registeredLocation: '广西南宁', controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '年度报告确认集团控制', sourceUrl: gigAnnualReport, recruitmentUrl: gigRecruitment },
      { id: 'guohai-securities', name: '国海证券股份有限公司', category: '证券上市公司', level: 2, entityKind: '控股企业', locationTags: ['广西南宁','全国'], registeredLocation: '广西桂林', controlType: '实际控制', ownershipPercent: 23.33, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '广投集团直接持股23.33%，直接及间接合计37.46%并实际控制', sourceUrl: guohaiControlReport, recruitmentUrl: 'https://www.ghzq.com.cn/', children: [] },
      { id: 'beibu-bank', name: '广西北部湾银行股份有限公司', category: '地方银行', level: 2, entityKind: '控股企业', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '实际控制', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-gig-l2', relation: '年度报告列为重要受控子公司，集团直接及间接持股合计16.02%', sourceUrl: gigAnnualReport, recruitmentUrl: 'https://www.bankofbbg.com/', children: [['tiandong-village-bank','田东北部湾村镇银行有限责任公司','广西百色'],['cenxi-village-bank','岑溪市北部湾村镇银行有限责任公司','广西梧州']].map(([id,name,location]) => ({ id, name, category: '村镇银行候选', level: 3 as const, entityKind: '控股企业' as const, locationTags: [location], registeredLocation: location, controlType: '待核验' as const, verifiedAt: '2026-09-08', verificationStatus: '待确认' as const, coverageSetId: 'coverage-beibu-bank-l3', relation: '年报发现候选，直接持股比例待逐项核验', sourceUrl: gigAnnualReport, recruitmentUrl: 'https://www.bankofbbg.com/' })) },
      ...gigPendingL2
    ] }
  ] },
  { id: 'sasac-state', name: '国务院国资委', category: '履行出资人职责机构', level: 0, entityKind: '监管机构', locationTags: ['全国'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/', children: [
    { id: 'chn-root', name: '国家能源投资集团有限责任公司', category: '一级中央企业', level: 1, entityKind: '集团', locationTags: ['全国','广西全区'], controlType: '履行出资人职责', verifiedAt: '2026-09-08', verificationStatus: '已核验', relation: '国务院国资委监管', sourceUrl: 'https://opweb.sasac.gov.cn/gzwQ/', recruitmentUrl: chnRecruitment, children: [
      { id: 'chn-gx', name: '国家能源集团广西电力有限公司', category: '广西区域公司', level: 2, entityKind: '控股企业', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西南宁', controlType: '待核验', verifiedAt: '2026-09-08', verificationStatus: '待确认', coverageSetId: 'coverage-chn-l2', relation: '集团官方公告明确为省级区域全资子公司，仍待产权或年报交叉确认直接持股', sourceUrl: 'https://zhaopin.chnenergy.com.cn/annc/showfagg?id=3ce3a6af-170f-4ce1-9563-f238a808f9e8&kinds=2', recruitmentUrl: chnRecruitment, children: chnPendingL3 },
      { id: 'chn-longyuan', name: '龙源电力集团股份有限公司', category: '新能源上市平台', level: 2, entityKind: '产业平台', locationTags: ['全国','广西全区'], controlType: '控股', verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-chn-l2', relation: '国家能源集团控股上市平台，在广西直接设立法人', sourceUrl: longyuanReports, recruitmentUrl: chnRecruitment, children: [
        { id: 'chn-longyuan-gx', name: '广西龙源新能源有限公司', category: '广西新能源公司', level: 3, entityKind: '控股企业', locationTags: ['广西南宁','广西全区'], registeredLocation: '广西横州', unifiedSocialCreditCode: '91450127090742269U', controlType: '全资', ownershipPercent: 100, verifiedAt: '2026-09-08', verificationStatus: '已核验', coverageSetId: 'coverage-chn-longyuan-l3', relation: '龙源电力定期报告合并范围确认', sourceUrl: longyuanReports, recruitmentUrl: chnRecruitment }
      ] }
    ] }
  ] }
];

export const ownershipTrees: OwnershipNode[] = ownershipTreeSeeds.map(materializeOwnershipNode);

export const ownershipEdges: OwnershipEdge[] = [
  { id: 'edge-gx-sasac-gig', parentId: 'gx-sasac', childId: 'gig-tree', controlType: '履行出资人职责', controlBasis: '自治区国资委履行出资人职责', evidenceIds: ['ev-gx-sasac'], asOf: '2026-09-08', verificationStatus: '已核验' },
  { id: 'edge-state-chn', parentId: 'sasac-state', childId: 'chn-root', controlType: '履行出资人职责', controlBasis: '国务院国资委监管中央企业', evidenceIds: ['ev-state-sasac'], asOf: '2026-09-08', verificationStatus: '已核验' },
  ...ownershipTrees.flatMap((root) => root.children ?? []).flatMap((group) => (group.children ?? []).map((child) => ({ id: `edge-${group.id}-${child.id}`, parentId: group.id, childId: child.id, controlType: child.controlType, directOwnershipPercent: child.ownershipPercent, aggregateOwnershipPercent: child.id === 'guohai-securities' ? 37.46 : child.id === 'beibu-bank' ? 16.02 : undefined, controlBasis: child.relation ?? '公开披露控制关系', evidenceIds: [child.id === 'guohai-securities' ? 'ev-guohai-control' : child.id === 'chn-gx' ? 'ev-chn-gx' : child.id === 'chn-longyuan' ? 'ev-longyuan-report' : child.verificationStatus === '待确认' ? 'ev-gig-business' : 'ev-gig-annual'], asOf: '2026-09-08', verificationStatus: child.verificationStatus } as OwnershipEdge))),
  ...ownershipTrees.flatMap((root) => root.children ?? []).flatMap((group) => group.children ?? []).flatMap((parent) => (parent.children ?? []).map((child) => ({ id: `edge-${parent.id}-${child.id}`, parentId: parent.id, childId: child.id, controlType: child.controlType, directOwnershipPercent: child.ownershipPercent, controlBasis: child.relation ?? '公开披露控制关系', evidenceIds: [parent.id === 'gx-energy' || parent.id === 'gx-zhengrun' ? 'ev-gx-energy-annual' : parent.id === 'chn-longyuan' ? 'ev-longyuan-report' : parent.id === 'chn-gx' ? 'ev-chn-gx-members' : parent.id === 'gx-aluminum' ? 'ev-gig-business' : 'ev-gig-annual'], asOf: '2026-09-08', verificationStatus: child.verificationStatus } as OwnershipEdge))),
  { id: 'edge-gx-zhengrun-listed', parentId: 'gx-zhengrun', childId: 'gx-energy-listed', controlType: '控股', controlBasis: '广西能源年报确认广投正润为直接控股股东', evidenceIds: ['ev-gx-energy-annual'], asOf: '2026-09-08', verificationStatus: '已核验' },
];

export const awards: AwardEntry[] = [
  { id: 'award-cmb-nanning-2025', companyId: 'cmb-nanning', year: 2025, listName: '中国年度最佳雇主', awardTier: '南宁城市最佳雇主', nanningBasis: '招商银行南宁分行获2025年度南宁城市最佳雇主', sourceUrl: 'https://career.uibe.edu.cn/front/zpxx.jspa?tid=2095787535300083713' },
  { id: 'award-beibu-2021', companyId: 'beibu-air', year: 2021, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主 TOP10', nanningBasis: '主运营基地位于南宁吴圩国际机场', sourceUrl: 'https://v.gxnews.com.cn/a/20617877' },
  { id: 'award-xiaomi-2022', companyId: 'xiaomi', year: 2022, listName: '福布斯中国最佳雇主', awardTier: '中国年度最佳雇主', nanningBasis: '全国招聘渠道覆盖南宁', sourceUrl: 'https://www.thepaper.cn/newsDetail_forward_18964233' },
  { id: 'award-caih-2023', companyId: 'caih', year: 2023, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主', nanningBasis: '总部及主要招聘地点位于南宁', sourceUrl: 'https://www.caih.com/newsView.html?id=6435' },
  { id: 'award-caih-2024', companyId: 'caih', year: 2024, listName: '中国年度最佳雇主', awardTier: '南宁最佳雇主', nanningBasis: '连续八年获南宁榜单荣誉', sourceUrl: 'https://www.caih.com/newsView.html?id=6435' },
  { id: 'award-spic-2024', companyId: 'spic-gx', year: 2024, listName: '中国年度最佳雇主', awardTier: '南宁城市最佳雇主 10 强', nanningBasis: '公司本部位于南宁', sourceUrl: 'https://gx.people.com.cn/n2/2025/0120/c347802-41114135.html' },
  { id: 'award-yili-2025', companyId: 'yili', year: 2025, listName: '福布斯中国最佳雇主', awardTier: '中国年度最受员工欢迎雇主', nanningBasis: '全国校园招聘渠道覆盖南宁', sourceUrl: 'https://www.forbeschina.com/business/70329' },
];

export const latestSync: SyncRun = {
  completedAt: '2026-09-08T17:27:21+08:00',
  sourceCount: 24,
  anomalyCount: 9,
  changedRecords: 0,
  discoveredLeads: 163,
  qualifiedLeads: 111,
  verifiedLeads: 1,
  nanningLeads: 27,
  dailyTarget: 50,
  status: '部分成功',
};
