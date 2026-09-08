import type { AwardEntry, Company, OwnershipCoverageSet, OwnershipNode, RecruitmentRecord, SourceEvidence, SyncRun } from '@/lib/types';

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
  { id: 'src-ceec-gxed-official', title: '中国能建广西院诚聘英才', publisher: '中国能建广西院', url: 'https://www.gxed.ceec.net.cn/col/col17152/index.html', sourceType: '企业官方', lastCheckedAt: '2026-09-08', health: '正常' },
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

export const ownershipCoverageSets: OwnershipCoverageSet[] = [
  {
    id: 'coverage-gig-guangxi-l2', parentId: 'gig-tree', label: '广投集团广西二级主体', scope: '广西注册、运营或承担广西产业管理职能的二级主体',
    asOf: '2026-09-08', disclosedTotal: 12,
    expectedNodeIds: ['gx-energy', 'gx-aluminum', 'gx-new-material', 'gx-pharma', 'digital-gx', 'gx-salt', 'gx-water-design', 'gx-financial-investment', 'gx-capital-management', 'gx-supply-chain', 'gx-invest-consulting', 'gx-smart-services'],
    sourceUrls: [gigBusinessSource, 'https://www.gig.cn/portal/secDetail?index=0&type=public_information'],
  },
  {
    id: 'coverage-chn-guangxi-l2', parentId: 'chn-root', label: '国家能源集团广西落地二级平台', scope: '在广西拥有控股主体或公开运营机构的集团二级平台',
    asOf: '2026-09-08', disclosedTotal: 3,
    expectedNodeIds: ['chn-gx', 'chn-longyuan', 'chn-sales'],
    sourceUrls: ['https://zhaopin.chnenergy.com.cn/planSerch?kinds=2', 'https://www.chnenergy.com.cn/'],
  },
];

export const ownershipTrees: OwnershipNode[] = [
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

export const latestSync: SyncRun = { completedAt: '2026-09-08T16:26:41+08:00', sourceCount: sources.length, anomalyCount: sources.filter((source) => source.health !== '正常').length, changedRecords: 3, status: '部分成功' };
