'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness, Building2, CalendarDays, ChevronDown, ChevronRight,
  ExternalLink, FileCheck2, MapPin, Network, RefreshCw, Search, ShieldCheck,
  Trophy,
} from 'lucide-react';
import { awards, companies, ownershipCoverageSets, ownershipEdges, ownershipTrees, sources } from '@/data/catalog';
import recruitmentDirectoryData from '@/data/recruitment-directory.json';
import recruitmentLeadReport from '@/data/recruitment-sync.json';
import recruitmentAlertData from '@/data/recruitment-alerts.json';
import sourceRegistry from '@/data/source-registry.json';
import type { OwnershipNode, RecruitmentAlert, RecruitmentDirectoryEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';

type ModuleId = 'recruitment' | 'ownership' | 'employers';
const recruitmentDirectory = recruitmentDirectoryData as { completedAt: string; baselineCount: number; totalCount: number; netNewCount: number; verifiedCount: number; pendingCount: number; nanningCount: number; entries: RecruitmentDirectoryEntry[] };
const recruitmentAlerts = (recruitmentAlertData as { alerts: RecruitmentAlert[] }).alerts;
const alertStorageKey = 'yongzhi-recruitment-alerts-read-v1';

function saveReadAlertIds(ids: Set<string>) {
  try {
    localStorage.setItem(alertStorageKey, JSON.stringify([...ids]));
  } catch {
    // Storage can be unavailable in private browsing or hardened browsers.
    // The in-memory state still clears the indicator for the current visit.
  }
}

const navigation = [
  { id: 'recruitment' as const, label: '秋招信息', icon: BriefcaseBusiness },
  { id: 'ownership' as const, label: '央国企资金跟踪链', icon: Network },
  { id: 'employers' as const, label: '最佳雇主榜单', icon: Trophy },
];

const companyMap = new Map(companies.map((company) => [company.id, company]));
const sourceMap = new Map(sources.map((source) => [source.id, source]));
const activeCollectorSources = sourceRegistry.sources.filter((source) => source.collect);
const latestCollectionTime = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(recruitmentLeadReport.completedAt));

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleId>('recruitment');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('广西南宁');
  const [status, setStatus] = useState('全部状态');
  const [nature, setNature] = useState('全部性质');
  const [sourceType, setSourceType] = useState('全部来源');
  const [page, setPage] = useState(1);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(alertStorageKey) ?? '[]');
      if (Array.isArray(saved)) setReadAlertIds(new Set(saved.filter((item): item is string => typeof item === 'string')));
    } catch {
      try {
        localStorage.removeItem(alertStorageKey);
      } catch {
        // Ignore unavailable browser storage and keep the default empty state.
      }
    }
  }, []);

  const unreadFor = (module: RecruitmentAlert['module'], entityId: string) => recruitmentAlerts.filter((alert) => alert.module === module && alert.entityId === entityId && !readAlertIds.has(alert.id));
  const markEntityRead = (module: RecruitmentAlert['module'], entityId: string) => {
    const ids = recruitmentAlerts.filter((alert) => alert.module === module && alert.entityId === entityId).map((alert) => alert.id);
    if (!ids.length) return;
    setReadAlertIds((current) => {
      const next = new Set([...current, ...ids]);
      saveReadAlertIds(next);
      return next;
    });
  };

  const filteredRecruitment = useMemo(() => recruitmentDirectory.entries.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesLocation = location === '全部地区' || item.locations.includes(location) || (location === '广西南宁' && item.locations.includes('广西全区'));
    const matchesStatus = status === '全部状态' || item.status === status;
    const matchesNature = nature === '全部性质' || item.nature === nature;
    const matchesSource = sourceType === '全部来源' || (sourceType === '官方/政府' ? item.confidence === '已核验' : sourceType === '求职平台' ? item.channel.type === '第三方公告' : sourceType === '高校就业网' ? item.sourceIds.some((id) => id.includes('gxu') || sourceMap.get(id)?.sourceType === '高校就业网') : item.channel.type === '第三方汇总');
    return matchesQuery && matchesLocation && matchesStatus && matchesNature && matchesSource;
  }), [location, nature, query, sourceType, status]);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filteredRecruitment.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedRecruitment = filteredRecruitment.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    const modelContext = (document as unknown as { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await modelContext.registerTool({
        name: 'filter_recruitment',
        title: '筛选秋招企业',
        description: '切换到秋招信息，并按企业名称或地点筛选可投递企业。',
        inputSchema: { type: 'object', properties: { query: { type: 'string' }, location: { type: 'string', enum: ['广西南宁', '全国', '全部地区'] } }, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: unknown) => {
          if (!input || typeof input !== 'object') throw new Error('筛选条件必须是对象');
          const value = input as { query?: unknown; location?: unknown };
          if (value.query !== undefined && typeof value.query !== 'string') throw new Error('query 必须是字符串');
          if (value.location !== undefined && !['广西南宁', '全国', '全部地区'].includes(String(value.location))) throw new Error('不支持该地点');
          setActiveModule('recruitment');
          if (typeof value.query === 'string') setQuery(value.query);
          if (typeof value.location === 'string') setLocation(value.location);
          return { module: 'recruitment', query: value.query ?? query, location: value.location ?? location };
        },
      }, { signal: lifecycle.signal });
      await modelContext.registerTool({
        name: 'open_information_module',
        title: '打开信息模块',
        description: '打开秋招、央国企资金跟踪链或最佳雇主榜单。',
        inputSchema: { type: 'object', properties: { module: { type: 'string', enum: ['recruitment', 'ownership', 'employers'] } }, required: ['module'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: unknown) => {
          const module = (input as { module?: unknown })?.module;
          if (!['recruitment', 'ownership', 'employers'].includes(String(module))) throw new Error('未知模块');
          setActiveModule(module as ModuleId);
          return { module };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [location, query]);

  return <SidebarProvider>
    <Sidebar className="border-r-0" collapsible="offcanvas">
      <SidebarHeader className="brand-panel px-5 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/20"><Building2 className="size-5" /></div>
          <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">Nanning 2027</p><h1 className="text-lg font-semibold tracking-tight text-white">邕职秋招</h1></div>
        </div>
      </SidebarHeader>
      <SidebarContent className="brand-panel px-3">
        <SidebarGroup><SidebarGroupContent><SidebarMenu className="gap-2">
          {navigation.map((item) => <SidebarMenuItem key={item.id}><SidebarMenuButton className="h-12 rounded-xl px-3 text-slate-300 hover:bg-white/8 hover:text-white data-active:bg-cyan-300 data-active:text-slate-950" isActive={activeModule === item.id} onClick={() => setActiveModule(item.id)}><item.icon className="size-[1.1rem]" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}
        </SidebarMenu></SidebarGroupContent></SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="brand-panel px-5 py-5"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-400"><div className="mb-1 flex items-center gap-2 font-medium text-slate-200"><ShieldCheck className="size-4 text-cyan-300" /> 私密工作台</div>只收录公开来源，不绕过登录与验证限制。</div></SidebarFooter>
    </Sidebar>
    <SidebarInset className="min-w-0 bg-[#f4f7f8]">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl md:px-7">
        <div className="flex min-w-0 items-center gap-3"><SidebarTrigger className="md:hidden" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{navigation.find((item) => item.id === activeModule)?.label}</p><p className="hidden text-xs text-slate-500 sm:block">为广西南宁 2027 届毕业生整理</p></div></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><RefreshCw className="size-3.5 text-cyan-700" /><span className="hidden sm:inline">最近采集</span><span className="font-medium text-slate-800">{latestCollectionTime}</span></div>
      </header>
      <div className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
        {activeModule === 'recruitment' && <RecruitmentPanel rows={pagedRecruitment} filteredCount={filteredRecruitment.length} page={safePage} pageCount={pageCount} setPage={setPage} query={query} setQuery={setQuery} location={location} setLocation={setLocation} status={status} setStatus={setStatus} nature={nature} setNature={setNature} sourceType={sourceType} setSourceType={setSourceType} />}
        {activeModule === 'ownership' && <OwnershipPanel unreadFor={unreadFor} markEntityRead={markEntityRead} />}
        {activeModule === 'employers' && <EmployerPanel unreadFor={unreadFor} markEntityRead={markEntityRead} />}
      </div>
    </SidebarInset>
  </SidebarProvider>;
}

function RecruitmentPanel(props: {
  rows: RecruitmentDirectoryEntry[]; filteredCount: number; page: number; pageCount: number; setPage: (v: number) => void; query: string; setQuery: (v: string) => void;
  location: string; setLocation: (v: string) => void; status: string; setStatus: (v: string) => void;
  nature: string; setNature: (v: string) => void; sourceType: string; setSourceType: (v: string) => void;
}) {
  const { rows, filteredCount, page, pageCount, setPage, query, setQuery, location, setLocation, status, setStatus, nature, setNature, sourceType, setSourceType } = props;
  return <section aria-labelledby="recruitment-title">
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-800"><span className="inline-block size-2 rounded-full bg-cyan-500" />2027 届秋招进行中</div><h2 id="recruitment-title" className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">先看南宁，再看全国</h2><p className="mt-2 text-sm text-slate-500">只整理企业与有效投递入口，避免被岗位列表淹没。</p></div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5"><Metric value={String(recruitmentDirectory.totalCount)} label="已收集企业" /><Metric value={String(recruitmentDirectory.verifiedCount)} label="已核验" /><Metric value={String(recruitmentDirectory.pendingCount)} label="待确认" warning /><Metric value={`+${recruitmentDirectory.netNewCount}`} label="首次新增" /><Metric value={String(recruitmentDirectory.nanningCount)} label="南宁相关" /></div>
    </div>
    <Card className="mb-4 border-0 bg-slate-950 text-white shadow-sm ring-0"><CardContent className="space-y-3 p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">每日 50+ 线索采集</p><p className="mt-1 text-xs text-slate-400">已扫描 {recruitmentLeadReport.counters.sourceCount} 个公开来源；每日更新批次中，民企与外企线索占比不得低于 50%。</p></div><div className="flex flex-wrap gap-2"><Badge className="w-fit border-0 bg-white/10 text-slate-100">民企/外企 {recruitmentLeadReport.counters.privateForeignLeads}/{recruitmentLeadReport.counters.qualifiedLeads} · {Math.round(recruitmentLeadReport.counters.privateForeignShare * 100)}%</Badge><Badge className={recruitmentLeadReport.targetMet ? 'w-fit border-0 bg-cyan-300 text-slate-950' : 'w-fit border-0 bg-amber-300 text-slate-950'}>{recruitmentLeadReport.targetMet ? '今日达标' : '今日未达标'} · {recruitmentLeadReport.counters.qualifiedLeads}/{recruitmentLeadReport.target}</Badge></div></div>
      <Progress value={Math.min(100, (recruitmentLeadReport.counters.qualifiedLeads / recruitmentLeadReport.target) * 100)} className="h-1.5 bg-white/10" />
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">{activeCollectorSources.slice(0, 8).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan-300">{source.name}<ExternalLink className="ml-1 inline size-3" /></a>)}<span className="text-slate-500">等 {activeCollectorSources.length} 个采集入口</span></div>
    </CardContent></Card>
    <Card className="mb-4 border-0 bg-white shadow-sm shadow-slate-200/60 ring-1 ring-slate-200/80"><CardContent className="grid gap-3 py-1 lg:grid-cols-[minmax(230px,1fr)_160px_140px_160px_140px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索企业" className="h-10 pl-9" placeholder="搜索企业名称" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <FilterSelect label="地点筛选" value={location} setValue={setLocation} options={['广西南宁', '全国', '全部地区']} />
      <FilterSelect label="招聘状态" value={status} setValue={setStatus} options={['全部状态', '开放中', '待确认', '已结束']} />
      <FilterSelect label="企业性质" value={nature} setValue={setNature} options={['全部性质', '中央企业', '央企子公司', '广西区属国企', '国有控股', '股份制银行', '民营企业', '外企', '性质待确认']} />
      <FilterSelect label="信息来源" value={sourceType} setValue={setSourceType} options={['全部来源', '官方/政府', '求职平台', '高校就业网', '聚合平台']} />
    </CardContent></Card>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>总库 <strong className="text-slate-800">{recruitmentDirectory.totalCount}</strong> 家 · 当前筛选 <strong className="text-slate-800">{filteredCount}</strong> 家</span><span>聚合平台记录标记为待确认，开放状态以核验来源为准。</span></div>
    <div className="grid gap-3">{rows.length ? rows.map((item) => <RecruitmentCard key={item.id} item={item} />) : <EmptyState />}</div>
    {filteredCount > 0 && <Pagination className="mt-6"><PaginationContent><PaginationItem><PaginationPrevious href="#recruitment-title" text="上一页" aria-disabled={page === 1} className={page === 1 ? 'pointer-events-none opacity-40' : ''} onClick={(event) => { event.preventDefault(); setPage(Math.max(1, page - 1)); }} /></PaginationItem><PaginationItem><span className="px-3 text-sm text-slate-600">第 {page} / {pageCount} 页</span></PaginationItem><PaginationItem><PaginationNext href="#recruitment-title" text="下一页" aria-disabled={page === pageCount} className={page === pageCount ? 'pointer-events-none opacity-40' : ''} onClick={(event) => { event.preventDefault(); setPage(Math.min(pageCount, page + 1)); }} /></PaginationItem></PaginationContent></Pagination>}
  </section>;
}

function RecruitmentCard({ item }: { item: RecruitmentDirectoryEntry }) {
  return <Card className="group border-0 bg-white py-0 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 flex-1 items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Building2 className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{item.name}</h3><Badge className={item.status === '开放中' ? 'border-0 bg-cyan-50 text-cyan-800' : 'border-0 bg-amber-50 text-amber-800'}>{item.status}</Badge><Badge variant="outline">{item.confidence}</Badge>{item.isFirstExpansion && <Badge className="border-0 bg-emerald-50 text-emerald-800">首次扩容</Badge>}</div><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"><span>{item.nature}</span><span className="flex items-center gap-1"><MapPin className="size-3.5" />{item.locations.join(' · ')}</span><span>核验 {item.lastVerifiedAt.slice(0, 10)}</span><span className="flex items-center gap-1"><FileCheck2 className="size-3.5" />{item.sourceLabels.join(' · ')}</span></div>{item.confidence === '待确认' && <p className="mt-1 text-xs text-amber-700">单一第三方来源，已收集渠道，等待官网或第二来源复核。</p>}</div></div>
    <Button nativeButton={false} render={<a href={item.channel.url} target="_blank" rel="noreferrer" />} className="h-10 shrink-0 bg-slate-950 text-white hover:bg-cyan-700">{item.channel.label}<ExternalLink className="size-4" /></Button>
  </CardContent></Card>;
}

type AlertUiProps = {
  unreadFor: (module: RecruitmentAlert['module'], entityId: string) => RecruitmentAlert[];
  markEntityRead: (module: RecruitmentAlert['module'], entityId: string) => void;
};

function OwnershipPanel({ unreadFor, markEntityRead }: AlertUiProps) {
  const [query, setQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('广西全部');
  const [verificationFilter, setVerificationFilter] = useState('全部状态');
  const allNodes = useMemo(() => flattenTree(ownershipTrees), []);
  const verifiedL2 = allNodes.filter((node) => node.level === 2 && node.verificationStatus === '已核验').length;
  const pendingL2 = allNodes.filter((node) => node.level === 2 && node.verificationStatus === '待确认').length;
  const verifiedL3 = allNodes.filter((node) => node.level === 3 && node.verificationStatus === '已核验').length;
  const pendingL3 = allNodes.filter((node) => node.level === 3 && node.verificationStatus === '待确认').length;
  const excludedBranches = ownershipCoverageSets.reduce((sum, set) => sum + (set.excludedBranchCount ?? 0), 0);
  const asOf = ownershipCoverageSets.map((set) => set.asOf).sort().at(-1) ?? '—';
  const filteredTrees = useMemo(() => ownershipTrees.map((root) => filterOwnershipTree(root, query, locationFilter, verificationFilter)).filter((root): root is OwnershipNode => Boolean(root)), [locationFilter, query, verificationFilter]);
  return <section aria-labelledby="ownership-title"><PanelHeading id="ownership-title" eyebrow="直接法律控制 · 广西法人口径" title="央国企资金跟踪链" description="二级主体重新按直接持股或实际控制核验；每个二级公司均建立三级清单，超过三级的关系按真实层级继续展示。" />
    <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_160px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索资金链企业" className="h-10 bg-white pl-9" placeholder="搜索集团、子公司或驻邕主体" value={query} onChange={(e) => setQuery(e.target.value)} /></div><FilterSelect label="所在地" value={locationFilter} setValue={setLocationFilter} options={['广西全部', '广西南宁', '全国/跨区域']} /><FilterSelect label="核验状态" value={verificationFilter} setValue={setVerificationFilter} options={['全部状态', '已核验', '待确认']} /></div>
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5"><Metric value={String(verifiedL2)} label="已核验二级" /><Metric value={String(verifiedL3)} label="已核验三级" /><Metric value={`${pendingL2}/${pendingL3}`} label="待确认 二/三级" warning /><Metric value={String(excludedBranches)} label="排除分支机构" /><Metric value={asOf} label="数据截至" /></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]"><Card className="border-0 bg-white ring-1 ring-slate-200/80"><CardHeader><CardTitle>广西央国企控制关系</CardTitle><CardDescription>二级列表默认可见，展开二级节点可查看已核验的三级主体</CardDescription></CardHeader><CardContent className="space-y-3">{filteredTrees.length ? filteredTrees.map((root) => <TreeNode key={root.id} node={root} depth={0} unreadFor={unreadFor} markEntityRead={markEntityRead} />) : <EmptyState />}</CardContent></Card>
      <Card className="h-fit border-0 bg-slate-950 text-white ring-0"><CardHeader><CardTitle>可审计覆盖清单</CardTitle><CardDescription className="text-slate-400">不再用已发现数量冒充完整率。</CardDescription></CardHeader><CardContent className="max-h-[680px] space-y-3 overflow-y-auto">{ownershipCoverageSets.map((set) => <div key={set.id} className="rounded-xl bg-white/5 p-3"><div className="flex items-start justify-between gap-2"><span className="text-xs text-slate-200">{set.label}</span><Badge className={set.completenessStatus === '官方清单已闭合' ? 'border-0 bg-emerald-400/15 text-emerald-200' : 'border-0 bg-amber-400/15 text-amber-200'}>{set.completenessStatus}</Badge></div><p className="mt-2 text-xs text-slate-400">已核验 {set.expectedNodeIds.length} 家 · 待确认 {set.pendingNodeIds.length} 家{set.officialDisclosedTotal === null ? ' · 官方未披露总数' : ` · 官方披露 ${set.officialDisclosedTotal} 家`}</p></div>)}<p className="text-xs leading-5 text-slate-400">招聘公告中的“所属单位”仅作候选发现；未取得股权或实际控制证据前均标记待确认。</p></CardContent></Card>
    </div>
  </section>;
}

function TreeNode({ node, depth, unreadFor, markEntityRead }: { node: OwnershipNode; depth: number } & AlertUiProps) {
  const [open, setOpen] = useState(node.level < 2);
  const edge = ownershipEdges.find((item) => item.childId === node.id);
  const coverage = node.level === 2 ? ownershipCoverageSets.find((item) => item.parentId === node.id && item.targetLevel === 3) : undefined;
  const hasChildren = Boolean(node.children?.length) || Boolean(coverage);
  const activeChannel = node.recruitmentChannels.find((channel) => channel.url && channel.status !== '已截止' && channel.match !== '暂无公开入口');
  const historicalChannel = node.recruitmentChannels.find((channel) => channel.url && channel.status === '已截止');
  const isFallbackChannel = activeChannel?.match === '集团兜底';
  const channelCheckedAt = activeChannel?.verifiedAt ?? historicalChannel?.verifiedAt ?? node.recruitmentChannels[0]?.verifiedAt;
  const unreadAlerts = unreadFor('ownership', node.id);
  return <Collapsible open={open} onOpenChange={setOpen} className={depth ? 'ml-5 border-l-2 border-cyan-100 pl-4' : ''}>
    <div className="relative mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {unreadAlerts.length > 0 && <span className="absolute right-2 top-2 z-10 size-2.5 rounded-full bg-red-500 shadow-[0_2px_8px_rgba(239,68,68,0.55)] ring-2 ring-white" role="status"><span className="sr-only">{node.name}有新的招聘信息</span></span>}
      {hasChildren ? <CollapsibleTrigger className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label={open ? '收起下级主体' : '展开下级主体'}>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</CollapsibleTrigger> : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-cyan-700">L{node.level}</span>}
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><strong className="text-sm text-slate-950">{node.name}</strong><Badge variant="outline">L{node.level}</Badge>{node.locationTags.includes('广西南宁') && <Badge className="border-0 bg-cyan-50 text-cyan-800">南宁</Badge>}{node.verificationStatus === '待确认' && <Badge className="border-0 bg-amber-50 text-amber-800">待确认</Badge>}{isFallbackChannel && <Badge className="border-0 bg-amber-50 text-amber-800">未定位到本公司</Badge>}{coverage && <Badge variant="outline">三级 {coverage.expectedNodeIds.length}核验/{coverage.pendingNodeIds.length}待确认</Badge>}</div><span className="mt-1 block text-xs leading-5 text-slate-500">{node.category} · {edge?.controlType ?? node.controlType}{edge?.directOwnershipPercent !== undefined ? ` ${edge.directOwnershipPercent}%` : ''}{edge?.aggregateOwnershipPercent !== undefined ? `（合计${edge.aggregateOwnershipPercent}%）` : ''}{node.relation ? ` · ${node.relation}` : ''}</span><span className="block text-xs text-slate-400">{node.registeredLocation ? `注册地 ${node.registeredLocation} · ` : ''}{node.unifiedSocialCreditCode ? `统一社会信用代码 ${node.unifiedSocialCreditCode} · ` : node.level === 3 ? '统一社会信用代码待补 · ' : ''}{node.locationTags.join(' · ')} · 核验 {node.verifiedAt}</span>{node.level > 0 && <span className="mt-1 block text-xs text-slate-500">招聘渠道：{activeChannel ? `${activeChannel.type} · ${activeChannel.match} · ${activeChannel.status}` : '暂无公开招聘入口'}{channelCheckedAt ? ` · 核验 ${channelCheckedAt}` : ''}{historicalChannel && <>{' · '}<a className="text-cyan-700 underline-offset-2 hover:underline" href={historicalChannel.url} target="_blank" rel="noreferrer">招聘证据（已截止）</a></>}</span>}</div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1"><Button nativeButton={false} size="icon-sm" variant="ghost" render={<a href={node.sourceUrl} target="_blank" rel="noreferrer" aria-label={`查看${node.name}关系来源`} />}><FileCheck2 className="size-4" /></Button>{activeChannel?.url ? <Button nativeButton={false} size="sm" variant="outline" render={<a href={activeChannel.url} target="_blank" rel="noreferrer" onClick={() => markEntityRead('ownership', node.id)} aria-label={`${node.name}${isFallbackChannel ? '集团招聘入口' : '招聘入口'}`} />}>{isFallbackChannel ? '集团招聘入口' : '招聘入口'}<ExternalLink className="size-3.5" /></Button> : node.level > 0 ? <span className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">暂无公开招聘入口</span> : null}</div>
    </div>
    {hasChildren && <CollapsibleContent className="space-y-2">{node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} unreadFor={unreadFor} markEntityRead={markEntityRead} />)}{coverage && !node.children?.length && <div className="ml-5 rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">三级子夹层已建立：已核验 0 家、待确认 0 家；{coverage.completenessStatus}，等待直接控制证据。</div>}</CollapsibleContent>}
  </Collapsible>;
}

function EmployerPanel({ unreadFor, markEntityRead }: AlertUiProps) {
  const [year, setYear] = useState('全部年度');
  const [query, setQuery] = useState('');
  const rows = awards.flatMap((award) => { const company = companyMap.get(award.companyId); return company ? [{ award, company }] : []; }).filter(({ award, company }) => (year === '全部年度' || String(award.year) === year) && `${company.name}${company.shortName}`.toLowerCase().includes(query.toLowerCase()));
  return <section aria-labelledby="employer-title"><PanelHeading id="employer-title" eyebrow="2021—2025" title="最佳雇主榜单" description="收录南宁城市榜，以及全国权威榜单中在南宁有招聘覆盖的成员企业。" />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><FilterSelect label="榜单年度" value={year} setValue={setYear} options={['全部年度', '2025', '2024', '2023', '2022', '2021']} /><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索上榜企业" className="h-8 bg-white pl-9" placeholder="搜索上榜企业" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{rows.map(({ award, company }) => { const unreadAlerts = unreadFor('employers', company.id); return <Card key={award.id} className="relative border-0 bg-white ring-1 ring-slate-200/80">{unreadAlerts.length > 0 && <span className="absolute right-2 top-2 z-10 size-2.5 rounded-full bg-red-500 shadow-[0_2px_8px_rgba(239,68,68,0.55)] ring-2 ring-white" role="status"><span className="sr-only">{company.name}有新的招聘信息</span></span>}<CardHeader className="pr-8"><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Trophy className="size-5" /></div><CardTitle>{company.name}</CardTitle><CardDescription>{award.listName} · {award.awardTier}</CardDescription><CardAction><Badge variant="outline">{award.year}</Badge></CardAction></CardHeader><CardContent><p className="mb-4 text-xs leading-5 text-slate-500">南宁关联：{award.nanningBasis}</p><div className="grid grid-cols-2 gap-2"><Button nativeButton={false} variant="outline" render={<a href={award.sourceUrl} target="_blank" rel="noreferrer" />}>榜单来源<FileCheck2 className="size-4" /></Button><Button nativeButton={false} render={<a href={company.channels[0].url} target="_blank" rel="noreferrer" onClick={() => markEntityRead('employers', company.id)} />} className="bg-slate-950 text-white">投递入口<ExternalLink className="size-4" /></Button></div></CardContent></Card>; })}</div>
  </section>;
}

function FilterSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) { return <NativeSelect aria-label={label} className="w-full" value={value} onChange={(e) => setValue(e.target.value)}>{options.map((option) => <NativeSelectOption key={option}>{option}</NativeSelectOption>)}</NativeSelect>; }
function PanelHeading({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description: string }) { return <div className="mb-6"><p className="mb-2 text-sm font-semibold text-cyan-800">{eyebrow}</p><h2 id={id} className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>; }
function Metric({ value, label, warning = false }: { value: string; label: string; warning?: boolean }) { return <div className="min-w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><strong className={warning ? 'text-lg text-amber-600' : 'text-lg text-slate-950'}>{value}</strong><span className="ml-1.5 text-xs text-slate-500">{label}</span></div>; }
function EmptyState() { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CalendarDays className="mx-auto mb-3 size-7 text-slate-400" /><p className="font-medium text-slate-800">没有符合条件的企业</p><p className="mt-1 text-sm text-slate-500">换一个筛选条件后再试。</p></div>; }
function flattenTree(nodes: OwnershipNode[]): OwnershipNode[] { return nodes.flatMap((node) => [node, ...flattenTree(node.children ?? [])]); }
function filterOwnershipTree(node: OwnershipNode, query: string, location: string, verification: string): OwnershipNode | null {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = !normalizedQuery || `${node.name}${node.category}${node.relation ?? ''}`.toLowerCase().includes(normalizedQuery);
  const matchesLocation = location === '广西全部' || (location === '广西南宁' ? node.locationTags.includes('广西南宁') : node.locationTags.includes('全国'));
  const matchesVerification = verification === '全部状态' || node.verificationStatus === verification;
  const children = (node.children ?? []).map((child) => filterOwnershipTree(child, query, location, verification)).filter((child): child is OwnershipNode => Boolean(child));
  return (matchesQuery && matchesLocation && matchesVerification) || children.length ? { ...node, children } : null;
}
