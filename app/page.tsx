'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness, Building2, CalendarDays, ChevronDown, ChevronRight,
  ExternalLink, FileCheck2, MapPin, Network, RefreshCw, Search, ShieldCheck,
  Trophy,
} from 'lucide-react';
import { awards, companies, latestSync, ownershipTrees, recruitmentRecords, sources } from '@/data/catalog';
import type { Company, OwnershipNode, RecruitmentRecord } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar';

type ModuleId = 'recruitment' | 'ownership' | 'employers';
type RecruitmentView = RecruitmentRecord & { company: Company; sourceLabels: string[] };

const navigation = [
  { id: 'recruitment' as const, label: '秋招信息', icon: BriefcaseBusiness },
  { id: 'ownership' as const, label: '央国企资金跟踪链', icon: Network },
  { id: 'employers' as const, label: '最佳雇主榜单', icon: Trophy },
];

const companyMap = new Map(companies.map((company) => [company.id, company]));
const sourceMap = new Map(sources.map((source) => [source.id, source]));
const recruitmentViews: RecruitmentView[] = recruitmentRecords.flatMap((record) => {
  const company = companyMap.get(record.companyId);
  return company ? [{ ...record, company, sourceLabels: record.sourceIds.map((id) => sourceMap.get(id)?.publisher ?? id) }] : [];
});

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleId>('recruitment');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('广西南宁');
  const [status, setStatus] = useState('全部状态');
  const [nature, setNature] = useState('全部性质');
  const [sourceType, setSourceType] = useState('全部来源');

  const filteredRecruitment = useMemo(() => recruitmentViews.filter((item) => {
    const matchesQuery = `${item.company.name}${item.company.shortName}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesLocation = location === '全部地区' || item.locations.includes(location) || (location === '广西南宁' && item.locations.includes('广西全区'));
    const matchesStatus = status === '全部状态' || item.status === status;
    const matchesNature = nature === '全部性质' || item.company.nature === nature;
    const matchesSource = sourceType === '全部来源' || item.company.channels.some((channel) => channel.type === sourceType);
    return matchesQuery && matchesLocation && matchesStatus && matchesNature && matchesSource;
  }), [location, nature, query, sourceType, status]);

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
        <div className="flex items-center gap-2 text-xs text-slate-500"><RefreshCw className="size-3.5 text-cyan-700" /><span className="hidden sm:inline">最近核验</span><span className="font-medium text-slate-800">{latestSync.completedAt.slice(0, 16).replace('T', ' ')}</span></div>
      </header>
      <div className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
        {activeModule === 'recruitment' && <RecruitmentPanel rows={filteredRecruitment} query={query} setQuery={setQuery} location={location} setLocation={setLocation} status={status} setStatus={setStatus} nature={nature} setNature={setNature} sourceType={sourceType} setSourceType={setSourceType} />}
        {activeModule === 'ownership' && <OwnershipPanel />}
        {activeModule === 'employers' && <EmployerPanel />}
      </div>
    </SidebarInset>
  </SidebarProvider>;
}

function RecruitmentPanel(props: {
  rows: RecruitmentView[]; query: string; setQuery: (v: string) => void;
  location: string; setLocation: (v: string) => void; status: string; setStatus: (v: string) => void;
  nature: string; setNature: (v: string) => void; sourceType: string; setSourceType: (v: string) => void;
}) {
  const { rows, query, setQuery, location, setLocation, status, setStatus, nature, setNature, sourceType, setSourceType } = props;
  return <section aria-labelledby="recruitment-title">
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-800"><span className="inline-block size-2 rounded-full bg-cyan-500" />2027 届秋招进行中</div><h2 id="recruitment-title" className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">先看南宁，再看全国</h2><p className="mt-2 text-sm text-slate-500">只整理企业与有效投递入口，避免被岗位列表淹没。</p></div>
      <div className="grid grid-cols-3 gap-2"><Metric value={String(recruitmentRecords.length)} label="收录企业" /><Metric value={String(latestSync.sourceCount)} label="可信来源" /><Metric value={String(latestSync.anomalyCount)} label="异常来源" warning /></div>
    </div>
    <Card className="mb-4 border-0 bg-white shadow-sm shadow-slate-200/60 ring-1 ring-slate-200/80"><CardContent className="grid gap-3 py-1 lg:grid-cols-[minmax(230px,1fr)_160px_140px_160px_140px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索企业" className="h-10 pl-9" placeholder="搜索企业名称" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <FilterSelect label="地点筛选" value={location} setValue={setLocation} options={['广西南宁', '全国', '全部地区']} />
      <FilterSelect label="招聘状态" value={status} setValue={setStatus} options={['全部状态', '开放中', '待确认', '已结束']} />
      <FilterSelect label="企业性质" value={nature} setValue={setNature} options={['全部性质', '中央企业', '央企子公司', '广西区属国企', '国有控股', '民营企业']} />
      <FilterSelect label="信息来源" value={sourceType} setValue={setSourceType} options={['全部来源', '企业官网', '集团招聘平台', '国聘']} />
    </CardContent></Card>
    <div className="mb-3 text-xs text-slate-500">找到 <strong className="text-slate-800">{rows.length}</strong> 家企业</div>
    <div className="grid gap-3">{rows.length ? rows.map((item) => <RecruitmentCard key={item.id} item={item} />) : <EmptyState />}</div>
  </section>;
}

function RecruitmentCard({ item }: { item: RecruitmentView }) {
  const primaryChannel = item.company.channels[0];
  const evidence = sourceMap.get(item.sourceIds[0]);
  return <Card className="group border-0 bg-white py-0 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 flex-1 items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Building2 className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{item.company.name}</h3><Badge className={item.status === '开放中' ? 'border-0 bg-cyan-50 text-cyan-800' : 'border-0 bg-amber-50 text-amber-800'}>{item.status}</Badge><Badge variant="outline">{item.confidence}</Badge></div><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"><span>{item.company.nature}</span><span className="flex items-center gap-1"><MapPin className="size-3.5" />{item.locations.join(' · ')}</span><span>核验 {item.lastVerifiedAt}</span>{evidence && <a className="flex items-center gap-1 hover:text-cyan-700" href={evidence.url} target="_blank" rel="noreferrer"><FileCheck2 className="size-3.5" />{evidence.publisher}</a>}</div></div></div>
    <Button nativeButton={false} render={<a href={primaryChannel.url} target="_blank" rel="noreferrer" />} className="h-10 shrink-0 bg-slate-950 text-white hover:bg-cyan-700">{primaryChannel.label}<ExternalLink className="size-4" /></Button>
  </CardContent></Card>;
}

function OwnershipPanel() {
  const [query, setQuery] = useState('');
  return <section aria-labelledby="ownership-title"><PanelHeading id="ownership-title" eyebrow="公开控股关系" title="央国企资金跟踪链" description="沿实际控制关系展开，树上每个主体均附证据来源，招聘入口随节点展示。" />
    <div className="mb-4 relative max-w-lg"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索资金链企业" className="h-10 bg-white pl-9" placeholder="搜索集团、子公司或驻邕主体" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]"><Card className="border-0 bg-white ring-1 ring-slate-200/80"><CardHeader><CardTitle>南宁国资主体关系图</CardTitle><CardDescription>当前首批展示 2 条已核验至三级的控制链</CardDescription></CardHeader><CardContent className="space-y-3">{ownershipTrees.filter((root) => treeMatches(root, query)).map((root) => <TreeNode key={root.id} node={root} depth={0} />)}</CardContent></Card>
      <Card className="h-fit border-0 bg-slate-950 text-white ring-0"><CardHeader><CardTitle>覆盖进度</CardTitle><CardDescription className="text-slate-400">从可信关系链起步，持续扩充，不宣称穷举。</CardDescription></CardHeader><CardContent className="space-y-5"><ProgressLine label="自治区监管链" value="1 条" percent="42%" /><ProgressLine label="中央企业驻邕链" value="1 条" percent="28%" /><ProgressLine label="三级节点招聘入口" value="4 个" percent="57%" /></CardContent></Card>
    </div>
  </section>;
}

function TreeNode({ node, depth }: { node: OwnershipNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = Boolean(node.children?.length);
  return <Collapsible open={open} onOpenChange={setOpen} className={depth ? 'ml-5 border-l-2 border-cyan-100 pl-4' : ''}>
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {hasChildren ? <CollapsibleTrigger className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label={open ? '收起子公司' : '展开子公司'}>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</CollapsibleTrigger> : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-cyan-700">L{depth}</span>}
      <div className="min-w-0 flex-1"><strong className="block text-sm text-slate-950">{node.name}</strong><span className="mt-0.5 block text-xs text-slate-500">{node.category}{node.relation ? ` · ${node.relation}` : ''}</span></div>
      <div className="flex shrink-0 items-center gap-1"><Button nativeButton={false} size="icon-sm" variant="ghost" render={<a href={node.sourceUrl} target="_blank" rel="noreferrer" aria-label={`查看${node.name}关系来源`} />}><FileCheck2 className="size-4" /></Button>{node.recruitmentUrl && <Button nativeButton={false} size="sm" variant="outline" render={<a href={node.recruitmentUrl} target="_blank" rel="noreferrer" />}>投递<ExternalLink className="size-3.5" /></Button>}</div>
    </div>
    {hasChildren && <CollapsibleContent className="space-y-2">{node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}</CollapsibleContent>}
  </Collapsible>;
}

function EmployerPanel() {
  const [year, setYear] = useState('全部年度');
  const [query, setQuery] = useState('');
  const rows = awards.flatMap((award) => { const company = companyMap.get(award.companyId); return company ? [{ award, company }] : []; }).filter(({ award, company }) => (year === '全部年度' || String(award.year) === year) && `${company.name}${company.shortName}`.toLowerCase().includes(query.toLowerCase()));
  return <section aria-labelledby="employer-title"><PanelHeading id="employer-title" eyebrow="2021—2025" title="最佳雇主榜单" description="收录南宁城市榜，以及全国权威榜单中在南宁有招聘覆盖的成员企业。" />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><FilterSelect label="榜单年度" value={year} setValue={setYear} options={['全部年度', '2025', '2024', '2023', '2022', '2021']} /><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="搜索上榜企业" className="h-8 bg-white pl-9" placeholder="搜索上榜企业" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{rows.map(({ award, company }) => <Card key={award.id} className="border-0 bg-white ring-1 ring-slate-200/80"><CardHeader><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Trophy className="size-5" /></div><CardTitle>{company.name}</CardTitle><CardDescription>{award.listName} · {award.awardTier}</CardDescription><CardAction><Badge variant="outline">{award.year}</Badge></CardAction></CardHeader><CardContent><p className="mb-4 text-xs leading-5 text-slate-500">南宁关联：{award.nanningBasis}</p><div className="grid grid-cols-2 gap-2"><Button nativeButton={false} variant="outline" render={<a href={award.sourceUrl} target="_blank" rel="noreferrer" />}>榜单来源<FileCheck2 className="size-4" /></Button><Button nativeButton={false} render={<a href={company.channels[0].url} target="_blank" rel="noreferrer" />} className="bg-slate-950 text-white">投递入口<ExternalLink className="size-4" /></Button></div></CardContent></Card>)}</div>
  </section>;
}

function FilterSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) { return <NativeSelect aria-label={label} className="w-full" value={value} onChange={(e) => setValue(e.target.value)}>{options.map((option) => <NativeSelectOption key={option}>{option}</NativeSelectOption>)}</NativeSelect>; }
function PanelHeading({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description: string }) { return <div className="mb-6"><p className="mb-2 text-sm font-semibold text-cyan-800">{eyebrow}</p><h2 id={id} className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p></div>; }
function Metric({ value, label, warning = false }: { value: string; label: string; warning?: boolean }) { return <div className="min-w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"><strong className={warning ? 'text-lg text-amber-600' : 'text-lg text-slate-950'}>{value}</strong><span className="ml-1.5 text-xs text-slate-500">{label}</span></div>; }
function ProgressLine({ label, value, percent }: { label: string; value: string; percent: string }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">{label}</span><span className="font-medium text-white">{value}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{ width: percent }} /></div></div>; }
function EmptyState() { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CalendarDays className="mx-auto mb-3 size-7 text-slate-400" /><p className="font-medium text-slate-800">没有符合条件的企业</p><p className="mt-1 text-sm text-slate-500">换一个筛选条件后再试。</p></div>; }
function treeMatches(node: OwnershipNode, query: string): boolean { return !query.trim() || node.name.toLowerCase().includes(query.trim().toLowerCase()) || Boolean(node.children?.some((child) => treeMatches(child, query))); }
