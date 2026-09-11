export type CompanyNature = '中央企业' | '央企子公司' | '广西区属国企' | '南宁市属国企' | '国有控股' | '股份制银行' | '外企' | '民营企业' | '性质待确认';
export type RecruitmentStatus = '开放中' | '待确认' | '已结束';
export type ChannelType = '企业官网' | '国聘' | '集团招聘平台' | '公众号';

export interface RecruitmentChannel {
  id: string;
  label: string;
  type: ChannelType;
  url: string;
}

export interface Company {
  id: string;
  name: string;
  shortName: string;
  nature: CompanyNature;
  locations: string[];
  channels: RecruitmentChannel[];
}

export interface SourceEvidence {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: '企业官方' | '政府平台' | '招聘平台' | '高校就业网' | '聚合平台' | '权威媒体' | '评选机构';
  lastCheckedAt: string;
  health: '正常' | '受限' | '异常';
}

export interface RecruitmentRecord {
  id: string;
  companyId: string;
  cohort: 2027;
  status: RecruitmentStatus;
  locations: string[];
  sourceIds: string[];
  firstSeenAt: string;
  lastVerifiedAt: string;
  confidence: '已核验' | '待确认';
}

export interface OwnershipNode {
  id: string;
  name: string;
  category: string;
  level: 0 | 1 | 2 | 3 | 4;
  entityKind: '监管机构' | '集团' | '控股企业' | '产业平台' | '分支机构';
  locationTags: string[];
  controlType: '履行出资人职责' | '全资' | '控股' | '实际控制' | '待核验';
  ownershipPercent?: number;
  unifiedSocialCreditCode?: string;
  registeredLocation?: string;
  verifiedAt: string;
  verificationStatus: '已核验' | '待确认';
  coverageSetId?: string;
  relation?: string;
  sourceUrl: string;
  recruitmentChannels: OwnershipRecruitmentChannel[];
  children?: OwnershipNode[];
}

export interface OwnershipRecruitmentChannel {
  label: string;
  type: '公司招聘官网' | '集团招聘系统单位页' | '官方招聘公告' | '集团通用入口' | '无公开渠道';
  match: '公司专属' | '单位已定位' | '集团兜底' | '暂无公开入口';
  status: '可投递' | '状态待确认' | '已截止' | '暂无公开入口';
  url?: string;
  appliesToCompanyName?: string;
  evidenceUrl?: string;
  verifiedAt: string;
}

export interface OwnershipEvidence {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: '企业年报' | '交易所公告' | '监管披露' | '企业官网' | '招聘公告';
  verifiedAt: string;
}

export interface OwnershipEdge {
  id: string;
  parentId: string;
  childId: string;
  controlType: '履行出资人职责' | '全资' | '控股' | '实际控制' | '待核验';
  directOwnershipPercent?: number;
  aggregateOwnershipPercent?: number;
  controlBasis: string;
  evidenceIds: string[];
  asOf: string;
  verificationStatus: '已核验' | '待确认';
}

export interface OwnershipCoverageSet {
  id: string;
  parentId: string;
  label: string;
  scope: string;
  asOf: string;
  targetLevel: 2 | 3;
  officialDisclosedTotal: number | null;
  expectedNodeIds: string[];
  pendingNodeIds: string[];
  completenessStatus: '官方清单已闭合' | '已核验并持续补充' | '官方未披露总数';
  excludedBranchCount?: number;
  sourceUrls: string[];
}

export interface AwardEntry {
  id: string;
  companyId: string;
  year: 2021 | 2022 | 2023 | 2024 | 2025;
  listName: string;
  awardTier: string;
  nanningBasis: string;
  sourceUrl: string;
}

export interface SyncRun {
  completedAt: string;
  sourceCount: number;
  anomalyCount: number;
  changedRecords: number;
  discoveredLeads: number;
  qualifiedLeads: number;
  verifiedLeads: number;
  nanningLeads: number;
  dailyTarget: number;
  status: '成功' | '部分成功' | '失败';
}

export type RecruitmentLeadStatus = '待核验' | '官方确认' | '双来源确认';

export interface RecruitmentLead {
  id: string;
  companyName: string;
  normalizedCompanyName: string;
  title: string;
  cohort: 2027;
  locations: string[];
  sourceIds: string[];
  sourceUrls: string[];
  channelUrl?: string;
  publishedAt?: string;
  discoveredAt: string;
  lastSeenAt: string;
  status: RecruitmentLeadStatus;
  nature: CompanyNature;
  fingerprint: string;
}

export interface RecruitmentDirectoryEntry {
  id: string;
  name: string;
  normalizedCompanyName: string;
  nature: CompanyNature;
  locations: string[];
  status: RecruitmentStatus;
  confidence: '已核验' | '待确认';
  channel: { label: string; type: '企业官网' | '集团招聘平台' | '国聘' | '公众号' | '第三方公告' | '第三方汇总'; url: string };
  sourceIds: string[];
  sourceLabels: string[];
  firstSeenAt: string;
  lastVerifiedAt: string;
  isFirstExpansion: boolean;
}
