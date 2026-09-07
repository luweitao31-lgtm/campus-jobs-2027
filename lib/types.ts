export type CompanyNature = '中央企业' | '央企子公司' | '广西区属国企' | '南宁市属国企' | '国有控股' | '股份制银行' | '外企' | '民营企业';
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
  level: 0 | 1 | 2 | 3;
  entityKind: '监管机构' | '集团' | '控股企业' | '产业平台' | '分支机构';
  locationTags: string[];
  controlType: '履行出资人职责' | '全资' | '控股' | '产业管理' | '分支管理';
  ownershipPercent?: number;
  verifiedAt: string;
  verificationStatus: '已核验' | '待确认';
  coverageSetId?: string;
  relation?: string;
  sourceUrl: string;
  recruitmentUrl?: string;
  children?: OwnershipNode[];
}

export interface OwnershipCoverageSet {
  id: string;
  parentId: string;
  label: string;
  scope: string;
  asOf: string;
  disclosedTotal: number;
  expectedNodeIds: string[];
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
  status: '成功' | '部分成功' | '失败';
}
