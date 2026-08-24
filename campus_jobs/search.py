from __future__ import annotations

import logging
import time
import xml.etree.ElementTree as ET
from collections.abc import Iterable

import requests

from .config import Settings
from .models import SearchResult

LOGGER = logging.getLogger(__name__)


class SearchError(RuntimeError):
    pass


def build_queries(settings: Settings) -> list[str]:
    config = settings.search
    bases: list[str] = []
    for cohort in config.get("cohort_terms", ["2027届"]):
        for recruitment in config.get("recruitment_terms", ["校园招聘"]):
            terms = [cohort, recruitment, *config.get("extra_keywords", [])]
            bases.append(" ".join(term.strip() for term in terms if term and term.strip()))
    sources = [item.strip() for item in config.get("source_queries", [""]) if item.strip()]
    # First cover every recruitment/cohort combination with a generic query. Then
    # rotate targeted sources across combinations so a small budget still samples
    # universities, public platforms and aggregators instead of exhausting one site.
    queries = list(bases)
    if sources:
        for round_index in range(len(sources)):
            for base_index, base in enumerate(bases):
                source = sources[(base_index + round_index) % len(sources)]
                queries.append(f"{base} {source}")
    budget = max(1, int(config.get("daily_query_budget", 20)))
    return queries[:budget]


class BraveSearchClient:
    def __init__(self, settings: Settings, session: requests.Session | None = None):
        self.settings = settings
        self.session = session or requests.Session()
        self.api_key = settings.env("BRAVE_API_KEY")
        if not self.api_key:
            raise SearchError("缺少 BRAVE_API_KEY，无法执行网页搜索")

    def search(self, query: str) -> list[SearchResult]:
        config = self.settings.search
        response = self.session.get(
            config.get("endpoint", "https://api.search.brave.com/res/v1/web/search"),
            headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": self.api_key,
            },
            params={
                "q": query,
                "count": min(20, int(config.get("results_per_query", 10))),
                "country": config.get("country", "CN"),
                "search_lang": config.get("language", "zh-hans"),
                "safesearch": "moderate",
                "text_decorations": "false",
            },
            timeout=20,
        )
        response.raise_for_status()
        items = response.json().get("web", {}).get("results", [])
        return [
            SearchResult(
                title=item.get("title", ""),
                url=item.get("url", ""),
                snippet=item.get("description", ""),
                published_at=item.get("page_age", "") or item.get("age", ""),
                source_query=query,
            )
            for item in items
            if item.get("url")
        ]


class BingRssSearchClient:
    """Keyless public Bing RSS search.

    Bing exposes RSS-formatted public search result pages through `format=rss`.
    This client does not bypass access controls and deliberately uses a low query
    rate configured in config.yaml.
    """

    def __init__(self, settings: Settings, session: requests.Session | None = None):
        self.settings = settings
        self.session = session or requests.Session()

    def search(self, query: str) -> list[SearchResult]:
        config = self.settings.search
        response = self.session.get(
            config.get("endpoint", "https://www.bing.com/search"),
            headers={"User-Agent": self.settings.crawler.get("user_agent", "CampusJobs2027/0.1")},
            params={
                "q": query,
                "format": "rss",
                "setlang": "zh-CN",
                "cc": config.get("country", "CN"),
            },
            timeout=20,
        )
        response.raise_for_status()
        root = ET.fromstring(response.content)
        items: list[SearchResult] = []
        for item in root.findall(".//item"):
            url = (item.findtext("link") or "").strip()
            if not url:
                continue
            items.append(
                SearchResult(
                    title=(item.findtext("title") or "").strip(),
                    url=url,
                    snippet=(item.findtext("description") or "").strip(),
                    published_at=(item.findtext("pubDate") or "").strip(),
                    source_query=query,
                )
            )
        return items


class GoogleNewsRssSearchClient:
    """Keyless Google News RSS search for fresh public announcements."""

    def __init__(self, settings: Settings, session: requests.Session | None = None):
        self.settings = settings
        self.session = session or requests.Session()

    def search(self, query: str) -> list[SearchResult]:
        config = self.settings.search
        response = self.session.get(
            config.get("endpoint", "https://news.google.com/rss/search"),
            headers={"User-Agent": self.settings.crawler.get("user_agent", "CampusJobs2027/0.1")},
            params={"q": query, "hl": "zh-CN", "gl": "CN", "ceid": "CN:zh-Hans"},
            timeout=20,
        )
        response.raise_for_status()
        root = ET.fromstring(response.content)
        limit = min(100, int(config.get("results_per_query", 10)))
        items: list[SearchResult] = []
        for item in root.findall(".//item")[:limit]:
            url = (item.findtext("link") or "").strip()
            if not url:
                continue
            source = item.find("source")
            source_name = (source.text or "").strip() if source is not None else ""
            description = (item.findtext("description") or "").strip()
            items.append(
                SearchResult(
                    title=(item.findtext("title") or "").strip(),
                    url=url,
                    snippet=f"{source_name} {description}".strip(),
                    published_at=(item.findtext("pubDate") or "").strip(),
                    source_query=query,
                )
            )
        return items


def create_search_client(settings: Settings):
    provider = settings.search.get("provider", "google_news_rss")
    if provider == "google_news_rss":
        return GoogleNewsRssSearchClient(settings)
    if provider == "bing_rss":
        return BingRssSearchClient(settings)
    if provider == "brave":
        return BraveSearchClient(settings)
    raise SearchError(f"不支持的搜索提供商：{provider}")


def search_all(client, queries: Iterable[str], delay: float = 2.0) -> list[SearchResult]:
    combined: list[SearchResult] = []
    successful = 0
    for index, query in enumerate(queries):
        try:
            results = client.search(query)
            combined.extend(results)
            successful += 1
            LOGGER.info("搜索完成：%s（%d 条）", query, len(results))
        except (requests.RequestException, ValueError) as exc:
            LOGGER.warning("搜索失败，继续下一个查询：%s (%s)", query, exc)
        if delay > 0 and index >= 0:
            time.sleep(delay)
    if successful == 0:
        raise SearchError("所有搜索请求均失败，未修改现有数据")
    seen: set[str] = set()
    unique: list[SearchResult] = []
    for item in combined:
        if item.url in seen:
            continue
        seen.add(item.url)
        unique.append(item)
    return unique
