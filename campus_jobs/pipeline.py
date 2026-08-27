from __future__ import annotations

import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass, field
from datetime import date
from pathlib import Path

from .config import Settings
from .crawler import PageCrawler
from .models import now_iso
from .official import clean_text, discover_company, is_formal_2027
from .registry import load_registry
from .render import render_outputs
from .search import SearchError, build_queries, create_search_client, search_all
from .storage import JobStore

LOGGER = logging.getLogger(__name__)


@dataclass
class DiscoverySummary:
    companies: int = 0
    source_attempts: int = 0
    source_successes: int = 0
    accepted: int = 0
    added: int = 0
    updated: int = 0
    lead_count: int = 0
    failed_sources: list[str] = field(default_factory=list)


class Pipeline:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.store = JobStore(settings.output.get("data_file", "data/jobs.json"))
        self.crawler = PageCrawler(settings)

    def _path(self, configured: str, default: str) -> Path:
        path = Path(configured or default)
        return path if path.is_absolute() else self.settings.path.parent / path

    @staticmethod
    def _write_json(path: Path, payload: dict) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            try:
                current = json.loads(path.read_text(encoding="utf-8"))
                current_without_time = {key: value for key, value in current.items() if key != "updated_at"}
                payload_without_time = {key: value for key, value in payload.items() if key != "updated_at"}
                if current_without_time == payload_without_time:
                    return
            except (json.JSONDecodeError, OSError):
                pass
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def _collect_leads(self) -> list[dict[str, str]]:
        if not self.settings.search.get("enabled", True):
            return []
        try:
            results = search_all(
                create_search_client(self.settings), build_queries(self.settings),
                delay=float(self.settings.search.get("query_delay_seconds", 2)),
            )
        except SearchError as exc:
            LOGGER.warning("搜索补漏失败，不影响官方来源结果：%s", exc)
            return []
        leads_path = self._path(self.settings.output.get("leads_file", "data/leads.json"), "data/leads.json")
        old_discovered: dict[str, str] = {}
        if leads_path.exists():
            try:
                old_discovered = {
                    item["url"]: item.get("discovered_at", "")
                    for item in json.loads(leads_path.read_text(encoding="utf-8")).get("leads", [])
                }
            except (json.JSONDecodeError, OSError, KeyError):
                pass
        leads: dict[str, dict[str, str]] = {}
        for result in results:
            combined = clean_text(f"{result.title} {result.snippet}")
            if not is_formal_2027(combined):
                continue
            leads[result.url] = {
                "title": clean_text(result.title), "url": result.url,
                "published_at": result.published_at, "source_query": result.source_query,
                "discovered_at": old_discovered.get(result.url) or now_iso(),
                "status": "待核验（不公开）",
            }
        return list(leads.values())

    def discover(self) -> DiscoverySummary:
        registry_path = self._path(self.settings.raw.get("sources_file", "sources.yaml"), "sources.yaml")
        expected = int(self.settings.raw.get("expected_company_count", 100))
        companies = load_registry(registry_path, expected_count=expected)
        summary = DiscoverySummary(companies=len(companies))
        # Scope changes must also evict historical subsidiary records. Parent
        # SOE announcements remain nationwide; only subsidiary records are
        # constrained to Nanning.
        retained = [
            job for job in self.store.jobs
            if not (
                job.ownership_type == "央国企"
                and job.parent_company
                and job.parent_company != job.company
                and "南宁" not in (job.locations or job.city)
            )
        ]
        if len(retained) != len(self.store.jobs):
            self.store.jobs = retained
            self.store.dirty = True
        discovered = []
        workers = max(1, int(self.settings.crawler.get("source_workers", 8)))
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {
                executor.submit(discover_company, company, PageCrawler(self.settings)): company
                for company in companies
            }
            for future in as_completed(futures):
                company = futures[future]
                summary.source_attempts += len(company.sources)
                try:
                    jobs, failures, successes = future.result()
                except Exception as exc:  # isolate one broken source adapter
                    jobs, failures, successes = [], [f"{company.name} ({exc})"], 0
                summary.source_successes += successes
                summary.failed_sources.extend(failures)
                discovered.extend(jobs)
        summary.failed_sources.sort()
        ratio = summary.source_successes / max(1, summary.source_attempts)
        minimum = float(self.settings.crawler.get("min_source_success_ratio", 0.20))
        if ratio < minimum:
            raise SearchError(
                f"官方来源健康度不足：{summary.source_successes}/{summary.source_attempts} "
                f"低于阈值 {minimum:.0%}；保留上一版数据"
            )
        for job in discovered:
            _, added = self.store.upsert(job)
            summary.accepted += 1
            summary.added += int(added)
            summary.updated += int(not added)
        self.store.save()
        leads = self._collect_leads()
        summary.lead_count = len(leads)
        self._write_json(
            self._path(self.settings.output.get("leads_file", "data/leads.json"), "data/leads.json"),
            {"schema_version": 1, "updated_at": now_iso(), "leads": leads},
        )
        self._write_json(
            self._path(self.settings.output.get("health_file", "data/health.json"), "data/health.json"),
            {"updated_at": now_iso(), **asdict(summary), "success_ratio": round(ratio, 4)},
        )
        LOGGER.info(
            "官方采集完成：企业 %d，来源成功 %d/%d，公告 %d，新增 %d，待核验线索 %d",
            summary.companies, summary.source_successes, summary.source_attempts,
            summary.accepted, summary.added, summary.lead_count,
        )
        return summary

    def recheck(self) -> int:
        limit = int(self.settings.crawler.get("recheck_limit", 80))
        candidates = sorted(self.store.jobs, key=lambda job: job.last_checked_at or "")[:limit]
        for job in candidates:
            old_status, old_url = job.active_status, job.official_url
            status, final_url = self.crawler.check(job.official_url)
            if job.deadline and job.deadline < date.today().isoformat():
                status = "expired"
            if status != "unknown" or job.active_status != "expired":
                job.active_status = status
            job.official_url = final_url
            job.source_url = final_url
            if job.active_status != old_status or job.official_url != old_url:
                job.last_checked_at = now_iso()
                job.updated_at = now_iso()
                self.store.dirty = True
        if candidates:
            self.store.save()
        return len(candidates)

    def generate(self) -> tuple[Path, Path]:
        return render_outputs(self.store.jobs, self.settings)

    def full(self) -> DiscoverySummary:
        summary = self.discover()
        self.recheck()
        self.generate()
        return summary
