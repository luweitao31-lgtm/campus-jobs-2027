from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path

from .config import Settings
from .crawler import PageCrawler
from .extractor import extract_job
from .mailer import MailConfigurationError, send_digest
from .models import now_iso
from .render import render_outputs
from .search import BraveSearchClient, build_queries, search_all
from .storage import JobStore
from .verifier import verify_job

LOGGER = logging.getLogger(__name__)


@dataclass
class DiscoverySummary:
    searched: int = 0
    accepted: int = 0
    added: int = 0
    updated: int = 0


class Pipeline:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.store = JobStore(settings.output.get("data_file", "data/jobs.json"))
        self.crawler = PageCrawler(settings)

    def discover(self) -> DiscoverySummary:
        queries = build_queries(self.settings)
        client = BraveSearchClient(self.settings)
        results = search_all(
            client, queries, delay=float(self.settings.search.get("query_delay_seconds", 1.1))
        )
        limit = int(self.settings.crawler.get("max_results_per_run", 120))
        delay = float(self.settings.crawler.get("page_delay_seconds", 0.4))
        summary = DiscoverySummary(searched=len(results))
        for result in results[:limit]:
            page = self.crawler.fetch(result.url)
            job = extract_job(result, page, self.settings)
            if not job:
                continue
            verify_job(job, page, self.settings)
            _, added = self.store.upsert(job)
            summary.accepted += 1
            summary.added += int(added)
            summary.updated += int(not added)
            if delay:
                time.sleep(delay)
        self.store.save()
        LOGGER.info(
            "采集完成：搜索结果 %d，符合口径 %d，新增 %d，更新 %d",
            summary.searched, summary.accepted, summary.added, summary.updated,
        )
        return summary

    def recheck(self) -> int:
        limit = int(self.settings.crawler.get("recheck_limit", 80))
        candidates = sorted(self.store.jobs, key=lambda job: job.last_checked_at or "")[:limit]
        for job in candidates:
            target = job.official_url or job.source_url
            status, final_url = self.crawler.check(target)
            if status != "unknown" or job.active_status != "expired":
                job.active_status = status
            if job.official_url:
                job.official_url = final_url
            else:
                job.source_url = final_url
            job.last_checked_at = now_iso()
        if candidates:
            self.store.save()
        LOGGER.info("链接复检完成：%d 条", len(candidates))
        return len(candidates)

    def generate(self) -> tuple[Path, Path]:
        paths = render_outputs(self.store.jobs, self.settings)
        LOGGER.info("输出已生成：%s, %s", *paths)
        return paths

    def mail(self) -> bool:
        if not self.settings.mail.get("enabled", True):
            LOGGER.info("邮件功能已禁用")
            return False
        jobs = self.store.unnotified()
        try:
            send_digest(jobs, self.settings)
        except (MailConfigurationError, OSError) as exc:
            LOGGER.warning("%s", exc)
            return False
        notified_at = now_iso()
        for job in jobs:
            job.last_notified_at = notified_at
        self.store.save()
        LOGGER.info("邮件发送完成：%d 条待通知记录", len(jobs))
        return True

    def full(self) -> DiscoverySummary:
        summary = self.discover()
        self.recheck()
        self.generate()
        self.mail()
        return summary

